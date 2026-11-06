"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  BikeIcon,
  ChefHatIcon,
  ChevronRightIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  RefreshCwIcon,
  StoreIcon,
  TruckIcon,
  UserRoundXIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { StatusPill } from "@/components/delivery/delivery-sheet"
import { SearchField } from "@/components/data/table-kit"
import { Segmented } from "@/components/segmented"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  MOCK_DELIVERIES,
  deliveryMetrics,
  type Delivery,
  type LiveDelivery,
  type LiveStage,
} from "@/lib/mock/deliveries"
import {
  MOCK_NOW,
  formatPhone,
  formatTime,
  inRange,
} from "@/lib/mock/transactions"
import { formatDay } from "@/lib/format"
import { cn } from "@/lib/utils"

const STAGES: { id: LiveStage; label: string; icon: React.ElementType }[] = [
  { id: "preparing", label: "Preparing", icon: ChefHatIcon },
  { id: "rider_assigned", label: "Rider assigned", icon: BikeIcon },
  { id: "at_restaurant", label: "Rider at counter", icon: StoreIcon },
  { id: "on_the_way", label: "On the way", icon: TruckIcon },
]

type Range = "today" | "7d" | "30d"

export function DeliveriesTab({
  live,
  setLive,
  onOpen,
}: {
  live: LiveDelivery[]
  setLive: React.Dispatch<React.SetStateAction<LiveDelivery[]>>
  onOpen: (d: Delivery) => void
}) {
  const [range, setRange] = React.useState<Range>("30d")
  const [query, setQuery] = React.useState("")
  const [cancelling, setCancelling] = React.useState<LiveDelivery | null>(null)

  const q = query.trim().toLowerCase().replace(/\s/g, "")
  const history = MOCK_DELIVERIES.filter(
    (d) =>
      inRange(d.placedAt, range) &&
      (!q ||
        [d.customer, d.phone, d.rider, d.id, d.address].some((f) =>
          f.toLowerCase().replace(/\s/g, "").includes(q)
        ))
  )
  const groups = [...new Set(history.map((d) => formatDay(d.placedAt)))].map(
    (day) => ({
      day,
      items: history.filter((d) => formatDay(d.placedAt) === day),
    })
  )

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-sm font-medium">
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-60" />
            <span className="relative size-2 rounded-full bg-success" />
          </span>
          Live now
        </h2>
        <AnimatePresence mode="popLayout" initial={false}>
          {live.length === 0 ? (
            <motion.p
              key="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-dashed py-10 text-center text-sm text-muted-foreground"
            >
              No active deliveries right now.
            </motion.p>
          ) : (
            live.map((d, i) => (
              <LiveCard
                key={d.id}
                d={d}
                index={i}
                onCancel={() => setCancelling(d)}
                onReassign={() => {
                  setLive((l) =>
                    l.map((x) =>
                      x.id === d.id
                        ? { ...x, rider: null, stage: "preparing" }
                        : x
                    )
                  )
                  toast(`Asked Glovo for a new rider for ${d.customer}`, {
                    description: `${d.rider ?? "The rider"} was released.`,
                  })
                }}
              />
            ))
          )}
        </AnimatePresence>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3 border-b pb-3">
          <h2 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            History
          </h2>
          <Segmented<Range>
            size="sm"
            ariaLabel="Range"
            value={range}
            onChange={setRange}
            options={[
              { value: "today", label: "Today" },
              { value: "7d", label: "Last 7 days" },
              { value: "30d", label: "Last 30 days" },
            ]}
          />
          <span className="ml-auto text-xs text-muted-foreground tabular-nums">
            {history.length} deliveries
          </span>
        </div>
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Find a customer, rider, phone or order ID…"
        />
        {groups.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No deliveries in this range.
          </p>
        ) : (
          groups.map((g, gi) => (
            <motion.div
              key={g.day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(gi * 0.04, 0.4) }}
              className="flex flex-col gap-2"
            >
              <div className="sticky top-14 z-10 flex items-center gap-3 bg-background/85 py-2 backdrop-blur-md">
                <h3 className="font-semibold">{g.day}</h3>
                <span className="h-px flex-1 bg-border" />
              </div>
              {g.items.map((d) => (
                <HistoryCard key={d.id} d={d} onOpen={() => onOpen(d)} />
              ))}
            </motion.div>
          ))
        )}
      </section>

      <Dialog
        open={!!cancelling}
        onOpenChange={(o) => !o && setCancelling(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Cancel {cancelling?.customer}&apos;s delivery?
            </DialogTitle>
            <DialogDescription>
              Glovo stops the rider and the customer is notified. Food already
              made counts as wastage.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelling(null)}>
              Keep it
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const c = cancelling!
                setLive((l) => l.filter((x) => x.id !== c.id))
                setCancelling(null)
                toast(`Delivery #${c.id} cancelled`)
              }}
            >
              Cancel delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function LiveCard({
  d,
  index,
  onCancel,
  onReassign,
}: {
  d: LiveDelivery
  index: number
  onCancel: () => void
  onReassign: () => void
}) {
  const stageIdx = STAGES.findIndex((s) => s.id === d.stage)
  const [syncing, setSyncing] = React.useState(false)
  const etaMin = Math.round((d.etaAt - MOCK_NOW) / 60_000)

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { delay: index * 0.06 },
      }}
      exit={{ opacity: 0, x: 60, transition: { duration: 0.25 } }}
      className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-xs"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{d.customer}</span>
            <span className="font-mono text-xs text-muted-foreground">
              #{d.id}
            </span>
          </div>
          <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <PhoneIcon className="size-3" />
              {formatPhone(d.phone)}
            </span>
            <span className="flex items-center gap-1">
              <MapPinIcon className="size-3" />
              {d.address}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{d.items}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold tabular-nums">
            {etaMin} min
          </div>
          <div className="text-xs text-muted-foreground">
            ETA {formatTime(d.etaAt)}
          </div>
        </div>
      </div>

      {/* Stage stepper */}
      <div className="relative grid grid-cols-4 gap-2">
        <div className="absolute top-3.5 right-[12.5%] left-[12.5%] h-0.5 rounded bg-muted" />
        <motion.div
          className="absolute top-3.5 left-[12.5%] h-0.5 origin-left rounded bg-success"
          initial={{ width: 0 }}
          animate={{ width: `${(stageIdx / (STAGES.length - 1)) * 75}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
        {STAGES.map((s, i) => {
          const done = i <= stageIdx
          const current = i === stageIdx
          return (
            <div
              key={s.id}
              className="relative flex flex-col items-center gap-1.5 text-center"
            >
              <motion.span
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.15 + i * 0.08,
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                }}
                className={cn(
                  "relative flex size-7 items-center justify-center rounded-full border-2 bg-card",
                  done ? "border-success text-success" : "text-muted-foreground"
                )}
              >
                {current && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-success/30" />
                )}
                <s.icon className="size-3.5" />
              </motion.span>
              <span
                className={cn(
                  "text-[11px] leading-tight",
                  current ? "font-medium" : "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t pt-3">
        <span className="mr-auto flex items-center gap-1.5 text-sm text-muted-foreground">
          <BikeIcon className="size-4" />
          {d.rider ?? "Waiting for Glovo to assign a rider"}
        </span>
        <Button
          size="sm"
          variant="ghost"
          disabled={syncing}
          onClick={() => {
            setSyncing(true)
            setTimeout(() => {
              setSyncing(false)
              toast.success(`#${d.id} matches Glovo`)
            }, 900)
          }}
        >
          <RefreshCwIcon className={cn(syncing && "animate-spin")} />
          Re-sync
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onReassign}
          disabled={!d.rider}
        >
          <UserRoundXIcon />
          Reassign rider
        </Button>
        <Button size="sm" variant="destructive" onClick={onCancel}>
          <XIcon />
          Cancel
        </Button>
      </div>
    </motion.article>
  )
}

