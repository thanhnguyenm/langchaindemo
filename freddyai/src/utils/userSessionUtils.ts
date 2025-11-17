// User Session Utility
// Centralized utility for managing user sessions and agent interactions

export interface Agent {
  agent_id: number
  agent_code: string
  agent_name: string
  agent_icon: string
  agent_description: string
  agent_system_prompt?: string
  agent_max_tokens?: number
  agent_temperature?: number
}

export interface SessionAgent extends Agent {
  session_agent_id: number
  session_id: string
  is_current_agent: boolean
  launched_date: string | null
  created_date: string | null
  modified_date: string | null
}

export interface UsageStatistics {
  current_month_tokens: number
  current_month_messages: number
  current_month_threads: number
}

export interface ChatThread {
  thread_id: string
  title: string
  icon: string
  created_date: string
  last_activity_date: string
  message_count: number
}

export interface ThreadMessage {
  message_id: string
  thread_id: string
  agent_id?: number
  agent_name?: string
  role: 'user' | 'assistant' | 'system'
  content: string
  input_tokens?: number
  output_tokens?: number
  total_tokens?: number
  message_order?: number
  is_edited?: boolean
  edited_date?: string | null
  created_date?: string | null
  modified_date?: string | null
  metadata?: Record<string, unknown>
}

export interface UserSession {
  session_id: string
  user_email: string
  is_active: boolean
  created_date: string | null
  modified_date: string | null
  session_agents: SessionAgent[]
  usage_statistics: UsageStatistics
  session_created: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

class UserSessionService {
  private baseUrl = '/api/user'

  /**
   * Get user session with all associated data
   */
  async getUserSession(): Promise<ApiResponse<UserSession>> {
    try {
      const response = await fetch(`${this.baseUrl}/session`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch session: ${response.statusText}`)
      }

      const sessionData: UserSession = await response.json()
      return { success: true, data: sessionData }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load session'
      console.error('Error fetching session:', error)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Record usage statistics for the current session
   */
  async recordUsage(
    agentId: number, 
    tokensUsed: number, 
    messageCount: number = 1
  ): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/usage/record`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: agentId,
          tokens_used: tokensUsed,
          message_count: messageCount
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to record usage: ${response.statusText}`)
      }

      await response.json() // Consume response
      return { success: true, data: undefined }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to record usage'
      console.error('Error recording usage:', error)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Get current month usage statistics
   */
  async getCurrentMonthUsage(): Promise<ApiResponse<UsageStatistics>> {
    try {
      const response = await fetch(`${this.baseUrl}/usage/current-month`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch usage: ${response.statusText}`)
      }

      const usageData = await response.json()
      return { 
        success: true, 
        data: {
          current_month_tokens: usageData.total_tokens || 0,
          current_month_messages: usageData.total_messages || 0,
          current_month_threads: 0 // Not available in current API
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load usage'
      console.error('Error fetching usage:', error)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Launch/register a new agent in the current session
   */
  async launchAgent(agentId: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/agents/launch`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: agentId
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return { success: true, data: undefined }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to launch agent'
      console.error('Error launching agent:', error)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Get all chat threads for the current user
   */
  async getAllThreads(): Promise<ApiResponse<ChatThread[]>> {
    try {
      const response = await fetch('/api/threads/list', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Map backend response to frontend ChatThread interface
      const threads: ChatThread[] = (data || []).map((thread: Record<string, unknown>) => ({
        thread_id: thread.thread_id as string,
        title: (thread.thread_title || thread.title || 'Untitled Thread') as string,
        icon: (thread.thread_icon || thread.icon || 'MessageSquare') as string,
        created_date: thread.created_date as string,
        last_activity_date: thread.last_activity_date as string,
        message_count: (thread.total_messages ?? thread.message_count ?? 0) as number
      }))
      
      return { success: true, data: threads }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load threads'
      console.error('Error loading threads:', error)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Create a new chat thread
   */
  async createThread(title: string, icon: string = 'MessageSquare'): Promise<ApiResponse<{ thread_id: string }>> {
    try {
      const response = await fetch('/api/threads/create', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          icon
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return { success: true, data: { thread_id: data.thread_id } }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create thread'
      console.error('Error creating thread:', error)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Delete (deactivate) a chat thread
   */
  async deleteThread(threadId: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`/api/threads/delete/${threadId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete thread'
      console.error('Error deleting thread:', error)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Get all messages for a specific thread
   */
  async getThreadMessages(threadId: string): Promise<ApiResponse<ThreadMessage[]>> {
    try {
      const response = await fetch(`/api/threads/byid/${threadId}/messages`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return { success: true, data: data.messages || [] }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load thread messages'
      console.error('Error loading thread messages:', error)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Get current thread messages (checks cookie, falls back to most recent thread)
   */
  async getCurrentThreadMessages(): Promise<ApiResponse<{
    has_current_thread: boolean
    thread_id: string | null
    thread_title?: string
    thread_icon?: string
    messages: ThreadMessage[]
    total_messages: number
    message?: string
  }>> {
    try {
      const response = await fetch('/api/threads/current/messages', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load current thread messages'
      console.error('Error loading current thread messages:', error)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Set the current thread by ID (updates cookie)
   */
  async setCurrentThread(threadId: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`/api/threads/set-current/${threadId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return { success: true, data: undefined }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set current thread'
      console.error('Error setting current thread:', error)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Get all agents in the session (all are active)
   */
  getAvailableAgents(session: UserSession): SessionAgent[] {
    return session.session_agents || []
  }

  /**
   * Check if an agent is available in the current session
   */
  isAgentAvailable(session: UserSession, agentId: number): boolean {
    return session.session_agents.some(agent => agent.agent_id === agentId)
  }

  /**
   * Get agent by ID from session agents
   */
  getAgentById(session: UserSession, agentId: number): SessionAgent | null {
    return session.session_agents.find(agent => agent.agent_id === agentId) || null
  }

  /**
   * Format usage statistics for display
   */
  formatUsageStatistics(usage: UsageStatistics): {
    tokens: string
    messages: string
    threads: string
  } {
    return {
      tokens: usage.current_month_tokens.toLocaleString(),
      messages: usage.current_month_messages.toLocaleString(),
      threads: usage.current_month_threads.toLocaleString()
    }
  }

  /**
   * Check if user has reached any usage limits (placeholder for future implementation)
   */
  checkUsageLimits(usage: UsageStatistics): {
    tokenLimitReached: boolean
    messageLimitReached: boolean
    threadLimitReached: boolean
  } {
    // Placeholder - implement based on your business rules
    const TOKEN_LIMIT = 100000 // Example limit
    const MESSAGE_LIMIT = 1000 // Example limit
    const THREAD_LIMIT = 100 // Example limit

    return {
      tokenLimitReached: usage.current_month_tokens >= TOKEN_LIMIT,
      messageLimitReached: usage.current_month_messages >= MESSAGE_LIMIT,
      threadLimitReached: usage.current_month_threads >= THREAD_LIMIT
    }
  }
}

// Export singleton instance
export const userSessionService = new UserSessionService()

// Export types and service
export { UserSessionService }
export default userSessionService