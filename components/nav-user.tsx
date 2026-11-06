"use client"

import { useTheme } from "next-themes"
import {
  ChevronsUpDownIcon,
  CircleUserRoundIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  ShieldIcon,
  SunIcon,
} from "lucide-react"
import { toast } from "sonner"

import { useAppState } from "@/components/app-state-provider"
import { useThemeSwitch } from "@/components/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { CURRENT_USER, ROLES, type Role } from "@/lib/tamu-data"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { role, setRole } = useAppState()
  const { theme } = useTheme()
  const { switchTheme } = useThemeSwitch()
  const roleLabel = ROLES.find((r) => r.id === role)?.label

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
            <Avatar className="size-8 rounded-lg">
              <AvatarFallback className="rounded-lg bg-foreground text-xs text-background">
                {CURRENT_USER.initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{CURRENT_USER.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {roleLabel}
              </span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-60 rounded-xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-foreground text-xs text-background">
                      {CURRENT_USER.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium text-foreground">
                      {CURRENT_USER.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {CURRENT_USER.email}
                    </span>
                  </div>
                  <Badge>{roleLabel}</Badge>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <ShieldIcon />
                  View as role
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="min-w-56">
                  <DropdownMenuRadioGroup
                    value={role}
                    onValueChange={(v) => {
                      setRole(v as Role)
                      toast(
                        `Previewing as ${ROLES.find((r) => r.id === v)?.label}`,
                        {
                          description:
                            "Navigation and tools now match this role.",
                        }
                      )
                    }}
                  >
                    {ROLES.map((r) => (
                      <DropdownMenuRadioItem key={r.id} value={r.id}>
                        <div className="flex flex-col">
                          <span>{r.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {r.description}
                          </span>
                        </div>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <SunIcon />
                  Theme
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={theme}
                    onValueChange={(v) =>
                      switchTheme(v as "light" | "dark" | "system")
                    }
                  >
                    <DropdownMenuRadioItem value="light">
                      <SunIcon /> Light
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                      <MoonIcon /> Dark
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system">
                      <MonitorIcon /> System
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem>
                <CircleUserRoundIcon />
                Account
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
