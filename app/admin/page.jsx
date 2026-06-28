'use client'

import OrdersAreaChart from '@/components/OrdersAreaChart'
import ProfitAnalyticsCharts from '@/components/admin/ProfitAnalyticsCharts'
import {
  AdminCard,
  AdminLoading,
  AdminPageHeader,
  AdminSection,
  AdminStatCard,
} from '@/components/admin/ui'
import {
  CircleDollarSignIcon,
  ShoppingBasketIcon,
  StoreIcon,
  TagsIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const { getToken } = useAuth()

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    products: 0,
    revenue: 0,
    orders: 0,
    stores: 0,
    allOrders: [],
  })
  const [profitProducts, setProfitProducts] = useState([])
  const [profitSummary, setProfitSummary] = useState(null)

  const dashboardCardsData = [
    { title: 'Total Products', value: dashboardData.products, icon: ShoppingBasketIcon },
    {
      title: 'Total Revenue',
      value: `${currency}${Number(dashboardData.revenue).toLocaleString()}`,
      icon: CircleDollarSignIcon,
    },
    { title: 'Total Orders', value: dashboardData.orders, icon: TagsIcon },
    { title: 'Total Stores', value: dashboardData.stores, icon: StoreIcon },
  ]

  const fetchDashboardData = async () => {
    try {
      const token = await getToken()
      const headers = { Authorization: `Bearer ${token}` }

      const [dashboardRes, graphRes] = await Promise.all([
        axios.get('/api/admin/dashboard', { headers }),
        axios.get('/api/admin/graph', { headers }),
      ])

      setDashboardData(dashboardRes.data.dashboardData)
      setProfitProducts(graphRes.data.products || [])
      setProfitSummary(graphRes.data.summary || null)
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return <AdminLoading label="Loading dashboard..." className="py-16 lg:py-24" />
  }

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8">
      <AdminPageHeader
        title="Dashboard"
        description="Overview of platform activity, orders, and inventory profit."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {dashboardCardsData.map((card) => (
          <AdminStatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            className="min-w-0 max-lg:p-4 lg:min-w-[200px]"
          />
        ))}
      </div>

      <AdminCard className="max-lg:p-4">
        <AdminSection
          title="Profit analytics"
          description="Capital lifecycle, cost vs profit, and cumulative margin"
          className="max-lg:space-y-3 lg:space-y-4"
        >
          <div className="-mx-1 min-w-0 overflow-x-auto px-1 lg:mx-0 lg:overflow-visible lg:px-0">
            <ProfitAnalyticsCharts
              products={profitProducts}
              summary={profitSummary}
              currency={currency}
            />
          </div>
        </AdminSection>
      </AdminCard>

      <AdminCard className="max-lg:p-4">
        <AdminSection
          title="Orders per day"
          description="Daily order volume across the platform"
          className="max-lg:space-y-3 lg:space-y-4"
        >
          <div className="-mx-1 min-w-0 overflow-x-auto px-1 lg:mx-0 lg:overflow-visible lg:px-0">
            <OrdersAreaChart allOrders={dashboardData.allOrders} />
          </div>
        </AdminSection>
      </AdminCard>
    </div>
  )
}
