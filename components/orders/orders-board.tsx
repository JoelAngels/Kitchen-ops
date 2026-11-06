"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  BikeIcon,
  CheckCheckIcon,
  ChefHatIcon,
  ClipboardListIcon,
  ClockIcon,
  PlusIcon,
  ShoppingBagIcon,
  UtensilsIcon,
} from "lucide-react"
import { toast } from "sonner"

import { useAppState } from "@/components/app-state-provider"
import { Segmented } from "@/components/segmented"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CUSTOMERS,
  MENU_SAMPLE,
  formatKES,
  type Order,
  type OrderStatus,
  type OrderType,
} from "@/lib/tamu-data"
import { uid } from "@/lib/browser"
import { cn } from "@/lib/utils"

type Sort = "recent" | "name" | "number"
type Filter = "all" | OrderStatus

const STATUS_META: Record<
  OrderStatus,
  { label: string; className: string; next?: OrderStatus; action?: string }
> = {
  new: {
    label: "New",
    className: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    next: "preparing",
    action: "Send to kitchen",
  },
  preparing: {
    label: "Preparing",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    next: "ready",
    action: "Mark ready",
  },
  ready: {
    label: "Ready",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    action: "Complete",
  },
}

const TYPE_ICON: Record<OrderType, React.ElementType> = {
  "Dine in": UtensilsIcon,
  Takeaway: ShoppingBagIcon,
  Delivery: BikeIcon,
}

let seq = 1040
function makeOrder(offsetMin = 0): Order {
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
  const count = 1 + Math.floor(Math.random() * 3)
  const items = Array.from({ length: count }, () => ({
    name: pick(MENU_SAMPLE),
    qty: 1 + Math.floor(Math.random() * 2),
  }))
  seq += 1
  return {
    id: uid(),
    number: seq,
    customer: pick(CUSTOMERS),
    type: pick<OrderType>(["Dine in", "Takeaway", "Delivery"]),
    items,
    total: items.reduce(
      (s, i) => s + i.qty * (450 + Math.floor(Math.random() * 6) * 150),
      0
    ),
    status: "new",
    createdAt: Date.now() - offsetMin * 60_000,
  }
}

function useNow() {
  const [now, setNow] = React.useState(0)
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(t)
  }, [])
  return now
}

