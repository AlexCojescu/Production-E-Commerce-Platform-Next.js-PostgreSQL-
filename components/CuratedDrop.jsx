"use client"

import Image from "next/image"
import Link from "next/link"
import { assets } from "@/assets/assets"

const CuratedDrop = () => {
  const images = [
    { src: assets.car10, alt: "Featured car 1" },
    { src: assets.car11, alt: "Featured car 2" },
    { src: assets.car12, alt: "Featured car 3" },
    { src: assets.car13, alt: "Featured car 4" },
    { src: assets.car14, alt: "Featured car 5" },
  ]

  return (
    <section className="w-full max-w-[520px] xl:max-w-[560px] px-4 py-6">
      <p className="text-[10px] tracking-[0.16em] uppercase text-slate-400 mb-1">
        Exclusive, Hard To Come By Items
      </p>
      <h2 className="text-xl font-semibold text-slate-900 mb-3">
        VETEMENTS Hoodies
      </h2>

      <div className="grid grid-cols-2 grid-rows-2 gap-[3px] sm:gap-1">
        {/* Top left */}
        <Link
          href="/shop"
          className="relative col-span-1 aspect-[4/5] overflow-hidden group"
        >
          {images[0]?.src && (
            <Image
              src={images[0].src}
              alt={images[0].alt}
              fill
              sizes="(min-width: 1024px) 260px, 50vw"
              className="object-cover transition duration-300 group-hover:brightness-90"
              priority
            />
          )}
        </Link>

        {/* Top right */}
        <Link
          href="/shop"
          className="relative col-span-1 aspect-[4/5] overflow-hidden group"
        >
          {images[1]?.src && (
            <Image
              src={images[1].src}
              alt={images[1].alt}
              fill
              sizes="(min-width: 1024px) 260px, 50vw"
              className="object-cover transition duration-300 group-hover:brightness-90"
            />
          )}
        </Link>

        {/* Bottom left */}
        <Link
          href="/shop"
          className="relative aspect-[4/5] overflow-hidden group"
        >
          {images[2]?.src && (
            <Image
              src={images[2].src}
              alt={images[2].alt}
              fill
              sizes="(min-width: 1024px) 130px, 50vw"
              className="object-cover transition duration-300 group-hover:brightness-90"
            />
          )}
        </Link>

        {/* Bottom right + VIEW MORE */}
        <Link
          href="/shop"
          className="relative aspect-[4/5] overflow-hidden group"
        >
          {images[3]?.src && (
            <Image
              src={images[3].src}
              alt={images[3].alt}
              fill
              sizes="(min-width: 1024px) 130px, 50vw"
              className="object-cover transition duration-300 group-hover:brightness-75"
            />
          )}
          <div className="absolute inset-0 bg-black/35 group-hover:bg-black/45 flex items-center justify-center">
            <span className="text-[10px] sm:text-xs tracking-[0.2em] text-white uppercase">
              + View More
            </span>
          </div>
        </Link>
      </div>
    </section>
  )
}

export default CuratedDrop
