import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ComingSoon } from "@/components/coming-soon"
import { ALL_TOOLS, findTool } from "@/lib/tamu-data"

// Tools with their own route folder; the rest fall back to the placeholder.
const BUILT = new Set([
  "analytics",
  "order-history",
  "payment-transactions",
  "smash-tickets",
  "adjustments",
  "report-subscriptions",
  "restaurant-settings",
  "users",
  "roles",
  "pos-menu",
  "item-options",
  "delivery",
])

export function generateStaticParams() {
  return ALL_TOOLS.filter((t) => !BUILT.has(t.slug)).map((t) => ({ tool: t.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }): Promise<Metadata> {
  const { tool } = await params
  return { title: findTool(tool)?.title ?? "Admin" }
}

export default async function ToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params
  if (!findTool(tool)) notFound()
  return <ComingSoon slug={tool} />
}
