import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import DashboardCards from '../components/DashboardCards'
import ServiceGrid from '../components/ServiceGrid'
import FreddyLogo from '../components/FreddyLogo'
import { ArrowRight, BarChart } from 'lucide-react'

const HomePage: React.FC = () => {
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Enhanced Overview Option */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <BarChart className="w-5 h-5" />
            Enhanced Overview Available
          </CardTitle>
          <CardDescription className="text-blue-700">
            Get a Spain-focused dashboard with advanced insights, social listening, and collaborative tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/altview">
            <Button className="flex items-center gap-2">
              View Altview Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Main Action Cards */}
      <div className="mb-8">
        <DashboardCards />
      </div>
      
      {/* Freddy Logo Section */}
      <FreddyLogo />
      
      {/* Service Grid */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Explore More Services</h3>
        <ServiceGrid />
      </div>
    </div>
  )
}

export default HomePage