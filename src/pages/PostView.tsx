import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, User, Tag, Heart, MessageCircle, Share2, Bookmark, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useBlogStore } from '../store/blogStore'

export function PostView() {
  const { slug } = useParams()
  const { currentPost, fetchPostBySlug } = useBlogStore()
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    if (slug) {
      fetchPostBySlug(slug).then(() => setLoading(false))
    }
  }, [slug, fetchPostBySlug])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="h-12 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-24"></div>
              <div className="h-3 bg-gray-300 rounded w-16"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentPost) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h1>
        <Link to="/" className="text-blue-600 hover:text-blue-700">
          Return to home
        </Link>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to posts</span>
      </Link>

      {/* Post Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
          {currentPost.title}
        </h1>

        {/* Author Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              {currentPost.profiles?.avatar_url ? (
                <img
                  src={currentPost.profiles.avatar_url}
                  alt={currentPost.profiles.full_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <Link
                to={`/profile/${currentPost.profiles?.username}`}
                className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {currentPost.profiles?.full_name}
              </Link>
              <div className="flex items-center space-x-2 text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>{formatDistanceToNow(new Date(currentPost.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setLiked(!liked)}
              className={`p-3 rounded-full transition-colors ${
                liked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
              }`}
            >
              <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
            </button>
            <button className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors">
              <MessageCircle className="h-5 w-5" />
            </button>
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={`p-3 rounded-full transition-colors ${
                bookmarked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-600'
              }`}
            >
              <Bookmark className={`h-5 w-5 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
            <button className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-green-100 hover:text-green-600 transition-colors">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tags */}
        {currentPost.tags && currentPost.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {currentPost.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Post Content */}
      <article className="prose prose-lg max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({node, inline, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <SyntaxHighlighter
                  style={tomorrow}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            }
          }}
        >
          {currentPost.content}
        </ReactMarkdown>
      </article>

      {/* Post Footer */}
      <footer className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setLiked(!liked)}
              className={`flex items-center space-x-2 transition-colors ${
                liked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
              }`}
            >
              <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
              <span>{liked ? '25' : '24'} likes</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
              <MessageCircle className="h-5 w-5" />
              <span>8 comments</span>
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {Math.floor(Math.random() * 1000) + 100} views
          </div>
        </div>
      </footer>
    </motion.div>
  )
}