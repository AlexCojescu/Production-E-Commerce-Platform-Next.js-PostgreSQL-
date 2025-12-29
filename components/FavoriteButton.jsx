'use client'
import { Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function FavoriteButton({ productId, initialIsFavorited = false, size = 20, variant = 'default', onToggle }) {
  const { getToken, userId } = useAuth()
  const router = useRouter()
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited)
  const [isLoading, setIsLoading] = useState(false)

  // Sync with initialIsFavorited prop changes
  useEffect(() => {
    setIsFavorited(initialIsFavorited)
  }, [initialIsFavorited])

  const toggleFavorite = async (e) => {
    e.preventDefault() // Prevent navigation if inside <Link>
    e.stopPropagation()

    if (!userId) {
      toast.error('Please login to save favorites')
      return
    }

    setIsLoading(true)
    const previousState = isFavorited
    const optimisticState = !isFavorited
    setIsFavorited(optimisticState) // Optimistic update

    try {
      const token = await getToken()
      const { data } = await axios.post(
        '/api/user/favorites/toggle',
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setIsFavorited(data.isFavorited)
      
      // Notify parent component with final state from server
      // Only call if state changed from previous state
      if (onToggle && data.isFavorited !== previousState) {
        onToggle(data.isFavorited)
      }
      
      toast.success(data.message)
    } catch (error) {
      setIsFavorited(previousState) // Revert on error
      
      toast.error(error?.response?.data?.error || 'Failed to update')
    } finally {
      setIsLoading(false)
    }
  }

  const isInline = variant === 'inline'

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`
        transition-all duration-200
        ${isInline
          ? 'p-1 hover:opacity-70'
          : 'p-2 rounded-full backdrop-blur-sm ' +
            (isFavorited
          ? 'bg-white/90 hover:bg-white shadow-md'
          : 'bg-white/70 hover:bg-white/90 shadow-sm'
            ) +
            (isLoading ? ' opacity-50 cursor-not-allowed' : ' hover:shadow-lg')
        }
      `}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        size={size}
        className={`transition-all ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
      />
    </button>
  )
}
