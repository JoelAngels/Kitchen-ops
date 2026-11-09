import { redirect } from "next/navigation"

import { procurementHref } from "@/lib/mock/procurement"

export default function ProcurementPage() {
  redirect(procurementHref("inventory"))
}
