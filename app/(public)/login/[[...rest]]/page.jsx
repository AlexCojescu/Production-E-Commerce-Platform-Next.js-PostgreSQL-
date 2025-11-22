'use client'
import { SignIn, useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"

export default function LoginPage() {
    const { isSignedIn } = useAuth()
    const router = useRouter()

    // Redirect if already signed in
    useEffect(() => {
        if (isSignedIn) {
            router.push('/')
        }
    }, [isSignedIn, router])

    return (
        <div className="min-h-screen flex flex-col bg-white relative">
            {/* Unique Brand Accent Bar */}
            <div className="fixed top-0 left-0 w-full bg-white/70 z-10 border-b border-neutral-100 backdrop-blur-[5px]">
                <div className="max-w-7xl mx-auto flex justify-center py-3">
                    <span className="font-mono text-neutral-900 text-base tracking-widest uppercase border px-4 py-1 rounded-full bg-white shadow-sm border-neutral-200">
                        archi{`{`}ve{`}`} 
                    </span>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-4 py-20">
                <div className="relative w-full max-w-md mx-auto">
                    {/* Decorative Glow Effect */}
                    <div className="absolute inset-0 -z-1 blur-3xl opacity-50 pointer-events-none"
                        style={{
                            background: "radial-gradient(220px 180px at 50% 20%, #f3f4f6 40%, #fff0 100%)"
                        }}>
                    </div>
                    {/* Card */}
                    <div className="relative shadow-xl border border-gray-100 rounded-3xl bg-white/85 backdrop-blur-xl p-8">
                        {/* Welcome Text */}
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-serif font-normal text-neutral-900 mb-4 tracking-tight">
                                Sign In to <span className="font-bold text-neutral-900">ARCHIVE</span>
                            </h1>
                            <p className="text-neutral-500 text-base font-light">
                                Europe’s <span className="underline decoration-neutral-200">curated</span> archive store.  
                                <br />
                                Minimal. Designer. Exclusive.
                            </p>
                        </div>
                        {/* Clerk SignIn Component */}
                        <div className="flex justify-center">
                            <SignIn
                                appearance={{
                                    elements: {
                                        rootBox: "w-full",
                                        card: "shadow-md border border-gray-100 rounded-2xl bg-white/95 backdrop-blur",
                                        headerTitle: "hidden",
                                        headerSubtitle: "hidden",
                                        socialButtonsBlockButton: "border-gray-200 hover:bg-gray-50 text-neutral-700",
                                        socialButtonsBlockButtonText: "font-normal",
                                        formButtonPrimary: "bg-neutral-900 hover:bg-neutral-800 text-sm font-medium",
                                        formFieldInput: "border-gray-200 focus:border-neutral-900 focus:ring-neutral-900 bg-white",
                                        footerActionLink: "text-neutral-900 hover:text-neutral-700",
                                        identityPreviewText: "text-neutral-700",
                                        formFieldLabel: "text-neutral-700",
                                        dividerLine: "bg-gray-200",
                                        dividerText: "text-neutral-500",
                                        formFieldInputShowPasswordButton: "text-neutral-600 hover:text-neutral-900",
                                        formFieldAction: "text-neutral-600 hover:text-neutral-900",
                                        footerAction: "text-neutral-600",
                                        footerActionText: "text-neutral-600",
                                        formResendCodeLink: "text-neutral-900",
                                        otpCodeFieldInput: "border-gray-200",
                                    }
                                }}
                                routing="path" // path-based, required for [[...rest]] catch-all
                                path="/login"
                                signUpUrl="/signup"
                                fallbackRedirectUrl="/"
                            />
                        </div>
                        {/* Additional Info */}
                        <div className="mt-8 text-center">
                            <p className="text-sm text-neutral-600">
                                New to Archive?{' '}
                                <Link href="/signup" className="text-neutral-900 underline font-medium">
                                    Become a member
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-gray-100 mt-10 bg-white/70 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-8 text-base text-neutral-400 tracking-tight">
                    <Link href="/shop" className="hover:text-neutral-900 transition duration-150">
                        Shop
                    </Link>
                    <Link href="/create-store" className="hover:text-neutral-900 transition duration-150">
                        Sell
                    </Link>
                    <Link href="/about" className="hover:text-neutral-900 transition duration-150">
                        About
                    </Link>
                    <Link href="/help" className="hover:text-neutral-900 transition duration-150">
                        Help
                    </Link>
                </div>
                <div className="mt-6 text-xs text-center text-neutral-300">
                    &copy; {new Date().getFullYear()} ARCHIVE. All rights reserved.
                </div>
            </footer>
        </div>
    )
}
