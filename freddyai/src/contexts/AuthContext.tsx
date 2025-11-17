import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  email: string
  created_date: string
  last_login_date?: string
}

interface AuthContextType {
  isLoggedIn: boolean
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check for existing session on app load and set up refresh interval
  useEffect(() => {
    checkAuthStatus()
    
    // Set up periodic session refresh (every 15 minutes)
    const refreshInterval = setInterval(() => {
      if (isLoggedIn) {
        refreshSession()
      }
    }, 15 * 60 * 1000) // 15 minutes

    return () => clearInterval(refreshInterval)
  }, [isLoggedIn])

  const checkAuthStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8000/api/auth/status', {
        method: 'GET',
        credentials: 'include', // Include cookies in the request
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.authenticated && data.user) {
          setIsLoggedIn(true)
          setUser(data.user)
        } else {
          setIsLoggedIn(false)
          setUser(null)
        }
      } else {
        setIsLoggedIn(false)
        setUser(null)
      }
    } catch (err) {
      console.error('Error checking auth status:', err)
      setIsLoggedIn(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshSession = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/refresh', {
        method: 'POST',
        credentials: 'include', // Include cookies in the request
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Session refreshed successfully, cookie is automatically updated by backend
        console.log('Session refreshed successfully')
      } else {
        // If refresh fails, user might need to log in again
        console.warn('Session refresh failed, user may need to log in again')
      }
    } catch (err) {
      console.error('Error refreshing session:', err)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        credentials: 'include', // Include cookies in the request
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setIsLoggedIn(true)
        setUser(data.user)
        return true
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Login failed')
        return false
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Network error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      setLoading(true)
      
      // Call backend logout to clear the cookie
      await fetch('http://localhost:8000/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies in the request
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Always clear local state regardless of backend response
      setIsLoggedIn(false)
      setUser(null)
      setError(null)
      setLoading(false)
    }
  }

  const value = {
    isLoggedIn,
    user,
    login,
    logout,
    refreshSession,
    loading,
    error
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}