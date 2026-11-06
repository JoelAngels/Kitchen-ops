import type { Metadata } from "next"

import { PaymentTransactions } from "@/components/payments/payment-transactions"

export const metadata: Metadata = { title: "Payment Transactions" }

export default function PaymentTransactionsPage() {
  return <PaymentTransactions />
}
