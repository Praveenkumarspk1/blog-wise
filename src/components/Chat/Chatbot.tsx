import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, X, Minimize2, Maximize2, Sparkles, Lightbulb, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { geminiService } from '../../lib/gemini'
import { useBlogStore } from '../../store/blogStore'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  isTyping?: boolean
}

interface ChatbotProps {
  isOpen: boolean
  onClose: () => void
  isMinimized: boolean
  onToggleMinimize: () => void
}

const quickActions = [
  { icon: Lightbulb, text: "Generate blog ideas", action: "ideas" },
  { icon: Sparkles, text: "Improve my content", action: "improve" },
  { icon: Search, text: "SEO optimization tips", action: "seo" },
]

export function Chatbot({ isOpen, onClose, isMinimized, onToggleMinimize }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your AI-powered blog assistant. I can help you with writing, generating ideas, improving content, SEO optimization, and much more. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentTopic, setCurrentTopic] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { generateBlogIdeas, improveBlogContent, generateSEOKeywords } = useBlogStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleQuickAction = async (action: string) => {
    let prompt = ''
    switch (action) {
      case 'ideas':
        prompt = 'Generate 5 creative blog post ideas for technology and web development'
        break
      case 'improve':
        prompt = 'How can I make my blog content more engaging and professional?'
        break
      case 'seo':
        prompt = 'Give me actionable SEO tips to improve my blog\'s search rankings'
        break
    }
    
    if (prompt) {
      await handleSend(prompt)
    }
  }

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input
    if (!textToSend.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: textToSend,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      // Check if user is asking for blog ideas
      if (textToSend.toLowerCase().includes('blog ideas') || textToSend.toLowerCase().includes('topic ideas')) {
        const topic = textToSend.replace(/.*(?:blog ideas|topic ideas).*?(?:about|for|on)\s*/i, '') || 'general'
        setCurrentTopic(topic)
        const ideas = await generateBlogIdeas(topic)
        
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: `Here are some creative blog post ideas about "${topic}":\n\n${ideas.map((idea, index) => `${index + 1}. ${idea}`).join('\n')}`,
          isUser: false,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botResponse])
      } 
      // Check if user wants to improve content
      else if (textToSend.toLowerCase().includes('improve') && textToSend.length > 100) {
        const improved = await improveBlogContent(textToSend, 'make it more engaging and professional')
        
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: `Here's an improved version of your content:\n\n${improved}`,
          isUser: false,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botResponse])
      }
      // Use Gemini for general chat
      else {
        const context = currentTopic ? `Current topic context: ${currentTopic}` : undefined
        const response = await geminiService.chatResponse(textToSend, context)
        
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: response,
          isUser: false,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botResponse])
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error. Please try again or rephrase your question.",
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl border border-gray-200 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      } transition-all duration-300 z-50`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Blog Assistant</h3>
            <p className="text-xs text-gray-500">Powered by Gemini AI</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={onToggleMinimize}
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="p-4 border-b border-gray-100">
              <p className="text-sm text-gray-600 mb-3">Quick actions:</p>
              <div className="space-y-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.action)}
                    className="w-full flex items-center space-x-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <action.icon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">{action.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-96">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-xs ${
                    message.isUser ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.isUser ? 'bg-blue-600' : 'bg-gradient-to-br from-blue-600 to-purple-600'
                    }`}>
                      {message.isUser ? (
                        <User className="h-3 w-3 text-white" />
                      ) : (
                        <Bot className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div className={`p-3 rounded-lg text-sm whitespace-pre-wrap ${
                      message.isUser 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {message.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="h-3 w-3 text-white" />
                  </div>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about blogging..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}