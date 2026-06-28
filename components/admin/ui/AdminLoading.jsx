import { cn } from '@/lib/utils'

export function AdminLoading({ className, label = 'Loading...' }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-24',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="size-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
      <span className="sr-only">{label}</span>
    </div>
  )
}
