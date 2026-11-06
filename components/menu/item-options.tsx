"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  ChevronDownIcon,
  ChevronRightIcon,
  Link2Icon,
  ListChecksIcon,
  PlusIcon,
  TagIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { SearchField } from "@/components/data/table-kit"
import { PageHeader } from "@/components/page-header"
import { Segmented } from "@/components/segmented"
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
import { Switch } from "@/components/ui/switch"
import { INITIAL_MENU, type MenuItem } from "@/lib/mock/menu"
import {
  INITIAL_OPTIONS,
  MODIFIER_CATEGORIES,
  nextId,
  type ModifierGroup,
  type ModifierOption,
} from "@/lib/mock/modifiers"
import { formatKES } from "@/lib/tamu-data"
import { cn } from "@/lib/utils"

type Filter = "with" | "without" | "all"
type Options = Record<string, ModifierGroup[]>

const MENU_ITEMS = INITIAL_MENU.filter((c) => c.visible).flatMap((c) =>
  c.items.filter((i) => i.visible).map((i) => ({ ...i, category: c.name }))
)
const itemName = (id: string | null) =>
  MENU_ITEMS.find((i) => i.id === id)?.name

export function ItemOptions() {
  const [options, setOptions] = React.useState<Options>(INITIAL_OPTIONS)
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<Filter>("with")
  const [open, setOpen] = React.useState<string | null>(null)
  const [bulk, setBulk] = React.useState(false)
  const [showCats, setShowCats] = React.useState(false)

  const has = (id: string) => (options[id]?.length ?? 0) > 0
  const withCount = MENU_ITEMS.filter((i) => has(i.id)).length
  const q = query.trim().toLowerCase()

  const visible = MENU_ITEMS.filter((i) => {
    if (filter === "with" && !has(i.id)) return false
    if (filter === "without" && has(i.id)) return false
    if (!q) return true
    const optionNames = (options[i.id] ?? []).flatMap((g) => [
      g.name,
      ...g.options.map((o) => o.name),
    ])
    return [i.name, i.category, ...optionNames].some((s) =>
      s.toLowerCase().includes(q)
    )
  })
  const grouped = [...new Set(visible.map((i) => i.category))].map((cat) => ({
    cat,
    items: visible.filter((i) => i.category === cat),
  }))

  const setGroups = (itemId: string, groups: ModifierGroup[]) =>
    setOptions((o) => ({ ...o, [itemId]: groups }))

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 lg:p-8">
      <PageHeader
        icon={ListChecksIcon}
        title="Item Options"
        description="Variants, add-ons and removals for your menu items"
        back={{ href: "/admin", label: "Back to Admin" }}
        actions={
          <Button onClick={() => setBulk(true)}>
            <PlusIcon />
            Add to many items
          </Button>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="flex flex-col gap-3 md:flex-row md:items-center"
      >
        <div className="flex-1">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search dishes or options…"
          />
        </div>
        <Segmented<Filter>
          ariaLabel="Filter"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "with", label: `With options (${withCount})` },
            {
              value: "without",
              label: `Without (${MENU_ITEMS.length - withCount})`,
            },
            { value: "all", label: "All" },
          ]}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="overflow-hidden rounded-2xl border bg-card shadow-xs"
      >
        <button
          type="button"
          onClick={() => setShowCats((s) => !s)}
          className="flex w-full items-center gap-2 px-4 py-3 text-left"
        >
          <TagIcon className="size-4 text-muted-foreground" />
          <span className="font-medium">Option types</span>
          <span className="text-sm text-muted-foreground">
            {MODIFIER_CATEGORIES.length} types
          </span>
          <ChevronDownIcon
            className={cn(
              "ml-auto size-4 text-muted-foreground transition-transform duration-300",
              showCats && "rotate-180"
            )}
          />
        </button>
        <AnimatePresence initial={false}>
          {showCats && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid gap-2 border-t p-4 sm:grid-cols-2">
                {MODIFIER_CATEGORIES.map((c) => {
                  const groups = Object.values(options)
                    .flat()
                    .filter((g) => g.categoryId === c.id).length
                  return (
                    <div key={c.id} className="rounded-xl border p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{c.name}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          used {groups}×
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {c.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="overflow-hidden rounded-2xl border bg-card shadow-xs"
      >
        {grouped.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {q
              ? `Nothing matches “${query}”.`
              : "Every dish already has options."}
          </p>
        ) : (
          grouped.map(({ cat, items }) => (
            <section key={cat}>
              <h2 className="border-y bg-muted/40 px-4 py-2 text-xs font-medium tracking-wider text-muted-foreground uppercase first:border-t-0">
                {cat}
              </h2>
              <ul className="divide-y">
                {items.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    groups={options[item.id] ?? []}
                    open={open === item.id}
                    onToggle={() =>
                      setOpen((o) => (o === item.id ? null : item.id))
                    }
                    onChange={(g) => setGroups(item.id, g)}
                  />
                ))}
              </ul>
            </section>
          ))
        )}
      </motion.div>

      <BulkDialog
        open={bulk}
        onClose={() => setBulk(false)}
        onApply={(group, itemIds) => {
          setOptions((o) => {
            const next = { ...o }
            for (const id of itemIds) {
              next[id] = [
                ...(next[id] ?? []),
                {
                  ...group,
                  id: nextId("grp"),
                  options: group.options.map((op) => ({
                    ...op,
                    id: nextId("opt"),
                  })),
                },
              ]
            }
            return next
          })
          toast.success(
            `“${group.name}” added to ${itemIds.length} ${itemIds.length === 1 ? "dish" : "dishes"}`
          )
          setBulk(false)
        }}
      />
    </div>
  )
}

function OptionChip({
  option,
  required,
}: {
  option: ModifierOption
  required: boolean
}) {
  const linked = !!option.linkedItemId
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs whitespace-nowrap",
        linked
          ? "bg-violet-500/10 text-violet-700 ring-1 ring-violet-500/20 dark:text-violet-300"
          : "bg-muted text-muted-foreground"
      )}
    >
      {linked && <Link2Icon className="size-3" />}
      {option.name}
      {option.price > 0 && <span className="opacity-70">+{option.price}</span>}
      {required && (
        <span className="text-red-500" title="Required">
          *
        </span>
      )}
    </span>
  )
}

