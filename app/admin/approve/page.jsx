'use client'

import StoreInfo from '@/components/admin/StoreInfo'
import {
  AdminButton,
  AdminCard,
  AdminEmptyState,
  AdminLoading,
  AdminPageHeader,
} from '@/components/admin/ui'
import { useAuth, useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function AdminApprove() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchStores = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get('/api/admin/approve-store', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setStores(data.stores)
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    }
    setLoading(false)
  }

  const handleApprove = async ({ storeId, status }) => {
    try {
      const token = await getToken()
      const { data } = await axios.post(
        '/api/admin/approve-store',
        { storeId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(data.message)
      await fetchStores()
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    }
  }

  useEffect(() => {
    if (user) {
      fetchStores()
    }
  }, [user])

  if (loading) {
    return <AdminLoading label="Loading applications..." className="py-16 lg:py-24" />
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      <AdminPageHeader
        title="Approve"
        highlight="Stores"
        description="Review and approve pending store applications."
        meta={
          stores.length > 0 && (
            <>
              <span className="font-medium text-slate-700">{stores.length}</span>{' '}
              pending {stores.length === 1 ? 'application' : 'applications'}
            </>
          )
        }
      />

      {stores.length ? (
        <div className="space-y-3 lg:space-y-4">
          {stores.map((store) => (
            <AdminCard
              key={store.id}
              className="flex flex-col gap-4 max-lg:p-4 lg:flex-row lg:items-center lg:justify-between lg:gap-5"
            >
              <StoreInfo store={store} />

              <div className="flex w-full shrink-0 flex-col gap-2 border-t border-slate-100 pt-4 max-lg:gap-3 sm:max-lg:flex-row lg:w-auto lg:flex-wrap lg:items-center lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0 lg:gap-2">
                <AdminButton
                  variant="success"
                  size="sm"
                  className="max-lg:min-h-11 max-lg:flex-1 lg:min-h-8 lg:flex-none"
                  onClick={() =>
                    toast.promise(
                      handleApprove({ storeId: store.id, status: 'approved' }),
                      { loading: 'Approving...' }
                    )
                  }
                >
                  Approve
                </AdminButton>
                <AdminButton
                  variant="secondary"
                  size="sm"
                  className="max-lg:min-h-11 max-lg:flex-1 lg:min-h-8 lg:flex-none"
                  onClick={() =>
                    toast.promise(
                      handleApprove({ storeId: store.id, status: 'rejected' }),
                      { loading: 'Rejecting...' }
                    )
                  }
                >
                  Reject
                </AdminButton>
              </div>
            </AdminCard>
          ))}
        </div>
      ) : (
        <AdminEmptyState title="No applications pending" />
      )}
    </div>
  )
}
