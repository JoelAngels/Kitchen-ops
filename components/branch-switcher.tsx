"use client"

import { AnimatePresence, motion } from "motion/react"
import { Building2Icon, CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import { toast } from "sonner"

import { useAppState } from "@/components/app-state-provider"
import { TamuMark } from "@/components/tamu-logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { BRANCHES, ORGANIZATION } from "@/lib/tamu-data"

export function BranchSwitcher() {
  const { branch, setBranchId } = useAppState()
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
              />
            }
          >
            <TamuMark className="size-8" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={branch.id}
                  initial={{ y: 10, opacity: 0, filter: "blur(4px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: -10, opacity: 0, filter: "blur(4px)" }}
                  className="truncate font-semibold"
                >
                  {branch.name}
                </motion.span>
              </AnimatePresence>
              <span className="truncate text-xs text-muted-foreground">
                {ORGANIZATION.name}
              </span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-64 rounded-xl"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={8}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[11px] tracking-wider uppercase">
                {ORGANIZATION.name} · Branches
              </DropdownMenuLabel>
              {BRANCHES.map((b, i) => (
                <DropdownMenuItem
                  key={b.id}
                  className="gap-3 py-2"
                  onClick={() => {
                    if (b.id === branch.id) return
                    setBranchId(b.id)
                    toast.success(`Switched to ${b.name}`)
                  }}
                >
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex size-7 items-center justify-center rounded-md border bg-background"
                  >
                    <Building2Icon className="size-3.5" />
                  </motion.span>
                  <div className="flex flex-1 flex-col">
                    <span>{b.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {b.area}
                    </span>
                  </div>
                  {b.id === branch.id && (
                    <motion.span layoutId="branch-check" className="text-brand">
                      <CheckIcon className="size-4" />
                    </motion.span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-muted-foreground" disabled>
              {BRANCHES.length} branches · {ORGANIZATION.plan}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
