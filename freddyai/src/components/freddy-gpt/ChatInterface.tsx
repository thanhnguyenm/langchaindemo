import React, { useState, useRef, useEffect } from 'react'
import { Button } from '../ui/button'
import { Send, Upload, Search, ChevronDown, Brain, Zap, Bot, X, FileText, Image, Video, User } from 'lucide-react'
import { useUserSession } from '../../hooks/useUserSession'
import { userSessionService, type ThreadMessage } from '../../utils/userSessionUtils'
import AgentLibrary from './AgentLibrary'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const ChatInterface: React.FC = () => {
  const { loading: sessionLoading, refreshSession, session } = useUserSession()
  const [message, setMessage] = useState('')
  const [selectedContext, setSelectedContext] = useState('Internet & Heineken')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  // Current thread state
  const [currentThreadMessages, setCurrentThreadMessages] = useState<ThreadMessage[]>([])
  const [hasCurrentThread, setHasCurrentThread] = useState<boolean>(false)
  const [threadLoading, setThreadLoading] = useState(true)
  const [threadError, setThreadError] = useState<string | null>(null)
  
  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState<{agent_code: string, content: string, tokens: number, created_date: string} | null>(null)
  const [showResearchDropdown, setShowResearchDropdown] = useState(false)
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [showAgentLibrary, setShowAgentLibrary] = useState(false)
  const [showCreateAgent, setShowCreateAgent] = useState(false)
  const [showPowerPrompts, setShowPowerPrompts] = useState(false)
  const [selectedModel, setSelectedModel] = useState('GPT-4')
  const [activePromptTab, setActivePromptTab] = useState('library')
  const [promptSearchQuery, setPromptSearchQuery] = useState('')
  const [selectedPromptFilter, setSelectedPromptFilter] = useState('All Prompts (6)')
  const [newAgent, setNewAgent] = useState({
    name: '',
    icon: '🤖',
    description: '',
    category: 'Custom',
    instructions: '',
    capabilities: [] as string[],
    currentCapability: ''
  })
  const [newPrompt, setNewPrompt] = useState({
    title: '',
    category: 'Custom',
    description: '',
    template: ''
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const modelDropdownRef = useRef<HTMLDivElement>(null)

  const suggestedPrompts = [
    "How has non-alcoholic beer demand changed in the US?",
    "What marketing strategies make Stella Artois successful?",
    "Create a campaign brief for Heineken's sustainability initiatives",
    "Analyze consumer insights for premium beer positioning",
    "Generate social media content ideas for Heineken 0.0 for the Formula 1 Race",
    "Develop messaging for our responsible drinking campaigns"
  ]

  const contextOptions = [
    "Internet & Heineken",
    "Heineken Only", 
    "Custom"
  ]

  const researchOptions = [
    { id: 'research', label: 'Research', icon: Search },
    { id: 'image', label: 'Image generation', icon: Image },
    { id: 'video', label: 'Video generation', icon: Video }
  ]

  const modelOptions = [
    { id: 'gpt4', label: 'GPT-4', description: 'Most capable model' },
    { id: 'gpt4-turbo', label: 'GPT-4 Turbo', description: 'Faster and cheaper' },
    { id: 'gpt35-turbo', label: 'GPT-3.5 Turbo', description: 'Good for most tasks' },
    { id: 'claude-3', label: 'Claude 3', description: 'Anthropic model' },
    { id: 'gemini-pro', label: 'Gemini Pro', description: 'Google model' }
  ]

  // Load session when component mounts for FreddyGPT page
  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  // Load current thread messages when component mounts
  useEffect(() => {
    loadCurrentThreadMessages()
  }, [])

  const loadCurrentThreadMessages = async () => {
    setThreadLoading(true)
    setThreadError(null)
    
    try {
      const response = await userSessionService.getCurrentThreadMessages()
      if (response.success && response.data) {
        const { has_current_thread, messages } = response.data
        setHasCurrentThread(has_current_thread)
        setCurrentThreadMessages(messages || [])
      } else {
        setThreadError(response.error || 'Failed to load current thread')
      }
    } catch (error) {
      setThreadError('Failed to load chat messages')
      console.error('Error loading current thread:', error)
    } finally {
      setThreadLoading(false)
    }
  }

  // Helper function to get agent icon from session by agent_id or agent_name
  const getAgentIcon = (agentId?: number, agentName?: string): string => {
    if (!session?.session_agents) {
      return '🤖' // Default icon
    }
    
    // Try to find by agent_id first
    if (agentId) {
      const agent = session.session_agents.find(a => a.agent_id === agentId)
      if (agent?.agent_icon) return agent.agent_icon
    }
    
    // Fall back to finding by agent_name (which might be agent_code from the message)
    if (agentName) {
      // First try to match against agent_code (more reliable for messages)
      const agentByCode = session.session_agents.find(a => a.agent_code === agentName)
      if (agentByCode?.agent_icon) return agentByCode.agent_icon
      
      // Then try to match against agent_name
      const agentByName = session.session_agents.find(a => a.agent_name === agentName)
      if (agentByName?.agent_icon) return agentByName.agent_icon
    }
    
    return '🤖' // Default icon
  }

  const categoryOptions = [
    'Custom',
    'Analysis',
    'Content',
    'Strategic',
    'Research',
    'Forecasting',
    'Performance',
    'Marketing'
  ]

  const powerPrompts = [
    {
      id: 1,
      name: 'Campaign Brief Generator',
      category: 'campaign',
      rating: 4.8,
      uses: 234,
      description: 'Creates comprehensive campaign briefs with strategic insights',
      variables: ['BRAND', 'TARGET_AUDIENCE', 'CAMPAIGN_OBJECTIVE', '+2']
    },
    {
      id: 2,
      name: 'Content Strategy Framework',
      category: 'content',
      rating: 4.7,
      uses: 189,
      description: 'Develops content strategies aligned with brand objectives',
      variables: ['BRAND', 'CHANNELS', 'TIME_PERIOD', '+3']
    },
    {
      id: 3,
      name: 'Market Analysis Deep Dive',
      category: 'analysis',
      rating: 4.9,
      uses: 156,
      description: 'Comprehensive market analysis with actionable insights',
      variables: ['BRAND', 'CATEGORY', 'GEOGRAPHY', '+2']
    },
    {
      id: 4,
      name: 'Creative Brief Template',
      category: 'creative',
      rating: 4.6,
      uses: 298,
      description: 'Structured creative briefs for campaign development',
      variables: ['CAMPAIGN_NAME', 'TARGET_AUDIENCE', 'BRAND_GUIDELINES', '+2']
    },
    {
      id: 5,
      name: 'Campaign Performance Review',
      category: 'analysis',
      rating: 4.5,
      uses: 167,
      description: 'Analyzes campaign performance with optimization recommendations',
      variables: ['CAMPAIGN_NAME', 'CAMPAIGN_DATA', 'REVIEW_PERIOD', '+1']
    },
    {
      id: 6,
      name: 'Brand Positioning Framework',
      category: 'strategy',
      rating: 4.8,
      uses: 145,
      description: 'Develops clear brand positioning strategies',
      variables: ['BRAND', 'MARKET_CATEGORY', 'MARKET_CONTEXT', '+2']
    }
  ]

  const promptFilterOptions = [
    'All Prompts (6)',
    'Campaign (2)',
    'Analysis (2)',
    'Content (1)',
    'Strategy (1)',
    'Creative (1)'
  ]

  const promptCategoryOptions = [
    'Custom',
    'Campaign',
    'Content',
    'Analysis',
    'Strategy',
    'Creative',
    'Marketing',
    'Research'
  ]

  const handleSendMessage = async () => {
    if (!message.trim() || isStreaming) return

    const userMessage = message.trim()
    setMessage('')
    setSelectedFile(null)
    setIsStreaming(true)
    setStreamingMessage(null)

    // Add user message to display immediately
    const newUserMessage: ThreadMessage = {
      message_id: Date.now().toString(),
      thread_id: '',
      agent_id: undefined,
      agent_name: undefined,
      role: 'user',
      content: userMessage,
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0,
      message_order: currentThreadMessages.length + 1,
      is_edited: false,
      edited_date: null,
      created_date: new Date().toISOString(),
      modified_date: null
    }

    setCurrentThreadMessages(prev => [...prev, newUserMessage])

    try {
      const response = await fetch('/api/threads/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'message') {
                setStreamingMessage(prev => {
                  // If agent code changes, finalize previous message first
                  if (prev && prev.agent_code !== data.agent_code) {
                    const agentMessage: ThreadMessage = {
                      message_id: (Date.now() + Math.random()).toString(),
                      thread_id: '',
                      agent_id: undefined,
                      agent_name: prev.agent_code,
                      role: 'assistant',
                      content: prev.content,
                      input_tokens: 0,
                      output_tokens: prev.tokens,
                      total_tokens: prev.tokens,
                      message_order: 0,
                      is_edited: false,
                      edited_date: null,
                      created_date: prev.created_date || new Date().toISOString(),
                      modified_date: null
                    }
                    setCurrentThreadMessages(prevMsgs => [...prevMsgs, agentMessage])
                    
                    // Start new streaming message with new agent
                    return {
                      agent_code: data.agent_code,
                      content: data.content,
                      tokens: data.tokens,
                      created_date: data.created_date || new Date().toISOString()
                    }
                  }
                  
                  // Same agent, append content
                  return {
                    agent_code: data.agent_code,
                    content: prev ? prev.content + data.content : data.content,
                    tokens: data.tokens,
                    created_date: data.created_date || prev?.created_date || new Date().toISOString()
                  }
                })
              } else if (data.type === 'stream_end') {
                // Finalize the streaming message
                setStreamingMessage(current => {
                  if (current) {
                    const agentMessage: ThreadMessage = {
                      message_id: (Date.now() + 1).toString(),
                      thread_id: '',
                      agent_id: undefined,
                      agent_name: current.agent_code,
                      role: 'assistant',
                      content: current.content,
                      input_tokens: 0,
                      output_tokens: current.tokens,
                      total_tokens: current.tokens,
                      message_order: 0,
                      is_edited: false,
                      edited_date: null,
                      created_date: current.created_date || new Date().toISOString(),
                      modified_date: null
                    }
                    setCurrentThreadMessages(prev => [...prev, agentMessage])
                  }
                  return null
                })
                break
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Handle error - maybe show error message to user
    } finally {
      setIsStreaming(false)
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const fileMessage = `📎 Attached file: ${file.name}`
      setMessage(prev => prev ? `${prev}\n\n${fileMessage}` : fileMessage)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    // Remove the file attachment text from message
    setMessage(prev => {
      const lines = prev.split('\n')
      return lines.filter(line => !line.includes('📎 Attached file:')).join('\n').trim()
    })
  }

  const handleResearchOption = (option: string) => {
    console.log('Selected research option:', option)
    setShowResearchDropdown(false)
    // Add logic for each research option here
  }

  const toggleResearchDropdown = () => {
    setShowResearchDropdown(prev => !prev)
  }

  const handleModelSelect = (modelLabel: string) => {
    setSelectedModel(modelLabel)
    setShowModelDropdown(false)
  }

  const toggleModelDropdown = () => {
    setShowModelDropdown(prev => !prev)
  }

  const handleAgentLibraryClick = () => {
    setShowAgentLibrary(true)
  }

  const closeAgentLibrary = () => {
    setShowAgentLibrary(false)
  }



  const handleCreateAgent = () => {
    setShowCreateAgent(true)
  }

  const closeCreateAgent = () => {
    setShowCreateAgent(false)
    // Reset form
    setNewAgent({
      name: '',
      icon: '🤖',
      description: '',
      category: 'Custom',
      instructions: '',
      capabilities: [],
      currentCapability: ''
    })
  }

  const handleAgentFieldChange = (field: string, value: string) => {
    setNewAgent(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addCapability = () => {
    if (newAgent.currentCapability.trim()) {
      setNewAgent(prev => ({
        ...prev,
        capabilities: [...prev.capabilities, prev.currentCapability.trim()],
        currentCapability: ''
      }))
    }
  }

  const removeCapability = (index: number) => {
    setNewAgent(prev => ({
      ...prev,
      capabilities: prev.capabilities.filter((_, i) => i !== index)
    }))
  }

  const handleCapabilityKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCapability()
    }
  }

  const handleCreateAgentSubmit = () => {
    // Validate required fields
    if (!newAgent.name.trim() || !newAgent.description.trim()) {
      return
    }
    
    // Here you would typically save the agent
    console.log('Creating new agent:', newAgent)
    
    // Close dialogs and reset
    closeCreateAgent()
    setShowAgentLibrary(false)
  }

  const handlePowerPromptsClick = () => {
    setShowPowerPrompts(true)
  }

  const closePowerPrompts = () => {
    setShowPowerPrompts(false)
  }

  const handlePromptUse = (promptName: string) => {
    console.log('Using prompt:', promptName)
    setShowPowerPrompts(false)
    // Here you would typically apply the prompt to the message input
  }

  const handlePromptFieldChange = (field: string, value: string) => {
    setNewPrompt(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSavePrompt = () => {
    // Validate required fields
    if (!newPrompt.title.trim() || !newPrompt.description.trim() || !newPrompt.template.trim()) {
      return
    }
    
    // Here you would typically save the prompt
    console.log('Saving new prompt:', newPrompt)
    
    // Reset form and close
    setNewPrompt({
      title: '',
      category: 'Custom',
      description: '',
      template: ''
    })
    setShowPowerPrompts(false)
  }

  const handleTestPrompt = () => {
    if (!newPrompt.template.trim()) {
      return
    }
    
    console.log('Testing prompt:', newPrompt.template)
    // Here you would typically test the prompt
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowResearchDropdown(false)
      }
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setShowModelDropdown(false)
      }
    }

    if (showResearchDropdown || showModelDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showResearchDropdown, showModelDropdown])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isStreaming) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* Chat Area */}
      <div className="flex-1 p-6 flex flex-col bg-gray-50 overflow-y-auto">
        {/* Loading State */}
        {(sessionLoading || threadLoading) && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">
                {sessionLoading ? 'Loading session...' : 'Loading chat history...'}
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!sessionLoading && !threadLoading && threadError && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-500 mb-4">Error loading chat: {threadError}</div>
              <Button onClick={loadCurrentThreadMessages} variant="outline">
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Messages View */}
        {!sessionLoading && !threadLoading && !threadError && (hasCurrentThread || currentThreadMessages.length > 0) && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto mb-4">
              <div className="max-w-4xl mx-auto space-y-4">
                {currentThreadMessages.map((msg, index) => {
                  const isUserMessage = msg.role?.toLowerCase() === 'user'
                  const prevMsg = index > 0 ? currentThreadMessages[index - 1] : null
                  const nextMsg = index < currentThreadMessages.length - 1 ? currentThreadMessages[index + 1] : null
                  
                  // Helper function to check if two messages should be grouped
                  const shouldGroupMessages = (msg1: ThreadMessage | null, msg2: ThreadMessage | null) => {
                    if (!msg1 || !msg2) return false
                    
                    const isUser1 = msg1.role?.toLowerCase() === 'user'
                    const isUser2 = msg2.role?.toLowerCase() === 'user'
                    
                    // Must be same type (both user or both agent)
                    if (isUser1 !== isUser2) return false
                    
                    // For agent messages, must have exact same agent name AND created date
                    if (!isUser2) {
                      if (msg1.agent_name !== msg2.agent_name) return false
                      
                      // Compare created dates (should be exact match for same response)
                      const date1 = msg1.created_date || ''
                      const date2 = msg2.created_date || ''
                      return date1 === date2
                    }
                    
                    // For user messages, check time window only
                    const time1 = msg1.created_date ? new Date(msg1.created_date).getTime() : 0
                    const time2 = msg2.created_date ? new Date(msg2.created_date).getTime() : 0
                    return Math.abs(time1 - time2) < 60000 // Within 1 minute
                  }
                  
                  // Check if this message is from the same sender as the previous one
                  const isSameSenderAsPrev = shouldGroupMessages(prevMsg, msg)
                  
                  // Check if next message is from same sender
                  const isSameSenderAsNext = shouldGroupMessages(msg, nextMsg)
                  
                  return (
                    <div key={msg.message_id || index} className={`flex gap-3 ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
                      {/* Avatar for agent messages (left side) */}
                      {!isUserMessage && (
                        <div className={`flex-shrink-0 ${isSameSenderAsPrev ? 'invisible' : ''}`}>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                            <span className="text-lg">{getAgentIcon(msg.agent_id, msg.agent_name)}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className={`flex flex-col ${isUserMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
                        {/* Show sender name and timestamp only for first message in group */}
                        {!isSameSenderAsPrev && (
                          <div className={`flex flex-col ${isUserMessage ? 'items-end' : 'items-start'} mb-1`}>
                            <div className={`text-xs font-medium text-gray-700 ${isUserMessage ? 'mr-2' : 'ml-2'}`}>
                              {isUserMessage ? 'You' : (msg.agent_name || 'FreddyGPT')}
                            </div>
                            <div className={`text-xs text-gray-400 ${isUserMessage ? 'mr-2' : 'ml-2'}`}>
                              {msg.created_date ? new Date(msg.created_date).toLocaleTimeString() : 'No timestamp'}
                            </div>
                          </div>
                        )}
                        
                        <div className={`p-4 rounded-lg ${
                          isUserMessage 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white text-gray-900 shadow-sm'
                        } ${
                          isSameSenderAsPrev && isSameSenderAsNext 
                            ? 'rounded-lg' 
                            : isSameSenderAsPrev 
                              ? isUserMessage ? 'rounded-tr-lg' : 'rounded-tl-lg'
                              : isSameSenderAsNext 
                                ? isUserMessage ? 'rounded-br-lg' : 'rounded-bl-lg'
                                : 'rounded-lg'
                        }`}>
                          <div className={isUserMessage ? 'whitespace-pre-wrap' : ''}>
                            {isUserMessage ? (
                              msg.content
                            ) : (
                              <div className="prose prose-sm max-w-none prose-gray prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-table:text-gray-800">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {msg.content}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Avatar for user messages (right side) */}
                      {isUserMessage && (
                        <div className={`flex-shrink-0 ${isSameSenderAsPrev ? 'invisible' : ''}`}>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                            <User className="w-5 h-5" />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
                
                {/* Streaming Message */}
                {streamingMessage && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                        <span className="text-lg">{getAgentIcon(undefined, streamingMessage.agent_code)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-start max-w-[70%]">
                      <div className="flex flex-col items-start mb-1">
                        <div className="text-xs font-medium text-gray-700 ml-2">{streamingMessage.agent_code}</div>
                        <div className="text-xs text-gray-400 ml-2">
                          {streamingMessage.created_date ? new Date(streamingMessage.created_date).toLocaleTimeString() : new Date().toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-white text-gray-900 shadow-sm">
                        <div className="prose prose-sm max-w-none prose-gray prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-table:text-gray-800">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {streamingMessage.content}
                          </ReactMarkdown>
                        </div>
                        <div className="text-xs opacity-70 mt-2 flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                          <span>Typing... ({streamingMessage.tokens} tokens)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Welcome View - shown when no current thread or no messages */}
        {!sessionLoading && !threadLoading && !threadError && !hasCurrentThread && currentThreadMessages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="max-w-4xl w-full text-center">
              {/* Welcome Section */}
              <div className="mb-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to FreddyGPT</h1>
                <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
                  Your AI assistant for marketing and brand building. How can I help you today?
                </p>
              </div>

              {/* Suggested Prompts */}
              <div className="mb-8">
                <p className="text-lg font-medium text-gray-700 mb-6">Try asking me about:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
                  {suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => setMessage(prompt)}
                      className="text-left p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md transition-all duration-200 text-sm text-gray-700 hover:text-blue-700 bg-white"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-6 flex-shrink-0">
        <div className="max-w-5xl mx-auto">
          {/* Tools Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 h-9"
                onClick={handleFileUpload}
              >
                <Upload className="w-4 h-4" />
                Upload
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.csv,.xlsx,.xls"
              />
              
              {/* Research Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 h-9"
                  onClick={toggleResearchDropdown}
                >
                  <Search className="w-4 h-4" />
                  Research
                  <ChevronDown className="w-3 h-3" />
                </Button>
                
                {showResearchDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[180px]">
                    {researchOptions.map((option) => {
                      const IconComponent = option.icon
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleResearchOption(option.id)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                        >
                          <IconComponent className="w-4 h-4 text-gray-500" />
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
              
              {/* <Button variant="ghost" size="sm" className="p-1">
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </Button> */}
            </div>
            
            <div className="flex items-center gap-4">
              {/* Model Selector */}
              <div className="relative" ref={modelDropdownRef}>
                <button
                  onClick={toggleModelDropdown}
                  className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <Brain className="w-4 h-4" />
                  <span className="font-medium">{selectedModel}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                
                {showModelDropdown && (
                  <div className="absolute bottom-full right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
                    {modelOptions.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => handleModelSelect(model.label)}
                        className={`w-full flex flex-col items-start gap-1 px-3 py-3 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                          selectedModel === model.label ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        <span className="font-medium">{model.label}</span>
                        <span className="text-xs text-gray-500">{model.description}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <Button variant="outline" size="sm" className="flex items-center gap-2 h-9" onClick={handleAgentLibraryClick}>
                <Bot className="w-4 h-4" />
                Agent Library
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2 h-9" onClick={handlePowerPromptsClick}>
                <Zap className="w-4 h-4" />
                Power Prompts
              </Button>
            </div>
          </div>

          {/* Input Row */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              {selectedFile && (
                <div className="absolute top-2 left-2 z-10 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>{selectedFile.name}</span>
                  <button
                    onClick={removeFile}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isStreaming ? "FreddyGPT is responding..." : "Ask me anything about marketing, branding, or campaigns..."}
                disabled={isStreaming}
                className={`w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500 shadow-sm ${
                  selectedFile ? 'pt-10' : ''
                }`}
                rows={selectedFile ? 3 : 2}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!message.trim() || isStreaming}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-lg shadow-sm"
              >
                {isStreaming ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Context Selector */}
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600 font-medium">Prompt Context:</span>
            <div className="flex items-center gap-1">
              {contextOptions.map((option, index) => (
                <React.Fragment key={option}>
                  <button
                    onClick={() => setSelectedContext(option)}
                    className={`px-3 py-1 rounded-full transition-colors ${
                      selectedContext === option 
                        ? 'text-blue-600 font-medium bg-blue-100' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                    }`}
                  >
                    {option}
                  </button>
                  {index < contextOptions.length - 1 && <span className="text-gray-300 mx-1">|</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Agent Library Component */}
      <AgentLibrary 
        isOpen={showAgentLibrary} 
        onClose={closeAgentLibrary}
        onCreateAgent={handleCreateAgent}
      />

      {/* Create Agent Modal */}
      {showCreateAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border shadow-lg w-full max-w-2xl p-6">
            {/* Header */}
            <div className="flex flex-col gap-2 text-center sm:text-left mb-6">
              <h2 className="text-lg font-semibold">Create New Agent</h2>
              <button
                onClick={closeCreateAgent}
                className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-sm transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Agent Name and Icon Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Agent Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Content Strategist"
                    value={newAgent.name}
                    onChange={(e) => handleAgentFieldChange('name', e.target.value)}
                    className="w-full h-9 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Icon</label>
                  <input
                    type="text"
                    placeholder="🤖"
                    value={newAgent.icon}
                    onChange={(e) => handleAgentFieldChange('icon', e.target.value)}
                    className="w-full h-9 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  placeholder="Brief description of what this agent does..."
                  value={newAgent.description}
                  onChange={(e) => handleAgentFieldChange('description', e.target.value)}
                  className="w-full min-h-16 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  value={newAgent.category}
                  onChange={(e) => handleAgentFieldChange('category', e.target.value)}
                  className="w-fit h-9 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Instructions</label>
                <textarea
                  placeholder="Detailed instructions for how this agent should behave..."
                  value={newAgent.instructions}
                  onChange={(e) => handleAgentFieldChange('instructions', e.target.value)}
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              {/* Capabilities */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Capabilities</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add capability..."
                    value={newAgent.currentCapability}
                    onChange={(e) => handleAgentFieldChange('currentCapability', e.target.value)}
                    onKeyPress={handleCapabilityKeyPress}
                    className="flex-1 h-9 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button
                    onClick={addCapability}
                    type="button"
                    variant="outline"
                    className="h-9 px-3"
                  >
                    Add
                  </Button>
                </div>
                {newAgent.capabilities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newAgent.capabilities.map((capability, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium"
                      >
                        {capability}
                        <button
                          onClick={() => removeCapability(index)}
                          className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateAgentSubmit}
                  className="flex-1"
                  disabled={!newAgent.name.trim() || !newAgent.description.trim()}
                >
                  Create Agent
                </Button>
                <Button
                  onClick={closeCreateAgent}
                  variant="outline"
                  className="px-6"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Power Prompts Modal */}
      {showPowerPrompts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Power Prompts Library</h2>
                <p className="text-sm text-gray-600 mt-1">Pre-built prompts for common marketing tasks and workflows</p>
              </div>
              <button
                onClick={closePowerPrompts}
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 border-b">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActivePromptTab('library')}
                  className={`flex-1 h-8 rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                    activePromptTab === 'library'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Prompt Library
                </button>
                <button
                  onClick={() => setActivePromptTab('create')}
                  className={`flex-1 h-8 rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                    activePromptTab === 'create'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Create Prompt
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 max-h-[60vh] overflow-y-auto">
              {activePromptTab === 'library' && (
                <div className="space-y-6">
                  {/* Search and Filter */}
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Search prompts..."
                      value={promptSearchQuery}
                      onChange={(e) => setPromptSearchQuery(e.target.value)}
                      className="flex-1 h-9 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select
                      value={selectedPromptFilter}
                      onChange={(e) => setSelectedPromptFilter(e.target.value)}
                      className="w-48 h-9 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      {promptFilterOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Prompts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {powerPrompts.map((prompt) => (
                      <div
                        key={prompt.id}
                        className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-sm mb-1">{prompt.name}</h3>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border border-gray-200 text-gray-700">
                              {prompt.category}
                            </span>
                          </div>
                          <div className="text-right text-xs text-gray-500">
                            <div>⭐ {prompt.rating}</div>
                            <div>{prompt.uses} uses</div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{prompt.description}</p>
                        <div className="mb-3">
                          <div className="text-xs font-medium mb-1">Variables:</div>
                          <div className="flex flex-wrap gap-1">
                            {prompt.variables.map((variable, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                              >
                                {variable}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Button
                          onClick={() => handlePromptUse(prompt.name)}
                          className="w-full h-8 text-sm"
                        >
                          Use This Prompt
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activePromptTab === 'create' && (
                <div className="space-y-4">
                  {/* Title and Category Row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-2">
                      <label className="text-sm font-medium">Prompt Title</label>
                      <input
                        type="text"
                        placeholder="e.g., Social Media Content Planner"
                        value={newPrompt.title}
                        onChange={(e) => handlePromptFieldChange('title', e.target.value)}
                        className="w-full h-9 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <select
                        value={newPrompt.category}
                        onChange={(e) => handlePromptFieldChange('category', e.target.value)}
                        className="w-full h-9 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        {promptCategoryOptions.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      placeholder="Brief description of what this prompt does..."
                      value={newPrompt.description}
                      onChange={(e) => handlePromptFieldChange('description', e.target.value)}
                      className="w-full min-h-16 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Prompt Template */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Prompt Template</label>
                    <textarea
                      placeholder="Write your prompt template here. Use {VARIABLE_NAME} for dynamic variables..."
                      value={newPrompt.template}
                      onChange={(e) => handlePromptFieldChange('template', e.target.value)}
                      className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={8}
                    />
                    <p className="text-xs text-gray-500">Use curly braces for variables: {'{BRAND}'}, {'{TARGET_AUDIENCE}'}, etc.</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSavePrompt}
                      className="flex-1"
                      disabled={!newPrompt.title.trim() || !newPrompt.description.trim() || !newPrompt.template.trim()}
                    >
                      Save Prompt
                    </Button>
                    <Button
                      onClick={handleTestPrompt}
                      variant="outline"
                      className="px-6"
                      disabled={!newPrompt.template.trim()}
                    >
                      Test Prompt
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatInterface