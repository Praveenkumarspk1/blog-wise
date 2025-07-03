import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface Notification {
  id: string
  user_id: string
  type: 'follow_request' | 'new_post' | 'post_like' | 'comment'
  message: string
  read: boolean
  created_at: string
  related_id: string | null
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  loading: false
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  createNotification: (notification: Omit<Notification, 'id' | 'created_at'>) => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    
    const unreadCount = data?.filter(n => !n.read).length || 0
    set({ 
      notifications: data || [], 
      unreadCount,
      loading: false 
    })
  },

  markAsRead: async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)

    if (error) throw error

    const { notifications } = get()
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    )
    const unreadCount = updatedNotifications.filter(n => !n.read).length
    
    set({ 
      notifications: updatedNotifications,
      unreadCount 
    })
  },

  markAllAsRead: async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false)

    if (error) throw error

    const { notifications } = get()
    set({ 
      notifications: notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0 
    })
  },

  createNotification: async (notification) => {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single()

    if (error) throw error

    const { notifications } = get()
    set({ 
      notifications: [data, ...notifications],
      unreadCount: get().unreadCount + 1
    })
  },
}))