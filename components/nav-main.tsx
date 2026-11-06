"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { ChevronRightIcon } from "lucide-react"

import { useAppState } from "@/components/app-state-provider"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { PRIMARY_NAV, TOOL_GROUPS, toolHref } from "@/lib/tamu-data"

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  if (href === "/admin") return pathname === "/admin"
  return pathname === href || pathname.startsWith(href + "/")
}

/** The sliding pill behind the active item. Shared layoutId = it glides between items. */
function ActivePill({ id }: { id: string }) {
  return (
    <motion.span
      layoutId={id}
      className="absolute inset-0 -z-10 rounded-md bg-sidebar-accent ring-1 ring-sidebar-border"
      transition={{ type: "spring", stiffness: 500, damping: 38 }}
    />
  )
}

export function NavMain() {
  const pathname = usePathname()
  const { role } = useAppState()
  const { setOpenMobile } = useSidebar()
  const items = PRIMARY_NAV.filter((i) => i.roles.includes(role))

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Service</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const active = isActivePath(pathname, item.href)
          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={active}
                className="relative isolate data-active:bg-transparent"
                render={
                  <Link href={item.href} onClick={() => setOpenMobile(false)} />
                }
              >
                {active && <ActivePill id="nav-active" />}
                <item.icon className={active ? "text-brand" : undefined} />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export function NavTools() {
  const pathname = usePathname()
  const { role } = useAppState()
  const { setOpenMobile } = useSidebar()

  // Controlled open state: the group holding the current page opens as you navigate,
  // and anything the user opened or closed stays that way.
  const activeGroup = TOOL_GROUPS.find((g) =>
    g.tools.some((t) => isActivePath(pathname, toolHref(t.slug)))
  )?.id
  const [openGroups, setOpenGroups] = React.useState<Set<string>>(
    () => new Set(activeGroup ? [activeGroup] : [])
  )
  const [lastActive, setLastActive] = React.useState(activeGroup)
  if (activeGroup !== lastActive) {
    setLastActive(activeGroup)
    if (activeGroup && !openGroups.has(activeGroup))
      setOpenGroups(new Set([...openGroups, activeGroup]))
  }

  const groups = TOOL_GROUPS.map((g) => ({
    ...g,
    tools: g.tools.filter((t) => t.roles.includes(role)),
  })).filter((g) => g.tools.length > 0)

  if (groups.length === 0) return null

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Admin tools</SidebarGroupLabel>
      <SidebarMenu>
        {groups.map((group) => {
          return (
            <Collapsible
              key={group.id}
              open={openGroups.has(group.id)}
              onOpenChange={(open) =>
                setOpenGroups((prev) => {
                  const next = new Set(prev)
                  if (open) next.add(group.id)
                  else next.delete(group.id)
                  return next
                })
              }
              className="group/collapsible"
              render={<SidebarMenuItem />}
            >
              <CollapsibleTrigger
                render={<SidebarMenuButton tooltip={group.title} />}
              >
                <group.icon />
                <span className="truncate">{group.title}</span>
                <ChevronRightIcon className="ml-auto transition-transform duration-300 ease-out group-data-open/collapsible:rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent className="h-(--collapsible-panel-height) overflow-hidden transition-[height,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-ending-style:h-0 data-ending-style:opacity-0 data-starting-style:h-0 data-starting-style:opacity-0">
                <SidebarMenuSub>
                  {group.tools.map((tool) => {
                    const href = toolHref(tool.slug)
                    const active = isActivePath(pathname, href)
                    return (
                      <SidebarMenuSubItem key={tool.slug}>
                        <SidebarMenuSubButton
                          isActive={active}
                          className="relative isolate data-active:bg-transparent"
                          render={
                            <Link
                              href={href}
                              onClick={() => setOpenMobile(false)}
                            />
                          }
                        >
                          {active && <ActivePill id="nav-sub-active" />}
                          <span className="truncate">{tool.title}</span>
                          {tool.beta && (
                            <Badge
                              variant="outline"
                              className="ml-auto h-4 px-1 text-[9px] tracking-wide"
                            >
                              BETA
                            </Badge>
                          )}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )
                  })}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
