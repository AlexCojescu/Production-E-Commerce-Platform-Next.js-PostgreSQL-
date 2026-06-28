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
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6">
        <nav
          aria-label="Breadcrumb"
          className="mb-3 mt-3 text-[11px] leading-snug text-neutral-400 sm:mb-4 sm:mt-5 sm:text-sm"
        >
          Home / Products /{" "}
          <span className="text-neutral-600">{product?.category}</span>
        </nav>

        {product && (
          <>
            <ProductDetails product={product} />

            <section className="mt-6 border-t border-neutral-200 pt-5 pb-10 sm:mt-8 sm:pb-12">
              <ProductDescription product={product} />
            </section>
          </>
        )}
      </div>
    </div>
  )
}
