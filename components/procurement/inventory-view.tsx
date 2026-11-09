"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PackageIcon,
  PackageXIcon,
  PanelLeftOpenIcon,
  PlusIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import { NoResults, SearchField } from "@/components/data/table-kit"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  CATEGORY_TREE,
  INVENTORY_ITEMS,
  kindOf,
  stockStatus,
  type InventoryItem,
  type ItemKind,
  type StockStatus,
} from "@/lib/mock/procurement"
import { formatKES } from "@/lib/tamu-data"
import { cn } from "@/lib/utils"

type KindTab = "all" | ItemKind
/** Either a stock status, a top category, or "Top/Sub". */
type Filter =
  | { type: "all" }
  | { type: "status"; status: StockStatus }
  | { type: "category"; category: string; sub?: string }

const STATUS_META: Record<
  StockStatus,
  { label: string; icon: LucideIcon; dot: string; badge: string }
> = {
  in: {
    label: "In Stock",
    icon: PackageIcon,
    dot: "bg-emerald-500",
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  low: {
    label: "Low Stock",
    icon: TriangleAlertIcon,
    dot: "bg-amber-500",
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  },
  out: {
    label: "Out of Stock",
    icon: PackageXIcon,
    dot: "bg-red-500",
    badge: "bg-red-500/15 text-red-700 dark:text-red-300",
  },
}

function sameFilter(a: Filter, b: Filter) {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function InventoryView() {
  const [items, setItems] = React.useState(INVENTORY_ITEMS)
  const [kind, setKind] = React.useState<KindTab>("all")
  const [filter, setFilter] = React.useState<Filter>({ type: "all" })
  const [query, setQuery] = React.useState("")
  const [panelOpen, setPanelOpen] = React.useState(true)
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set())
  const [adding, setAdding] = React.useState(false)

  const byKind = (k: KindTab) =>
    k === "all" ? items : items.filter((i) => kindOf(i.category) === k)
  const scoped = byKind(kind)
  const categories = CATEGORY_TREE.filter(
    (c) => kind === "all" || c.kind === kind
  )

  const q = query.trim().toLowerCase()
  const visible = scoped
    .filter((i) => {
      if (filter.type === "status") return stockStatus(i) === filter.status
      if (filter.type === "category")
        return (
          i.category === filter.category &&
          (!filter.sub || i.sub === filter.sub)
        )
      return true
    })
    .filter(
      (i) =>
        !q ||
        [i.name, i.category, i.sub].some((s) => s?.toLowerCase().includes(q))
    )
    .sort((a, b) => a.name.localeCompare(b.name))

  const changeKind = (k: KindTab) => {
    setKind(k)
    // A category from the other tab would leave an empty list behind.
    if (
      filter.type === "category" &&
      k !== "all" &&
      kindOf(filter.category) !== k
    )
      setFilter({ type: "all" })
  }

  const toggleExpanded = (name: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          ariaLabel="Item type"
          value={kind}
          onChange={changeKind}
          options={(
            [
              ["all", "All"],
              ["food", "Food"],
              ["non-food", "Non-Food"],
            ] as const
          ).map(([value, label]) => ({
            value,
            label: (
              <span className="flex items-center gap-1.5">
                {label}
                <span className="text-xs text-muted-foreground tabular-nums">
                  {byKind(value).length}
                </span>
              </span>
            ),
          }))}
        />
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <AnimatePresence initial={false}>
          {panelOpen && (
            <motion.aside
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="flex shrink-0 flex-col gap-1 rounded-2xl border bg-card p-3 lg:sticky lg:top-20 lg:w-60"
            >
              <div className="flex items-center justify-between px-1 pb-1">
                <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  Categories
                </span>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Add category"
                    onClick={() => toast("Adding categories is coming soon")}
                  >
                    <PlusIcon />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Hide categories"
                    onClick={() => setPanelOpen(false)}
                    className="hidden lg:inline-flex"
                  >
                    <ChevronLeftIcon />
                  </Button>
                </div>
              </div>

              <PanelRow
                active={filter.type === "all"}
                onClick={() => setFilter({ type: "all" })}
                label="All Items"
                count={scoped.length}
              />
              {(Object.keys(STATUS_META) as StockStatus[]).map((s) => {
                const meta = STATUS_META[s]
                const count = scoped.filter((i) => stockStatus(i) === s).length
                return (
                  <PanelRow
                    key={s}
                    icon={meta.icon}
                    active={sameFilter(filter, { type: "status", status: s })}
                    onClick={() => setFilter({ type: "status", status: s })}
                    label={meta.label}
                    count={count}
                    badgeClass={count > 0 ? meta.badge : undefined}
                    hideZero
                  />
                )
              })}

              <div className="my-1.5 border-t" />

              {categories.map((c) => {
                const count = scoped.filter((i) => i.category === c.name).length
                const open = expanded.has(c.name)
                return (
                  <div key={c.name} className="flex flex-col">
                    <div className="flex items-center">
                      <button
                        type="button"
                        aria-label={
                          open ? `Collapse ${c.name}` : `Expand ${c.name}`
                        }
                        disabled={c.subs.length === 0}
                        onClick={() => toggleExpanded(c.name)}
                        className="flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-40"
                      >
                        <ChevronRightIcon
                          className={cn(
                            "size-3.5 transition-transform duration-200",
                            open && "rotate-90"
                          )}
                        />
                      </button>
                      <PanelRow
                        className="flex-1"
                        active={sameFilter(filter, {
                          type: "category",
                          category: c.name,
                        })}
                        onClick={() =>
                          setFilter({ type: "category", category: c.name })
                        }
                        label={c.name}
                        count={count}
                      />
                    </div>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            duration: 0.22,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="ml-6 flex flex-col overflow-hidden border-l pl-1"
                        >
                          {c.subs.map((sub) => (
                            <PanelRow
                              key={sub}
                              size="sm"
                              active={sameFilter(filter, {
                                type: "category",
                                category: c.name,
                                sub,
                              })}
                              onClick={() =>
                                setFilter({
                                  type: "category",
                                  category: c.name,
                                  sub,
                                })
                              }
                              label={sub}
                              count={
                                scoped.filter(
                                  (i) => i.category === c.name && i.sub === sub
                                ).length
                              }
                            />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}

              <button
                type="button"
                onClick={() => toast("Adding categories is coming soon")}
                className="mt-1 flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <PlusIcon className="size-3.5" />
                Add category
              </button>
            </motion.aside>
          )}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-center gap-2">
            {!panelOpen && (
              <Button
                variant="outline"
                size="icon-lg"
                aria-label="Show categories"
                onClick={() => setPanelOpen(true)}
                className="h-11 rounded-xl"
              >
                <PanelLeftOpenIcon />
              </Button>
            )}
            <div className="flex-1">
              <SearchField
                value={query}
                onChange={setQuery}
                placeholder="Search items…"
              />
            </div>
            <Button
              onClick={() => setAdding(true)}
              className="h-11 rounded-xl px-4"
            >
              <PlusIcon />
              <span className="hidden sm:inline">Add Item</span>
            </Button>
          </div>

          <div className="overflow-hidden rounded-2xl border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                    <th className="w-8 py-3 pl-4" aria-label="Status" />
                    <th className="py-3 pr-3 font-medium">Item</th>
                    <th className="py-3 pr-3 font-medium">Category</th>
                    <th className="py-3 pr-3 font-medium">Unit</th>
                    <th className="py-3 pr-3 text-right font-medium">Stock</th>
                    <th className="py-3 pr-3 text-right font-medium">Par</th>
                    <th className="py-3 pr-5 text-right font-medium">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((item) => (
                    <ItemRow key={item.id} item={item} />
                  ))}
                </tbody>
              </table>
            </div>
            {visible.length === 0 &&
              (q || filter.type !== "all" ? (
                <NoResults
                  onReset={() => {
                    setQuery("")
                    setFilter({ type: "all" })
                  }}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 py-14 text-center text-muted-foreground">
                  <PackageIcon className="size-8 opacity-50" />
                  <p className="text-sm">No items here yet</p>
                </div>
              ))}
          </div>
          <p className="text-right text-xs text-muted-foreground tabular-nums">
            {visible.length} of {scoped.length} items
          </p>
        </div>
      </div>

      <AddItemDialog
        open={adding}
        onClose={() => setAdding(false)}
        defaultCategory={
          filter.type === "category"
            ? filter.category
            : kind === "non-food"
              ? "Supplies"
              : "Food"
        }
        onAdd={(item) => {
          setItems((prev) => [...prev, item])
          toast.success(`${item.name} added to inventory`)
        }}
      />
    </div>
  )
}

function PanelRow({
  label,
  count,
  active,
  onClick,
  icon: Icon,
  badgeClass,
  hideZero,
  size = "default",
  className,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
  icon?: LucideIcon
  badgeClass?: string
  hideZero?: boolean
  size?: "sm" | "default"
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "relative isolate flex items-center gap-2 rounded-md text-left transition-colors",
        size === "sm" ? "px-2 py-1 text-[13px]" : "px-3 py-1.5 text-sm",
        active
          ? "font-medium text-brand"
          : "text-foreground/80 hover:bg-muted/60 hover:text-foreground",
        className
      )}
    >
      {active && (
        <motion.span
          layoutId="inventory-panel-active"
          className="absolute inset-0 -z-10 rounded-md bg-brand/10"
          transition={{ type: "spring", stiffness: 500, damping: 38 }}
        />
      )}
      {Icon && <Icon className="size-3.5 shrink-0" />}
      <span className="truncate">{label}</span>
      {!(hideZero && count === 0) && (
        <span
          className={cn(
            "ml-auto text-xs tabular-nums",
            badgeClass
              ? cn("rounded-full px-1.5 py-0.5 font-medium", badgeClass)
              : "text-muted-foreground"
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}

function ItemRow({ item }: { item: InventoryItem }) {
  const status = STATUS_META[stockStatus(item)]
  return (
    <tr className="border-b transition-colors last:border-0 hover:bg-muted/40">
      <td className="py-3 pl-4">
        <span
          className={cn("block size-2 rounded-full", status.dot)}
          title={status.label}
        />
      </td>
      <td className="py-3 pr-3">
        <div className="font-medium">{item.name}</div>
        {item.sub && (
          <div className="text-xs text-muted-foreground">{item.sub}</div>
        )}
      </td>
      <td className="py-3 pr-3">
        <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
          {item.category}
        </span>
      </td>
      <td className="py-3 pr-3">
        <div>{item.unit}</div>
        {item.pack && (
          <div className="text-xs text-muted-foreground">{item.pack}</div>
        )}
      </td>
      <td className="py-3 pr-3 text-right font-medium tabular-nums">
        {item.stock}
      </td>
      <td className="py-3 pr-3 text-right text-muted-foreground tabular-nums">
        {item.par}
      </td>
      <td className="py-3 pr-5 text-right tabular-nums">
        {formatKES(item.cost)}
      </td>
    </tr>
  )
}

const SELECT_CLASS =
  "h-9 w-full rounded-md border bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"

function AddItemDialog({
  open,
  onClose,
  onAdd,
  defaultCategory,
}: {
  open: boolean
  onClose: () => void
  onAdd: (item: InventoryItem) => void
  defaultCategory: string
}) {
  const [name, setName] = React.useState("")
  const [category, setCategory] = React.useState(defaultCategory)
  const [sub, setSub] = React.useState("")
  const [unit, setUnit] = React.useState("kg")
  const [stock, setStock] = React.useState("")
  const [par, setPar] = React.useState("")
  const [cost, setCost] = React.useState("")

  // Start each open from a clean form in the category you were looking at.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setName("")
      setCategory(defaultCategory)
      setSub("")
      setUnit("kg")
      setStock("")
      setPar("")
      setCost("")
    }
  }

  const subs = CATEGORY_TREE.find((c) => c.name === category)?.subs ?? []

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd({
      id: `${trimmed.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      name: trimmed,
      category,
      sub: sub || undefined,
      unit: unit.trim() || "unit",
      stock: Number(stock) || 0,
      par: Number(par) || 0,
      cost: Number(cost) || 0,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add an item</DialogTitle>
          <DialogDescription>
            Something you buy and keep in stock.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="item-name">Name</Label>
            <Input
              id="item-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Brioche buns"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item-category">Category</Label>
              <select
                id="item-category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  setSub("")
                }}
                className={SELECT_CLASS}
              >
                {CATEGORY_TREE.map((c) => (
                  <option key={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item-sub">Subcategory</Label>
              <select
                id="item-sub"
                value={sub}
                onChange={(e) => setSub(e.target.value)}
                disabled={subs.length === 0}
                className={cn(SELECT_CLASS, "disabled:opacity-50")}
              >
                <option value="">None</option>
                {subs.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item-unit">Unit</Label>
              <Input
                id="item-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item-stock">Stock</Label>
              <Input
                id="item-stock"
                type="number"
                min={0}
                inputMode="decimal"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item-par">Par</Label>
              <Input
                id="item-par"
                type="number"
                min={0}
                inputMode="decimal"
                value={par}
                onChange={(e) => setPar(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item-cost">Cost (KSh)</Label>
              <Input
                id="item-cost"
                type="number"
                min={0}
                inputMode="decimal"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Add item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
