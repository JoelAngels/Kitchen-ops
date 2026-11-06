"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  ClockIcon,
  CopyIcon,
  GiftIcon,
  GlobeIcon,
  KeyRoundIcon,
  LeafIcon,
  LockIcon,
  MoonIcon,
  PlusIcon,
  PrinterIcon,
  SettingsIcon,
  SunsetIcon,
  Trash2Icon,
  XIcon,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/page-header"
import { Segmented } from "@/components/segmented"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { DEFAULT_COMP_REASONS } from "@/lib/mock/adjustments"
import { cn } from "@/lib/utils"

/* ---------------------------------- Model ---------------------------------- */

type DayHours = { open: boolean; from: string; to: string }
type Shift = { id: string; name: string; from: string; to: string }
type Reason = {
  id: string
  label: string
  needsNote: boolean
  inUse: boolean
  locked: boolean
}
type ReasonSection = { id: string; title: string; reasons: Reason[] }
type DietLabel = { id: string; letter: string; name: string; color: LabelColor }
type LabelColor =
  "sky" | "emerald" | "amber" | "teal" | "rose" | "violet" | "orange"

type Settings = {
  receipt: { paper: "80mm" | "58mm"; text: "normal" | "large" }
  hours: { dinein: DayHours[]; takeaway: DayHours[] }
  shifts: Shift[]
  comps: ReasonSection[]
  labels: DietLabel[]
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const LABEL_COLORS: Record<LabelColor, string> = {
  sky: "bg-sky-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  teal: "bg-teal-500",
  rose: "bg-rose-500",
  violet: "bg-violet-500",
  orange: "bg-orange-500",
}

let idSeq = 0
const nid = (p: string) => `${p}_${++idSeq}`

const INITIAL: Settings = {
  receipt: { paper: "80mm", text: "normal" },
  hours: {
    dinein: DAYS.map((_, i) => ({
      open: true,
      from: i === 6 ? "11:00" : "10:00",
      to: i >= 4 ? "23:00" : "22:00",
    })),
    takeaway: DAYS.map((_, i) => ({
      open: true,
      from: "10:30",
      to: i >= 4 ? "00:30" : "22:30",
    })),
  },
  shifts: [
    { id: "s1", name: "Lunch", from: "11:00", to: "15:00" },
    { id: "s2", name: "Dinner", from: "17:00", to: "22:00" },
    { id: "s3", name: "Late", from: "22:00", to: "02:00" },
  ],
  comps: DEFAULT_COMP_REASONS.map((s, si) => ({
    id: `sec${si}`,
    title: s.section,
    reasons: s.reasons.map((r, ri) => ({
      id: `r${si}_${ri}`,
      label: r.label,
      needsNote: !!r.needsNote,
      inUse: true,
      locked: !!r.locked,
    })),
  })),
  labels: [
    { id: "l1", letter: "D", name: "Dairy", color: "sky" },
    { id: "l2", letter: "V", name: "Vegetarian", color: "emerald" },
    { id: "l3", letter: "N", name: "Nuts", color: "amber" },
    { id: "l4", letter: "F", name: "Fish", color: "teal" },
    { id: "l5", letter: "P", name: "Pork", color: "rose" },
  ],
}

const SECTIONS: { id: string; title: string; icon: LucideIcon }[] = [
  { id: "online", title: "Online orders", icon: GlobeIcon },
  { id: "pins", title: "Manager & admin PINs", icon: KeyRoundIcon },
  { id: "receipt", title: "Receipt format", icon: PrinterIcon },
  { id: "hours", title: "Operating hours", icon: ClockIcon },
  { id: "shifts", title: "Shifts / dayparts", icon: SunsetIcon },
  { id: "comps", title: "Comp reasons", icon: GiftIcon },
  { id: "labels", title: "Dietary labels", icon: LeafIcon },
]

/* ---------------------------------- Page ----------------------------------- */

export function RestaurantSettings() {
  const [saved, setSaved] = React.useState<Settings>(INITIAL)
  const [draft, setDraft] = React.useState<Settings>(INITIAL)
  const [online, setOnline] = React.useState(true)
  const [activeSection, setActiveSection] = React.useState(SECTIONS[0].id)
  const dirty = React.useMemo(
    () => JSON.stringify(saved) !== JSON.stringify(draft),
    [saved, draft]
  )

  // Scroll-spy: highlight the section nearest the top of the viewport.
  React.useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      Boolean
    ) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveSection(visible[0].target.id)
      },
      { rootMargin: "-80px 0px -60% 0px" }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  // Warn before leaving with unsaved changes.
  React.useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [dirty])

  const update = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    setDraft((d) => ({ ...d, [k]: v }))

  const save = () => {
    const blank =
      draft.comps.flatMap((s) => s.reasons).some((r) => !r.label.trim()) ||
      draft.shifts.some((s) => !s.name.trim())
    if (blank) {
      toast.error("Some names are empty", {
        description: "Fill in or delete the empty shift or comp reason first.",
      })
      return
    }
    setSaved(draft)
    toast.success("Settings saved")
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 pb-28 lg:p-8 lg:pb-28">
      <PageHeader
        icon={SettingsIcon}
        title="Restaurant Settings"
        description="Hours, receipts, comps and the other house rules"
        back={{ href: "/admin", label: "Back to Admin" }}
      />

      {/* Mobile section chips */}
      <nav
        className="-mx-4 flex gap-1.5 overflow-x-auto px-4 lg:hidden"
        aria-label="Sections"
      >
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-sm whitespace-nowrap transition-colors",
              activeSection === s.id
                ? "border-foreground bg-foreground text-background"
                : "text-muted-foreground"
            )}
          >
            {s.title}
          </a>
        ))}
      </nav>

      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <nav
          className="sticky top-20 hidden h-fit flex-col gap-0.5 lg:flex"
          aria-label="Sections"
        >
          {SECTIONS.map((s, i) => {
            const active = activeSection === s.id
            return (
              <motion.a
                key={s.id}
                href={`#${s.id}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.03 }}
                className={cn(
                  "relative isolate flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="settings-nav"
                    className="absolute inset-0 -z-10 rounded-lg bg-muted"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <s.icon className="size-4" />
                {s.title}
              </motion.a>
            )
          })}
        </nav>

        <div className="flex min-w-0 flex-col gap-4">
          <OnlineOrders online={online} setOnline={setOnline} />
          <PinsSection />
          <ReceiptSection
            value={draft.receipt}
            onChange={(v) => update("receipt", v)}
          />
          <HoursSection
            value={draft.hours}
            onChange={(v) => update("hours", v)}
          />
          <ShiftsSection
            value={draft.shifts}
            onChange={(v) => update("shifts", v)}
          />
          <CompsSection
            value={draft.comps}
            onChange={(v) => update("comps", v)}
          />
          <LabelsSection
            value={draft.labels}
            onChange={(v) => update("labels", v)}
          />
        </div>
      </div>

      <AnimatePresence>
        {dirty && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed inset-x-0 bottom-[calc(1rem+var(--safe-bottom))] z-40 flex justify-center px-4"
          >
            <div className="flex w-full max-w-lg items-center gap-3 rounded-2xl border bg-foreground py-2.5 pr-2.5 pl-4 text-background shadow-2xl">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-brand opacity-70" />
                <span className="relative size-2 rounded-full bg-brand" />
              </span>
              <span className="flex-1 text-sm font-medium">
                You have unsaved changes
              </span>
              <Button
                variant="ghost"
                className="text-background hover:bg-background/10 hover:text-background"
                onClick={() => setDraft(saved)}
              >
                Discard
              </Button>
              <Button
                className="bg-background text-foreground hover:bg-background/90"
                onClick={save}
              >
                Save changes
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* --------------------------------- Shells ---------------------------------- */

function Section({
  id,
  description,
  aside,
  children,
}: {
  id: string
  description?: React.ReactNode
  aside?: React.ReactNode
  children?: React.ReactNode
}) {
  const meta = SECTIONS.find((s) => s.id === id)!
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="scroll-mt-20 rounded-2xl border bg-card p-5 shadow-xs"
    >
      <header className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <meta.icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">{meta.title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {aside}
      </header>
      {children && <div className="mt-5">{children}</div>}
    </motion.section>
  )
}

/* -------------------------------- Sections --------------------------------- */

function OnlineOrders({
  online,
  setOnline,
}: {
  online: boolean
  setOnline: (v: boolean) => void
}) {
  return (
    <Section
      id="online"
      description="Pickup and Glovo delivery from your ordering page. Takes effect immediately."
      aside={
        <Switch
          checked={online}
          onCheckedChange={(v) => {
            setOnline(v)
            if (v) toast.success("Online ordering is back on")
            else
              toast.warning("Online ordering paused", {
                description:
                  "The website and WhatsApp bot stop taking new orders.",
              })
          }}
          className="mt-1 data-checked:bg-success"
          aria-label="Accept online orders"
        />
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={String(online)}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
            online
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          )}
        >
          <span
            className={cn(
              "size-2 rounded-full",
              online ? "bg-success" : "bg-destructive"
            )}
          />
          {online
            ? "Accepting new online orders"
            : "Paused: customers see “ordering is closed”"}
        </motion.div>
      </AnimatePresence>
    </Section>
  )
}

function PinsSection() {
  return (
    <Section
      id="pins"
      description={
        <>
          Each admin and manager sets their own 6-digit PIN from{" "}
          <a
            href="#"
            className="hit-area font-medium text-foreground underline underline-offset-2"
          >
            My Profile
          </a>
          . Manager PINs approve day-to-day overrides; admin PINs also approve
          refunds, comps, menu changes and settings.
        </>
      }
    />
  )
}

function ReceiptSection({
  value,
  onChange,
}: {
  value: Settings["receipt"]
  onChange: (v: Settings["receipt"]) => void
}) {
  const large = value.text === "large"
  return (
    <Section
      id="receipt"
      description="Match the paper to your till roll so totals print in full. Use Large text if printouts are faint."
    >
      <div className="grid gap-6 md:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-4">
          <SettingRow title="Paper size" hint="The width of your till roll">
            <Segmented
              size="sm"
              ariaLabel="Paper size"
              value={value.paper}
              onChange={(paper) => onChange({ ...value, paper })}
              options={[
                { value: "80mm", label: "80mm" },
                { value: "58mm", label: "58mm" },
              ]}
            />
          </SettingRow>
          <SettingRow
            title="Text size"
            hint="Large helps when the printer is faint"
          >
            <Segmented
              size="sm"
              ariaLabel="Text size"
              value={value.text}
              onChange={(text) => onChange({ ...value, text })}
              options={[
                { value: "normal", label: "Normal" },
                { value: "large", label: "Large" },
              ]}
            />
          </SettingRow>
        </div>
        {/* Live preview */}
        <div className="flex justify-center rounded-xl bg-muted/60 p-4">
          <motion.div
            animate={{ width: value.paper === "80mm" ? 220 : 160 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative overflow-hidden bg-white [mask-image:linear-gradient(to_bottom,black_85%,transparent)] px-3 pt-3 pb-5 font-mono text-neutral-900 shadow-md"
          >
            <motion.div
              animate={{ fontSize: large ? 12 : 10 }}
              className="flex flex-col gap-1 leading-tight"
            >
              <div className="text-center font-bold">SUPREME KILIMANI</div>
              <div className="text-center opacity-60">Order #2139 · 13:23</div>
              <div className="my-1 border-t border-dashed border-neutral-400" />
              {[
                ["1x Classic Smash", "850"],
                ["2x Loaded Fries", "1,100"],
                ["1x Oreo Shake", "600"],
              ].map(([a, b]) => (
                <div key={a} className="flex justify-between gap-2">
                  <span className="truncate">{a}</span>
                  <span>{b}</span>
                </div>
              ))}
              <div className="my-1 border-t border-dashed border-neutral-400" />
              <div className="flex justify-between font-bold">
                <span>TOTAL</span>
                <span>KSh 2,550</span>
              </div>
              <div className="opacity-60">M-Pesa UK4561AU4B</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Section>
  )
}

function SettingRow({
  title,
  hint,
  children,
}: {
  title: string
  hint: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
      {children}
    </div>
  )
}

function HoursSection({
  value,
  onChange,
}: {
  value: Settings["hours"]
  onChange: (v: Settings["hours"]) => void
}) {
  const [mode, setMode] = React.useState<"dinein" | "takeaway">("dinein")
  const days = value[mode]
  const setDays = (next: DayHours[]) => onChange({ ...value, [mode]: next })
  const setDay = (i: number, patch: Partial<DayHours>) =>
    setDays(days.map((d, j) => (j === i ? { ...d, ...patch } : d)))

  return (
    <Section
      id="hours"
      description="Dine-in and takeaway can differ. The WhatsApp bot and online ordering use takeaway hours to know when to accept orders."
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Segmented
          ariaLabel="Service"
          value={mode}
          onChange={setMode}
          options={[
            { value: "dinein", label: "Dine-in" },
            { value: "takeaway", label: "Takeaway & delivery" },
          ]}
        />
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDays(days.map(() => ({ ...days[0] })))
              toast(
                `Monday's hours copied to every ${mode === "dinein" ? "dine-in" : "takeaway"} day`
              )
            }}
          >
            <CopyIcon />
            Monday to all days
          </Button>
          {mode === "takeaway" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange({
                  ...value,
                  takeaway: value.dinein.map((d) => ({ ...d })),
                })
                toast("Copied dine-in hours to takeaway")
              }}
            >
              <CopyIcon />
              Copy from dine-in
            </Button>
          )}
        </div>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.ul
          key={mode}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="mt-3 flex flex-col divide-y rounded-xl border"
        >
          {days.map((d, i) => {
            const overnight = d.open && d.to <= d.from
            return (
              <li
                key={DAYS[i]}
                className="flex flex-wrap items-center gap-3 px-3 py-2"
              >
                <Switch
                  size="sm"
                  checked={d.open}
                  onCheckedChange={(open) => setDay(i, { open })}
                  aria-label={`Open on ${DAYS[i]}`}
                />
                <span
                  className={cn(
                    "w-10 text-sm font-medium",
                    !d.open && "text-muted-foreground"
                  )}
                >
                  {DAYS[i]}
                </span>
                <AnimatePresence mode="wait" initial={false}>
                  {d.open ? (
                    <motion.div
                      key="open"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <TimeInput
                        value={d.from}
                        onChange={(from) => setDay(i, { from })}
                        label={`${DAYS[i]} opens`}
                      />
                      <span className="text-sm text-muted-foreground">to</span>
                      <TimeInput
                        value={d.to}
                        onChange={(to) => setDay(i, { to })}
                        label={`${DAYS[i]} closes`}
                      />
                      {overnight && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MoonIcon className="size-3" />
                          next day
                        </span>
                      )}
                    </motion.div>
                  ) : (
                    <motion.span
                      key="closed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-muted-foreground italic"
                    >
                      Closed
                    </motion.span>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </motion.ul>
      </AnimatePresence>
    </Section>
  )
}

function TimeInput({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (v: string) => void
  label: string
}) {
  return (
    <input
      type="time"
      aria-label={label}
      value={value}
      onChange={(e) => e.target.value && onChange(e.target.value)}
      className="h-8 rounded-md border bg-background px-2 text-sm tabular-nums outline-none focus:ring-2 focus:ring-ring/40 dark:[color-scheme:dark]"
    />
  )
}

function ShiftsSection({
  value,
  onChange,
}: {
  value: Shift[]
  onChange: (v: Shift[]) => void
}) {
  const set = (id: string, patch: Partial<Shift>) =>
    onChange(value.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  return (
    <Section
      id="shifts"
      description="Time-of-day windows. Sales analytics breaks revenue down by these. A window ending before it starts runs past midnight."
    >
      <ul className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {value.map((s) => (
            <motion.li
              key={s.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap items-center gap-2 overflow-hidden"
            >
              <Input
                value={s.name}
                onChange={(e) => set(s.id, { name: e.target.value })}
                placeholder="Shift name"
                className="w-40"
                aria-label="Shift name"
              />
              <TimeInput
                value={s.from}
                onChange={(from) => set(s.id, { from })}
                label={`${s.name} starts`}
              />
              <span className="text-sm text-muted-foreground">to</span>
              <TimeInput
                value={s.to}
                onChange={(to) => set(s.id, { to })}
                label={`${s.name} ends`}
              />
              {s.to <= s.from && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MoonIcon className="size-3" />
                  overnight
                </span>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                className="ml-auto"
                aria-label={`Delete ${s.name}`}
                onClick={() => onChange(value.filter((x) => x.id !== s.id))}
              >
                <Trash2Icon />
              </Button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {value.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          No shifts. The dayparts card is hidden in Analytics.
        </p>
      )}
      <Button
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={() =>
          onChange([
            ...value,
            { id: nid("shift"), name: "", from: "12:00", to: "16:00" },
          ])
        }
      >
        <PlusIcon />
        Add shift
      </Button>
    </Section>
  )
}

function CompsSection({
  value,
  onChange,
}: {
  value: ReasonSection[]
  onChange: (v: ReasonSection[]) => void
}) {
  const [newSection, setNewSection] = React.useState<string | null>(null)
  const inUse = value.flatMap((s) => s.reasons).filter((r) => r.inUse).length
  const setSection = (id: string, reasons: Reason[]) =>
    onChange(value.map((s) => (s.id === id ? { ...s, reasons } : s)))

  return (
    <Section
      id="comps"
      description={`What staff pick when they comp an item. The sign-off email groups by these, so name what actually happens. ${inUse} in use.`}
    >
      <div className="flex flex-col gap-5">
        {value.map((section) => (
          <div key={section.id} className="flex flex-col gap-1.5">
            <h3 className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              {section.title}
            </h3>
            <ul className="flex flex-col">
              <AnimatePresence initial={false}>
                {section.reasons.map((r) => {
                  const patch = (p: Partial<Reason>) =>
                    setSection(
                      section.id,
                      section.reasons.map((x) =>
                        x.id === r.id ? { ...x, ...p } : x
                      )
                    )
                  return (
                    <motion.li
                      key={r.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        className={cn(
                          "flex flex-wrap items-center gap-x-4 gap-y-1 py-1",
                          !r.inUse && "opacity-55"
                        )}
                      >
                        <Input
                          value={r.label}
                          onChange={(e) => patch({ label: e.target.value })}
                          placeholder="Reason"
                          aria-label="Comp reason"
                          autoFocus={!r.label}
                          className="h-8 min-w-48 flex-1"
                        />
                        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Checkbox
                            checked={r.needsNote}
                            onCheckedChange={(c) => patch({ needsNote: !!c })}
                          />
                          Needs a note
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Switch
                            size="sm"
                            checked={r.inUse}
                            onCheckedChange={(c) => patch({ inUse: c })}
                          />
                          In use
                        </label>
                        {r.locked ? (
                          <span
                            className="flex size-7 items-center justify-center text-muted-foreground"
                            title="Built-in reason, can't be deleted"
                          >
                            <LockIcon className="size-3.5" />
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Delete ${r.label || "reason"}`}
                            onClick={() =>
                              setSection(
                                section.id,
                                section.reasons.filter((x) => x.id !== r.id)
                              )
                            }
                          >
                            <Trash2Icon />
                          </Button>
                        )}
                      </div>
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </ul>
            <Button
              variant="ghost"
              size="sm"
              className="w-fit text-muted-foreground"
              onClick={() =>
                setSection(section.id, [
                  ...section.reasons,
                  {
                    id: nid("reason"),
                    label: "",
                    needsNote: false,
                    inUse: true,
                    locked: false,
                  },
                ])
              }
            >
              <PlusIcon />
              Add reason
            </Button>
          </div>
        ))}

        <AnimatePresence mode="wait" initial={false}>
          {newSection === null ? (
            <motion.div
              key="btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNewSection("")}
              >
                <PlusIcon />
                Add section
              </Button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                if (!newSection.trim()) return
                onChange([
                  ...value,
                  { id: nid("sec"), title: newSection.trim(), reasons: [] },
                ])
                setNewSection(null)
              }}
            >
              <Input
                autoFocus
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                placeholder="Section name, e.g. Events"
                className="h-8 max-w-64"
              />
              <Button type="submit" size="sm">
                Add
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setNewSection(null)}
              >
                Cancel
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </Section>
  )
}

function LabelsSection({
  value,
  onChange,
}: {
  value: DietLabel[]
  onChange: (v: DietLabel[]) => void
}) {
  const [name, setName] = React.useState("")
  const [color, setColor] = React.useState<LabelColor>("violet")

  return (
    <Section
      id="labels"
      description="The little markers next to a dish (D Dairy, V Vegetarian) shown on the menu and set per item in the menu editor."
    >
      <ul className="flex flex-wrap gap-2">
        <AnimatePresence initial={false} mode="popLayout">
          {value.map((l) => (
            <motion.li
              key={l.id}
              layout
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="group flex items-center gap-2 rounded-full border bg-background py-1 pr-1.5 pl-1 text-sm"
            >
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-white",
                  LABEL_COLORS[l.color]
                )}
              >
                {l.letter}
              </span>
              {l.name}
              <button
                type="button"
                aria-label={`Remove ${l.name}`}
                onClick={() => onChange(value.filter((x) => x.id !== l.id))}
                className="hit-area flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <XIcon className="size-3" />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <form
        className="mt-4 flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          const n = name.trim()
          if (!n) return
          if (value.some((l) => l.name.toLowerCase() === n.toLowerCase())) {
            toast.error(`“${n}” already exists`)
            return
          }
          onChange([
            ...value,
            { id: nid("label"), letter: n[0].toUpperCase(), name: n, color },
          ])
          setName("")
        }}
      >
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-full text-xs font-bold text-white transition-colors",
            LABEL_COLORS[color]
          )}
        >
          {name.trim()[0]?.toUpperCase() ?? "?"}
        </span>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New label, e.g. Gluten-free"
          className="h-8 w-52"
          aria-label="New label name"
        />
        <div className="flex gap-1" role="radiogroup" aria-label="Label colour">
          {(Object.keys(LABEL_COLORS) as LabelColor[]).map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={color === c}
              aria-label={c}
              onClick={() => setColor(c)}
              className={cn(
                "hit-area size-5 rounded-full transition-transform hover:scale-110",
                LABEL_COLORS[c],
                color === c &&
                  "ring-2 ring-foreground ring-offset-2 ring-offset-card"
              )}
            />
          ))}
        </div>
        <Button
          type="submit"
          size="sm"
          variant="outline"
          disabled={!name.trim()}
        >
          <PlusIcon />
          Add label
        </Button>
      </form>
    </Section>
  )
}
