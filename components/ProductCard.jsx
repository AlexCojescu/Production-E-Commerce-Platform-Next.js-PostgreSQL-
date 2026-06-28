'use client'

import Link from 'next/link'
import FavoriteButton from './FavoriteButton'

const ProductCard = ({ product, isViewMoreCard = false, variant = 'default' }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
  const isShop = variant === 'shop'

  const brandName = product.brand || 'Luxury Archive'
  const mainImage = product.images?.[0] || '/placeholder.jpg'
  const isSold = Boolean(product.sold)
  const name = product.name || 'Archive piece'
  const productHref = `/product/${product.id}`

  const description =
    product.description && product.description.length > 25
      ? `${product.description.substring(0, 25)}...`
      : product.description || name

  const formattedPrice =
    typeof product.price === 'number'
      ? product.price.toLocaleString('en-US')
      : product.price

  const imageBlock = (
    <div
      className={
        isShop || isViewMoreCard
          ? 'relative overflow-hidden'
          : 'relative overflow-hidden rounded-lg'
      }
    >
      <div className="aspect-[3/4] w-full">
        <img
          width={800}
          height={1000}
          className={`h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-90 ${
            isSold ? 'brightness-50' : ''
          }`}
          src={mainImage}
          alt={name}
          loading="lazy"
        />
      </div>

      {isSold && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <span
            className={`bg-black/80 px-6 py-3 text-xl font-bold uppercase tracking-wider text-white ${
              isShop ? '' : 'rounded-lg'
            }`}
          >
            SOLD
          </span>
        </div>
      )}
    </div>
  )

  const shopContent = (
    <>
      <Link href={productHref} className="block">
        {imageBlock}
      </Link>

      <div className="flex flex-col pt-2">
        <Link
          href={productHref}
          className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500 transition hover:text-neutral-900"
        >
          {brandName}
        </Link>

        <Link
          href={productHref}
          className="mb-1.5 line-clamp-2 text-sm leading-snug text-neutral-900 transition hover:text-neutral-600"
        >
          {name}
        </Link>

        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold tabular-nums text-neutral-900">
            {currency}
            {formattedPrice}
          </p>
          <FavoriteButton
            productId={product.id}
            initialIsFavorited={product.isFavorited || false}
            size={18}
            variant="inline"
          />
        </div>
      </div>
    </>
  )

  const defaultContent = (
    <>
      {imageBlock}

      <div className="flex flex-col p-3 text-black">
        <p className="mb-1 text-sm font-bold uppercase tracking-wide leading-tight text-gray-900">
          {brandName}
        </p>

        <p className="mb-2 text-sm leading-tight text-gray-900">{name}</p>

        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-gray-900">
            {currency}
            {formattedPrice}
          </p>

          <div className="shrink-0">
            <FavoriteButton
              productId={product.id}
              initialIsFavorited={product.isFavorited || false}
              size={18}
              variant="inline"
            />
          </div>
        </div>
      </div>
    </>
  )

  if (isShop) {
    return (
      <article className="group flex w-full flex-col bg-white">{shopContent}</article>
    )
  }

  return (
    <a
      href={productHref}
      className={`group block w-full overflow-hidden bg-white transition duration-300 hover:scale-[1.01] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black ${
        isViewMoreCard ? '' : 'rounded-lg'
      }`}
      aria-label={`${brandName} ${description} for ${currency}${formattedPrice}`}
    >
      {defaultContent}
    </a>
  )
}

export default ProductCard
