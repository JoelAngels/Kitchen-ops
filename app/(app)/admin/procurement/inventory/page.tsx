import type { Metadata } from "next"

import { InventoryView } from "@/components/procurement/inventory-view"

export const metadata: Metadata = { title: "Inventory · Procurement" }

export default function InventoryPage() {
  return <InventoryView />
}
