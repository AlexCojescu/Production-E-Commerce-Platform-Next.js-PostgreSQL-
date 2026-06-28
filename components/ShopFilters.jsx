'use client'
import { X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function ShopFilters({
  filters,
  onFilterChange,
  onClearFilters,
  isMobileOpen,
  onMobileClose
}) {
  const [expandedSections, setExpandedSections] = useState({
    category: false,
    brand: false,
    condition: false,
    priceRange: false,
    sold: false,
  })

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileOpen])

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

  const soldOptions = [
    { label: "Available", value: false },
    { label: "Sold", value: true }
  ]

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleCheckboxChange = (filterType, value) => {
    // For sold filter, handle it differently - it's a single selection
    if (filterType === 'sold') {
      const currentValues = filters[filterType] || []
      const valueToToggle = typeof value === 'object' ? value.value : value
      const newValues = currentValues.includes(valueToToggle)
        ? currentValues.filter(v => v !== valueToToggle)
        : [...currentValues, valueToToggle]
      onFilterChange(filterType, newValues)
    } else {
      const currentValues = filters[filterType] || []
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value]
      onFilterChange(filterType, newValues)
    }
  }

  const handlePriceChange = (range) => {
    onFilterChange('priceRange', range)
  }

  // Count active filters for each section
  const getActiveCount = (filterKey) => {
    if (filterKey === 'priceRange') {
      return filters.priceRange ? 1 : 0
    }
    return (filters[filterKey] || []).length
  }

  const FilterSection = ({ title, items, filterKey, isExpanded, hideBottomBorder = false }) => {
    const activeCount = getActiveCount(filterKey)
    
    return (
      <div className={`py-3 md:py-4${hideBottomBorder ? '' : ' border-b border-gray-200'}`}>
        <button
          onClick={() => toggleSection(filterKey)}
          className="w-full flex items-center justify-between text-left font-medium text-gray-900 hover:text-black transition py-2 -mx-1 px-1 rounded-md active:bg-gray-100 touch-manipulation"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <div className="flex items-center gap-2">
            <span>{title}</span>
            {activeCount > 0 && (
              <span className="bg-black text-white text-xs font-medium px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {activeCount}
              </span>
            )}
          </div>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {isExpanded && (
          <div className="mt-3 space-y-1 md:space-y-2 max-h-64 overflow-y-auto overscroll-contain">
            {items.map((item, index) => {
              const value = typeof item === 'string' ? item : (typeof item === 'object' ? item.label : item)
              const itemValue = typeof item === 'object' && 'value' in item ? item.value : item
              const uniqueKey = filterKey === 'sold' ? `${filterKey}-${itemValue}-${index}` : (typeof item === 'object' && item.label ? item.label : value)
              const isChecked = filterKey === 'priceRange'
                ? filters.priceRange?.label === item.label
                : filterKey === 'sold'
                ? (filters[filterKey] || []).includes(itemValue)
                : (filters[filterKey] || []).includes(item)

              return (
                <label
                  key={uniqueKey}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 p-2 md:p-1 rounded-md transition touch-manipulation min-h-[44px] md:min-h-0"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <input
                    type={filterKey === 'priceRange' ? 'radio' : 'checkbox'}
                    checked={isChecked}
                    onChange={() =>
                      filterKey === 'priceRange'
                        ? handlePriceChange(item)
                        : handleCheckboxChange(filterKey, item)
                    }
                    className="w-5 h-5 md:w-4 md:h-4 text-black border-gray-300 rounded focus:ring-2 focus:ring-black focus:ring-offset-1 cursor-pointer flex-shrink-0"
                  />
                  <span className="text-sm md:text-sm text-gray-700 select-none flex-1">{value}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const filterContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={22} className="md:w-5 md:h-5" />
          <h2 className="text-xl md:text-lg font-semibold md:font-medium">Filters</h2>
        </div>
        <button
          onClick={onClearFilters}
          className="text-sm text-gray-600 hover:text-black active:text-black transition underline touch-manipulation px-2 py-1 -mr-2"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          Clear All
        </button>
      </div>

      {/* Filter Sections */}
      <div className="space-y-1">
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
          isExpanded={expandedSections.priceRange}
        />

        <FilterSection
          title="Status"
          items={soldOptions}
          filterKey="sold"
          isExpanded={expandedSections.sold}
          hideBottomBorder
        />
      </div>
    </>
  )

  // Mobile drawer
  if (isMobileOpen) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={onMobileClose}
        />

        {/* Drawer */}
        <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white z-50 overflow-y-auto overscroll-contain md:hidden shadow-2xl transform transition-transform duration-300 ease-out">
          <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={22} />
              <h2 className="text-xl font-semibold">Filters</h2>
            </div>
            <button
              onClick={onMobileClose}
              className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full transition touch-manipulation -mr-2"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              aria-label="Close filters"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6 pt-4">
            <div className="mb-4">
              <button
                onClick={onClearFilters}
                className="text-sm text-gray-600 hover:text-black active:text-black transition underline touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Clear All Filters
              </button>
            </div>
            
            <div className="space-y-1">
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
                isExpanded={expandedSections.priceRange}
              />

              <FilterSection
                title="Status"
                items={soldOptions}
                filterKey="sold"
                isExpanded={expandedSections.sold}
                hideBottomBorder
              />
            </div>
          </div>
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