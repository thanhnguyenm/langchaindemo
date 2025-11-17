import React, { createContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import userSessionService, { type UserSession, type SessionAgent } from '../utils/userSessionUtils'

export interface UserSessionContextType {
  session: UserSession | null
  loading: boolean
  error: string | null
  refreshSession: () => Promise<void>
  launchAgent: (agentId: number) => Promise<boolean>
  recordUsage: (agentId: number, tokensUsed: number, messageCount?: number) => Promise<boolean>
  getAvailableAgents: () => SessionAgent[]
  getUsageStatistics: () => { tokens: string; messages: string; threads: string } | null
}

export const UserSessionContext = createContext<UserSessionContextType | undefined>(undefined)

interface UserSessionProviderProps {
  children: ReactNode
}

export const UserSessionProvider: React.FC<UserSessionProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const [session, setSession] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshSession = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await userSessionService.getUserSession()
      if (result.success && result.data) {
        setSession(result.data)
      } else {
        setError(result.error || 'Failed to load session')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load session'
      setError(errorMessage)
      console.error('Error fetching session:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const recordUsage = useCallback(async (agentId: number, tokensUsed: number, messageCount = 1): Promise<boolean> => {
    try {
      const result = await userSessionService.recordUsage(agentId, tokensUsed, messageCount)
      
      if (result.success && session) {
        // Update local session state with new token count
        setSession(prevSession => prevSession ? {
          ...prevSession,
          usage_statistics: {
            ...prevSession.usage_statistics,
            current_month_tokens: prevSession.usage_statistics.current_month_tokens + tokensUsed
          }
        } : null)
      }
      
      return result.success
    } catch (err) {
      console.error('Error recording usage:', err)
      return false
    }
  }, [session])

  const getAvailableAgents = useCallback(() => {
    if (!session) return []
    return userSessionService.getAvailableAgents(session)
  }, [session])

  const getUsageStatistics = useCallback(() => {
    if (!session) return null
    return userSessionService.formatUsageStatistics(session.usage_statistics)
  }, [session])

  const launchAgent = useCallback(async (agentId: number): Promise<boolean> => {
    try {
      const result = await userSessionService.launchAgent(agentId)
      
      if (result.success) {
        // Refresh session to get updated agents list
        await refreshSession()
      }
      
      return result.success
    } catch (err) {
      console.error('Error launching agent:', err)
      return false
    }
  }, [refreshSession])

  // Load session when user changes
  useEffect(() => {
    if (user?.email) {
      refreshSession()
    } else {
      setSession(null)
    }
  }, [user?.email, refreshSession])

  const value: UserSessionContextType = {
    session,
    loading,
    error,
    refreshSession,
    launchAgent,
    recordUsage,
    getAvailableAgents,
    getUsageStatistics
  }

  return (
    <UserSessionContext.Provider value={value}>
      {children}
    </UserSessionContext.Provider>
  )
}