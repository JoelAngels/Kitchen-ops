/* -------------------------------------------------------------------------- */
/*  Mock orders + payment callbacks for the UI phase.                          */
/*  Deterministic (seeded) so server and client render identical markup.       */
/*  Replace with API calls during integration; the types are the contract.     */
/* -------------------------------------------------------------------------- */

export type OrderChannel =
  "Online" | "Cashier" | "Dine in" | "Takeaway" | "Glovo"
export type HistoryStatus = "Completed" | "Canceled" | "Refunded"
export type PaymentProvider =
  "M-Pesa STK Push" | "M-Pesa Till" | "Card (PDQ)" | "Cash" | "Glovo"
export type PaymentStatus = "success" | "failed" | "cancelled"

export type OrderLine = {
  name: string
  category: string
  qty: number
  price: number
}

export type HistoryOrder = {
  id: string
  number: number
  createdAt: number
  customer: string
  phone: string | null
  channel: OrderChannel
  table: string
  server: string | null
  party: number | null
  lines: OrderLine[]
  itemCount: number
  total: number
  provider: PaymentProvider | null
  ref: string | null
  status: HistoryStatus
  etims: boolean
  timeline: { at: number; label: string }[]
}

export type PaymentTxn = {
  id: string
  at: number
  provider: PaymentProvider
  amount: number
  receipt: string | null
  phone: string | null
  status: PaymentStatus
  tab: string | null
  orderNumber: number | null
  user: string | null
  manual: boolean
  checkoutRequestId: string
  merchantRequestId: string
  resultCode: number
  resultDesc: string
}

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const r = rng(20261105)
const pick = <T>(arr: readonly T[]) => arr[Math.floor(r() * arr.length)]
const between = (min: number, max: number) =>
  Math.floor(min + r() * (max - min + 1))

const NAMES = [
  "Rayan Hakim",
  "Jomo Gecaga",
  "Mohammed Mapesa",
  "Allamano",
  "Nasra",
  "Ashby Silver",
  "Wairimu",
  "Bahja Abdirahman",
  "Aliyah Padamshi",
  "Jackie",
  "Mukhtar",
  "Marlene Wamalwa",
  "Charles",
  "Akil Ahmed",
  "Mohamed Ali",
  "Purity Njeri",
  "Kevin Otieno",
  "Faith Achieng",
  "Brian Kamau",
  "Zawadi Mwangi",
]
const SERVERS = ["Ali", "Grace", "Peter", "Mercy"]
const MENU: { name: string; category: string; price: number }[] = [
  { name: "Classic Smash", category: "Smash burgers", price: 850 },
  { name: "Double Smash", category: "Smash burgers", price: 1150 },
  { name: "Truffle Smash", category: "Smash burgers", price: 1300 },
  { name: "Spicy Chicken", category: "Chicken burgers", price: 900 },
  { name: "Crispy Chicken", category: "Chicken burgers", price: 850 },
  { name: "Loaded Fries", category: "Fries", price: 550 },
  { name: "Regular Fries", category: "Fries", price: 300 },
  { name: "Oreo Shake", category: "Shakes", price: 600 },
  { name: "Buffalo Wings (6)", category: "Wings", price: 750 },
  { name: "Coke 500ml", category: "Soft drinks", price: 150 },
  { name: "Garlic Mayo", category: "Sides & sauces", price: 100 },
]

const phoneFor = new Map<string, string>()
function phone(name: string) {
  if (!phoneFor.has(name)) {
    phoneFor.set(
      name,
      `07${between(0, 9)}${between(0, 9)}${String(between(0, 999999)).padStart(6, "0")}`
    )
  }
  return phoneFor.get(name)!
}

const REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789"
const ref = (prefix: string) =>
  prefix +
  Array.from(
    { length: 8 },
    () => REF_CHARS[Math.floor(r() * REF_CHARS.length)]
  ).join("")
const uid = (prefix: string) =>
  `${prefix}_${Array.from({ length: 10 }, () => "0123456789abcdef"[Math.floor(r() * 16)]).join("")}`

// Fixed "now" so data is stable: 5 Nov 2026, 10:00 Nairobi (UTC+3).
export const MOCK_NOW = Date.UTC(2026, 10, 5, 7, 0)
const DAY = 86_400_000

