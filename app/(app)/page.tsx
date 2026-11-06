import type { Metadata } from "next"

import { OrdersBoard } from "@/components/orders/orders-board"

export const metadata: Metadata = { title: "Cashier" }

export default function CashierPage() {
  return <OrdersBoard />
}
