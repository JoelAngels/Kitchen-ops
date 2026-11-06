import type { Metadata } from "next"

import { SmashHistory } from "@/components/smash/smash-history"

export const metadata: Metadata = { title: "Smash Ticket History" }

export default function Page() {
  return <SmashHistory />
}
