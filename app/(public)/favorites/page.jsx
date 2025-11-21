'use client'
import { useState, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import axios from 'axios'
import ProductCard from '@/components/ProductCard'
import Loading from '@/components/Loading'
import toast from 'react-hot-toast'
import { Heart } from 'lucide-react'
import Link from 'next/link'

export default function FavoritesPage() {
  const { getToken, userId } = useAuth()
  const { user } = useUser()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchFavorites()
    } else if (userId === undefined) {
      // Still checking auth
      return
    } else {
      // Not logged in
      setLoading(false)
    }
  }, [user, userId])

  const fetchFavorites = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get('/api/user/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setFavorites(data.favorites)
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />

  if (!userId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <Heart size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-medium text-gray-700">Login to see favorites</h2>
        <p className="text-gray-500 mt-2 text-center">Save your favorite items and access them anytime</p>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <Heart size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-medium text-gray-700">No favorites yet</h2>
        <p className="text-gray-500 mt-2 text-center">Start exploring and save your favorite items</p>
        <Link
          href="/shop"
          className="mt-6 px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] mx-6 my-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Heart size={28} className="fill-red-500 text-red-500" />
          <h1 className="text-2xl text-slate-700 font-medium">
            My Favorites ({favorites.length})
          </h1>
        </div>

        <div className="grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12">
          {favorites.map((fav) => (
            <ProductCard
              key={fav.productId}
              product={{ ...fav.product, isFavorited: true }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
