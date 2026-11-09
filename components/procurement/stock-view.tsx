"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import {
  ChevronRightIcon,
  ClipboardListIcon,
  PlusIcon,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Pill } from "@/components/data/table-kit"
import { Segmented } from "@/components/segmented"
import { Button } from "@/components/ui/button"
import {
  STOCK_COUNTS,
  procurementHref,
  type StockCount,
} from "@/lib/mock/procurement"
import { cn } from "@/lib/utils"

type Tab = "counts" | "used" | "requests"
type CountFilter = "all" | "manager"

const needsManager = (c: StockCount) => c.status === "completed"

export function countSummary(c: StockCount) {
  const counted = c.lines.filter((l) => l.counted !== null)
  const off = counted.filter((l) => l.counted !== l.believed)
  return { counted: counted.length, total: c.lines.length, off: off.length }
}

export function StockView() {
  const [tab, setTab] = React.useState<Tab>("counts")

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 lg:p-8">
      <Segmented
        ariaLabel="Stock"
        value={tab}
        onChange={setTab}
        className="self-start"
        options={[
          { value: "counts", label: "Stock Counts" },
          { value: "used", label: "Stock Used" },
          { value: "requests", label: "Store requests" },
        ]}
      />
      {tab === "counts" && <StockCounts />}
      {tab === "used" && (
        <EmptyTab
          title="Stock Used"
          description="What the kitchen took out, and what it was for."
          empty="Nothing recorded as used yet"
        />
      )}
      {tab === "requests" && (
        <EmptyTab
          title="Store requests"
          description="Requests from the kitchen and bar for items from the store."
          empty="No store requests yet"
        />
      )}
    </div>
  )
}

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  )
}

function StockCounts() {
  const [filter, setFilter] = React.useState<CountFilter>("all")
  const counts =
    filter === "manager" ? STOCK_COUNTS.filter(needsManager) : STOCK_COUNTS

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader
        title="Stock Counts"
        description="What is actually on the shelf, and when anybody last looked."
        action={
          <Button
            onClick={() => toast("Starting a new count is coming soon")}
            className="rounded-xl"
          >
            <PlusIcon />
            Start count
          </Button>
        }
      />
      <Segmented
        size="sm"
        ariaLabel="Filter counts"
        value={filter}
        onChange={setFilter}
        className="self-start"
        options={[
          {
            value: "all",
            label: <Labelled label="All" count={STOCK_COUNTS.length} />,
          },
          {
            value: "manager",
            label: (
              <Labelled
                label="Needs a manager"
                count={STOCK_COUNTS.filter(needsManager).length}
              />
            ),
          },
        ]}
      />

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] tracking-wider text-muted-foreground uppercase">
                <th className="py-3 pl-5 font-medium">Count</th>
                <th className="py-3 pr-3 font-medium">For</th>
                <th className="py-3 pr-3 font-medium">Place</th>
                <th className="py-3 pr-3 font-medium">Date</th>
                <th className="py-3 pr-3 font-medium">Counted</th>
                <th className="py-3 pr-3 font-medium">Result</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {counts.map((c, i) => (
                <CountRow key={c.id} count={c} index={i} />
              ))}
            </tbody>
          </table>
        </div>
        {counts.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-14 text-muted-foreground">
            <ClipboardListIcon className="size-8 opacity-50" />
            <p className="text-sm">Nothing waiting on a manager</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Labelled({ label, count }: { label: string; count: number }) {
  return (
    <span className="flex items-center gap-1.5">
      {label}
      <span className="text-muted-foreground tabular-nums">{count}</span>
    </span>
  )
}

function CountRow({ count, index }: { count: StockCount; index: number }) {
  const { counted, total, off } = countSummary(count)
  const href = procurementHref(`stock/${count.id}`)
  const date = new Date(count.date + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })

  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group relative border-b transition-colors last:border-0 hover:bg-muted/40"
    >
      <td className="py-4 pl-5 font-mono">
        <Link
          href={href}
          className="flex items-center gap-2 after:absolute after:inset-0"
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              needsManager(count) ? "bg-foreground" : "bg-muted-foreground/40"
            )}
          />
          {count.id}
        </Link>
      </td>
      <td className="py-4 pr-3">
        <Pill tone={count.kind === "override" ? "violet" : "sky"}>
          {count.kind === "override" ? "Override count" : "Spot count"}
        </Pill>
      </td>
      <td className="py-4 pr-3">
        {count.place}
        <span className="text-muted-foreground"> · {count.by}</span>
      </td>
      <td className="py-4 pr-3 tabular-nums">{date}</td>
      <td className="py-4 pr-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(counted / total) * 100}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full bg-brand"
            />
          </div>
          <span className="text-muted-foreground tabular-nums">
            {counted}/{total}
          </span>
        </div>
      </td>
      <td className="py-4 pr-3">
        <CountResult count={count} off={off} />
      </td>
      <td className="pr-4">
        <ChevronRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </td>
    </motion.tr>
  )
}

function CountResult({ count, off }: { count: StockCount; off: number }) {
  if (count.status === "in-progress")
    return <span className="text-muted-foreground">Still counting</span>
  if (off === 0)
    return (
      <span className="text-emerald-600 dark:text-emerald-400">
        Everything agreed
      </span>
    )
  return (
    <span className="text-amber-600 dark:text-amber-400">
      {off} {off === 1 ? "row" : "rows"} off
    </span>
  )
}

function EmptyTab({
  title,
  description,
  empty,
  icon: Icon = ClipboardListIcon,
}: {
  title: string
  description: string
  empty: string
  icon?: LucideIcon
}) {
  return (
    <div className="flex flex-col gap-4">
      <SectionHeader title={title} description={description} />
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed bg-card py-16 text-muted-foreground">
        <Icon className="size-8 opacity-50" />
        <p className="text-sm">{empty}</p>
      </div>
    </div>
  )
}
