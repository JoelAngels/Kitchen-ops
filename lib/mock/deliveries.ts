import { MOCK_NOW } from "@/lib/mock/transactions"

/* Glovo deliveries for the Delivery Monitor. Every timestamp the handoff maths needs is here. */

export type DeliveryStatus = "delivered" | "cancelled" | "failed"
export type LiveStage =
  "preparing" | "rider_assigned" | "at_restaurant" | "on_the_way"

export type Delivery = {
  id: string
  customer: string
  phone: string
  address: string
  rider: string
  placedAt: number
  promisedAt: number
  riderArrivedAt: number
  readyAt: number
  pickedUpAt: number
  deliveredAt: number
  status: DeliveryStatus
  reassigned: number
  fee: number
  basket: number
  distanceKm: number
  items: string
  rating: number | null
  comment: string | null
  failReason: string | null
}

export type LiveDelivery = {
  id: string
  customer: string
  phone: string
  address: string
  rider: string | null
  placedAt: number
  etaAt: number
  stage: LiveStage
  items: string
  basket: number
}

const MIN = 60_000
const DAY = 86_400_000

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}
const r = rng(777)
const pick = <T>(a: readonly T[]) => a[Math.floor(r() * a.length)]
const between = (a: number, b: number) => a + r() * (b - a)
const hex = () =>
  Array.from(
    { length: 6 },
    () => "0123456789abcdef"[Math.floor(r() * 16)]
  ).join("")

const CUSTOMERS: [string, string][] = [
  ["Rayan Hakim", "254797766226"],
  ["Jomo Gecaga", "254722473424"],
  ["Mohammed Mapesa", "254712625024"],
  ["Allamano", "254724228765"],
  ["Nasra", "254757171211"],
  ["Ashby Silver", "254119620407"],
  ["Wairimu", "254704393950"],
  ["Bahja Abdirahman", "254740222805"],
  ["Aliyah Padamshi", "254721702991"],
  ["Jackie", "254720941726"],
  ["Faith Achieng", "254733118204"],
  ["Kevin Otieno", "254701556090"],
]
const ADDRESSES = [
  "Tamarind Court, Kingara Rd",
  "Muthaiga Shopping Center",
  "Ndemi Ln",
  "Kitisuru Road",
  "Kayole Spine Road",
  "Mahiga Mairu Ave",
  "Mountain View, Waiyaki Way",
  "Mtama Rd",
  "Siaya Rd",
  "Riverside Drive",
  "Lenana Rd",
  "Argwings Kodhek Rd",
]
const RIDERS = [
  "Jeremiah Nyamongo",
  "Benadi Oriri",
  "Reece Lukalo",
  "Kenedy Masana",
  "David Chege",
  "Asimba Silas",
  "Boniface Maina",
  "Clifford Toroitich",
  "Imungu Nabwana",
  "Adam Okumu",
  "Elvis Busaka",
  "Disie Sospeter",
  "Vincent Otieno",
  "Duncan Disie",
  "Dennis Mbugua",
  "Pius Obonyo",
  "Darius Bett",
  "Moses Musia",
]
const ITEMS = [
  "1× The Solo Supreme, 1× Homestyle Fries",
  "2× The Double-Up Supreme, 2× Oreo Milkshake",
  "1× Korean Chicken Burger, 1× BBQ Wings",
  "1× Loaded Fries, 1× Ice Tea",
  "3× Chili Supreme Delight, 1× Apple Slaw",
  "1× Sweet and Sassy Chicken",
]
const COMMENTS = [
  "Burger was still hot, rider was super polite",
  "Fries a bit soggy by the time they got here",
  "Fast! Will order again",
  "Rider couldn't find the gate, call me next time",
  null,
  null,
]

