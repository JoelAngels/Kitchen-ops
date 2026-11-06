"use client"

import * as React from "react"
import { motion } from "motion/react"
import { BikeIcon, MapPinIcon, PhoneIcon, StarIcon } from "lucide-react"

import { Pill } from "@/components/data/table-kit"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { deliveryMetrics, type Delivery } from "@/lib/mock/deliveries"
import {
  formatDateTime,
  formatPhone,
  formatTime,
} from "@/lib/mock/transactions"
import { formatKES } from "@/lib/tamu-data"
import { cn } from "@/lib/utils"

export function StatusPill({ d }: { d: Delivery }) {
  if (d.status === "cancelled") return <Pill tone="amber">Cancelled</Pill>
  if (d.status === "failed") return <Pill tone="red">Failed</Pill>
  const late = deliveryMetrics(d).lateBy
  return late > 0 ? (
    <Pill tone="amber">Delivered · {Math.round(late)}m late</Pill>
  ) : (
    <Pill tone="green">Delivered on time</Pill>
  )
}

export function Stars({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  return (
    <span
      className={cn("inline-flex gap-0.5", className)}
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon
          key={i}
          className={cn(
            "size-4",
            i <= Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/30"
          )}
        />
      ))}
    </span>
  )
}

export function DeliverySheet({
  delivery,
  onClose,
}: {
  delivery: Delivery | null
  onClose: () => void
}) {
  const [shown, setShown] = React.useState(delivery)
  if (delivery && delivery !== shown) setShown(delivery)
  const d = delivery ?? shown
  const m = d ? deliveryMetrics(d) : null

  const events = d
    ? [
        { at: d.placedAt, label: "Order placed", note: null },
        {
          at: d.riderArrivedAt,
          label: `${d.rider} arrived at the counter`,
          note:
            m!.riderIdle > 0
              ? `waited ${Math.round(m!.riderIdle)} min for the food`
              : null,
        },
        {
          at: d.readyAt,
          label: "Food ready",
          note: `${Math.round(m!.prep)} min in the kitchen`,
        },
        {
          at: d.pickedUpAt,
          label: "Picked up",
          note: `sat ${Math.round(m!.handoff)} min after ready`,
        },
        {
          at: d.deliveredAt,
          label: d.status === "delivered" ? "Delivered" : "Closed",
          note: `${Math.round(m!.ride)} min ride`,
        },
      ].sort((a, b) => a.at - b.at)
    : []

  return (
    <Sheet open={!!delivery} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {d && m && (
          <>
            <SheetHeader className="border-b">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-muted-foreground">
                  #{d.id}
                </span>
                <StatusPill d={d} />
              </div>
              <SheetTitle className="text-xl">{d.customer}</SheetTitle>
              <SheetDescription>
                {formatDateTime(d.placedAt)} · {Math.round(m.total)} min end to
                end
              </SheetDescription>
            </SheetHeader>
            <motion.div
              key={d.id}
              initial="hidden"
              animate="show"
              variants={{
                show: {
                  transition: { staggerChildren: 0.05, delayChildren: 0.05 },
                },
              }}
              className="flex flex-col gap-5 p-4 text-sm"
            >
              <motion.dl variants={item} className="grid gap-2">
                <Row icon={PhoneIcon}>{formatPhone(d.phone)}</Row>
                <Row icon={MapPinIcon}>
                  {d.address} · {d.distanceKm} km
                </Row>
                <Row icon={BikeIcon}>
                  {d.rider}
                  {d.reassigned ? " (second rider, first one swapped)" : ""}
                </Row>
              </motion.dl>
              <motion.div variants={item} className="rounded-xl border p-3">
                <div className="text-muted-foreground">{d.items}</div>
                <div className="mt-2 flex justify-between border-t pt-2">
                  <span>Basket · delivery fee</span>
                  <span className="font-medium tabular-nums">
                    {formatKES(d.basket)} · {formatKES(d.fee)}
                  </span>
                </div>
              </motion.div>
              <motion.div variants={item}>
                <h3 className="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  Timeline
                </h3>
                <ol className="relative ml-1.5 flex flex-col gap-4 border-l pl-5">
                  {events.map((e, i) => (
                    <motion.li
                      key={e.label}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.07 }}
                      className="relative"
                    >
                      <span
                        className={cn(
                          "absolute top-1 -left-[26px] size-2.5 rounded-full ring-4 ring-background",
                          i === events.length - 1
                            ? m.lateBy > 0
                              ? "bg-warning"
                              : "bg-success"
                            : "bg-muted-foreground/40"
                        )}
                      />
                      <div className="font-medium">{e.label}</div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        {formatTime(e.at)}
                        {e.note && ` · ${e.note}`}
                      </div>
                    </motion.li>
                  ))}
                </ol>
                <p
                  className={cn(
                    "mt-3 text-xs",
                    m.lateBy > 0
                      ? "text-amber-700 dark:text-amber-300"
                      : "text-success"
                  )}
                >
                  Promised by {formatTime(d.promisedAt)} ·{" "}
                  {m.lateBy > 0
                    ? `${Math.round(m.lateBy)} min late`
                    : `${Math.round(-m.lateBy)} min early`}
                </p>
              </motion.div>
              {d.rating && (
                <motion.div variants={item} className="rounded-xl border p-3">
                  <Stars value={d.rating} />
                  {d.comment && (
                    <p className="mt-1 text-muted-foreground">“{d.comment}”</p>
                  )}
                </motion.div>
              )}
              {d.failReason && (
                <motion.p
                  variants={item}
                  className="rounded-xl bg-destructive/10 p-3 text-destructive"
                >
                  {d.failReason}
                </motion.p>
              )}
            </motion.div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }

function Row({
  icon: Icon,
  children,
}: {
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <span>{children}</span>
    </div>
  )
}
