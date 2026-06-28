import { cn } from '@/lib/utils'

export function AdminTable({ children, className }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm',
        className
      )}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}

export function AdminTableHeader({ children }) {
  return (
    <thead className="border-b border-slate-200 bg-slate-50">
      {children}
    </thead>
  )
}

export function AdminTableBody({ children }) {
  return (
    <tbody className="divide-y divide-slate-100 text-slate-700">
      {children}
    </tbody>
  )
}

export function AdminTableRow({ children, className }) {
  return (
    <tr
      className={cn(
        'transition-colors duration-150 hover:bg-slate-50/80',
        className
      )}
    >
      {children}
    </tr>
  )
}

export function AdminTableHead({ children, className, align = 'left' }) {
  const alignClass =
    align === 'center'
      ? 'text-center'
      : align === 'right'
        ? 'text-right'
        : 'text-left'

  return (
    <th
      scope="col"
      className={cn(
        'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500',
        alignClass,
        className
      )}
    >
      {children}
    </th>
  )
}

export function AdminTableCell({ children, className, align = 'left' }) {
  const alignClass =
    align === 'center'
      ? 'text-center'
      : align === 'right'
        ? 'text-right'
        : 'text-left'

  return (
    <td className={cn('px-4 py-3.5 text-sm', alignClass, className)}>
      {children}
    </td>
  )
}
