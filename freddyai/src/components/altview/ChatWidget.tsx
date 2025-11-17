import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Send, MessageSquare } from 'lucide-react'

const ChatWidget: React.FC = () => {
  const [message, setMessage] = useState('')

  const suggestedPrompts = [
    "Create a campaign brief for Amstel",
    "Generate consumer personas", 
    "Analyze market trends"
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Quick Chat with FreddyGPT
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chat Interface */}
        <div className="bg-gray-50 rounded-lg p-4 min-h-[120px] flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Start a conversation with FreddyGPT</p>
          </div>
        </div>

        {/* Suggested Prompts */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Try asking:</p>
          <div className="space-y-2">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setMessage(prompt)}
                className="w-full text-left text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded border border-blue-200 transition-colors"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <p className="text-xs text-gray-500">
          Press Enter or click Chat to continue the conversation in FreddyGPT
        </p>
      </CardContent>
    </Card>
  )
}

export default ChatWidget