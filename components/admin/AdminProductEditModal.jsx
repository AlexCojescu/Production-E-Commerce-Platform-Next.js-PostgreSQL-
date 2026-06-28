'use client'

import { useEffect, useMemo, useState } from 'react'
import { Calendar, DollarSign, Tag } from 'lucide-react'
import {
  AdminInput,
  AdminModal,
  AdminToggle,
} from '@/components/admin/ui'
import {
  toDateInputValue,
  validateAdminProductFields,
} from '@/lib/adminProductValidation'

const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

const emptyForm = {
  sold: false,
  dateBought: '',
  dateSold: '',
  acquiredPrice: '',
  soldPrice: '',
}

function FormSection({ icon: Icon, title, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Icon size={14} aria-hidden="true" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{title}</p>
      </div>
      {children}
    </div>
  )
}

function FieldWrap({ error, children }) {
  return (
    <div className="space-y-1">
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default function AdminProductEditModal({
  product,
  open,
  onClose,
  onSave,
  saving = false,
}) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!product) {
      setForm(emptyForm)
      setErrors({})
      return
    }

    setForm({
      sold: Boolean(product.sold),
      dateBought: toDateInputValue(product.dateBought) || toDateInputValue(product.createdAt),
      dateSold: toDateInputValue(product.dateSold),
      acquiredPrice:
        product.acquiredPrice != null ? String(product.acquiredPrice) : '',
      soldPrice: product.soldPrice != null ? String(product.soldPrice) : '',
    })
    setErrors({})
  }, [product, open])

  const updateField = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'sold' && !value) {
        next.dateSold = ''
        next.soldPrice = ''
      }
      return next
    })
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const preview = useMemo(() => {
    if (!form.sold || form.acquiredPrice === '' || form.soldPrice === '') return null
    const margin = Number(form.soldPrice) - Number(form.acquiredPrice)
    const roi =
      Number(form.acquiredPrice) > 0
        ? (margin / Number(form.acquiredPrice)) * 100
        : null
    return { margin, roi }
  }, [form.sold, form.acquiredPrice, form.soldPrice])

  const handleSubmit = () => {
    const validation = validateAdminProductFields(form)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    onSave({
      productId: product.id,
      sold: form.sold,
      dateBought: form.dateBought,
      dateSold: form.sold ? form.dateSold : null,
      acquiredPrice: Number(form.acquiredPrice),
      soldPrice: form.sold ? Number(form.soldPrice) : null,
    })
  }

  if (!product) return null

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title="Edit inventory"
      description={product.name}
      confirmLabel={saving ? 'Saving...' : 'Save changes'}
      confirmVariant="primary"
      onConfirm={handleSubmit}
      loading={saving}
    >
      <div className="mt-5 space-y-5 lg:space-y-6">
        <div className="flex flex-col gap-3 rounded-xl bg-slate-900 px-4 py-3 text-white max-lg:gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <Tag size={16} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">Sale status</p>
              <p className="text-xs text-slate-400">
                {form.sold ? 'Sold — date & price required' : 'Currently listed'}
              </p>
            </div>
          </div>
          <AdminToggle
            checked={form.sold}
            onChange={(e) => updateField('sold', e.target.checked)}
            srLabel="Mark product as sold"
            activeColor="peer-checked:bg-emerald-500"
            className="max-lg:self-start lg:self-auto"
          />
        </div>

        <FormSection icon={Calendar} title="Acquisition">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <FieldWrap error={errors.dateBought}>
              <AdminInput
                label="Date bought"
                type="date"
                value={form.dateBought}
                onChange={(e) => updateField('dateBought', e.target.value)}
                error={Boolean(errors.dateBought)}
                required
                className="max-lg:min-h-11 max-lg:text-base lg:text-sm"
              />
            </FieldWrap>
            <FieldWrap error={errors.acquiredPrice}>
              <AdminInput
                label={`Acquired price (${CURRENCY})`}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.acquiredPrice}
                onChange={(e) => updateField('acquiredPrice', e.target.value)}
                error={Boolean(errors.acquiredPrice)}
                required
                className="max-lg:min-h-11 max-lg:text-base lg:text-sm"
              />
            </FieldWrap>
          </div>
        </FormSection>

        {form.sold && (
          <FormSection icon={DollarSign} title="Sale details">
            <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 lg:grid-cols-2">
              <FieldWrap error={errors.dateSold}>
                <AdminInput
                  label="Date sold"
                  type="date"
                  value={form.dateSold}
                  onChange={(e) => updateField('dateSold', e.target.value)}
                  error={Boolean(errors.dateSold)}
                  required
                  className="max-lg:min-h-11 max-lg:text-base lg:text-sm"
                />
              </FieldWrap>
              <FieldWrap error={errors.soldPrice}>
                <AdminInput
                  label={`Sold price (${CURRENCY})`}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.soldPrice}
                  onChange={(e) => updateField('soldPrice', e.target.value)}
                  error={Boolean(errors.soldPrice)}
                  required
                  className="max-lg:min-h-11 max-lg:text-base lg:text-sm"
                />
              </FieldWrap>
            </div>
          </FormSection>
        )}

        {preview && (
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-100">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600/80">
                Margin
              </p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums text-emerald-800">
                {CURRENCY}
                {preview.margin.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600/80">
                ROI
              </p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums text-emerald-800">
                {preview.roi != null ? `${preview.roi.toFixed(1)}%` : '—'}
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminModal>
  )
}
