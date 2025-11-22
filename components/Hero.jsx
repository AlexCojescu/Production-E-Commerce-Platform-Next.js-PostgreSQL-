'use client'
import { ArrowRightIcon, ChevronRightIcon } from 'lucide-react'
import React from 'react'
import Link from 'next/link'
import CategoriesMarquee from './CategoriesMarquee'

const Hero = () => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    return (
        <div className="mx-auto px-4 max-w-6xl">
            <div className="flex flex-col lg:flex-row gap-8 my-10 md:my-16">
                {/* Main Hero Content */}
                <div className="flex-1 flex flex-col bg-white border border-neutral-200 rounded-3xl min-h-[320px] shadow-lg transition duration-300 hover:shadow-2xl hover:scale-[1.01]">
                    <div className="p-7 md:p-12">
                        {/* Authentic Vendors Pill */}
                        <div className="inline-flex items-center gap-2 bg-neutral-100 pr-3 py-1 rounded-full text-xs text-neutral-700 font-semibold mb-3">
                            <span className="bg-neutral-900 px-2.5 py-1 rounded-full text-white mr-2">100% AUTHENTIC</span>
                            Verified Vendors Only
                            <ChevronRightIcon className="ml-1" size={16} />
                        </div>
                        {/* Bold, Trust-Building Title */}
                        <h2 className="text-4xl md:text-5xl font-semibold text-neutral-900 mt-3 mb-4 max-w-xl leading-tight">
                            Buy from Trusted Stores. Connect Direct with Sellers.
                        </h2>
                        {/* Benefit Subhead */}
                        <p className="text-lg md:text-xl text-neutral-700 font-light max-w-lg mb-6">
                            Every store is verified, every item ships same day or in 1-2 business days—guaranteed. Message sellers instantly with zero communication restrictions.
                        </p>
                        {/* Social Trust Pill */}
                        <div className="inline-flex items-center gap-2 bg-neutral-50 pr-4 py-1 rounded-full text-xs text-neutral-600 transition hover:bg-neutral-100 cursor-pointer">
                            <span className="font-medium text-neutral-900">No Scams. No Catch.</span>
                            Just Creative Community.
                        </div>
                        {/* CTA */}
                        <button className="bg-neutral-900 text-white text-base py-3 px-8 mt-7 rounded-full font-semibold shadow-md transition duration-200 hover:bg-neutral-800 hover:shadow-xl">
                            SHOP AUTHENTIC PIECES
                        </button>
                    </div>
                </div>

                {/* Info Panels */}
                <div className="flex flex-col gap-6 w-full lg:max-w-xs">
                    {/* Verified Seller Guarantee */}
                    <div className="flex-1 bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm transition hover:shadow-md hover:border-neutral-300 cursor-pointer">
                        <p className="text-xl font-semibold text-neutral-900 mb-2">Fast Shipping</p>
                        <p className="text-sm text-neutral-700">Same day or <span className="font-bold">1-2 business days</span>—guaranteed.</p>
                    </div>

                    {/* Direct Communication Panel */}
                    <div className="flex-1 bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm transition hover:shadow-md hover:border-neutral-300 cursor-pointer">
                        <p className="text-xl font-semibold text-neutral-900 mb-2">Instant Chat</p>
                        <p className="text-sm text-neutral-700">Connect direct with sellers, get instant responses, no limits.</p>
                    </div>

                    {/* Seller Dashboard Link */}
                    <Link href="/create-store" className="flex-1 bg-neutral-900 text-white border border-neutral-900 rounded-3xl p-6 shadow-lg transition hover:bg-neutral-800 hover:shadow-xl">
                        <p className="text-xl font-semibold mb-1">Become a Verified Seller</p>
                        <span className="flex items-center gap-2 text-sm font-medium hover:underline">
                            Go to Seller Dashboard
                            <ArrowRightIcon size={16} />
                        </span>
                    </Link>
                </div>
            </div>
            <CategoriesMarquee />
        </div>
    )
}

export default Hero
