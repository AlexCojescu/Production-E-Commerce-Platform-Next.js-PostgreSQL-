const MS_PER_DAY = 1000 * 60 * 60 * 24

/**
 * Days an item has been (or was) in inventory.
 * Sold: dateSold - dateBought. Listed: today - dateBought.
 */
export function computeInventoryAgeDays(product, now = new Date()) {
  if (!product?.dateBought) return null

  const bought = new Date(product.dateBought)
  if (Number.isNaN(bought.getTime())) return null

  const end =
    product.sold && product.dateSold
      ? new Date(product.dateSold)
      : now

  if (Number.isNaN(end.getTime())) return null

  const days = Math.floor((end.getTime() - bought.getTime()) / MS_PER_DAY)
  return Math.max(0, days)
}

export function formatInventoryAge(days) {
  if (days == null) return '—'
  if (days === 0) return '< 1 day'
  if (days === 1) return '1 day'
  return `${days} days`
}

/**
 * Chart rows sorted by inventory age (longest sitting first).
 */
export function buildInventoryAgeChartData(products, limit = 12) {
  return products
    .filter((p) => p.dateBought)
    .map((product) => {
      const days = computeInventoryAgeDays(product)
      return {
        id: product.id,
        name:
          product.name?.length > 18
            ? `${product.name.slice(0, 16)}…`
            : product.name || 'Product',
        days,
        status: product.sold ? 'Sold' : 'Listed',
        brand: product.brand || 'Unknown',
      }
    })
    .filter((row) => row.days != null)
    .sort((a, b) => b.days - a.days)
    .slice(0, limit)
}

export function computeInventoryAgeSummary(products) {
  const withAge = products
    .map((p) => computeInventoryAgeDays(p))
    .filter((d) => d != null)

  if (!withAge.length) {
    return { avgDays: 0, maxDays: 0, listedAvgDays: 0 }
  }

  const listed = products
    .filter((p) => !p.sold)
    .map((p) => computeInventoryAgeDays(p))
    .filter((d) => d != null)

  const avgDays = withAge.reduce((a, b) => a + b, 0) / withAge.length
  const maxDays = Math.max(...withAge)
  const listedAvgDays = listed.length
    ? listed.reduce((a, b) => a + b, 0) / listed.length
    : 0

  return { avgDays, maxDays, listedAvgDays }
}
