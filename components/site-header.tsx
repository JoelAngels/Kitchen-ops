"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { ChevronRightIcon, SearchIcon } from "lucide-react"

import { useAppState } from "@/components/app-state-provider"
import { useCommandMenu } from "@/components/command-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { PRIMARY_NAV, findTool } from "@/lib/tamu-data"

function useCrumbs(pathname: string) {
  const crumbs: { label: string; href: string }[] = []
  if (pathname === "/") return [{ label: "Cashier", href: "/" }]
  const parts = pathname.split("/").filter(Boolean)
  let acc = ""
  for (const part of parts) {
    acc += `/${part}`
    const nav = PRIMARY_NAV.find((n) => n.href === acc)
    const label = nav?.title ?? findTool(part)?.title ?? part.replace(/-/g, " ")
    crumbs.push({ label, href: acc })
  }
  return crumbs
}

export function SiteHeader() {
  const pathname = usePathname()
  const crumbs = useCrumbs(pathname)
  const { branch } = useAppState()
  const { setOpen } = useCommandMenu()

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-md transition-[width,height] ease-linear md:rounded-t-xl">
      <div className="flex w-full items-center gap-1 px-3 lg:gap-2 lg:px-5">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-1 text-sm"
        >
          <span className="hidden shrink-0 text-muted-foreground xl:inline">
            {branch.name}
          </span>
          <AnimatePresence mode="popLayout" initial={false}>
            {crumbs.map((c, i) => (
              <motion.span
                key={c.href}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className={
                  i === crumbs.length - 1
                    ? "flex min-w-0 items-center gap-1"
                    : "flex shrink-0 items-center gap-1"
                }
              >
                <ChevronRightIcon
                  className={
                    i === 0
                      ? "hidden size-3.5 text-muted-foreground/60 xl:block"
                      : "size-3.5 shrink-0 text-muted-foreground/60"
                  }
                />
                {i === crumbs.length - 1 ? (
                  <span className="truncate font-medium capitalize">
                    {c.label}
                  </span>
                ) : (
                  <Link
                    href={c.href}
                    className="hit-area truncate text-muted-foreground capitalize transition-colors hover:text-foreground"
                  >
                    {c.label}
                  </Link>
                )}
              </motion.span>
            ))}
          </AnimatePresence>
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="outline"
            className="hidden w-56 justify-start text-muted-foreground lg:flex"
            onClick={() => setOpen(true)}
          >
            <SearchIcon />
            Search…
            <Kbd className="ml-auto">⌘K</Kbd>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Search"
            onClick={() => setOpen(true)}
          >
            <SearchIcon />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
