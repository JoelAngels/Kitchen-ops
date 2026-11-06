"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  BanknoteIcon,
  BikeIcon,
  CircleDotIcon,
  CreditCardIcon,
  DollarSignIcon,
  DownloadIcon,
  GlobeIcon,
  HistoryIcon,
  LayoutGridIcon,
  PrinterIcon,
  ReceiptTextIcon,
  RotateCcwIcon,
  ShoppingBagIcon,
  SmartphoneIcon,
  TableIcon,
  TagIcon,
  UserIcon,
  UtensilsIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  DateRangeMenu,
  FilterMenu,
  NoResults,
  Pager,
  Pill,
  SearchField,
  usePagination,
  type PillTone,
} from "@/components/data/table-kit"
import { AnimatedNumber } from "@/components/motion/animated-number"
import { PageHeader } from "@/components/page-header"
import { Segmented } from "@/components/segmented"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { downloadCsv } from "@/lib/csv"
import {
  MOCK_ORDERS,
  SERVER_NAMES,
  formatDateTime,
  formatPhone,
  formatTime,
  inRange,
  type DateRange,
  type HistoryOrder,
  type HistoryStatus,
  type OrderChannel,
  type PaymentProvider,
} from "@/lib/mock/transactions"
import { formatKES } from "@/lib/tamu-data"
import { cn } from "@/lib/utils"

export const CHANNEL_META: Record<
  OrderChannel,
  { tone: PillTone; icon: LucideIcon }
> = {
  Online: { tone: "violet", icon: GlobeIcon },
  Cashier: { tone: "amber", icon: DollarSignIcon },
  "Dine in": { tone: "sky", icon: UtensilsIcon },
  Takeaway: { tone: "slate", icon: ShoppingBagIcon },
  Glovo: { tone: "green", icon: BikeIcon },
}

export const PROVIDER_ICON: Record<PaymentProvider, LucideIcon> = {
  "M-Pesa STK Push": SmartphoneIcon,
  "M-Pesa Till": SmartphoneIcon,
  "Card (PDQ)": CreditCardIcon,
  Cash: BanknoteIcon,
  Glovo: BikeIcon,
}

const STATUS_TONE: Record<HistoryStatus, PillTone> = {
  Completed: "green",
  Canceled: "red",
  Refunded: "amber",
}

type View = "table" | "cards"

function count<T>(list: HistoryOrder[], key: (o: HistoryOrder) => T, value: T) {
  return list.filter((o) => key(o) === value).length
}

