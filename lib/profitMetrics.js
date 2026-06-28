/**
 * Sale price for analytics: explicit soldPrice when sold, otherwise list price.
 */
export function getSalePrice(product) {
  if (product.sold && product.soldPrice != null && Number.isFinite(product.soldPrice)) {
    return product.soldPrice
  }
  return product.price ?? 0
}

/**
 * Build per-product profit metrics from acquiredPrice and sold/list price.
 */
export function computeProductMetrics(product) {
  const priceSold = getSalePrice(product)
  const acquiredPrice = product.acquiredPrice
  const hasCost = acquiredPrice != null && Number.isFinite(acquiredPrice)

  if (!hasCost) {
    return {
      priceSold,
      acquiredPrice: null,
      margin: null,
      marginPercent: null,
      roi: null,
      hasCost: false,
    }
  }

  const margin = priceSold - acquiredPrice
  const marginPercent = priceSold > 0 ? (margin / priceSold) * 100 : 0
  const roi = acquiredPrice > 0 ? (margin / acquiredPrice) * 100 : 0

  return {
    priceSold,
    acquiredPrice,
    margin,
    marginPercent,
    roi,
    hasCost: true,
  }
}

/**
 * Aggregate portfolio-level stats from products with known acquisition costs.
 */
export function computePortfolioSummary(products) {
  const tracked = products.filter((p) => p.metrics.hasCost)
  const soldTracked = tracked.filter((p) => p.sold)

  const sum = (items, key) =>
    items.reduce((acc, item) => acc + (item.metrics[key] ?? 0), 0)

  const totalRevenue = sum(soldTracked, 'priceSold')
  const totalCost = sum(soldTracked, 'acquiredPrice')
  const totalMargin = totalRevenue - totalCost
  const totalInventoryCost = sum(
    tracked.filter((p) => !p.sold),
    'acquiredPrice'
  )
  const potentialRevenue = sum(
    tracked.filter((p) => !p.sold),
    'priceSold'
  )

  const avgMarginPercent =
    soldTracked.length > 0
      ? soldTracked.reduce((acc, p) => acc + p.metrics.marginPercent, 0) /
        soldTracked.length
      : 0

  const avgRoi =
    soldTracked.length > 0
      ? soldTracked.reduce((acc, p) => acc + p.metrics.roi, 0) / soldTracked.length
      : 0

  const portfolioRoi = totalCost > 0 ? (totalMargin / totalCost) * 100 : 0

  return {
    totalProducts: products.length,
    trackedCount: tracked.length,
    soldTrackedCount: soldTracked.length,
    totalRevenue,
    totalCost,
    totalMargin,
    totalInventoryCost,
    potentialRevenue,
    avgMarginPercent,
    avgRoi,
    portfolioRoi,
  }
}

/**
 * Group margin by brand for charting.
 */
export function groupMarginByBrand(products) {
  const groups = {}

  for (const product of products) {
    if (!product.metrics.hasCost) continue

    const brand = product.brand || 'Unknown'
    if (!groups[brand]) {
      groups[brand] = { brand, margin: 0, revenue: 0, cost: 0, count: 0 }
    }

    groups[brand].margin += product.metrics.margin
    groups[brand].revenue += product.metrics.priceSold
    groups[brand].cost += product.metrics.acquiredPrice
    groups[brand].count += 1
  }

  return Object.values(groups).sort((a, b) => b.margin - a.margin)
}
