import { cookies } from "next/headers"

import { AppSidebar } from "@/components/app-sidebar"
import { AppStateProvider } from "@/components/app-state-provider"
import { CommandMenuProvider } from "@/components/command-menu"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const sidebarCookie = cookieStore.get("sidebar_state")?.value
  const defaultOpen = sidebarCookie ? sidebarCookie === "true" : true

  return (
    <AppStateProvider>
      <CommandMenuProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar variant="inset" />
          <SidebarInset className="min-w-0 overflow-x-clip">
            <SiteHeader />
            <div className="flex flex-1 flex-col">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </CommandMenuProvider>
    </AppStateProvider>
  )
}
