"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Segmented } from "@/components/segmented"
import { Button } from "@/components/ui/button"
import {
  addDays,
  fromDateInput,
  startOfDay,
  toDateInput,
} from "@/lib/mock/adjustments"
import { MOCK_NOW, formatDate } from "@/lib/mock/transactions"

export type PeriodPreset =
  "today" | "yesterday" | "7d" | "30d" | "day" | "custom"
export type Period = { preset: PeriodPreset; from: number; to: number }

const TODAY = startOfDay(MOCK_NOW)

export function periodFor(
  preset: PeriodPreset,
  day = TODAY,
  customFrom = addDays(TODAY, -6),
  customTo = TODAY
): Period {
  switch (preset) {
    case "today":
      return { preset, from: TODAY, to: addDays(TODAY, 1) }
    case "yesterday":
      return { preset, from: addDays(TODAY, -1), to: TODAY }
    case "7d":
      return { preset, from: addDays(TODAY, -6), to: addDays(TODAY, 1) }
    case "30d":
      return { preset, from: addDays(TODAY, -29), to: addDays(TODAY, 1) }
    case "day":
      return { preset, from: day, to: addDays(day, 1) }
    case "custom":
      return {
        preset,
        from: Math.min(customFrom, customTo),
        to: addDays(Math.max(customFrom, customTo), 1),
      }
  }
}

export function describePeriod(p: Period) {
  const last = addDays(p.to, -1)
  return p.from === last
    ? formatDate(p.from)
    : `${formatDate(p.from)} – ${formatDate(last)}`
}

/** Preset chips, plus a day stepper or a from/to range when those presets are picked. */
export function PeriodPicker({
  value,
  onChange,
}: {
  value: Period
  onChange: (p: Period) => void
}) {
  const [day, setDay] = React.useState(TODAY)
  const [from, setFrom] = React.useState(addDays(TODAY, -6))
  const [to, setTo] = React.useState(TODAY)

  const setPreset = (preset: PeriodPreset) =>
    onChange(periodFor(preset, day, from, to))
  const stepDay = (n: number) => {
    const next = Math.min(addDays(day, n), TODAY)
    setDay(next)
    onChange(periodFor("day", next))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="max-w-full overflow-x-auto">
        <Segmented<PeriodPreset>
          ariaLabel="Period"
          value={value.preset}
          onChange={setPreset}
          options={[
            { value: "today", label: "Today" },
            { value: "yesterday", label: "Yesterday" },
            { value: "7d", label: "Last 7 days" },
            { value: "30d", label: "Last 30 days" },
            { value: "day", label: "Pick a day" },
            { value: "custom", label: "Custom range" },
          ]}
        />
      </div>
      <AnimatePresence mode="popLayout" initial={false}>
        {value.preset === "day" && (
          <motion.div
            key="day"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 overflow-hidden"
          >
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous day"
              onClick={() => stepDay(-1)}
            >
              <ChevronLeftIcon />
            </Button>
            <input
              type="date"
              aria-label="Day"
              value={toDateInput(day)}
              max={toDateInput(TODAY)}
              onChange={(e) => {
                if (!e.target.value) return
                const d = fromDateInput(e.target.value)
                setDay(d)
                onChange(periodFor("day", d))
              }}
              className="h-8 rounded-lg border bg-background px-2.5 text-sm tabular-nums outline-none focus:ring-2 focus:ring-ring/40 dark:[color-scheme:dark]"
            />
            <Button
              variant="outline"
              size="icon"
              aria-label="Next day"
              disabled={day >= TODAY}
              onClick={() => stepDay(1)}
            >
              <ChevronRightIcon />
            </Button>
          </motion.div>
        )}
        {value.preset === "custom" && (
          <motion.div
            key="custom"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-2 overflow-hidden text-sm"
          >
            <input
              type="date"
              aria-label="From"
              value={toDateInput(from)}
              max={toDateInput(TODAY)}
              onChange={(e) => {
                if (!e.target.value) return
                const f = fromDateInput(e.target.value)
                setFrom(f)
                onChange(periodFor("custom", day, f, to))
              }}
              className="h-8 rounded-lg border bg-background px-2.5 tabular-nums outline-none focus:ring-2 focus:ring-ring/40 dark:[color-scheme:dark]"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              aria-label="To"
              value={toDateInput(to)}
              max={toDateInput(TODAY)}
              onChange={(e) => {
                if (!e.target.value) return
                const t = fromDateInput(e.target.value)
                setTo(t)
                onChange(periodFor("custom", day, from, t))
              }}
              className="h-8 rounded-lg border bg-background px-2.5 tabular-nums outline-none focus:ring-2 focus:ring-ring/40 dark:[color-scheme:dark]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
