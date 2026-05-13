import { verifySession } from "@/lib/dal"
import { redirect } from "next/navigation"
import { UserProvider } from "@/lib/user-context"
import { AdminContent } from "./content"

export default async function AdminPage() {
  const session = await verifySession()
  if (session.role !== "ADMIN") redirect("/dashboard")
  return (
    <UserProvider value={{ userId: session.userId, role: session.role, name: session.name }}>
      <AdminContent />
    </UserProvider>
  )
}
