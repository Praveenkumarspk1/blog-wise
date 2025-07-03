import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MarkdownEditor } from '../components/Editor/MarkdownEditor'
import { useBlogStore } from '../store/blogStore'

export function Write() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentPost, fetchPostBySlug } = useBlogStore()
  const [loading, setLoading] = useState(!!id)

  useEffect(() => {
    if (id) {
      fetchPostBySlug(id).then(() => setLoading(false))
    }
  }, [id, fetchPostBySlug])

  const handleSave = () => {
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-white">
      <MarkdownEditor
        initialContent={currentPost?.content || ''}
        initialTitle={currentPost?.title || ''}
        postId={currentPost?.id}
        onSave={handleSave}
      />
    </div>
  )
}