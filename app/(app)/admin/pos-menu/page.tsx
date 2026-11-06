import type { Metadata } from "next"

import { PosMenu } from "@/components/menu/pos-menu"

export const metadata: Metadata = { title: "POS Menu" }

export default function Page() {
  return <PosMenu />
}
