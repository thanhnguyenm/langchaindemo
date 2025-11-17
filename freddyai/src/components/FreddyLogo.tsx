import React from 'react'

const FreddyLogo: React.FC = () => {
  return (
    <div className="flex justify-center my-12">
      <div className="text-center">
        <img 
          src="https://v0-mockup-ai-agent-console-project.vercel.app/images/freddy-logo.png" 
          alt="Freddy.ai" 
          className="w-24 h-24 mx-auto mb-4"
        />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">FreddyAI</h2>
        <p className="text-gray-600">Your intelligent marketing assistant</p>
      </div>
    </div>
  )
}

export default FreddyLogo