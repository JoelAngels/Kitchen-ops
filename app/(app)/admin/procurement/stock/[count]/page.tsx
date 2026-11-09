import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { StockCountView } from "@/components/procurement/stock-count-view"
import { STOCK_COUNTS, findCount } from "@/lib/mock/procurement"

export function generateStaticParams() {
  return STOCK_COUNTS.map((c) => ({ count: c.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ count: string }>
}): Promise<Metadata> {
  const { count } = await params
  return { title: `Count ${count} · Procurement` }
}

export default async function StockCountPage({
  params,
}: {
  params: Promise<{ count: string }>
}) {
  const { count } = await params
  if (!findCount(count)) notFound()
  return <StockCountView id={count} />
}
