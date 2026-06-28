import { cn } from '@/lib/utils'

const selectChevronClass =
  'appearance-none bg-[length:16px_16px] bg-[right_0.75rem_center] bg-no-repeat pr-10'

const selectChevronStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
}

export function AdminSelect({ label, id, className, children, style, ...props }) {
  const selectId = id || props.name

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800',
          'focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10',
          selectChevronClass,
          className
        )}
        style={{ ...selectChevronStyle, ...style }}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}
