import type { Metadata } from "next"

import { StockView } from "@/components/procurement/stock-view"

export const metadata: Metadata = { title: "Stock · Procurement" }

export default function StockPage() {
  return <StockView />
}
