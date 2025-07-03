import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Components
import { Header } from './components/Layout/Header'
import { Sidebar } from './components/Layout/Sidebar'
import { SignIn } from './components/Auth/SignIn'
import { SignUp } from './components/Auth/SignUp'
import { Home } from './pages/Home'
import { Write } from './pages/Write'
import { Profile } from './pages/Profile'
import { Dashboard } from './pages/Dashboard'
import { Explore } from './pages/Explore'
import { Following } from './pages/Following'
import { PostView } from './pages/PostView'
import { Notifications } from './pages/Notifications'
import { Settings } from './pages/Settings'
import { Chat } from './pages/Chat'
import { Chatbot } from './components/Chat/Chatbot'

// Stores
import { useAuthStore } from './store/authStore'

function App() {
  const { user, loading } = useAuthStore()
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMinimized, setChatMinimized] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        
        <Routes>
          <Route path="/signin" element={!user ? <SignIn /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/" />} />
          <Route path="/*" element={
            <>
              <Header />
              <div className="flex">
                <Sidebar />
                <main className={`flex-1 ${user ? 'ml-64' : ''} pt-4`}>
                  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/explore" element={<Explore />} />
                      <Route path="/following" element={user ? <Following /> : <Navigate to="/signin" />} />
                      <Route path="/write" element={user ? <Write /> : <Navigate to="/signin" />} />
                      <Route path="/write/:id" element={user ? <Write /> : <Navigate to="/signin" />} />
                      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/signin" />} />
                      <Route path="/profile/:username" element={<Profile />} />
                      <Route path="/post/:slug" element={<PostView />} />
                      <Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/signin" />} />
                      <Route path="/settings" element={user ? <Settings /> : <Navigate to="/signin" />} />
                      <Route path="/chat" element={user ? <Chat /> : <Navigate to="/signin" />} />
                    </Routes>
                  </div>
                </main>
              </div>

              {/* Floating Chat Button */}
              {user && !chatOpen && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setChatOpen(true)}
                  className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-40"
                >
                  <MessageCircle className="h-6 w-6" />
                </motion.button>
              )}

              {/* Chatbot */}
              <AnimatePresence>
                {user && chatOpen && (
                  <Chatbot
                    isOpen={chatOpen}
                    onClose={() => setChatOpen(false)}
                    isMinimized={chatMinimized}
                    onToggleMinimize={() => setChatMinimized(!chatMinimized)}
                  />
                )}
              </AnimatePresence>
            </>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App