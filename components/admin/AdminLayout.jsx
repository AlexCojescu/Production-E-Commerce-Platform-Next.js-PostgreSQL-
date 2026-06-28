'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRightIcon, ShieldX } from 'lucide-react'
import { useUser, useAuth } from '@clerk/nextjs'
import axios from 'axios'
import AdminNavbar from './AdminNavbar'
import AdminSidebar from './AdminSidebar'
import { AdminButton, AdminLoading } from './ui'

export default function AdminLayout({ children }) {
  const { user } = useUser()
  const { getToken } = useAuth()

  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const fetchIsAdmin = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get('/api/admin/is-admin', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setIsAdmin(data.isAdmin)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchIsAdmin()
    }
  }, [user])

  useEffect(() => {
    const html = document.documentElement
    const previousHtmlOverflow = html.style.overflow
    const previousBodyOverflow = document.body.style.overflow

    html.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    return () => {
      html.style.overflow = previousHtmlOverflow
      document.body.style.overflow = previousBodyOverflow
    }
  }, [])

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center overflow-hidden bg-slate-50">
        <AdminLoading label="Checking access..." />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center overflow-hidden bg-slate-50 px-6 text-center">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <ShieldX size={24} aria-hidden="true" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            Access denied
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            You are not authorized to access the admin dashboard.
          </p>
          <Link href="/" className="mt-6 inline-block">
            <AdminButton>
              Go to home
              <ArrowRightIcon size={16} aria-hidden="true" />
            </AdminButton>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-slate-50">
      <AdminNavbar
        onMenuToggle={() => setIsMobileOpen((prev) => !prev)}
        isMobileOpen={isMobileOpen}
      />
      <div className="flex min-h-0 flex-1">
        <AdminSidebar
          isMobileOpen={isMobileOpen}
          onClose={() => setIsMobileOpen(false)}
        />
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
