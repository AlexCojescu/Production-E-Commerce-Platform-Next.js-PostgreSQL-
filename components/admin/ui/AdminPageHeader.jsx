export function AdminPageHeader({ title, highlight, description, meta, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.75rem]">
          {title}{' '}
          {highlight && (
            <span className="font-normal text-slate-500">{highlight}</span>
          )}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">
            {description}
          </p>
        )}
        {meta && (
          <div className="mt-3 inline-flex items-center rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-600 ring-1 ring-slate-200/80">
            {meta}
          </div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
