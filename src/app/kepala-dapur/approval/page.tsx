import { verifySession } from "@/lib/dal"
import { redirect } from "next/navigation"
import { UserProvider } from "@/lib/user-context"
import { ApprovalContent } from "./content"

export default async function ApprovalPage() {
  const session = await verifySession()
  if (session.role !== "KEPALA_DAPUR") redirect("/dashboard")

  return (
    <UserProvider value={{ userId: session.userId, role: session.role, name: session.name }}>
      <ApprovalContent />
    </UserProvider>
  )
}
