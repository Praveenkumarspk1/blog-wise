import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string
          full_name: string
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          full_name: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          full_name?: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
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
        }
        Insert: {
          id?: string
          title: string
          content: string
          summary?: string | null
          visibility?: 'public' | 'private' | 'followers'
          author_id: string
          created_at?: string
          updated_at?: string
          published?: boolean
          tags?: string[]
          slug: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          summary?: string | null
          visibility?: 'public' | 'private' | 'followers'
          author_id?: string
          created_at?: string
          updated_at?: string
          published?: boolean
          tags?: string[]
          slug?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
          status: 'pending' | 'accepted' | 'rejected'
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
          status?: 'pending' | 'accepted' | 'rejected'
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
          status?: 'pending' | 'accepted' | 'rejected'
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'follow_request' | 'new_post' | 'post_like' | 'comment'
          message: string
          read: boolean
          created_at: string
          related_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: 'follow_request' | 'new_post' | 'post_like' | 'comment'
          message: string
          read?: boolean
          created_at?: string
          related_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'follow_request' | 'new_post' | 'post_like' | 'comment'
          message?: string
          read?: boolean
          created_at?: string
          related_id?: string | null
        }
      }
    }
  }
}