import type { Metadata } from "next"

import { RestaurantSettings } from "@/components/settings/restaurant-settings"

export const metadata: Metadata = { title: "Restaurant Settings" }

export default function Page() {
  return <RestaurantSettings />
}
