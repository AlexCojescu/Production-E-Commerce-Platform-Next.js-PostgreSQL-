'use client'
import ProductDescription from "@/components/ProductDescription"
import ProductDetails from "@/components/ProductDetails"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

export default function Product() {
    const { productId } = useParams()
    const [product, setProduct] = useState()
    const products = useSelector(state => state.product.list)

    const fetchProduct = async () => {
        const found = products.find((p) => p.id === productId)
        setProduct(found)
    }

    useEffect(() => {
        if (products.length > 0) {
            fetchProduct()
        }
        scrollTo(0, 0)
    }, [productId, products])

    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Breadcrumbs */}
                <div className="text-xs sm:text-sm text-neutral-400 mt-6 mb-6">
                    Home / Products / <span className="text-neutral-600">{product?.category}</span>
                </div>

                {/* Product Details */}
                {product && <ProductDetails product={product} />}

                {/* Description */}
                {product && (
                    <div className="mt-14 mb-24 border-t border-neutral-200 pt-10">
                        <ProductDescription product={product} />
                    </div>
                )}
            </div>
        </div>
    )
}
