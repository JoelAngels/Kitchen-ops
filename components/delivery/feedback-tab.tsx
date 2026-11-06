"use client"

import { motion } from "motion/react"
import { ClockIcon, PhoneIcon, StarIcon } from "lucide-react"

import { Stars } from "@/components/delivery/delivery-sheet"
import { AnimatedNumber } from "@/components/motion/animated-number"
import { MOCK_DELIVERIES, type Delivery } from "@/lib/mock/deliveries"
import { MOCK_NOW, formatDateTime, formatPhone } from "@/lib/mock/transactions"

export function FeedbackTab({ onOpen }: { onOpen: (d: Delivery) => void }) {
  const rated = MOCK_DELIVERIES.filter((d) => d.rating !== null)
  const avg = rated.length
    ? rated.reduce((s, d) => s + d.rating!, 0) / rated.length
    : 0
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    n: rated.filter((d) => d.rating === star).length,
  }))
  const max = Math.max(1, ...counts.map((c) => c.n))

  if (!rated.length) {
    return (
      <p className="rounded-2xl border border-dashed py-16 text-center text-sm text-muted-foreground">
        No ratings yet.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col justify-center gap-2 rounded-2xl border bg-card p-6 shadow-xs"
        >
          <div className="flex items-baseline gap-1">
            <AnimatedNumber
              value={avg}
              format={(n) => n.toFixed(1)}
              className="text-5xl font-semibold tracking-tight tabular-nums"
            />
            <span className="text-muted-foreground">/ 5</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.span
                key={i}
                initial={{ scale: 0, rotate: -40 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.2 + i * 0.07,
                  type: "spring",
                  stiffness: 400,
                  damping: 14,
                }}
              >
                <StarIcon
                  className={
                    i <= Math.round(avg)
                      ? "size-6 fill-amber-400 text-amber-400"
                      : "size-6 text-muted-foreground/30"
                  }
                />
              </motion.span>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {rated.length} ratings from{" "}
            {MOCK_DELIVERIES.filter((d) => d.status === "delivered").length}{" "}
            deliveries
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="flex flex-col gap-2.5 rounded-2xl border bg-card p-6 shadow-xs"
        >
          <h3 className="mb-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Rating breakdown
          </h3>
          {counts.map((c, i) => (
            <div key={c.star} className="flex items-center gap-3 text-sm">
              <span className="flex w-8 items-center gap-1 tabular-nums">
                {c.star}
                <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-amber-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${(c.n / max) * 100}%` }}
                  transition={{
                    delay: 0.2 + i * 0.06,
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              </div>
              <span className="w-6 text-right text-muted-foreground tabular-nums">
                {c.n}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          Recent feedback
        </h3>
        {rated.map((d, i) => (
          <motion.button
            key={d.id}
            type="button"
            onClick={() => onOpen(d)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.04 }}
            whileHover={{ y: -2 }}
            className="flex flex-col gap-2 rounded-2xl border bg-card p-4 text-left shadow-xs transition-shadow hover:shadow-md"
          >
            <div className="flex flex-wrap items-center gap-3">
              <Stars value={d.rating!} />
              <span className="font-medium">{d.customer}</span>
              <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                <ClockIcon className="size-3" />
                {Math.max(
                  1,
                  Math.round((MOCK_NOW - d.deliveredAt) / 86_400_000)
                )}
                d ago
              </span>
            </div>
            {d.comment && <p className="text-sm">“{d.comment}”</p>}
            <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground tabular-nums">
              <span>{formatDateTime(d.deliveredAt)}</span>
              <span className="flex items-center gap-1">
                <PhoneIcon className="size-3" />
                {formatPhone(d.phone)}
              </span>
              <span>Rider: {d.rider}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
