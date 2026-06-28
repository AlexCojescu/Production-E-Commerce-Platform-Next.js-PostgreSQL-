'use client'

import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import CapitalLifecycleTracker from '@/components/admin/CapitalLifecycleTracker'
import { ChartPanel } from '@/components/admin/analytics/ChartPanel'

const PALETTE = {
  profit: '#10b981',
  muted: '#94a3b8',
  grid: '#f1f5f9',
}

function formatCurrency(value, symbol = '$') {
  return `${symbol}${Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

const tooltipStyle = {
  borderRadius: '0.75rem',
  border: '1px solid #e2e8f0',
  fontSize: '12px',
  boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.08)',
}

export default function ProfitAnalyticsCharts({ products, summary, currency }) {
  const [isCompact, setIsCompact] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)')
    const syncCompact = () => setIsCompact(mediaQuery.matches)

    syncCompact()
    mediaQuery.addEventListener('change', syncCompact)
    return () => mediaQuery.removeEventListener('change', syncCompact)
  }, [])

  const trackedProducts = products.filter((p) => p.metrics?.hasCost)
  const hasLifecycle = products.some((p) => p.dateBought)

  const profitBreakdown = [
    { name: 'Cost', value: summary?.totalCost ?? 0, color: PALETTE.muted },
    { name: 'Profit', value: Math.max(summary?.totalMargin ?? 0, 0), color: PALETTE.profit },
  ].filter((item) => item.value > 0)

  const marginTrend = trackedProducts
    .filter((p) => p.sold)
    .sort((a, b) => new Date(a.dateSold || a.createdAt) - new Date(b.dateSold || b.createdAt))
    .reduce((acc, product, index) => {
      const prevMargin = acc.length ? acc[acc.length - 1].cumulativeMargin : 0
      acc.push({
        index: index + 1,
        label: product.name.length > 12 ? `${product.name.slice(0, 10)}…` : product.name,
        cumulativeMargin: prevMargin + product.metrics.margin,
      })
      return acc
    }, [])

  const hasProfitCharts = trackedProducts.length > 0

  if (!hasLifecycle && !hasProfitCharts) {
    return (
      <div className="flex min-h-[140px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center lg:min-h-[160px] lg:px-6">
        <p className="text-sm font-medium text-slate-700">No analytics data yet</p>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
          Add purchase dates and acquired prices to unlock charts.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-5">
      <CapitalLifecycleTracker products={products} currency={currency} />

      {hasProfitCharts && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
          <ChartPanel title="Profit split" description="Sold inventory — cost vs profit">
            <div className="flex h-[220px] items-center lg:h-[280px]">
              {profitBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={profitBreakdown}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={isCompact ? 48 : 64}
                      outerRadius={isCompact ? 72 : 96}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {profitBreakdown.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(value, currency)}
                      contentStyle={tooltipStyle}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="w-full text-center text-sm text-slate-500">
                  No sold items with tracked costs yet.
                </p>
              )}
            </div>
          </ChartPanel>

          <ChartPanel
            title="Cumulative profit"
            description="Running margin total across sold items"
          >
            <div className="h-[220px] lg:h-[280px]">
              {marginTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={marginTrend}
                    margin={
                      isCompact
                        ? { top: 8, right: 8, left: -4, bottom: 0 }
                        : { top: 8, right: 8, left: 0, bottom: 0 }
                    }
                  >
                    <defs>
                      <linearGradient id="marginGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={PALETTE.profit} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={PALETTE.profit} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.grid} vertical={false} />
                    <XAxis
                      dataKey="index"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: isCompact ? 10 : 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={isCompact ? 44 : 48}
                      tickFormatter={(v) => formatCurrency(v, currency)}
                    />
                    <Tooltip
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.label || ''}
                      formatter={(value) => formatCurrency(value, currency)}
                      contentStyle={tooltipStyle}
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulativeMargin"
                      name="Cumulative margin"
                      stroke={PALETTE.profit}
                      fill="url(#marginGradient)"
                      strokeWidth={2.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  Mark items as sold to see cumulative profit.
                </div>
              )}
            </div>
          </ChartPanel>
        </div>
      )}
    </div>
  )
}
