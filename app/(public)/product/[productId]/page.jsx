"use client"

import ProductDescription from "@/components/ProductDescription"
import ProductDetails from "@/components/ProductDetails"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

export default function Product() {
  const { productId } = useParams()
  const [product, setProduct] = useState()
  const products = useSelector((state) => state.product.list)

  useEffect(() => {
    if (products.length > 0) {
      const found = products.find((p) => p.id === productId)
      setProduct(found)
    }
    scrollTo(0, 0)
  }, [productId, products])

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="mt-3 mb-4 text-[11px] leading-snug text-neutral-400 sm:mt-6 sm:mb-6 sm:text-sm"
        >
          Home / Products /{" "}
          <span className="text-neutral-600">{product?.category}</span>
        </nav>

        {/* Product Details */}
        {product && (
          <div className="pb-10 sm:pb-14">
            <ProductDetails product={product} />
          </div>
        )}

        {/* Description */}
        {product && (
          <section className="border-t border-neutral-200 pt-6 pb-16 sm:pt-10 sm:pb-24">
            <ProductDescription product={product} />
          </section>
        )}
      </div>
    </div>
  )
}
