import type { Metadata } from "next"

import { OrderHistory } from "@/components/orders/order-history"

export const metadata: Metadata = { title: "Order History" }

export default function OrderHistoryPage() {
  return <OrderHistory />
}
