import type { Metadata } from "next"

import { ToolLauncher } from "@/components/admin/tool-launcher"

export const metadata: Metadata = { title: "Admin" }

export default function AdminPage() {
  return <ToolLauncher />
}
