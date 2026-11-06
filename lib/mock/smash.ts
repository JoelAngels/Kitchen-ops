import { MOCK_ORDERS, type OrderChannel } from "@/lib/mock/transactions"

/* Smash-station tickets, derived from the shared mock orders so names and numbers line up. */

export const SMASH_TARGET_MIN = 15

export type SmashStage = { label: string; offsetSec: number }

export type SmashTicket = {
  id: string
  orderNumber: number
  customer: string
  channel: OrderChannel
  items: { name: string; qty: number }[]
  itemCount: number
  createdAt: number
  completedAt: number
  /** Cook time in minutes. null when the ticket was never bumped and auto-closed later. */
  minutes: number | null
  autoClosed: boolean
  stages: SmashStage[]
  cook: string
}

const COOKS = ["Brian", "Faith", "Otieno"]

function seeded(n: number) {
  let s = n * 9301 + 49297
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export const SMASH_TICKETS: SmashTicket[] = MOCK_ORDERS.filter(
  (o) =>
    o.status !== "Canceled" &&
    o.lines.some((l) => /burgers|Wings|Fries/.test(l.category))
).map((o) => {
  const r = seeded(o.number)
  const items = o.lines
    .filter((l) => /burgers|Wings|Fries/.test(l.category))
    .map((l) => ({ name: l.name, qty: l.qty }))
  const itemCount = items.reduce((s, i) => s + i.qty, 0)
  const autoClosed = r() < 0.06
  const minutes = autoClosed ? null : Math.round(5 + itemCount * 1.6 + r() * 14)
  const createdAt = o.createdAt + 60_000
  const totalSec = (minutes ?? 30) * 60
  // Stage split: queue → grill → flip & cheese → assemble → pass.
  const cuts = [
    0.12 + r() * 0.1,
    0.45 + r() * 0.1,
    0.7 + r() * 0.08,
    0.9 + r() * 0.05,
  ]
  const stages: SmashStage[] = [
    { label: "Ticket received", offsetSec: 0 },
    {
      label: "Patties on the grill",
      offsetSec: Math.round(totalSec * cuts[0]),
    },
    {
      label: "Smashed, flipped & cheesed",
      offsetSec: Math.round(totalSec * cuts[1]),
    },
    { label: "Assembled", offsetSec: Math.round(totalSec * cuts[2]) },
    { label: "Passed to expo", offsetSec: Math.round(totalSec * cuts[3]) },
    {
      label: autoClosed ? "Auto-closed at end of day" : "Bumped as complete",
      offsetSec: totalSec,
    },
  ]
  return {
    id: `smash_${o.number}`,
    orderNumber: o.number,
    customer: o.customer,
    channel: o.channel,
    items,
    itemCount,
    createdAt,
    completedAt: autoClosed
      ? createdAt + 9 * 3_600_000
      : createdAt + totalSec * 1000,
    minutes,
    autoClosed,
    stages,
    cook: COOKS[Math.floor(r() * COOKS.length)],
  }
})

export function speedTone(
  minutes: number | null
): "green" | "amber" | "red" | "slate" {
  if (minutes === null) return "slate"
  if (minutes <= SMASH_TARGET_MIN) return "green"
  if (minutes <= SMASH_TARGET_MIN + 8) return "amber"
  return "red"
}
