import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { User, Calendar, MapPin, Link as LinkIcon, Edit, UserPlus, UserCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { useBlogStore } from '../store/blogStore'
import { useAuthStore } from '../store/authStore'

export function Profile() {
  const { username } = useParams()
  const { posts, loading, fetchUserPosts } = useBlogStore()
  const { user } = useAuthStore()
  const [following, setFollowing] = useState(false)
  const [profileData, setProfileData] = useState({
    id: '1',
    username: username || 'johndoe',
    full_name: 'John Doe',
    bio: 'Passionate writer and tech enthusiast. Love sharing stories about web development, design, and life.',
    avatar_url: null,
    created_at: '2024-01-01',
    followers_count: 1234,
    following_count: 567,
    posts_count: 42
  })

  useEffect(() => {
    // In a real app, fetch user profile by username
    // For now, we'll use mock data and fetch posts
    fetchUserPosts(profileData.id)
  }, [username, fetchUserPosts, profileData.id])

  const isOwnProfile = user?.id === profileData.id

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        
        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-16 mb-4">
            <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
              {profileData.avatar_url ? (
                <img
                  src={profileData.avatar_url}
                  alt={profileData.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-16 w-16 text-white" />
                </div>
              )}
            </div>
            
            {isOwnProfile ? (
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2">
                <Edit className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={() => setFollowing(!following)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  following
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {following ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                <span>{following ? 'Following' : 'Follow'}</span>
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{profileData.full_name}</h1>
              <p className="text-gray-600">@{profileData.username}</p>
            </div>
            
            {profileData.bio && (
              <p className="text-gray-700 text-lg">{profileData.bio}</p>
            )}
            
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDistanceToNow(new Date(profileData.created_at), { addSuffix: true })}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{profileData.posts_count}</div>
                <div className="text-sm text-gray-500">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{profileData.followers_count.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{profileData.following_count}</div>
                <div className="text-sm text-gray-500">Following</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isOwnProfile ? 'Your Posts' : `Posts by ${profileData.full_name}`}
        </h2>
        
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="space-y-3">
                  <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600">
              {isOwnProfile ? 'Start writing your first post!' : 'This user hasn\'t published any posts yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    post.published
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                
                {post.summary && (
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.summary}</p>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span>{Math.floor(Math.random() * 1000) + 50} views</span>
                    <span>{Math.floor(Math.random() * 50) + 5} likes</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}