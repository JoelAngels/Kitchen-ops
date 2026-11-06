"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Building2Icon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { toast } from "sonner"

import { useAppState } from "@/components/app-state-provider"
import { useThemeSwitch } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  BRANCHES,
  PRIMARY_NAV,
  TONE_CLASSES,
  TOOL_GROUPS,
  toolHref,
} from "@/lib/tamu-data"
import { cn } from "@/lib/utils"

type CommandMenuContext = { open: boolean; setOpen: (open: boolean) => void }

const Ctx = React.createContext<CommandMenuContext | null>(null)

export function useCommandMenu() {
  const ctx = React.useContext(Ctx)
  if (!ctx)
    throw new Error("useCommandMenu must be used within CommandMenuProvider")
  return ctx
}

export function CommandMenuProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const value = React.useMemo(() => ({ open, setOpen }), [open])

  return (
    <Ctx.Provider value={value}>
      {children}
      <CommandMenu open={open} setOpen={setOpen} />
    </Ctx.Provider>
  )
}

function CommandMenu({ open, setOpen }: CommandMenuContext) {
  const router = useRouter()
  const { role, branch, setBranchId, trackRecent } = useAppState()
  const { switchTheme } = useThemeSwitch()

  const run = (fn: () => void) => {
    setOpen(false)
    fn()
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search Tamu"
      className="sm:max-w-xl"
    >
      <Command
        filter={(value, search) => {
          const hay = value.toLowerCase()
          return search
            .toLowerCase()
            .split(/\s+/)
            .every((w) => hay.includes(w))
            ? 1
            : 0
        }}
      >
        <CommandInput placeholder="Jump to a page, tool or branch…" />
        <CommandList className="max-h-[min(60vh,420px)]">
          <CommandEmpty>Nothing matches that search.</CommandEmpty>
          <CommandGroup heading="Go to">
            {PRIMARY_NAV.filter((n) => n.roles.includes(role)).map((n) => (
              <CommandItem
                key={n.href}
                value={`go ${n.title}`}
                onSelect={() => run(() => router.push(n.href))}
              >
                <n.icon />
                {n.title}
              </CommandItem>
            ))}
          </CommandGroup>
          {TOOL_GROUPS.map((group) => {
            const tools = group.tools.filter((t) => t.roles.includes(role))
            if (!tools.length) return null
            return (
              <CommandGroup key={group.id} heading={group.title}>
                {tools.map((tool) => (
                  <CommandItem
                    key={tool.slug}
                    value={`${tool.title} ${tool.description} ${tool.keywords?.join(" ") ?? ""}`}
                    onSelect={() =>
                      run(() => {
                        trackRecent(tool.slug)
                        router.push(toolHref(tool.slug))
                      })
                    }
                  >
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-md ring-1",
                        TONE_CLASSES[tool.tone]
                      )}
                    >
                      <tool.icon className="size-3.5" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span>{tool.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {tool.description}
                      </span>
                    </span>
                    {tool.beta && (
                      <Badge variant="outline" className="ml-auto text-[10px]">
                        Beta
                      </Badge>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )
          })}
          <CommandSeparator />
          <CommandGroup heading="Switch branch">
            {BRANCHES.map((b) => (
              <CommandItem
                key={b.id}
                value={`branch ${b.name} ${b.area}`}
                onSelect={() =>
                  run(() => {
                    setBranchId(b.id)
                    toast.success(`Switched to ${b.name}`)
                  })
                }
              >
                <Building2Icon />
                {b.name}
                {b.id === branch.id && (
                  <CommandShortcut>Current</CommandShortcut>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Theme">
            <CommandItem
              value="theme light"
              onSelect={() => run(() => switchTheme("light"))}
            >
              <SunIcon /> Light
            </CommandItem>
            <CommandItem
              value="theme dark"
              onSelect={() => run(() => switchTheme("dark"))}
            >
              <MoonIcon /> Dark
            </CommandItem>
            <CommandItem
              value="theme system"
              onSelect={() => run(() => switchTheme("system"))}
            >
              <MonitorIcon /> System
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
