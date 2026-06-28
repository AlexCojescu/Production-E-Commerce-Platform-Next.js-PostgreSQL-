import { cn } from '@/lib/utils'

export function AdminSection({ title, description, children, className }) {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="border-b border-slate-100 pb-3">
          {title && (
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  )
}
