"use client"

import React from "react"
import Title from "./Title"
import ProductCard from "./ProductCard"
import { useSelector } from "react-redux"
import Link from "next/link"

const LatestProducts = () => {
  const displayQuantity = 8
  const products = useSelector((state) => state.product.list)

  const availableProducts = products
    .filter((product) => !product.sold)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, displayQuantity)

  const totalAvailable = products.filter((p) => !p.sold).length

  return (
    <div className="px-6 my-30 max-w-6xl mx-auto">
      <Title
        title="Latest Products"
        description={`Showing ${availableProducts.length} of ${totalAvailable} available products`}
        href="/shop"
      />

      <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {availableProducts.map((product, index) => {
          const isLast = index === displayQuantity - 1

          if (!isLast) {
            // First 7: normal cards
            return <ProductCard key={product.id} product={product} />
          }

          // 8th card: product + lighter shaded "View more" overlay
          // inside LatestProducts, for the last card
          return (
            <div key={product.id} className="relative rounded-2xl overflow-hidden">
              <ProductCard product={product} isViewMoreCard />
        
              <Link
                href="/shop"
                className="absolute inset-0 flex items-center justify-center bg-black/35 hover:bg-black/45 transition-colors"
                aria-label="View more products"
              >
                <span className="text-xs sm:text-sm tracking-[0.18em] uppercase text-white">
                  View more
                </span>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default LatestProducts
