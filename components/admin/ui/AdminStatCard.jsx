import { cn } from '@/lib/utils'

export function AdminStatCard({ title, value, icon: Icon, className }) {
  return (
    <div
      className={cn(
        'flex min-w-[200px] flex-1 items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {title}
        </p>
        <p className="truncate text-2xl font-semibold tabular-nums text-slate-900">
          {value}
        </p>
      </div>
      {Icon && (
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
        </div>
      )}
    </div>
  )
}
