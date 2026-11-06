"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowLeftIcon, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function PageHeader({
  icon: Icon,
  title,
  description,
  back,
  actions,
  iconClassName,
}: {
  icon?: LucideIcon
  title: string
  description?: string
  back?: { href: string; label: string }
  actions?: React.ReactNode
  iconClassName?: string
}) {
  return (
    <div className="flex flex-col gap-4">
      {back && (
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Link
            href={back.href}
            className="group hit-area inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4 transition-transform group-hover:-translate-x-0.5" />
            {back.label}
          </Link>
        </motion.div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {Icon && (
            <motion.span
              initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 18,
                delay: 0.05,
              }}
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl bg-foreground text-background shadow-lg shadow-foreground/10",
                iconClassName
              )}
            >
              <Icon className="size-5" />
            </motion.span>
          )}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="text-2xl font-semibold tracking-tight"
            >
              {title}
            </motion.h1>
            {description && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="text-sm text-muted-foreground"
              >
                {description}
              </motion.p>
            )}
          </div>
        </div>
        {actions && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="flex flex-wrap items-center gap-2"
          >
            {actions}
          </motion.div>
        )}
      </div>
    </div>
  )
}
