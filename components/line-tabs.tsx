"use client"

import * as React from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

/** Underlined tabs whose indicator glides between options. */
export function LineTabs<T extends string>({
  value,
  onChange,
  options,
  layoutId = "line-tab",
  className,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: React.ReactNode }[]
  layoutId?: string
  className?: string
}) {
  return (
    <div role="tablist" className={cn("flex gap-1 border-b", className)}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative flex shrink-0 items-center gap-1.5 px-3 pt-1 pb-2.5 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:text-foreground",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {o.label}
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-foreground"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
