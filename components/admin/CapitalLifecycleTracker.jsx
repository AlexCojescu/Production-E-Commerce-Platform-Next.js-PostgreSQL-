'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Clock3,
  Package,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { ChartPanel } from '@/components/admin/analytics/ChartPanel'
import { AdminBadge } from '@/components/admin/ui'
import {
  buildCapitalLifecycleRows,
  computeCapitalLifecycleSummary,
  formatLifecycleDate,
  getZoneWidths,
  groupLifecycleRows,
  LIQUIDITY_WINDOW_DAYS,
  sortLifecycleRows,
} from '@/lib/capitalLifecycle'
import { formatInventoryAge } from '@/lib/inventoryMetrics'
import { cn } from '@/lib/utils'

const FILTERS = [
  { id: 'all', label: 'All items' },
  { id: 'listed', label: 'Listed' },
  { id: 'sold', label: 'Sold' },
]

function formatCurrency(value, symbol = '$') {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return `${symbol}${Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

function SummaryStat({ label, value, hint, icon: Icon, tone = 'default' }) {
  const tones = {
    default: 'bg-slate-50 ring-slate-200/80 text-slate-900',
    profit: 'bg-emerald-50 ring-emerald-200/80 text-emerald-800',
    warn: 'bg-amber-50 ring-amber-200/80 text-amber-800',
    danger: 'bg-orange-50 ring-orange-200/80 text-orange-800',
  }

  return (
    <div className={cn('rounded-xl p-3 ring-1', tones[tone])}>
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon size={14} className="shrink-0 opacity-70" aria-hidden="true" />
        )}
        <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
          {label}
        </p>
      </div>
      <p className="mt-1 text-lg font-semibold tabular-nums tracking-tight">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] leading-snug opacity-70">{hint}</p>}
    </div>
  )
}

function LifecycleRow({ row, currency }) {
  const { greenPct, stressPct } = getZoneWidths(row.totalDays)
  const phase = row.sold ? 'closed' : row.stressDays > 0 ? 'stressed' : 'liquid'

  const phaseStyles = {
    liquid: { track: 'bg-emerald-100' },
    stressed: { track: 'bg-amber-100' },
    closed: { track: 'bg-slate-100' },
  }

  const style = phaseStyles[phase]

  return (
    <article className="group rounded-xl bg-white p-3 ring-1 ring-slate-200/80 transition-shadow hover:shadow-sm hover:ring-slate-300/80">
      <div className="flex gap-3">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200">
          {row.image ? (
            <Image
              src={row.image}
              alt=""
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-slate-400">
              <Package size={18} aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 max-lg:items-start lg:flex-row lg:flex-wrap lg:items-start lg:justify-between lg:gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {row.name}
              </p>
              <p className="truncate text-xs text-slate-500">
                {row.brand}
                {row.storeName ? ` · ${row.storeName}` : ''}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 max-lg:w-full">
              <AdminBadge variant={row.sold ? 'neutral' : 'info'}>
                {row.sold ? 'Sold' : 'Listed'}
              </AdminBadge>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ring-1',
                  phase === 'liquid' && 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
                  phase === 'stressed' && 'bg-amber-50 text-amber-700 ring-amber-200/80',
                  phase === 'closed' && 'bg-slate-100 text-slate-600 ring-slate-200/80'
                )}
              >
                <Clock3 size={11} aria-hidden="true" />
                {formatInventoryAge(row.totalDays)}
              </span>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={11} aria-hidden="true" />
              {formatLifecycleDate(row.dateBought)}
            </span>
            <ArrowRight size={11} className="text-slate-300" aria-hidden="true" />
            <span>
              {row.sold
                ? formatLifecycleDate(row.dateSold)
                : 'Today'}
            </span>
            {row.hasCost && (
              <>
                <span className="text-slate-300" aria-hidden="true">
                  ·
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                  <Wallet size={11} aria-hidden="true" />
                  {formatCurrency(row.acquiredPrice, currency)} in
                  {row.sold && row.margin != null && (
                    <span
                      className={cn(
                        'ml-1 font-semibold',
                        row.margin >= 0 ? 'text-emerald-600' : 'text-red-600'
                      )}
                    >
                      · {row.margin >= 0 ? '+' : ''}
                      {formatCurrency(row.margin, currency)} margin
                    </span>
                  )}
                </span>
              </>
            )}
          </div>

          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-[10px] text-slate-400">
              <span>Hold period</span>
              {!row.sold && row.stressDays > 0 && (
                <span className="font-medium text-amber-600">
                  +{row.stressDays}d past window
                </span>
              )}
              {row.sold && (
                <span>Recovered in {formatInventoryAge(row.totalDays)}</span>
              )}
            </div>
            <div
              className={cn('relative h-2 overflow-hidden rounded-full', style.track)}
              role="img"
              aria-label={`${row.brand} ${row.name}, ${formatInventoryAge(row.totalDays)}`}
            >
              <div className="absolute inset-y-0 left-0 flex" style={{ width: '100%' }}>
                {greenPct > 0 && (
                  <div
                    className={cn('h-full', phase === 'closed' ? 'bg-slate-400' : 'bg-emerald-500')}
                    style={{ width: `${greenPct}%` }}
                  />
                )}
                {stressPct > 0 && (
                  <div
                    className={cn(
                      'h-full',
                      phase === 'closed' ? 'bg-slate-300' : 'bg-gradient-to-r from-amber-500 to-orange-600'
                    )}
                    style={{ width: `${stressPct}%` }}
                  />
                )}
              </div>
              {!row.sold && row.totalDays > LIQUIDITY_WINDOW_DAYS && (
                <div
                  className="absolute inset-y-0 w-px bg-white/80"
                  style={{ left: `${(LIQUIDITY_WINDOW_DAYS / row.totalDays) * 100}%` }}
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-slate-400">
              <span>Purchased</span>
              <span>{LIQUIDITY_WINDOW_DAYS}d window</span>
              <span>{row.sold ? 'Sold' : 'Now'}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

function LifecycleGroup({ group, currency }) {
  const icons = {
    stressed: AlertTriangle,
    liquid: TrendingUp,
    closed: Wallet,
  }
  const Icon = icons[group.id] || Package

  const headerTones = {
    stressed: 'border-amber-200/80 bg-amber-50/50 text-amber-800',
    liquid: 'border-emerald-200/80 bg-emerald-50/50 text-emerald-800',
    closed: 'border-slate-200 bg-slate-50/80 text-slate-700',
  }

  return (
    <section>
      <div
        className={cn(
          'mb-2 flex items-center justify-between rounded-lg border px-3 py-2',
          headerTones[group.id]
        )}
      >
        <div className="flex items-center gap-2">
          <Icon size={14} aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold">{group.label}</p>
            <p className="text-[11px] opacity-75">{group.hint}</p>
          </div>
        </div>
        <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold tabular-nums ring-1 ring-black/5">
          {group.rows.length}
        </span>
      </div>
      <div className="space-y-2">
        {group.rows.map((row) => (
          <LifecycleRow key={row.id} row={row} currency={currency} />
        ))}
      </div>
    </section>
  )
}

export default function CapitalLifecycleTracker({ products, currency = '$' }) {
  const [statusFilter, setStatusFilter] = useState('all')

  const rows = useMemo(() => buildCapitalLifecycleRows(products), [products])
  const summary = useMemo(() => computeCapitalLifecycleSummary(rows), [rows])
  const filteredRows = useMemo(
    () => sortLifecycleRows(rows, { statusFilter }),
    [rows, statusFilter]
  )
  const groups = useMemo(
    () => (statusFilter === 'all' ? groupLifecycleRows(filteredRows) : []),
    [filteredRows, statusFilter]
  )

  if (!rows.length) {
    return (
      <ChartPanel
        title="Capital lifecycle"
        description="Track how long capital stays tied up from purchase through sale"
      >
        <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center">
          <Package className="mb-3 size-8 text-slate-300" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-700">No lifecycle data yet</p>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
            Add a purchase date on inventory items to see hold periods, liquidity
            windows, and capital at risk.
          </p>
        </div>
      </ChartPanel>
    )
  }

  return (
    <ChartPanel
      title="Capital lifecycle"
      description={`${LIQUIDITY_WINDOW_DAYS}-day liquidity window — green is healthy hold time, amber is extended capital lock`}
      badge={
        <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3 lg:mt-0">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-600">
            <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
            0–{LIQUIDITY_WINDOW_DAYS}d
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-amber-600">
            <span className="size-2 rounded-full bg-amber-500" aria-hidden="true" />
            {LIQUIDITY_WINDOW_DAYS + 1}d+
          </span>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <SummaryStat
            label="Tracked"
            value={summary.totalItems}
            hint={`${summary.listedCount} listed · ${summary.soldCount} sold`}
            icon={Package}
          />
          <SummaryStat
            label="Avg hold"
            value={formatInventoryAge(summary.avgDays)}
            hint="Across all tracked items"
            icon={Clock3}
            tone="profit"
          />
          <SummaryStat
            label="In window"
            value={summary.inWindowCount}
            hint="Listed within 30 days"
            icon={TrendingUp}
            tone="profit"
          />
          <SummaryStat
            label="Extended"
            value={summary.stressedCount}
            hint={
              summary.capitalStressed > 0
                ? `${formatCurrency(summary.capitalStressed, currency)} at risk`
                : 'No overdue listings'
            }
            icon={AlertTriangle}
            tone={summary.stressedCount > 0 ? 'warn' : 'default'}
          />
        </div>

        <div className="flex flex-col gap-1.5 rounded-xl bg-slate-100/80 p-1.5 lg:flex-row lg:flex-wrap lg:gap-1.5 lg:p-1">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setStatusFilter(filter.id)}
              className={cn(
                'inline-flex flex-1 items-center justify-center rounded-lg font-medium transition-colors max-lg:min-h-11 max-lg:px-4 max-lg:py-2.5 max-lg:text-sm lg:min-h-0 lg:flex-none lg:px-3 lg:py-1.5 lg:text-xs',
                statusFilter === filter.id
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="max-h-[min(360px,55vh)] space-y-4 overflow-y-auto pr-1 lg:max-h-[520px] lg:space-y-5">
          {filteredRows.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No items match this filter.
            </p>
          ) : statusFilter === 'all' ? (
            groups.map((group) => (
              <LifecycleGroup key={group.id} group={group} currency={currency} />
            ))
          ) : (
            <div className="space-y-2">
              {filteredRows.map((row) => (
                <LifecycleRow key={row.id} row={row} currency={currency} />
              ))}
            </div>
          )}
        </div>
      </div>
    </ChartPanel>
  )
}
