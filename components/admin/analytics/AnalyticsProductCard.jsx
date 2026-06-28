import Image from 'next/image'
import { Calendar, Clock, Pencil } from 'lucide-react'
import { AdminBadge, AdminButton } from '@/components/admin/ui'
import { cn } from '@/lib/utils'

export function AnalyticsProductCard({
  product,
  currency,
  formatPrice,
  formatPercent,
  formatDate,
  inventoryAge,
  onEdit,
}) {
  const margin = product.metrics?.margin
  const roi = product.metrics?.roi

  return (
    <article
      className={cn(
        'group rounded-2xl bg-white p-3 ring-1 ring-slate-200/70 transition-all max-lg:p-3 lg:p-4',
        'hover:shadow-md hover:ring-slate-300/80'
      )}
    >
      <div className="flex gap-3">
        {product.images?.[0] && (
          <Image
            src={product.images[0]}
            alt=""
            width={56}
            height={56}
            className="size-12 shrink-0 rounded-xl object-cover ring-1 ring-slate-200 lg:size-14"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 max-lg:gap-1.5 lg:flex-row lg:items-start lg:justify-between lg:gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-slate-900">{product.name}</h3>
              <p className="truncate text-xs text-slate-500">
                {product.brand || '—'} · {product.store?.name || '—'}
              </p>
            </div>
            <AdminBadge
              variant={product.sold ? 'danger' : 'success'}
              className="w-fit shrink-0"
            >
              {product.sold ? 'Sold' : 'Listed'}
            </AdminBadge>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <MetricPill label="Acquired" value={formatPrice(product.acquiredPrice)} />
            <MetricPill label="Sold / List" value={formatPrice(product.metrics?.priceSold)} />
            <MetricPill
              label="Margin"
              value={product.metrics?.hasCost ? formatPrice(margin) : '—'}
              tone={margin > 0 ? 'profit' : margin < 0 ? 'loss' : 'neutral'}
            />
            <MetricPill
              label="ROI"
              value={product.metrics?.hasCost ? formatPercent(roi) : '—'}
              tone={roi > 0 ? 'profit' : roi < 0 ? 'loss' : 'neutral'}
            />
          </div>

          <div className="mt-3 flex flex-col gap-1.5 text-[11px] text-slate-500 max-lg:gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-3 lg:gap-y-1">
            <span className="inline-flex items-center gap-1">
              <Calendar size={12} aria-hidden="true" />
              Bought {formatDate(product.dateBought)}
            </span>
            {product.sold && (
              <span className="inline-flex items-center gap-1">
                <Calendar size={12} aria-hidden="true" />
                Sold {formatDate(product.dateSold)}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock size={12} aria-hidden="true" />
              {inventoryAge}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 border-t border-slate-100 pt-3 max-lg:pt-3 lg:flex lg:justify-end">
        <AdminButton
          variant="secondary"
          size="sm"
          className="max-lg:min-h-11 max-lg:w-full lg:min-h-8 lg:w-auto"
          onClick={() => onEdit(product)}
        >
          <Pencil size={14} aria-hidden="true" />
          Edit inventory
        </AdminButton>
      </div>
    </article>
  )
}

function MetricPill({ label, value, tone = 'neutral' }) {
  const tones = {
    profit: 'text-emerald-700 bg-emerald-50 ring-emerald-100',
    loss: 'text-red-700 bg-red-50 ring-red-100',
    neutral: 'text-slate-800 bg-slate-50 ring-slate-100',
  }

  return (
    <div className={cn('rounded-lg px-2.5 py-1.5 ring-1', tones[tone])}>
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums">{value}</p>
    </div>
  )
}
