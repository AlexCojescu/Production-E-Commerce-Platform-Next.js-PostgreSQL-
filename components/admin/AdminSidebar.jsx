'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  ShieldCheckIcon,
  StoreIcon,
  TicketPercentIcon,
  ShoppingBagIcon,
  UsersIcon,
  LineChartIcon,
  X,
} from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { cn } from '@/lib/utils'

const sidebarLinks = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Stores', href: '/admin/stores', icon: StoreIcon },
  { name: 'Products', href: '/admin/products', icon: ShoppingBagIcon },
  { name: 'Analytics', href: '/admin/graph', icon: LineChartIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Approve Store', href: '/admin/approve', icon: ShieldCheckIcon },
  { name: 'Coupons', href: '/admin/coupons', icon: TicketPercentIcon },
]

function NavContent({ pathname, onNavigate, showClose }) {
  const { user } = useUser()

  if (!user) return null

  return (
    <>
      <div className="flex items-center justify-between px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          Menu
        </p>
        {showClose && (
          <button
            type="button"
            onClick={onNavigate}
            className="inline-flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close navigation menu"
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="mx-3 mb-3 rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-100">
        <div className="flex items-center gap-3">
          <Image
            className="size-9 rounded-full ring-2 ring-white"
            src={user.imageUrl}
            alt=""
            width={36}
            height={36}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">
              {user.fullName}
            </p>
            <p className="truncate text-xs text-slate-500">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
      </div>

      <nav
        className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4"
        aria-label="Admin navigation"
      >
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                size={18}
                strokeWidth={isActive ? 2.25 : 2}
                className={cn(
                  'shrink-0',
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 group-hover:text-slate-600'
                )}
                aria-hidden="true"
              />
              <span>{link.name}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}

export default function AdminSidebar({ isMobileOpen, onClose }) {
  const pathname = usePathname()

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
          onClick={onClose}
          aria-label="Close navigation menu"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[17.5rem] flex-col border-r border-slate-200 bg-white shadow-lg transition-transform duration-300 ease-out lg:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-hidden={!isMobileOpen}
      >
        <NavContent pathname={pathname} onNavigate={onClose} showClose />
      </aside>

      <aside className="hidden h-full w-60 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex xl:w-64">
        <NavContent pathname={pathname} />
      </aside>
    </>
  )
}
