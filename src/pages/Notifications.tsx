import React, { useEffect } from 'react'
import { Bell, User, Heart, MessageCircle, UserPlus, Check, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { useNotificationStore } from '../store/notificationStore'

export function Notifications() {
  const { notifications, loading, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore()

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow_request':
        return <UserPlus className="h-5 w-5 text-blue-600" />
      case 'new_post':
        return <Bell className="h-5 w-5 text-green-600" />
      case 'post_like':
        return <Heart className="h-5 w-5 text-red-600" />
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-purple-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'follow_request':
        return 'bg-blue-100'
      case 'new_post':
        return 'bg-green-100'
      case 'post_like':
        return 'bg-red-100'
      case 'comment':
        return 'bg-purple-100'
      default:
        return 'bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-600">You're all caught up! Check back later for updates.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow ${
                !notification.read ? 'border-l-4 border-l-blue-600' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getNotificationBg(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1">
                  <p className={`text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                    {notification.message}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  {notification.type === 'follow_request' && (
                    <>
                      <button className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors">
                        <Check className="h-4 w-4" />
                      </button>
                      <button className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-blue-600 text-sm font-medium hover:text-blue-700"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}