"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  ArrowRightLeftIcon,
  BellRingIcon,
  BikeIcon,
  CalendarIcon,
  ChartColumnIcon,
  ChefHatIcon,
  ClockIcon,
  MailIcon,
  MessageCircleIcon,
  ReceiptTextIcon,
  SearchIcon,
  ShieldCheckIcon,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/page-header"
import { Segmented } from "@/components/segmented"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { cn } from "@/lib/utils"

type Freq = "daily" | "weekly" | "monthly" | "live"

type Report = {
  id: string
  title: string
  description: string
  icon: LucideIcon
  iconClass: string
  freqs: Freq[]
}

const REPORTS: Report[] = [
  {
    id: "sales",
    title: "Sales Summary",
    description: "Revenue, orders, discounts, VAT and category split",
    icon: ChartColumnIcon,
    iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    freqs: ["daily", "weekly", "monthly"],
  },
  {
    id: "kitchen",
    title: "Kitchen Performance",
    description: "Ticket times, items made, hourly breakdown",
    icon: ChefHatIcon,
    iconClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    freqs: ["daily", "weekly", "monthly"],
  },
  {
    id: "adjustments",
    title: "Adjustments",
    description: "Moves, comps, wastage and tab changes",
    icon: ArrowRightLeftIcon,
    iconClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    freqs: ["daily", "weekly", "monthly"],
  },
  {
    id: "wastage",
    title: "Wastage Overrides",
    description:
      "AI-check overrides waiting for a director, and who overrode what",
    icon: ShieldCheckIcon,
    iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    freqs: ["daily", "weekly", "monthly"],
  },
  {
    id: "tabs",
    title: "Open Tabs",
    description: "Tabs left open overnight: totals, balances, split payments",
    icon: ReceiptTextIcon,
    iconClass: "bg-red-500/10 text-red-600 dark:text-red-400",
    freqs: ["daily", "weekly"],
  },
  {
    id: "delivery",
    title: "Delivery Performance",
    description: "This week's deliveries compared with the weeks before",
    icon: BikeIcon,
    iconClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    freqs: ["weekly"],
  },
  {
    id: "sentiment",
    title: "WhatsApp Customer Sentiment",
    description:
      "How customers felt, what went wrong, and whether complaints were handled",
    icon: MessageCircleIcon,
    iconClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    freqs: ["weekly", "monthly"],
  },
  {
    id: "waiting",
    title: "Customers Waiting for a Reply",
    description:
      "An alert when a WhatsApp customer has waited too long for the team",
    icon: BellRingIcon,
    iconClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    freqs: ["live"],
  },
]

type Person = { id: string; name: string; email: string; role: string }

const PEOPLE: Person[] = [
  {
    id: "joel",
    name: "Joel Angel",
    email: "joel@tastygrubs.co.ke",
    role: "Admin",
  },
  {
    id: "wanjiku",
    name: "Wanjiku Mwangi",
    email: "wanjiku@tastygrubs.co.ke",
    role: "Manager",
  },
  {
    id: "brian",
    name: "Brian Otieno",
    email: "brian@tastygrubs.co.ke",
    role: "Head chef",
  },
  {
    id: "amina",
    name: "Amina Hassan",
    email: "amina@tastygrubs.co.ke",
    role: "Accountant",
  },
  {
    id: "kevin",
    name: "Kevin Kamau",
    email: "kevin@tastygrubs.co.ke",
    role: "Director",
  },
]

const FREQ_LABEL: Record<Freq, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  live: "As it happens",
}
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

type Sub = {
  recipients: string[]
  time: string
  weekday: number
  monthDay: number
}
type Subs = Record<string, Sub>
const key = (reportId: string, f: Freq) => `${reportId}:${f}`
const EMPTY_SUB: Sub = {
  recipients: [],
  time: "07:00",
  weekday: 0,
  monthDay: 1,
}

const INITIAL: Subs = {
  [key("sales", "daily")]: {
    recipients: ["joel", "wanjiku"],
    time: "07:00",
    weekday: 0,
    monthDay: 1,
  },
  [key("sales", "monthly")]: {
    recipients: ["amina", "kevin"],
    time: "08:00",
    weekday: 0,
    monthDay: 1,
  },
  [key("kitchen", "weekly")]: {
    recipients: ["brian"],
    time: "09:00",
    weekday: 0,
    monthDay: 1,
  },
  [key("tabs", "daily")]: {
    recipients: ["wanjiku"],
    time: "06:30",
    weekday: 0,
    monthDay: 1,
  },
}

function schedule(f: Freq, s: Sub) {
  if (f === "live") return "Sent the moment it happens"
  if (f === "daily") return `Every day at ${s.time}`
  if (f === "weekly") return `Every ${WEEKDAYS[s.weekday]} at ${s.time}`
  const suffix =
    s.monthDay === 1
      ? "st"
      : s.monthDay === 2
        ? "nd"
        : s.monthDay === 3
          ? "rd"
          : "th"
  return `On the ${s.monthDay}${suffix} at ${s.time}`
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)

