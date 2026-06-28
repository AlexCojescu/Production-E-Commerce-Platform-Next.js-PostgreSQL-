'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'
import axios from 'axios'
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminEmptyState,
  AdminInput,
  AdminModal,
  AdminPageHeader,
  AdminSection,
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
  AdminToggle,
} from '@/components/admin/ui'

export default function AdminCoupons() {
  const { getToken } = useAuth()

  const [coupons, setCoupons] = useState([])
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    description: '',
    discount: '',
    forNewUser: false,
    forMember: false,
    isPublic: false,
    expiresAt: new Date(),
  })

  const fetchCoupons = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get('/api/admin/coupon', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCoupons(data.coupons)
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    }
  }

  const handleAddCoupon = async (e) => {
    e.preventDefault()
    try {
      const token = await getToken()

      newCoupon.discount = Number(newCoupon.discount)
      newCoupon.expiresAt = new Date(newCoupon.expiresAt)

      const { data } = await axios.post(
        '/api/admin/coupon',
        { coupon: newCoupon },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(data.message)
      await fetchCoupons()
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    }
  }

  const handleChange = (e) => {
    setNewCoupon({ ...newCoupon, [e.target.name]: e.target.value })
  }

  const deleteCoupon = async (code) => {
    try {
      const token = await getToken()
      await axios.delete(`/api/admin/coupon?code=${code}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      await fetchCoupons()
      setDeleteTarget(null)
      toast.success('Coupon deleted successfully')
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
      setDeleteTarget(null)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  return (
    <div className="space-y-6 lg:space-y-10">
      <AdminPageHeader
        title="Coupons"
        description="Create and manage discount codes for the platform."
      />

      <AdminCard className="max-w-lg max-lg:p-4">
        <form
          onSubmit={(e) =>
            toast.promise(handleAddCoupon(e), { loading: 'Adding coupon...' })
          }
        >
          <AdminSection
            title="Add coupon"
            description="Configure a new discount code."
            className="max-lg:space-y-3 lg:space-y-4"
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <AdminInput
                label="Coupon code"
                name="code"
                placeholder="SUMMER20"
                value={newCoupon.code}
                onChange={handleChange}
                required
                className="max-lg:min-h-11 max-lg:text-base lg:text-sm"
              />
              <AdminInput
                label="Discount (%)"
                type="number"
                name="discount"
                placeholder="10"
                min={1}
                max={100}
                value={newCoupon.discount}
                onChange={handleChange}
                required
                className="max-lg:min-h-11 max-lg:text-base lg:text-sm"
              />
            </div>

            <AdminInput
              label="Description"
              name="description"
              placeholder="Summer sale discount"
              value={newCoupon.description}
              onChange={handleChange}
              required
              className="max-lg:min-h-11 max-lg:text-base lg:text-sm"
            />

            <AdminInput
              label="Expiry date"
              type="date"
              name="expiresAt"
              value={format(newCoupon.expiresAt, 'yyyy-MM-dd')}
              onChange={handleChange}
              className="max-lg:min-h-11 max-lg:text-base lg:text-sm"
            />

            <div className="space-y-2 border-t border-slate-100 pt-4 max-lg:space-y-3 lg:space-y-3">
              <AdminToggle
                checked={newCoupon.forNewUser}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, forNewUser: e.target.checked })
                }
                label="For new users only"
                className="max-lg:min-h-11 max-lg:w-full max-lg:justify-between lg:min-h-0 lg:w-auto"
              />
              <AdminToggle
                checked={newCoupon.forMember}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, forMember: e.target.checked })
                }
                label="For members only"
                className="max-lg:min-h-11 max-lg:w-full max-lg:justify-between lg:min-h-0 lg:w-auto"
              />
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4 max-lg:pt-3">
              <AdminButton
                type="submit"
                className="max-lg:min-h-11 max-lg:w-full lg:min-h-9 lg:w-auto"
              >
                Add coupon
              </AdminButton>
            </div>
          </AdminSection>
        </form>
      </AdminCard>

      <div>
        <AdminSection
          title="Active coupons"
          description={`${coupons.length} coupon${coupons.length === 1 ? '' : 's'} configured`}
        />

        {coupons.length ? (
          <>
            <div className="mt-4 space-y-3 lg:hidden">
              {coupons.map((coupon) => (
                <CouponMobileRow
                  key={coupon.code}
                  coupon={coupon}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>

            <AdminTable className="mt-4 hidden max-w-5xl lg:block">
              <table className="min-w-[720px] w-full">
                <AdminTableHeader>
                  <tr>
                    <AdminTableHead>Code</AdminTableHead>
                    <AdminTableHead>Description</AdminTableHead>
                    <AdminTableHead>Discount</AdminTableHead>
                    <AdminTableHead>Expires</AdminTableHead>
                    <AdminTableHead align="center">New user</AdminTableHead>
                    <AdminTableHead align="center">Member</AdminTableHead>
                    <AdminTableHead align="center">Action</AdminTableHead>
                  </tr>
                </AdminTableHeader>
                <AdminTableBody>
                  {coupons.map((coupon) => (
                    <AdminTableRow key={coupon.code}>
                      <AdminTableCell className="font-medium text-slate-900">
                        {coupon.code}
                      </AdminTableCell>
                      <AdminTableCell>
                        <span className="line-clamp-2 max-w-[200px]">
                          {coupon.description}
                        </span>
                      </AdminTableCell>
                      <AdminTableCell className="tabular-nums">
                        {coupon.discount}%
                      </AdminTableCell>
                      <AdminTableCell className="tabular-nums text-slate-600">
                        {format(coupon.expiresAt, 'MMM d, yyyy')}
                      </AdminTableCell>
                      <AdminTableCell align="center" className="text-slate-600">
                        {coupon.forNewUser ? 'Yes' : 'No'}
                      </AdminTableCell>
                      <AdminTableCell align="center" className="text-slate-600">
                        {coupon.forMember ? 'Yes' : 'No'}
                      </AdminTableCell>
                      <AdminTableCell align="center">
                        <AdminButton
                          variant="ghost"
                          size="sm"
                          className="size-8 p-0 text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteTarget(coupon.code)}
                          aria-label={`Delete coupon ${coupon.code}`}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </AdminButton>
                      </AdminTableCell>
                    </AdminTableRow>
                  ))}
                </AdminTableBody>
              </table>
            </AdminTable>
          </>
        ) : (
          <AdminEmptyState
            className="mt-4 max-w-5xl"
            title="No coupons yet"
            description="Create your first coupon using the form above."
          />
        )}
      </div>

      <AdminModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete coupon"
        description={`Are you sure you want to delete the "${deleteTarget}" coupon? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={() => deleteCoupon(deleteTarget)}
      />
    </div>
  )
}

function CouponMobileRow({ coupon, onDelete }) {
  const audience = [
    coupon.forNewUser && 'New user',
    coupon.forMember && 'Member',
  ].filter(Boolean)

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-sm font-semibold text-slate-900">{coupon.code}</p>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{coupon.description}</p>
        </div>
        <span className="shrink-0 text-lg font-semibold tabular-nums text-slate-900">
          {coupon.discount}%
        </span>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5">
        <div className="min-w-0">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Expires
          </dt>
          <dd className="mt-0.5 text-sm tabular-nums text-slate-800">
            {format(coupon.expiresAt, 'MMM d, yyyy')}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Audience
          </dt>
          <dd className="mt-1 flex flex-wrap gap-1">
            {audience.length > 0 ? (
              audience.map((label) => (
                <AdminBadge key={label} variant="neutral">
                  {label}
                </AdminBadge>
              ))
            ) : (
              <span className="text-sm text-slate-500">All users</span>
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <AdminButton
          variant="ghost"
          size="sm"
          className="min-h-11 w-full text-red-600 hover:bg-red-50"
          onClick={() => onDelete(coupon.code)}
          aria-label={`Delete coupon ${coupon.code}`}
        >
          <Trash2 size={16} aria-hidden="true" />
          Delete coupon
        </AdminButton>
      </div>
    </article>
  )
}