export function OrderHistory() {
  const [query, setQuery] = React.useState("")
  const [view, setView] = React.useState<View>("table")
  const [statuses, setStatuses] = React.useState<HistoryStatus[]>([])
  const [servers, setServers] = React.useState<string[]>([])
  const [channels, setChannels] = React.useState<OrderChannel[]>([])
  const [providers, setProviders] = React.useState<PaymentProvider[]>([])
  const [range, setRange] = React.useState<DateRange>("all")
  const [selected, setSelected] = React.useState<HistoryOrder | null>(null)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return MOCK_ORDERS.filter((o) => {
      if (statuses.length && !statuses.includes(o.status)) return false
      if (servers.length && !(o.server && servers.includes(o.server)))
        return false
      if (channels.length && !channels.includes(o.channel)) return false
      if (providers.length && !(o.provider && providers.includes(o.provider)))
        return false
      if (!inRange(o.createdAt, range)) return false
      if (!q) return true
      return [
        o.customer,
        o.phone,
        o.ref,
        `#${o.number}`,
        String(o.number),
        String(o.total),
        o.server,
      ]
        .filter(Boolean)
        .some((f) =>
          f!.toLowerCase().replace(/\s/g, "").includes(q.replace(/\s/g, ""))
        )
    })
  }, [query, statuses, servers, channels, providers, range])

  const totals = React.useMemo(() => {
    const done = filtered.filter((o) => o.status === "Completed")
    return {
      orders: filtered.length,
      items: done.reduce((s, o) => s + o.itemCount, 0),
      revenue: done.reduce((s, o) => s + o.total, 0),
    }
  }, [filtered])

  const filterKey = JSON.stringify([
    query,
    statuses,
    servers,
    channels,
    providers,
    range,
  ])
  const pager = usePagination(
    filtered,
    view === "table" ? 20 : 18,
    filterKey + view
  )
  const hasFilters =
    !!query ||
    statuses.length + servers.length + channels.length + providers.length > 0 ||
    range !== "all"

  const reset = () => {
    setQuery("")
    setStatuses([])
    setServers([])
    setChannels([])
    setProviders([])
    setRange("all")
  }

  const exportCsv = () => {
    downloadCsv(
      `order-history-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Order",
        "Date",
        "Customer",
        "Phone",
        "Type",
        "Server",
        "Items",
        "Total (KSh)",
        "Payment",
        "Ref",
        "Status",
      ],
      filtered.map((o) => [
        o.number,
        formatDateTime(o.createdAt),
        o.customer,
        o.phone ?? "",
        o.channel,
        o.server ?? "",
        o.itemCount,
        o.total,
        o.provider ?? "",
        o.ref ?? "",
        o.status,
      ])
    )
    toast.success(`Exported ${filtered.length} orders`)
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 lg:p-8">
      <PageHeader
        icon={HistoryIcon}
        title="Order History"
        description="Past orders and transaction records"
        back={{ href: "/admin", label: "Back to Admin" }}
        actions={
          <Button onClick={exportCsv} disabled={!filtered.length}>
            <DownloadIcon />
            Export CSV
          </Button>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search name, phone, order #, M-Pesa ref or amount…"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="flex flex-wrap items-center gap-2"
      >
        <Segmented<View>
          ariaLabel="View"
          value={view}
          onChange={setView}
          options={[
            {
              value: "table",
              label: (
                <span className="flex items-center gap-1.5">
                  <TableIcon className="size-3.5" />
                  Table
                </span>
              ),
            },
            {
              value: "cards",
              label: (
                <span className="flex items-center gap-1.5">
                  <LayoutGridIcon className="size-3.5" />
                  Cards
                </span>
              ),
            },
          ]}
        />
        <FilterMenu<HistoryStatus>
          label="Status"
          icon={CircleDotIcon}
          selected={statuses}
          onChange={setStatuses}
          options={(["Completed", "Canceled", "Refunded"] as const).map(
            (s) => ({
              value: s,
              label: s,
              count: count(MOCK_ORDERS, (o) => o.status, s),
            })
          )}
        />
        <FilterMenu<OrderChannel>
          label="Type"
          icon={TagIcon}
          selected={channels}
          onChange={setChannels}
          options={(Object.keys(CHANNEL_META) as OrderChannel[]).map((c) => ({
            value: c,
            label: c,
            count: count(MOCK_ORDERS, (o) => o.channel, c),
          }))}
        />
        <FilterMenu<string>
          label="Server"
          icon={UserIcon}
          selected={servers}
          onChange={setServers}
          options={SERVER_NAMES.map((s) => ({
            value: s,
            label: s,
            count: count(MOCK_ORDERS, (o) => o.server, s),
          }))}
        />
        <FilterMenu<PaymentProvider>
          label="Payment"
          icon={WalletIcon}
          selected={providers}
          onChange={setProviders}
          options={(Object.keys(PROVIDER_ICON) as PaymentProvider[]).map(
            (p) => ({
              value: p,
              label: p,
              count: count(MOCK_ORDERS, (o) => o.provider, p),
            })
          )}
        />
        <DateRangeMenu value={range} onChange={setRange} />
        <AnimatePresence>
          {hasFilters && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
            >
              <Button
                variant="ghost"
                onClick={reset}
                className="text-muted-foreground"
              >
                <RotateCcwIcon />
                Reset
              </Button>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
        className="overflow-hidden rounded-2xl border bg-card shadow-xs"
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b px-4 py-3 text-sm">
          <AnimatedNumber
            value={totals.orders}
            className="font-semibold tabular-nums"
            duration={0.6}
          />
          <span className="text-muted-foreground">orders</span>
          <span className="text-muted-foreground/50">•</span>
          <AnimatedNumber
            value={totals.items}
            className="font-semibold tabular-nums"
            duration={0.6}
          />
          <span className="text-muted-foreground">items</span>
          <span className="text-muted-foreground/50">•</span>
          <AnimatedNumber
            value={totals.revenue}
            format={formatKES}
            className="font-semibold tabular-nums"
            duration={0.6}
          />
          <span className="text-muted-foreground">revenue (completed)</span>
        </div>

        {filtered.length === 0 ? (
          <NoResults onReset={reset} />
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${view}-${pager.page}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {view === "table" ? (
                <>
                  {/* Phones get cards: an 11-column table doesn't fit a 390px screen. */}
                  <div className="hidden md:block">
                    <OrdersTable rows={pager.rows} onOpen={setSelected} />
                  </div>
                  <div className="md:hidden">
                    <OrdersCards rows={pager.rows} onOpen={setSelected} />
                  </div>
                </>
              ) : (
                <OrdersCards rows={pager.rows} onOpen={setSelected} />
              )}
            </motion.div>
          </AnimatePresence>
        )}
        <Pager
          page={pager.page}
          pageCount={pager.pageCount}
          from={pager.from}
          to={pager.to}
          total={filtered.length}
          noun="orders"
          onPage={pager.setPage}
        />
      </motion.div>

      <OrderSheet order={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

function ChannelPill({ channel }: { channel: OrderChannel }) {
  const m = CHANNEL_META[channel]
  return (
    <Pill tone={m.tone} icon={m.icon}>
      {channel}
    </Pill>
  )
}

export function ProviderPill({
  provider,
}: {
  provider: PaymentProvider | null
}) {
  if (!provider) return <span className="text-muted-foreground">—</span>
  return (
    <Pill
      tone={
        provider === "Cash"
          ? "slate"
          : provider === "Card (PDQ)"
            ? "sky"
            : "green"
      }
      icon={PROVIDER_ICON[provider]}
    >
      {provider}
    </Pill>
  )
}

function OrdersTable({
  rows,
  onOpen,
}: {
  rows: HistoryOrder[]
  onOpen: (o: HistoryOrder) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1000px] text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-left text-[11px] tracking-wider text-muted-foreground uppercase">
            {[
              "Date & time",
              "Customer",
              "Type",
              "Table",
              "Server",
              "Items",
              "Total",
              "Payment",
              "Ref",
              "Status",
            ].map((h) => (
              <th
                key={h}
                className={cn(
                  "px-3 py-2.5 font-medium whitespace-nowrap first:pl-4 last:pr-4",
                  ["Items", "Total"].includes(h) && "text-right"
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((o, i) => {
            const dim = o.status === "Canceled"
            return (
              <motion.tr
                key={o.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.018, 0.3), duration: 0.3 }}
                onClick={() => onOpen(o)}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") &&
                  (e.preventDefault(), onOpen(o))
                }
                tabIndex={0}
                className={cn(
                  "group cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/50 focus-visible:bg-muted/60 focus-visible:outline-none",
                  dim && "text-muted-foreground"
                )}
              >
                <td className="py-3 pr-3 pl-4 whitespace-nowrap tabular-nums">
                  {formatDateTime(o.createdAt)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className={cn("font-medium", !dim && "text-foreground")}>
                    {o.customer}
                  </div>
                  {o.phone && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                      <SmartphoneIcon className="size-3" />
                      {formatPhone(o.phone)}
                    </div>
                  )}
                </td>
                <td className="px-3 py-3">
                  <ChannelPill channel={o.channel} />
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  {o.channel === "Dine in" ? (
                    <span>
                      {o.table}
                      <span className="text-xs text-muted-foreground">
                        {" "}
                        · {o.party} pax
                      </span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  {o.server ?? <span className="text-muted-foreground">—</span>}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {o.itemCount}
                </td>
                <td className="px-3 py-3 text-right font-semibold whitespace-nowrap tabular-nums">
                  {formatKES(o.total)}
                </td>
                <td className="px-3 py-3">
                  <ProviderPill provider={o.provider} />
                </td>
                <td className="px-3 py-3">
                  <div className="font-mono text-xs text-muted-foreground">
                    {o.ref ?? "—"}
                  </div>
                  {o.etims && (
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-sky-700 dark:text-sky-300">
                      <ReceiptTextIcon className="size-3" />
                      eTIMS receipt
                    </div>
                  )}
                </td>
                <td className="py-3 pr-4 pl-3">
                  <Pill tone={STATUS_TONE[o.status]}>{o.status}</Pill>
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function OrdersCards({
  rows,
  onOpen,
}: {
  rows: HistoryOrder[]
  onOpen: (o: HistoryOrder) => void
}) {
  return (
    <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((o, i) => (
        <motion.button
          key={o.id}
          type="button"
          onClick={() => onOpen(o)}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: Math.min(i * 0.025, 0.35),
            type: "spring",
            stiffness: 340,
            damping: 30,
          }}
          whileHover={{ y: -3 }}
          className={cn(
            "flex flex-col gap-3 rounded-xl border bg-background p-4 text-left shadow-xs transition-shadow outline-none hover:shadow-lg hover:shadow-foreground/5 focus-visible:ring-2 focus-visible:ring-ring/50",
            o.status === "Canceled" && "opacity-60"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-mono text-xs text-muted-foreground">
                #{o.number}
              </div>
              <div className="truncate font-semibold">{o.customer}</div>
              <div className="text-xs text-muted-foreground tabular-nums">
                {formatDateTime(o.createdAt)}
              </div>
            </div>
            <Pill tone={STATUS_TONE[o.status]}>{o.status}</Pill>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <ChannelPill channel={o.channel} />
            <ProviderPill provider={o.provider} />
          </div>
          <div className="mt-auto flex items-end justify-between border-t pt-3">
            <span className="text-sm text-muted-foreground">
              {o.itemCount} items
            </span>
            <span className="text-lg font-semibold tabular-nums">
              {formatKES(o.total)}
            </span>
          </div>
        </motion.button>
      ))}
    </div>
  )
}

function OrderSheet({
  order,
  onClose,
}: {
  order: HistoryOrder | null
  onClose: () => void
}) {
  // Keep the last order rendered while the sheet animates out.
  const [shown, setShown] = React.useState(order)
  if (order && order !== shown) setShown(order)
  const o = order ?? shown

  return (
    <Sheet open={!!order} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {o && (
          <>
            <SheetHeader className="border-b">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-muted-foreground">
                  #{o.number}
                </span>
                <Pill tone={STATUS_TONE[o.status]}>{o.status}</Pill>
                {o.etims && (
                  <Pill tone="sky" icon={ReceiptTextIcon}>
                    eTIMS
                  </Pill>
                )}
              </div>
              <SheetTitle className="text-xl">{o.customer}</SheetTitle>
              <SheetDescription>{formatDateTime(o.createdAt)}</SheetDescription>
            </SheetHeader>

            <motion.div
              key={o.id}
              initial="hidden"
              animate="show"
              variants={{
                show: {
                  transition: { staggerChildren: 0.05, delayChildren: 0.08 },
                },
              }}
              className="flex flex-col gap-5 p-4"
            >
              <SheetSection>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <Field label="Type">
                    <ChannelPill channel={o.channel} />
                  </Field>
                  <Field label="Server">{o.server ?? "—"}</Field>
                  <Field label="Phone">{formatPhone(o.phone) ?? "—"}</Field>
                  <Field label="Table / party">
                    {o.table}
                    {o.party ? ` · ${o.party} pax` : ""}
                  </Field>
                </dl>
              </SheetSection>

              <SheetSection>
                <h3 className="mb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  Items
                </h3>
                {o.lines.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No items: the order was canceled before anything was added.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2 text-sm">
                    {o.lines.map((l, i) => (
                      <li key={i} className="flex justify-between gap-3">
                        <span>
                          <span className="font-medium">{l.qty}×</span> {l.name}
                          <span className="block text-xs text-muted-foreground">
                            {l.category}
                          </span>
                        </span>
                        <span className="tabular-nums">
                          {formatKES(l.qty * l.price)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <Separator className="my-3" />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">{formatKES(o.total)}</span>
                </div>
              </SheetSection>

              <SheetSection>
                <h3 className="mb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  Payment
                </h3>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <ProviderPill provider={o.provider} />
                  <span className="font-mono text-xs text-muted-foreground">
                    {o.ref ?? "No reference"}
                  </span>
                </div>
              </SheetSection>

              <SheetSection>
                <h3 className="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  Timeline
                </h3>
                <ol className="relative ml-1.5 flex flex-col gap-4 border-l pl-5">
                  {o.timeline.map((t, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.08 }}
                      className="relative text-sm"
                    >
                      <span
                        className={cn(
                          "absolute top-1 -left-[26px] size-2.5 rounded-full ring-4 ring-background",
                          i === o.timeline.length - 1
                            ? o.status === "Canceled"
                              ? "bg-destructive"
                              : "bg-success"
                            : "bg-muted-foreground/40"
                        )}
                      />
                      <div className="font-medium">{t.label}</div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        {formatTime(t.at)}
                      </div>
                    </motion.li>
                  ))}
                </ol>
              </SheetSection>

              <SheetSection className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    toast.success(`Receipt for #${o.number} sent to printer`)
                  }
                >
                  <PrinterIcon />
                  Reprint receipt
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={o.status !== "Completed"}
                  onClick={() =>
                    toast(`Refund for #${o.number} needs manager approval`, {
                      description: "Approval flow arrives with the backend.",
                    })
                  }
                >
                  <RotateCcwIcon />
                  Refund
                </Button>
              </SheetSection>
            </motion.div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function SheetSection({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <motion.section
      variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  )
}
