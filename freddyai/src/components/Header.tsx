import React, { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useUserSession } from '../hooks/useUserSession'
import { Search, Bell, User, LogOut } from 'lucide-react'

const Header: React.FC = () => {
  const location = useLocation()
  const { user, logout } = useAuth()
  const { session } = useUserSession()
  const [showAvatarMenu, setShowAvatarMenu] = useState(false)
  const avatarMenuRef = useRef<HTMLDivElement>(null)

  const toggleAvatarMenu = () => {
    setShowAvatarMenu(prev => !prev)
  }

  const handleLogout = async () => {
    await logout()
    setShowAvatarMenu(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target as Node)) {
        setShowAvatarMenu(false)
      }
    }

    if (showAvatarMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAvatarMenu])

  const getHeaderContent = () => {
    switch (location.pathname) {
      case '/freddy-gpt':
        return {
          title: 'FreddyGPT',
          subtitle: 'Your AI assistant for marketing and brand building',
          breadcrumb: 'FreddyAI GPT'
        }
      case '/altview':
        return {
          title: 'Welcome to your FreddyAI Altview',
          subtitle: 'Enhanced overview with Spain-focused insights for Brand Manager',
          breadcrumb: 'Overview / Altview'
        }
      case '/':
      default:
        return {
          title: 'Welcome to your FreddyAI',
          subtitle: 'Streamline your marketing workflow with AI-powered tools and insights',
          breadcrumb: 'Overview'
        }
    }
  }

  const { title, subtitle, breadcrumb } = getHeaderContent()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Welcome message */}
        <div>
          <div className="text-sm text-gray-500 mb-1">{breadcrumb}</div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600">{subtitle}</p>
        </div>

        {/* Right side - User actions */}
        <div className="flex items-center gap-4">
          {/* Tokens Display */}
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            <span className="font-semibold">{session?.usage_statistics?.current_month_tokens || 0}</span> Tokens
          </div>
          
          <Button variant="ghost" size="icon">
            <Search className="w-5 h-5" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
          
          {/* Avatar Section */}
          <div className="relative" ref={avatarMenuRef}>
            <button
              onClick={toggleAvatarMenu}
              className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
            >
              <User className="w-5 h-5" />
            </button>
            
            {showAvatarMenu && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px] py-2">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm text-gray-600 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header