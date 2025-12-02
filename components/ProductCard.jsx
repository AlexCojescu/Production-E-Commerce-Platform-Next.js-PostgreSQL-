'use client'
import { StarIcon } from 'lucide-react'
import React from 'react'
import FavoriteButton from './FavoriteButton'

const ProductCard = ({ product }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    // Calculate the average rating of the product
    // Ensure product.rating exists before attempting to reduce it
    const rating = product.rating && product.rating.length > 0
        ? Math.round(product.rating.reduce((acc, curr) => acc + curr.rating, 0) / product.rating.length)
        : 0;
    
    // Fallback/Demo values for new fields if not yet in dummy data
    const brandName = product.brand || 'Luxury Archive'; 
    const conditionText = product.condition || 'Excellent (Pre-owned)';


    return (
        // Replaced next/link with standard <a> tag
        <a
            href={`/product/${product.id}`}
            className='group block w-full max-w-xs mx-auto transition duration-300 hover:shadow-xl hover:scale-[1.01] rounded-lg overflow-hidden bg-white'
        >
            {/* 1. Image Container - Clean, Minimal Background */}
            <div className='aspect-[3/4] bg-white border border-gray-100 overflow-hidden relative'>
                {/* Favorite Button - Positioned absolutely */}
                <div className="absolute top-2 right-2 z-10">
                    <FavoriteButton
                        productId={product.id}
                        initialIsFavorited={product.isFavorited || false}
                    />
                </div>

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

            {/* 2. Text Content - Structured Hierarchy */}
            <div className='flex flex-col p-3 text-black'>
                
                {/* Row 1: Brand & Price */}
                <div className='flex justify-between items-start mb-1'>
                    {/* Brand Name (Bold, Primary Focus) */}
                    <p className='text-sm font-semibold uppercase tracking-wider text-gray-900 leading-tight'>
                        {brandName}
                    </p>
                    {/* Price (Clear, easy to read) */}
                    <p className='text-base font-bold text-gray-900'>
                        {currency}{product.price.toLocaleString('en-US')}
                    </p>
                </div>

                {/* Row 2: Product Name & Condition (Secondary Info) */}
                <div className='flex justify-between items-center text-xs text-gray-500'>
                    {/* Product Name (Subtle) */}
                    <p className='truncate max-w-[60%] font-light'>
                        {product.name}
                    </p>
                    {/* Condition (as a small badge) */}
                    <span className='text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full'>
                        {conditionText.split('(')[0].trim()}
                    </span>
                </div>
                
                {/* Row 3: Rating (De-emphasized/Optional) */}
                {product.rating && product.rating.length > 0 && (
                    <div className='flex items-center mt-2'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon 
                                key={index} 
                                size={12} 
                                className='mt-0.5 transition' 
                                fill={rating >= index + 1 ? "#000000" : "#E5E7EB"} // Changed to black/light gray
                                strokeWidth={0}
                            />
                        ))}
                        <span className='ml-1 text-xs text-gray-500'>
                            ({product.rating.length})
                        </span>
                    </div>
                )}
            </div>
        </a>
    )
}

export default ProductCard