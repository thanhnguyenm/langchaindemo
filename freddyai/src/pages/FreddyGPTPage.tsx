import React, { useState } from 'react'
import ChatSidebar from '../components/freddy-gpt/ChatSidebar'
import ChatInterface from '../components/freddy-gpt/ChatInterface'

const FreddyGPTPage: React.FC = () => {
  const [threadChangeKey, setThreadChangeKey] = useState(0)

  const handleThreadChange = () => {
    // Force ChatInterface to reload by updating a key
    setThreadChangeKey(prev => prev + 1)
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Chat Sidebar */}
      <ChatSidebar onThreadChange={handleThreadChange} />
      
      {/* Main Chat Interface */}
      <ChatInterface key={threadChangeKey} />
    </div>
  )
}

export default FreddyGPTPage