import type { Metadata } from "next"

import { UserManagement } from "@/components/staff/user-management"

export const metadata: Metadata = { title: "User Management" }

export default function Page() {
  return <UserManagement />
}
