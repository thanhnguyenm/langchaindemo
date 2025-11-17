import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { TrendingUp } from 'lucide-react'

const MarketPerformance: React.FC = () => {
  const metrics = [
    {
      label: 'Market Share',
      value: '23.4%',
      change: '+1.2%',
      description: 'Combined Amstel + Cruzcampo market position'
    },
    {
      label: 'Brand Power',
      value: '8.7/10',
      change: '+0.3',
      description: 'Brand strength index across Spanish markets'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Performance - Spain</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-700">{metric.label}</h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{metric.value}</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-green-500 font-medium text-sm">{metric.change}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">{metric.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default MarketPerformance