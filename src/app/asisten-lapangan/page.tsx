import { verifySession } from "@/lib/dal"
import { redirect } from "next/navigation"
import { UserProvider } from "@/lib/user-context"
import { AsistenContent } from "./content"

export default async function AsistenLapanganPage() {
  const session = await verifySession()
  if (session.role !== "ASISTEN_LAPANGAN") redirect("/dashboard")
  return (
    <UserProvider value={{ userId: session.userId, role: session.role, name: session.name }}>
      <AsistenContent />
    </UserProvider>
  )
}
