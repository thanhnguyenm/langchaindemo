import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { UserSessionProvider } from './contexts/UserSessionContext'
import Navigation from './components/Navigation'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import AltviewPage from './pages/AltviewPage'
import FreddyGPTPage from './pages/FreddyGPTPage'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

const AppContent = () => {
  const { isLoggedIn, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is on login page and already authenticated, redirect to home
  if (isLoggedIn && location.pathname === '/login') {
    return <Navigate to="/" replace />
  }

  // If user is on login page, show login page
  if (location.pathname === '/login') {
    return <LoginPage />
  }

  // For all other routes, show the main app layout with protected routes
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sticky Left Navigation - Always Visible */}
        <Navigation />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <Header />
          
          {/* Dynamic Content Area */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/overview" element={<Navigate to="/" replace />} />
              <Route path="/altview" element={<AltviewPage />} />
              <Route path="/freddy-gpt" element={<FreddyGPTPage />} />
              <Route path="/insights" element={<div className="text-center py-12 text-gray-500">Insights Engine - Coming Soon</div>} />
              <Route path="/marketing-orchestration" element={<div className="text-center py-12 text-gray-500">Marketing Orchestration - Coming Soon</div>} />
              <Route path="/smart-investing" element={<div className="text-center py-12 text-gray-500">Smart Investing - Coming Soon</div>} />
              <Route path="/agency-ecosystem" element={<div className="text-center py-12 text-gray-500">Agency Ecosystem - Coming Soon</div>} />
              <Route path="/how-to-use-ai" element={<div className="text-center py-12 text-gray-500">How to use AI - Coming Soon</div>} />
              {/* Catch all route - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

function App() {
  return (
    <AuthProvider>
      <UserSessionProvider>
        <Router>
          <AppContent />
        </Router>
      </UserSessionProvider>
    </AuthProvider>
  )
}

export default App
