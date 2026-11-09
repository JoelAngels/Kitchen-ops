"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion, type Variants } from "motion/react"
import { SearchIcon } from "lucide-react"

import { BranchSwitcher } from "@/components/branch-switcher"
import { useCommandMenu } from "@/components/command-menu"
import { NavMain, NavTools } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  ProcurementNav,
  ReturnToProcurement,
} from "@/components/procurement/procurement-nav"
import { Kbd } from "@/components/ui/kbd"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { PROCUREMENT_BASE } from "@/lib/mock/procurement"

type View = "main" | "procurement"

/** Drill-down slide: deeper views come in from the right, going back slides left. */
const panel: Variants = {
  enter: (dir: number) => ({ x: dir * 32, opacity: 0, filter: "blur(4px)" }),
  center: { x: 0, opacity: 1, filter: "blur(0px)" },
  exit: (dir: number) => ({ x: dir * -32, opacity: 0, filter: "blur(4px)" }),
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const inProcurement =
    pathname === PROCUREMENT_BASE || pathname.startsWith(PROCUREMENT_BASE + "/")

  // "Main menu" lets you peek at the normal sidebar without leaving the page;
  // any navigation resets it so the sidebar follows where you are.
  const [showMain, setShowMain] = React.useState(false)
  const [lastPath, setLastPath] = React.useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setShowMain(false)
  }

  const view: View = inProcurement && !showMain ? "procurement" : "main"
  const direction = view === "procurement" ? 1 : -1

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <BranchSwitcher />
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={view}
            custom={direction}
            variants={panel}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full flex-col"
          >
            {view === "procurement" ? (
              <ProcurementNav onBack={() => setShowMain(true)} />
            ) : (
              <MainNav
                onReturn={inProcurement ? () => setShowMain(false) : undefined}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function MainNav({ onReturn }: { onReturn?: () => void }) {
  const { setOpen } = useCommandMenu()

  return (
    <>
      {onReturn && <ReturnToProcurement onReturn={onReturn} />}
      <SidebarGroup className="pb-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Search"
              onClick={() => setOpen(true)}
              className="border bg-background text-muted-foreground shadow-xs hover:text-foreground"
            >
              <SearchIcon />
              <span>Search tools…</span>
              <Kbd className="ml-auto group-data-[collapsible=icon]:hidden">
                ⌘K
              </Kbd>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      <NavMain />
      <NavTools />
    </>
  )
}
