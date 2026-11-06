"use client"

import { motion } from "motion/react"
import { SparklesIcon } from "lucide-react"

import { useAppState } from "@/components/app-state-provider"
import { Reveal, RevealItem } from "@/components/motion/reveal"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ALL_TOOLS, TONE_CLASSES, type Tool } from "@/lib/tamu-data"
import { cn } from "@/lib/utils"

/** Placeholder for screens still to be designed, so every link in the app lands somewhere real. */
export function ComingSoon({
  slug,
  title,
  description,
}: {
  slug?: string
  title?: string
  description?: string
}) {
  const { pinned, togglePin } = useAppState()
  const tool: Tool | undefined = slug
    ? ALL_TOOLS.find((t) => t.slug === slug)
    : undefined
  const name = tool?.title ?? title ?? "Coming soon"

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 lg:p-8">
      <PageHeader
        icon={tool?.icon}
        iconClassName={
          tool
            ? cn("bg-transparent shadow-none ring-1", TONE_CLASSES[tool.tone])
            : undefined
        }
        title={name}
        description={tool?.description ?? description}
        back={tool ? { href: "/admin", label: "Back to Admin" } : undefined}
        actions={
          tool && (
            <Button variant="outline" onClick={() => togglePin(tool.slug)}>
              {pinned.includes(tool.slug) ? "Unpin" : "Pin to Admin"}
            </Button>
          )
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative overflow-hidden rounded-2xl border bg-card p-6"
      >
        <div className="bg-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)] opacity-30" />
        <div className="relative flex items-center gap-3">
          <motion.span
            animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.2 }}
            className="flex size-9 items-center justify-center rounded-lg bg-brand/10 text-brand"
          >
            <SparklesIcon className="size-4" />
          </motion.span>
          <div>
            <p className="font-medium">
              This screen is next on the design list
            </p>
            <p className="text-sm text-muted-foreground">
              The layout below is a preview of where its content will go.
            </p>
          </div>
        </div>
      </motion.div>

      <Reveal className="grid gap-3 sm:grid-cols-3" stagger={0.07}>
        {[0, 1, 2].map((i) => (
          <RevealItem
            key={i}
            className="flex flex-col gap-3 rounded-2xl border bg-card p-4"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-28" />
          </RevealItem>
        ))}
        <RevealItem className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:col-span-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-lg" />
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </RevealItem>
      </Reveal>
    </div>
  )
}
