"use client"

import { MotionConfig } from "motion/react"

/** Global motion defaults. Honors the OS "reduce motion" setting everywhere. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
    >
      {children}
    </MotionConfig>
  )
}
