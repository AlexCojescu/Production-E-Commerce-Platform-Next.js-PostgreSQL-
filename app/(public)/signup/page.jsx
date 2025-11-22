'use client'
import { SignUp, useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"

export default function SignupPage() {
    const { isSignedIn } = useAuth()
    const router = useRouter()

    // Redirect if already signed in
    useEffect(() => {
        if (isSignedIn) {
            router.push('/')
        }
    }, [isSignedIn, router])

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header with Logo */}
            <div className="w-full py-6 px-6 border-b border-gray-100">
                <Link href="/" className="text-2xl font-semibold text-neutral-800 tracking-tight">
                    <span className="text-neutral-600">vette</span>clothing<span className="text-neutral-600 text-3xl align-top">.</span>
                </Link>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    {/* Welcome Text */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-light text-neutral-900 mb-2">
                            Join vetteclothing
                        </h1>
                        <p className="text-neutral-600 text-sm">
                            Create an account to start your archive clothing journey
                        </p>
                    </div>

                    {/* Clerk SignUp Component */}
                    <div className="flex justify-center">
                        <SignUp
                            appearance={{
                                elements: {
                                    rootBox: "w-full",
                                    card: "shadow-lg border border-gray-100 rounded-2xl bg-white",
                                    headerTitle: "hidden",
                                    headerSubtitle: "hidden",
                                    socialButtonsBlockButton: "border-gray-200 hover:bg-gray-50 text-neutral-700",
                                    socialButtonsBlockButtonText: "font-normal",
                                    formButtonPrimary: "bg-neutral-900 hover:bg-neutral-800 text-sm font-medium",
                                    formFieldInput: "border-gray-200 focus:border-neutral-900 focus:ring-neutral-900",
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
                            routing="path"
                            path="/signup"
                            signInUrl="/login"
                            fallbackRedirectUrl="/"
                        />
                    </div>

                    {/* Additional Info */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-neutral-600">
                            Already have an account?{' '}
                            <Link href="/login" className="text-neutral-900 font-medium hover:underline">
                                Sign in here
                            </Link>
                        </p>
                    </div>

                    {/* Features */}
                    <div className="mt-12 grid grid-cols-3 gap-6 text-center">
                        <div>
                            <div className="text-2xl mb-2">🛍️</div>
                            <p className="text-xs text-neutral-600">Curated Selection</p>
                        </div>
                        <div>
                            <div className="text-2xl mb-2">❤️</div>
                            <p className="text-xs text-neutral-600">Save Favorites</p>
                        </div>
                        <div>
                            <div className="text-2xl mb-2">🚀</div>
                            <p className="text-xs text-neutral-600">Fast Checkout</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="py-6 px-6 border-t border-gray-100">
                <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-6 text-sm text-neutral-500">
                    <Link href="/shop" className="hover:text-neutral-900 transition">
                        Shop
                    </Link>
                    <Link href="/create-store" className="hover:text-neutral-900 transition">
                        Sell
                    </Link>
                    <Link href="/" className="hover:text-neutral-900 transition">
                        About
                    </Link>
                    <Link href="/" className="hover:text-neutral-900 transition">
                        Help
                    </Link>
                </div>
            </div>
        </div>
    )
}
