'use client'

import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminCollapsible,
  AdminEmptyState,
  AdminLoading,
  AdminModal,
  AdminPageHeader,
  AdminSearchInput,
  AdminSection,
  AdminSelect,
  AdminStatCard,
} from '@/components/admin/ui'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useUser, useAuth } from '@clerk/nextjs'
import Image from 'next/image'
import { safeImageSrc } from '@/lib/safeUrls'
import {
  Trash2,
  ShoppingBag,
  Star,
  MapPin,
  Heart,
  Users,
  Store,
  ShoppingCart,
} from 'lucide-react'

const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

const ORDER_STATUS_OPTIONS = [
  { value: 'ORDER_PLACED', label: 'Order placed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
]

const orderStatusVariant = {
  ORDER_PLACED: 'neutral',
  PROCESSING: 'warning',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
}

const storeStatusVariant = {
  approved: 'success',
  pending: 'warning',
  rejected: 'danger',
}

function formatOrderDate(dateString) {
  return new Date(dateString).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatCurrency(value) {
  return `${currency}${Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatAddress(address) {
  if (!address) return '—'
  return [
    address.name,
    address.street,
    `${address.city}, ${address.state} ${address.zip}`,
    address.country,
  ].filter(Boolean)
}

function formatPayment(order) {
  const processor =
    order.paymentMethod === 'STRIPE' ? 'Stripe' : 'Cash on delivery'
  if (order.isRefunded) return `${processor} · Refunded`
  const paidLabel = order.isPaid ? 'Paid' : 'Unpaid'
  return `${processor} · ${paidLabel}`
}

function isCartEmpty(cart) {
  if (!cart || typeof cart !== 'object') return true
  return Object.keys(cart).length === 0
}

function UserCartPreview({ cart }) {
  if (isCartEmpty(cart)) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
        Cart is empty
      </p>
    )
  }

  const entries = Object.entries(cart)

  return (
    <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-slate-50/50">
      {entries.map(([productId, item]) => (
        <li
          key={productId}
          className="flex items-center justify-between gap-3 px-3 py-3 text-sm max-lg:px-3 lg:px-4"
        >
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800">
              {item?.name || 'Product'}
            </p>
            <p className="truncate font-mono text-xs text-slate-400">
              {productId}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-medium tabular-nums text-slate-800">
              Qty {item?.quantity ?? 1}
            </p>
            {item?.price != null && (
              <p className="text-xs tabular-nums text-slate-500">
                {formatCurrency(item.price)}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

function UserActivityGrid({ counts }) {
  const stats = [
    { icon: ShoppingBag, value: counts.buyerOrders, label: 'Orders' },
    { icon: Star, value: counts.ratings, label: 'Ratings' },
    { icon: MapPin, value: counts.Address, label: 'Addresses' },
    { icon: Heart, value: counts.favoriteProducts, label: 'Favorites' },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-2">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex min-h-[72px] flex-col items-center justify-center rounded-lg border border-slate-100 bg-slate-50/80 px-2 py-3 text-center transition-colors hover:bg-slate-50 max-lg:min-h-[76px] lg:min-h-[72px]"
        >
          <stat.icon
            size={15}
            className="mb-1.5 text-slate-400"
            aria-hidden="true"
          />
          <span className="text-lg font-semibold tabular-nums text-slate-900">
            {stat.value}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  )
}

function UserOrders({ orders, getToken, onOrderUpdated }) {
  const [pendingAction, setPendingAction] = useState(null)
  const [statusDraft, setStatusDraft] = useState({})

  const runOrderAction = async ({ orderId, action, status, successMessage }) => {
    try {
      const token = await getToken()
      const { data } = await axios.post(
        '/api/admin/orders',
        { orderId, action, status },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(data.message || successMessage)
      onOrderUpdated(data.order)
      setPendingAction(null)
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    }
  }

  if (!orders?.length) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
        No orders placed
      </p>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {orders.map((order) => {
          const addressLines = formatAddress(order.address)
          const isTerminal =
            order.status === 'CANCELLED' || Boolean(order.isRefunded)
          const currentStatus = statusDraft[order.id] ?? order.status

          return (
            <AdminCard key={order.id} padding={false} className="overflow-hidden">
              <AdminCollapsible
                contentClassName="bg-slate-50/40 px-4 py-4 lg:px-5"
                trigger={
                  <div className="flex w-full flex-col gap-2 py-3.5 pl-4 max-lg:pr-2 lg:flex-row lg:items-center lg:justify-between lg:gap-3 lg:pl-5">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono text-xs text-slate-500">
                          #{order.id.slice(0, 8)}
                        </p>
                        <AdminBadge
                          variant={orderStatusVariant[order.status] || 'neutral'}
                          dot
                        >
                          {order.status.replace(/_/g, ' ')}
                        </AdminBadge>
                        {order.isRefunded && (
                          <AdminBadge variant="danger" dot>
                            Refunded
                          </AdminBadge>
                        )}
                      </div>
                      <p className="mt-1 truncate text-sm font-medium text-slate-800">
                        {order.store?.name || 'Unknown store'}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {formatOrderDate(order.createdAt)} · {formatPayment(order)}
                      </p>
                    </div>
                    <span className="shrink-0 self-start text-sm font-semibold tabular-nums text-slate-900 lg:self-auto">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                }
              >
                <p className="mb-4 font-mono text-[10px] text-slate-400">
                  {order.id}
                </p>

                <div className="grid gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-lg border border-slate-200/80 bg-white p-3">
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Payment
                    </p>
                    <p className="font-medium text-slate-800">
                      {formatPayment(order)}
                    </p>
                    {order.isCouponUsed && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        Coupon applied
                      </p>
                    )}
                  </div>

                  <div className="rounded-lg border border-slate-200/80 bg-white p-3">
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Sold by
                    </p>
                    <p className="font-medium text-slate-800">
                      {order.store?.name || '—'}
                    </p>
                    {order.store?.username && (
                      <p className="text-xs text-slate-500">
                        @{order.store.username}
                      </p>
                    )}
                  </div>

                  <div className="rounded-lg border border-slate-200/80 bg-white p-3 md:col-span-2 lg:col-span-1">
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Shipping address
                    </p>
                    <div className="text-slate-700">
                      {addressLines.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                      {order.address?.phone && (
                        <p className="mt-1 text-slate-500">
                          {order.address.phone}
                        </p>
                      )}
                      {order.address?.email && (
                        <p className="text-slate-500">{order.address.email}</p>
                      )}
                    </div>
                  </div>
                </div>

                {order.orderItems?.length > 0 && (
                  <div className="mt-4 rounded-lg border border-slate-200/80 bg-white p-3">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Items ({order.orderItems.length})
                    </p>
                    <ul className="divide-y divide-slate-100">
                      {order.orderItems.map((item, index) => (
                        <li
                          key={`${order.id}-${item.product?.name}-${index}`}
                          className="flex justify-between gap-3 py-2 text-sm first:pt-0 last:pb-0"
                        >
                          <span className="min-w-0 truncate text-slate-600">
                            {item.quantity}× {item.product?.name || 'Product'}
                          </span>
                          <span className="shrink-0 tabular-nums font-medium text-slate-800">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {!isTerminal && (
                  <div className="mt-4 flex flex-col gap-2 border-t border-slate-200/80 pt-4 max-lg:gap-3 lg:flex-row lg:flex-wrap lg:items-end lg:gap-3">
                    <div className="w-full flex-1 lg:min-w-[180px] lg:max-w-xs">
                      <AdminSelect
                        label="Update status"
                        value={currentStatus}
                        onChange={(e) =>
                          setStatusDraft((prev) => ({
                            ...prev,
                            [order.id]: e.target.value,
                          }))
                        }
                        className="max-lg:min-h-11 max-lg:text-base lg:text-sm"
                      >
                        {ORDER_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </AdminSelect>
                    </div>
                    <AdminButton
                      variant="secondary"
                      size="sm"
                      className="max-lg:min-h-11 max-lg:w-full lg:min-h-8 lg:w-auto"
                      disabled={currentStatus === order.status}
                      onClick={() =>
                        runOrderAction({
                          orderId: order.id,
                          action: 'updateStatus',
                          status: currentStatus,
                          successMessage: 'Order status updated',
                        })
                      }
                    >
                      Save status
                    </AdminButton>
                    <AdminButton
                      variant="secondary"
                      size="sm"
                      className="max-lg:min-h-11 max-lg:w-full lg:min-h-8 lg:w-auto"
                      onClick={() =>
                        setPendingAction({
                          type: 'cancel',
                          orderId: order.id,
                          label: order.id.slice(0, 8),
                        })
                      }
                    >
                      Cancel order
                    </AdminButton>
                    <AdminButton
                      variant="danger"
                      size="sm"
                      className="max-lg:min-h-11 max-lg:w-full lg:min-h-8 lg:w-auto"
                      onClick={() =>
                        setPendingAction({
                          type: 'refund',
                          orderId: order.id,
                          label: order.id.slice(0, 8),
                          paymentMethod: order.paymentMethod,
                          total: order.total,
                        })
                      }
                    >
                      Issue refund
                    </AdminButton>
                  </div>
                )}
              </AdminCollapsible>
            </AdminCard>
          )
        })}
      </div>

      <AdminModal
        open={pendingAction?.type === 'cancel'}
        onClose={() => setPendingAction(null)}
        title="Cancel order?"
        description={`Cancel order #${pendingAction?.label}? The buyer will no longer be able to receive this order.`}
        confirmLabel="Cancel order"
        confirmVariant="danger"
        onConfirm={() =>
          runOrderAction({
            orderId: pendingAction.orderId,
            action: 'cancel',
            successMessage: 'Order cancelled',
          })
        }
      />

      <AdminModal
        open={pendingAction?.type === 'refund'}
        onClose={() => setPendingAction(null)}
        title="Issue refund?"
        description={
          pendingAction?.paymentMethod === 'STRIPE'
            ? `Refund ${formatCurrency(pendingAction?.total || 0)} via Stripe for order #${pendingAction?.label}? The order will be cancelled.`
            : `Mark order #${pendingAction?.label} as refunded and cancelled? Use this for cash-on-delivery refunds processed outside the platform.`
        }
        confirmLabel="Issue refund"
        confirmVariant="danger"
        onConfirm={() =>
          runOrderAction({
            orderId: pendingAction.orderId,
            action: 'refund',
            successMessage: 'Refund processed',
          })
        }
      />
    </>
  )
}

function UserCard({ userData, getToken, onOrderUpdated, onDelete }) {
  const orderCount = userData.buyerOrders?.length || 0
  const cartItemCount = isCartEmpty(userData.cart)
    ? 0
    : Object.keys(userData.cart).length

  return (
    <AdminCard padding={false} className="overflow-hidden">
      <AdminCollapsible
        contentClassName="space-y-5 px-4 py-4 lg:space-y-6 lg:px-6 lg:py-5"
        trigger={
          <div className="flex w-full items-center gap-3 py-4 pl-4 max-lg:pr-1 lg:gap-4 lg:pl-6">
            <Image
              width={48}
              height={48}
              src={safeImageSrc(userData.image, '/default-avatar.png')}
              alt=""
              className="size-11 shrink-0 rounded-full object-cover ring-2 ring-slate-100 lg:size-12"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-1 max-lg:gap-1.5 lg:flex-row lg:flex-wrap lg:items-center lg:gap-2">
                <h3 className="truncate text-base font-semibold text-slate-900">
                  {userData.name}
                </h3>
                {userData.store && (
                  <AdminBadge
                    variant={
                      storeStatusVariant[userData.store.status] || 'neutral'
                    }
                    dot
                  >
                    {userData.store.status}
                  </AdminBadge>
                )}
              </div>
              <p className="truncate text-sm text-slate-500">{userData.email}</p>
              <div className="mt-1.5 flex flex-col gap-1 text-xs text-slate-500 max-lg:gap-1.5 sm:max-lg:flex-row sm:max-lg:flex-wrap sm:max-lg:items-center sm:max-lg:gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3">
                <span className="inline-flex items-center gap-1">
                  <ShoppingBag size={12} aria-hidden="true" />
                  {orderCount} {orderCount === 1 ? 'order' : 'orders'}
                </span>
                <span className="inline-flex items-center gap-1">
                  <ShoppingCart size={12} aria-hidden="true" />
                  {cartItemCount} in cart
                </span>
                {userData.store && (
                  <span className="inline-flex items-center gap-1">
                    <Store size={12} aria-hidden="true" />
                    {userData.store.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        }
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4">
            <AdminSection title="Profile" compact>
              <dl className="space-y-2.5 text-sm">
                <div>
                  <dt className="text-xs text-slate-500">Full name</dt>
                  <dd className="font-medium text-slate-800">{userData.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Email</dt>
                  <dd className="truncate font-medium text-slate-800">
                    {userData.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">User ID</dt>
                  <dd className="break-all font-mono text-xs text-slate-500">
                    {userData.id}
                  </dd>
                </div>
              </dl>
            </AdminSection>
            <AdminButton
              variant="ghost"
              size="sm"
              className="max-lg:min-h-11 max-lg:w-full text-red-600 hover:bg-red-50 hover:text-red-700 lg:min-h-8 lg:w-auto"
              onClick={() =>
                onDelete({ id: userData.id, name: userData.name })
              }
            >
              <Trash2 size={14} aria-hidden="true" />
              Delete user
            </AdminButton>
          </div>

          <AdminSection
            title="Store details"
            compact
            className="lg:border-l lg:border-slate-100 lg:pl-6"
          >
            {userData.store ? (
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Name</dt>
                  <dd className="truncate text-right font-medium text-slate-800">
                    {userData.store.name}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Handle</dt>
                  <dd className="font-medium text-slate-800">
                    @{userData.store.username}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Status</dt>
                  <dd>
                    <AdminBadge
                      variant={
                        storeStatusVariant[userData.store.status] || 'neutral'
                      }
                      dot
                    >
                      {userData.store.status}
                    </AdminBadge>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Active</dt>
                  <dd>
                    <AdminBadge
                      variant={
                        userData.store.isActive ? 'success' : 'neutral'
                      }
                      dot
                    >
                      {userData.store.isActive ? 'Active' : 'Inactive'}
                    </AdminBadge>
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
                No store registered
              </p>
            )}
          </AdminSection>

          <AdminSection
            title="Activity"
            compact
            className="lg:border-l lg:border-slate-100 lg:pl-6"
          >
            <UserActivityGrid counts={userData._count} />
          </AdminSection>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <AdminSection title="Current cart" compact>
            <UserCartPreview cart={userData.cart} />
          </AdminSection>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <AdminSection
            title={`Orders (${orderCount})`}
            description="Purchase history with shipping, payment, and admin actions."
            compact
          >
            <UserOrders
              orders={userData.buyerOrders}
              getToken={getToken}
              onOrderUpdated={onOrderUpdated}
            />
          </AdminSection>
        </div>
      </AdminCollapsible>
    </AdminCard>
  )
}

export default function AdminUsers() {
  const { user } = useUser()
  const { getToken } = useAuth()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchUsers = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUsers(data.users)
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    }
    setLoading(false)
  }

  const handleOrderUpdated = (updatedOrder) => {
    setUsers((prev) =>
      prev.map((userData) => ({
        ...userData,
        buyerOrders: userData.buyerOrders?.map((order) =>
          order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order
        ),
      }))
    )
  }

  const deleteUser = async (userId) => {
    try {
      const token = await getToken()
      const { data } = await axios.post(
        '/api/admin/delete-user',
        { userToDeleteId: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      await fetchUsers()
      setDeleteTarget(null)
      toast.success(data.message || 'User deleted successfully')
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
      setDeleteTarget(null)
    }
  }

  useEffect(() => {
    if (user) {
      fetchUsers()
    }
  }, [user])

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return users

    return users.filter((userData) => {
      const haystack = [
        userData.name,
        userData.email,
        userData.id,
        userData.store?.name,
        userData.store?.username,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [users, searchQuery])

  const storeOwners = users.filter((u) => u.store).length

  if (loading) {
    return <AdminLoading label="Loading users..." className="py-16 lg:py-24" />
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      <AdminPageHeader
        title="Users"
        description="View and manage registered platform users, their stores, carts, and order history."
        meta={
          <>
            Showing{' '}
            <span className="font-medium text-slate-800">
              {filteredUsers.length}
            </span>{' '}
            of{' '}
            <span className="font-medium text-slate-800">{users.length}</span>{' '}
            {users.length === 1 ? 'user' : 'users'}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        <AdminStatCard
          title="Total users"
          value={users.length}
          icon={Users}
          className="min-w-0 max-lg:p-4"
        />
        <AdminStatCard
          title="Store owners"
          value={storeOwners}
          icon={Store}
          className="min-w-0 max-lg:p-4"
        />
        <AdminStatCard
          title="With orders"
          value={users.filter((u) => u._count?.buyerOrders > 0).length}
          icon={ShoppingBag}
          className="min-w-0 max-lg:p-4 md:col-span-2 lg:col-span-1"
        />
      </div>

      <AdminSearchInput
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onClear={() => setSearchQuery('')}
        placeholder="Search by name, email, ID, or store..."
        label="Search users"
        inputClassName="max-lg:min-h-11 max-lg:text-base max-lg:py-2.5 lg:text-sm lg:py-2"
        clearButtonClassName="max-lg:min-h-11 max-lg:min-w-11 max-lg:flex max-lg:items-center max-lg:justify-center max-lg:right-1"
      />

      {filteredUsers.length ? (
        <div className="space-y-3 lg:space-y-3">
          {filteredUsers.map((userData) => (
            <UserCard
              key={userData.id}
              userData={userData}
              getToken={getToken}
              onOrderUpdated={handleOrderUpdated}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      ) : users.length ? (
        <AdminEmptyState
          title="No matching users"
          description="Try adjusting your search terms."
          actionLabel="Clear search"
          onAction={() => setSearchQuery('')}
        />
      ) : (
        <AdminEmptyState title="No users found" />
      )}

      <AdminModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This will permanently delete the user account, orders, ratings, addresses, favorites, and any associated store data. This action cannot be undone."
        confirmLabel="Delete user"
        confirmVariant="danger"
        onConfirm={() => deleteUser(deleteTarget?.id)}
      />
    </div>
  )
}
