import { cn } from '@/lib/utils'

export function ChartPanel({
  title,
  description,
  badge,
  children,
  className,
  contentClassName,
  featured = false,
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl ring-1',
        featured
          ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 ring-slate-800'
          : 'bg-white ring-slate-200/70',
        className
      )}
    >
      <div
        className={cn(
          'flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:gap-1 lg:px-5 lg:py-4',
          featured ? 'border-white/10' : 'border-slate-100'
        )}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                'text-sm font-semibold tracking-tight',
                featured ? 'text-white' : 'text-slate-900'
              )}
            >
              {title}
            </h3>
            {badge}
          </div>
          {description && (
            <p
              className={cn(
                'mt-0.5 text-xs leading-relaxed',
                featured ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>
      <div className={cn('p-4 lg:p-5', contentClassName)}>{children}</div>
    </div>
  )
}
