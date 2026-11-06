"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  CircleDotIcon,
  CopyIcon,
  CreditCardIcon,
  DownloadIcon,
  Link2Icon,
  PencilLineIcon,
  PlusIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  UnlinkIcon,
  WalletIcon,
  XCircleIcon,
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
} from "@/components/data/table-kit"
import { AnimatedNumber } from "@/components/motion/animated-number"
import { ProviderPill } from "@/components/orders/order-history"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { copyText } from "@/lib/browser"
import { downloadCsv } from "@/lib/csv"
import {
  MOCK_NOW,
  MOCK_PAYMENTS,
  formatDateTime,
  formatPhone,
  inRange,
  type DateRange,
  type PaymentProvider,
  type PaymentStatus,
  type PaymentTxn,
} from "@/lib/mock/transactions"
import { formatKES } from "@/lib/tamu-data"
import { cn } from "@/lib/utils"

type Lens = "all" | "linked" | "unlinked" | "manual" | "failed"

const LENS_TEST: Record<Lens, (p: PaymentTxn) => boolean> = {
  all: () => true,
  linked: (p) => p.status === "success" && !!p.tab,
  unlinked: (p) => p.status === "success" && !p.tab,
  manual: (p) => p.manual,
  failed: (p) => p.status !== "success",
}

const STATUS_PILL: Record<
  PaymentStatus,
  { tone: "green" | "red" | "amber"; icon: typeof CheckCircle2Icon }
> = {
  success: { tone: "green", icon: CheckCircle2Icon },
  failed: { tone: "red", icon: XCircleIcon },
  cancelled: { tone: "amber", icon: XCircleIcon },
}

const PROVIDERS: PaymentProvider[] = [
  "M-Pesa STK Push",
  "M-Pesa Till",
  "Card (PDQ)",
  "Glovo",
]