export function OrdersBoard() {
  const { branch } = useAppState()
  const [orders, setOrders] = React.useState<Order[]>([])
  const [sort, setSort] = React.useState<Sort>("recent")
  const [filter, setFilter] = React.useState<Filter>("all")
  const now = useNow()

  // Seed a few demo orders per branch on the client (random data must not render on the server).
  React.useEffect(() => {
    const seeded = [makeOrder(14), makeOrder(9), makeOrder(4), makeOrder(1)]
    seeded[0].status = "ready"
    seeded[1].status = "preparing"
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrders(seeded)
  }, [branch.id])

  const counts = React.useMemo(
    () => ({
      all: orders.length,
      new: orders.filter((o) => o.status === "new").length,
      preparing: orders.filter((o) => o.status === "preparing").length,
      ready: orders.filter((o) => o.status === "ready").length,
    }),
    [orders]
  )

  const visible = React.useMemo(() => {
    const list =
      filter === "all" ? orders : orders.filter((o) => o.status === filter)
    return [...list].sort((a, b) =>
      sort === "recent"
        ? b.createdAt - a.createdAt
        : sort === "name"
          ? a.customer.localeCompare(b.customer)
          : a.number - b.number
    )
  }, [orders, sort, filter])

  const advance = (order: Order) => {
    const next = STATUS_META[order.status].next
    if (!next) {
      setOrders((prev) => prev.filter((o) => o.id !== order.id))
      toast.success(`Order #${order.number} completed`, {
        description: `${order.customer} · ${formatKES(order.total)}`,
      })
      return
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: next } : o))
    )
  }

  const addOrder = () => {
    const o = makeOrder()
    setOrders((prev) => [o, ...prev])
    toast(`New order #${o.number}`, {
      description: `${o.customer} · ${o.type}`,
    })
  }

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-5 p-4 pb-28 lg:p-6 lg:pb-28">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Active orders
            </h1>
            <p className="text-sm text-muted-foreground">
              {branch.name} · {counts.all} open{" "}
              {counts.all === 1 ? "ticket" : "tickets"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Segmented<Filter>
              ariaLabel="Filter by status"
              value={filter}
              onChange={setFilter}
              options={(["all", "new", "preparing", "ready"] as Filter[]).map(
                (f) => ({
                  value: f,
                  label: (
                    <span className="flex items-center gap-1.5">
                      {f === "all" ? "All" : STATUS_META[f].label}
                      <span className="rounded-full bg-foreground/5 px-1.5 text-[11px] tabular-nums">
                        {counts[f]}
                      </span>
                    </span>
                  ),
                })
              )}
            />
            <Segmented<Sort>
              ariaLabel="Sort orders"
              size="sm"
              value={sort}
              onChange={setSort}
              options={[
                { value: "recent", label: "Recent" },
                { value: "name", label: "Name" },
                { value: "number", label: "Number" },
              ]}
            />
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {visible.length === 0 ? (
            <EmptyState
              key="empty"
              filtered={filter !== "all" && orders.length > 0}
            />
          ) : (
            <motion.div
              key="grid"
              layout
              className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
            >
              <AnimatePresence mode="popLayout">
                {visible.map((order, i) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    index={i}
                    now={now}
                    onAdvance={() => advance(order)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pointer-events-none sticky bottom-0 z-10 mt-auto -mb-(--safe-bottom) bg-linear-to-t from-background via-background/90 to-transparent p-4 pt-10 pb-[max(1rem,calc(var(--safe-bottom)+0.5rem))] lg:px-6">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.25,
            type: "spring",
            stiffness: 260,
            damping: 24,
          }}
        >
          <Button
            size="lg"
            onClick={addOrder}
            className="group pointer-events-auto h-14 w-full rounded-2xl text-base shadow-xl shadow-foreground/10"
          >
            <PlusIcon className="size-5! transition-transform duration-300 group-hover:rotate-90" />
            New Order
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

function OrderCard({
  order,
  index,
  now,
  onAdvance,
}: {
  order: Order
  index: number
  now: number
  onAdvance: () => void
}) {
  const meta = STATUS_META[order.status]
  const TypeIcon = TYPE_ICON[order.type]
  const mins = now
    ? Math.max(0, Math.round((now - order.createdAt) / 60_000))
    : null
  const late = mins !== null && mins >= 12 && order.status !== "ready"

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          delay: Math.min(index * 0.04, 0.3),
          type: "spring",
          stiffness: 380,
          damping: 30,
        },
      }}
      exit={{ opacity: 0, scale: 0.9, x: 40, transition: { duration: 0.22 } }}
      whileHover={{ y: -3 }}
      className="group flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs transition-shadow hover:shadow-lg hover:shadow-foreground/5"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">
              #{order.number}
            </span>
            <motion.span
              layout
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                meta.className
              )}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={order.status}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  className="inline-block"
                >
                  {meta.label}
                </motion.span>
              </AnimatePresence>
            </motion.span>
          </div>
          <h3 className="mt-1 text-lg font-semibold">{order.customer}</h3>
        </div>
        <Badge variant="outline" className="gap-1">
          <TypeIcon className="size-3" />
          {order.type}
        </Badge>
      </div>
      <ul className="space-y-1 text-sm">
        {order.items.map((item, i) => (
          <li key={i} className="flex justify-between text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">{item.qty}×</span>{" "}
              {item.name}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-center justify-between border-t pt-3">
        <div className="flex flex-col">
          <span className="font-semibold tabular-nums">
            {formatKES(order.total)}
          </span>
          <span
            className={cn(
              "flex items-center gap-1 text-xs",
              late ? "font-medium text-destructive" : "text-muted-foreground"
            )}
          >
            <ClockIcon className="size-3" />
            {mins === null ? "…" : mins === 0 ? "Just now" : `${mins} min ago`}
          </span>
        </div>
        <Button
          size="sm"
          variant={order.status === "ready" ? "default" : "outline"}
          onClick={onAdvance}
        >
          {order.status === "new" && <ChefHatIcon />}
          {order.status === "ready" && <CheckCheckIcon />}
          {meta.action}
        </Button>
      </div>
    </motion.article>
  )
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed bg-card/50 px-6 py-20 text-center"
    >
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] opacity-40" />
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        className="relative mb-4 flex size-16 items-center justify-center rounded-2xl border bg-background shadow-sm"
      >
        <ClipboardListIcon className="size-7 text-muted-foreground" />
      </motion.div>
      <h2 className="relative text-lg font-semibold">
        {filtered ? "Nothing in this lane" : "No active orders"}
      </h2>
      <p className="relative mt-1 text-sm text-muted-foreground">
        {filtered
          ? "Try another status filter."
          : "Tap New Order below to start one."}
      </p>
    </motion.div>
  )
}
