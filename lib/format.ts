/* Deterministic formatting. Intl output differs between Node and Safari (e.g. "Sept" vs "Sep",
   "13:00" vs "at 13:00"), which breaks hydration on iPhones. These produce identical strings
   on every engine. All times are shown in the restaurant's timezone, Africa/Nairobi (UTC+3, no DST). */

const NAIROBI_OFFSET_MS = 3 * 3_600_000
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const pad = (n: number) => String(n).padStart(2, "0")
const nairobi = (t: number) => new Date(t + NAIROBI_OFFSET_MS) // read with getUTC* methods

/** 1234567.8 → "1,234,568" */
export function formatNumber(n: number) {
  const sign = n < 0 ? "-" : ""
  return (
    sign + String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  )
}

/** "04 Nov 2026, 13:00" */
export function formatDateTime(t: number) {
  const d = nairobi(t)
  return `${pad(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}

/** "4 Nov 2026" */
export function formatDate(t: number) {
  const d = nairobi(t)
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/** "4 Nov" */
export function formatShortDate(t: number) {
  const d = nairobi(t)
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`
}

/** "Wed, 4 Nov 2026" */
export function formatDay(t: number) {
  const d = nairobi(t)
  return `${WEEKDAYS[d.getUTCDay()]}, ${formatDate(t)}`
}

/** "13:00" */
export function formatTime(t: number) {
  const d = nairobi(t)
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}

/** Day of week in Nairobi, 0 = Sunday. */
export const nairobiWeekday = (t: number) => nairobi(t).getUTCDay()
