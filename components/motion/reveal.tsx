"use client"

import { motion, type HTMLMotionProps, type Variants } from "motion/react"

export const EASE_OUT = [0.22, 1, 0.36, 1] as const

const containerVariants: Variants = {
  hidden: {},
  show: (stagger: number = 0.05) => ({
    transition: { staggerChildren: stagger, delayChildren: 0.04 },
  }),
}

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transitionEnd: { filter: "none" },
    transition: { duration: 0.5, ease: EASE_OUT },
  },
}

/** Staggers the entrance of every <RevealItem> inside it. */
export function Reveal({
  stagger = 0.05,
  ...props
}: HTMLMotionProps<"div"> & { stagger?: number }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      custom={stagger}
      {...props}
    />
  )
}

export function RevealItem(props: HTMLMotionProps<"div">) {
  return <motion.div variants={itemVariants} {...props} />
}
