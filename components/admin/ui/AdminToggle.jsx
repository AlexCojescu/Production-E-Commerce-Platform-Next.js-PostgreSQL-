'use client'

import { cn } from '@/lib/utils'

export function AdminToggle({
  checked,
  onChange,
  label,
  srLabel,
  size = 'md',
  activeColor = 'peer-checked:bg-emerald-600',
  className,
}) {
  const sizes = {
    sm: { track: 'h-5 w-9', dot: 'size-3 peer-checked:translate-x-4', offset: 'left-1 top-1' },
    md: { track: 'h-6 w-11', dot: 'size-4 peer-checked:translate-x-5', offset: 'left-1 top-1' },
  }

  const s = sizes[size]

  return (
    <label
      className={cn(
        'inline-flex cursor-pointer items-center gap-3',
        className
      )}
    >
      {srLabel && <span className="sr-only">{srLabel}</span>}
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={onChange}
      />
      <span className="relative inline-flex shrink-0">
        <span
          className={cn(
            'block rounded-full bg-slate-300 transition-colors duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-slate-400 peer-focus-visible:ring-offset-2',
            s.track,
            activeColor
          )}
        />
        <span
          className={cn(
            'pointer-events-none absolute rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out',
            s.dot,
            s.offset
          )}
        />
      </span>
      {label && <span className="text-sm text-slate-600">{label}</span>}
    </label>
  )
}
