"use client"

import { motion } from "motion/react"
import {
  HourglassIcon,
  TimerIcon,
  TriangleAlertIcon,
  TruckIcon,
  type LucideIcon,
} from "lucide-react"

import { AnimatedNumber } from "@/components/motion/animated-number"
import {
  MOCK_DELIVERIES,
  deliveryMetrics,
  mean,
  median,
  type Delivery,
} from "@/lib/mock/deliveries"
import { formatTime } from "@/lib/mock/transactions"
import { cn } from "@/lib/utils"

export function HandoffTab({ onOpen }: { onOpen: (d: Delivery) => void }) {
  const done = MOCK_DELIVERIES.filter((d) => d.status === "delivered")
  const ms = done.map((d) => ({ d, m: deliveryMetrics(d) }))
  const lead = ms.map((x) => x.m.riderLead)
  const handoff = ms.map((x) => x.m.handoff)
  const idle = ms.map((x) => x.m.riderIdle)
  const lateRider =
    ms.filter((x) => x.m.riderLead < 0).length / Math.max(1, ms.length)
  const longIdle =
    ms.filter((x) => x.m.riderIdle > 8).length / Math.max(1, ms.length)

  const slowestHandoffs = [...ms]
    .sort((a, b) => b.m.handoff - a.m.handoff)
    .slice(0, 8)
  const longestWaits = [...ms]
    .sort((a, b) => b.m.riderIdle - a.m.riderIdle)
    .slice(0, 8)

  return (
    <div className="flex flex-col gap-4">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border bg-card p-4 text-sm shadow-xs"
      >
        <b>The goal:</b> the rider walks in just as the food is bagged. Present,
        but not idling at the counter. Across <b>{ms.length}</b> delivered
        orders:
      </motion.p>

      <div className="grid gap-3 md:grid-cols-3">
        <Kpi
          icon={TimerIcon}
          label="Rider lead time"
          value={median(lead)}
          unit="median"
          sub={
            <>
              avg {mean(lead).toFixed(1)} min · how long{" "}
              <span className="text-success">before</span> the food the rider
              arrives
            </>
          }
          note={`${Math.round(lateRider * 100)}% of orders the rider arrived after the food: the customer waited`}
          tone="neutral"
          index={0}
        />
        <Kpi
          icon={HourglassIcon}
          label="Handoff friction"
          value={median(handoff)}
          unit="median"
          sub={
            <>
              avg {mean(handoff).toFixed(1)} min · food sat ready before the
              rider left
            </>
          }
          note="This is the part you control: bagging, sealing, confirming pickup in Glovo"
          tone="warn"
          index={1}
        />
        <Kpi
          icon={TruckIcon}
          label="Rider idle"
          value={mean(idle)}
          unit="avg wait"
          sub="time the rider waited at the counter before the food was ready"
          note={`${Math.round(longIdle * 100)}% waited over 8 min: riders dispatched too early, or the kitchen ran slow`}
          tone={longIdle > 0.3 ? "bad" : "warn"}
          index={2}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Ranked
          icon={HourglassIcon}
          title="Slowest handoffs"
          hint="food sat longest after ready"
          rows={slowestHandoffs.map((x) => ({ d: x.d, value: x.m.handoff }))}
          barClass="bg-amber-500"
          textClass="text-amber-700 dark:text-amber-400"
          onOpen={onOpen}
        />
        <Ranked
          icon={TruckIcon}
          title="Longest rider waits"
          hint="rider idle longest before the food"
          rows={longestWaits.map((x) => ({ d: x.d, value: x.m.riderIdle }))}
          barClass="bg-red-500"
          textClass="text-red-700 dark:text-red-400"
          onOpen={onOpen}
        />
      </div>
    </div>
  )
}

function Kpi({
  icon: Icon,
  label,
  value,
  unit,
  sub,
  note,
  tone,
  index,
}: {
  icon: LucideIcon
  label: string
  value: number
  unit: string
  sub: React.ReactNode
  note: string
  tone: "neutral" | "warn" | "bad"
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + index * 0.07 }}
      className="flex flex-col gap-2 rounded-2xl border bg-card p-5 shadow-xs"
    >
      <span className="flex items-center gap-1.5 text-xs font-medium tracking-wider text-muted-foreground uppercase">
        <Icon className="size-3.5" />
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <AnimatedNumber
          value={value}
          format={(n) => `${n.toFixed(1)} min`}
          className="text-3xl font-semibold tracking-tight tabular-nums"
        />
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
      <p className="text-sm text-muted-foreground">{sub}</p>
      <p
        className={cn(
          "mt-auto flex items-start gap-1.5 rounded-lg p-2.5 text-xs",
          tone === "neutral" && "bg-muted text-muted-foreground",
          tone === "warn" &&
            "bg-amber-500/10 text-amber-800 dark:text-amber-300",
          tone === "bad" && "bg-red-500/10 text-red-700 dark:text-red-300"
        )}
      >
        {tone === "bad" && (
          <TriangleAlertIcon className="mt-px size-3.5 shrink-0" />
        )}
        {note}
      </p>
    </motion.div>
  )
}

function Ranked({
  icon: Icon,
  title,
  hint,
  rows,
  barClass,
  textClass,
  onOpen,
}: {
  icon: LucideIcon
  title: string
  hint: string
  rows: { d: Delivery; value: number }[]
  barClass: string
  textClass: string
  onOpen: (d: Delivery) => void
}) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl border bg-card p-5 shadow-xs"
    >
      <h3 className="mb-3 flex flex-wrap items-center gap-1.5 text-xs font-medium tracking-wider text-muted-foreground uppercase">
        <Icon className="size-3.5" />
        {title}
        <span className="font-normal tracking-normal normal-case">
          · {hint}
        </span>
      </h3>
      <ol className="flex flex-col">
        {rows.map(({ d, value }, i) => (
          <li key={d.id}>
            <button
              type="button"
              onClick={() => onOpen(d)}
              className="group grid w-full grid-cols-[60px_1fr_auto] items-center gap-x-3 gap-y-1 rounded-lg px-1 py-2 text-left text-sm hover:bg-muted/50"
            >
              <span className="font-mono text-xs text-muted-foreground">
                #{d.id}
              </span>
              <span className="truncate">{d.rider}</span>
              <span className="flex items-baseline gap-2">
                <span className={cn("font-semibold tabular-nums", textClass)}>
                  {value.toFixed(1)} min
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatTime(d.placedAt)}
                </span>
              </span>
              <span />
              <span className="col-span-2 h-1 overflow-hidden rounded-full bg-muted">
                <motion.span
                  className={cn("block h-full rounded-full", barClass)}
                  initial={{ width: 0 }}
                  animate={{ width: `${(value / max) * 100}%` }}
                  transition={{
                    delay: 0.35 + i * 0.05,
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              </span>
            </button>
          </li>
        ))}
      </ol>
    </motion.div>
  )
}
