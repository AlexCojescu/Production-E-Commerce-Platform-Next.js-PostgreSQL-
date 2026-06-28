import { cn } from '@/lib/utils'

export function AdminInput({ label, id, className, error, ...props }) {
  const inputId = id || props.name

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800',
          'placeholder:text-slate-400',
          'focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10',
          'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60',
          error && 'border-red-300 focus:border-red-400 focus:ring-red-500/10',
          className
        )}
        {...props}
      />
    </div>
  )
}
