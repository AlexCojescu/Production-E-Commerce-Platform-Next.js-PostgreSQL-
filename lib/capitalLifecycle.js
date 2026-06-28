const MS_PER_DAY = 1000 * 60 * 60 * 24

export const LIQUIDITY_WINDOW_DAYS = 30

function parseDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Build Gantt rows for the capital lifecycle timeline.
 */
export function buildCapitalLifecycleRows(products, now = new Date()) {
  return products
    .map((product) => {
      const start = parseDate(product.dateBought)
      if (!start) return null

      const end =
        product.sold && product.dateSold ? parseDate(product.dateSold) : now
      if (!end) return null

      const totalMs = Math.max(end.getTime() - start.getTime(), MS_PER_DAY)
      const totalDays = Math.max(1, Math.ceil(totalMs / MS_PER_DAY))
      const greenDays = Math.min(LIQUIDITY_WINDOW_DAYS, totalDays)
      const stressDays = Math.max(0, totalDays - LIQUIDITY_WINDOW_DAYS)

      return {
        id: product.id,
        brand: product.brand || 'Unknown',
        name: product.name || 'Item',
        start,
        end,
        totalDays,
        greenDays,
        stressDays,
        sold: Boolean(product.sold),
        image: product.images?.[0] ?? null,
        acquiredPrice: product.acquiredPrice ?? null,
        margin: product.metrics?.margin ?? null,
        hasCost: Boolean(product.metrics?.hasCost),
        storeName: product.store?.name ?? null,
        dateBought: product.dateBought,
        dateSold: product.dateSold ?? null,
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.totalDays - a.totalDays)
}

export function getTimelineBounds(rows) {
  if (!rows.length) return null

  const minTime = Math.min(...rows.map((r) => r.start.getTime()))
  const maxTime = Math.max(...rows.map((r) => r.end.getTime()))
  const range = Math.max(maxTime - minTime, MS_PER_DAY)

  return {
    min: new Date(minTime),
    max: new Date(maxTime),
    range,
  }
}

export function getBarPosition(row, bounds) {
  const left = ((row.start.getTime() - bounds.min.getTime()) / bounds.range) * 100
  const width = ((row.end.getTime() - row.start.getTime()) / bounds.range) * 100

  return {
    left: Math.max(0, Math.min(left, 100)),
    width: Math.max(0.4, Math.min(width, 100 - left)),
  }
}

export function getZoneWidths(totalDays) {
  const green = Math.min(LIQUIDITY_WINDOW_DAYS, totalDays)
  const stress = Math.max(0, totalDays - LIQUIDITY_WINDOW_DAYS)
  const greenPct = (green / totalDays) * 100
  const stressPct = (stress / totalDays) * 100

  return { greenPct, stressPct }
}

export function buildTimelineTicks(bounds, count = 5) {
  const ticks = []
  const step = bounds.range / Math.max(count - 1, 1)

  for (let i = 0; i < count; i += 1) {
    const time = bounds.min.getTime() + step * i
    ticks.push(new Date(time))
  }

  return ticks
}

export function formatTimelineDate(date) {
  const options = { month: 'short', day: 'numeric' }
  if (date.getFullYear() !== new Date().getFullYear()) {
    options.year = 'numeric'
  }
  return date.toLocaleDateString(undefined, options)
}

export function formatLifecycleDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Listed items past the liquidity window need attention. */
export function isStressedHold(row) {
  return !row.sold && row.stressDays > 0
}

export function getLifecyclePhase(row) {
  if (row.sold) return 'closed'
  if (row.stressDays > 0) return 'stressed'
  return 'liquid'
}

const PHASE_ORDER = { stressed: 0, liquid: 1, closed: 2 }

export function sortLifecycleRows(rows, { statusFilter = 'all' } = {}) {
  const filtered = rows.filter((row) => {
    if (statusFilter === 'listed') return !row.sold
    if (statusFilter === 'sold') return row.sold
    return true
  })

  return [...filtered].sort((a, b) => {
    const phaseDiff = PHASE_ORDER[getLifecyclePhase(a)] - PHASE_ORDER[getLifecyclePhase(b)]
    if (phaseDiff !== 0) return phaseDiff
    return b.totalDays - a.totalDays
  })
}

export function groupLifecycleRows(rows) {
  const groups = {
    stressed: { id: 'stressed', label: 'Extended hold', hint: 'Listed past 30 days', rows: [] },
    liquid: { id: 'liquid', label: 'In liquidity window', hint: 'Listed within 30 days', rows: [] },
    closed: { id: 'closed', label: 'Capital recovered', hint: 'Sold items', rows: [] },
  }

  for (const row of rows) {
    groups[getLifecyclePhase(row)].rows.push(row)
  }

  return Object.values(groups).filter((group) => group.rows.length > 0)
}

export function computeCapitalLifecycleSummary(rows) {
  const listed = rows.filter((row) => !row.sold)
  const sold = rows.filter((row) => row.sold)
  const stressed = listed.filter(isStressedHold)
  const inWindow = listed.filter((row) => row.stressDays === 0)

  const avgDays =
    rows.length > 0
      ? Math.round(rows.reduce((sum, row) => sum + row.totalDays, 0) / rows.length)
      : 0

  const sumCapital = (items) =>
    items.reduce((sum, row) => sum + (Number(row.acquiredPrice) || 0), 0)

  return {
    totalItems: rows.length,
    listedCount: listed.length,
    soldCount: sold.length,
    stressedCount: stressed.length,
    inWindowCount: inWindow.length,
    avgDays,
    capitalListed: sumCapital(listed),
    capitalStressed: sumCapital(stressed),
  }
}