function HistoryCard({ d, onOpen }: { d: Delivery; onOpen: () => void }) {
  const m = deliveryMetrics(d)
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileHover={{ y: -2 }}
      className="flex w-full items-start gap-3 rounded-2xl border bg-card p-4 text-left shadow-xs transition-shadow outline-none hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl",
          d.status === "delivered"
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-red-500/10 text-red-600 dark:text-red-400"
        )}
      >
        <TruckIcon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{d.customer}</span>
          <span className="font-mono text-xs text-muted-foreground">
            #{d.id}
          </span>
          <StatusPill d={d} />
        </div>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <PhoneIcon className="size-3" />
            {formatPhone(d.phone)}
          </span>
          <span className="flex items-center gap-1">
            <MapPinIcon className="size-3" />
            {d.address}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground tabular-nums">
          <span>Placed {formatTime(d.placedAt)}</span>
          {d.status === "delivered" && (
            <span>Delivered {formatTime(d.deliveredAt)}</span>
          )}
          <span className="flex items-center gap-1">
            <ClockIcon className="size-3" />
            {Math.round(m.total)} min total
          </span>
          <span>Rider: {d.rider}</span>
        </div>
      </div>
      <ChevronRightIcon className="mt-1 size-4 shrink-0 text-muted-foreground" />
    </motion.button>
  )
}
