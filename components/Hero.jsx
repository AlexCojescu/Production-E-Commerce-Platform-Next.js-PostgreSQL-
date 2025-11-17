'use client'
import { assets } from '@/assets/assets'
import { ArrowRightIcon, ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import CategoriesMarquee from './CategoriesMarquee'

const Hero = () => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    return (
        <div className="mx-4">
            <div className="flex flex-col xl:flex-row gap-6 max-w-5xl mx-auto my-8">
                {/* Main Archive Section */}
                <div className="relative flex-1 flex flex-col bg-neutral-100 border rounded-xl min-h-60 group">
                    <div className="p-5">
                        <div className="inline-flex items-center gap-2 bg-neutral-200 pr-2 py-0.5 rounded text-xs text-neutral-700">
                            <span className="bg-neutral-700 px-2 py-0.5 rounded text-white text-xs">NEWS</span>
                            Free Shipping on Orders Above $50!
                            <ChevronRightIcon className="ml-1 transition-all" size={16} />
                        </div>
                        <h2 className="text-xl sm:text-3xl leading-tight my-2 font-normal text-neutral-800 max-w-xs">
                            Archive Clothing, Minimal Styles.
                        </h2>
                        <div className="text-neutral-700 text-xs font-medium mt-4">
                            <p>Starts from</p>
                            <p className="text-xl">{currency}4.90</p>
                        </div>
                        <button className="bg-neutral-800 text-white text-xs py-2 px-6 mt-4 rounded hover:bg-neutral-900 transition">
                            LEARN MORE
                        </button>
                    </div>
                    <Image className="w-full sm:max-w-xs mt-2" src={assets.hero_model_img} alt="" />
                </div>
                {/* Info Panels */}
                <div className="flex flex-col gap-3 w-full max-w-xs text-xs text-neutral-700">
                    <div className="flex items-center justify-between bg-neutral-100 border rounded-xl p-4 group">
                        <div>
                            <p className="text-xl font-normal text-neutral-800">Best pieces</p>
                            <p className="flex items-center gap-1 mt-2">
                                View more
                                <ArrowRightIcon className="ml-1 transition-all" size={16} />
                            </p>
                        </div>
                        <Image className="w-20" src={assets.hero_product_img1} alt="" />
                    </div>
                    <div className="flex items-center justify-between bg-neutral-100 border rounded-xl p-4 group">
                        <div>
                            <p className="text-xl font-normal text-neutral-800">Season promotions</p>
                            <p className="flex items-center gap-1 mt-2">
                                View more
                                <ArrowRightIcon className="ml-1 transition-all" size={16} />
                            </p>
                        </div>
                        <Image className="w-20" src={assets.hero_product_img2} alt="" />
                    </div>
                </div>
            </div>
            <CategoriesMarquee />
        </div>
    )
}

export default Hero
