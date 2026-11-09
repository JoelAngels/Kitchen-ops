import { ProcurementAssistantButton } from "@/components/procurement/assistant-button"

export default function ProcurementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <ProcurementAssistantButton />
    </>
  )
}
