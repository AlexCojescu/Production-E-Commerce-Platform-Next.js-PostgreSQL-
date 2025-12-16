'use client'
import React from 'react'
import FavoriteButton from './FavoriteButton'

const ProductCard = ({ product }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    // Fallback for brand name if not available
    const brandName = product.brand || 'Luxury Archive';


    return (
        // Replaced next/link with standard <a> tag
        <a
            href={`/product/${product.id}`}
            className='group block w-full transition duration-300 hover:shadow-xl hover:scale-[1.01] rounded-lg overflow-hidden bg-white'
        >
            {/* 1. Image Container - Clean, Minimal Background */}
            <div className='aspect-[3/4] bg-white border border-gray-100 overflow-hidden relative'>
                {/* Replaced next/image with standard <img> tag */}
                <img
                    width={800}
                    height={1000}
                    className={`w-full h-full object-cover group-hover:opacity-90 transition-opacity duration-330 ${
                        product.sold ? 'brightness-50' : ''
                    }`}
                    src={product.images && product.images[0]}
                    alt={product.name}
                    loading="lazy"
                />

                {/* SOLD Overlay - Only shown in shop view (not product detail) */}
                {product.sold && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <span className="bg-black/80 text-white font-bold text-xl px-6 py-3 rounded-lg tracking-wider uppercase">
                            SOLD
                        </span>
                    </div>
                )}
            </div>

            {/* 2. Text Content - Grailed Style Layout */}
            <div className='flex flex-col p-3 text-black'>
                {/* Brand Name - Bold, Uppercase, Left Aligned */}
                <p className='text-sm font-bold uppercase tracking-wide text-gray-900 leading-tight mb-1'>
                    {brandName}
                </p>

                {/* Description - Truncated to 25 characters with ellipsis */}
                <p className='text-sm text-gray-900 leading-tight mb-2'>
                    {product.description && product.description.length > 25
                        ? `${product.description.substring(0, 25)}...`
                        : product.description || product.name
                    }
                </p>

                {/* Price and Like Button Row */}
                <div className='flex justify-between items-center'>
                    {/* Price - Bold, Left Aligned */}
                    <p className='text-sm font-bold text-gray-900'>
                        {currency}{product.price.toLocaleString('en-US')}
                    </p>
                    {/* Like Button - Right Aligned */}
                    <div className="flex-shrink-0">
                        <FavoriteButton
                            productId={product.id}
                            initialIsFavorited={product.isFavorited || false}
                            size={18}
                            variant="inline"
                        />
                    </div>
                </div>
            </div>
        </a>
    )
}

export default ProductCard