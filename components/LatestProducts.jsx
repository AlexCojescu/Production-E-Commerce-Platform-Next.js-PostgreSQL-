'use client'
import React from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'

const LatestProducts = () => {

    const displayQuantity = 6
    const products = useSelector(state => state.product.list)
    
    // Filter out sold items and sort by creation date
    const availableProducts = products
        .filter(product => !product.sold)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, displayQuantity)

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title title='Latest Products' description={`Showing ${availableProducts.length} of ${products.filter(p => !p.sold).length} available products`} href='/shop' />
            <div className='mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 justify-between'>
                {availableProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}

export default LatestProducts