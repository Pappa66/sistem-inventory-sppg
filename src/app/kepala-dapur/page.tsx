import { verifySession } from "@/lib/dal"
import { redirect } from "next/navigation"
import { UserProvider } from "@/lib/user-context"
import { KepalaDapurContent } from "./content"

export default async function KepalaDapurPage() {
  const session = await verifySession()
  if (session.role !== "KEPALA_DAPUR") redirect("/dashboard")

  return (
    <UserProvider value={{ userId: session.userId, role: session.role, name: session.name }}>
      <KepalaDapurContent />
    </UserProvider>
  )
}
