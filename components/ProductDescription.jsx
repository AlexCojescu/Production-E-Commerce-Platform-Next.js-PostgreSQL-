'use client'

import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const ProductDescription = ({ product }) => {
  return (
    <div className="text-sm text-neutral-600">
      <div className="mb-4 max-w-2xl border-b border-neutral-200">
        <h2 className="inline-block border-b border-neutral-900 px-2 py-1.5 text-xs uppercase tracking-[0.18em] text-neutral-800">
          Description
        </h2>
      </div>

      <p className="max-w-2xl leading-relaxed text-neutral-700">
        {product.description}
      </p>

      <div className="mt-6 flex items-center gap-3 border-t border-neutral-100 pt-5">
        <Image
          src={product.store.logo}
          alt={product.store.name}
          className="size-10 rounded-full bg-white object-cover ring-1 ring-neutral-200"
          width={40}
          height={40}
        />
        <div>
          <p className="mb-0.5 text-[10px] uppercase tracking-[0.16em] text-neutral-500">
            Seller
          </p>
          <p className="text-sm font-medium text-neutral-800">
            {product.store.name}
          </p>
          <Link
            href={`/shop/${product.store.username}`}
            className="mt-0.5 inline-flex items-center gap-1 text-xs text-neutral-800 hover:underline"
          >
            View store
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProductDescription
