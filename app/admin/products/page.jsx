'use client'
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import axios from "axios"
import { useUser, useAuth } from "@clerk/nextjs"
import Image from "next/image"
import { Search, Trash2, Filter, X } from "lucide-react"

export default function AdminProducts() {
    const { user } = useUser()
    const { getToken } = useAuth()

    const [products, setProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all') // 'all', 'available', 'sold'
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const fetchProducts = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/admin/products', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const sorted = data.products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            setProducts(sorted)
            setFilteredProducts(sorted)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
        setLoading(false)
    }

    // Filter products based on search and status
    useEffect(() => {
        let filtered = [...products]

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(query) ||
                product.brand?.toLowerCase().includes(query) ||
                product.store?.name?.toLowerCase().includes(query) ||
                product.category?.toLowerCase().includes(query)
            )
        }

        // Apply status filter
        if (statusFilter === 'sold') {
            filtered = filtered.filter(product => product.sold)
        } else if (statusFilter === 'available') {
            filtered = filtered.filter(product => !product.sold)
        }

        setFilteredProducts(filtered)
    }, [searchQuery, statusFilter, products])

    const toggleSold = async (productId) => {
        try {
            const token = await getToken()
            const { data } = await axios.post('/api/admin/toggle-sold', { productId }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            await fetchProducts()
            toast.success(data.message)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    const deleteProduct = async (productId) => {
        try {
            const token = await getToken()
            await axios.delete('/api/admin/delete-product', {
                headers: { Authorization: `Bearer ${token}` },
                data: { productId }
            })
            await fetchProducts()
            setDeleteConfirm(null)
            toast.success('Product deleted successfully')
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
            setDeleteConfirm(null)
        }
    }

    useEffect(() => {
        if (user) {
            fetchProducts()
        }
    }, [user])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500 mb-28">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl">Manage <span className="text-slate-800 font-medium">Products</span></h1>
                <div className="text-sm text-slate-600">
                    Total: <span className="font-semibold">{products.length}</span> products
                    {filteredProducts.length !== products.length && (
                        <> • Showing: <span className="font-semibold">{filteredProducts.length}</span></>
                    )}
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, brand, store, or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 text-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 text-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="available">Available</option>
                            <option value="sold">Sold</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            {filteredProducts.length ? (
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-gray-700 uppercase tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Product</th>
                                    <th className="px-4 py-3 font-semibold hidden lg:table-cell">Brand</th>
                                    <th className="px-4 py-3 font-semibold hidden md:table-cell">Store</th>
                                    <th className="px-4 py-3 font-semibold hidden md:table-cell">Price</th>
                                    <th className="px-4 py-3 font-semibold text-center">Status</th>
                                    <th className="px-4 py-3 font-semibold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-700 divide-y divide-slate-200">
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex gap-3 items-center">
                                                <Image
                                                    width={50}
                                                    height={50}
                                                    className="rounded-lg object-cover border border-slate-200"
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                />
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-medium text-slate-800 truncate">{product.name}</span>
                                                    <span className="text-xs text-slate-500 lg:hidden">{product.brand || 'N/A'}</span>
                                                    <span className="text-xs text-slate-400 md:hidden">{product.category}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-slate-600 hidden lg:table-cell">
                                            <span className="font-medium">{product.brand || 'N/A'}</span>
                                        </td>
                                        <td className="px-4 py-4 text-slate-600 hidden md:table-cell">
                                            <span className="text-sm">{product.store?.name || 'N/A'}</span>
                                        </td>
                                        <td className="px-4 py-4 hidden md:table-cell">
                                            <span className="font-semibold">{currency}{product.price.toLocaleString()}</span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span
                                                className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full ${
                                                    product.sold
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-green-100 text-green-800'
                                                }`}
                                            >
                                                {product.sold ? 'SOLD' : 'Available'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center gap-3">
                                                {/* Toggle Sold Status */}
                                                <label className="relative inline-flex items-center cursor-pointer" title={product.sold ? "Mark as Available" : "Mark as Sold"}>
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        onChange={() => toggleSold(product.id)}
                                                        checked={product.sold}
                                                    />
                                                    <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-red-600 transition-colors duration-200"></div>
                                                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                                                </label>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => setDeleteConfirm(product.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete product"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-lg p-16 text-center">
                    <p className="text-xl text-slate-400 font-medium">
                        {searchQuery || statusFilter !== 'all' 
                            ? 'No products match your filters' 
                            : 'No products available'}
                    </p>
                    {(searchQuery || statusFilter !== 'all') && (
                        <button
                            onClick={() => {
                                setSearchQuery('')
                                setStatusFilter('all')
                            }}
                            className="mt-4 text-slate-600 hover:text-slate-800 underline text-sm"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Delete Product</h3>
                        <p className="text-slate-600 mb-6">
                            Are you sure you want to delete this product? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteProduct(deleteConfirm)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

