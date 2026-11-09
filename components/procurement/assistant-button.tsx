"use client"

import { motion } from "motion/react"
import { SparklesIcon } from "lucide-react"
import { toast } from "sonner"

export function ProcurementAssistantButton() {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 24 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() =>
        toast("Procurement Assistant is coming soon", {
          description:
            "Ask about stock levels, reorders and food cost in plain words.",
        })
      }
      className="fixed right-4 bottom-4 z-30 inline-flex h-11 items-center gap-2 rounded-full bg-violet-600 px-4 text-sm font-medium text-white shadow-lg shadow-violet-600/30 outline-none focus-visible:ring-4 focus-visible:ring-violet-500/40 lg:right-6 lg:bottom-6"
    >
      <SparklesIcon className="size-4" />
      <span className="hidden sm:inline">Procurement Assistant</span>
    </motion.button>
  )
}
