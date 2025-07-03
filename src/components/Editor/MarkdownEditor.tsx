import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Eye, EyeOff, Save, Share, Globe, Lock, Users, Sparkles, Lightbulb, Search } from 'lucide-react'
import { useBlogStore } from '../../store/blogStore'
import { useAuthStore } from '../../store/authStore'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface MarkdownEditorProps {
  initialContent?: string
  initialTitle?: string
  postId?: string
  onSave?: () => void
}

export function MarkdownEditor({ 
  initialContent = '', 
  initialTitle = '',
  postId,
  onSave 
}: MarkdownEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [title, setTitle] = useState(initialTitle)
  const [showPreview, setShowPreview] = useState(false)
  const [visibility, setVisibility] = useState<'public' | 'private' | 'followers'>('public')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [showAITools, setShowAITools] = useState(false)

  const { createPost, updatePost, generateSummary, improveBlogContent, generateSEOKeywords } = useBlogStore()
  const { user } = useAuthStore()

  const handleSave = async (publish = false) => {
    if (!user || !title.trim() || !content.trim()) {
      toast.error('Please fill in title and content')
      return
    }

    setSaving(true)
    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const summary = await generateSummary(content)

      const postData = {
        title: title.trim(),
        content,
        summary,
        visibility,
        tags,
        slug: `${slug}-${Date.now()}`,
        author_id: user.id,
        published: publish
      }

      if (postId) {
        await updatePost(postId, postData)
        toast.success(publish ? 'Post published!' : 'Draft saved!')
      } else {
        await createPost(postData)
        toast.success(publish ? 'Post published!' : 'Draft saved!')
      }

      onSave?.()
    } catch (error) {
      toast.error('Failed to save post')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleImproveContent = async () => {
    if (!content.trim()) {
      toast.error('Please add some content first')
      return
    }

    setSaving(true)
    try {
      const improved = await improveBlogContent(content, 'make it more engaging, professional, and well-structured')
      setContent(improved)
      toast.success('Content improved with AI!')
    } catch (error) {
      toast.error('Failed to improve content')
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateKeywords = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please add title and content first')
      return
    }

    setSaving(true)
    try {
      const keywords = await generateSEOKeywords(title, content)
      const newTags = keywords.slice(0, 5).filter(keyword => !tags.includes(keyword))
      setTags([...tags, ...newTags])
      toast.success('SEO keywords generated!')
    } catch (error) {
      toast.error('Failed to generate keywords')
    } finally {
      setSaving(false)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const getVisibilityIcon = () => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4" />
      case 'private': return <Lock className="h-4 w-4" />
      case 'followers': return <Users className="h-4 w-4" />
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            placeholder="Enter your post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold border-none outline-none flex-1 mr-4"
          />
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAITools(!showAITools)}
              className="p-2 text-purple-600 hover:text-purple-700 rounded-lg hover:bg-purple-50 transition-colors"
              title="AI Tools"
            >
              <Sparkles className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {showPreview ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* AI Tools */}
        {showAITools && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200"
          >
            <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered Tools
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleImproveContent}
                disabled={saving}
                className="flex items-center space-x-2 px-3 py-2 bg-white border border-purple-300 rounded-lg text-purple-700 hover:bg-purple-100 transition-colors disabled:opacity-50"
              >
                <Lightbulb className="h-4 w-4" />
                <span>Improve Content</span>
              </button>
              <button
                onClick={handleGenerateKeywords}
                disabled={saving}
                className="flex items-center space-x-2 px-3 py-2 bg-white border border-purple-300 rounded-lg text-purple-700 hover:bg-purple-100 transition-colors disabled:opacity-50"
              >
                <Search className="h-4 w-4" />
                <span>Generate SEO Keywords</span>
              </button>
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Visibility Selector */}
            <div className="relative">
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="public">Public</option>
                <option value="followers">Followers Only</option>
                <option value="private">Private</option>
              </select>
              <div className="absolute right-2 top-3">
                {getVisibilityIcon()}
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Add tags..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddTag}
                className="text-blue-600 text-sm font-medium hover:text-blue-700"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Tags Display */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden">
        {!showPreview ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your amazing blog post..."
            className="w-full h-full p-6 resize-none border-none outline-none text-lg leading-relaxed font-mono"
          />
        ) : (
          <div className="w-full h-full overflow-auto">
            {showPreview && (
              <div className="flex h-full">
                <div className="w-1/2 p-6 border-r border-gray-200">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start writing your amazing blog post..."
                    className="w-full h-full resize-none border-none outline-none text-lg leading-relaxed font-mono"
                  />
                </div>
                <div className="w-1/2 p-6 overflow-auto">
                  <div className="prose prose-lg max-w-none">
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
                      {content || '*Start writing to see the preview...*'}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}