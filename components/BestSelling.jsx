'use client'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'

const BestSelling = () => {

    const displayQuantity = 8
    const products = useSelector(state => state.product.list)
    
    // Filter out sold items and sort by rating count
    const availableProducts = products
        .filter(product => !product.sold)
        .sort((a, b) => (b.rating?.length || 0) - (a.rating?.length || 0))
        .slice(0, displayQuantity)

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title title='Best Selling' description={`Showing ${availableProducts.length} of ${products.filter(p => !p.sold).length} available products`} href='/shop' />
            <div className='mt-12  grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12'>
                {availableProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}

export default BestSelling