'use client'

import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AdminSearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  id = 'admin-search',
  label = 'Search',
  className,
  inputClassName,
  clearButtonClassName,
}) {
  return (
    <div className={cn('relative flex-1', className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <input
        id={id}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={cn(
          'w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-10 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10',
          inputClassName
        )}
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 transition-colors hover:text-slate-600',
            clearButtonClassName
          )}
          aria-label="Clear search"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
