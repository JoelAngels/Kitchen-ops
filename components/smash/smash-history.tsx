"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  ChefHatIcon,
  ChevronDownIcon,
  ClockIcon,
  FlameIcon,
  HamburgerIcon,
  TimerOffIcon,
} from "lucide-react"

import {
  DateRangeMenu,
  NoResults,
  Pill,
  SearchField,
} from "@/components/data/table-kit"
import { AnimatedNumber } from "@/components/motion/animated-number"
import { PageHeader } from "@/components/page-header"
import { Segmented } from "@/components/segmented"
import {
  SMASH_TARGET_MIN,
  SMASH_TICKETS,
  speedTone,
  type SmashTicket,
} from "@/lib/mock/smash"
import { formatTime, inRange, type DateRange } from "@/lib/mock/transactions"
import { formatDay } from "@/lib/format"
import { cn } from "@/lib/utils"

type Speed = "all" | "fast" | "slow" | "auto"

const TONE_TEXT = {
  green: "text-emerald-600 dark:text-emerald-400",
  amber: "text-amber-600 dark:text-amber-400",
  red: "text-red-600 dark:text-red-400",
  slate: "text-muted-foreground",
} as const

export function SmashHistory() {
  const [query, setQuery] = React.useState("")
  const [range, setRange] = React.useState<DateRange>("all")
  const [speed, setSpeed] = React.useState<Speed>("all")
  const [open, setOpen] = React.useState<string | null>(null)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return SMASH_TICKETS.filter((t) => {
      if (!inRange(t.createdAt, range)) return false
      if (
        speed === "fast" &&
        !(t.minutes !== null && t.minutes <= SMASH_TARGET_MIN)
      )
        return false
      if (
        speed === "slow" &&
        !(t.minutes !== null && t.minutes > SMASH_TARGET_MIN)
      )
        return false
      if (speed === "auto" && !t.autoClosed) return false
      if (!q) return true
      return [
        t.customer,
        `#${t.orderNumber}`,
        t.cook,
        ...t.items.map((i) => i.name),
      ].some((f) => f.toLowerCase().includes(q))
    })
  }, [query, range, speed])

  // Auto-closed tickets have meaningless durations, so they're excluded from timing stats.
  const timed = filtered.filter((t) => t.minutes !== null)
  const avg = timed.length
    ? timed.reduce((s, t) => s + t.minutes!, 0) / timed.length
    : 0
  const onTarget = timed.length
    ? (timed.filter((t) => t.minutes! <= SMASH_TARGET_MIN).length /
        timed.length) *
      100
    : 0
  const slowest = timed.reduce((m, t) => Math.max(m, t.minutes!), 0)

  const groups = React.useMemo(() => {
    const map = new Map<string, SmashTicket[]>()
    for (const t of filtered) {
      const key = formatDay(t.createdAt)
      map.set(key, [...(map.get(key) ?? []), t])
    }
    return [...map.entries()]
  }, [filtered])

  const reset = () => {
    setQuery("")
    setRange("all")
    setSpeed("all")
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4 lg:p-8">
      <PageHeader
        icon={HamburgerIcon}
        title="Smash Ticket History"
        description="Completed smash station tickets and how long each took"
        back={{ href: "/admin", label: "Back to Admin" }}
        actions={<DateRangeMenu value={range} onChange={setRange} />}
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search customer, order #, item or cook…"
        />
      </motion.div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          show: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } },
        }}
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        <Stat
          label="Tickets"
          value={<AnimatedNumber value={filtered.length} duration={0.7} />}
        />
        <Stat
          label="Avg cook time"
          value={
            <>
              <AnimatedNumber
                value={avg}
                format={(n) => n.toFixed(1)}
                duration={0.7}
              />
              <small> min</small>
            </>
          }
        />
        <Stat
          label={`On target (≤${SMASH_TARGET_MIN} min)`}
          value={
            <>
              <AnimatedNumber
                value={onTarget}
                format={(n) => Math.round(n).toString()}
                duration={0.7}
              />
              <small>%</small>
            </>
          }
          bar={onTarget}
        />
        <Stat
          label="Slowest"
          value={
            <>
              <AnimatedNumber value={slowest} duration={0.7} />
              <small> min</small>
            </>
          }
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
        className="max-w-full overflow-x-auto"
      >
        <Segmented<Speed>
          ariaLabel="Speed"
          value={speed}
          onChange={setSpeed}
          options={[
            { value: "all", label: "All tickets" },
            { value: "fast", label: "On target" },
            { value: "slow", label: "Slow" },
            { value: "auto", label: "Never bumped" },
          ]}
        />
      </motion.div>

      {groups.length === 0 ? (
        <div className="rounded-2xl border bg-card">
          <NoResults onReset={reset} />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="popLayout" initial={false}>
            {groups.map(([day, tickets], gi) => {
              const dayTimed = tickets.filter((t) => t.minutes !== null)
              const dayAvg = dayTimed.length
                ? dayTimed.reduce((s, t) => s + t.minutes!, 0) / dayTimed.length
                : null
              return (
                <motion.section
                  key={day}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { delay: Math.min(0.25 + gi * 0.05, 0.6) },
                  }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  className="flex flex-col gap-2"
                >
                  <div className="sticky top-14 z-10 -mx-1 flex items-center gap-3 bg-background/85 px-1 py-2 backdrop-blur-md">
                    <h2 className="font-semibold">{day}</h2>
                    <span className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {tickets.length}{" "}
                      {tickets.length === 1 ? "ticket" : "tickets"}
                      {dayAvg !== null && ` · ${dayAvg.toFixed(0)} min avg`}
                    </span>
                  </div>
                  {tickets.map((t, i) => (
                    <TicketCard
                      key={t.id}
                      ticket={t}
                      delay={Math.min(0.28 + gi * 0.05 + i * 0.03, 0.7)}
                      open={open === t.id}
                      onToggle={() =>
                        setOpen((o) => (o === t.id ? null : t.id))
                      }
                    />
                  ))}
                </motion.section>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  bar,
}: {
  label: string
  value: React.ReactNode
  bar?: number
}) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
      className="flex flex-col gap-1 rounded-2xl border bg-card p-4 shadow-xs"
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-2xl font-semibold tracking-tight tabular-nums [&_small]:text-sm [&_small]:font-normal [&_small]:text-muted-foreground">
        {value}
      </span>
      {bar !== undefined && (
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-success"
            initial={{ width: 0 }}
            animate={{ width: `${bar}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      )}
    </motion.div>
  )
}

function TicketCard({
  ticket: t,
  delay,
  open,
  onToggle,
}: {
  ticket: SmashTicket
  delay: number
  open: boolean
  onToggle: () => void
}) {
  const tone = speedTone(t.minutes)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { delay } }}
      className={cn(
        "overflow-hidden rounded-2xl border bg-card shadow-xs transition-shadow hover:shadow-md",
        open && "shadow-md ring-1 ring-foreground/10"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start gap-3 p-4 text-left outline-none focus-visible:bg-muted/50"
      >
        <span
          className={cn(
            "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl",
            t.autoClosed
              ? "bg-muted text-muted-foreground"
              : "bg-red-500/10 text-red-600 dark:text-red-400"
          )}
        >
          {t.autoClosed ? (
            <TimerOffIcon className="size-4" />
          ) : (
            <FlameIcon className="size-4" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold tracking-wide uppercase">
              {t.customer}
            </span>
            <span className="text-xs text-muted-foreground">· {t.channel}</span>
            <span className="font-mono text-xs text-muted-foreground">
              #{t.orderNumber}
            </span>
          </div>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {t.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
            <ClockIcon className="size-3" />
            {formatTime(t.createdAt)} → {formatTime(t.completedAt)}
            <span className="mx-1">·</span>
            <ChefHatIcon className="size-3" />
            {t.cook}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {t.autoClosed ? (
            <Pill tone="slate" icon={TimerOffIcon}>
              Never bumped
            </Pill>
          ) : (
            <Pill tone={tone}>{t.minutes} min</Pill>
          )}
          <ChevronDownIcon
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-300",
              open && "rotate-180"
            )}
          />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <TicketTimeline ticket={t} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function TicketTimeline({ ticket: t }: { ticket: SmashTicket }) {
  const total = t.stages[t.stages.length - 1].offsetSec || 1
  const segments = t.stages.slice(0, -1).map((s, i) => ({
    label: s.label,
    from: s.offsetSec,
    sec: t.stages[i + 1].offsetSec - s.offsetSec,
  }))
  const fmt = (sec: number) =>
    sec >= 60 ? `${Math.floor(sec / 60)}m ${sec % 60}s` : `${sec}s`

  return (
    <div className="flex flex-col gap-4 border-t bg-muted/30 p-4">
      {t.autoClosed ? (
        <p className="text-sm text-muted-foreground">
          Nobody bumped this ticket on the kitchen screen, so the day-end job
          closed it. Its time is left out of the averages above.
        </p>
      ) : (
        <>
          {/* Stage bar: one hue, darker = later stage; every segment is also labelled below. */}
          <div
            className="flex h-3 gap-0.5 overflow-hidden rounded-full"
            role="img"
            aria-label="Cooking stages"
          >
            {segments.map((s, i) => (
              <motion.div
                key={s.label}
                title={`${s.label}: ${fmt(s.sec)}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  delay: 0.1 + i * 0.08,
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  width: `${(s.sec / total) * 100}%`,
                  opacity: 0.35 + (i / segments.length) * 0.65,
                }}
                className="h-full origin-left bg-chart-1"
              />
            ))}
          </div>
          <ol className="grid gap-x-6 gap-y-2 text-sm sm:grid-flow-col sm:grid-rows-3">
            {segments.map((s, i) => (
              <motion.li
                key={s.label}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
                className="flex items-center gap-2"
              >
                <span
                  className="size-2.5 shrink-0 rounded-sm bg-chart-1"
                  style={{ opacity: 0.35 + (i / segments.length) * 0.65 }}
                />
                <span className="flex-1">{s.label}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatTime(t.createdAt + s.from * 1000)} · {fmt(s.sec)}
                </span>
              </motion.li>
            ))}
          </ol>
          <p
            className={cn(
              "text-sm font-medium",
              TONE_TEXT[speedTone(t.minutes)]
            )}
          >
            {t.minutes! <= SMASH_TARGET_MIN
              ? `Done in ${t.minutes} min, inside the ${SMASH_TARGET_MIN}-min target`
              : `${t.minutes! - SMASH_TARGET_MIN} min over the ${SMASH_TARGET_MIN}-min target`}
          </p>
        </>
      )}
    </div>
  )
}
