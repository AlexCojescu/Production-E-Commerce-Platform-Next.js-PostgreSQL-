import { cn } from '@/lib/utils'

const accents = {
  default: {
    ring: 'ring-slate-200/70',
    icon: 'bg-slate-100 text-slate-600',
    value: 'text-slate-900',
  },
  profit: {
    ring: 'ring-emerald-200/80',
    icon: 'bg-emerald-50 text-emerald-600',
    value: 'text-emerald-700',
  },
  roi: {
    ring: 'ring-sky-200/80',
    icon: 'bg-sky-50 text-sky-600',
    value: 'text-sky-700',
  },
  age: {
    ring: 'ring-amber-200/80',
    icon: 'bg-amber-50 text-amber-600',
    value: 'text-amber-700',
  },
  dark: {
    ring: 'ring-slate-800',
    icon: 'bg-white/10 text-white',
    value: 'text-white',
  },
}

export function AnalyticsMetricCard({
  title,
  value,
  hint,
  icon: Icon,
  accent = 'default',
  featured = false,
  className,
}) {
  const style = accents[accent] || accents.default

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-5 ring-1 transition-shadow hover:shadow-md',
        featured
          ? 'bg-slate-900 ring-slate-800 shadow-lg shadow-slate-900/10'
          : 'bg-white',
        !featured && style.ring,
        className
      )}
    >
      {featured && (
        <div
          className="pointer-events-none absolute -right-6 -top-6 size-28 rounded-full bg-emerald-500/10 blur-2xl"
          aria-hidden="true"
        />
      )}
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p
            className={cn(
              'text-[11px] font-semibold uppercase tracking-widest',
              featured ? 'text-slate-400' : 'text-slate-500'
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              'truncate text-2xl font-semibold tracking-tight tabular-nums',
              featured ? 'text-white' : style.value
            )}
          >
            {value}
          </p>
          {hint && (
            <p
              className={cn(
                'text-xs leading-relaxed',
                featured ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              {hint}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-xl',
              featured ? style.icon : style.icon
            )}
          >
            <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  )
}