export function PaymentTransactions() {
  const [payments, setPayments] = React.useState<PaymentTxn[]>(MOCK_PAYMENTS)
  const [query, setQuery] = React.useState("")
  const [providers, setProviders] = React.useState<PaymentProvider[]>([])
  const [statuses, setStatuses] = React.useState<PaymentStatus[]>([])
  const [range, setRange] = React.useState<DateRange>("all")
  const [lens, setLens] = React.useState<Lens>("all")
  const [expanded, setExpanded] = React.useState<string | null>(null)
  const [refreshing, setRefreshing] = React.useState(false)
  const [adding, setAdding] = React.useState<
    "Card (PDQ)" | "M-Pesa Till" | null
  >(null)
  const [flash, setFlash] = React.useState<string | null>(null)

  // Tiles count everything except the lens itself, so they always show what clicking them would give.
  const base = React.useMemo(() => {
    const q = query.trim().toLowerCase().replace(/\s/g, "")
    return payments.filter((p) => {
      if (providers.length && !providers.includes(p.provider)) return false
      if (statuses.length && !statuses.includes(p.status)) return false
      if (!inRange(p.at, range)) return false
      if (!q) return true
      return [
        p.tab,
        p.phone,
        formatPhone(p.phone),
        p.receipt,
        String(p.amount),
        p.user,
        p.provider,
        p.orderNumber && `#${p.orderNumber}`,
      ]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().replace(/\s/g, "").includes(q))
    })
  }, [payments, query, providers, statuses, range])

  const filtered = React.useMemo(
    () => base.filter(LENS_TEST[lens]),
    [base, lens]
  )
  const stats = React.useMemo(
    () => ({
      all: base.length,
      collected: base
        .filter((p) => p.status === "success")
        .reduce((s, p) => s + p.amount, 0),
      linked: base.filter(LENS_TEST.linked).length,
      unlinked: base.filter(LENS_TEST.unlinked).length,
      manual: base.filter(LENS_TEST.manual).length,
      failed: base.filter(LENS_TEST.failed).length,
    }),
    [base]
  )

  const pager = usePagination(
    filtered,
    20,
    JSON.stringify([query, providers, statuses, range, lens, payments.length])
  )
  const hasFilters =
    !!query ||
    providers.length + statuses.length > 0 ||
    range !== "all" ||
    lens !== "all"
  const reset = () => {
    setQuery("")
    setProviders([])
    setStatuses([])
    setRange("all")
    setLens("all")
  }

  const refresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      toast.success("Up to date", {
        description: "No new callbacks from M-Pesa or the PDQ.",
      })
    }, 1100)
  }

  const exportCsv = () => {
    downloadCsv(
      `payment-transactions-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Time",
        "Provider",
        "Amount (KSh)",
        "Receipt",
        "Phone",
        "Status",
        "Tab",
        "Order",
        "User",
        "Manual",
        "Result",
      ],
      filtered.map((p) => [
        formatDateTime(p.at),
        p.provider,
        p.amount,
        p.receipt ?? "",
        p.phone ?? "",
        p.status,
        p.tab ?? "",
        p.orderNumber ?? "",
        p.user ?? "",
        p.manual ? "yes" : "",
        p.resultDesc,
      ])
    )
    toast.success(`Exported ${filtered.length} transactions`)
  }

  const addManual = (entry: PaymentTxn) => {
    setPayments((prev) => [entry, ...prev].sort((a, b) => b.at - a.at))
    setLens("all")
    setFlash(entry.id)
    setTimeout(() => setFlash(null), 2400)
    toast.success(
      `${entry.provider} payment of ${formatKES(entry.amount)} added`,
      {
        description: "Marked as a manual entry for audit.",
      }
    )
  }

  const linkToTab = (p: PaymentTxn) => {
    toast("Pick a tab to link this payment to", {
      description: `${formatKES(p.amount)} · ${p.receipt}. Tab picker arrives with the backend.`,
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 lg:p-8">
      <PageHeader
        icon={CreditCardIcon}
        title="Payment Transactions"
        description="Every payment provider callback, in one place"
        back={{ href: "/admin", label: "Back to Admin" }}
        actions={
          <>
            <Button
              variant="outline"
              size="icon"
              aria-label="Refresh"
              onClick={refresh}
              disabled={refreshing}
            >
              <motion.span
                animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
                transition={
                  refreshing
                    ? { repeat: Infinity, duration: 0.8, ease: "linear" }
                    : { duration: 0 }
                }
                className="flex"
              >
                <RefreshCwIcon />
              </motion.span>
            </Button>
            <Button onClick={exportCsv} disabled={!filtered.length}>
              <DownloadIcon />
              Export CSV
            </Button>
          </>
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
          placeholder="Search tab, phone, receipt code, amount, cashier or provider…"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="flex flex-wrap items-center gap-2"
      >
        <FilterMenu<PaymentProvider>
          label="Provider"
          icon={WalletIcon}
          selected={providers}
          onChange={setProviders}
          options={PROVIDERS.map((p) => ({
            value: p,
            label: p,
            count: payments.filter((x) => x.provider === p).length,
          }))}
        />
        <FilterMenu<PaymentStatus>
          label="Status"
          icon={CircleDotIcon}
          selected={statuses}
          onChange={setStatuses}
          options={(["success", "failed", "cancelled"] as const).map((s) => ({
            value: s,
            label: s[0].toUpperCase() + s.slice(1),
            count: payments.filter((x) => x.status === s).length,
          }))}
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
        <div className="ml-auto flex flex-wrap gap-2">
          <Button
            onClick={() => setAdding("Card (PDQ)")}
            className="bg-brand text-brand-foreground hover:bg-brand/90"
          >
            <PlusIcon />
            Missing PDQ payment
          </Button>
          <Button variant="outline" onClick={() => setAdding("M-Pesa Till")}>
            <PlusIcon />
            Missing M-Pesa payment
          </Button>
        </div>
      </motion.div>

      {/* Stat tiles double as filters */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          show: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
        }}
        className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5"
      >
        <StatTile
          lens="all"
          active={lens}
          onSelect={setLens}
          label="Total"
          value={stats.all}
          hint={`${formatKES(stats.collected)} collected`}
        />
        <StatTile
          lens="linked"
          active={lens}
          onSelect={setLens}
          label="Linked to a tab"
          value={stats.linked}
          tone="text-success"
          icon={Link2Icon}
        />
        <StatTile
          lens="unlinked"
          active={lens}
          onSelect={setLens}
          label="Paid, not linked"
          value={stats.unlinked}
          tone="text-warning"
          icon={UnlinkIcon}
          hint={stats.unlinked ? "Needs reconciling" : "All matched"}
        />
        <StatTile
          lens="manual"
          active={lens}
          onSelect={setLens}
          label="Manual entries"
          value={stats.manual}
          icon={PencilLineIcon}
        />
        <StatTile
          lens="failed"
          active={lens}
          onSelect={setLens}
          label="Failed / cancelled"
          value={stats.failed}
          tone="text-destructive"
          icon={AlertTriangleIcon}
          hint="Retries usually follow"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden rounded-2xl border bg-card shadow-xs"
      >
        <AnimatePresence>
          {refreshing && (
            <motion.div
              initial={{ scaleX: 0, opacity: 1 }}
              animate={{ scaleX: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left bg-brand"
            />
          )}
        </AnimatePresence>
        {filtered.length === 0 ? (
          <NoResults onReset={reset} />
        ) : (
          <>
            <ul className="divide-y md:hidden">
              {pager.rows.map((p, i) => (
                <MobilePaymentCard
                  key={p.id}
                  p={p}
                  index={i}
                  open={expanded === p.id}
                  flash={flash === p.id}
                  onToggle={() =>
                    setExpanded((e) => (e === p.id ? null : p.id))
                  }
                  onLink={() => linkToTab(p)}
                />
              ))}
            </ul>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1000px] text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-[11px] tracking-wider text-muted-foreground uppercase">
                    {[
                      "Time",
                      "Provider",
                      "Amount",
                      "Reference",
                      "Customer",
                      "Status",
                      "Tab",
                      "User",
                      "",
                    ].map((h, i) => (
                      <th
                        key={i}
                        className={cn(
                          "px-4 py-2.5 font-medium whitespace-nowrap",
                          h === "Amount" && "text-right"
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.tbody
                    key={pager.page + lens}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {pager.rows.map((p, i) => (
                      <PaymentRow
                        key={p.id}
                        p={p}
                        index={i}
                        open={expanded === p.id}
                        flash={flash === p.id}
                        onToggle={() =>
                          setExpanded((e) => (e === p.id ? null : p.id))
                        }
                        onLink={() => linkToTab(p)}
                      />
                    ))}
                  </motion.tbody>
                </AnimatePresence>
              </table>
            </div>
          </>
        )}
        <Pager
          page={pager.page}
          pageCount={pager.pageCount}
          from={pager.from}
          to={pager.to}
          total={filtered.length}
          noun="transactions"
          onPage={pager.setPage}
        />
      </motion.div>

      <AddPaymentDialog
        provider={adding}
        onClose={() => setAdding(null)}
        onAdd={addManual}
      />
    </div>
  )
}

function StatTile({
  lens,
  active,
  onSelect,
  label,
  value,
  hint,
  tone,
  icon: Icon,
}: {
  lens: Lens
  active: Lens
  onSelect: (l: Lens) => void
  label: string
  value: number
  hint?: string
  tone?: string
  icon?: typeof Link2Icon
}) {
  const isActive = active === lens
  return (
    <motion.button
      type="button"
      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(isActive && lens !== "all" ? "all" : lens)}
      aria-pressed={isActive}
      className={cn(
        "relative flex flex-col items-start gap-1 rounded-2xl border bg-card p-4 text-left shadow-xs transition-shadow outline-none hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring/50",
        lens === "all" && "col-span-2 md:col-span-1"
      )}
    >
      {isActive && (
        <motion.span
          layoutId="payment-lens"
          className="absolute inset-0 rounded-2xl ring-2 ring-foreground"
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
      )}
      <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {Icon && <Icon className={cn("size-3.5", tone)} />}
        {label}
      </span>
      <AnimatedNumber
        value={value}
        duration={0.7}
        className={cn(
          "text-3xl font-semibold tracking-tight tabular-nums",
          value > 0 && tone
        )}
      />
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </motion.button>
  )
}

function PaymentRow({
  p,
  index,
  open,
  flash,
  onToggle,
  onLink,
}: {
  p: PaymentTxn
  index: number
  open: boolean
  flash: boolean
  onToggle: () => void
  onLink: () => void
}) {
  const s = STATUS_PILL[p.status]
  const bad = p.status !== "success"
  return (
    <>
      <motion.tr
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.018, 0.3), duration: 0.3 }}
        onClick={onToggle}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") &&
          (e.preventDefault(), onToggle())
        }
        tabIndex={0}
        aria-expanded={open}
        className={cn(
          "group cursor-pointer border-b transition-colors duration-700 hover:bg-muted/50 focus-visible:bg-muted/60 focus-visible:outline-none",
          bad &&
            "bg-red-500/[0.04] hover:bg-red-500/[0.08] dark:bg-red-500/[0.06]",
          flash && "bg-brand/15",
          open && "bg-muted/50"
        )}
      >
        <td className="px-4 py-3 whitespace-nowrap tabular-nums">
          {formatDateTime(p.at)}
        </td>
        <td className="px-4 py-3">
          <ProviderPill provider={p.provider} />
        </td>
        <td className="px-4 py-3 text-right font-semibold whitespace-nowrap tabular-nums">
          {formatKES(p.amount)}
        </td>
        <td className="px-4 py-3">
          <div className="font-mono text-xs">{p.receipt ?? "—"}</div>
          {p.orderNumber && (
            <div className="text-xs text-muted-foreground">
              Order #{p.orderNumber}
            </div>
          )}
        </td>
        <td className="px-4 py-3 text-xs whitespace-nowrap tabular-nums">
          {formatPhone(p.phone) ?? "—"}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            <Pill tone={s.tone} icon={s.icon}>
              {p.status}
            </Pill>
            {p.manual && (
              <Pill tone="violet" icon={PencilLineIcon}>
                Manual
              </Pill>
            )}
          </div>
        </td>
        <td className="px-4 py-3">
          {p.tab ? (
            <span className="font-medium">{p.tab}</span>
          ) : p.status === "success" ? (
            <Pill tone="amber" icon={UnlinkIcon}>
              Unlinked
            </Pill>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </td>
        <td className="px-4 py-3">
          {p.user ? (
            <Pill tone="slate">{p.user}</Pill>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </td>
        <td className="px-2 py-3">
          <ChevronDownIcon
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-300",
              open && "rotate-180"
            )}
          />
        </td>
      </motion.tr>
      <tr className={cn(open && "border-b")}>
        <td colSpan={9} className="p-0">
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden bg-muted/30"
              >
                <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto]">
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm lg:grid-cols-4">
                    <Detail label="Result">
                      <span
                        className={cn(
                          bad ? "text-destructive" : "text-success"
                        )}
                      >
                        {p.resultCode} · {p.resultDesc}
                      </span>
                    </Detail>
                    <Detail label="Checkout request" mono>
                      {p.checkoutRequestId}
                    </Detail>
                    <Detail label="Merchant request" mono>
                      {p.merchantRequestId}
                    </Detail>
                    <Detail label="Phone (raw)" mono>
                      {p.phone ?? "—"}
                    </Detail>
                  </dl>
                  <div className="flex items-start gap-2">
                    {p.receipt && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyText(p.receipt!).then((ok) =>
                            ok
                              ? toast.success(`Copied ${p.receipt}`)
                              : toast.error(
                                  "Couldn't copy. Long-press the code to copy it."
                                )
                          )
                        }}
                      >
                        <CopyIcon />
                        Copy receipt
                      </Button>
                    )}
                    {p.status === "success" && !p.tab && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onLink()
                        }}
                      >
                        <Link2Icon />
                        Link to tab
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </td>
      </tr>
    </>
  )
}

function MobilePaymentCard({
  p,
  index,
  open,
  flash,
  onToggle,
  onLink,
}: {
  p: PaymentTxn
  index: number
  open: boolean
  flash: boolean
  onToggle: () => void
  onLink: () => void
}) {
  const s = STATUS_PILL[p.status]
  const bad = p.status !== "success"
  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.3) }}
      className={cn(
        "transition-colors duration-700",
        bad && "bg-red-500/[0.04]",
        flash && "bg-brand/15"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full flex-col gap-1.5 p-4 text-left"
      >
        <span className="flex items-center justify-between gap-2">
          <span className="text-lg font-semibold tabular-nums">
            {formatKES(p.amount)}
          </span>
          <span className="flex items-center gap-1.5">
            <Pill tone={s.tone} icon={s.icon}>
              {p.status}
            </Pill>
            <ChevronDownIcon
              className={cn(
                "size-4 text-muted-foreground transition-transform duration-300",
                open && "rotate-180"
              )}
            />
          </span>
        </span>
        <span className="flex flex-wrap items-center gap-1.5">
          <ProviderPill provider={p.provider} />
          {p.manual && (
            <Pill tone="violet" icon={PencilLineIcon}>
              Manual
            </Pill>
          )}
          {p.tab ? (
            <span className="text-sm font-medium">{p.tab}</span>
          ) : p.status === "success" ? (
            <Pill tone="amber" icon={UnlinkIcon}>
              Unlinked
            </Pill>
          ) : null}
        </span>
        <span className="flex flex-wrap gap-x-2 text-xs text-muted-foreground tabular-nums">
          <span>{formatDateTime(p.at)}</span>
          {p.receipt && <span className="font-mono">{p.receipt}</span>}
          {p.phone && <span>{formatPhone(p.phone)}</span>}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 bg-muted/30 px-4 py-3 text-sm">
              <dl className="grid grid-cols-2 gap-3">
                <Detail label="Result">
                  <span
                    className={cn(bad ? "text-destructive" : "text-success")}
                  >
                    {p.resultDesc}
                  </span>
                </Detail>
                <Detail label="Order">
                  {p.orderNumber ? `#${p.orderNumber}` : "—"}
                </Detail>
                <Detail label="Checkout request" mono>
                  {p.checkoutRequestId}
                </Detail>
                <Detail label="User">{p.user ?? "—"}</Detail>
              </dl>
              <div className="flex gap-2">
                {p.receipt && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      copyText(p.receipt!).then((ok) =>
                        ok
                          ? toast.success(`Copied ${p.receipt}`)
                          : toast.error(
                              "Couldn't copy. Long-press the code to copy it."
                            )
                      )
                    }}
                  >
                    <CopyIcon />
                    Copy receipt
                  </Button>
                )}
                {p.status === "success" && !p.tab && (
                  <Button size="sm" onClick={onLink}>
                    <Link2Icon />
                    Link to tab
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  )
}

