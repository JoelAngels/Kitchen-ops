"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowLeftIcon, LockIcon, ShieldCheckIcon } from "lucide-react"
import { toast } from "sonner"

import { SearchField } from "@/components/data/table-kit"
import { AnimatedNumber } from "@/components/motion/animated-number"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  CATEGORY_TREE,
  INVENTORY_ITEMS,
  findCount,
  procurementHref,
  type StockCountLine,
} from "@/lib/mock/procurement"
import { cn } from "@/lib/utils"

type Row = StockCountLine & {
  name: string
  category: string
  sub?: string
  unit: string
}

const CATEGORY_ORDER = CATEGORY_TREE.map((c) => c.name)

export function StockCountView({ id }: { id: string }) {
  const count = findCount(id)!
  const [lines, setLines] = React.useState(count.lines)
  const [approved, setApproved] = React.useState(count.status === "approved")
  const [query, setQuery] = React.useState("")
  const [category, setCategory] = React.useState<string>("all")
  const [uncountedOnly, setUncountedOnly] = React.useState(false)

  // Grouped like the shelves are walked: category, then subcategory, then name.
  const rows: Row[] = lines
    .map((l) => {
      const item = INVENTORY_ITEMS.find((i) => i.id === l.itemId)!
      return { ...l, ...item }
    })
    .sort(
      (a, b) =>
        CATEGORY_ORDER.indexOf(a.category) -
          CATEGORY_ORDER.indexOf(b.category) ||
        (a.sub ?? "").localeCompare(b.sub ?? "") ||
        a.name.localeCompare(b.name)
    )

  const counted = rows.filter((r) => r.counted !== null)
  const blank = rows.length - counted.length
  const variance = counted.reduce(
    (sum, r) => sum + Math.abs((r.counted ?? 0) - r.believed),
    0
  )
  const offBy10 = counted.filter((r) => {
    const diff = Math.abs((r.counted ?? 0) - r.believed)
    return r.believed === 0 ? diff > 0 : diff / r.believed > 0.1
  }).length
  const done = blank === 0
  const status = approved ? "Approved" : done ? "Completed" : "In progress"

  const categories = CATEGORY_ORDER.filter((c) =>
    rows.some((r) => r.category === c)
  )
  const q = query.trim().toLowerCase()
  const visible = rows
    .filter((r) => category === "all" || r.category === category)
    .filter((r) => !uncountedOnly || r.counted === null)
    .filter(
      (r) =>
        !q ||
        [r.name, r.category, r.sub].some((s) => s?.toLowerCase().includes(q))
    )

  const setCounted = (itemId: string, value: number | null) =>
    setLines((prev) =>
      prev.map((l) => (l.itemId === itemId ? { ...l, counted: value } : l))
    )

  const restUnchanged = () => {
    setLines((prev) =>
      prev.map((l) => (l.counted === null ? { ...l, counted: l.believed } : l))
    )
    toast.success(`${blank} ${blank === 1 ? "item" : "items"} kept as believed`)
  }

  const approve = () => {
    setApproved(true)
    toast.success("Stock replaced", {
      description: `${counted.length} items now match count ${count.id}.`,
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back to stock counts"
            render={<Link href={procurementHref("stock")} />}
            className="mt-0.5"
          >
            <ArrowLeftIcon />
          </Button>
          <div>
            <h1 className="flex items-baseline gap-2 text-xl font-semibold tracking-tight">
              Count {count.id}
              <span
                className={cn(
                  "text-[11px] font-medium tracking-wider uppercase",
                  approved
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground"
                )}
              >
                {status}
              </span>
            </h1>
            <p className="text-sm text-muted-foreground">
              {counted.length} of {rows.length} counted
            </p>
          </div>
        </div>
        <Button
          onClick={approve}
          disabled={!done || approved}
          className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <ShieldCheckIcon />
          {approved ? "Stock replaced" : "Replace stock"}
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-x-10 gap-y-3">
          <Stat
            value={counted.length}
            suffix={`of ${rows.length}`}
            label="Counted"
          />
          <Stat value={blank} label="Left blank — untouched" />
          <Stat value={variance} label="Variance so far" />
          <Stat value={offBy10} label="Rows off by more than 10%" />
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <motion.div
            animate={{ width: `${(counted.length / rows.length) * 100}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full bg-brand"
          />
        </div>
      </div>

      <SearchField
        value={query}
        onChange={setQuery}
        placeholder="Search items"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div className="flex flex-wrap gap-1.5">
          <Chip active={category === "all"} onClick={() => setCategory("all")}>
            All <span className="opacity-70">{rows.length}</span>
          </Chip>
          {categories.map((c) => {
            const inCat = rows.filter((r) => r.category === c)
            const done = inCat.filter((r) => r.counted !== null).length
            return (
              <Chip
                key={c}
                active={category === c}
                complete={done === inCat.length}
                onClick={() => setCategory(c)}
              >
                {c}{" "}
                <span className="tabular-nums opacity-70">
                  {done}/{inCat.length}
                </span>
              </Chip>
            )
          })}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={uncountedOnly}
              onCheckedChange={(v) => setUncountedOnly(v === true)}
            />
            Uncounted only
          </label>
          <button
            type="button"
            onClick={restUnchanged}
            disabled={blank === 0 || approved}
            className="text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            Rest unchanged →
          </button>
        </div>
      </div>

      {count.kind === "override" && !approved && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
          <p className="font-medium text-amber-800 dark:text-amber-300">
            This is an override count — what you count replaces the stock
          </p>
          <p className="text-xs text-amber-700/90 dark:text-amber-300/80">
            {done
              ? "Every item has a figure. Approving sets stock to exactly these numbers."
              : "Give every item a figure, then approve to set stock to exactly these numbers."}
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] tracking-wider text-muted-foreground uppercase">
                <th className="py-3 pl-5 font-medium">Item</th>
                <th className="py-3 pr-3 font-medium">Unit</th>
                <th className="py-3 pr-3 text-right font-medium">
                  Believed in stock
                </th>
                <th className="py-3 pr-3 text-right font-medium">Counted</th>
                <th className="py-3 pr-5 text-right font-medium">Variance</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <CountLineRow
                  key={r.itemId}
                  row={r}
                  locked={approved}
                  onChange={(v) => setCounted(r.itemId, v)}
                />
              ))}
            </tbody>
          </table>
        </div>
        {visible.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {uncountedOnly
              ? "Everything here has been counted"
              : "No items match"}
          </p>
        )}
        <div className="border-t bg-muted/30 px-5 py-3 text-xs text-muted-foreground">
          {approved ? (
            <>
              <span className="font-medium text-foreground">
                Stock replaced.
              </span>{" "}
              These figures are now what the system believes is on the shelf.
            </>
          ) : done ? (
            <>
              <span className="font-medium text-foreground">
                Counting is done — you can still fix a figure.
              </span>{" "}
              Approving is what writes these numbers to stock.
            </>
          ) : (
            <>
              <span className="font-medium text-foreground">
                {blank} still to count.
              </span>{" "}
              Leave a box blank and it stays untouched.
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Stat({
  value,
  label,
  suffix,
}: {
  value: number
  label: string
  suffix?: string
}) {
  return (
    <div>
      <div className="text-xl font-semibold tabular-nums">
        <AnimatedNumber value={value} />
        {suffix && (
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      <div className="text-[11px] tracking-wider text-muted-foreground uppercase">
        {label}
      </div>
    </div>
  )
}

function Chip({
  active,
  complete,
  onClick,
  children,
}: {
  active: boolean
  complete?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-full px-3 text-xs font-medium ring-1 transition-colors",
        active
          ? "bg-foreground text-background ring-foreground"
          : complete
            ? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/30 hover:bg-emerald-500/15 dark:text-emerald-300"
            : "bg-card text-muted-foreground ring-border hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}

function CountLineRow({
  row,
  locked,
  onChange,
}: {
  row: Row
  locked: boolean
  onChange: (value: number | null) => void
}) {
  const diff = row.counted === null ? null : row.counted - row.believed
  const [draft, setDraft] = React.useState(
    row.counted === null ? "" : String(row.counted)
  )
  // Keep the box in step when the figure changes from outside (e.g. "Rest unchanged").
  const [lastCounted, setLastCounted] = React.useState(row.counted)
  if (row.counted !== lastCounted) {
    setLastCounted(row.counted)
    setDraft(row.counted === null ? "" : String(row.counted))
  }

  return (
    <tr className="border-b transition-colors last:border-0 hover:bg-muted/30">
      <td className="py-2.5 pl-5">
        <span className="font-medium">{row.name}</span>
        <span className="ml-2 text-xs text-muted-foreground">
          {row.category}
          {row.sub && ` · ${row.sub}`}
        </span>
      </td>
      <td className="py-2.5 pr-3 text-muted-foreground">{row.unit}</td>
      <td className="py-2.5 pr-3 text-right font-medium tabular-nums">
        {row.believed}
      </td>
      <td className="py-2.5 pr-3">
        <div className="flex items-center justify-end gap-1.5">
          <input
            type="number"
            min={0}
            step="any"
            inputMode="decimal"
            aria-label={`Counted ${row.name}`}
            value={draft}
            disabled={locked}
            onChange={(e) => {
              setDraft(e.target.value)
              const v = e.target.value.trim()
              const n = Number(v)
              onChange(v === "" || Number.isNaN(n) ? null : n)
            }}
            className={cn(
              "h-8 w-24 [appearance:textfield] rounded-lg border px-2.5 text-right text-sm font-medium tabular-nums transition-colors outline-none focus:border-ring focus:ring-3 focus:ring-ring/20 disabled:opacity-70 [&::-webkit-inner-spin-button]:appearance-none",
              row.counted === null
                ? "bg-background"
                : diff === 0
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-amber-500/50 bg-amber-500/10"
            )}
          />
          <LockIcon
            className={cn(
              "size-3.5 text-muted-foreground/50",
              !locked && row.counted === null && "invisible"
            )}
          />
        </div>
      </td>
      <td className="py-2.5 pr-5 text-right tabular-nums">
        {diff === null ? (
          <span className="text-muted-foreground/60">—</span>
        ) : diff === 0 ? (
          <span className="text-muted-foreground">
            0 <span className="text-xs">same</span>
          </span>
        ) : (
          <span
            className={
              diff > 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }
          >
            {diff > 0 ? "+" : ""}
            {Number(diff.toFixed(2))}
          </span>
        )}
      </td>
    </tr>
  )
}
