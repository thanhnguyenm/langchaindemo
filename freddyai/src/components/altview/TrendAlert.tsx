import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { TrendingUp, Zap, Target } from 'lucide-react'

const TrendAlert: React.FC = () => {
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Zap className="w-5 h-5" />
          Emerging Trend Alert
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Sustainable Brewing Practices</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-orange-600">87% confidence</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Growing consumer interest in eco-friendly beer production methods
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700">Impact Level:</span>
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">High</span>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1">Suggested Action:</p>
                <p className="text-sm text-gray-600 mb-3">
                  Create personas focused on environmentally conscious consumers
                </p>
                
                <Button size="sm" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Launch Persona Agent
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TrendAlert