import type { Metadata } from "next"

import { RolesPrivileges } from "@/components/staff/roles-privileges"

export const metadata: Metadata = { title: "Roles & Privileges" }

export default function Page() {
  return <RolesPrivileges />
}
