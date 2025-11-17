import React, { useState, useEffect, useRef } from 'react'
import { Button } from '../ui/button'
import { Plus, MessageSquare, FileText, BarChart, Target, Folder, Clock, Calendar, MoreVertical, Trash2 } from 'lucide-react'
import { userSessionService, type ChatThread } from '../../utils/userSessionUtils'

interface ChatSidebarProps {
  onThreadChange?: () => void
}

// Icon mapping for thread icons
const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  MessageSquare,
  FileText,
  BarChart,
  Target,
  Folder,
  Clock,
  Calendar
}

interface GroupedThreads {
  today: ChatThread[]
  yesterday: ChatThread[]
  thisWeek: ChatThread[]
  older: ChatThread[]
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onThreadChange }) => {
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openMenuThreadId, setOpenMenuThreadId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Load threads on component mount
  useEffect(() => {
    loadThreadsAndCurrentThread()
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuThreadId(null)
      }
    }

    if (openMenuThreadId) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openMenuThreadId])

  const loadThreadsAndCurrentThread = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Load all threads
      const threadsResponse = await userSessionService.getAllThreads()
      if (threadsResponse.success && threadsResponse.data) {
        setThreads(threadsResponse.data)
      } else {
        setError(threadsResponse.error || 'Failed to load threads')
      }

      // Get current thread
      const currentThreadResponse = await userSessionService.getCurrentThreadMessages()
      if (currentThreadResponse.success && currentThreadResponse.data) {
        const currentThread = currentThreadResponse.data.messages?.[0]?.thread_id
        if (currentThread) {
          setCurrentThreadId(currentThread)
        }
      }
    } catch (err) {
      setError('Failed to load chat threads')
      console.error('Error loading threads:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadThreads = async () => {
    setError(null)
    
    try {
      const response = await userSessionService.getAllThreads()
      if (response.success && response.data) {
        setThreads(response.data)
      } else {
        setError(response.error || 'Failed to load threads')
      }
    } catch (err) {
      setError('Failed to load chat threads')
      console.error('Error loading threads:', err)
    }
  }

  const handleNewChat = async () => {
    try {
      const response = await userSessionService.createThread('New Chat', 'MessageSquare')
      if (response.success) {
        // Get the newly created thread ID from response
        const newThreadId = response.data?.thread_id
        if (newThreadId) {
          setCurrentThreadId(newThreadId)
        }
        // Reload threads to show the new one
        await loadThreads()
        // Notify parent component of the change
        onThreadChange?.()
      } else {
        setError(response.error || 'Failed to create new thread')
      }
    } catch (err) {
      setError('Failed to create new chat')
      console.error('Error creating new chat:', err)
    }
  }

  const handleThreadSelect = async (threadId: string) => {
    try {
      const response = await userSessionService.setCurrentThread(threadId)
      if (response.success) {
        // Update current thread ID
        setCurrentThreadId(threadId)
        // Notify parent component that thread has changed
        onThreadChange?.()
      } else {
        setError(response.error || 'Failed to select thread')
      }
    } catch (err) {
      setError('Failed to select thread')
      console.error('Error selecting thread:', err)
    }
  }

  const handleDeleteThread = async (threadId: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent thread selection when clicking delete
    
    // Close the menu
    setOpenMenuThreadId(null)
    
    try {
      const response = await userSessionService.deleteThread(threadId)
      if (response.success) {
        // If deleted thread was the current thread, clear current thread
        if (currentThreadId === threadId) {
          setCurrentThreadId(null)
          // Notify parent to clear messages
          onThreadChange?.()
        }
        // Reload threads to refresh the list
        await loadThreads()
      } else {
        setError(response.error || 'Failed to delete thread')
      }
    } catch (err) {
      setError('Failed to delete thread')
      console.error('Error deleting thread:', err)
    }
  }

  const toggleThreadMenu = (threadId: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent thread selection when opening menu
    setOpenMenuThreadId(openMenuThreadId === threadId ? null : threadId)
  }

  // Group threads by time periods
  const groupThreadsByTime = (threads: ChatThread[]): GroupedThreads => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    return threads.reduce(
      (groups, thread) => {
        const threadDate = new Date(thread.last_activity_date)
        
        if (threadDate >= today) {
          groups.today.push(thread)
        } else if (threadDate >= yesterday) {
          groups.yesterday.push(thread)
        } else if (threadDate >= weekAgo) {
          groups.thisWeek.push(thread)
        } else {
          groups.older.push(thread)
        }
        
        return groups
      },
      { today: [], yesterday: [], thisWeek: [], older: [] } as GroupedThreads
    )
  }

  const groupedThreads = groupThreadsByTime(threads)

  // Render thread group
  const renderThreadGroup = (threads: ChatThread[], title: string) => {
    if (threads.length === 0) return null
    
    return (
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">{title}</h3>
        <div className="space-y-1">
          {threads.map((thread) => {
            const IconComponent = iconMap[thread.icon] || MessageSquare
            const isActive = currentThreadId === thread.thread_id
            const isMenuOpen = openMenuThreadId === thread.thread_id
            return (
              <div key={thread.thread_id} className="relative">
                <button
                  className={`w-full text-left p-3 rounded-lg transition-colors group ${
                    isActive 
                      ? 'bg-gray-800 border border-blue-500' 
                      : 'hover:bg-gray-800 border border-transparent'
                  }`}
                  onClick={() => handleThreadSelect(thread.thread_id)}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-4 h-4 flex-shrink-0 ${
                      isActive 
                        ? 'text-blue-400' 
                        : 'text-gray-400 group-hover:text-white'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm truncate ${
                        isActive 
                          ? 'text-white font-medium' 
                          : 'text-gray-300 group-hover:text-white'
                      }`}>{thread.title}</div>
                      <div className={`text-xs ${
                        isActive 
                          ? 'text-blue-300' 
                          : 'text-gray-500 group-hover:text-gray-400'
                      }`}>
                        {thread.message_count} messages
                      </div>
                    </div>
                    <button
                      onClick={(e) => toggleThreadMenu(thread.thread_id, e)}
                      className={`p-1 rounded hover:bg-gray-700 transition-colors ${
                        isMenuOpen ? 'bg-gray-700' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      title="More options"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </button>
                
                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div 
                    ref={menuRef}
                    className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 overflow-hidden"
                  >
                    <button
                      onClick={(e) => handleDeleteThread(thread.thread_id, e)}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left text-red-400 hover:bg-gray-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete thread
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-gray-900 text-white flex flex-col h-full flex-shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <img 
            src="https://v0-mockup-ai-agent-console-project.vercel.app/images/freddy-logo.png" 
            alt="Freddy.ai" 
            className="w-8 h-8"
          />
          <h1 className="text-xl font-bold">FreddyGPT</h1>
        </div>
        
        <Button 
          className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleNewChat}
        >
          <Plus className="w-4 h-4" />
          New chat
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="text-center text-gray-400 py-8">
            <div className="animate-pulse">Loading chat history...</div>
          </div>
        )}

        {error && (
          <div className="text-center text-red-400 py-8">
            <div className="text-sm">{error}</div>
            <Button 
              onClick={loadThreads} 
              className="mt-2 text-xs bg-red-600 hover:bg-red-700"
            >
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && threads.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">No chat history yet</div>
            <div className="text-xs text-gray-500 mt-1">Start a new conversation</div>
          </div>
        )}

        {!loading && !error && threads.length > 0 && (
          <>
            {renderThreadGroup(groupedThreads.today, 'Today')}
            {renderThreadGroup(groupedThreads.yesterday, 'Yesterday')}
            {renderThreadGroup(groupedThreads.thisWeek, 'This Week')}
            {renderThreadGroup(groupedThreads.older, 'Older')}
          </>
        )}
      </div>
    </div>
  )
}

export default ChatSidebar