"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  BanIcon,
  ChevronDownIcon,
  EyeIcon,
  EyeOffIcon,
  FolderPlusIcon,
  GlobeIcon,
  GripVerticalIcon,
  PencilIcon,
  PlusIcon,
  SquareMenuIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { SearchField } from "@/components/data/table-kit"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DIETARY_LABELS,
  INITIAL_MENU,
  type MenuCategory,
  type MenuItem,
} from "@/lib/mock/menu"
import { formatNumber } from "@/lib/format"
import { formatKES } from "@/lib/tamu-data"
import { cn } from "@/lib/utils"

type Editing = { item: MenuItem | null; categoryId: string } | null

export function PosMenu() {
  const [menu, setMenu] = React.useState<MenuCategory[]>(INITIAL_MENU)
  const [query, setQuery] = React.useState("")
  const [showHidden, setShowHidden] = React.useState(false)
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set())
  const [editing, setEditing] = React.useState<Editing>(null)
  const [newCategory, setNewCategory] = React.useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const q = query.trim().toLowerCase()
  const searching = q.length > 0
  const totalItems = menu.reduce((s, c) => s + c.items.length, 0)
  const hiddenCount = menu.reduce(
    (s, c) =>
      s + (c.visible ? 0 : 1) + c.items.filter((i) => !i.visible).length,
    0
  )
  const outCount = menu.reduce(
    (s, c) => s + c.items.filter((i) => i.eightySixed).length,
    0
  )

  const visibleMenu = menu
    .filter((c) => showHidden || c.visible)
    .map((c) => ({
      ...c,
      items: c.items.filter(
        (i) =>
          (showHidden || i.visible) &&
          (!searching ||
            `${i.name} ${i.description} ${c.name}`.toLowerCase().includes(q))
      ),
    }))
    .filter((c) => !searching || c.items.length > 0)

  /* ------------------------------ Mutations ------------------------------ */

  const updateCategory = (id: string, patch: Partial<MenuCategory>) =>
    setMenu((m) => m.map((c) => (c.id === id ? { ...c, ...patch } : c)))

  const updateItem = (
    categoryId: string,
    itemId: string,
    patch: Partial<MenuItem>
  ) =>
    setMenu((m) =>
      m.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              items: c.items.map((i) =>
                i.id === itemId ? { ...i, ...patch } : i
              ),
            }
          : c
      )
    )

  const deleteItem = (categoryId: string, item: MenuItem) => {
    const snapshot = menu
    setMenu((m) =>
      m.map((c) =>
        c.id === categoryId
          ? { ...c, items: c.items.filter((i) => i.id !== item.id) }
          : c
      )
    )
    toast(`Deleted “${item.name}”`, {
      action: { label: "Undo", onClick: () => setMenu(snapshot) },
    })
  }

  const saveItem = (categoryId: string, item: MenuItem) => {
    setMenu((m) => {
      // Remove from wherever it lives now (it may have changed category), then insert.
      const stripped = m.map((c) => ({
        ...c,
        items: c.items.filter((i) => i.id !== item.id),
      }))
      const existingCat = m.find((c) => c.items.some((i) => i.id === item.id))
      return stripped.map((c) => {
        if (c.id !== categoryId) return c
        if (existingCat?.id === categoryId) {
          const idx = existingCat.items.findIndex((i) => i.id === item.id)
          const items = [...c.items]
          items.splice(idx, 0, item)
          return { ...c, items }
        }
        return { ...c, items: [...c.items, item] }
      })
    })
    toast.success(
      editing?.item ? `Saved “${item.name}”` : `Added “${item.name}”`
    )
    setEditing(null)
  }

  const onCategoryDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    setMenu((m) =>
      arrayMove(
        m,
        m.findIndex((c) => c.id === active.id),
        m.findIndex((c) => c.id === over.id)
      )
    )
  }

  const onItemDragEnd =
    (categoryId: string) =>
    ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) return
      setMenu((m) =>
        m.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                items: arrayMove(
                  c.items,
                  c.items.findIndex((i) => i.id === active.id),
                  c.items.findIndex((i) => i.id === over.id)
                ),
              }
            : c
        )
      )
    }

  const toggleCollapse = (id: string) =>
    setCollapsed((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 lg:p-8">
      <PageHeader
        icon={SquareMenuIcon}
        title="POS Menu"
        description={`Dishes for the ordering system · ${totalItems} items${outCount ? ` · ${outCount} 86'd` : ""}`}
        back={{ href: "/admin", label: "Back to Admin" }}
        actions={
          <>
            <Button variant="outline" onClick={() => setNewCategory("")}>
              <FolderPlusIcon />
              Add category
            </Button>
            <Button
              onClick={() => setEditing({ item: null, categoryId: menu[0].id })}
            >
              <PlusIcon />
              Add item
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
          placeholder="Search dishes, descriptions or categories…"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"
      >
        <label className="flex items-center gap-2">
          <Switch
            size="sm"
            checked={showHidden}
            onCheckedChange={setShowHidden}
          />
          Show hidden ({hiddenCount})
        </label>
        <button
          type="button"
          className="hit-area text-muted-foreground transition-colors hover:text-foreground"
          onClick={() =>
            setCollapsed(
              collapsed.size ? new Set() : new Set(menu.map((c) => c.id))
            )
          }
        >
          {collapsed.size ? "Expand all" : "Collapse all"}
        </button>
        <span className="ml-auto hidden text-xs text-muted-foreground sm:block">
          {searching
            ? "Clear the search to drag and reorder"
            : "Drag the handles to reorder categories and dishes"}
        </span>
      </motion.div>

      <AnimatePresence>
        {newCategory !== null && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
            onSubmit={(e) => {
              e.preventDefault()
              const name = newCategory.trim()
              if (!name) return
              setMenu((m) => [
                {
                  id: `cat_${Date.now()}`,
                  name,
                  emoji: "🍽️",
                  visible: true,
                  items: [],
                },
                ...m,
              ])
              setNewCategory(null)
              toast.success(`Added category “${name}”`)
            }}
          >
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed bg-card p-3">
              <span className="text-xl">🍽️</span>
              <Input
                autoFocus
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Category name, e.g. Breakfast"
                className="h-8 max-w-72"
              />
              <Button type="submit" size="sm">
                Add
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setNewCategory(null)}
              >
                Cancel
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {visibleMenu.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          No dishes match “{query}”.
        </div>
      ) : (
        <DndContext
          id="menu-categories"
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={onCategoryDragEnd}
        >
          <SortableContext
            items={visibleMenu.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3">
              {visibleMenu.map((cat, ci) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  fullCount={menu.find((c) => c.id === cat.id)!.items.length}
                  index={ci}
                  dragDisabled={searching}
                  collapsed={!searching && collapsed.has(cat.id)}
                  onToggleCollapse={() => toggleCollapse(cat.id)}
                  onUpdate={(p) => updateCategory(cat.id, p)}
                  onDelete={() => {
                    setMenu((m) => m.filter((c) => c.id !== cat.id))
                    toast(`Deleted category “${cat.name}”`)
                  }}
                  onAddItem={() =>
                    setEditing({ item: null, categoryId: cat.id })
                  }
                >
                  <DndContext
                    id={`menu-items-${cat.id}`}
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    modifiers={[
                      restrictToVerticalAxis,
                      restrictToParentElement,
                    ]}
                    onDragEnd={onItemDragEnd(cat.id)}
                  >
                    <SortableContext
                      items={cat.items.map((i) => i.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <ul className="relative">
                        {cat.items.map((it) => (
                          <ItemRow
                            key={it.id}
                            item={it}
                            dragDisabled={searching}
                            onEdit={() =>
                              setEditing({ item: it, categoryId: cat.id })
                            }
                            onUpdate={(p) => updateItem(cat.id, it.id, p)}
                            onDelete={() => deleteItem(cat.id, it)}
                          />
                        ))}
                      </ul>
                    </SortableContext>
                  </DndContext>
                </CategoryCard>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ItemSheet
        editing={editing}
        categories={menu}
        onClose={() => setEditing(null)}
        onSave={saveItem}
      />
    </div>
  )
}

/* -------------------------------- Category --------------------------------- */

function CategoryCard({
  category: c,
  fullCount,
  index,
  dragDisabled,
  collapsed,
  onToggleCollapse,
  onUpdate,
  onDelete,
  onAddItem,
  children,
}: {
  category: MenuCategory
  fullCount: number
  index: number
  dragDisabled: boolean
  collapsed: boolean
  onToggleCollapse: () => void
  onUpdate: (p: Partial<MenuCategory>) => void
  onDelete: () => void
  onAddItem: () => void
  children: React.ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: c.id,
    disabled: dragDisabled,
  })
  const [renaming, setRenaming] = React.useState(false)
  const [name, setName] = React.useState(c.name)

  return (
    // Entrance animation lives on a wrapper so it never fights dnd-kit's drag transform.
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { delay: Math.min(0.18 + index * 0.04, 0.6) },
      }}
      className={cn("relative", isDragging && "z-20")}
    >
      <section
        ref={setNodeRef}
        style={{ transform: CSS.Translate.toString(transform), transition }}
        className={cn(
          "relative overflow-hidden rounded-2xl border bg-card shadow-xs",
          isDragging && "shadow-2xl ring-2 ring-brand/40",
          !c.visible && "border-dashed"
        )}
      >
        <header className="flex items-center gap-2 border-b bg-muted/30 px-2 py-2.5 sm:px-3">
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            disabled={dragDisabled}
            aria-label={`Reorder ${c.name}`}
            className="flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground/60 hover:bg-muted hover:text-foreground active:cursor-grabbing disabled:cursor-default disabled:opacity-30"
          >
            <GripVerticalIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand" : "Collapse"}
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <ChevronDownIcon
              className={cn(
                "size-4 transition-transform duration-300",
                collapsed && "-rotate-90"
              )}
            />
          </button>
          <span className="text-lg leading-none">{c.emoji}</span>
          {renaming ? (
            <form
              className="flex items-center gap-1"
              onSubmit={(e) => {
                e.preventDefault()
                if (name.trim()) onUpdate({ name: name.trim() })
                setRenaming(false)
              }}
            >
              <Input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setRenaming(false)}
                className="h-7 w-48"
              />
            </form>
          ) : (
            <h2
              className={cn(
                "font-semibold",
                !c.visible && "text-muted-foreground"
              )}
            >
              {c.name}
            </h2>
          )}
          {!c.visible && (
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
              Hidden
            </span>
          )}
          <span className="mr-1 ml-auto hidden text-xs text-muted-foreground tabular-nums sm:inline">
            {fullCount} {fullCount === 1 ? "item" : "items"}
          </span>
          <IconAction
            label={c.visible ? "Hide category" : "Show category"}
            onClick={() => onUpdate({ visible: !c.visible })}
          >
            {c.visible ? <EyeIcon /> : <EyeOffIcon />}
          </IconAction>
          <IconAction
            label="Rename"
            onClick={() => {
              setName(c.name)
              setRenaming(true)
            }}
          >
            <PencilIcon />
          </IconAction>
          <IconAction label="Add item here" onClick={onAddItem}>
            <PlusIcon />
          </IconAction>
          <IconAction
            label={
              fullCount ? "Move or delete its items first" : "Delete category"
            }
            onClick={onDelete}
            disabled={fullCount > 0}
            destructive
          >
            <Trash2Icon />
          </IconAction>
        </header>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="hidden grid-cols-[28px_44px_1fr_110px_56px_90px_150px_64px] items-center gap-3 border-b px-3 py-1.5 text-[11px] tracking-wider text-muted-foreground uppercase md:grid">
                <span />
                <span />
                <span>Item</span>
                <span>Subcategory</span>
                <span>Type</span>
                <span className="text-right">Price</span>
                <span>Status</span>
                <span />
              </div>
              {fullCount === 0 ? (
                <button
                  type="button"
                  onClick={onAddItem}
                  className="flex w-full items-center justify-center gap-2 py-8 text-sm text-muted-foreground hover:text-foreground"
                >
                  <PlusIcon className="size-4" />
                  Add the first dish
                </button>
              ) : (
                children
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </motion.div>
  )
}

function IconAction({
  label,
  onClick,
  disabled,
  destructive,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  destructive?: boolean
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            onClick={onClick}
            disabled={disabled}
            className={cn(
              destructive && "hover:bg-destructive/10 hover:text-destructive"
            )}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/* ---------------------------------- Item ----------------------------------- */

function ItemRow({
  item: it,
  dragDisabled,
  onEdit,
  onUpdate,
  onDelete,
}: {
  item: MenuItem
  dragDisabled: boolean
  onEdit: () => void
  onUpdate: (p: Partial<MenuItem>) => void
  onDelete: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: it.id,
    disabled: dragDisabled,
  })
  const [editingPrice, setEditingPrice] = React.useState(false)

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "group relative grid grid-cols-[28px_44px_1fr_auto] items-center gap-3 border-b bg-card px-3 py-2 last:border-0 md:grid-cols-[28px_44px_1fr_110px_56px_90px_150px_64px]",
        isDragging && "z-10 rounded-lg shadow-xl ring-2 ring-brand/40",
        !it.visible && "bg-muted/30"
      )}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        disabled={dragDisabled}
        aria-label={`Reorder ${it.name}`}
        className="flex size-7 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground/40 opacity-60 group-hover:opacity-100 hover:bg-muted hover:text-foreground active:cursor-grabbing disabled:opacity-20"
      >
        <GripVerticalIcon className="size-4" />
      </button>
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-xl bg-muted text-2xl transition-transform group-hover:scale-105",
          (it.eightySixed || !it.visible) && "grayscale"
        )}
      >
        {it.emoji}
      </span>
      <button
        type="button"
        onClick={onEdit}
        className="min-w-0 text-left outline-none"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "font-medium hover:underline",
              !it.visible && "text-muted-foreground"
            )}
          >
            {it.name}
          </span>
          {!it.online && (
            <span className="inline-flex items-center gap-0.5 rounded bg-red-500/10 px-1 text-[10px] font-medium text-red-600 dark:text-red-400">
              <GlobeIcon className="size-2.5" />
              Not online
            </span>
          )}
          {it.labels.map((l) => {
            const meta = DIETARY_LABELS.find((d) => d.id === l)
            return (
              <span
                key={l}
                title={meta?.name}
                className={cn(
                  "flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-white",
                  meta?.className
                )}
              >
                {l}
              </span>
            )
          })}
        </div>
        {it.description && (
          <p className="truncate text-xs text-muted-foreground">
            {it.description}
          </p>
        )}
      </button>
      <span className="hidden md:block">
        {it.subcategory ? (
          <span className="rounded-md border px-1.5 py-0.5 text-xs">
            {it.subcategory}
          </span>
        ) : (
          <span className="text-muted-foreground/50">—</span>
        )}
      </span>
      <span className="hidden text-xs text-muted-foreground md:block">
        {it.type}
      </span>
      <span className="hidden text-right md:block">
        {editingPrice ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setEditingPrice(false)
            }}
          >
            <Input
              autoFocus
              type="number"
              min={0}
              defaultValue={it.price}
              onBlur={(e) => {
                const v = Number(e.target.value)
                if (v >= 0 && v !== it.price) {
                  onUpdate({ price: v })
                  toast.success(`${it.name} now ${formatKES(v)}`)
                }
                setEditingPrice(false)
              }}
              onKeyDown={(e) => e.key === "Escape" && setEditingPrice(false)}
              className="h-7 w-24 text-right tabular-nums"
              aria-label={`Price of ${it.name}`}
            />
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setEditingPrice(true)}
            title="Click to change price"
            className="rounded-md px-1.5 py-0.5 font-semibold tabular-nums transition-colors hover:bg-muted"
          >
            {formatNumber(it.price)}
          </button>
        )}
      </span>
      <div className="col-span-2 col-start-3 flex flex-wrap items-center gap-1.5 md:col-span-1 md:col-start-auto">
        <span className="mr-1 font-semibold tabular-nums md:hidden">
          {formatKES(it.price)}
        </span>
        <StatusToggle
          on={it.visible}
          onClick={() => onUpdate({ visible: !it.visible })}
          onLabel="Visible"
          offLabel="Hidden"
          onIcon={EyeIcon}
          offIcon={EyeOffIcon}
          onClass="bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300"
        />
        <StatusToggle
          on={!it.eightySixed}
          onClick={() => {
            onUpdate({ eightySixed: !it.eightySixed })
            toast(
              it.eightySixed
                ? `${it.name} is back on`
                : `${it.name} 86'd: sold out until you turn it back on`
            )
          }}
          onLabel="86"
          offLabel="86'd"
          onIcon={BanIcon}
          offIcon={BanIcon}
          onClass="text-muted-foreground ring-border"
          offClass="bg-red-500/15 text-red-700 ring-red-500/30 dark:text-red-300"
          title={
            it.eightySixed
              ? "Sold out. Click to bring it back"
              : "Mark as sold out"
          }
        />
      </div>
      <div className="flex justify-end gap-0.5 max-md:col-start-4 max-md:row-start-1">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Edit ${it.name}`}
          onClick={onEdit}
        >
          <PencilIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Delete ${it.name}`}
          onClick={onDelete}
          className="text-red-600 hover:bg-destructive/10 hover:text-destructive dark:text-red-400"
        >
          <Trash2Icon />
        </Button>
      </div>
    </li>
  )
}

