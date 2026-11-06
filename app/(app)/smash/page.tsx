import type { Metadata } from "next"

import { ComingSoon } from "@/components/coming-soon"

export const metadata: Metadata = { title: "Smash" }

export default function SmashPage() {
  return <ComingSoon title="Smash" description="Kitchen display for the smash grill: live tickets and timers" />
}
