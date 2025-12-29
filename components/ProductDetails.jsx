'use client'

import { addToCart } from "@/lib/features/cart/cartSlice"
import { TagIcon, EarthIcon, CreditCardIcon, UserIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import Counter from "./Counter"
import { useDispatch, useSelector } from "react-redux"
import FavoriteButton from "./FavoriteButton"

const ProductDetails = ({ product }) => {
    const productId = product.id
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const cart = useSelector(state => state.cart.cartItems)
    const dispatch = useDispatch()
    const router = useRouter()

    const [mainImage, setMainImage] = useState(product.images[0])
    const [favoriteCount, setFavoriteCount] = useState(product.favoriteCount || 0)
    const [isFavorited, setIsFavorited] = useState(product.isFavorited || false)

    // Update state when product changes
    useEffect(() => {
        setFavoriteCount(product.favoriteCount || 0)
        setIsFavorited(product.isFavorited || false)
    }, [product.favoriteCount, product.isFavorited])

    const addToCartHandler = () => {
        // Prevent adding sold items to cart
        if (product.sold) {
            return
        }
        dispatch(addToCart({ productId, product }))
    }

    const discount = product.mrp
        ? ((product.mrp - product.price) / product.mrp * 100).toFixed(0)
        : null

    return (
        <div className="flex max-lg:flex-col gap-10 lg:gap-12">
            {/* Image Column */}
            <div className="flex max-sm:flex-col-reverse gap-3 w-full lg:w-1/2">
                {/* Thumbnails */}
                <div className="flex sm:flex-col gap-3">
                    {product.images.map((image, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setMainImage(product.images[index])}
                            className={`bg-white border flex items-center justify-center size-18 sm:size-20 rounded-lg cursor-pointer overflow-hidden transition 
                                ${mainImage === image
                                    ? "border-neutral-900"
                                    : "border-neutral-200 hover:border-neutral-400"}`}
                        >
                            <Image
                                src={image}
                                className="object-cover w-full h-full"
                                alt={product.name}
                                width={80}
                                height={80}
                            />
                        </button>
                    ))}
                </div>

                {/* Main Image */}
                <div className="flex-1 flex items-center justify-center">
                <div className="inline-block bg-white rounded-xl overflow-hidden border border-neutral-200">
                    <Image
                    src={mainImage}
                    alt={product.name}
                    className="block h-auto w-auto max-w-full max-h-[70vh] object-contain"
                    width={800}      // keep a reasonable max width
                    height={1200}    // and height; just aspect hint, real aspect comes from image
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    />
                </div>
                </div>


            </div>

            {/* Info Column */}
            <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900">
                        {product.name}
                    </h1>
                    {product.sold && (
                        <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide">
                            SOLD
                        </span>
                    )}
                </div>

                {/* Likes */}
                <div className="flex items-center gap-3 mt-3">
                    <FavoriteButton 
                        productId={productId}
                        initialIsFavorited={isFavorited}
                        size={20}
                        variant="default"
                        onToggle={(newIsFavorited) => {
                            // Update count based on the change in favorite state
                            const wasFavorited = isFavorited
                            setIsFavorited(newIsFavorited)
                            if (newIsFavorited !== wasFavorited) {
                                setFavoriteCount(prev => newIsFavorited ? prev + 1 : Math.max(0, prev - 1))
                            }
                        }}
                    />
                    <p className="text-sm text-neutral-600">
                        {favoriteCount} {favoriteCount === 1 ? 'Like' : 'Likes'}
                    </p>
                </div>

                {/* Price Block */}
                <div className="flex items-end gap-3 my-6">
                    <p className="text-2xl font-semibold text-neutral-900">
                        {currency}{product.price}
                    </p>
                    <p className="text-sm text-neutral-400 line-through">
                        {currency}{product.mrp}
                    </p>
                    {discount && (
                        <span className="text-xs font-medium text-green-600">
                            -{discount}%
                        </span>
                    )}
                </div>

                {/* Savings Copy */}
                {discount && (
                    <div className="flex items-center gap-2 text-xs text-neutral-600">
                        <TagIcon size={14} className="text-neutral-400" />
                        <p>Save {discount}% on this piece</p>
                    </div>
                )}

                {/* Product Information */}
                <div className="mt-6 pt-6 border-t border-neutral-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        {product.brand && product.brand !== "N/A" && (
                            <div>
                                <p className="text-xs text-neutral-500 mb-1 uppercase tracking-wide">Brand</p>
                                <p className="text-neutral-800 font-medium">{product.brand}</p>
                            </div>
                        )}
                        {product.size && product.size !== "N/A" && (
                            <div>
                                <p className="text-xs text-neutral-500 mb-1 uppercase tracking-wide">Size</p>
                                <p className="text-neutral-800 font-medium">{product.size}</p>
                            </div>
                        )}
                        {product.condition && product.condition !== "N/A" && (
                            <div>
                                <p className="text-xs text-neutral-500 mb-1 uppercase tracking-wide">Condition</p>
                                <p className="text-neutral-800 font-medium">{product.condition}</p>
                            </div>
                        )}
                        {product.category && (
                            <div>
                                <p className="text-xs text-neutral-500 mb-1 uppercase tracking-wide">Category</p>
                                <p className="text-neutral-800 font-medium">{product.category}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cart / Quantity */}
                <div className="flex flex-wrap items-end gap-6 mt-10">
                    {product.sold ? (
                        <button
                            disabled
                            className="bg-gray-400 text-white px-10 py-3 text-sm font-medium rounded-full cursor-not-allowed"
                        >
                            Sold Out
                        </button>
                    ) : (
                        <button
                            onClick={() => !cart[productId] ? addToCartHandler() : router.push('/cart')}
                            className="bg-neutral-900 text-white px-10 py-3 text-sm font-medium rounded-full hover:bg-neutral-800 active:scale-[0.98] transition"
                        >
                            {!cart[productId] ? 'Add to Cart' : 'View Cart'}
                        </button>
                    )}
                </div>

                <hr className="border-neutral-200 my-8" />

                {/* Trust / Meta */}
                <div className="flex flex-col gap-3 text-sm text-neutral-600">
                    <p className="flex gap-2 items-center">
                        <EarthIcon size={16} className="text-neutral-400" />
                        Free tracked shipping on all orders
                    </p>
                    <p className="flex gap-2 items-center">
                        <CreditCardIcon size={16} className="text-neutral-400" />
                        Secure checkout with buyer protection
                    </p>
                    <p className="flex gap-2 items-center">
                        <UserIcon size={16} className="text-neutral-400" />
                        Curated sellers & verified archive pieces
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ProductDetails
