"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  ArrowRightIcon,
  ArrowRightLeftIcon,
  BadgeCheckIcon,
  DownloadIcon,
  GiftIcon,
  ReceiptTextIcon,
  RefreshCwIcon,
  Trash2Icon,
  XCircleIcon,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  PeriodPicker,
  describePeriod,
  periodFor,
  type Period,
} from "@/components/data/period-picker"
import { Pill, type PillTone } from "@/components/data/table-kit"
import { LineTabs } from "@/components/line-tabs"
import { AnimatedNumber } from "@/components/motion/animated-number"
import { PageHeader } from "@/components/page-header"
import { Segmented } from "@/components/segmented"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { downloadCsv } from "@/lib/csv"
import {
  MOCK_ADJUSTMENTS,
  type Adjustment,
  type AdjustmentType,
} from "@/lib/mock/adjustments"
import { formatDateTime, formatTime } from "@/lib/mock/transactions"
import { formatKES } from "@/lib/tamu-data"
import { cn } from "@/lib/utils"

type Tab = "voids" | "adjustments"
type VoidList = "items" | "tabs"
type AdjFilter = "all" | "comp" | "waste" | "move" | "tab"

const TYPE_META: Record<
  AdjustmentType,
  { label: string; icon: LucideIcon; tone: PillTone; iconClass: string }
