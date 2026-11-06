"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { useTheme } from "next-themes"
import { MoonIcon, SunIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * Switches theme with a circular reveal that grows from the click point.
 * Falls back to an instant switch where View Transitions aren't supported.
 */
export function useThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme()

  const switchTheme = React.useCallback(
    (next: "light" | "dark" | "system", origin?: { x: number; y: number }) => {
      const root = document.documentElement
      const target =
        next === "system"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : next
      const apply = () => {
        root.classList.toggle("dark", target === "dark")
        root.style.colorScheme = target
        setTheme(next)
      }

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
      if (!document.startViewTransition || reduce || target === resolvedTheme) {
        apply()
        return
      }

      const x = origin?.x ?? window.innerWidth - 40
      const y = origin?.y ?? 40
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      )

      const transition = document.startViewTransition(apply)
      transition.ready.then(() => {
        root.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${radius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 550,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        )
      })
    },
    [resolvedTheme, setTheme]
  )

  return { resolvedTheme, switchTheme }
}

export function ThemeToggle() {
  const { resolvedTheme, switchTheme } = useThemeSwitch()
  const [mounted, setMounted] = React.useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedTheme === "dark"

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            className="relative overflow-hidden"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              switchTheme(isDark ? "light" : "dark", {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
              })
            }}
          />
        }
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={isDark ? "moon" : "sun"}
            initial={{ y: 18, rotate: -90, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            exit={{ y: -18, rotate: 90, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
            className="flex"
          >
            {isDark ? <MoonIcon /> : <SunIcon />}
          </motion.span>
        </AnimatePresence>
      </TooltipTrigger>
      <TooltipContent>
        Toggle theme <Kbd>D</Kbd>
      </TooltipContent>
    </Tooltip>
  )
}
