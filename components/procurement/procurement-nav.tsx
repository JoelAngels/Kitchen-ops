"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { ArrowLeftIcon, ArrowRightIcon, PackageIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { PROCUREMENT_NAV, procurementHref } from "@/lib/mock/procurement"

/** The sidebar's Procurement mode: its own sections plus a way back to the main menu. */
export function ProcurementNav({ onBack }: { onBack: () => void }) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  return (
    <>
      <SidebarGroup className="pb-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Back to main menu"
              onClick={onBack}
              className="group/back text-muted-foreground hover:text-foreground"
            >
              <ArrowLeftIcon className="transition-transform group-hover/back:-translate-x-0.5" />
              <span>Main menu</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex items-center gap-2.5 px-2 pt-3 pb-1 group-data-[collapsible=icon]:hidden">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
            <PackageIcon className="size-4" />
          </span>
          <div className="grid min-w-0 leading-tight">
            <span className="flex items-center gap-1.5 text-sm font-semibold">
              Procurement
              <Badge
                variant="outline"
                className="h-4 px-1 text-[9px] tracking-wide"
              >
                BETA
              </Badge>
            </span>
            <span className="truncate text-[10px] tracking-wider text-muted-foreground uppercase">
              Inventory & purchasing
            </span>
          </div>
        </div>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Procurement</SidebarGroupLabel>
        <SidebarMenu>
          {PROCUREMENT_NAV.map((s) => {
            const href = procurementHref(s.slug)
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <SidebarMenuItem key={s.slug}>
                <SidebarMenuButton
                  tooltip={s.title}
                  isActive={active}
                  className="relative isolate data-active:bg-transparent"
                  render={
                    <Link href={href} onClick={() => setOpenMobile(false)} />
                  }
                >
                  {active && (
                    <motion.span
                      layoutId="procurement-nav-active"
                      className="absolute inset-0 -z-10 rounded-md bg-sidebar-accent ring-1 ring-sidebar-border"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 38,
                      }}
                    />
                  )}
                  <s.icon className={active ? "text-brand" : undefined} />
                  <span>{s.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroup>
    </>
  )
}

/** Shown in the main menu while you're still inside Procurement, to slide back in. */
export function ReturnToProcurement({ onReturn }: { onReturn: () => void }) {
  return (
    <SidebarGroup className="pb-0">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Back to Procurement"
            onClick={onReturn}
            className="group/return bg-brand/10 text-brand hover:bg-brand/15 hover:text-brand"
          >
            <PackageIcon />
            <span>Back to Procurement</span>
            <ArrowRightIcon className="ml-auto transition-transform group-hover/return:translate-x-0.5" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
