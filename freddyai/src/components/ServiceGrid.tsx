import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { 
  BarChart, 
  TrendingUp, 
  Layers, 
  Users, 
  ArrowRight 
} from 'lucide-react'

const ServiceGrid: React.FC = () => {
  const services = [
    {
      title: "Insights Engine",
      icon: BarChart,
      color: "bg-purple-100 text-purple-600",
      href: "/insights"
    },
    {
      title: "Marketing Orchestration", 
      icon: Layers,
      color: "bg-blue-100 text-blue-600",
      href: "/marketing-orchestration"
    },
    {
      title: "Smart Investing",
      icon: TrendingUp,
      color: "bg-green-100 text-green-600",
      href: "/smart-investing"
    },
    {
      title: "Agency Ecosystem",
      icon: Users,
      color: "bg-orange-100 text-orange-600",
      href: "/agency-ecosystem"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {services.map((service, index) => {
        const IconComponent = service.icon
        return (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${service.color}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-base">{service.title}</CardTitle>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default ServiceGrid