function build() {
  const list: Delivery[] = []
  let day = MOCK_NOW - 0.6 * DAY
  for (let i = 0; i < 26; i++) {
    day -= between(0.4, 1.6) * DAY
    const hourOfDay = pick([11, 12, 12, 13, 13, 16, 18, 19, 19, 20, 20, 21])
    const midnightNairobi =
      Math.floor((day + 3 * 3_600_000) / DAY) * DAY - 3 * 3_600_000
    const placedAt =
      midnightNairobi + hourOfDay * 3_600_000 + between(0, 55) * MIN
    const dinner = hourOfDay >= 18
    const prep = between(12, dinner ? 34 : 24) * MIN
    const readyAt = placedAt + prep
    // Riders are usually dispatched too early, so they arrive well before the food.
    const riderArrivedAt = readyAt - between(-6, dinner ? 30 : 22) * MIN
    const pickedUpAt =
      Math.max(readyAt, riderArrivedAt) + between(1, dinner ? 14 : 7) * MIN
    const ride = between(14, 32) * MIN
    const deliveredAt = pickedUpAt + ride
    const promisedAt = placedAt + 40 * MIN
    const [customer, phone] = pick(CUSTOMERS)
    const roll = r()
    const status: DeliveryStatus =
      roll < 0.06 ? "cancelled" : roll < 0.1 ? "failed" : "delivered"
    const basket =
      Math.round(between(1, 5)) * 600 + Math.round(between(0, 6)) * 150
    const rated = status === "delivered" && r() < 0.35
    list.push({
      id: hex(),
      customer,
      phone,
      address: `${pick(ADDRESSES)}, Nairobi`,
      rider: pick(RIDERS),
      placedAt,
      promisedAt,
      riderArrivedAt,
      readyAt,
      pickedUpAt,
      deliveredAt,
      status,
      reassigned: r() < 0.12 ? 1 : 0,
      fee: Math.round(between(180, 380) / 10) * 10,
      basket,
      distanceKm: Math.round(between(1.8, 8.5) * 10) / 10,
      items: pick(ITEMS),
      rating: rated ? (r() < 0.75 ? 5 : r() < 0.6 ? 4 : 2) : null,
      comment: rated ? pick(COMMENTS) : null,
      failReason:
        status === "cancelled"
          ? "Customer cancelled before pickup"
          : status === "failed"
            ? "No rider accepted within 15 min"
            : null,
    })
  }
  return list.sort((a, b) => b.placedAt - a.placedAt)
}

export const MOCK_DELIVERIES = build()

export const MOCK_LIVE: LiveDelivery[] = [
  {
    id: "a81f2c",
    customer: "Wanjiru Kamau",
    phone: "254722909113",
    address: "Galana Rd, Kilimani, Nairobi",
    rider: "Jeremiah Nyamongo",
    placedAt: MOCK_NOW - 24 * MIN,
    etaAt: MOCK_NOW + 14 * MIN,
    stage: "on_the_way",
    items: "2× The Double-Up Supreme, 1× Loaded Fries",
    basket: 4400,
  },
  {
    id: "c90b11",
    customer: "Otieno Brian",
    phone: "254711230876",
    address: "Ngong Rd, Adams Arcade, Nairobi",
    rider: "Dennis Mbugua",
    placedAt: MOCK_NOW - 11 * MIN,
    etaAt: MOCK_NOW + 26 * MIN,
    stage: "at_restaurant",
    items: "1× Korean Chicken Burger, 1× Oreo Milkshake",
    basket: 1850,
  },
  {
    id: "f2210e",
    customer: "Achieng Odhiambo",
    phone: "254790112558",
    address: "Lavington Green, Nairobi",
    rider: null,
    placedAt: MOCK_NOW - 3 * MIN,
    etaAt: MOCK_NOW + 38 * MIN,
    stage: "preparing",
    items: "1× The Solo Supreme, 1× Homestyle Fries",
    basket: 1900,
  },
]

/* ------------------------------- Derived maths ------------------------------ */

export const minutes = (ms: number) => ms / MIN

export function deliveryMetrics(d: Delivery) {
  return {
    total: minutes(d.deliveredAt - d.placedAt),
    prep: minutes(d.readyAt - d.placedAt),
    /** Positive: rider arrived this long before the food was ready. */
    riderLead: minutes(d.readyAt - d.riderArrivedAt),
    /** Rider stood at the counter waiting for food. */
    riderIdle: Math.max(0, minutes(d.readyAt - d.riderArrivedAt)),
    /** Food sat ready before the rider left with it. */
    handoff: minutes(d.pickedUpAt - d.readyAt),
    ride: minutes(d.deliveredAt - d.pickedUpAt),
    lateBy: minutes(d.deliveredAt - d.promisedAt),
  }
}

export function median(values: number[]) {
  if (!values.length) return 0
  const s = [...values].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

export function percentile(values: number[], p: number) {
  if (!values.length) return 0
  const s = [...values].sort((a, b) => a - b)
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))]
}

export const mean = (values: number[]) =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
