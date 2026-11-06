import type { Metadata } from "next"

import { DeliveryMonitor } from "@/components/delivery/delivery-monitor"

export const metadata: Metadata = { title: "Delivery Monitor" }

export default function Page() {
  return <DeliveryMonitor />
}
