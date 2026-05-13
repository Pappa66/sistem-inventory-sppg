import { verifySession } from "@/lib/dal"
import { UserProvider } from "@/lib/user-context"
import { DashboardContent } from "./content"

export default async function DashboardPage() {
  const session = await verifySession()
  return (
    <UserProvider value={{ userId: session.userId, role: session.role, name: session.name }}>
      <DashboardContent />
    </UserProvider>
  )
}
