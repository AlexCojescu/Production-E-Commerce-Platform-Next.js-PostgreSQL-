'use client'

import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useUser, useAuth } from '@clerk/nextjs'
import Image from 'next/image'
import { Package, Pencil, Trash2 } from 'lucide-react'
import AdminProductEditModal from '@/components/admin/AdminProductEditModal'
import { AnalyticsMetricCard } from '@/components/admin/analytics'
import {
  AdminBadge,
  AdminButton,
  AdminEmptyState,
  AdminLoading,
  AdminModal,
  AdminPageHeader,
  AdminSearchInput,
} from '@/components/admin/ui'
import { cn } from '@/lib/utils'

const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'available', label: 'Available' },
  { id: 'sold', label: 'Sold' },
]

const COLUMNS = [
  'Product',
  'Brand',
  'Date bought',
  'Date sold',
  'Category',
  'Store',
  'Price',
  'Status',
  'Action',
]

function formatPrice(value) {
  if (value == null) return '—'
  return `${CURRENCY}${Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function displayPrice(product) {
  return product.sold ? product.soldPrice ?? product.price : product.price
}

export default function AdminProducts() {
  const { user } = useUser()
  const { getToken } = useAuth()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [editProduct, setEditProduct] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchQuery), 250)
    return () => clearTimeout(id)
  }, [searchQuery])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const token = await getToken()
      const { data } = await axios.get('/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` },
      })

      const sorted =
        data.products
          ?.slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || []

      setProducts(sorted)
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchProducts()
  }, [user])

  const stats = useMemo(
    () => ({
      total: products.length,
      available: products.filter((p) => !p.sold).length,
      sold: products.filter((p) => p.sold).length,
    }),
    [products]
  )

  const filteredProducts = useMemo(() => {
    let result = [...products]
    const query = debouncedSearch.trim().toLowerCase()

    if (statusFilter === 'sold') result = result.filter((p) => p.sold)
    else if (statusFilter === 'available') result = result.filter((p) => !p.sold)

    if (!query) return result

    return result.filter((product) => {
      const name = product.name?.toLowerCase() || ''
      const brand = product.brand?.toLowerCase() || ''
      const storeName = product.store?.name?.toLowerCase() || ''
      const category = product.category?.toLowerCase() || ''
      return (
        name.includes(query) ||
        brand.includes(query) ||
        storeName.includes(query) ||
        category.includes(query)
      )
    })
  }, [products, debouncedSearch, statusFilter])

  const saveProduct = async (payload) => {
    try {
      setSaving(true)
      const token = await getToken()
      const { data } = await axios.patch('/api/admin/products', payload, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setProducts((prev) =>
        prev.map((p) => (p.id === data.product.id ? data.product : p))
      )
      setEditProduct(null)
      toast.success(data.message)
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (productId) => {
    try {
      const token = await getToken()
      await axios.delete('/api/admin/delete-product', {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId },
      })

      setProducts((prev) => prev.filter((p) => p.id !== productId))
      setDeleteConfirm(null)
      toast.success('Product deleted successfully')
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
      setDeleteConfirm(null)
    }
  }

  if (loading) {
    return <AdminLoading label="Loading products..." className="py-16 lg:py-24" />
  }

  const hasFilters = debouncedSearch || statusFilter !== 'all'

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8">
      <AdminPageHeader
        title="Products"
        highlight="· Catalog"
        description="Full inventory view across every store — edit dates, pricing, and sold status from one place."
        meta={
          <>
            <span className="font-medium text-slate-800">{products.length}</span> total
            {filteredProducts.length !== products.length && (
              <>
                <span className="mx-2 text-slate-300" aria-hidden="true">
                  ·
                </span>
                <span className="font-medium text-slate-800">{filteredProducts.length}</span> shown
              </>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-px overflow-hidden border border-slate-200 bg-slate-200 md:grid-cols-2 lg:grid-cols-3">
        <AnalyticsMetricCard
          featured
          title="Total"
          value={stats.total}
          accent="dark"
          className="!rounded-none !p-4 !ring-0 lg:!p-5"
        />
        <AnalyticsMetricCard
          title="Available"
          value={stats.available}
          accent="profit"
          className="!rounded-none !p-4 !ring-0 lg:!p-5"
        />
        <AnalyticsMetricCard
          title="Sold"
          value={stats.sold}
          accent="age"
          className="!rounded-none !p-4 !ring-0 md:col-span-2 lg:col-span-1 lg:!p-5"
        />
      </div>

      <section
        className="border border-slate-200 bg-white max-lg:overflow-hidden"
        aria-label="Product catalog"
      >
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 lg:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-900 max-lg:text-xs">
                Catalog
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'}
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
              <div className="flex w-full border border-slate-200 bg-white p-1 lg:inline-flex lg:w-auto lg:p-0.5">
                {STATUS_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setStatusFilter(filter.id)}
                    className={cn(
                      'flex-1 font-semibold uppercase tracking-wide transition-colors max-lg:min-h-11 max-lg:px-3 max-lg:py-2.5 max-lg:text-xs lg:flex-none lg:px-3 lg:py-1.5 lg:text-[11px]',
                      statusFilter === filter.id
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <div className="w-full lg:w-72">
                <AdminSearchInput
                  id="product-search"
                  placeholder="Search name, brand, store..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClear={() => setSearchQuery('')}
                  inputClassName="max-lg:min-h-11 max-lg:text-base max-lg:py-2.5 lg:text-sm lg:py-2"
                  clearButtonClassName="max-lg:min-h-11 max-lg:min-w-11 max-lg:flex max-lg:items-center max-lg:justify-center max-lg:right-1"
                />
              </div>
            </div>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-6 lg:p-8">
            <AdminEmptyState
              icon={Package}
              title={hasFilters ? 'No products match your filters' : 'No products available'}
              actionLabel={hasFilters ? 'Clear filters' : undefined}
              onAction={
                hasFilters
                  ? () => {
                      setSearchQuery('')
                      setStatusFilter('all')
                    }
                  : undefined
              }
              className="!rounded-none"
            />
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-200 lg:hidden">
              {filteredProducts.map((product) => (
                <ProductMobileRow
                  key={product.id}
                  product={product}
                  onEdit={() => setEditProduct(product)}
                  onDelete={() => setDeleteConfirm(product.id)}
                />
              ))}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1100px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-900">
                    {COLUMNS.map((col) => (
                      <th
                        key={col}
                        scope="col"
                        className={cn(
                          'px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-300',
                          col === 'Action' && 'text-right',
                          col === 'Status' && 'text-center',
                          col === 'Price' && 'text-right'
                        )}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="group bg-white transition-colors hover:bg-slate-50/80"
                    >
                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          {product.images?.[0] ? (
                            <Image
                              width={40}
                              height={40}
                              className="size-10 shrink-0 border border-slate-200 object-cover"
                              src={product.images[0]}
                              alt=""
                            />
                          ) : (
                            <div
                              className="size-10 shrink-0 border border-slate-200 bg-slate-100"
                              aria-hidden="true"
                            />
                          )}
                          <p
                            className="max-w-[200px] truncate text-sm font-medium text-slate-900"
                            title={product.name}
                          >
                            {product.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <span className="block max-w-[100px] truncate" title={product.brand}>
                          {product.brand || '—'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm tabular-nums text-slate-600">
                        {formatDate(product.dateBought)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm tabular-nums text-slate-600">
                        {product.sold ? formatDate(product.dateSold) : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm capitalize text-slate-600">
                        <span className="block max-w-[100px] truncate" title={product.category}>
                          {product.category || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <span
                          className="block max-w-[140px] truncate"
                          title={product.store?.name}
                        >
                          {product.store?.name || '—'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold tabular-nums text-slate-900">
                        {formatPrice(displayPrice(product))}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <AdminBadge
                          variant={product.sold ? 'danger' : 'success'}
                          className="!rounded-none !text-[10px] uppercase tracking-wide"
                        >
                          {product.sold ? 'Sold' : 'Available'}
                        </AdminBadge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <AdminButton
                            variant="secondary"
                            size="sm"
                            className="!rounded-none border-slate-200"
                            onClick={() => setEditProduct(product)}
                          >
                            <Pencil size={13} aria-hidden="true" />
                            Edit
                          </AdminButton>
                          <AdminButton
                            variant="ghost"
                            size="sm"
                            className="!rounded-none text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setDeleteConfirm(product.id)}
                            aria-label={`Delete ${product.name}`}
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </AdminButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <AdminProductEditModal
        product={editProduct}
        open={Boolean(editProduct)}
        onClose={() => setEditProduct(null)}
        onSave={saveProduct}
        saving={saving}
      />

      <AdminModal
        open={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        title="Delete product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={() => deleteProduct(deleteConfirm)}
      />
    </div>
  )
}

function ProductMobileRow({ product, onEdit, onDelete }) {
  const fields = [
    { label: 'Brand', value: product.brand || '—' },
    { label: 'Bought', value: formatDate(product.dateBought) },
    { label: 'Sold', value: product.sold ? formatDate(product.dateSold) : '—' },
    { label: 'Category', value: product.category || '—' },
    { label: 'Store', value: product.store?.name || '—' },
    { label: 'Price', value: formatPrice(displayPrice(product)) },
  ]

  return (
    <article className="bg-white p-4">
      <div className="flex gap-3">
        {product.images?.[0] ? (
          <Image
            width={48}
            height={48}
            className="size-12 shrink-0 border border-slate-200 object-cover"
            src={product.images[0]}
            alt=""
          />
        ) : (
          <div
            className="size-12 shrink-0 border border-slate-200 bg-slate-100"
            aria-hidden="true"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <p className="line-clamp-2 text-sm font-semibold text-slate-900">{product.name}</p>
            <AdminBadge
              variant={product.sold ? 'danger' : 'success'}
              className="w-fit shrink-0 !rounded-none !text-[10px] uppercase"
            >
              {product.sold ? 'Sold' : 'Available'}
            </AdminBadge>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5">
            {fields.map((field) => (
              <div key={field.label} className="min-w-0">
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {field.label}
                </dt>
                <dd className="mt-0.5 truncate text-sm text-slate-800">{field.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
            <AdminButton
              variant="secondary"
              size="sm"
              className="min-h-11 flex-1 !rounded-none lg:min-h-8"
              onClick={onEdit}
            >
              <Pencil size={13} aria-hidden="true" />
              Edit
            </AdminButton>
            <AdminButton
              variant="ghost"
              size="sm"
              className="min-h-11 min-w-11 !rounded-none text-red-600 hover:bg-red-50 lg:min-h-8 lg:min-w-0"
              onClick={onDelete}
              aria-label={`Delete ${product.name}`}
            >
              <Trash2 size={14} aria-hidden="true" />
            </AdminButton>
          </div>
        </div>
      </div>
    </article>
  )
}
