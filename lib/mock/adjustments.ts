import { MOCK_NOW } from "@/lib/mock/transactions"

/* Voids, comps, wastage, item moves and tab changes for the Adjustments screen. */

export type AdjustmentType =
  "void" | "cancel" | "comp" | "waste" | "move" | "tab"

export type Adjustment = {
  id: string
  at: number
  type: AdjustmentType
  item: string | null
  qty: number
  value: number
  tab: string
  from?: string
  to?: string
  by: string
  approvedBy: string | null
  reason: string
}

export const DEFAULT_COMP_REASONS: {
  section: string
  reasons: { label: string; needsNote?: boolean; locked?: boolean }[]
}[] = [
  {
    section: "Guest recovery",
    reasons: [
      { label: "Long wait / slow service" },
      { label: "Wrong order sent" },
      { label: "Food quality complaint" },
      { label: "Food arrived cold" },
      { label: "Item missing from order" },
      { label: "Undercooked / overcooked" },
      { label: "Allergy / dietary error" },
      { label: "Hygiene / foreign object" },
      { label: "Spilled or dropped at the table" },
      { label: "Billing / ordering error" },
      { label: "Late or damaged delivery" },
      { label: "Ordered item unavailable" },
    ],
  },
  {
    section: "Hospitality",
    reasons: [
      { label: "Manager goodwill" },
      { label: "Regular / VIP guest" },
      { label: "Birthday / celebration" },
      { label: "Owner / director hosting" },
      { label: "Influencer / media hosting" },
      { label: "Promotion / giveaway" },
      { label: "Loyalty gesture / follow-up" },
    ],
  },
  {
    section: "Internal",
    reasons: [
      { label: "Staff meal", locked: true },
      { label: "Training / staff tasting" },
      { label: "New menu R&D tasting" },
      { label: "Supplier / contractor" },
      { label: "Photography / marketing shoot" },
      { label: "Event hosting" },
    ],
  },
  {
    section: "Other",
    reasons: [{ label: "Something else", needsNote: true, locked: true }],
  },
]

const VOID_REASONS = [
  "Entered by mistake",
  "Customer changed mind",
  "Duplicate item",
  "Wrong modifier",
]
const CANCEL_REASONS = [
  "Customer walked out",
  "Test order",
  "Duplicate tab",
  "Payment never completed",
]
const WASTE_REASONS = [
  "Dropped on the floor",
  "Burnt on the grill",
  "Past hold time",
  "Returned by customer",
]
const STAFF = ["Ali", "Grace", "Peter", "Mercy", "Brian", "Faith"]
const MANAGERS = ["Wanjiku (Mgr)", "iamjoelangel"]
const ITEMS = [
  { name: "Classic Smash", price: 850 },
  { name: "Double Smash", price: 1150 },
  { name: "Spicy Chicken", price: 900 },
  { name: "Loaded Fries", price: 550 },
  { name: "Oreo Shake", price: 600 },
  { name: "Buffalo Wings (6)", price: 750 },
  { name: "Coke 500ml", price: 150 },
]
const TABS = [
  "Table 2",
  "Table 4",
  "Table 7",
  "Table 11",
  "Wanjiru",
  "Otieno",
  "Kamau",
  "Achieng",
  "Bar 1",
]

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
}

const r = rng(4242)
const pick = <T>(a: readonly T[]) => a[Math.floor(r() * a.length)]
const HOUR = 3_600_000

function build(): Adjustment[] {
  const list: Adjustment[] = []
  let at = MOCK_NOW - 0.4 * HOUR
  for (let i = 0; i < 90; i++) {
    at -= (0.6 + r() * (i < 15 ? 3 : 18)) * HOUR
    const hour = new Date(at + 3 * HOUR).getUTCHours()
    if (hour < 10) at -= (hour + 2) * HOUR
    const roll = r()
    const type: AdjustmentType =
      roll < 0.26
        ? "void"
        : roll < 0.36
          ? "cancel"
          : roll < 0.58
            ? "comp"
            : roll < 0.74
              ? "waste"
              : roll < 0.9
                ? "move"
                : "tab"
    const item = pick(ITEMS)
    const qty = 1 + Math.floor(r() * 2)
    const by = pick(STAFF)
    const tab = pick(TABS)
    const base = { id: `adj_${i}`, at, type, by, tab }

    switch (type) {
      case "void":
        list.push({
          ...base,
          item: item.name,
          qty,
          value: item.price * qty,
          approvedBy: r() < 0.5 ? pick(MANAGERS) : null,
          reason: pick(VOID_REASONS),
        })
        break
      case "cancel": {
        const value = Math.round(((1 + r() * 4) * 700) / 50) * 50
        list.push({
          ...base,
          item: null,
          qty: 0,
          value,
          approvedBy: pick(MANAGERS),
          reason: pick(CANCEL_REASONS),
        })
        break
      }
      case "comp": {
        const section = pick(DEFAULT_COMP_REASONS.slice(0, 3))
        list.push({
          ...base,
          item: item.name,
          qty,
          value: item.price * qty,
          approvedBy: pick(MANAGERS),
          reason: pick(section.reasons).label,
        })
        break
      }
      case "waste":
        list.push({
          ...base,
          item: item.name,
          qty,
          value: Math.round(item.price * qty * 0.38),
          approvedBy: r() < 0.3 ? pick(MANAGERS) : null,
          reason: pick(WASTE_REASONS),
        })
        break
      case "move":
        list.push({
          ...base,
          item: item.name,
          qty,
          value: item.price * qty,
          from: tab,
          to: pick(TABS.filter((t) => t !== tab)),
          approvedBy: null,
          reason: "Guest moved seats",
        })
        break
      case "tab": {
        const kind = pick(["Renamed", "Merged", "Split"] as const)
        const other = pick(TABS.filter((t) => t !== tab))
        list.push({
          ...base,
          item: null,
          qty: 0,
          value: 0,
          approvedBy: null,
          from: tab,
          to:
            kind === "Renamed"
              ? pick(["Wanjiru", "Otieno + friends", "Birthday table"])
              : other,
          reason: kind,
        })
        break
      }
    }
  }
  return list
}

export const MOCK_ADJUSTMENTS = build()

/* --------------------------- Nairobi day helpers --------------------------- */

const DAY = 86_400_000
const OFFSET = 3 * HOUR // Africa/Nairobi is UTC+3 all year.

export const startOfDay = (t: number) =>
  Math.floor((t + OFFSET) / DAY) * DAY - OFFSET
export const addDays = (t: number, n: number) => t + n * DAY

/** "2026-11-05" in Nairobi time, for <input type="date">. */
export const toDateInput = (t: number) =>
  new Date(t + OFFSET).toISOString().slice(0, 10)
export const fromDateInput = (s: string) =>
  Date.parse(`${s}T00:00:00Z`) - OFFSET
