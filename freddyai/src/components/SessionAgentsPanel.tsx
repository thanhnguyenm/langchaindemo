import React, { useState } from 'react'
import { Button } from './ui/button'
import { Bot, Check, Sparkles, ChevronDown } from 'lucide-react'
import { useUserSession } from '../hooks/useUserSession'
import type { SessionAgent } from '../utils/userSessionUtils'

interface SessionAgentsPanelProps {
  onLaunchNewAgent?: () => void
}

export const SessionAgentsPanel: React.FC<SessionAgentsPanelProps> = ({ onLaunchNewAgent }) => {
  const { 
    session, 
    loading, 
    getAvailableAgents 
  } = useUserSession()
  
  const [isExpanded, setIsExpanded] = useState(true)

  const sessionAgents = getAvailableAgents()

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">Session Agents</h3>
        </div>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="text-center text-gray-500">
          <Bot className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No session available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-gray-900">Session Agents</h3>
          <span className="text-sm text-gray-500">({sessionAgents.length})</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Agents List */}
      {isExpanded && (
        <div className="p-4">
          <div className="space-y-3">
            {sessionAgents.map((agent: SessionAgent) => (
              <div
                key={agent.session_agent_id}
                className="border rounded-lg p-3 transition-all border-gray-200 hover:border-gray-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Agent Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-medium text-lg">
                        {agent.agent_icon || '🤖'}
                      </div>
                    </div>

                    {/* Agent Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {agent.agent_name}
                        </h4>
                        <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                          <Sparkles className="w-3 h-3" />
                          Active
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {agent.agent_description}
                      </p>

                      {/* Agent Status */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-green-600" />
                          <span className="text-green-600 font-medium">In Session</span>
                          {agent.launched_date && (
                            <span>• {new Date(agent.launched_date).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex-shrink-0 ml-2">
                    <div className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-md">
                      <Check className="w-3 h-3" />
                      Ready
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Agent Button */}
          {onLaunchNewAgent && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={onLaunchNewAgent}
                className="w-full justify-center gap-2 text-sm h-9"
              >
                <Bot className="w-4 h-4" />
                Launch New Agent
              </Button>
            </div>
          )}

          {/* Empty State */}
          {sessionAgents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Bot className="w-8 h-8 mx-auto mb-3 text-gray-400" />
              <p className="text-sm font-medium mb-1">No Agents in Session</p>
              <p className="text-xs">Launch an agent to get started</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}