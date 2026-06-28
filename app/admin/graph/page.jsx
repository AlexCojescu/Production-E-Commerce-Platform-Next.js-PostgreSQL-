'use client'

import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useUser, useAuth } from '@clerk/nextjs'
import Image from 'next/image'
import { CircleDollarSign, Pencil } from 'lucide-react'
import AdminProductEditModal from '@/components/admin/AdminProductEditModal'
import {
  AnalyticsMetricCard,
  AnalyticsProductCard,
} from '@/components/admin/analytics'
import ProfitAnalyticsCharts from '@/components/admin/ProfitAnalyticsCharts'
import { formatInventoryAge, computeInventoryAgeDays } from '@/lib/inventoryMetrics'
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminEmptyState,
  AdminLoading,
  AdminPageHeader,
  AdminSearchInput,
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from '@/components/admin/ui'
import { cn } from '@/lib/utils'

const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'listed', label: 'Listed' },
  { id: 'sold', label: 'Sold' },
]

function formatPrice(value) {
  if (value == null) return '—'
  return `${CURRENCY}${Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatPercent(value) {
  if (value == null) return '—'
  return `${Number(value).toFixed(1)}%`
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function marginVariant(margin) {
  if (margin == null) return 'neutral'
  if (margin > 0) return 'success'
  if (margin < 0) return 'danger'
  return 'neutral'
}

function applyGraphPayload(data, setters) {
  setters.setProducts(data.products || [])
  setters.setSummary(data.summary)
  setters.setInventoryAge(data.inventoryAge)
}

export default function AdminGraphPage() {
  const { user } = useUser()
  const { getToken } = useAuth()

  const [products, setProducts] = useState([])
  const [summary, setSummary] = useState(null)
  const [inventoryAge, setInventoryAge] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editProduct, setEditProduct] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchQuery), 250)
    return () => clearTimeout(id)
  }, [searchQuery])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = await getToken()
      const { data } = await axios.get('/api/admin/graph', {
        headers: { Authorization: `Bearer ${token}` },
      })

      applyGraphPayload(data, {
        setProducts,
        setSummary,
        setInventoryAge,
      })
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  const filteredProducts = useMemo(() => {
    let result = [...products]
    const query = debouncedSearch.trim().toLowerCase()

    if (statusFilter === 'listed') result = result.filter((p) => !p.sold)
    if (statusFilter === 'sold') result = result.filter((p) => p.sold)

    if (!query) return result

    return result.filter((product) => {
      const name = product.name?.toLowerCase() || ''
      const brand = product.brand?.toLowerCase() || ''
      const storeName = product.store?.name?.toLowerCase() || ''
      return name.includes(query) || brand.includes(query) || storeName.includes(query)
    })
  }, [products, debouncedSearch, statusFilter])

  const saveProduct = async (payload) => {
    try {
      setSaving(true)
      const token = await getToken()
      const { data } = await axios.patch('/api/admin/graph', payload, {
        headers: { Authorization: `Bearer ${token}` },
      })

      applyGraphPayload(data, {
        setProducts,
        setSummary,
        setInventoryAge,
      })
      setEditProduct(null)
      toast.success(data.message)
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <AdminLoading label="Loading analytics..." className="py-16 lg:py-24" />
  }

  const trackedPct = summary?.totalProducts
    ? Math.round((summary.trackedCount / summary.totalProducts) * 100)
    : 0

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8">
      <AdminPageHeader
        title="Analytics"
        highlight="· Profit & inventory"
        description="Summary metrics, profit charts, and inventory ledger — edit any row to update costs and dates."
        meta={
          <>
            <span className="font-medium text-slate-800">{summary?.totalProducts ?? 0}</span> products
            <span className="mx-2 text-slate-300" aria-hidden="true">
              ·
            </span>
            <span className="font-medium text-emerald-700">{trackedPct}%</span> cost-tracked
          </>
        }
      />

      {summary && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 xl:gap-4">
          <AnalyticsMetricCard
            featured
            title="Total margin"
            value={formatPrice(summary.totalMargin)}
            hint={`${summary.soldTrackedCount} sold items tracked`}
            accent="dark"
            className="max-lg:!p-4"
          />
          <AnalyticsMetricCard
            title="Portfolio ROI"
            value={formatPercent(summary.portfolioRoi)}
            hint="Return on total acquisition cost"
            accent="roi"
            className="max-lg:!p-4"
          />
          <AnalyticsMetricCard
            title="Avg margin"
            value={formatPercent(summary.avgMarginPercent)}
            hint="Across sold inventory"
            accent="profit"
            className="max-lg:!p-4"
          />
          <AnalyticsMetricCard
            title="Avg listed age"
            value={formatInventoryAge(Math.round(inventoryAge?.listedAvgDays ?? 0))}
            hint={`Longest sit: ${formatInventoryAge(inventoryAge?.maxDays ?? 0)}`}
            accent="age"
            className="max-lg:!p-4 md:col-span-2 xl:col-span-1"
          />
        </div>
      )}

      <section aria-label="Charts">
        <div className="mb-3 lg:mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 max-lg:text-xs">
            Insights
          </h2>
          <p className="mt-1 text-sm text-slate-600 max-lg:text-xs max-lg:leading-relaxed">
            Portfolio-level profit breakdown, capital lifecycle, and cumulative margin
          </p>
        </div>
        <div className="-mx-1 min-w-0 overflow-x-auto px-1 xl:mx-0 xl:overflow-visible xl:px-0">
          <ProfitAnalyticsCharts
            products={products}
            summary={summary}
            currency={CURRENCY}
          />
        </div>
      </section>

      <section aria-label="Product inventory">
        <AdminCard className="overflow-hidden !rounded-2xl !p-0 !ring-slate-200/70">
          <div className="border-b border-slate-100 px-4 py-4 lg:px-6 lg:py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-slate-900 max-lg:text-sm">
                  Inventory ledger
                </h2>
                <p className="mt-0.5 text-sm text-slate-500 max-lg:text-xs">
                  {filteredProducts.length} item{filteredProducts.length === 1 ? '' : 's'} shown
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
                <div className="flex w-full rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200/80 lg:inline-flex lg:w-auto">
                  {FILTERS.map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setStatusFilter(filter.id)}
                      className={cn(
                        'flex-1 rounded-lg font-medium transition-colors max-lg:min-h-11 max-lg:px-3 max-lg:py-2.5 max-lg:text-sm lg:flex-none lg:px-3 lg:py-1.5 lg:text-xs',
                        statusFilter === filter.id
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                <div className="w-full lg:w-64">
                  <AdminSearchInput
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, brand, store..."
                    onClear={() => setSearchQuery('')}
                    inputClassName="max-lg:min-h-11 max-lg:text-base max-lg:py-2.5 lg:text-sm lg:py-2"
                    clearButtonClassName="max-lg:min-h-11 max-lg:min-w-11 max-lg:flex max-lg:items-center max-lg:justify-center max-lg:right-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 lg:p-6">
            {filteredProducts.length === 0 ? (
              <AdminEmptyState
                icon={CircleDollarSign}
                title="No products match"
                description="Try a different filter or search term."
                actionLabel={searchQuery || statusFilter !== 'all' ? 'Reset filters' : undefined}
                onAction={
                  searchQuery || statusFilter !== 'all'
                    ? () => {
                        setSearchQuery('')
                        setStatusFilter('all')
                      }
                    : undefined
                }
              />
            ) : (
              <>
                <div className="grid gap-3 xl:hidden lg:gap-4">
                  {filteredProducts.map((product) => (
                    <AnalyticsProductCard
                      key={product.id}
                      product={product}
                      currency={CURRENCY}
                      formatPrice={formatPrice}
                      formatPercent={formatPercent}
                      formatDate={formatDate}
                      inventoryAge={formatInventoryAge(computeInventoryAgeDays(product))}
                      onEdit={setEditProduct}
                    />
                  ))}
                </div>

                <AdminTable className="hidden !border-0 !shadow-none xl:block">
                  <table className="w-full min-w-[1080px] text-left">
                    <AdminTableHeader>
                      <tr>
                        <AdminTableHead>Product</AdminTableHead>
                        <AdminTableHead>Timeline</AdminTableHead>
                        <AdminTableHead>Economics</AdminTableHead>
                        <AdminTableHead align="center">Performance</AdminTableHead>
                        <AdminTableHead align="center">Status</AdminTableHead>
                        <AdminTableHead align="right">Action</AdminTableHead>
                      </tr>
                    </AdminTableHeader>
                    <AdminTableBody>
                      {filteredProducts.map((product) => (
                        <AdminTableRow key={product.id} className="group">
                          <AdminTableCell>
                            <div className="flex items-center gap-3">
                              {product.images?.[0] && (
                                <Image
                                  src={product.images[0]}
                                  alt=""
                                  width={44}
                                  height={44}
                                  className="size-11 rounded-xl object-cover ring-1 ring-slate-200"
                                />
                              )}
                              <div className="min-w-0">
                                <p className="truncate font-medium text-slate-900">{product.name}</p>
                                <p className="truncate text-xs text-slate-500">
                                  {product.brand || '—'} · {product.store?.name || '—'}
                                </p>
                              </div>
                            </div>
                          </AdminTableCell>
                          <AdminTableCell>
                            <div className="space-y-1 text-xs">
                              <p className="text-slate-600">
                                <span className="text-slate-400">Bought</span>{' '}
                                {formatDate(product.dateBought)}
                              </p>
                              <p className="text-slate-600">
                                <span className="text-slate-400">Sold</span>{' '}
                                {product.sold ? formatDate(product.dateSold) : '—'}
                              </p>
                              <p className="font-medium text-slate-800">
                                {formatInventoryAge(computeInventoryAgeDays(product))}
                              </p>
                            </div>
                          </AdminTableCell>
                          <AdminTableCell>
                            <div className="space-y-1 text-xs tabular-nums">
                              <p className="text-slate-600">
                                <span className="text-slate-400">Acquired</span>{' '}
                                {formatPrice(product.acquiredPrice)}
                              </p>
                              <p className="text-slate-600">
                                <span className="text-slate-400">Sold</span>{' '}
                                {formatPrice(product.metrics.priceSold)}
                              </p>
                            </div>
                          </AdminTableCell>
                          <AdminTableCell align="center">
                            <div className="inline-flex flex-col items-center gap-1">
                              {product.metrics.hasCost ? (
                                <>
                                  <AdminBadge variant={marginVariant(product.metrics.margin)}>
                                    {formatPrice(product.metrics.margin)}
                                  </AdminBadge>
                                  <span
                                    className={cn(
                                      'text-xs font-semibold tabular-nums',
                                      product.metrics.roi >= 0
                                        ? 'text-emerald-600'
                                        : 'text-red-600'
                                    )}
                                  >
                                    {formatPercent(product.metrics.roi)} ROI
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs text-slate-400">—</span>
                              )}
                            </div>
                          </AdminTableCell>
                          <AdminTableCell align="center">
                            <AdminBadge variant={product.sold ? 'danger' : 'success'}>
                              {product.sold ? 'Sold' : 'Listed'}
                            </AdminBadge>
                          </AdminTableCell>
                          <AdminTableCell align="right">
                            <AdminButton
                              variant="secondary"
                              size="sm"
                              className="opacity-90 group-hover:opacity-100"
                              onClick={() => setEditProduct(product)}
                            >
                              <Pencil size={14} aria-hidden="true" />
                              Edit
                            </AdminButton>
                          </AdminTableCell>
                        </AdminTableRow>
                      ))}
                    </AdminTableBody>
                  </table>
                </AdminTable>
              </>
            )}
          </div>
        </AdminCard>
      </section>

      <AdminProductEditModal
        product={editProduct}
        open={Boolean(editProduct)}
        onClose={() => setEditProduct(null)}
        onSave={saveProduct}
        saving={saving}
      />
    </div>
  )
}
