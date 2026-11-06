"use client"

import { motion } from "motion/react"

/**
 * Templates remount on every navigation, so each page gets its own entrance:
 * a soft rise + de-blur. Children use <Reveal> for their own staggered beats.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-1 flex-col"
    >
      {children}
    </motion.div>
  )
}