export function ReportSubscriptions() {
  const [view, setView] = React.useState<"report" | "person">("report")
  const [subs, setSubs] = React.useState<Subs>(INITIAL)
  const [editing, setEditing] = React.useState<{
    report: Report
    freq: Freq
  } | null>(null)

  const save = (reportId: string, f: Freq, sub: Sub) =>
    setSubs((prev) => {
      const next = { ...prev }
      if (sub.recipients.length) next[key(reportId, f)] = sub
      else delete next[key(reportId, f)]
      return next
    })

  const togglePersonSub = (personId: string, report: Report, f: Freq) => {
    const current = subs[key(report.id, f)] ?? EMPTY_SUB
    const has = current.recipients.includes(personId)
    save(report.id, f, {
      ...current,
      recipients: has
        ? current.recipients.filter((r) => r !== personId)
        : [...current.recipients, personId],
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-4 lg:p-8">
      <PageHeader
        icon={MailIcon}
        title="Report Subscriptions"
        description="Who gets which email report, and how often"
        back={{ href: "/admin", label: "Back to Admin" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <Segmented
          ariaLabel="Group by"
          value={view}
          onChange={setView}
          options={[
            { value: "report", label: "By report" },
            { value: "person", label: "By person" },
          ]}
        />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="flex flex-col gap-3"
        >
          {view === "report"
            ? REPORTS.map((report, i) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  subs={subs}
                  index={i}
                  onEdit={(freq) => setEditing({ report, freq })}
                />
              ))
            : PEOPLE.map((person, i) => (
                <PersonCard
                  key={person.id}
                  person={person}
                  subs={subs}
                  index={i}
                  onToggle={togglePersonSub}
                />
              ))}
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <ClockIcon className="size-3.5" />
          Sent in your restaurant&apos;s local time (Nairobi)
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarIcon className="size-3.5" />A monthly report set past a short
          month&apos;s end goes out on its last day
        </span>
      </div>

      <EditDialog
        target={editing}
        sub={editing ? subs[key(editing.report.id, editing.freq)] : undefined}
        onClose={() => setEditing(null)}
        onSave={(sub) => {
          if (!editing) return
          save(editing.report.id, editing.freq, sub)
          toast.success(
            sub.recipients.length
              ? `${editing.report.title} · ${FREQ_LABEL[editing.freq]} goes to ${sub.recipients.length} ${sub.recipients.length === 1 ? "person" : "people"}`
              : `${editing.report.title} · ${FREQ_LABEL[editing.freq]} stopped`
          )
          setEditing(null)
        }}
      />
    </div>
  )
}

function ReportCard({
  report,
  subs,
  index,
  onEdit,
}: {
  report: Report
  subs: Subs
  index: number
  onEdit: (f: Freq) => void
}) {
  const active = report.freqs.filter((f) => subs[key(report.id, f)])
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.04 }}
      className="overflow-hidden rounded-2xl border bg-card shadow-xs"
    >
      <header className="flex flex-wrap items-start gap-x-3 gap-y-2 border-b p-4">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            report.iconClass
          )}
        >
          <report.icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">{report.title}</h2>
          <p className="text-sm text-muted-foreground">{report.description}</p>
        </div>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={active.join()}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={cn(
              "order-last flex w-full shrink-0 items-center gap-1.5 pl-[52px] text-xs sm:order-none sm:w-auto sm:pl-0",
              active.length
                ? "font-medium text-success"
                : "text-muted-foreground"
            )}
          >
            {active.length > 0 && (
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-60" />
                <span className="relative size-2 rounded-full bg-success" />
              </span>
            )}
            {active.length
              ? `Sending ${active.map((f) => FREQ_LABEL[f].toLowerCase()).join(", ")}`
              : "Not being sent"}
          </motion.span>
        </AnimatePresence>
      </header>
      <ul className="divide-y">
        {report.freqs.map((f) => {
          const sub = subs[key(report.id, f)]
          const people = sub
            ? PEOPLE.filter((p) => sub.recipients.includes(p.id))
            : []
          return (
            <li key={f} className="flex items-center gap-4 px-4 py-3">
              <div className="w-28 shrink-0">
                <div className="text-sm font-medium">{FREQ_LABEL[f]}</div>
                {sub && (
                  <div className="text-xs text-muted-foreground">
                    {schedule(f, sub).replace("Every day", "Daily")}
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {people.length ? (
                  <>
                    <div className="flex -space-x-2">
                      <AnimatePresence initial={false}>
                        {people.slice(0, 4).map((p) => (
                          <motion.span
                            key={p.id}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            title={p.name}
                          >
                            <Avatar className="size-7 ring-2 ring-card">
                              <AvatarFallback className="text-[10px]">
                                {initials(p.name)}
                              </AvatarFallback>
                            </Avatar>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </div>
                    <span className="truncate text-sm">
                      {people.map((p) => p.name.split(" ")[0]).join(", ")}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No recipients
                  </span>
                )}
              </div>
              <Button
                variant={sub ? "outline" : "ghost"}
                size="sm"
                onClick={() => onEdit(f)}
              >
                {sub ? "Edit" : "Set up"}
              </Button>
            </li>
          )
        })}
      </ul>
    </motion.section>
  )
}

function PersonCard({
  person,
  subs,
  index,
  onToggle,
}: {
  person: Person
  subs: Subs
  index: number
  onToggle: (personId: string, report: Report, f: Freq) => void
}) {
  const count = Object.values(subs).filter((s) =>
    s.recipients.includes(person.id)
  ).length
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.05 }}
      className="overflow-hidden rounded-2xl border bg-card shadow-xs"
    >
      <header className="flex items-center gap-3 border-b p-4">
        <Avatar className="size-10">
          <AvatarFallback>{initials(person.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">{person.name}</h2>
          <p className="truncate text-sm text-muted-foreground">
            {person.role} · {person.email}
          </p>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {count} {count === 1 ? "report" : "reports"}
        </span>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="px-4 py-2 font-medium">Report</th>
              {(["daily", "weekly", "monthly", "live"] as Freq[]).map((f) => (
                <th key={f} className="px-2 py-2 text-center font-medium">
                  {FREQ_LABEL[f]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {REPORTS.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-2">
                  <span className="flex items-center gap-2">
                    <r.icon className="size-4 text-muted-foreground" />
                    {r.title}
                  </span>
                </td>
                {(["daily", "weekly", "monthly", "live"] as Freq[]).map((f) => (
                  <td key={f} className="px-2 py-2 text-center">
                    {r.freqs.includes(f) ? (
                      <Checkbox
                        aria-label={`${r.title} ${FREQ_LABEL[f]} for ${person.name}`}
                        checked={
                          !!subs[key(r.id, f)]?.recipients.includes(person.id)
                        }
                        onCheckedChange={() => onToggle(person.id, r, f)}
                        className="mx-auto"
                      />
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  )
}

function EditDialog({
  target,
  sub,
  onClose,
  onSave,
}: {
  target: { report: Report; freq: Freq } | null
  sub: Sub | undefined
  onClose: () => void
  onSave: (sub: Sub) => void
}) {
  const [draft, setDraft] = React.useState<Sub>(EMPTY_SUB)
  const [search, setSearch] = React.useState("")
  const [shown, setShown] = React.useState(target)
  // Reset the draft whenever a different report/frequency is opened.
  if (target && target !== shown) {
    setShown(target)
    setDraft(sub ?? EMPTY_SUB)
    setSearch("")
  }
  const t = target ?? shown
  const people = PEOPLE.filter((p) =>
    `${p.name} ${p.email} ${p.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        {t && (
          <>
            <DialogHeader>
              <DialogTitle>
                {t.report.title} · {FREQ_LABEL[t.freq]}
              </DialogTitle>
              <DialogDescription>{schedule(t.freq, draft)}</DialogDescription>
            </DialogHeader>

            {t.freq !== "live" && (
              <div className="flex flex-wrap items-end gap-3">
                {t.freq === "weekly" && (
                  <div className="flex flex-col gap-1.5">
                    <Label>Day</Label>
                    <Segmented<string>
                      size="sm"
                      ariaLabel="Weekday"
                      value={String(draft.weekday)}
                      onChange={(v) =>
                        setDraft({ ...draft, weekday: Number(v) })
                      }
                      options={WEEKDAYS.map((d, i) => ({
                        value: String(i),
                        label: d,
                      }))}
                    />
                  </div>
                )}
                {t.freq === "monthly" && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="monthDay">Day of month</Label>
                    <Input
                      id="monthDay"
                      type="number"
                      min={1}
                      max={31}
                      value={draft.monthDay}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          monthDay: Math.min(
                            31,
                            Math.max(1, Number(e.target.value) || 1)
                          ),
                        })
                      }
                      className="w-24"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="sendTime">Send at</Label>
                  <Input
                    id="sendTime"
                    type="time"
                    value={draft.time}
                    onChange={(e) =>
                      setDraft({ ...draft, time: e.target.value || "07:00" })
                    }
                    className="w-32 dark:[color-scheme:dark]"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label>Recipients</Label>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Find a person"
                  className="pl-8"
                />
              </div>
              <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
                {people.map((p) => {
                  const checked = draft.recipients.includes(p.id)
                  return (
                    <li key={p.id}>
                      <label
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted",
                          checked && "bg-muted/60"
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(c) =>
                            setDraft({
                              ...draft,
                              recipients: c
                                ? [...draft.recipients, p.id]
                                : draft.recipients.filter((r) => r !== p.id),
                            })
                          }
                        />
                        <Avatar className="size-7">
                          <AvatarFallback className="text-[10px]">
                            {initials(p.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="flex min-w-0 flex-col">
                          <span className="text-sm font-medium">{p.name}</span>
                          <span className="truncate text-xs text-muted-foreground">
                            {p.role} · {p.email}
                          </span>
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </div>

            <DialogFooter className="sm:justify-between">
              {sub ? (
                <Button
                  variant="destructive"
                  onClick={() => onSave({ ...draft, recipients: [] })}
                >
                  Stop sending
                </Button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={() => onSave(draft)}
                  disabled={!draft.recipients.length && !sub}
                >
                  Save
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
