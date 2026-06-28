'use client'

import StoreInfo from '@/components/admin/StoreInfo'
import {
  AdminButton,
  AdminCard,
  AdminEmptyState,
  AdminLoading,
  AdminModal,
  AdminPageHeader,
  AdminToggle,
} from '@/components/admin/ui'
import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useUser, useAuth } from '@clerk/nextjs'

export default function AdminStores() {
  const { user } = useUser()
  const { getToken } = useAuth()

  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchStores = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get('/api/admin/stores', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setStores(data.stores)
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    }
    setLoading(false)
  }

  const toggleIsActive = async (storeId) => {
    try {
      const token = await getToken()
      const { data } = await axios.post(
        '/api/admin/toggle-store',
        { storeId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      await fetchStores()
      toast.success(data.message)
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    }
  }

  const deleteStore = async (storeId) => {
    try {
      const token = await getToken()
      const { data } = await axios.post(
        '/api/admin/delete-store',
        { storeId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      await fetchStores()
      setDeleteTarget(null)
      toast.success(data.message || 'Store deleted successfully')
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
      setDeleteTarget(null)
    }
  }

  useEffect(() => {
    if (user) {
      fetchStores()
    }
  }, [user])

  if (loading) {
    return <AdminLoading label="Loading stores..." className="py-16 lg:py-24" />
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      <AdminPageHeader
        title="Stores"
        description="Manage live stores on the platform."
        meta={
          stores.length > 0 && (
            <>
              <span className="font-medium text-slate-700">{stores.length}</span>{' '}
              active {stores.length === 1 ? 'store' : 'stores'}
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

              <div className="flex w-full shrink-0 flex-col gap-2 border-t border-slate-100 pt-4 max-lg:gap-3 lg:w-auto lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                <AdminToggle
                  checked={store.isActive}
                  onChange={() =>
                    toast.promise(toggleIsActive(store.id), {
                      loading: 'Updating...',
                    })
                  }
                  label="Active"
                  size="sm"
                  className="max-lg:min-h-11 max-lg:w-full max-lg:justify-between lg:min-h-0 lg:w-auto"
                />
                <AdminButton
                  variant="danger"
                  size="sm"
                  className="max-lg:min-h-11 max-lg:w-full lg:min-h-8 lg:w-auto"
                  onClick={() =>
                    setDeleteTarget({ id: store.id, name: store.name })
                  }
                >
                  <Trash2 size={14} aria-hidden="true" />
                  Delete
                </AdminButton>
              </div>
            </AdminCard>
          ))}
        </div>
      ) : (
        <AdminEmptyState title="No stores available" />
      )}

      <AdminModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This will permanently delete the store, all products, orders, and related data. This action cannot be undone."
        confirmLabel="Delete store"
        confirmVariant="danger"
        onConfirm={() => deleteStore(deleteTarget?.id)}
      />
    </div>
  )
}
