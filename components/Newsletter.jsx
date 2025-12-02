'use client'
import React, { useState } from 'react'
import Title from './Title'

const Newsletter = () => {
    const [email, setEmail] = useState('')
    const [isSubscribed, setIsSubscribed] = useState(false)

    const handleSubscribe = (e) => {
        e.preventDefault()
        if (email) {
            setIsSubscribed(true)
            setEmail('')
            setTimeout(() => setIsSubscribed(false), 3000)
        }
    }

    return (
        <section className='py-16 sm:py-24 px-4'>
            <div className='max-w-2xl mx-auto'>
                {/* Header */}
                <Title 
                    title="Stay Updated" 
                    description="Receive curated collections, rare finds, and exclusive releases. Delivered weekly to your inbox." 
                    visibleButton={false} 
                />

                {/* Newsletter Form */}
                <form onSubmit={handleSubscribe} className='mt-8 sm:mt-12 flex flex-col sm:flex-row gap-3 sm:gap-0'>
                    <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='your@email.com' 
                        className='flex-1 px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-base outline-none border border-neutral-200 bg-white text-neutral-900 placeholder-neutral-400'
                        required
                    />
                    <button 
                        type='submit'
                        className='px-6 sm:px-8 py-3 sm:py-3.5 bg-neutral-900 text-white text-sm sm:text-base font-medium hover:bg-neutral-800 transition duration-200'
                    >
                        Subscribe
                    </button>
                </form>

                {/* Success Message */}
                {isSubscribed && (
                    <p className='mt-4 text-center text-sm text-green-600 font-medium'>
                        ✓ Thank you for subscribing
                    </p>
                )}

                {/* Trust Footer */}
                <p className='mt-6 sm:mt-8 text-center text-xs text-neutral-400'>
                    No spam. Unsubscribe anytime. We respect your privacy.
                </p>
            </div>
        </section>
    )
}

export default Newsletter