> = {
  void: {
    label: "Deleted item",
    icon: Trash2Icon,
    tone: "red",
    iconClass: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
  cancel: {
    label: "Cancelled tab",
    icon: XCircleIcon,
    tone: "amber",
    iconClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  comp: {
    label: "Comp",
    icon: GiftIcon,
    tone: "violet",
    iconClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  waste: {
    label: "Wastage",
    icon: Trash2Icon,
    tone: "amber",
    iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  move: {
    label: "Item moved",
    icon: ArrowRightLeftIcon,
    tone: "sky",
    iconClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  tab: {
    label: "Tab change",
    icon: ReceiptTextIcon,
    tone: "slate",
    iconClass: "bg-muted text-muted-foreground",
  },
}

export function AdjustmentsView() {
  const [tab, setTab] = React.useState<Tab>("voids")
  const [period, setPeriod] = React.useState<Period>(() => periodFor("7d"))
  const [voidList, setVoidList] = React.useState<VoidList>("items")
  const [adjFilter, setAdjFilter] = React.useState<AdjFilter>("all")

  const inPeriod = React.useMemo(
    () =>
      MOCK_ADJUSTMENTS.filter((a) => a.at >= period.from && a.at < period.to),
    [period]
  )
  const voids = inPeriod.filter((a) => a.type === "void")
  const cancels = inPeriod.filter((a) => a.type === "cancel")
  const adjustments = inPeriod.filter(
    (a) => !["void", "cancel"].includes(a.type)
  )
  const byType = (t: AdjustmentType) => adjustments.filter((a) => a.type === t)
  const sum = (list: Adjustment[]) => list.reduce((s, a) => s + a.value, 0)

  const visibleAdjustments =
    adjFilter === "all" ? adjustments : byType(adjFilter)
  const rows =
    tab === "voids"
      ? voidList === "items"
        ? voids
        : cancels
      : visibleAdjustments

  const exportCsv = () => {
    const list = tab === "voids" ? [...voids, ...cancels] : adjustments
    downloadCsv(
      `${tab}-${describePeriod(period).replace(/[^\w]+/g, "-")}.csv`,
      [
        "Time",
        "Type",
        "Item",
        "Qty",
        "Value (KSh)",
        "Tab",
        "From",
        "To",
        "By",
        "Approved by",
        "Reason",
      ],
      list.map((a) => [
        formatDateTime(a.at),
        TYPE_META[a.type].label,
        a.item ?? "",
        a.qty || "",
        a.value,
        a.tab,
        a.from ?? "",
        a.to ?? "",
        a.by,
        a.approvedBy ?? "",
        a.reason,
      ])
    )
    toast.success(`Exported ${list.length} rows`)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 lg:p-8">
      <PageHeader
        icon={RefreshCwIcon}
        title="Adjustments"
        description="Voids, comps, wastage, item moves and tab changes"
        back={{ href: "/admin", label: "Back to Admin" }}
        actions={
          <>
            <Badge
              variant="secondary"
              className="bg-violet-500/10 text-violet-700 dark:text-violet-300"
            >
              Beta
            </Badge>
            <Button variant="outline" onClick={exportCsv}>
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
        className="rounded-2xl border bg-card shadow-xs"
      >
        <LineTabs<Tab>
          layoutId="adjustments-tab"
          className="px-3 pt-3"
          value={tab}
          onChange={setTab}
          options={[
            {
              value: "voids",
              label: (
                <>
                  <XCircleIcon className="size-4" />
                  Void reporting
                </>
              ),
            },
            {
              value: "adjustments",
              label: (
                <>
                  <ArrowRightLeftIcon className="size-4" />
                  Adjustments
                </>
              ),
            },
          ]}
        />
        <div className="flex flex-col gap-2 p-4">
          <PeriodPicker value={period} onChange={setPeriod} />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={describePeriod(period)}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-muted-foreground"
            >
              Showing {describePeriod(period)}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col gap-4"
        >
          {tab === "voids" ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <Tile
                icon={Trash2Icon}
                iconClass={TYPE_META.void.iconClass}
                label="Items deleted"
                value={voids.reduce((s, a) => s + a.qty, 0)}
              />
              <Tile
                icon={XCircleIcon}
                iconClass={TYPE_META.cancel.iconClass}
                label="Cancelled tabs"
                value={cancels.length}
              />
              <Tile
                icon={ReceiptTextIcon}
                iconClass="bg-muted text-foreground"
                label="Total value voided"
                value={sum(voids) + sum(cancels)}
                money
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {(["comp", "waste", "move", "tab"] as const).map((t) => (
                <Tile
                  key={t}
                  icon={TYPE_META[t].icon}
                  iconClass={TYPE_META[t].iconClass}
                  label={
                    {
                      comp: "Comps",
                      waste: "Wastage",
                      move: "Item moves",
                      tab: "Tab changes",
                    }[t]
                  }
                  value={byType(t).length}
                  hint={
                    t === "comp" || t === "waste"
                      ? formatKES(sum(byType(t)))
                      : undefined
                  }
                  active={adjFilter === t}
                  onClick={() => setAdjFilter((f) => (f === t ? "all" : t))}
                />
              ))}
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
            <div className="flex flex-wrap items-center gap-2 border-b p-3">
              {tab === "voids" ? (
                <Segmented<VoidList>
                  ariaLabel="List"
                  value={voidList}
                  onChange={setVoidList}
                  options={[
                    {
                      value: "items",
                      label: `Deleted items (${voids.length})`,
                    },
                    {
                      value: "tabs",
                      label: `Cancelled tabs (${cancels.length})`,
                    },
                  ]}
                />
              ) : (
                <Segmented<AdjFilter>
                  ariaLabel="Type"
                  value={adjFilter}
                  onChange={setAdjFilter}
                  options={[
                    { value: "all", label: `All (${adjustments.length})` },
                    { value: "comp", label: "Comps" },
                    { value: "waste", label: "Wastage" },
                    { value: "move", label: "Moves" },
                    { value: "tab", label: "Tab changes" },
                  ]}
                />
              )}
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${tab}-${voidList}-${adjFilter}-${period.from}-${period.to}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {rows.length === 0 ? (
                  <EmptyList tab={tab} voidList={voidList} />
                ) : (
                  <ul className="divide-y">
                    {rows.map((a, i) => (
                      <AdjustmentRow key={a.id} a={a} index={i} />
                    ))}
                  </ul>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function Tile({
  icon: Icon,
  iconClass,
  label,
  value,
  money,
  hint,
  active,
  onClick,
}: {
  icon: LucideIcon
  iconClass: string
  label: string
  value: number
  money?: boolean
  hint?: string
  active?: boolean
  onClick?: () => void
}) {
  const Comp = onClick ? motion.button : motion.div
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-pressed={onClick ? active : undefined}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { y: -2 } : undefined}
      className={cn(
        "relative flex items-center gap-4 rounded-2xl border bg-card p-4 text-left shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        onClick && "transition-shadow hover:shadow-md"
      )}
    >
      {active && (
        <motion.span
          layoutId="adj-tile"
          className="absolute inset-0 rounded-2xl ring-2 ring-foreground"
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
      )}
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          iconClass
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="text-sm text-muted-foreground">{label}</span>
        <AnimatedNumber
          value={value}
          format={money ? formatKES : undefined}
          duration={0.7}
          className="text-2xl font-semibold tracking-tight tabular-nums"
        />
        {hint && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {hint}
          </span>
        )}
      </div>
    </Comp>
  )
}

function describe(a: Adjustment): React.ReactNode {
  const qty = a.qty ? `${a.qty}× ` : ""
  switch (a.type) {
    case "void":
      return (
        <>
          <b>
            {qty}
            {a.item}
          </b>{" "}
          deleted from {a.tab}
        </>
      )
    case "cancel":
      return (
        <>
          Tab <b>{a.tab}</b> cancelled
        </>
      )
    case "comp":
      return (
        <>
          <b>
            {qty}
            {a.item}
          </b>{" "}
          comped on {a.tab}
        </>
      )
    case "waste":
      return (
        <>
          <b>
            {qty}
            {a.item}
          </b>{" "}
          wasted
        </>
      )
    case "move":
      return (
        <span className="inline-flex flex-wrap items-center gap-1">
          <b>
            {qty}
            {a.item}
          </b>{" "}
          moved {a.from}{" "}
          <ArrowRightIcon className="size-3.5 text-muted-foreground" /> {a.to}
        </span>
      )
    case "tab":
      return (
        <span className="inline-flex flex-wrap items-center gap-1">
          {a.reason} tab <b>{a.from}</b>{" "}
          <ArrowRightIcon className="size-3.5 text-muted-foreground" />{" "}
          <b>{a.to}</b>
        </span>
      )
  }
}

function AdjustmentRow({ a, index }: { a: Adjustment; index: number }) {
  const m = TYPE_META[a.type]
  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.4) }}
      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
    >
      <span
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
          m.iconClass
        )}
      >
        <m.icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm [&_b]:font-semibold">{describe(a)}</div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="tabular-nums">{formatDateTime(a.at)}</span>
          <span>·</span>
          <span>by {a.by}</span>
          {a.type !== "move" && a.type !== "tab" && (
            <>
              <span>·</span>
              <span className="italic">“{a.reason}”</span>
            </>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {a.value > 0 && a.type !== "move" && (
          <span className="text-sm font-semibold tabular-nums">
            {formatKES(a.value)}
          </span>
        )}
        {a.approvedBy ? (
          <Pill tone="green" icon={BadgeCheckIcon}>
            {a.approvedBy}
          </Pill>
        ) : (
          (a.type === "void" || a.type === "waste") && (
            <Pill tone="slate">No approval</Pill>
          )
        )}
        <span className="text-[11px] text-muted-foreground sm:hidden">
          {formatTime(a.at)}
        </span>
      </div>
    </motion.li>
  )
}

function EmptyList({ tab, voidList }: { tab: Tab; voidList: VoidList }) {
  const Icon =
    tab === "voids"
      ? voidList === "items"
        ? Trash2Icon
        : XCircleIcon
      : ArrowRightLeftIcon
  const title =
    tab === "voids"
      ? voidList === "items"
        ? "No deleted items"
        : "No cancelled tabs"
      : "No adjustments"
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
      <motion.span
        initial={{ scale: 0.6, rotate: -10, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 16 }}
        className="flex size-12 items-center justify-center rounded-2xl border bg-background"
      >
        <Icon className="size-5 text-muted-foreground" />
      </motion.span>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">
        Nothing was recorded in this period.
      </p>
    </div>
  )
}
