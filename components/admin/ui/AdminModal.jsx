'use client'

import { useEffect } from 'react'
import { AdminButton } from './AdminButton'

export function AdminModal({
  open,
  onClose,
  title,
  description,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  confirmVariant = 'danger',
  loading = false,
}) {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center max-lg:p-0 lg:items-center lg:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div className="relative flex max-h-[min(92dvh,100%)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl max-lg:max-h-[min(92dvh,100%)] lg:max-h-none lg:rounded-xl">
        <div className="overflow-y-auto p-5 pb-[max(1rem,env(safe-area-inset-bottom))] lg:p-6">
          <h3
            id="admin-modal-title"
            className="text-lg font-semibold tracking-tight text-slate-900"
          >
            {title}
          </h3>
          {description && (
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
          )}
          {children}
          <div className="mt-6 flex flex-col-reverse gap-2 max-lg:[&_button]:min-h-11 lg:flex-row lg:justify-end lg:gap-3 lg:[&_button]:min-h-0">
            <AdminButton variant="secondary" size="sm" onClick={onClose}>
              {cancelLabel}
            </AdminButton>
            {onConfirm && (
              <AdminButton
                variant={confirmVariant}
                size="sm"
                onClick={onConfirm}
                disabled={loading}
              >
                {confirmLabel}
              </AdminButton>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
