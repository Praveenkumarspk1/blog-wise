import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { geminiService } from '../lib/gemini'

interface Post {
  id: string
  title: string
  content: string
  summary: string | null
  visibility: 'public' | 'private' | 'followers'
  author_id: string
  created_at: string
  updated_at: string
  published: boolean
  tags: string[]
  slug: string
  profiles?: {
    username: string
    full_name: string
    avatar_url: string | null
  }
}

interface BlogState {
  posts: Post[]
  currentPost: Post | null
  loading: boolean
  drafts: Post[]
  fetchPosts: () => Promise<void>
  fetchUserPosts: (userId: string) => Promise<void>
  createPost: (post: Omit<Post, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updatePost: (id: string, updates: Partial<Post>) => Promise<void>
  deletePost: (id: string) => Promise<void>
  fetchPostBySlug: (slug: string) => Promise<Post | null>
  generateSummary: (content: string) => Promise<string>
  generateBlogIdeas: (topic: string) => Promise<string[]>
  improveBlogContent: (content: string, improvement: string) => Promise<string>
  generateSEOKeywords: (title: string, content: string) => Promise<string[]>
  optimizeForSEO: (title: string, content: string) => Promise<{
    optimizedTitle: string
    metaDescription: string
    keywords: string[]
    suggestions: string[]
  }>
}

export const useBlogStore = create<BlogState>((set, get) => ({
  posts: [],
  currentPost: null,
  loading: false,
  drafts: [],

  fetchPosts: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('published', true)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })

    if (error) throw error
    set({ posts: data || [], loading: false })
  },

  fetchUserPosts: async (userId: string) => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('author_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    set({ posts: data || [], loading: false })
  },

  createPost: async (post) => {
    const { data, error } = await supabase
      .from('posts')
      .insert(post)
      .select()
      .single()

    if (error) throw error
    
    const { posts } = get()
    set({ posts: [data, ...posts] })
  },

  updatePost: async (id: string, updates) => {
    const { data, error } = await supabase
      .from('posts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    const { posts } = get()
    set({
      posts: posts.map(post => post.id === id ? data : post),
      currentPost: data
    })
  },

  deletePost: async (id: string) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) throw error

    const { posts } = get()
    set({ posts: posts.filter(post => post.id !== id) })
  },

  fetchPostBySlug: async (slug: string) => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('slug', slug)
      .single()

    if (error) return null
    set({ currentPost: data })
    return data
  },

  generateSummary: async (content: string) => {
    return await geminiService.generateBlogSummary(content)
  },

  generateBlogIdeas: async (topic: string) => {
    return await geminiService.generateBlogIdeas(topic)
  },

  improveBlogContent: async (content: string, improvement: string) => {
    return await geminiService.improveBlogContent(content, improvement)
  },

  generateSEOKeywords: async (title: string, content: string) => {
    return await geminiService.generateSEOKeywords(title, content)
  },

  optimizeForSEO: async (title: string, content: string) => {
    return await geminiService.optimizeForSEO(title, content)
  },
}))