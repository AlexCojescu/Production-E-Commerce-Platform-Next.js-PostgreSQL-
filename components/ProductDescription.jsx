'use client'
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const ProductDescription = ({ product }) => {
    return (
        <div className="mt-12 mb-10 text-sm text-neutral-600">
            {/* Section Title */}
            <div className="border-b border-neutral-200 mb-5 max-w-2xl">
                <h2 className="inline-block px-3 py-2 border-b border-neutral-900 text-xs tracking-[0.18em] uppercase text-neutral-800">
                    Description
                </h2>
            </div>

            {/* Description Text */}
            <p className="max-w-xl leading-relaxed text-neutral-700">
                {product.description}
            </p>

            {/* Store Info */}
            <div className="flex items-center gap-3 mt-10">
                <Image
                    src={product.store.logo}
                    alt={product.store.name}
                    className="size-11 rounded-full ring-1 ring-neutral-200 bg-white object-cover"
                    width={44}
                    height={44}
                />
                <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-neutral-500 mb-1">
                        Seller
                    </p>
                    <p className="font-medium text-neutral-800 text-sm">
                        {product.store.name}
                    </p>
                    <Link
                        href={`/shop/${product.store.username}`}
                        className="inline-flex items-center gap-1.5 text-xs text-neutral-800 mt-1 hover:underline"
                    >
                        View store
                        <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ProductDescription
