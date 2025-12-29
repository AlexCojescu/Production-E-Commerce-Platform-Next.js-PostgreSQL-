'use client';
import React from 'react';
import FavoriteButton from './FavoriteButton';

const ProductCard = ({ product, isViewMoreCard = false }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

  const brandName = product.brand || 'Luxury Archive';
  const mainImage = product.images?.[0] || '/placeholder.jpg';
  const isSold = Boolean(product.sold);

  const name = product.name || 'Archive piece';

  // Optional: keep a short description just for accessibility / aria-label
  const description =
    product.description && product.description.length > 25
      ? `${product.description.substring(0, 25)}...`
      : product.description || name;

  const formattedPrice =
    typeof product.price === 'number'
      ? product.price.toLocaleString('en-US')
      : product.price;

  return (
    <a
      href={`/product/${product.id}`}
      className="group block w-full rounded-lg overflow-hidden bg-white transition duration-300 hover:shadow-xl hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
      aria-label={`${brandName} ${description} for ${currency}${formattedPrice}`}
    >
      {/* Image */}
      <div
        className={
          isViewMoreCard
            ? 'relative overflow-hidden rounded-t-lg'
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
            <span className="rounded-lg bg-black/80 px-6 py-3 text-xl font-bold uppercase tracking-wider text-white">
              SOLD
            </span>
          </div>
        )}
      </div>

      {/* Text content */}
      <div className="flex flex-col p-3 text-black">
        {/* Brand */}
        <p className="mb-1 text-sm font-bold uppercase tracking-wide text-gray-900 leading-tight">
          {brandName}
        </p>

        {/* Product name (instead of description) */}
        <p className="mb-2 text-sm leading-tight text-gray-900">
          {name}
        </p>

        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-gray-900">
            {currency}
            {formattedPrice}
          </p>

          <div className="flex-shrink-0">
            <FavoriteButton
              productId={product.id}
              initialIsFavorited={product.isFavorited || false}
              size={18}
              variant="inline"
            />
          </div>
        </div>
      </div>
    </a>
  );
};

export default ProductCard;
