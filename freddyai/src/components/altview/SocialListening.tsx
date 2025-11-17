import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

const SocialListening: React.FC = () => {
  const brands = [
    {
      name: 'Amstel',
      mentions: 2847,
      change: 12,
      trend: 'up',
      description: 'Strong summer campaign performance in Madrid and Barcelona regions'
    },
    {
      name: 'Cruzcampo', 
      mentions: 1923,
      change: 3,
      trend: 'up',
      description: 'Steady engagement around local festivals and cultural events'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Listening Highlights - Spain</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {brands.map((brand, index) => (
          <div key={index} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg">{brand.name}</h3>
                <span className="text-gray-600 text-sm">{brand.mentions.toLocaleString()} mentions</span>
                <div className="flex items-center gap-1">
                  {brand.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    brand.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    +{brand.change}%
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">{brand.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default SocialListening