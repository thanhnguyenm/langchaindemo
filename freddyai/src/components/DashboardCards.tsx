import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { FileText, Image, ArrowRight } from 'lucide-react'

const DashboardCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* FreddyAI GPT Card */}
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="https://v0-mockup-ai-agent-console-project.vercel.app/images/freddy-logo.png" 
              alt="Freddy.ai" 
              className="w-10 h-10"
            />
            <div>
              <CardTitle className="text-lg">FreddyAI</CardTitle>
              <CardDescription className="text-sm">Freddy GPT</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Your AI assistant for conversational tasks. Prompt anything or generate compliant images with advanced AI capabilities.
          </p>
          <Button className="w-full">
            Access Now 🤖
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Campaign Brief Card */}
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Start a New Campaign Brief</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Start a campaign brief with specialized AI agents for strategic planning and execution.
          </p>
          <Button variant="outline" className="w-full">
            Launch Agent 🗂️
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Asset Library Card */}
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Image className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Explore Asset Library</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Access digital asset management with AI-powered content organization.
          </p>
          <Button variant="secondary" className="w-full">
            Open DAM
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardCards