"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import {
  BuildingIcon,
  CircleDotIcon,
  KeyRoundIcon,
  MailIcon,
  MoreHorizontalIcon,
  PencilIcon,
  RotateCcwIcon,
  ShieldIcon,
  TriangleAlertIcon,
  UserCheckIcon,
  UserPlusIcon,
  UserXIcon,
  UsersIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  FilterMenu,
  NoResults,
  Pill,
  SearchField,
} from "@/components/data/table-kit"
import { PageHeader } from "@/components/page-header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import {
  MOCK_STAFF,
  STAFF_ROLES,
  initials,
  relativeTime,
  type StaffRoleId,
  type StaffStatus,
  type StaffUser,
} from "@/lib/mock/staff"
import { BRANCHES } from "@/lib/tamu-data"
import { cn } from "@/lib/utils"

const STATUS_PILL: Record<
  StaffStatus,
  { tone: "green" | "sky" | "slate"; label: string }
> = {
  active: { tone: "green", label: "Active" },
  invited: { tone: "sky", label: "Invited" },
  disabled: { tone: "slate", label: "Disabled" },
}

const branchName = (id: string) => BRANCHES.find((b) => b.id === id)?.name ?? id

export function UserManagement() {
  const [users, setUsers] = React.useState<StaffUser[]>(MOCK_STAFF)
  const [query, setQuery] = React.useState("")
  const [roles, setRoles] = React.useState<StaffRoleId[]>([])
  const [statuses, setStatuses] = React.useState<StaffStatus[]>([])
  const [branches, setBranches] = React.useState<string[]>([])
  const [noPin, setNoPin] = React.useState(false)
  const [editing, setEditing] = React.useState<StaffUser | "new" | null>(null)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter((u) => {
      if (roles.length && !roles.includes(u.role)) return false
      if (statuses.length && !statuses.includes(u.status)) return false
      if (
        branches.length &&
        !u.branches.includes("all") &&
        !branches.some((b) => u.branches.includes(b))
      )
        return false
      if (noPin && (u.pinSet || u.status === "disabled")) return false
      if (!q) return true
      return [u.name, u.username, u.phone, u.email ?? ""].some((f) =>
        f.toLowerCase().replace(/\s/g, "").includes(q.replace(/\s/g, ""))
      )
    })
  }, [users, query, roles, statuses, branches, noPin])

  const missingPin = users.filter(
    (u) =>
      !u.pinSet &&
      u.status !== "disabled" &&
      !["pickup", "smash"].includes(u.role)
  ).length
  const reset = () => {
    setQuery("")
    setRoles([])
    setStatuses([])
    setBranches([])
    setNoPin(false)
  }

  const patch = (id: string, p: Partial<StaffUser>) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...p } : u)))

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 lg:p-8">
      <PageHeader
        icon={UsersIcon}
        title="User Management"
        description={`${users.filter((u) => u.status === "active").length} active accounts across ${BRANCHES.length} branches`}
        back={{ href: "/admin", label: "Back to Admin" }}
        actions={
          <>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/admin/roles" />}
            >
              <ShieldIcon />
              Roles & privileges
            </Button>
            <Button onClick={() => setEditing("new")}>
              <UserPlusIcon />
              Add user
            </Button>
          </>
        }
      />

      <AnimatePresence>
        {missingPin > 0 && (
          <motion.button
            type="button"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onClick={() => setNoPin((v) => !v)}
            className={cn(
              "flex items-center gap-3 overflow-hidden rounded-xl border border-amber-500/30 bg-amber-500/[0.06] px-4 py-3 text-left text-sm transition-colors hover:bg-amber-500/10",
              noPin && "ring-2 ring-amber-500/40"
            )}
          >
            <TriangleAlertIcon className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="flex-1">
              <b className="font-semibold">
                {missingPin}{" "}
                {missingPin === 1 ? "person hasn't" : "people haven't"} set a
                PIN.
              </b>{" "}
              <span className="text-muted-foreground">
                They can&apos;t approve overrides or clock in until they do.
              </span>
            </span>
            <span className="shrink-0 font-medium text-amber-700 dark:text-amber-300">
              {noPin ? "Show everyone" : "Show them"}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search name, username, phone or email…"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="flex flex-wrap gap-2"
      >
        <FilterMenu<StaffRoleId>
          label="Role"
          icon={ShieldIcon}
          selected={roles}
          onChange={setRoles}
          options={STAFF_ROLES.map((r) => ({
            value: r.id,
            label: r.name,
            count: users.filter((u) => u.role === r.id).length,
          }))}
        />
        <FilterMenu<StaffStatus>
          label="Status"
          icon={CircleDotIcon}
          selected={statuses}
          onChange={setStatuses}
          options={(["active", "invited", "disabled"] as const).map((s) => ({
            value: s,
            label: STATUS_PILL[s].label,
            count: users.filter((u) => u.status === s).length,
          }))}
        />
        <FilterMenu<string>
          label="Branch"
          icon={BuildingIcon}
          selected={branches}
          onChange={setBranches}
          options={BRANCHES.map((b) => ({ value: b.id, label: b.name }))}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
        className="overflow-hidden rounded-2xl border bg-card shadow-xs"
      >
        {filtered.length === 0 ? (
          <NoResults onReset={reset} />
        ) : (
          <>
            <ul className="divide-y md:hidden">
              {filtered.map((u, i) => (
                <MobileUserCard
                  key={u.id}
                  user={u}
                  index={i}
                  onEdit={() => setEditing(u)}
                  onToggle={() => {
                    const next = u.status === "disabled" ? "active" : "disabled"
                    patch(u.id, { status: next })
                    toast(
                      next === "disabled"
                        ? `${u.name} can no longer sign in`
                        : `${u.name} is active again`
                    )
                  }}
                />
              ))}
            </ul>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[920px] text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-[11px] tracking-wider text-muted-foreground uppercase">
                    {[
                      "User",
                      "Role",
                      "Branches",
                      "PIN",
                      "Last active",
                      "Status",
                      "",
                    ].map((h, i) => (
                      <th
                        key={i}
                        className="px-4 py-2.5 font-medium whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false} mode="popLayout">
                    {filtered.map((u, i) => {
                      const role = STAFF_ROLES.find((r) => r.id === u.role)!
                      const online = relativeTime(u.lastActive) === "Online now"
                      return (
                        <motion.tr
                          key={u.id}
                          layout
                          initial={{ opacity: 0, y: 6 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            transition: { delay: Math.min(i * 0.025, 0.3) },
                          }}
                          exit={{ opacity: 0 }}
                          className={cn(
                            "border-b transition-colors last:border-0 hover:bg-muted/40",
                            u.status === "disabled" && "opacity-55"
                          )}
                        >
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => setEditing(u)}
                              className="flex items-center gap-3 text-left outline-none"
                            >
                              <span className="relative">
                                <Avatar className="size-9">
                                  <AvatarFallback className="text-xs">
                                    {initials(u.name)}
                                  </AvatarFallback>
                                </Avatar>
                                {online && (
                                  <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full bg-success ring-2 ring-card" />
                                )}
                              </span>
                              <span className="flex flex-col">
                                <span className="font-medium hover:underline">
                                  {u.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  @{u.username} · {u.phone}
                                </span>
                              </span>
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1.5 whitespace-nowrap">
                              <role.icon
                                className={cn("size-4", role.iconClass)}
                              />
                              {role.name}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {u.branches.includes("all") ? (
                                <Pill tone="violet">All branches</Pill>
                              ) : (
                                u.branches.map((b) => (
                                  <Pill key={b} tone="slate">
                                    {branchName(b)}
                                  </Pill>
                                ))
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {u.pinSet ? (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <KeyRoundIcon className="size-3.5" />
                                Set
                              </span>
                            ) : ["pickup", "smash"].includes(u.role) &&
                              u.status === "active" ? (
                              <span className="text-xs text-muted-foreground">
                                Not needed
                              </span>
                            ) : (
                              <Pill tone="amber" icon={TriangleAlertIcon}>
                                Not set
                              </Pill>
                            )}
                          </td>
                          <td
                            className={cn(
                              "px-4 py-3 whitespace-nowrap",
                              online
                                ? "font-medium text-success"
                                : "text-muted-foreground"
                            )}
                          >
                            {relativeTime(u.lastActive)}
                          </td>
                          <td className="px-4 py-3">
                            <Pill tone={STATUS_PILL[u.status].tone}>
                              {STATUS_PILL[u.status].label}
                            </Pill>
                          </td>
                          <td className="px-2 py-3 text-right">
                            <RowMenu
                              user={u}
                              onEdit={() => setEditing(u)}
                              onToggle={() => {
                                const next =
                                  u.status === "disabled"
                                    ? "active"
                                    : "disabled"
                                patch(u.id, { status: next })
                                toast(
                                  next === "disabled"
                                    ? `${u.name} can no longer sign in`
                                    : `${u.name} is active again`
                                )
                              }}
                            />
                          </td>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </>
        )}
        <div className="border-t px-4 py-3 text-sm text-muted-foreground tabular-nums">
          Showing {filtered.length} of {users.length} users
        </div>
      </motion.div>

      <UserSheet
        target={editing}
        onClose={() => setEditing(null)}
        onSave={(u) => {
          setUsers((prev) =>
            prev.some((x) => x.id === u.id)
              ? prev.map((x) => (x.id === u.id ? u : x))
              : [u, ...prev]
          )
          toast.success(
            editing === "new"
              ? `Invite sent to ${u.name}`
              : `${u.name} updated`,
            {
              description:
                editing === "new"
                  ? `They'll get an SMS on ${u.phone} to set their PIN.`
                  : undefined,
            }
          )
          setEditing(null)
        }}
      />
    </div>
  )
}

function MobileUserCard({
  user: u,
  index,
  onEdit,
  onToggle,
}: {
  user: StaffUser
  index: number
  onEdit: () => void
  onToggle: () => void
}) {
  const role = STAFF_ROLES.find((r) => r.id === u.role)!
  const last = relativeTime(u.lastActive)
  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      className={cn(
        "flex items-start gap-3 p-4",
        u.status === "disabled" && "opacity-55"
      )}
    >
      <span className="relative shrink-0">
        <Avatar className="size-10">
          <AvatarFallback className="text-xs">
            {initials(u.name)}
          </AvatarFallback>
        </Avatar>
        {last === "Online now" && (
          <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full bg-success ring-2 ring-card" />
        )}
      </span>
      <button
        type="button"
        onClick={onEdit}
        className="flex min-w-0 flex-1 flex-col gap-1 text-left"
      >
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{u.name}</span>
          <Pill tone={STATUS_PILL[u.status].tone}>
            {STATUS_PILL[u.status].label}
          </Pill>
        </span>
        <span className="flex items-center gap-1.5 text-sm">
          <role.icon className={cn("size-3.5", role.iconClass)} />
          {role.name}
          <span className="text-muted-foreground">· {last}</span>
        </span>
        <span className="text-xs text-muted-foreground">
          @{u.username} ·{" "}
          {u.branches.includes("all")
            ? "All branches"
            : u.branches.map(branchName).join(", ")}
        </span>
        {!u.pinSet &&
          !["pickup", "smash"].includes(u.role) &&
          u.status !== "disabled" && (
            <span className="w-fit">
              <Pill tone="amber" icon={TriangleAlertIcon}>
                PIN not set
              </Pill>
            </span>
          )}
      </button>
      <RowMenu user={u} onEdit={onEdit} onToggle={onToggle} />
    </motion.li>
  )
}

function RowMenu({
  user,
  onEdit,
  onToggle,
}: {
  user: StaffUser
  onEdit: () => void
  onToggle: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${user.name}`}
          />
        }
      >
        <MoreHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-44">
        <DropdownMenuItem onClick={onEdit}>
          <PencilIcon />
          Edit
        </DropdownMenuItem>
        {user.status === "invited" ? (
          <DropdownMenuItem
            onClick={() => toast.success(`Invite re-sent to ${user.phone}`)}
          >
            <MailIcon />
            Resend invite
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() =>
              toast.success(`${user.name} must set a new PIN at next sign-in`)
            }
          >
            <RotateCcwIcon />
            Reset PIN
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {user.status === "disabled" ? (
          <DropdownMenuItem onClick={onToggle}>
            <UserCheckIcon />
            Re-enable
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem variant="destructive" onClick={onToggle}>
            <UserXIcon />
            Disable
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const EMPTY: StaffUser = {
  id: "",
  name: "",
  username: "",
  phone: "",
  email: null,
  role: "cashier",
  branches: [],
  status: "invited",
  pinSet: false,
  lastActive: null,
}

function UserSheet({
  target,
  onClose,
  onSave,
}: {
  target: StaffUser | "new" | null
  onClose: () => void
  onSave: (u: StaffUser) => void
}) {
  const [draft, setDraft] = React.useState<StaffUser>(EMPTY)
  const [shown, setShown] = React.useState(target)
  const [touchedUsername, setTouchedUsername] = React.useState(false)
  if (target && target !== shown) {
    setShown(target)
    setDraft(target === "new" ? EMPTY : target)
    setTouchedUsername(target !== "new")
  }
  const isNew = (target ?? shown) === "new"
  const allBranches = draft.branches.includes("all")

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.name.trim()) return toast.error("Add their name")
    if (!draft.phone.trim())
      return toast.error("Add a phone number for the invite")
    if (!draft.branches.length) return toast.error("Pick at least one branch")
    onSave({ ...draft, id: draft.id || `u_${Date.now()}` })
  }

  return (
    <Sheet open={!!target} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <form onSubmit={submit} className="flex min-h-full flex-col">
          <SheetHeader className="border-b">
            <SheetTitle>
              {isNew ? "Add a user" : `Edit ${draft.name}`}
            </SheetTitle>
            <SheetDescription>
              {isNew
                ? "They'll get an SMS invite to set their own 6-digit PIN."
                : "Changes apply the next time they sign in."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-5 p-4">
            <div className="grid gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={draft.name}
                  autoFocus
                  onChange={(e) => {
                    const name = e.target.value
                    setDraft((d) => ({
                      ...d,
                      name,
                      username: touchedUsername
                        ? d.username
                        : (name
                            .toLowerCase()
                            .trim()
                            .split(/\s+/)[0]
                            ?.replace(/[^a-z0-9]/g, "") ?? ""),
                    }))
                  }}
                  placeholder="Grace Wambui"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={draft.username}
                    onChange={(e) => {
                      setTouchedUsername(true)
                      setDraft({
                        ...draft,
                        username: e.target.value
                          .toLowerCase()
                          .replace(/\s/g, ""),
                      })
                    }}
                    placeholder="grace"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={draft.phone}
                    onChange={(e) =>
                      setDraft({ ...draft, phone: e.target.value })
                    }
                    placeholder="0712 345 678"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">
                  Email{" "}
                  <span className="font-normal text-muted-foreground">
                    (for reports, optional)
                  </span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={draft.email ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, email: e.target.value || null })
                  }
                  placeholder="grace@tastygrubs.co.ke"
                />
              </div>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-medium">Role</legend>
              <div className="grid gap-2">
                {STAFF_ROLES.map((r) => {
                  const active = draft.role === r.id
                  return (
                    <label
                      key={r.id}
                      className={cn(
                        "relative flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/50",
                        active && "border-foreground/40"
                      )}
                    >
                      <input
                        type="radio"
                        name="role"
                        className="sr-only"
                        checked={active}
                        onChange={() => setDraft({ ...draft, role: r.id })}
                      />
                      {active && (
                        <motion.span
                          layoutId="role-pick"
                          className="absolute inset-0 rounded-xl ring-2 ring-foreground"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 40,
                          }}
                        />
                      )}
                      <r.icon
                        className={cn("mt-0.5 size-4 shrink-0", r.iconClass)}
                      />
                      <span className="flex flex-col">
                        <span className="text-sm font-medium">{r.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {r.description}
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-medium">Branches</legend>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={allBranches}
                  onCheckedChange={(c) =>
                    setDraft({ ...draft, branches: c ? ["all"] : [] })
                  }
                />
                All branches, including new ones
              </label>
              <AnimatePresence initial={false}>
                {!allBranches && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex flex-col gap-2 overflow-hidden pl-6"
                  >
                    {BRANCHES.map((b) => (
                      <label
                        key={b.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={draft.branches.includes(b.id)}
                          onCheckedChange={(c) =>
                            setDraft({
                              ...draft,
                              branches: c
                                ? [...draft.branches, b.id]
                                : draft.branches.filter((x) => x !== b.id),
                            })
                          }
                        />
                        {b.name}
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </fieldset>
          </div>
          <SheetFooter className="flex-row justify-end border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isNew ? (
                <>
                  <UserPlusIcon />
                  Send invite
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