function StatusToggle({
  on,
  onClick,
  onLabel,
  offLabel,
  onIcon: OnIcon,
  offIcon: OffIcon,
  onClass,
  offClass = "bg-muted text-muted-foreground ring-border",
  title,
}: {
  on: boolean
  onClick: () => void
  onLabel: string
  offLabel: string
  onIcon: React.ElementType
  offIcon: React.ElementType
  onClass: string
  offClass?: string
  title?: string
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={on}
      whileTap={{ scale: 0.92 }}
      className={cn(
        "hit-area inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 transition-colors ring-inset",
        on ? onClass : offClass
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={String(on)}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -6, opacity: 0 }}
          className="inline-flex items-center gap-1"
        >
          {on ? <OnIcon className="size-3" /> : <OffIcon className="size-3" />}
          {on ? onLabel : offLabel}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

/* ------------------------------- Item editor ------------------------------- */

const BLANK: MenuItem = {
  id: "",
  name: "",
  description: "",
  price: 0,
  emoji: "🍽️",
  subcategory: null,
  type: "F&B",
  visible: true,
  online: true,
  eightySixed: false,
  labels: [],
}

const EMOJI_CHOICES = [
  "🍔",
  "🍗",
  "🌶️",
  "🍟",
  "🥗",
  "🥤",
  "🧃",
  "🥛",
  "🍹",
  "🍦",
  "🍯",
  "💧",
  "🍽️",
]

function ItemSheet({
  editing,
  categories,
  onClose,
  onSave,
}: {
  editing: Editing
  categories: MenuCategory[]
  onClose: () => void
  onSave: (categoryId: string, item: MenuItem) => void
}) {
  const [draft, setDraft] = React.useState<MenuItem>(BLANK)
  const [categoryId, setCategoryId] = React.useState("")
  const [shown, setShown] = React.useState(editing)
  if (editing && editing !== shown) {
    setShown(editing)
    setDraft(
      editing.item ?? {
        ...BLANK,
        emoji:
          categories.find((c) => c.id === editing.categoryId)?.emoji ?? "🍽️",
      }
    )
    setCategoryId(editing.categoryId)
  }
  const isNew = !(editing ?? shown)?.item

  return (
    <Sheet open={!!editing} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <form
          className="flex min-h-full flex-col"
          onSubmit={(e) => {
            e.preventDefault()
            if (!draft.name.trim()) return toast.error("Give the dish a name")
            onSave(categoryId, {
              ...draft,
              name: draft.name.trim(),
              id: draft.id || `item_${Date.now()}`,
            })
          }}
        >
          <SheetHeader className="border-b">
            <SheetTitle>
              {isNew ? "Add a dish" : `Edit ${draft.name || "dish"}`}
            </SheetTitle>
            <SheetDescription>
              Changes show on tills and the website as soon as you save.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="flex flex-col gap-1.5">
              <Label>Picture</Label>
              <div className="flex flex-wrap gap-1.5">
                {EMOJI_CHOICES.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setDraft({ ...draft, emoji: e })}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-lg bg-muted text-xl transition-transform hover:scale-110",
                      draft.emoji === e && "ring-2 ring-foreground"
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Photo uploads arrive with the backend.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item-name">Name</Label>
              <Input
                id="item-name"
                autoFocus
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="The Solo Supreme"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item-desc">Description</Label>
              <Textarea
                id="item-desc"
                rows={3}
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
                placeholder="What's in it, in one line"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="item-price">Price (KSh)</Label>
                <Input
                  id="item-price"
                  type="number"
                  min={0}
                  value={draft.price || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, price: Number(e.target.value) })
                  }
                  placeholder="1400"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="item-cat">Category</Label>
                <select
                  id="item-cat"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="h-8 rounded-lg border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="item-sub">Subcategory</Label>
                <Input
                  id="item-sub"
                  value={draft.subcategory ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, subcategory: e.target.value || null })
                  }
                  placeholder="Optional"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Type</Label>
                <div className="flex gap-1">
                  {(["F&B", "Retail"] as const).map((t) => (
                    <Button
                      key={t}
                      type="button"
                      size="sm"
                      variant={draft.type === t ? "default" : "outline"}
                      onClick={() => setDraft({ ...draft, type: t })}
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-xl border p-3">
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>
                  <span className="font-medium">Show on tills</span>
                  <span className="block text-xs text-muted-foreground">
                    Hidden dishes stay in reports
                  </span>
                </span>
                <Switch
                  checked={draft.visible}
                  onCheckedChange={(v) => setDraft({ ...draft, visible: v })}
                />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>
                  <span className="font-medium">Sell online</span>
                  <span className="block text-xs text-muted-foreground">
                    Website, WhatsApp and Glovo
                  </span>
                </span>
                <Switch
                  checked={draft.online}
                  onCheckedChange={(v) => setDraft({ ...draft, online: v })}
                />
              </label>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Dietary labels</Label>
              <div className="flex flex-wrap gap-3">
                {DIETARY_LABELS.map((l) => (
                  <label
                    key={l.id}
                    className="flex items-center gap-1.5 text-sm"
                  >
                    <Checkbox
                      checked={draft.labels.includes(l.id)}
                      onCheckedChange={(c) =>
                        setDraft({
                          ...draft,
                          labels: c
                            ? [...draft.labels, l.id]
                            : draft.labels.filter((x) => x !== l.id),
                        })
                      }
                    />
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-white",
                        l.className
                      )}
                    >
                      {l.id}
                    </span>
                    {l.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <SheetFooter className="flex-row justify-end border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{isNew ? "Add dish" : "Save dish"}</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
