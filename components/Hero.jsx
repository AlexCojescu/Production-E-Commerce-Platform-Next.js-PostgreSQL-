"use client"

import { ArrowRightIcon, ChevronRightIcon } from "lucide-react"
import React from "react"
import Link from "next/link"
import CategoriesMarquee from "./CategoriesMarquee"

const Hero = () => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$"

  return (
    <div className="mx-auto px-4 max-w-6xl">
      <section
        className="flex flex-col gap-6 my-8 md:my-12 lg:my-16 lg:flex-row lg:gap-8"
        aria-labelledby="hero-heading"
      >
        {/* Main Hero Content */}
        <div className="flex-1 flex flex-col bg-white border border-neutral-200 rounded-3xl shadow-lg transition duration-300 hover:shadow-2xl lg:hover:scale-[1.01]">
          <div className="p-5 sm:p-7 md:p-10">
            {/* Trust pill */}
            <div className="inline-flex items-center gap-2 bg-neutral-100 pr-3 py-1 rounded-full text-[11px] sm:text-xs text-neutral-700 font-semibold mb-3">
              <span className="bg-neutral-900 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-white mr-1">
                100% AUTHENTIC
              </span>
              <span className="truncate max-w-[10rem] sm:max-w-none">
                Verified vendors only
              </span>
              <ChevronRightIcon className="ml-1 shrink-0" size={14} aria-hidden="true" />
            </div>

            {/* Title */}
            <h1
              id="hero-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-semibold text-neutral-900 mt-1 mb-3 leading-snug sm:leading-tight max-w-xl"
            >
              Buy from trusted stores, connect directly with sellers.
            </h1>

            {/* Subhead */}
            <p className="text-sm sm:text-base md:text-lg text-neutral-700 font-light max-w-lg mb-5 sm:mb-6">
              Every store is verified and ships fast—same day or within 1–2 business days.
              Message sellers instantly with no unnecessary limits.
            </p>

            {/* Social proof / reassurance */}
            <div className="inline-flex items-center gap-2 bg-neutral-50 px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs text-neutral-600">
              <span className="font-medium text-neutral-900">
                No scams. No catch.
              </span>
              {/* Separator Dot */}
              <span className="text-neutral-300">•</span> 
              <span className="font-medium text-neutral-900">
                24/7 live support.
              </span>
            </div>

            {/* Primary CTA */}
            <div className="mt-6 sm:mt-7">
              <Link href="/shop" className="inline-flex w-full sm:w-auto">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-neutral-900 text-white text-sm sm:text-base py-3 sm:py-3.5 px-5 sm:px-7 rounded-full font-semibold shadow-md transition duration-200 hover:bg-neutral-800 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  Shop authentic pieces
                  <ArrowRightIcon
                    size={18}
                    className="hidden sm:inline-block"
                    aria-hidden="true"
                  />
                </button>
              </Link>

              {/* Secondary cue for sellers on mobile */}
              <Link
                href="/create-store"
                className="mt-3 inline-flex sm:hidden items-center justify-center gap-2 text-xs font-medium text-neutral-800"
              >
                Become a verified seller
                <ChevronRightIcon size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        {/* Info Panels */}
        <aside
          className="w-full lg:max-w-xs"
          aria-label="Marketplace benefits"
        >
          {/* Mobile: 3 columns side by side; Desktop: original vertical stack */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:flex lg:flex-col lg:gap-4">
            {/* Fast Shipping */}
            <div className="flex-1 bg-white border border-neutral-200 rounded-2xl p-3 sm:p-4 shadow-sm transition hover:shadow-md hover:border-neutral-300">
              <p className="text-[11px] sm:text-sm font-semibold text-neutral-900 mb-1">
                Fast shipping
              </p>
              <p className="text-[10px] sm:text-xs text-neutral-700">
                Same day or <span className="font-semibold">1–2 business days</span>, guaranteed.
              </p>
            </div>

            {/* Instant Chat */}
            <div className="flex-1 bg-white border border-neutral-200 rounded-2xl p-3 sm:p-4 shadow-sm transition hover:shadow-md hover:border-neutral-300">
              <p className="text-[11px] sm:text-sm font-semibold text-neutral-900 mb-1">
                Instant chat
              </p>
              <p className="text-[10px] sm:text-xs text-neutral-700">
                Talk directly with sellers, get quick answers, and agree on details in real time.
              </p>
            </div>

            {/* Seller CTA */}
            <Link
              href="/create-store"
              className="flex-1 bg-neutral-900 text-white border border-neutral-900 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg transition hover:bg-neutral-800 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <p className="text-[11px] sm:text-sm font-semibold mb-1">
                Become a verified seller
              </p>
              <span className="flex items-center gap-2 text-[10px] sm:text-xs font-medium">
                Open your seller dashboard
                <ArrowRightIcon size={16} aria-hidden="true" />
              </span>
            </Link>
          </div>
        </aside>
      </section>

      <CategoriesMarquee />
      <div className="h-12 md:hidden" />
    </div>
  )
}

export default Hero