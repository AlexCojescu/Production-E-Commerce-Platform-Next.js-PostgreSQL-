'use client'
import { Suspense, useState } from "react"
import ProductCard from "@/components/ProductCard"
import ShopFilters from "@/components/ShopFilters"
import { SlidersHorizontal, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"

 function ShopContent() {

    // get query params ?search=abc
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const router = useRouter()

    const products = useSelector(state => state.product.list)

    // Filter state
    const [filters, setFilters] = useState({
        category: [],
        brand: [],
        condition: [],
        priceRange: null,
        sold: []
    })
    const [sortBy, setSortBy] = useState('newest')
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

    // Apply filters and search
    const filteredProducts = products.filter(product => {
        // Search filter
        if (search && !product.name.toLowerCase().includes(search.toLowerCase()) &&
            !product.description.toLowerCase().includes(search.toLowerCase()) &&
            !product.brand.toLowerCase().includes(search.toLowerCase())) {
            return false
        }

        // Category filter
        if (filters.category.length > 0 && !filters.category.includes(product.category)) {
            return false
        }

        // Brand filter
        if (filters.brand.length > 0 && !filters.brand.includes(product.brand)) {
            return false
        }

        // Condition filter
        if (filters.condition.length > 0 && !filters.condition.includes(product.condition)) {
            return false
        }

        // Price range filter
        if (filters.priceRange) {
            const price = product.price
            if (price < filters.priceRange.min || price > filters.priceRange.max) {
                return false
            }
        }

        // Sold filter
        if (filters.sold && filters.sold.length > 0) {
            const productSold = product.sold || false
            if (!filters.sold.includes(productSold)) {
                return false
            }
        }

        return true
    })

    // Apply sorting - sold items always at the bottom
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        // First, separate sold and non-sold items
        const aSold = a.sold || false
        const bSold = b.sold || false
        
        // If one is sold and the other isn't, non-sold comes first
        if (aSold !== bSold) {
            return aSold ? 1 : -1
        }
        
        // If both have the same sold status, apply the selected sort
        switch (sortBy) {
            case 'price-low':
                return a.price - b.price
            case 'price-high':
                return b.price - a.price
            case 'newest':
                return new Date(b.createdAt) - new Date(a.createdAt)
            default:
                return 0
        }
    })

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }))
    }

    const handleClearFilters = () => {
        setFilters({
            category: [],
            brand: [],
            condition: [],
            priceRange: null,
            sold: []
        })
    }

    const handleClearSearch = () => {
        router.push('/shop')
    }

    // Count active filters
    const activeFilterCount = filters.category.length + filters.brand.length +
                              filters.condition.length + (filters.priceRange ? 1 : 0) +
                              filters.sold.length

    return (
        <div className="min-h-[70vh] mx-6 my-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl text-slate-500 flex items-center gap-2">
                        All <span className="text-slate-700 font-medium">Products</span>
                        <span className="text-sm text-gray-500">({sortedProducts.length})</span>
                    </h1>

                    {/* Sort dropdown */}
                    <div className="flex items-center gap-3">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        >
                            <option value="newest">Newest</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                        </select>

                        {/* Mobile filter button */}
                        <button
                            onClick={() => setIsMobileFilterOpen(true)}
                            className="md:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition"
                        >
                            <SlidersHorizontal size={16} />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Active search badge */}
                {search && (
                    <div className="mb-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
                            Searching for: <strong>{search}</strong>
                            <button onClick={handleClearSearch} className="hover:bg-gray-200 rounded-full p-0.5">
                                <X size={14} />
                            </button>
                        </span>
                    </div>
                )}

                {/* Main content with sidebar */}
                <div className="flex gap-6">
                    {/* Desktop Filters Sidebar */}
                    <ShopFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                        isMobileOpen={isMobileFilterOpen}
                        onMobileClose={() => setIsMobileFilterOpen(false)}
                    />

                    {/* Products Grid */}
                    <div className="flex-1">
                        {sortedProducts.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-gray-500 text-lg">No products found</p>
                                <button
                                    onClick={handleClearFilters}
                                    className="mt-4 text-black underline hover:no-underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
                                {sortedProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

    )
}


export default function Shop() {
  return (
    <Suspense fallback={<div>Loading shop.....</div>}>
      <ShopContent />
    </Suspense>
  );
}