function ItemRow({
  item,
  groups,
  open,
  onToggle,
  onChange,
}: {
  item: MenuItem & { category: string }
  groups: ModifierGroup[]
  open: boolean
  onToggle: () => void
  onChange: (g: ModifierGroup[]) => void
}) {
  const updateGroup = (id: string, patch: Partial<ModifierGroup>) =>
    onChange(groups.map((g) => (g.id === id ? { ...g, ...patch } : g)))

  return (
    <li className={cn(open && "bg-muted/20")}>
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <ChevronRightIcon
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-300",
              open && "rotate-90"
            )}
          />
          <span className="shrink-0 font-medium">{item.name}</span>
          <span className="flex min-w-0 flex-wrap gap-1">
            {groups.length === 0 ? (
              <span className="text-xs text-muted-foreground">No options</span>
            ) : (
              groups.flatMap((g) =>
                g.options.map((o) => (
                  <OptionChip key={o.id} option={o} required={g.required} />
                ))
              )
            )}
          </span>
        </button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Add options to ${item.name}`}
          onClick={onToggle}
          className="shrink-0 text-sky-600 dark:text-sky-400"
        >
          <PlusIcon />
        </Button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-4 px-4 pb-4 sm:pl-10">
              <AnimatePresence initial={false}>
                {groups.map((g) => (
                  <motion.div
                    key={g.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl border bg-card"
                  >
                    <GroupEditor
                      group={g}
                      onChange={(p) => updateGroup(g.id, p)}
                      onDelete={() => {
                        onChange(groups.filter((x) => x.id !== g.id))
                        toast(`Removed “${g.name}” from ${item.name}`, {
                          action: {
                            label: "Undo",
                            onClick: () => onChange(groups),
                          },
                        })
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              <Button
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() =>
                  onChange([
                    ...groups,
                    {
                      id: nextId("grp"),
                      name: "New group",
                      categoryId: "variants",
                      required: false,
                      min: 0,
                      max: 1,
                      options: [],
                    },
                  ])
                }
              >
                <PlusIcon />
                Add option group
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

function GroupEditor({
  group: g,
  onChange,
  onDelete,
}: {
  group: ModifierGroup
  onChange: (p: Partial<ModifierGroup>) => void
  onDelete: () => void
}) {
  const [name, setName] = React.useState("")
  const [price, setPrice] = React.useState("")
  const [linked, setLinked] = React.useState("")

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    const n = name.trim() || itemName(linked) || ""
    if (!n) return
    onChange({
      options: [
        ...g.options,
        {
          id: nextId("opt"),
          name: n,
          price: Number(price) || 0,
          linkedItemId: linked || null,
        },
      ],
    })
    setName("")
    setPrice("")
    setLinked("")
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-3 py-2">
        <Input
          value={g.name}
          onChange={(e) => onChange({ name: e.target.value })}
          aria-label="Group name"
          className="h-7 w-44 font-medium"
        />
        <select
          value={g.categoryId}
          onChange={(e) => onChange({ categoryId: e.target.value })}
          aria-label="Option type"
          className="h-7 rounded-md border bg-background px-2 text-xs"
        >
          {MODIFIER_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-xs">
          <Switch
            size="sm"
            checked={g.required}
            onCheckedChange={(v) => onChange({ required: v, min: v ? 1 : 0 })}
          />
          Required
        </label>
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          Up to
          <Input
            type="number"
            min={1}
            value={g.max}
            onChange={(e) =>
              onChange({ max: Math.max(1, Number(e.target.value) || 1) })
            }
            className="h-7 w-14 text-center"
            aria-label="Maximum picks"
          />
          {g.max === 1 ? "pick" : "picks"}
        </label>
        <Button
          variant="ghost"
          size="icon-sm"
          className="ml-auto text-muted-foreground hover:text-destructive"
          aria-label={`Delete ${g.name}`}
          onClick={onDelete}
        >
          <Trash2Icon />
        </Button>
      </div>
      <ol className="divide-y">
        <AnimatePresence initial={false}>
          {g.options.map((o, i) => (
            <motion.li
              key={o.id}
              layout
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="group flex items-center gap-3 px-3 py-2 text-sm"
            >
              <span className="w-6 text-xs text-muted-foreground tabular-nums">
                #{i + 1}
              </span>
              <span className="flex-1">{o.name}</span>
              {o.linkedItemId && (
                <span
                  className="inline-flex items-center gap-1 rounded-md bg-violet-500/10 px-1.5 py-0.5 text-xs text-violet-700 dark:text-violet-300"
                  title="Also sends this dish to the kitchen"
                >
                  <Link2Icon className="size-3" />
                  {itemName(o.linkedItemId)}
                </span>
              )}
              <span className="w-20 text-right text-xs text-muted-foreground tabular-nums">
                {o.price ? `+${formatKES(o.price)}` : "Free"}
              </span>
              <button
                type="button"
                aria-label={`Remove ${o.name}`}
                onClick={() =>
                  onChange({ options: g.options.filter((x) => x.id !== o.id) })
                }
                className="flex size-6 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted hover:text-foreground focus-visible:opacity-100"
              >
                <XIcon className="size-3.5" />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
      <form
        onSubmit={add}
        className="flex flex-wrap gap-2 border-t bg-muted/30 p-2"
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New option, e.g. Extra Hot"
          className="h-8 min-w-40 flex-1"
          aria-label="Option name"
        />
        <Input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
          min={0}
          placeholder="+ KSh"
          className="h-8 w-24"
          aria-label="Extra price"
        />
        <select
          value={linked}
          onChange={(e) => setLinked(e.target.value)}
          aria-label="Link to a menu item"
          className="h-8 max-w-48 rounded-lg border bg-background px-2 text-sm text-muted-foreground"
        >
          <option value="">No linked dish</option>
          {MENU_ITEMS.map((i) => (
            <option key={i.id} value={i.id}>
              🔗 {i.name}
            </option>
          ))}
        </select>
        <Button
          type="submit"
          size="sm"
          disabled={!name.trim() && !linked}
          className="h-8"
        >
          Add
        </Button>
      </form>
    </div>
  )
}

function BulkDialog({
  open,
  onClose,
  onApply,
}: {
  open: boolean
  onClose: () => void
  onApply: (group: ModifierGroup, itemIds: string[]) => void
}) {
  const [name, setName] = React.useState("Leave out")
  const [opts, setOpts] = React.useState("No Cheese, No Onions")
  const [required, setRequired] = React.useState(false)
  const [picked, setPicked] = React.useState<string[]>([])
  const categories = [...new Set(MENU_ITEMS.map((i) => i.category))]

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add an option group to many dishes</DialogTitle>
          <DialogDescription>
            Handy for removals or sides that every burger shares.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-[1fr_auto] items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bulk-name">Group name</Label>
              <Input
                id="bulk-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <label className="flex h-8 items-center gap-2 text-sm">
              <Switch
                size="sm"
                checked={required}
                onCheckedChange={setRequired}
              />
              Required
            </label>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bulk-opts">Options, separated by commas</Label>
            <Input
              id="bulk-opts"
              value={opts}
              onChange={(e) => setOpts(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Dishes ({picked.length} picked)</Label>
            <div className="max-h-60 overflow-y-auto rounded-xl border p-2">
              {categories.map((cat) => {
                const ids = MENU_ITEMS.filter((i) => i.category === cat).map(
                  (i) => i.id
                )
                const allIn = ids.every((id) => picked.includes(id))
                return (
                  <div key={cat} className="mb-2 last:mb-0">
                    <label className="flex items-center gap-2 px-1 py-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                      <Checkbox
                        checked={allIn}
                        onCheckedChange={(c) =>
                          setPicked((p) =>
                            c
                              ? [...new Set([...p, ...ids])]
                              : p.filter((x) => !ids.includes(x))
                          )
                        }
                      />
                      {cat}
                    </label>
                    {MENU_ITEMS.filter((i) => i.category === cat).map((i) => (
                      <label
                        key={i.id}
                        className="flex items-center gap-2 rounded-md px-1 py-1 pl-6 text-sm hover:bg-muted"
                      >
                        <Checkbox
                          checked={picked.includes(i.id)}
                          onCheckedChange={(c) =>
                            setPicked((p) =>
                              c ? [...p, i.id] : p.filter((x) => x !== i.id)
                            )
                          }
                        />
                        {i.name}
                      </label>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!picked.length || !name.trim() || !opts.trim()}
            onClick={() => {
              const list = opts
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
              onApply(
                {
                  id: "",
                  name: name.trim(),
                  categoryId: required ? "variants" : "removals",
                  required,
                  min: required ? 1 : 0,
                  max: required ? 1 : list.length,
                  options: list.map((o) => ({
                    id: "",
                    name: o,
                    price: 0,
                    linkedItemId: null,
                  })),
                },
                picked
              )
              setPicked([])
            }}
          >
            Add to {picked.length || "…"}{" "}
            {picked.length === 1 ? "dish" : "dishes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
