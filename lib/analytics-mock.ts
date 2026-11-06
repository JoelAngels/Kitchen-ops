import { formatShortDate, nairobiWeekday } from "@/lib/format"
import { BRANCHES, MENU_CATEGORIES } from "@/lib/tamu-data"

/* Deterministic mock analytics so server/client renders match and filters feel real. */

export type Range = "today" | "yesterday" | "3d" | "7d" | "30d"
export type Scope = "branch" | "all"

export const RANGE_OPTIONS: { value: Range; label: string; days: number }[] = [
  { value: "today", label: "Today", days: 1 },
  { value: "yesterday", label: "Yesterday", days: 1 },
  { value: "3d", label: "3 days", days: 3 },
  { value: "7d", label: "7 days", days: 7 },
  { value: "30d", label: "30 days", days: 30 },
]

function hash(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function rng(seed: number) {
  let s = seed || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return ((s >>> 0) % 10_000) / 10_000
  }
}

// Restaurant traffic curve: lunch and dinner peaks.
const HOUR_WEIGHT: Record<number, number> = {
  10: 0.3,
  11: 0.6,
  12: 1.0,
  13: 1.1,
  14: 0.7,
  15: 0.45,
  16: 0.5,
  17: 0.7,
  18: 0.95,
  19: 1.15,
  20: 1.0,
  21: 0.7,
  22: 0.4,
}

const ITEMS: Record<string, { name: string; price: number }[]> = {
  "Smash burgers": [
    { name: "Classic Smash", price: 850 },
    { name: "Double Smash", price: 1150 },
    { name: "Truffle Smash", price: 1300 },
  ],
  "Chicken burgers": [
    { name: "Spicy Chicken", price: 900 },
    { name: "Crispy Chicken", price: 850 },
  ],
  Fries: [
    { name: "Loaded Fries", price: 550 },
    { name: "Regular Fries", price: 300 },
  ],
  Shakes: [
    { name: "Oreo Shake", price: 600 },
    { name: "Vanilla Shake", price: 550 },
  ],
  Wings: [{ name: "Buffalo Wings (6)", price: 750 }],
  "Soft drinks": [
    { name: "Coke 500ml", price: 150 },
    { name: "Stoney 500ml", price: 150 },
  ],
  Beverages: [{ name: "Fresh Passion", price: 300 }],
  "Sides & sauces": [{ name: "Garlic Mayo", price: 100 }],
  Modifier: [{ name: "Extra Cheese", price: 120 }],
}

export function getAnalytics(branchId: string, scope: Scope, range: Range) {
  const r = rng(hash(`${scope === "all" ? "all" : branchId}:${range}`))
  const days = RANGE_OPTIONS.find((o) => o.value === range)!.days
  const scale = scope === "all" ? BRANCHES.length * 0.85 : 1
  const baseOrdersPerHour = 9 * scale

  const series: { label: string; revenue: number; orders: number }[] = []
  if (days === 1) {
    for (let h = 10; h <= 22; h++) {
      const orders = Math.round(
        baseOrdersPerHour * HOUR_WEIGHT[h] * (0.75 + r() * 0.5)
      )
      series.push({
        label: `${String(h).padStart(2, "0")}:00`,
        orders,
        revenue: orders * (1100 + r() * 500),
      })
    }
  } else {
    const end = Date.UTC(2026, 10, 5, 9) // noon in Nairobi, so day arithmetic never crosses midnight
    for (let d = days - 1; d >= 0; d--) {
      const t = end - d * 86_400_000
      const weekend = [5, 6].includes(nairobiWeekday(t)) ? 1.35 : 1
      const orders = Math.round(
        baseOrdersPerHour * 10 * weekend * (0.8 + r() * 0.4)
      )
      series.push({
        label: formatShortDate(t),
        orders,
        revenue: orders * (1100 + r() * 400),
      })
    }
  }

  const revenue = series.reduce((s, p) => s + p.revenue, 0)
  const orders = series.reduce((s, p) => s + p.orders, 0)
  const items = Math.round(orders * (2.2 + r() * 0.6))
  const delta = () => Math.round((r() - 0.4) * 300) / 10

  const orderTypes = [
    { name: "Dine in", share: 0.42 + r() * 0.1 },
    { name: "Takeaway", share: 0.25 + r() * 0.08 },
    { name: "Glovo", share: 0.18 + r() * 0.06 },
    { name: "Website", share: 0.06 + r() * 0.04 },
  ]
  const payments = [
    { name: "M-Pesa", share: 0.58 + r() * 0.1 },
    { name: "Card", share: 0.2 + r() * 0.06 },
    { name: "Cash", share: 0.08 + r() * 0.05 },
    { name: "Glovo payout", share: 0.1 + r() * 0.04 },
  ]
  const norm = <T extends { share: number }>(list: T[]) => {
    const total = list.reduce((s, x) => s + x.share, 0)
    return list
      .map((x) => ({
        ...x,
        share: x.share / total,
        value: Math.round((revenue * x.share) / total),
      }))
      .sort((a, b) => b.value - a.value)
  }

  const topItems = MENU_CATEGORIES.flatMap((category) =>
    (ITEMS[category] ?? []).map((item) => {
      const sold = Math.round(
        orders * (category.includes("burgers") ? 0.35 : 0.15) * (0.4 + r())
      )
      return { ...item, category, sold, revenue: sold * item.price }
    })
  ).sort((a, b) => b.revenue - a.revenue)

  const busiestHours = Object.keys(HOUR_WEIGHT).map((h) => ({
    label: `${h}:00`,
    orders: Math.round(
      baseOrdersPerHour * HOUR_WEIGHT[Number(h)] * (0.85 + r() * 0.3)
    ),
  }))

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
    (d, i) => ({
      label: d,
      revenue: Math.round(
        baseOrdersPerHour * 10 * 1250 * (i >= 4 ? 1.3 : 1) * (0.85 + r() * 0.3)
      ),
    })
  )

  const stations = [
    {
      name: "Smash grill",
      target: 6,
      avg: 4.5 + r() * 3,
      tickets: Math.round(orders * 0.7),
    },
    {
      name: "Fryer",
      target: 5,
      avg: 3.5 + r() * 2.5,
      tickets: Math.round(orders * 0.6),
    },
    {
      name: "Shakes & drinks",
      target: 3,
      avg: 2 + r() * 2,
      tickets: Math.round(orders * 0.4),
    },
    { name: "Expo / pass", target: 2, avg: 1 + r() * 1.8, tickets: orders },
  ].map((s) => ({ ...s, avg: Math.round(s.avg * 10) / 10 }))

  return {
    series,
    kpis: {
      revenue: { value: revenue, delta: delta() },
      avgOrder: { value: orders ? revenue / orders : 0, delta: delta() },
      orders: { value: orders, delta: delta() },
      items: { value: items, delta: delta() },
    },
    orderTypes: norm(orderTypes),
    payments: norm(payments),
    topItems,
    busiestHours,
    weekdays,
    stations,
  }
}

export type AnalyticsData = ReturnType<typeof getAnalytics>
