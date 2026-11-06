"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import {
  CheckIcon,
  ChevronDownIcon,
  EyeIcon,
  MinusIcon,
  ShieldIcon,
} from "lucide-react"

import { useAppState } from "@/components/app-state-provider"
import { PageHeader } from "@/components/page-header"
import { Segmented } from "@/components/segmented"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  MOCK_STAFF,
  PERMISSIONS,
  ROLE_ACCESS,
  STAFF_ROLES,
  initials,
  type Access,
  type StaffRole,
} from "@/lib/mock/staff"
import { cn } from "@/lib/utils"

const AREAS = [...new Set(PERMISSIONS.map((p) => p.area))]

function AccessMark({ access }: { access: Access }) {
  if (access === "full")
    return (
      <span
        className="inline-flex size-6 items-center justify-center rounded-full bg-success/15 text-success"
        title="Full access"
      >
        <CheckIcon className="size-3.5" strokeWidth={3} />
      </span>
    )
  if (access === "view")
    return (
      <span
        className="inline-flex size-6 items-center justify-center rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400"
        title="View only"
      >
        <EyeIcon className="size-3.5" />
      </span>
    )
  return (
    <span
      className="inline-flex size-6 items-center justify-center text-muted-foreground/40"
      title="No access"
    >
      <MinusIcon className="size-3.5" />
    </span>
  )
}

const accessOf = (role: StaffRole, permId: string): Access =>
  ROLE_ACCESS[role.id][permId] ?? "none"

export function RolesPrivileges() {
  const { branch } = useAppState()
  const [view, setView] = React.useState<"roles" | "compare">("roles")
  const [open, setOpen] = React.useState<string | null>("admin")
  const activeUsers = MOCK_STAFF.filter((u) => u.status !== "disabled")
  const roles = STAFF_ROLES.filter((r) =>
    activeUsers.some((u) => u.role === r.id)
  )

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 lg:p-8">
      <PageHeader
        icon={ShieldIcon}
        title="Roles & Privileges"
        description={`${branch.name} · ${roles.length} active roles across ${activeUsers.length} users`}
        back={{ href: "/admin", label: "Back to Admin" }}
        actions={
          <Segmented
            ariaLabel="View"
            value={view}
            onChange={setView}
            options={[
              { value: "roles", label: "By role" },
              { value: "compare", label: "Compare" },
            ]}
          />
        }
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground"
      >
        <span className="flex items-center gap-1.5">
          <AccessMark access="full" />
          Full access
        </span>
        <span className="flex items-center gap-1.5">
          <AccessMark access="view" />
          View only
        </span>
        <span className="flex items-center gap-1.5">
          <AccessMark access="none" />
          No access
        </span>
      </motion.div>

      <AnimatePresence mode="wait">
        {view === "roles" ? (
          <motion.div
            key="roles"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex flex-col gap-3"
          >
            {roles.map((role, i) => (
              <RoleCard
                key={role.id}
                role={role}
                index={i}
                open={open === role.id}
                onToggle={() =>
                  setOpen((o) => (o === role.id ? null : role.id))
                }
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="compare"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="overflow-x-auto rounded-2xl border bg-card shadow-xs"
          >
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b">
                  <th className="sticky left-0 bg-card px-4 py-3 text-left font-medium">
                    Permission
                  </th>
                  {roles.map((r) => (
                    <th
                      key={r.id}
                      className="px-2 py-3 text-center font-medium"
                    >
                      <span className="flex flex-col items-center gap-1">
                        <r.icon className={cn("size-4", r.iconClass)} />
                        <span className="text-xs">{r.name}</span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {AREAS.map((area) => (
                  <React.Fragment key={area}>
                    <tr>
                      <td
                        colSpan={roles.length + 1}
                        className="bg-muted/50 px-4 py-1.5 text-[11px] font-medium tracking-wider text-muted-foreground uppercase"
                      >
                        {area}
                      </td>
                    </tr>
                    {PERMISSIONS.filter((p) => p.area === area).map((p, i) => (
                      <motion.tr
                        key={p.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(i * 0.02, 0.2) }}
                        className="border-t transition-colors hover:bg-muted/40"
                      >
                        <td className="sticky left-0 bg-card px-4 py-2">
                          {p.label}
                        </td>
                        {roles.map((r) => (
                          <td key={r.id} className="px-2 py-2 text-center">
                            <AccessMark access={accessOf(r, p.id)} />
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function RoleCard({
  role,
  index,
  open,
  onToggle,
}: {
  role: StaffRole
  index: number
  open: boolean
  onToggle: () => void
}) {
  const members = MOCK_STAFF.filter(
    (u) => u.role === role.id && u.status !== "disabled"
  )
  const granted = PERMISSIONS.filter(
    (p) => accessOf(role, p.id) !== "none"
  ).length

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.1 + index * 0.05 } }}
      className={cn("overflow-hidden rounded-2xl border shadow-xs", role.tint)}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left outline-none"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background shadow-xs">
          <role.icon className={cn("size-5", role.iconClass)} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold">{role.name}</h2>
            <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
              {members.length} {members.length === 1 ? "user" : "users"}
            </span>
          </div>
          <p className="truncate text-sm text-muted-foreground">
            {role.description}
          </p>
        </div>
        <span className="hidden text-xs text-muted-foreground tabular-nums sm:block">
          {granted}/{PERMISSIONS.length} permissions
        </span>
        <ChevronDownIcon
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-300",
            open && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-5 border-t bg-background/70 p-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  People
                </h3>
                <div className="flex flex-wrap gap-2">
                  {members.map((u, i) => (
                    <motion.span
                      key={u.id}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.04 }}
                    >
                      <Link
                        href="/admin/users"
                        className="flex items-center gap-2 rounded-full border bg-card py-1 pr-3 pl-1 text-sm transition-colors hover:bg-muted"
                      >
                        <Avatar className="size-6">
                          <AvatarFallback className="text-[10px]">
                            {initials(u.name)}
                          </AvatarFallback>
                        </Avatar>
                        {u.name}
                      </Link>
                    </motion.span>
                  ))}
                </div>
              </div>
              <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {AREAS.map((area, ai) => (
                  <motion.div
                    key={area}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + ai * 0.04 }}
                    className="flex flex-col gap-1"
                  >
                    <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                      {area}
                    </h3>
                    {PERMISSIONS.filter((p) => p.area === area).map((p) => {
                      const a = accessOf(role, p.id)
                      return (
                        <div
                          key={p.id}
                          className={cn(
                            "flex items-center gap-2 text-sm",
                            a === "none" && "text-muted-foreground"
                          )}
                        >
                          <AccessMark access={a} />
                          {p.label}
                        </div>
                      )
                    })}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}
