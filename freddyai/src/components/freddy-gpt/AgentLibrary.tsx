import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Plus, X } from 'lucide-react'
import { useUserSession } from '../../hooks/useUserSession'

// Agent interface type
interface Agent {
  AgentId: number
  AgentName: string
  Icon: string
  Description: string
  Tags: string[]
  IsActive: boolean
  CreatedDate: string
  CreatedBy: string
  NumberOfUses: number
  SystemPrompt?: string
  Instruments?: string
}

interface AgentLibraryProps {
  isOpen: boolean
  onClose: () => void
  onCreateAgent?: () => void
}

const AgentLibrary: React.FC<AgentLibraryProps> = ({ isOpen, onClose, onCreateAgent }) => {
  const { session, refreshSession, launchAgent, getAvailableAgents } = useUserSession()
  const [activeTab, setActiveTab] = useState('library')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('All Agents')
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filterOptions = [
    'All Agents',
    'Most Used',
    'Recently Added', 
    'Strategic',
    'Analysis',
    'Forecasting'
  ]

  // Fetch agents from API
  const fetchAgents = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/agents/list')
      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.statusText}`)
      }
      const agentsData = await response.json()
      setAgents(agentsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents')
      console.error('Error fetching agents:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load agents when component mounts or when agent library opens
  useEffect(() => {
    if (isOpen && agents.length === 0) {
      fetchAgents()
    }
  }, [isOpen, agents.length])

  // Filter agents based on search query
  const filteredAgents = agents.filter(agent => 
    agent.AgentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.Description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.Tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Check if an agent is already registered in the current session
  const isAgentRegistered = (agentId: number): boolean => {
    if (!session) return false
    const sessionAgents = getAvailableAgents()
    return sessionAgents.some(agent => agent.agent_id === agentId)
  }

  const handleAgentLaunch = async (agentId: number, agentName: string) => {
    console.log('Launching agent:', agentName)
    
    // Launch the agent (add to session)
    const launchSuccess = await launchAgent(agentId)
    if (launchSuccess) {
      console.log('Successfully launched agent:', agentName)
      // Refresh session to update the UI
      await refreshSession()
    } else {
      console.error('Failed to launch agent:', agentName)
    }
  }

  const handleCreateAgent = () => {
    if (onCreateAgent) {
      onCreateAgent()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Agent Library</h2>
            <p className="text-sm text-gray-600 mt-1">Manage and deploy specialized AI agents for different tasks</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('library')}
              className={`flex-1 h-8 rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                activeTab === 'library'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Agent Library
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 h-8 rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                activeTab === 'requests'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Agent Requests
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'library' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Search agents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 h-9 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="w-48 h-9 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    {filterOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <Button onClick={handleCreateAgent} className="h-9 px-4 text-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Agent
                  </Button>
                  <Button onClick={fetchAgents} variant="outline" className="h-9 px-4 text-sm" disabled={loading}>
                    {loading ? 'Loading...' : 'Refresh'}
                  </Button>
                </div>
                
                {/* Results count */}
                {!loading && agents.length > 0 && (
                  <div className="text-sm text-gray-600">
                    Showing {filteredAgents.length} of {agents.length} agents
                    {searchQuery && (
                      <span> matching "{searchQuery}"</span>
                    )}
                  </div>
                )}
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading agents...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-8">
                  <p className="text-sm text-red-600 mb-2">{error}</p>
                  <Button 
                    onClick={fetchAgents} 
                    variant="outline" 
                    size="sm"
                  >
                    Retry
                  </Button>
                </div>
              )}

              {/* Agent Grid */}
              {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAgents.map((agent) => (
                    <div
                      key={agent.AgentId}
                      className={`relative bg-white rounded-xl border p-4 hover:shadow-md transition-all cursor-pointer ${
                        isAgentRegistered(agent.AgentId)
                          ? 'border-green-200 bg-green-50/30 ring-1 ring-green-200'
                          : 'border-gray-200'
                      }`}
                    >
                      {isAgentRegistered(agent.AgentId) && (
                        <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium shadow-sm">
                          ✓
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{agent.Icon}</span>
                          <div>
                            <h3 className="font-medium text-sm text-gray-900">{agent.AgentName}</h3>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                              {agent.IsActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            {new Date(agent.CreatedDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-blue-600 font-medium mt-0.5">
                            {agent.NumberOfUses} uses
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{agent.Description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {agent.Tags && agent.Tags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border border-gray-200 text-gray-700 bg-gray-50"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      {isAgentRegistered(agent.AgentId) ? (
                        <div className="flex items-center justify-center gap-2 w-full h-8 text-sm bg-green-50 border border-green-200 rounded-md text-green-700 font-medium">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Registered
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleAgentLaunch(agent.AgentId, agent.AgentName)}
                          className="w-full h-8 text-sm"
                          disabled={!agent.IsActive}
                        >
                          Launch Agent
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* No agents found */}
              {!loading && !error && filteredAgents.length === 0 && agents.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-600">No agents match your search criteria.</p>
                </div>
              )}

              {/* No agents available */}
              {!loading && !error && agents.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-600">No agents found.</p>
                  <Button 
                    onClick={fetchAgents} 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                  >
                    Refresh
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="text-center py-12">
              <p className="text-gray-500">Agent Requests functionality coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AgentLibrary