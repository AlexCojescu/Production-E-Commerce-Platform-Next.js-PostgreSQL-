'use client'
import { ArrowRightIcon, ChevronRightIcon } from 'lucide-react'
import React from 'react'
import Link from 'next/link'
import CategoriesMarquee from './CategoriesMarquee'

const Hero = () => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    return (
        <div className="mx-auto px-4 max-w-6xl">
            <div className="flex flex-col lg:flex-row gap-6 my-10 md:my-16">
                
                {/* 1. Main Archive Section (Larger Panel) */}
                <div className="flex-1 flex flex-col bg-white border border-neutral-200 rounded-3xl min-h-[300px] shadow-lg transition duration-300 hover:shadow-xl hover:scale-[1.005]">
                    <div className="p-6 md:p-10">
                        {/* News/Banner Pill */}
                        <div className="inline-flex items-center gap-2 bg-neutral-50 pr-3 py-1 rounded-full text-xs text-neutral-500 transition duration-200 hover:bg-neutral-100 cursor-pointer">
                            <span className="bg-neutral-800 px-2.5 py-1 rounded-full text-white font-medium">NEWS</span>
                            Free Shipping on Orders Above {currency}50!
                            <ChevronRightIcon className="ml-1" size={16} />
                        </div>
                        {/* Title */}
                        <h2 className="text-4xl md:text-5xl font-light text-neutral-900 mt-6 mb-4 max-w-md leading-tight">
                            **Archive Clothing, Minimal Styles.**
                        </h2>
                        {/* Price Callout */}
                        <div className="text-neutral-700 text-sm font-medium mt-6">
                            <p>Starts from</p>
                            <p className="text-3xl font-bold text-neutral-900">{currency}4.90</p>
                        </div>
                        {/* CTA Button */}
                        <button className="bg-neutral-900 text-white text-base py-3 px-8 mt-7 rounded-full font-medium shadow-md transition duration-200 hover:bg-neutral-800 hover:shadow-lg">
                            SHOP THE COLLECTION
                        </button>
                    </div>
                </div>

                {/* 2. Info Panels (Stacked on Mobile, Side-by-Side on Desktop) */}
                <div className="flex flex-col gap-6 w-full lg:max-w-xs">
                    
                    {/* Panel 1: Best Pieces */}
                    <div className="flex-1 bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm transition duration-200 hover:shadow-md hover:border-neutral-300 cursor-pointer">
                        <p className="text-xl font-light text-neutral-900">Best pieces</p>
                        <button className="flex items-center gap-2 text-neutral-500 mt-2 text-sm hover:text-neutral-900 transition">
                            View more
                            <ArrowRightIcon size={16} />
                        </button>
                    </div>

                    {/* Panel 2: Season Promotions */}
                    <div className="flex-1 bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm transition duration-200 hover:shadow-md hover:border-neutral-300 cursor-pointer">
                        <p className="text-xl font-light text-neutral-900">Season promotions</p>
                        <button className="flex items-center gap-2 text-neutral-500 mt-2 text-sm hover:text-neutral-900 transition">
                            View more
                            <ArrowRightIcon size={16} />
                        </button>
                    </div>

                    {/* Panel 3: Seller Dashboard Link (NEW) */}
                    <Link href="/store" className="flex-1 bg-neutral-900 text-white border border-neutral-900 rounded-3xl p-6 shadow-lg transition duration-200 hover:bg-neutral-800 hover:shadow-xl">
                        <p className="text-xl font-light">Selling on Archive?</p>
                        <span className="flex items-center gap-2 mt-2 text-sm font-medium hover:underline">
                            Visit your Store Dashboard
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