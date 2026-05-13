import { verifySession } from "@/lib/dal"
import { redirect } from "next/navigation"
import { UserProvider } from "@/lib/user-context"
import { MasterDataContent } from "./content"

export default async function MasterDataPage() {
  const session = await verifySession()
  if (!["ADMIN", "ASISTEN_LAPANGAN", "STAFF_LAPANGAN"].includes(session.role)) redirect("/dashboard")
  return (
    <UserProvider value={{ userId: session.userId, role: session.role, name: session.name }}>
      <MasterDataContent />
    </UserProvider>
  )
}
