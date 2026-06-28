'use client'

import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function OrdersAreaChart({ allOrders }) {
  const [isCompact, setIsCompact] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)')
    const syncCompact = () => setIsCompact(mediaQuery.matches)

    syncCompact()
    mediaQuery.addEventListener('change', syncCompact)
    return () => mediaQuery.removeEventListener('change', syncCompact)
  }, [])
  const ordersPerDay = allOrders.reduce((acc, order) => {
    const date = new Date(order.createdAt).toISOString().split('T')[0]
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(ordersPerDay).map(([date, count]) => ({
    date,
    orders: count,
  }))

  const formatDate = (value) => {
    const d = new Date(value)
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  return (
    <div className="h-[240px] w-full min-w-[280px] text-xs lg:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={
            isCompact
              ? { top: 8, right: 8, left: -4, bottom: 0 }
              : { top: 4, right: 4, left: 0, bottom: 0 }
          }
        >
          <defs>
            <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#0f172a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fill: '#64748b', fontSize: isCompact ? 10 : 11 }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
            interval={isCompact ? 'preserveStartEnd' : 'preserveStartEnd'}
            minTickGap={isCompact ? 24 : 32}
            angle={isCompact ? -35 : 0}
            textAnchor={isCompact ? 'end' : 'middle'}
            height={isCompact ? 48 : 30}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: '#64748b', fontSize: isCompact ? 10 : 11 }}
            axisLine={false}
            tickLine={false}
            width={isCompact ? 28 : 32}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
              fontSize: '12px',
            }}
            labelFormatter={formatDate}
          />
          <Area
            type="monotone"
            dataKey="orders"
            stroke="#0f172a"
            fill="url(#orderGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
