import { cn } from '@/lib/utils'

const variants = {
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
  danger: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
  info: 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/20',
  neutral: 'bg-slate-100 text-slate-600 ring-1 ring-slate-500/10',
}

export function AdminBadge({ children, variant = 'neutral', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
