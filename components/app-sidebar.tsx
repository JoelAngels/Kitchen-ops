"use client"

import * as React from "react"
import { SearchIcon } from "lucide-react"

import { BranchSwitcher } from "@/components/branch-switcher"
import { useCommandMenu } from "@/components/command-menu"
import { NavMain, NavTools } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
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

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { setOpen } = useCommandMenu()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <BranchSwitcher />
      </SidebarHeader>
      <SidebarContent>
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
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
