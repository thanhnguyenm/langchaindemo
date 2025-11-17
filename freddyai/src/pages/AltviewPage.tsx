import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import ChatWidget from '../components/altview/ChatWidget'
import SocialListening from '../components/altview/SocialListening'
import MarketPerformance from '../components/altview/MarketPerformance'
import CollaborativeWorkspace from '../components/altview/CollaborativeWorkspace'
import TrendAlert from '../components/altview/TrendAlert'
import PlatformOverview from '../components/altview/PlatformOverview'
import DashboardCards from '../components/DashboardCards'
import { ArrowLeft } from 'lucide-react'

const AltviewPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Back to Overview */}
      <div className="mb-4">
        <Link to="/">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </Button>
        </Link>
      </div>

      {/* Top Row - Chat and Social/Market */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChatWidget />
        <div className="space-y-6">
          <SocialListening />
          <MarketPerformance />
        </div>
      </div>

      {/* Middle Row - Workspace and Trend Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CollaborativeWorkspace />
        <TrendAlert />
      </div>

      {/* FreddyAI Cards Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">FreddyAI</h2>
        <DashboardCards />
      </div>

      {/* Platform Overview */}
      <PlatformOverview />
    </div>
  )
}

export default AltviewPage