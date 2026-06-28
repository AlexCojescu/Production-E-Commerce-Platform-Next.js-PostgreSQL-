'use client'

import { addToCart } from '@/lib/features/cart/cartSlice'
import { EarthIcon, CreditCardIcon, UserIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useDispatch, useSelector } from 'react-redux'
import FavoriteButton from './FavoriteButton'
import { useAuth } from '@clerk/nextjs'
import toast from 'react-hot-toast'

const ProductDetails = ({ product }) => {
  const productId = product.id
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

  const cart = useSelector((state) => state.cart.cartItems)
  const dispatch = useDispatch()
  const router = useRouter()
  const { userId } = useAuth()

  const [mainImage, setMainImage] = useState(product.images[0])
  const [favoriteCount, setFavoriteCount] = useState(product.favoriteCount || 0)
  const [isFavorited, setIsFavorited] = useState(product.isFavorited || false)

  useEffect(() => {
    setMainImage(product.images[0])
    setFavoriteCount(product.favoriteCount || 0)
    setIsFavorited(product.isFavorited || false)
  }, [product.id, product.images, product.favoriteCount, product.isFavorited])

  const addToCartHandler = () => {
    if (!userId) {
      toast.error('Please log in to add items to cart')
      router.push('/login')
      return
    }

    if (product.sold) return

    dispatch(addToCart({ productId, product }))
  }

  const discount =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : null

  const formattedPrice =
    typeof product.price === 'number'
      ? product.price.toLocaleString('en-US')
      : product.price

  const formattedMrp =
    typeof product.mrp === 'number'
      ? product.mrp.toLocaleString('en-US')
      : product.mrp

  const savingsAmount =
    discount &&
    typeof product.mrp === 'number' &&
    typeof product.price === 'number'
      ? (product.mrp - product.price).toLocaleString('en-US')
      : null

  const showBrand = product.brand && product.brand !== 'N/A'
  const isInCart = Boolean(cart[productId])

  const specItems = [
    showBrand && { label: 'Brand', value: product.brand },
    product.size && product.size !== 'N/A' && { label: 'Size', value: product.size },
    product.condition &&
      product.condition !== 'N/A' && { label: 'Condition', value: product.condition },
    product.category && { label: 'Category', value: product.category },
  ].filter(Boolean)

  return (
    <div className="flex max-lg:flex-col gap-6 lg:gap-8">
      {/* Image column */}
      <div className="flex w-full max-sm:flex-col-reverse gap-2.5 sm:gap-3 lg:w-[52%]">
        <div className="flex gap-2 sm:flex-col sm:gap-2.5">
          {product.images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setMainImage(product.images[index])}
              className={`flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white transition sm:size-[4.5rem] ${
                mainImage === image
                  ? 'border-neutral-900'
                  : 'border-neutral-200 hover:border-neutral-400'
              }`}
            >
              <Image
                src={image}
                className="h-full w-full object-cover"
                alt={`${product.name} view ${index + 1}`}
                width={72}
                height={72}
              />
            </button>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="overflow-hidden border border-neutral-200 bg-white">
            <Image
              src={mainImage}
              alt={product.name}
              className="block h-auto max-h-[62vh] w-full object-contain sm:max-h-[68vh]"
              width={800}
              height={1200}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </div>

      {/* Info column */}
      <div className="flex min-w-0 flex-1 flex-col lg:pt-1">
        <div className="border-b border-neutral-100 pb-4">
          {showBrand && (
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              {product.brand}
            </p>
          )}

          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-semibold leading-tight text-neutral-900 sm:text-[1.75rem]">
              {product.name}
            </h1>
            {product.sold && (
              <span className="shrink-0 bg-neutral-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                Sold
              </span>
            )}
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <FavoriteButton
              productId={productId}
              initialIsFavorited={isFavorited}
              size={18}
              variant="inline"
              onToggle={(newIsFavorited) => {
                const wasFavorited = isFavorited
                setIsFavorited(newIsFavorited)
                if (newIsFavorited !== wasFavorited) {
                  setFavoriteCount((prev) =>
                    newIsFavorited ? prev + 1 : Math.max(0, prev - 1)
                  )
                }
              }}
            />
            <p className="text-sm text-neutral-500">
              {favoriteCount} {favoriteCount === 1 ? 'like' : 'likes'}
            </p>
          </div>
        </div>

        <div className="border-b border-neutral-100 py-4">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-3xl font-semibold tabular-nums text-neutral-900">
              {currency}
              {formattedPrice}
            </p>
            {discount && (
              <>
                <p className="text-base tabular-nums text-neutral-400 line-through">
                  {currency}
                  {formattedMrp}
                </p>
                <span className="bg-neutral-100 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-neutral-700">
                  {discount}% off
                </span>
              </>
            )}
          </div>
          {discount && savingsAmount && (
            <p className="mt-1.5 text-sm text-neutral-500">
              Save {currency}
              {savingsAmount} on this piece
            </p>
          )}
        </div>

        {specItems.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-neutral-100 py-4 text-sm">
            {specItems.map((item) => (
              <div key={item.label}>
                <p className="mb-0.5 text-[10px] uppercase tracking-wide text-neutral-500">
                  {item.label}
                </p>
                <p className="font-medium text-neutral-800">{item.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4">
          {product.sold ? (
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed bg-neutral-200 py-4 text-sm font-medium uppercase tracking-wide text-neutral-500"
            >
              Sold out
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                !isInCart ? addToCartHandler() : router.push('/cart')
              }
              className={`w-full py-4 text-sm font-medium uppercase tracking-wide transition active:scale-[0.98] ${
                isInCart
                  ? 'bg-white text-neutral-900 ring-1 ring-neutral-900 hover:bg-neutral-50'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
              }`}
            >
              {!isInCart ? 'Add to cart' : 'View cart'}
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-neutral-100 pt-4 text-xs text-neutral-600 sm:text-sm">
          <p className="flex items-center gap-2">
            <EarthIcon size={15} className="shrink-0 text-neutral-400" />
            Free tracked shipping on all orders
          </p>
          <p className="flex items-center gap-2">
            <CreditCardIcon size={15} className="shrink-0 text-neutral-400" />
            Secure checkout with buyer protection
          </p>
          <p className="flex items-center gap-2">
            <UserIcon size={15} className="shrink-0 text-neutral-400" />
            Curated sellers & verified archive pieces
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
