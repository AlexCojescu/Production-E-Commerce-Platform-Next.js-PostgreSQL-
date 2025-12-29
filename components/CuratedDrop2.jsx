"use client"

import Image from "next/image"
import { assets } from "@/assets/assets"

const CuratedDrop2 = () => {
  return (
    // same outer width & padding
    <section className="w-full max-w-[520px] xl:max-w-[560px] px-4 py-6">
      {/* This wrapper will stretch to match siblings */}
      <div className="flex h-full">
        {/* Full-height card that matches the others */}
        <div className="relative w-full h-full min-h-[420px] sm:min-h-[460px] overflow-hidden">
          <Image
            src={assets.car1}
            alt="Up to 70% off archive – first 100 sign ups get added to the Exclusive Finders Group"
            fill
            className="object-cover"   // crops as needed to fill full height
            priority
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

          <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6 text-white">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.16em] mb-2 opacity-80">
              Exclusive Members Offer
            </p>
            <h3 className="text-2xl sm:text-3xl font-semibold leading-tight mb-2">
              Up to 70% Off Archive
            </h3>
            <p className="text-xs sm:text-sm max-w-xs leading-snug opacity-90">
              First 100 sign ups get added to the Exclusive Finders Group for early access to rare pieces.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CuratedDrop2
