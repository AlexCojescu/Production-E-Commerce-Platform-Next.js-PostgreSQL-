import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdminButton } from './AdminButton'

export function AdminEmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className,
  icon: Icon = Inbox,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center',
        className
      )}
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 ring-1 ring-slate-100">
        <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
      </div>
      <p className="text-base font-medium text-slate-800">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <AdminButton
          variant="secondary"
          size="sm"
          className="mt-5"
          onClick={onAction}
        >
          {actionLabel}
        </AdminButton>
      )}
    </div>
  )
}
