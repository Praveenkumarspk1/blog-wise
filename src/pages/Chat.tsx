import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, BookOpen, Lightbulb, TrendingUp, Zap, Target, PenTool } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { geminiService } from '../lib/gemini'
import { useBlogStore } from '../store/blogStore'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

const quickPrompts = [
  { icon: BookOpen, text: "Generate blog ideas for technology", category: "Ideas", action: "ideas-tech" },
  { icon: Lightbulb, text: "Help me write a compelling introduction", category: "Writing", action: "intro-help" },
  { icon: TrendingUp, text: "How to improve my blog's SEO?", category: "SEO", action: "seo-tips" },
  { icon: Sparkles, text: "Make my content more engaging", category: "Engagement", action: "engagement" },
  { icon: Zap, text: "Generate content ideas for marketing", category: "Ideas", action: "ideas-marketing" },
  { icon: Target, text: "Optimize my blog post for keywords", category: "SEO", action: "keyword-optimization" },
  { icon: PenTool, text: "Improve my writing style", category: "Writing", action: "writing-style" },
  { icon: BookOpen, text: "Create a content calendar", category: "Planning", action: "content-calendar" }
]

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI-powered writing assistant, powered by Google's Gemini AI. I can help you with blog writing, content generation, SEO optimization, and much more. What would you like to work on today?",
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

  const handleQuickPrompt = async (action: string) => {
    let prompt = ''
    switch (action) {
      case 'ideas-tech':
        prompt = 'Generate 10 creative blog post ideas for technology and web development'
        break
      case 'ideas-marketing':
        prompt = 'Generate 10 blog post ideas for digital marketing and business growth'
        break
      case 'intro-help':
        prompt = 'Help me write a compelling introduction for my blog post. Give me a template and examples.'
        break
      case 'seo-tips':
        prompt = 'Give me comprehensive SEO tips to improve my blog\'s search rankings'
        break
      case 'engagement':
        prompt = 'How can I make my blog content more engaging and interactive for readers?'
        break
      case 'keyword-optimization':
        prompt = 'How do I optimize my blog posts for specific keywords without keyword stuffing?'
        break
      case 'writing-style':
        prompt = 'Help me improve my writing style to be more professional and engaging'
        break
      case 'content-calendar':
        prompt = 'Help me create a content calendar strategy for consistent blogging'
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
      // Check for specific actions
      if (textToSend.toLowerCase().includes('blog ideas') || textToSend.toLowerCase().includes('generate') && textToSend.toLowerCase().includes('ideas')) {
        const topic = textToSend.replace(/.*(?:blog ideas|ideas).*?(?:about|for|on)\s*/i, '') || 'general topics'
        setCurrentTopic(topic)
        const ideas = await generateBlogIdeas(topic)
        
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: `Here are some creative blog post ideas about "${topic}":\n\n${ideas.map((idea, index) => `${index + 1}. ${idea}`).join('\n')}\n\nWould you like me to help you develop any of these ideas further?`,
          isUser: false,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botResponse])
      } 
      // Check for content improvement
      else if (textToSend.toLowerCase().includes('improve') && textToSend.length > 100) {
        const improved = await improveBlogContent(textToSend, 'make it more engaging and professional')
        
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: `Here's an improved version of your content:\n\n${improved}\n\nWould you like me to make any other adjustments?`,
          isUser: false,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botResponse])
      }
      // Check for SEO keywords
      else if (textToSend.toLowerCase().includes('keywords') || textToSend.toLowerCase().includes('seo')) {
        if (textToSend.length > 50) {
          const keywords = await generateSEOKeywords('Blog Post', textToSend)
          
          const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: `Here are some SEO keywords for your content:\n\n${keywords.map((keyword, index) => `${index + 1}. ${keyword}`).join('\n')}\n\nRemember to use these naturally throughout your content!`,
            isUser: false,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, botResponse])
        } else {
          const response = await geminiService.chatResponse(textToSend, currentTopic ? `Current topic: ${currentTopic}` : undefined)
          
          const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: response,
            isUser: false,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, botResponse])
        }
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
        content: "I'm sorry, I encountered an error. Please try again or rephrase your question. I'm here to help with your blogging needs!",
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

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="bg-white rounded-t-lg shadow-sm border border-gray-200 p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Writing Assistant</h1>
            <p className="text-gray-600">Powered by Google Gemini AI - Your personal blogging companion</p>
          </div>
        </div>
      </div>

      {/* Quick Prompts */}
      {messages.length === 1 && (
        <div className="bg-white border-x border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Start</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickPrompts.map((prompt, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleQuickPrompt(prompt.action)}
                className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <prompt.icon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{prompt.text}</div>
                  <div className="text-sm text-gray-500">{prompt.category}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white border-x border-gray-200 p-6 space-y-6">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-3xl ${
                message.isUser ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.isUser 
                    ? 'bg-blue-600' 
                    : 'bg-gradient-to-br from-blue-500 to-purple-600'
                }`}>
                  {message.isUser ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className={`p-4 rounded-2xl ${
                  message.isUser 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
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
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="p-4 bg-gray-100 rounded-2xl">
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
      <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about blogging, writing, SEO, content ideas..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isTyping}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>Send</span>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Powered by Google Gemini AI • Ask for blog ideas, content improvement, SEO tips, and more!
        </p>
      </div>
    </div>
  )
}