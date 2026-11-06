"use client"

import * as React from "react"
import { motion } from "motion/react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"
import {
  AlertTriangleIcon,
  ChevronRightIcon,
  CircleCheckIcon,
  MapPinIcon,
  RefreshCwIcon,
  TimerIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react"

import { AnimatedNumber } from "@/components/motion/animated-number"
import { Segmented } from "@/components/segmented"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  MOCK_DELIVERIES,
  deliveryMetrics,
  mean,
  percentile,
  type Delivery,
} from "@/lib/mock/deliveries"
import { inRange, type DateRange } from "@/lib/mock/transactions"
import { formatKES } from "@/lib/tamu-data"
import { cn } from "@/lib/utils"

const SECTIONS = [
  { id: "reliability", label: "Reliability" },
  { id: "over-time", label: "Over time" },
  { id: "rider-wait", label: "Rider wait" },
  { id: "time", label: "Where time goes" },
  { id: "cost", label: "Cost & distance" },
  { id: "peak", label: "Peak times" },
  { id: "attention", label: "Needs attention" },
]

const ON_TIME_TARGET = 0.8
const OFFSET = 3 * 3_600_000
const dayKey = (t: number) => new Date(t + OFFSET).toISOString().slice(5, 10)
const hourOf = (t: number) => new Date(t + OFFSET).getUTCHours()
const weekdayOf = (t: number) => (new Date(t + OFFSET).getUTCDay() + 6) % 7 // Mon = 0
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function InsightsTab({
  onOpen,
  liveCount,
}: {
  onOpen: (d: Delivery) => void
  liveCount: number
}) {
  const [range, setRange] = React.useState<DateRange>("30d")
  const [active, setActive] = React.useState(SECTIONS[0].id)

  const all = MOCK_DELIVERIES.filter((d) => inRange(d.placedAt, range))
  const delivered = all.filter((d) => d.status === "delivered")
  const ms = delivered.map((d) => ({ d, m: deliveryMetrics(d) }))
  const onTime = ms.filter((x) => x.m.lateBy <= 0).length
  const onTimeRate = delivered.length ? onTime / delivered.length : 0
  const failed = all.filter((d) => d.status !== "delivered")
  const reassigned = all.filter((d) => d.reassigned > 0).length

  // Scroll-spy for the jump bar.
  React.useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          )[0]
        if (top) setActive(top.target.id)
      },
      { rootMargin: "-90px 0px -60% 0px" }
    )
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  /* ------------------------------ Series data ------------------------------ */

  const days = [...new Set(all.map((d) => dayKey(d.placedAt)))].sort()
  const outcomes = days.map((day) => {
    const list = all.filter((d) => dayKey(d.placedAt) === day)
    const ok = list.filter(
      (d) => d.status === "delivered" && deliveryMetrics(d).lateBy <= 0
    ).length
    const late = list.filter(
      (d) => d.status === "delivered" && deliveryMetrics(d).lateBy > 0
    ).length
    return { day, onTime: ok, late, failed: list.length - ok - late }
  })
  const riderWait = days
    .map((day) => {
      const waits = ms
        .filter((x) => dayKey(x.d.placedAt) === day)
        .map((x) => x.m.riderIdle)
      return { day, avg: +mean(waits).toFixed(1) }
    })
    .filter((r) => r.avg > 0)
  const hours = Array.from({ length: 12 }, (_, i) => i + 11).map((h) => ({
    hour: `${h}:00`,
    deliveries: all.filter((d) => hourOf(d.placedAt) === h).length,
  }))
  const weekdays = WEEKDAYS.map((label, i) => {
    const list = delivered.filter((d) => weekdayOf(d.placedAt) === i)
    const ok = list.filter((d) => deliveryMetrics(d).lateBy <= 0).length
    return {
      label,
      n: list.length,
      rate: list.length ? ok / list.length : null,
    }
  })
  const maxWeekday = Math.max(1, ...weekdays.map((w) => w.n))

  const segments = [
    {
      key: "prep",
      label: "Kitchen prep",
      values: ms.map((x) => x.m.prep),
      className: "bg-chart-1",
    },
    {
      key: "handoff",
      label: "Ready → picked up",
      values: ms.map((x) => x.m.handoff),
      className: "bg-chart-2",
    },
    {
      key: "ride",
      label: "Ride to customer",
      values: ms.map((x) => x.m.ride),
      className: "bg-chart-3",
    },
  ].map((s) => ({ ...s, avg: mean(s.values), p90: percentile(s.values, 90) }))
  const cycle = segments.reduce((s, x) => s + x.avg, 0)

  const attention = [...ms]
    .sort((a, b) => b.m.lateBy - a.m.lateBy)
    .filter((x) => x.m.lateBy > 0)
    .slice(0, 8)
  const fees = delivered.reduce((s, d) => s + d.fee, 0)
  const baskets = delivered.reduce((s, d) => s + d.basket, 0)
  const dist = delivered.map((d) => d.distanceKm)

  const jump = (id: string) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          How deliveries are going, end to end.
        </p>
        <Segmented<DateRange>
          size="sm"
          ariaLabel="Period"
          value={range}
          onChange={setRange}
          options={[
            { value: "7d", label: "7 days" },
            { value: "30d", label: "30 days" },
            { value: "all", label: "All time" },
          ]}
        />
      </div>

      <nav
        className="sticky top-14 z-10 -mx-1 flex gap-1 overflow-x-auto bg-background/85 px-1 py-2 backdrop-blur-md"
        aria-label="Jump to"
      >
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => jump(s.id)}
            className={cn(
              "relative isolate shrink-0 rounded-full px-3 py-1 text-sm whitespace-nowrap transition-colors",
              active === s.id
                ? "text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {active === s.id && (
              <motion.span
                layoutId="insights-jump"
                className="absolute inset-0 -z-10 rounded-full bg-foreground"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            {s.label}
          </button>
        ))}
      </nav>

      <Section
        id="reliability"
        title="Reliability"
        hint="are we keeping our promises?"
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Tile
            icon={TimerIcon}
            label="On time"
            value={onTimeRate * 100}
            suffix="%"
            good={onTimeRate >= ON_TIME_TARGET}
            sub={`${onTime} of ${delivered.length} delivered by the promised time`}
            note={
              onTimeRate >= ON_TIME_TARGET
                ? "On target (80%)"
                : "Below the 80% target. Dinner rush is the dip"
            }
          />
          <Tile
            icon={AlertTriangleIcon}
            label="Failed / cancelled"
            value={all.length ? (failed.length / all.length) * 100 : 0}
            suffix="%"
            good={failed.length / Math.max(1, all.length) < 0.05}
            sub={`${failed.length} of ${all.length} orders`}
            note="Reasons are listed under Needs attention"
          />
          <Tile
            icon={RefreshCwIcon}
            label="Reassigned"
            value={all.length ? (reassigned / all.length) * 100 : 0}
            suffix="%"
            good={reassigned / Math.max(1, all.length) < 0.1}
            sub={`${reassigned} needed a second rider`}
            note="First rider dropped out, Glovo re-dispatched"
          />
          <Tile
            icon={CircleCheckIcon}
            label="Avg cycle"
            value={mean(ms.map((x) => x.m.total))}
            suffix=" min"
            good={mean(ms.map((x) => x.m.total)) <= 45}
            sub={`placed → delivered · ${liveCount} live right now`}
            note={`Customers are promised 40 min`}
          />
        </div>
      </Section>

      <Section
        id="over-time"
        title="Outcomes by day"
        hint="hover a day for its on-time rate"
      >
        <ChartContainer
          config={
            {
              onTime: { label: "On time", color: "var(--success)" },
              late: { label: "Late", color: "var(--warning)" },
              failed: {
                label: "Failed / cancelled",
                color: "var(--destructive)",
              },
            } satisfies ChartConfig
          }
          className="aspect-auto h-[240px] w-full"
        >
          <BarChart
            data={outcomes}
            margin={{ left: -16, right: 8, top: 8 }}
            barCategoryGap="25%"
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              strokeOpacity={0.6}
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={40}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.6 }}
              content={
                <ChartTooltipContent
                  labelFormatter={(label, payload) => {
                    const p = payload?.[0]?.payload as
                      (typeof outcomes)[number] | undefined
                    const done = p ? p.onTime + p.late : 0
                    return `${label} · ${done ? Math.round((p!.onTime / done) * 100) : 0}% on time`
                  }}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="onTime"
              stackId="a"
              fill="var(--color-onTime)"
              stroke="var(--card)"
              strokeWidth={1}
            />
            <Bar
              dataKey="late"
              stackId="a"
              fill="var(--color-late)"
              stroke="var(--card)"
              strokeWidth={1}
            />
            <Bar
              dataKey="failed"
              stackId="a"
              fill="var(--color-failed)"
              stroke="var(--card)"
              strokeWidth={1}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </Section>

      <Section
        id="rider-wait"
        title="Minutes riders stood at the counter"
        hint="daily average · what Glovo scores us on · target 5 min"
      >
        <ChartContainer
          config={
            {
              avg: { label: "Avg wait (min)", color: "var(--chart-1)" },
            } satisfies ChartConfig
          }
          className="aspect-auto h-[240px] w-full"
        >
          <LineChart data={riderWait} margin={{ left: 0, right: 12, top: 12 }}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              strokeOpacity={0.6}
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={36}
              tickFormatter={(v) => `${v}m`}
            />
            <ReferenceLine
              y={5}
              stroke="var(--success)"
              strokeDasharray="4 4"
              label={{
                value: "target 5 min",
                position: "insideBottomRight",
                fill: "var(--success)",
                fontSize: 11,
              }}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: "4 4" }}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey="avg"
              type="linear"
              stroke="var(--color-avg)"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0, fill: "var(--color-avg)" }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
            />
          </LineChart>
        </ChartContainer>
      </Section>

      <Section
        id="time"
        title="Where the time goes"
        hint={`avg ${Math.round(cycle)} min, placed → delivered`}
      >
        <div className="flex h-8 gap-0.5 overflow-hidden rounded-lg">
          {segments.map((s, i) => (
            <motion.div
              key={s.key}
              title={`${s.label}: ${s.avg.toFixed(1)} min avg`}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.12,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ width: `${(s.avg / cycle) * 100}%` }}
              className={cn(
                "flex h-full origin-left items-center justify-center text-xs font-medium text-white",
                s.className
              )}
            >
              {Math.round(s.avg)}m
            </motion.div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {segments.map((s) => (
            <span key={s.key} className="flex items-center gap-2">
              <span className={cn("size-2.5 rounded-sm", s.className)} />
              {s.label}
              <span className="text-muted-foreground tabular-nums">
                {s.avg.toFixed(1)} min avg · p90 {s.p90.toFixed(0)}
              </span>
            </span>
          ))}
        </div>
      </Section>

      <Section id="cost" title="Cost & distance" hint="delivered orders only">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Mini
            icon={WalletIcon}
            label="Avg delivery fee"
            value={formatKES(mean(delivered.map((d) => d.fee)))}
          />
          <Mini icon={WalletIcon} label="Total fees" value={formatKES(fees)} />
          <Mini
            icon={WalletIcon}
            label="Fees as % of baskets"
            value={`${baskets ? Math.round((fees / baskets) * 100) : 0}%`}
            hint={`${formatKES(baskets)} in baskets`}
          />
          <Mini
            icon={MapPinIcon}
            label="Avg distance"
            value={`${mean(dist).toFixed(1)} km`}
            hint={`p90 ${percentile(dist, 90).toFixed(1)} km · max radius 15 km`}
          />
        </div>
      </Section>

      <Section id="peak" title="Peak times" hint="when orders land">
        <ChartContainer
          config={
            {
              deliveries: { label: "Deliveries", color: "var(--chart-1)" },
            } satisfies ChartConfig
          }
          className="aspect-auto h-[200px] w-full"
        >
          <BarChart data={hours} margin={{ left: -16, right: 8, top: 8 }}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              strokeOpacity={0.6}
            />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={4}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={40}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.6 }}
              content={<ChartTooltipContent />}
            />
            <Bar
              dataKey="deliveries"
              fill="var(--color-deliveries)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
        <h4 className="mt-4 mb-2 text-xs text-muted-foreground">
          By day of week · deliveries and on-time rate
        </h4>
        <div className="grid grid-cols-7 gap-1.5">
          {weekdays.map((w, i) => (
            <motion.div
              key={w.label}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="relative overflow-hidden rounded-lg border p-2 text-center"
            >
              <span
                className="absolute inset-0 bg-chart-1"
                style={{ opacity: 0.08 + (w.n / maxWeekday) * 0.5 }}
              />
              <span className="relative block text-xs text-muted-foreground">
                {w.label}
              </span>
              <span className="relative block text-lg font-semibold tabular-nums">
                {w.n}
              </span>
              <span className="relative block text-[11px] text-muted-foreground tabular-nums">
                {w.rate === null ? "—" : `${Math.round(w.rate * 100)}%`}
              </span>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section
        id="attention"
        title="Needs attention"
        hint="the latest deliveries, worst first · click for the full timeline"
      >
        {failed.length > 0 && (
          <div className="mb-3 flex flex-col gap-1.5">
            {failed.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => onOpen(d)}
                className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-left text-sm text-destructive"
              >
                <AlertTriangleIcon className="size-4 shrink-0" />
                <span className="font-medium">{d.customer}</span>
                <span className="truncate">· {d.failReason}</span>
                <ChevronRightIcon className="ml-auto size-4 shrink-0" />
              </button>
            ))}
          </div>
        )}
        {attention.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Every delivery in this period arrived on time.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 font-medium">Order</th>
                  <th className="py-2 font-medium">Customer</th>
                  <th className="py-2 font-medium">Issue</th>
                  <th className="py-2 text-right font-medium">Total</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {attention.map(({ d, m }) => (
                  <tr
                    key={d.id}
                    onClick={() => onOpen(d)}
                    className="cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/50"
                  >
                    <td className="py-2.5 font-mono text-xs text-muted-foreground">
                      #{d.id}
                    </td>
                    <td className="py-2.5 font-medium">{d.customer}</td>
                    <td className="py-2.5">
                      <span className="flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-warning" />
                        {Math.round(m.lateBy)} min late
                        <span className="text-xs text-muted-foreground">
                          ·{" "}
                          {m.prep > m.ride
                            ? "slow kitchen"
                            : m.handoff > 8
                              ? "slow handoff"
                              : "long ride"}
                        </span>
                      </span>
                    </td>
                    <td className="py-2.5 text-right tabular-nums">
                      {Math.round(m.total)}m
                    </td>
                    <td className="py-2.5 text-right">
                      <ChevronRightIcon className="ml-auto size-4 text-muted-foreground" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <p className="text-center text-xs text-muted-foreground">
        Glovo deliveries only.
      </p>
    </div>
  )
}

function Section({
  id,
  title,
  hint,
  children,
}: {
  id: string
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="scroll-mt-32 rounded-2xl border bg-card p-5 shadow-xs"
    >
      <h3 className="mb-4 flex flex-wrap items-baseline gap-2">
        <span className="font-semibold">{title}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </h3>
      {children}
    </motion.section>
  )
}

function Tile({
  icon: Icon,
  label,
  value,
  suffix,
  good,
  sub,
  note,
}: {
  icon: LucideIcon
  label: string
  value: number
  suffix: string
  good: boolean
  sub: string
  note: string
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border p-4">
      <span className="flex items-center gap-1.5 text-xs font-medium tracking-wider text-muted-foreground uppercase">
        <Icon className="size-3.5" />
        {label}
      </span>
      <AnimatedNumber
        value={value}
        format={(n) => `${Math.round(n)}${suffix}`}
        className={cn(
          "text-3xl font-semibold tracking-tight tabular-nums",
          good ? "text-success" : "text-destructive"
        )}
      />
      <span className="text-xs text-muted-foreground">{sub}</span>
      <span
        className={cn(
          "mt-2 rounded-md px-2 py-1 text-xs",
          good
            ? "bg-success/10 text-success"
            : "bg-destructive/10 text-destructive"
        )}
      >
        {good ? "✓ " : "▲ "}
        {note}
      </span>
    </div>
  )
}

function Mini({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-muted/50 p-3">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span className="text-xl font-semibold tabular-nums">{value}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  )
}