function Detail({
  label,
  mono,
  children,
}: {
  label: string
  mono?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn("truncate", mono && "font-mono text-xs")}>
        {children}
      </dd>
    </div>
  )
}

function AddPaymentDialog({
  provider,
  onClose,
  onAdd,
}: {
  provider: "Card (PDQ)" | "M-Pesa Till" | null
  onClose: () => void
  onAdd: (p: PaymentTxn) => void
}) {
  const [shown, setShown] = React.useState(provider)
  if (provider && provider !== shown) setShown(provider)
  const isMpesa = (provider ?? shown) === "M-Pesa Till"

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const amount = Number(f.get("amount"))
    const receipt = String(f.get("receipt") ?? "")
      .trim()
      .toUpperCase()
    if (!amount || amount <= 0) return toast.error("Enter an amount above zero")
    if (!receipt)
      return toast.error(
        isMpesa ? "Enter the M-Pesa code" : "Enter the PDQ approval code"
      )
    const rawPhone = String(f.get("phone") ?? "").replace(/\D/g, "")
    onAdd({
      id: `manual_${Date.now()}`,
      at: MOCK_NOW,
      provider: provider ?? "Card (PDQ)",
      amount,
      receipt,
      phone: rawPhone ? `254${rawPhone.replace(/^0|^254/, "")}` : null,
      status: "success",
      tab: String(f.get("tab") ?? "").trim() || null,
      orderNumber: null,
      user: "iamjoelangel",
      manual: true,
      checkoutRequestId: "manual",
      merchantRequestId: "manual",
      resultCode: 0,
      resultDesc: "Entered manually",
    })
    onClose()
  }

  return (
    <Dialog open={!!provider} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Add missing {isMpesa ? "M-Pesa" : "PDQ"} payment
          </DialogTitle>
          <DialogDescription>
            For payments the customer made but Tamu never received a callback
            for. It&apos;s flagged as a manual entry.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount">Amount (KSh)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="1,650"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="receipt">
                {isMpesa ? "M-Pesa code" : "Approval code"}
              </Label>
              <Input
                id="receipt"
                name="receipt"
                placeholder={isMpesa ? "UK4561AU4B" : "PDQ 004512"}
                className="font-mono uppercase"
              />
            </div>
          </div>
          {isMpesa && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Customer phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="0722 473 424"
              />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tab">Link to tab (optional)</Label>
            <Input id="tab" name="tab" placeholder="Customer name or table" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <PlusIcon />
              Add payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
