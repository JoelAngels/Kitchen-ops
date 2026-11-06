"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

import { formatNumber } from "@/lib/format"

gsap.registerPlugin(useGSAP)

/**
 * Counts from the previous value to the new one with GSAP.
 * Re-runs whenever `value` changes, so filters feel alive.
 */
export function AnimatedNumber({
  value,
  format = formatNumber,
  duration = 1.1,
  className,
}: {
  value: number
  format?: (n: number) => string
  duration?: number
  className?: string
}) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const current = React.useRef({ n: 0 })

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
      gsap.to(current.current, {
        n: value,
        duration: reduce ? 0 : duration,
        ease: "power3.out",
        onUpdate: () => {
          if (ref.current) ref.current.textContent = format(current.current.n)
        },
      })
    },
    { dependencies: [value], scope: ref }
  )

  return (
    <span ref={ref} className={className} aria-label={format(value)}>
      {format(0)}
    </span>
  )
}
