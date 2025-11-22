'use client'
import { X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

export default function ShopFilters({
  filters,
  onFilterChange,
  onClearFilters,
  isMobileOpen,
  onMobileClose
}) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    brand: true,
    condition: true,
    price: true
  })

  const categories = [
    "Tops",
    "Bottoms",
    "Outerwear",
    "Dresses",
    "Footwear",
    "Accessories"
  ]

  const brands = [
    "Balenciaga",
    "Vetements",
    "Rick Owens",
    "ERD (Enfants Riches Déprimés)",
    "Gucci",
    "Prada",
    "Acne Studios",
    "Other"
  ]

  const conditions = [
    "New with Tags (NWT)",
    "New without Tags (NWOT)",
    "Excellent (Pre-owned)",
    "Very Good (Pre-owned)",
    "Good (Pre-owned)",
    "Distressed / Vintage"
  ]

  const priceRanges = [
    { label: "Under $50", min: 0, max: 50 },
    { label: "$50 - $100", min: 50, max: 100 },
    { label: "$100 - $250", min: 100, max: 250 },
    { label: "$250 - $500", min: 250, max: 500 },
    { label: "$500+", min: 500, max: Infinity }
  ]

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleCheckboxChange = (filterType, value) => {
    const currentValues = filters[filterType] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]

    onFilterChange(filterType, newValues)
  }

  const handlePriceChange = (range) => {
    onFilterChange('priceRange', range)
  }

  const FilterSection = ({ title, items, filterKey, isExpanded }) => (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => toggleSection(filterKey)}
        className="w-full flex items-center justify-between text-left font-medium text-gray-900 hover:text-black transition"
      >
        {title}
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
          {items.map((item) => {
            const value = typeof item === 'string' ? item : item.label
            const isChecked = filterKey === 'priceRange'
              ? filters.priceRange?.label === item.label
              : (filters[filterKey] || []).includes(item)

            return (
              <label
                key={value}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition"
              >
                <input
                  type={filterKey === 'priceRange' ? 'radio' : 'checkbox'}
                  checked={isChecked}
                  onChange={() =>
                    filterKey === 'priceRange'
                      ? handlePriceChange(item)
                      : handleCheckboxChange(filterKey, item)
                  }
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <span className="text-sm text-gray-700">{value}</span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )

  const filterContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={20} />
          <h2 className="text-lg font-medium">Filters</h2>
        </div>
        <button
          onClick={onClearFilters}
          className="text-sm text-gray-600 hover:text-black transition underline"
        >
          Clear All
        </button>
      </div>

      {/* Filter Sections */}
      <FilterSection
        title="Category"
        items={categories}
        filterKey="category"
        isExpanded={expandedSections.category}
      />

      <FilterSection
        title="Brand"
        items={brands}
        filterKey="brand"
        isExpanded={expandedSections.brand}
      />

      <FilterSection
        title="Condition"
        items={conditions}
        filterKey="condition"
        isExpanded={expandedSections.condition}
      />

      <FilterSection
        title="Price Range"
        items={priceRanges}
        filterKey="priceRange"
        isExpanded={expandedSections.price}
      />
    </>
  )

  // Mobile drawer
  if (isMobileOpen) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onMobileClose}
        />

        {/* Drawer */}
        <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 overflow-y-auto p-6 md:hidden shadow-2xl">
          <button
            onClick={onMobileClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} />
          </button>
          {filterContent}
        </div>
      </>
    )
  }

  // Desktop sidebar
  return (
    <div className="hidden md:block w-64 flex-shrink-0 bg-white border border-gray-200 rounded-lg p-6 h-fit sticky top-24">
      {filterContent}
    </div>
  )
}
