'use client'

import Image from 'next/image'
import { MapPin, Mail, Phone } from 'lucide-react'
import { AdminBadge } from './ui'

const statusVariant = {
  pending: 'warning',
  rejected: 'danger',
  approved: 'success',
}

export default function StoreInfo({ store }) {
  const appliedDate = new Date(store.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="min-w-0 flex-1 space-y-4 max-lg:space-y-3 lg:space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-4">
        <Image
          width={72}
          height={72}
          src={store.logo}
          alt={store.name}
          className="size-14 shrink-0 rounded-xl border border-slate-100 bg-slate-50 object-contain p-1 lg:size-16"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1.5 max-lg:gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:gap-2">
            <h3 className="truncate text-base font-semibold text-slate-900 lg:text-lg">
              {store.name}
            </h3>
            <span className="text-sm text-slate-500">@{store.username}</span>
            <AdminBadge variant={statusVariant[store.status] || 'neutral'}>
              {store.status}
            </AdminBadge>
          </div>
          {store.description && (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
              {store.description}
            </p>
          )}
        </div>
      </div>

      <dl className="grid gap-3 text-sm lg:grid-cols-2">
        <div className="flex items-start gap-2 text-slate-600">
          <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
          <dd className="min-w-0 break-words">{store.address}</dd>
        </div>
        <div className="flex items-start gap-2 text-slate-600">
          <Phone size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
          <dd className="min-w-0 break-words">{store.contact}</dd>
        </div>
        <div className="flex items-start gap-2 text-slate-600 lg:col-span-2">
          <Mail size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
          <dd className="min-w-0 break-all">{store.email}</dd>
        </div>
      </dl>

      <div className="border-t border-slate-100 pt-3 lg:pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Applied {appliedDate}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <Image
            width={36}
            height={36}
            src={store.user.image}
            alt={store.user.name}
            className="size-9 shrink-0 rounded-full ring-2 ring-slate-100"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800">
              {store.user.name}
            </p>
            <p className="truncate text-xs text-slate-500">{store.user.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
