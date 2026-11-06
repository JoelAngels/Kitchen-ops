"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { RefreshCwIcon, TruckIcon } from "lucide-react"
import { toast } from "sonner"

import { DeliveriesTab } from "@/components/delivery/deliveries-tab"
import { DeliverySheet } from "@/components/delivery/delivery-sheet"
import { FeedbackTab } from "@/components/delivery/feedback-tab"
import { HandoffTab } from "@/components/delivery/handoff-tab"
import { InsightsTab } from "@/components/delivery/insights-tab"
import { LineTabs } from "@/components/line-tabs"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  MOCK_DELIVERIES,
  MOCK_LIVE,
  type Delivery,
} from "@/lib/mock/deliveries"

type Tab = "deliveries" | "feedback" | "handoff" | "insights"

export function DeliveryMonitor() {
  const [tab, setTab] = React.useState<Tab>("deliveries")
  const [live, setLive] = React.useState(MOCK_LIVE)
  const [refreshing, setRefreshing] = React.useState(false)
  const [selected, setSelected] = React.useState<Delivery | null>(null)
  const ratings = MOCK_DELIVERIES.filter((d) => d.rating).length

  const refresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      toast.success("Synced with Glovo", {
        description: "Statuses match what Glovo reports.",
      })
    }, 1100)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 lg:p-8">
      <PageHeader
        icon={TruckIcon}
        title="Delivery Monitor"
        description="Live Glovo deliveries: cancel, reassign, or re-sync when our status drifts"
        back={{ href: "/admin", label: "Back to Admin" }}
        actions={
          <Button variant="outline" onClick={refresh} disabled={refreshing}>
            <motion.span
              className="flex"
              animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={
                refreshing
                  ? { repeat: Infinity, duration: 0.8, ease: "linear" }
                  : { duration: 0 }
              }
            >
              <RefreshCwIcon />
            </motion.span>
            Sync with Glovo
          </Button>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <LineTabs<Tab>
          layoutId="delivery-tab"
          value={tab}
          onChange={setTab}
          className="overflow-x-auto"
          options={[
            {
              value: "deliveries",
              label: (
                <>
                  Deliveries
                  {live.length > 0 && (
                    <span className="flex items-center gap-1 rounded-full bg-success/10 px-1.5 text-xs text-success">
                      <span className="size-1.5 animate-pulse rounded-full bg-success" />
                      {live.length} live
                    </span>
                  )}
                </>
              ),
            },
            {
              value: "feedback",
              label: (
                <>
                  Feedback{" "}
                  <span className="text-xs text-muted-foreground">
                    ({ratings})
                  </span>
                </>
              ),
            },
            { value: "handoff", label: "Handoff timing" },
            { value: "insights", label: "Insights" },
          ]}
        />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
        >
          {tab === "deliveries" && (
            <DeliveriesTab live={live} setLive={setLive} onOpen={setSelected} />
          )}
          {tab === "feedback" && <FeedbackTab onOpen={setSelected} />}
          {tab === "handoff" && <HandoffTab onOpen={setSelected} />}
          {tab === "insights" && (
            <InsightsTab onOpen={setSelected} liveCount={live.length} />
          )}
        </motion.div>
      </AnimatePresence>

      <DeliverySheet delivery={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
