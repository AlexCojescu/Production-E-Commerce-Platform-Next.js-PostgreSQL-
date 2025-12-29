'use client'
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import axios from "axios"
import { useUser, useAuth } from "@clerk/nextjs"
import Image from "next/image"
import { Trash2, ShoppingBag, Star, MapPin, Heart } from "lucide-react"

export default function AdminUsers() {
    const { user } = useUser()
    const { getToken } = useAuth()

    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchUsers = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setUsers(data.users)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
        setLoading(false)
    }

    const deleteUser = async (userId, userName) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete user "${userName}"?\n\nThis will permanently delete:\n- The user account\n- All orders\n- All ratings\n- All addresses\n- All favorites\n- Associated store (if any)\n- All store products and orders\n\nThis action cannot be undone.`
        )

        if (!confirmed) return

        try {
            const token = await getToken()
            const { data } = await axios.post('/api/admin/delete-user', { userToDeleteId: userId }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            await fetchUsers()
            toast.success(data.message || 'User deleted successfully')
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    useEffect(() => {
        if (user) {
            fetchUsers()
        }
    }, [user])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500 mb-28 max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl">All <span className="text-slate-800 font-medium">Users</span></h1>
                    <p className="text-sm text-slate-400 mt-1">Total Users: {users.length}</p>
                </div>
            </div>

            {users.length ? (
                <div className="flex flex-col gap-6">
                    {users.map((userData) => (
                        <div key={userData.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6 transition-shadow hover:shadow-md">
                            
                            {/* Top Section: Split into 3 columns on Large screens, Stacked on Mobile */}
                            <div className="flex flex-col lg:flex-row gap-6">
                                
                                {/* Col 1: User Basic Info */}
                                <div className="flex-1 flex flex-row items-start gap-4">
                                    <div className="shrink-0">
                                        <Image
                                            width={80}
                                            height={80}
                                            src={userData.image || '/default-avatar.png'}
                                            alt={userData.name}
                                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg sm:text-xl font-bold text-slate-800 truncate">{userData.name}</h3>
                                        <p className="text-sm text-slate-600 truncate">{userData.email}</p>
                                        <p className="text-xs text-slate-400 mt-1 font-mono break-all">ID: {userData.id}</p>
                                        
                                        <button
                                            onClick={() => deleteUser(userData.id, userData.name)}
                                            className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium"
                                        >
                                            <Trash2 size={14} />
                                            Delete User
                                        </button>
                                    </div>
                                </div>

                                {/* Col 2: Store Information */}
                                <div className="flex-1 lg:border-l lg:border-t-0 border-t border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                                    <h4 className="font-semibold text-slate-800 mb-3 text-sm uppercase tracking-wide">Store Details</h4>
                                    {userData.store ? (
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Name:</span>
                                                <span className="font-medium text-slate-700">{userData.store.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Handle:</span>
                                                <span className="font-medium text-slate-700">@{userData.store.username}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500">Status:</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                    userData.store.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    userData.store.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {userData.store.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500">Active:</span>
                                                <div className={`w-2 h-2 rounded-full ${userData.store.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center lg:justify-start">
                                            <p className="text-sm text-slate-400 italic">No store registered</p>
                                        </div>
                                    )}
                                </div>

                                {/* Col 3: Statistics */}
                                <div className="flex-1 lg:border-l lg:border-t-0 border-t border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                                    <h4 className="font-semibold text-slate-800 mb-3 text-sm uppercase tracking-wide">Activity Stats</h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="bg-slate-50 p-2 rounded flex flex-col items-center justify-center">
                                            <ShoppingBag size={16} className="text-slate-400 mb-1" />
                                            <span className="font-bold text-slate-700">{userData._count.buyerOrders}</span>
                                            <span className="text-[10px] text-slate-500">Orders</span>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded flex flex-col items-center justify-center">
                                            <Star size={16} className="text-slate-400 mb-1" />
                                            <span className="font-bold text-slate-700">{userData._count.ratings}</span>
                                            <span className="text-[10px] text-slate-500">Ratings</span>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded flex flex-col items-center justify-center">
                                            <MapPin size={16} className="text-slate-400 mb-1" />
                                            <span className="font-bold text-slate-700">{userData._count.Address}</span>
                                            <span className="text-[10px] text-slate-500">Addresses</span>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded flex flex-col items-center justify-center">
                                            <Heart size={16} className="text-slate-400 mb-1" />
                                            <span className="font-bold text-slate-700">{userData._count.favoriteProducts}</span>
                                            <span className="text-[10px] text-slate-500">Favorites</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Section: Cart & Recent Orders */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-100">
                                
                                {/* Cart Info */}
                                <div>
                                    <h4 className="font-semibold text-slate-700 mb-2 text-xs uppercase">Current Cart</h4>
                                    <div className="bg-slate-900 rounded-lg p-3 w-full">
                                        <pre className="text-xs text-slate-300 font-mono overflow-x-auto overflow-y-auto max-h-32 scrollbar-thin scrollbar-thumb-slate-700">
                                            {JSON.stringify(userData.cart, null, 2)}
                                        </pre>
                                    </div>
                                </div>

                                {/* Recent Orders */}
                                <div>
                                    <h4 className="font-semibold text-slate-700 mb-2 text-xs uppercase">
                                        Recent Orders ({userData.buyerOrders?.length || 0})
                                    </h4>
                                    {userData.buyerOrders && userData.buyerOrders.length > 0 ? (
                                        <div className="space-y-2">
                                            {userData.buyerOrders.slice(0, 3).map((order) => (
                                                <div key={order.id} className="text-xs bg-slate-50 border border-slate-100 p-2.5 rounded-md flex justify-between items-center">
                                                    <span className="text-slate-500 font-mono">#{order.id.slice(0, 8)}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-semibold text-slate-700">${order.total}</span>
                                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                            order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                                                            order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-md border border-slate-100">
                                            No recent orders found.
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 sm:h-80 border-2 border-dashed border-slate-200 rounded-xl">
                    <p className="text-lg text-slate-400 font-medium">No users found</p>
                </div>
            )}
        </div>
    )
}