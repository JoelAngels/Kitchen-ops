"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Kbd } from "@/components/ui/kbd"
import { DATE_RANGES, type DateRange } from "@/lib/mock/transactions"
import { cn } from "@/lib/utils"

/* --------------------------------- Search ---------------------------------- */

export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  const ref = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLElement &&
        ["INPUT", "TEXTAREA"].includes(e.target.tagName)
      if (
        (e.key === "/" && !typing) ||
        (e.key.toLowerCase() === "f" && (e.ctrlKey || e.metaKey))
      ) {
        e.preventDefault()
        ref.current?.focus()
        ref.current?.select()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <div className="group/search relative">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within/search:text-foreground" />
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && onChange("")}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-11 w-full rounded-xl border bg-card pr-24 pl-10 text-sm shadow-xs transition-all outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-4 focus:ring-ring/15"
      />
      <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2">
        <AnimatePresence>
          {value && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Clear search"
                onClick={() => onChange("")}
              >
                <XIcon />
              </Button>
            </motion.span>
          )}
        </AnimatePresence>
        <Kbd className="hidden sm:inline-flex">Ctrl F</Kbd>
      </div>
    </div>
  )
}

/* ------------------------------ Filter menus ------------------------------- */

export function FilterMenu<T extends string>({
  label,
  icon: Icon,
  options,
  selected,
  onChange,
}: {
  label: string
  icon: LucideIcon
  options: { value: T; label: string; count?: number }[]
  selected: T[]
  onChange: (next: T[]) => void
}) {
  const active = selected.length > 0
  const summary =
    selected.length === 1
      ? options.find((o) => o.value === selected[0])?.label
      : `${selected.length} selected`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className={cn(
              "gap-1.5",
              active && "border-foreground/25 bg-foreground/[0.03]"
            )}
          />
        }
      >
        <Icon className="text-muted-foreground" />
        {label}
        <AnimatePresence mode="popLayout" initial={false}>
          {active && (
            <motion.span
              key={summary}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className="rounded-md bg-foreground px-1.5 text-xs text-background"
            >
              {summary}
            </motion.span>
          )}
        </AnimatePresence>
        <ChevronDownIcon className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto min-w-52 rounded-xl" align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          {options.map((o) => (
            <DropdownMenuCheckboxItem
              key={o.value}
              checked={selected.includes(o.value)}
              closeOnClick={false}
              onCheckedChange={(checked) =>
                onChange(
                  checked
                    ? [...selected, o.value]
                    : selected.filter((s) => s !== o.value)
                )
              }
            >
              <span className="flex-1">{o.label}</span>
              {o.count !== undefined && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {o.count}
                </span>
              )}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
        {active && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onChange([])}
              className="justify-center text-muted-foreground"
            >
              Clear filter
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function DateRangeMenu({
  value,
  onChange,
}: {
  value: DateRange
  onChange: (v: DateRange) => void
}) {
  const label = DATE_RANGES.find((d) => d.value === value)?.label
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className={cn(
              "gap-1.5",
              value !== "all" && "border-foreground/25 bg-foreground/[0.03]"
            )}
          />
        }
      >
        <CalendarIcon className="text-muted-foreground" />
        {label}
        <ChevronDownIcon className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto min-w-44 rounded-xl" align="start">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(v) => onChange(v as DateRange)}
        >
          {DATE_RANGES.map((d) => (
            <DropdownMenuRadioItem key={d.value} value={d.value}>
              {d.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* --------------------------------- Pills ----------------------------------- */

const PILL_TONES = {
  green:
    "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300",
  red: "bg-red-500/10 text-red-700 ring-red-500/20 dark:text-red-300",
  amber: "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300",
  violet:
    "bg-violet-500/10 text-violet-700 ring-violet-500/20 dark:text-violet-300",
  sky: "bg-sky-500/10 text-sky-700 ring-sky-500/20 dark:text-sky-300",
  slate: "bg-muted text-muted-foreground ring-border",
} as const

export type PillTone = keyof typeof PILL_TONES

export function Pill({
  tone,
  icon: Icon,
  children,
  className,
}: {
  tone: PillTone
  icon?: LucideIcon
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
        PILL_TONES[tone],
        className
      )}
    >
      {Icon && <Icon className="size-3" />}
      {children}
    </span>
  )
}

/* ------------------------------- Pagination -------------------------------- */

export function usePagination<T>(
  items: T[],
  pageSize: number,
  resetKey: string
) {
  const [page, setPage] = React.useState(0)
  const [lastKey, setLastKey] = React.useState(resetKey)
  // Jump back to page 1 whenever filters change (derived during render, no effect needed).
  if (lastKey !== resetKey) {
    setLastKey(resetKey)
    setPage(0)
  }
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(page, pageCount - 1)
  return {
    page: safePage,
    pageCount,
    setPage,
    rows: items.slice(safePage * pageSize, safePage * pageSize + pageSize),
    from: items.length ? safePage * pageSize + 1 : 0,
    to: Math.min(items.length, (safePage + 1) * pageSize),
  }
}

export function Pager({
  page,
  pageCount,
  from,
  to,
  total,
  noun,
  onPage,
}: {
  page: number
  pageCount: number
  from: number
  to: number
  total: number
  noun: string
  onPage: (p: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm text-muted-foreground">
      <span className="tabular-nums">
        Showing {from}–{to} of {total} {noun}
      </span>
      {pageCount > 1 && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Previous page"
            disabled={page === 0}
            onClick={() => onPage(page - 1)}
          >
            <ChevronLeftIcon />
          </Button>
          <span className="min-w-14 text-center tabular-nums">
            {page + 1} / {pageCount}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Next page"
            disabled={page >= pageCount - 1}
            onClick={() => onPage(page + 1)}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------- Empty state ------------------------------- */

export function NoResults({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-2 px-6 py-16 text-center"
    >
      <SearchIcon className="size-7 text-muted-foreground" />
      <p className="font-medium">Nothing matches these filters</p>
      <Button variant="outline" size="sm" className="mt-1" onClick={onReset}>
        Clear all filters
      </Button>
    </motion.div>
  )
}
