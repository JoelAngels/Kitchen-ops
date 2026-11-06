"use client"

import * as React from "react"
import Link from "next/link"
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
} from "motion/react"
import {
  ArrowUpRightIcon,
  ClockIcon,
  LayoutGridIcon,
  ListIcon,
  PinIcon,
  SearchIcon,
  SearchXIcon,
  SettingsIcon,
  XIcon,
} from "lucide-react"

import { useAppState } from "@/components/app-state-provider"
import { PageHeader } from "@/components/page-header"
import { Segmented } from "@/components/segmented"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ALL_TOOLS,
  ROLES,
  TONE_CLASSES,
  TOOL_GROUPS,
  toolHref,
  type Tool,
} from "@/lib/tamu-data"
import { cn } from "@/lib/utils"

type View = "grid" | "list"

function matches(tool: Tool, q: string) {
  if (!q) return true
  const hay =
    `${tool.title} ${tool.description} ${tool.keywords?.join(" ") ?? ""}`.toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((word) => hay.includes(word))
}

export function ToolLauncher() {
  const { role, pinned, recent } = useAppState()
  const [query, setQuery] = React.useState("")
  const [view, setView] = React.useState<View>("grid")
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Restore the remembered view after mount.
  React.useEffect(() => {
    try {
      const v = window.localStorage.getItem("tamu:admin-view")
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (v === "grid" || v === "list") setView(v)
    } catch {}
  }, [])
  const changeView = (v: View) => {
    setView(v)
    try {
      window.localStorage.setItem("tamu:admin-view", v)
    } catch {}
  }

  // "/" or Ctrl/⌘+F focuses the search, Esc clears it.
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
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const allowed = ALL_TOOLS.filter((t) => t.roles.includes(role))
  const groups = TOOL_GROUPS.map((g) => ({
    ...g,
    tools: g.tools.filter((t) => t.roles.includes(role) && matches(t, query)),
  })).filter((g) => g.tools.length > 0)
  const resultCount = groups.reduce((n, g) => n + g.tools.length, 0)

  const pinnedTools = pinned
    .map((s) => allowed.find((t) => t.slug === s))
    .filter(Boolean) as Tool[]
  const recentTools = recent
    .map((s) => allowed.find((t) => t.slug === s))
    .filter(
      (t): t is (typeof allowed)[number] => !!t && !pinned.includes(t.slug)
    )
    .slice(0, 4)
  const roleLabel = ROLES.find((r) => r.id === role)?.label

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 lg:p-8">
      <PageHeader
        icon={SettingsIcon}
        title="Admin"
        description={`${allowed.length} tools available to ${roleLabel}s`}
        actions={
          <Segmented<View>
            ariaLabel="Layout"
            size="sm"
            value={view}
            onChange={changeView}
            options={[
              { value: "grid", label: <LayoutGridIcon className="size-3.5" /> },
              { value: "list", label: <ListIcon className="size-3.5" /> },
            ]}
          />
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="group/search relative"
      >
        <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within/search:text-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && setQuery("")}
          placeholder="Search tools — try “stock”, “kra” or “payroll”"
          aria-label="Search admin tools"
          className="h-12 w-full rounded-xl border bg-card pr-24 pl-11 text-sm shadow-xs transition-all outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-4 focus:ring-ring/15"
        />
        <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2">
          <AnimatePresence>
            {query && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                >
                  <XIcon />
                </Button>
              </motion.span>
            )}
          </AnimatePresence>
          <Kbd>/</Kbd>
        </div>
      </motion.div>

      <AnimatePresence mode="popLayout">
        {!query && (pinnedTools.length > 0 || recentTools.length > 0) && (
          <motion.section
            key="quick"
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid gap-4 overflow-hidden md:grid-cols-2"
          >
            <QuickRow
              title="Pinned"
              icon={PinIcon}
              tools={pinnedTools}
              empty="Pin tools you use daily."
            />
            <QuickRow
              title="Recently opened"
              icon={ClockIcon}
              tools={recentTools}
              empty="Tools you open show up here."
            />
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        {query && (
          <motion.p
            key="count"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="-mb-2 text-sm text-muted-foreground"
          >
            {resultCount} {resultCount === 1 ? "tool matches" : "tools match"} “
            {query}”
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-8">
        <AnimatePresence mode="popLayout">
          {groups.map((group, gi) => (
            <motion.section
              key={group.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { delay: 0.1 + gi * 0.05 },
              }}
              exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
              className="flex flex-col gap-3"
            >
              <motion.h2
                layout="position"
                className="flex items-center gap-2 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase"
              >
                <group.icon className="size-3.5" />
                {group.title}
                <span className="h-px flex-1 bg-border" />
              </motion.h2>
              <motion.div
                layout
                className={cn(
                  "grid gap-3",
                  view === "grid"
                    ? "sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                )}
              >
                <AnimatePresence mode="popLayout">
                  {group.tools.map((tool, ti) => (
                    <ToolCard
                      key={tool.slug}
                      tool={tool}
                      view={view}
                      delay={0.12 + gi * 0.05 + ti * 0.03}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </motion.section>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {resultCount === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16 text-center"
            >
              <SearchXIcon className="size-8 text-muted-foreground" />
              <p className="font-medium">No tools match “{query}”</p>
              <p className="text-sm text-muted-foreground">
                Check the spelling, or switch role from your profile menu.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function QuickRow({
  title,
  icon: Icon,
  tools,
  empty,
}: {
  title: string
  icon: React.ElementType
  tools: Tool[]
  empty: string
}) {
  const { trackRecent } = useAppState()
  return (
    <div className="flex flex-col gap-2 rounded-2xl border bg-card/60 p-3">
      <h2 className="flex items-center gap-1.5 px-1 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" />
        {title}
      </h2>
      {tools.length === 0 ? (
        <p className="px-1 py-2 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {tools.map((t) => (
              <motion.div
                key={t.slug}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Link
                  href={toolHref(t.slug)}
                  onClick={() => trackRecent(t.slug)}
                  className="flex items-center gap-2 rounded-lg border bg-background py-1.5 pr-3 pl-1.5 text-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-md ring-1",
                      TONE_CLASSES[t.tone]
                    )}
                  >
                    <t.icon className="size-3.5" />
                  </span>
                  {t.title}
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

function ToolCard({
  tool,
  view,
  delay,
}: {
  tool: Tool
  view: View
  delay: number
}) {
  const { pinned, togglePin, trackRecent } = useAppState()
  const isPinned = pinned.includes(tool.slug)
  const mx = useMotionValue(-200)
  const my = useMotionValue(-200)
  const spotlight = useMotionTemplate`radial-gradient(260px circle at ${mx}px ${my}px, color-mix(in oklch, var(--brand) 12%, transparent), transparent 70%)`

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { delay, type: "spring", stiffness: 340, damping: 28 },
      }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.15 } }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        mx.set(e.clientX - r.left)
        my.set(e.clientY - r.top)
      }}
      onPointerLeave={() => {
        mx.set(-200)
        my.set(-200)
      }}
      className="group/card relative overflow-hidden rounded-2xl border bg-card shadow-xs transition-[box-shadow,border-color] hover:border-foreground/15 hover:shadow-xl hover:shadow-foreground/5"
    >
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background: spotlight }}
      />
      <Link
        href={toolHref(tool.slug)}
        onClick={() => trackRecent(tool.slug)}
        className={cn(
          "relative flex gap-4 outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          view === "grid" ? "items-start p-5" : "items-center px-4 py-3"
        )}
      >
        <motion.span
          layout="position"
          className={cn(
            "flex shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover/card:scale-110 group-hover/card:-rotate-6",
            view === "grid" ? "size-11" : "size-9",
            TONE_CLASSES[tool.tone]
          )}
        >
          <tool.icon className={view === "grid" ? "size-5" : "size-4"} />
        </motion.span>
        <div className="min-w-0 flex-1 pr-6">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-medium">{tool.title}</h3>
            {tool.beta && (
              <Badge
                variant="secondary"
                className="h-4 bg-violet-500/10 px-1.5 text-[10px] tracking-wide text-violet-700 dark:text-violet-300"
              >
                BETA
              </Badge>
            )}
          </div>
          <p
            className={cn(
              "text-sm text-muted-foreground",
              view === "grid" ? "mt-1 line-clamp-2" : "truncate"
            )}
          >
            {tool.description}
          </p>
        </div>
        <ArrowUpRightIcon className="absolute top-4 right-4 size-4 -translate-x-1 translate-y-1 text-muted-foreground opacity-0 transition-all duration-300 group-hover/card:translate-x-0 group-hover/card:translate-y-0 group-hover/card:opacity-100" />
      </Link>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              aria-label={
                isPinned ? `Unpin ${tool.title}` : `Pin ${tool.title}`
              }
              aria-pressed={isPinned}
              onClick={() => togglePin(tool.slug)}
              className={cn(
                "absolute right-3 bottom-3 flex size-7 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-muted hover:text-foreground focus-visible:opacity-100",
                isPinned
                  ? "text-brand opacity-100"
                  : "opacity-0 group-hover/card:opacity-100"
              )}
            />
          }
        >
          <motion.span
            key={String(isPinned)}
            initial={{ scale: 0.4, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
          >
            <PinIcon className={cn("size-3.5", isPinned && "fill-current")} />
          </motion.span>
        </TooltipTrigger>
        <TooltipContent>{isPinned ? "Unpin" : "Pin to top"}</TooltipContent>
      </Tooltip>
    </motion.div>
  )
}
