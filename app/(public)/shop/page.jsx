'use client'
import { Suspense, useState } from "react"
import ProductCard from "@/components/ProductCard"
import ShopFilters from "@/components/ShopFilters"
import { SlidersHorizontal, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"

function ShopContent() {
  const searchParams = useSearchParams()
  const search = searchParams.get('search')
  const router = useRouter()

  const products = useSelector(state => state.product.list)

  const [filters, setFilters] = useState({
    category: [],
    brand: [],
    condition: [],
    priceRange: null,
    sold: []
  })
  const [sortBy, setSortBy] = useState('newest')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // Filtering
  const filteredProducts = products.filter(product => {
    if (
      search &&
      !product.name.toLowerCase().includes(search.toLowerCase()) &&
      !product.description.toLowerCase().includes(search.toLowerCase()) &&
      !product.brand.toLowerCase().includes(search.toLowerCase())
    ) {
      return false
    }

    if (filters.category.length > 0 && !filters.category.includes(product.category)) {
      return false
    }

    if (filters.brand.length > 0 && !filters.brand.includes(product.brand)) {
      return false
    }

    if (filters.condition.length > 0 && !filters.condition.includes(product.condition)) {
      return false
    }

    if (filters.priceRange) {
      const price = product.price
      if (price < filters.priceRange.min || price > filters.priceRange.max) {
        return false
      }
    }

    if (filters.sold && filters.sold.length > 0) {
      const productSold = product.sold || false
      if (!filters.sold.includes(productSold)) {
        return false
      }
    }

    return true
  })

  // Sorting with sold last
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aSold = a.sold || false
    const bSold = b.sold || false

    if (aSold !== bSold) {
      return aSold ? 1 : -1
    }

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

  const activeFilterCount =
    filters.category.length +
    filters.brand.length +
    filters.condition.length +
    (filters.priceRange ? 1 : 0) +
    filters.sold.length

  return (
    <div className="min-h-[70vh] bg-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
          <h1 className="text-xl sm:text-2xl text-slate-700 flex items-center gap-2 flex-wrap">
            <span>All</span>
            <span className="text-slate-900 font-medium">Products</span>
            <span className="text-xs sm:text-sm text-gray-400">
              ({sortedProducts.length})
            </span>
          </h1>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 sm:px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-black bg-white flex-shrink-0"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            {/* Mobile filter button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm hover:bg-gray-50 transition bg-white flex-shrink-0"
            >
              <SlidersHorizontal size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Filters</span>
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
          <div className="mb-4 w-full overflow-hidden">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs sm:text-sm max-w-full">
              <span className="whitespace-nowrap">Searching for:</span>
              <strong className="truncate max-w-[200px] sm:max-w-none">{search}</strong>
              <button
                onClick={handleClearSearch}
                className="hover:bg-gray-200 rounded-full p-0.5 flex-shrink-0"
              >
                <X size={14} />
              </button>
            </span>
          </div>
        )}

        <div className="flex gap-6 lg:gap-8 w-full min-w-0">
          {/* Desktop Filters Sidebar */}
          <div className="hidden md:block w-64 shrink-0">
            <ShopFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              isMobileOpen={isMobileFilterOpen}
              onMobileClose={() => setIsMobileFilterOpen(false)}
            />
          </div>

          {/* Products Grid */}
          <div className="flex-1 min-w-0 w-full">
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
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-28 w-full">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Drawer (overlay) */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            {/* Dim background */}
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            {/* Drawer */}
            <div className="absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <div className="text-sm font-medium text-slate-900">
                  Filters
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-4">
                <ShopFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                  isMobileOpen={isMobileFilterOpen}
                  onMobileClose={() => setIsMobileFilterOpen(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Shop() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center bg-white">
          <p className="text-gray-500 text-sm">Loading shop…</p>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  )
}