function build() {
  const orders: HistoryOrder[] = []
  const payments: PaymentTxn[] = []
  let at = MOCK_NOW - 3 * 3_600_000
  let number = 2140

  for (let i = 0; i < 64; i++) {
    at -= between(2, 60) * 3_600_000 * (i < 20 ? 0.6 : 1.4)
    // Keep times inside opening hours (10:00–23:00 Nairobi).
    const hour = new Date(at + 3 * 3_600_000).getUTCHours()
    if (hour < 10) at -= (hour + 2) * 3_600_000

    const channel: OrderChannel =
      r() < 0.55
        ? "Online"
        : pick(["Cashier", "Dine in", "Takeaway", "Glovo"] as const)
    const canceled = r() < 0.12
    const refunded = !canceled && r() < 0.03
    const customer =
      channel === "Dine in" ? `Table ${between(1, 14)}` : pick(NAMES)
    const lines: OrderLine[] = canceled
      ? []
      : Array.from({ length: between(1, 4) }, () => ({
          ...pick(MENU),
          qty: between(1, 3),
        }))
    const total = lines.reduce((s, l) => s + l.qty * l.price, 0)
    const provider: PaymentProvider | null = canceled
      ? null
      : channel === "Online"
        ? "M-Pesa STK Push"
        : channel === "Glovo"
          ? "Glovo"
          : pick([
              "M-Pesa Till",
              "M-Pesa STK Push",
              "Card (PDQ)",
              "Cash",
            ] as const)
    const receipt =
      provider && provider !== "Cash"
        ? ref(provider === "Card (PDQ)" ? "PDQ" : "U")
        : null
    const custPhone =
      channel === "Dine in" || channel === "Glovo" ? null : phone(customer)
    const server =
      channel === "Online" || channel === "Glovo" ? null : pick(SERVERS)
    number -= 1

    const timeline = canceled
      ? [
          { at, label: "Order opened" },
          { at: at + 4 * 60_000, label: `Canceled by ${server ?? "customer"}` },
        ]
      : [
          {
            at,
            label:
              channel === "Online"
                ? "Placed on website"
                : `Opened by ${server ?? "Glovo"}`,
          },
          { at: at + 60_000, label: "Sent to kitchen" },
          { at: at + between(8, 16) * 60_000, label: "Ready for pickup" },
          {
            at: at + between(17, 25) * 60_000,
            label: provider ? `Paid · ${provider}` : "Closed",
          },
        ]

    orders.push({
      id: `ord_${number}`,
      number,
      createdAt: at,
      customer,
      phone: custPhone,
      channel,
      table:
        channel === "Dine in"
          ? customer.replace("Table ", "T")
          : channel.toUpperCase(),
      server,
      party: channel === "Dine in" ? between(1, 6) : null,
      lines,
      itemCount: lines.reduce((s, l) => s + l.qty, 0),
      total,
      provider,
      ref: receipt,
      status: canceled ? "Canceled" : refunded ? "Refunded" : "Completed",
      etims: !canceled && r() < 0.25,
      timeline,
    })

    if (provider && provider !== "Cash") {
      const payPhone = custPhone ? `254${custPhone.slice(1)}` : null
      // Some STK pushes fail first (wrong PIN, timeout) before the retry succeeds.
      if (provider === "M-Pesa STK Push" && r() < 0.2) {
        payments.push({
          id: uid("txn"),
          at: at + 60_000,
          provider,
          amount: total,
          receipt: null,
          phone: payPhone,
          status: r() < 0.6 ? "failed" : "cancelled",
          tab: null,
          orderNumber: null,
          user: null,
          manual: false,
          checkoutRequestId: uid("ws_CO"),
          merchantRequestId: uid("mr"),
          resultCode: 1032,
          resultDesc: "Request cancelled by user",
        })
      }
      payments.push({
        id: uid("txn"),
        at: at + 2 * 60_000,
        provider,
        amount: total,
        receipt,
        phone: payPhone,
        status: "success",
        tab: customer,
        orderNumber: number,
        user: server ?? (channel === "Glovo" ? "Glovo" : "Online"),
        manual: false,
        checkoutRequestId: uid("ws_CO"),
        merchantRequestId: uid("mr"),
        resultCode: 0,
        resultDesc: "The service request is processed successfully.",
      })
    }
  }

  // Two successful callbacks that never got linked to a tab: what reconciliation is for.
  for (let i = 0; i < 2; i++) {
    const amount = between(4, 30) * 50
    payments.push({
      id: uid("txn"),
      at: MOCK_NOW - between(1, 20) * DAY,
      provider: "M-Pesa Till",
      amount,
      receipt: ref("U"),
      phone: `2547${between(10000000, 99999999)}`,
      status: "success",
      tab: null,
      orderNumber: null,
      user: null,
      manual: false,
      checkoutRequestId: uid("ws_CO"),
      merchantRequestId: uid("mr"),
      resultCode: 0,
      resultDesc: "The service request is processed successfully.",
    })
  }

  payments.sort((a, b) => b.at - a.at)
  return { orders, payments }
}

const DATA = build()
export const MOCK_ORDERS = DATA.orders
export const MOCK_PAYMENTS = DATA.payments
export const SERVER_NAMES = SERVERS

/* ------------------------------- Formatting -------------------------------- */

export { formatDate, formatDateTime, formatTime } from "@/lib/format"

/** 0722473424 → 0722 473 424 */
export function formatPhone(p: string | null) {
  if (!p) return null
  const local = p.startsWith("254") ? `0${p.slice(3)}` : p
  return local.replace(/^(\d{4})(\d{3})(\d{3})$/, "$1 $2 $3")
}

/* ------------------------------- Date ranges ------------------------------- */

export type DateRange = "all" | "today" | "7d" | "30d" | "90d"
export const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
]

export function inRange(t: number, range: DateRange) {
  if (range === "all") return true
  const days = range === "today" ? 1 : Number(range.replace("d", ""))
  return t >= MOCK_NOW - days * DAY
}
