import { verifySession } from "@/lib/dal"
import { redirect } from "next/navigation"
import { UserProvider } from "@/lib/user-context"
import { MasukContent } from "./content"

export default async function BarangMasukPage() {
  const session = await verifySession()
  if (session.role !== "STAFF_LAPANGAN") redirect("/dashboard")
  return (
    <UserProvider value={{ userId: session.userId, role: session.role, name: session.name }}>
      <MasukContent />
    </UserProvider>
  )
}
