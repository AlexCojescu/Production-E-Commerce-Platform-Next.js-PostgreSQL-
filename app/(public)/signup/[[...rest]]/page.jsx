"use client"

import { SignUp, useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Monsieur_La_Doulaise } from "next/font/google"

const monsieur = Monsieur_La_Doulaise({
  weight: "400",
  subsets: ["latin"],
})

export default function SignupPage() {
  const { isSignedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isSignedIn) {
      router.push("/")
    }
  }, [isSignedIn, router])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with script logo, no borders */}

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 pt-6 pb-20">
        <div className="relative w-full max-w-2xl mx-auto">
          {/* Soft glow */}
          <div
            className="absolute inset-0 -z-10 blur-3xl opacity-60 pointer-events-none"
            style={{
              background:
                "radial-gradient(260px 220px at 50% 10%, #e5e7eb 35%, #ffffff 100%)",
            }}
          />

          <div className="space-y-10">
            {/* Welcome Text */}
            <div className="text-center">
              <span className="block text-base sm:text-lg uppercase tracking-[0.25em] text-neutral-400 mb-4">
                Join
              </span>
              <span
                className={`${monsieur.className} block text-5xl sm:text-6xl text-neutral-900`}
              >
                Vette<span className="text-neutral-900">Clothing</span>
              </span>

              <p className="mt-6 text-neutral-500 text-lg sm:text-xl leading-relaxed">
                Create an account to start your archive clothing journey. Save
                favorites, follow stores, and check out faster.
              </p>
            </div>

            {/* Clerk SignUp Component */}
            <div className="flex justify-center">
              <SignUp
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card:
                      "w-full bg-white/95 backdrop-blur-lg shadow-lg rounded-3xl px-8 py-8 sm:px-10 sm:py-10 border-0",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton:
                      "border border-gray-200 hover:bg-gray-50 text-neutral-700 text-base",
                    socialButtonsBlockButtonText: "font-normal",
                    formButtonPrimary:
                      "bg-neutral-900 hover:bg-neutral-800 text-base font-medium rounded-full py-3",
                    formFieldInput:
                      "border border-gray-200 focus:border-neutral-900 focus:ring-neutral-900 bg-white rounded-xl text-base",
                    footerActionLink:
                      "text-neutral-900 hover:text-neutral-700 text-base",
                    identityPreviewText: "text-neutral-700 text-base",
                    formFieldLabel: "text-neutral-700 text-base",
                    dividerLine: "bg-gray-200",
                    dividerText: "text-neutral-500 text-sm",
                    formFieldInputShowPasswordButton:
                      "text-neutral-600 hover:text-neutral-900 text-sm",
                    formFieldAction:
                      "text-neutral-600 hover:text-neutral-900 text-sm",
                    footerAction: "text-neutral-600 text-sm",
                    footerActionText: "text-neutral-600 text-sm",
                    formResendCodeLink: "text-neutral-900 text-sm",
                    otpCodeFieldInput:
                      "border-gray-200 rounded-xl text-base",
                  },
                }}
                routing="path"
                path="/signup"
                signInUrl="/login"
                fallbackRedirectUrl="/"
              />
            </div>

            {/* Additional Info */}
            <div className="text-center">
              <p className="text-base sm:text-lg text-neutral-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-neutral-900 font-semibold hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
