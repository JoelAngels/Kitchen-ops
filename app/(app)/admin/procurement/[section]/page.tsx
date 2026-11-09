import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ComingSoon } from "@/components/coming-soon"
import { PROCUREMENT_NAV, findProcurementSection } from "@/lib/mock/procurement"

// Sections with their own route folder; the rest fall back to the placeholder.
const BUILT = new Set(["inventory", "stock"])

export function generateStaticParams() {
  return PROCUREMENT_NAV.filter((s) => !BUILT.has(s.slug)).map((s) => ({
    section: s.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>
}): Promise<Metadata> {
  const { section } = await params
  const s = findProcurementSection(section)
  return { title: s ? `${s.title} · Procurement` : "Procurement" }
}

export default async function ProcurementSectionPage({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const { section } = await params
  const s = findProcurementSection(section)
  if (!s || BUILT.has(section)) notFound()
  return <ComingSoon title={s.title} description={s.description} />
}
