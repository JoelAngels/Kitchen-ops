import type { Metadata } from "next"

import { ItemOptions } from "@/components/menu/item-options"

export const metadata: Metadata = { title: "Item Options" }

export default function Page() {
  return <ItemOptions />
}
