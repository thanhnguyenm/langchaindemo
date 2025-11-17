import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { 
  BarChart, 
  Layers, 
  TrendingUp, 
  Users, 
  Image,
  Target,
  Globe,
  Zap
} from 'lucide-react'

const PlatformOverview: React.FC = () => {
  const sections = [
    {
      title: "Insights Engine",
      items: [
        {
          name: "Markets & Business",
          description: "Real-time market analysis and competitive intelligence",
          count: "15 active reports",
          icon: BarChart,
          color: "bg-purple-100 text-purple-600"
        },
        {
          name: "Consumers & Culture", 
          description: "Consumer behavior insights and cultural trends",
          count: "8 trend alerts",
          icon: Users,
          color: "bg-blue-100 text-blue-600"
        },
        {
          name: "Shoppers & Customers",
          description: "Shopping patterns and customer journey analysis", 
          count: "12 journey maps",
          icon: Target,
          color: "bg-green-100 text-green-600"
        }
      ]
    },
    {
      title: "Marketing Orchestration",
      items: [
        {
          name: "Mediatool",
          description: "Media planning and campaign orchestration",
          count: "3 active campaigns",
          icon: Layers,
          color: "bg-orange-100 text-orange-600"
        },
        {
          name: "DAM",
          description: "Digital asset management and organization",
          count: "1,247 assets",
          icon: Image,
          color: "bg-pink-100 text-pink-600"
        }
      ]
    },
    {
      title: "Smart Investing", 
      items: [
        {
          name: "Allocation AI",
          description: "AI-powered budget optimization",
          count: "€2.3M optimized",
          icon: TrendingUp,
          color: "bg-emerald-100 text-emerald-600"
        },
        {
          name: "ABTL Dashboard",
          description: "Above and below the line performance",
          count: "94% efficiency",
          icon: BarChart,
          color: "bg-cyan-100 text-cyan-600"
        }
      ]
    },
    {
      title: "Agency Ecosystem",
      items: [
        {
          name: "WPP Open",
          description: "Agency collaboration platform",
          count: "5 active projects",
          icon: Globe,
          color: "bg-indigo-100 text-indigo-600"
        },
        {
          name: "Leona",
          description: "Creative workflow management",
          count: "12 workflows",
          icon: Zap,
          color: "bg-yellow-100 text-yellow-600"
        }
      ]
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h3 className="font-semibold text-lg text-gray-900 mb-3">{section.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map((item, itemIndex) => {
                const IconComponent = item.icon
                return (
                  <div key={itemIndex} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{item.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        <span className="text-xs font-medium text-blue-600">{item.count}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default PlatformOverview