import { cn } from '@/lib/utils'

export function AdminCard({ children, className, padding = true }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200/80 bg-white shadow-sm',
        padding && 'p-5 sm:p-6',
        className
      )}
    >
      {children}
    </div>
  )
}
