import type { Metadata } from "next"

import { ReportSubscriptions } from "@/components/reports/report-subscriptions"

export const metadata: Metadata = { title: "Report Subscriptions" }

export default function Page() {
  return <ReportSubscriptions />
}
