import type { Metadata } from "next"

import { ComingSoon } from "@/components/coming-soon"

export const metadata: Metadata = { title: "Pickup" }

export default function PickupPage() {
  return <ComingSoon title="Pickup" description="Ready-for-pickup board for customers and riders" />
}
