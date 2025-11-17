import React, { useState } from 'react'
import { Button } from './ui/button'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  Settings, 
  HelpCircle, 
  Brain, 
  BarChart, 
  Layers, 
  TrendingUp, 
  Users,
  Book,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const Navigation: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navigationItems = [
    { label: 'Overview', path: '/', icon: BarChart },
    { label: 'FreddyAI GPT', path: '/freddy-gpt', icon: Brain },
    { label: 'Insights Engine', path: '/insights', icon: TrendingUp },
    { label: 'Marketing Orchestration', path: '/marketing-orchestration', icon: Layers },
    { label: 'Smart Investing', path: '/smart-investing', icon: TrendingUp },
    { label: 'Agency Ecosystem', path: '/agency-ecosystem', icon: Users },
    { label: 'How to use AI', path: '/how-to-use-ai', icon: Book },
  ]

  const overviewSubItems = [
    { label: 'Altview', path: '/altview', icon: BarChart }
  ]

  const isActivePath = (path: string) => {
    return location.pathname === path
  }

  const isOverviewSection = () => {
    return location.pathname === '/' || location.pathname === '/altview'
  }

  return (
    <aside className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 sticky top-0 h-screen ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'hidden' : ''}`}>
          <img 
            src="https://v0-mockup-ai-agent-console-project.vercel.app/images/freddy-logo.png" 
            alt="Freddy.ai" 
            className="w-8 h-8"
          />
          <span className="text-xl font-bold text-gray-900">FreddyAI</span>
        </div>
        
        {/* Logo only when collapsed */}
        {isCollapsed && (
          <img 
            src="https://v0-mockup-ai-agent-console-project.vercel.app/images/freddy-logo.png" 
            alt="Freddy.ai" 
            className="w-8 h-8 mx-auto"
          />
        )}
        
        {/* Toggle button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1 hover:bg-gray-100 rounded-md transition-colors ${
            isCollapsed ? 'hidden' : ''
          }`}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      
      {/* Expand button when collapsed */}
      {isCollapsed && (
        <div className="p-2 border-b border-gray-200">
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full p-2 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-center"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon
            const isActive = isActivePath(item.path)
            const isOverviewItem = item.path === '/'
            const showSubItems = isOverviewItem && isOverviewSection() && !isCollapsed
            
            return (
              <div key={item.path}>
                <Button 
                  variant={isActive ? "secondary" : "ghost"} 
                  className={`w-full ${
                    isCollapsed ? 'justify-center px-2' : 'justify-start'
                  } text-left ${
                    isActive ? 'bg-blue-100 text-blue-900' : ''
                  }`}
                  onClick={() => navigate(item.path)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <IconComponent className={`w-4 h-4 ${isCollapsed ? '' : 'mr-3'}`} />
                  {!isCollapsed && item.label}
                </Button>
                
                {/* Sub-items for Overview */}
                {showSubItems && (
                  <div className="ml-6 mt-2 space-y-1">
                    {overviewSubItems.map((subItem) => {
                      const SubIconComponent = subItem.icon
                      const isSubActive = isActivePath(subItem.path)
                      
                      return (
                        <Button
                          key={subItem.path}
                          variant={isSubActive ? "secondary" : "ghost"}
                          size="sm"
                          className={`w-full justify-start text-left text-sm ${
                            isSubActive ? 'bg-blue-50 text-blue-800' : 'text-gray-600'
                          }`}
                          onClick={() => navigate(subItem.path)}
                        >
                          <SubIconComponent className="w-3 h-3 mr-2" />
                          {subItem.label}
                        </Button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            className={`w-full ${
              isCollapsed ? 'justify-center px-2' : 'justify-start'
            } text-left`}
            title={isCollapsed ? "Help" : undefined}
          >
            <HelpCircle className={`w-4 h-4 ${isCollapsed ? '' : 'mr-3'}`} />
            {!isCollapsed && 'Help'}
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full ${
              isCollapsed ? 'justify-center px-2' : 'justify-start'
            } text-left`}
            title={isCollapsed ? "Settings" : undefined}
          >
            <Settings className={`w-4 h-4 ${isCollapsed ? '' : 'mr-3'}`} />
            {!isCollapsed && 'Settings'}
          </Button>
        </div>
      </div>
    </aside>
  )
}

export default Navigation