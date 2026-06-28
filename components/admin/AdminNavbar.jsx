'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { UserButton, useUser } from '@clerk/nextjs'

export default function AdminNavbar({ onMenuToggle, isMobileOpen }) {
  const { user } = useUser()

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-slate-200 bg-white">
      <div className="flex h-14 items-center justify-between gap-4 px-4 sm:h-[3.75rem] sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="inline-flex size-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label={
              isMobileOpen ? 'Close navigation menu' : 'Open navigation menu'
            }
            aria-expanded={isMobileOpen}
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link
            href="/"
            className="group flex min-w-0 items-baseline gap-0.5 truncate text-lg font-semibold tracking-tight text-slate-900 sm:text-xl"
          >
            <span className="text-slate-500 transition-colors group-hover:text-slate-700">
              vette
            </span>
            clothing
            <span className="text-slate-400">.</span>
            <span className="ml-2 inline-flex shrink-0 items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600 ring-1 ring-slate-200">
              Admin
            </span>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-800">
              {user?.firstName || 'Admin'}
            </p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'size-8 sm:size-9 ring-2 ring-slate-100',
              },
            }}
          />
        </div>
      </div>
    </header>
  )
}
