/**
 * Parse and validate admin-only product inventory/pricing fields.
 */

export function parseDateInput(value) {
  if (value == null || value === '') return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function toDateInputValue(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().split('T')[0]
}

export function validateAdminProductFields({
  sold,
  dateBought,
  dateSold,
  acquiredPrice,
  soldPrice,
}) {
  const errors = {}

  const boughtDate = parseDateInput(dateBought)
  if (!boughtDate) {
    errors.dateBought = 'Date bought is required'
  }

  const acquired = Number(acquiredPrice)
  if (
    acquiredPrice === '' ||
    acquiredPrice == null ||
    !Number.isFinite(acquired) ||
    acquired < 0
  ) {
    errors.acquiredPrice = 'Acquired price is required'
  }

  if (sold) {
    const soldDate = parseDateInput(dateSold)
    if (!soldDate) {
      errors.dateSold = 'Date sold is required when marked as sold'
    }

    const soldAmount = Number(soldPrice)
    if (
      soldPrice === '' ||
      soldPrice == null ||
      !Number.isFinite(soldAmount) ||
      soldAmount < 0
    ) {
      errors.soldPrice = 'Sold price is required when marked as sold'
    }

    if (boughtDate && soldDate && soldDate < boughtDate) {
      errors.dateSold = 'Date sold cannot be before date bought'
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export function buildAdminProductUpdateData(body) {
  const {
    sold = false,
    dateBought,
    dateSold,
    acquiredPrice,
    soldPrice,
  } = body

  const validation = validateAdminProductFields({
    sold: Boolean(sold),
    dateBought,
    dateSold,
    acquiredPrice,
    soldPrice,
  })

  if (!validation.valid) {
    return { error: validation.errors }
  }

  const boughtDate = parseDateInput(dateBought)
  const data = {
    sold: Boolean(sold),
    dateBought: boughtDate,
    acquiredPrice: Number(acquiredPrice),
    dateSold: null,
    soldPrice: null,
  }

  if (data.sold) {
    data.dateSold = parseDateInput(dateSold)
    data.soldPrice = Number(soldPrice)
  }

  return { data }
}
