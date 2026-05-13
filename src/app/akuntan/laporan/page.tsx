import { verifySession } from "@/lib/dal"
import { redirect } from "next/navigation"
import { UserProvider } from "@/lib/user-context"
import { LaporanContent } from "./content"

export default async function LaporanPage() {
  const session = await verifySession()
  if (session.role !== "AKUNTAN") redirect("/dashboard")

  return (
    <UserProvider value={{ userId: session.userId, role: session.role, name: session.name }}>
      <LaporanContent />
    </UserProvider>
  )
}
