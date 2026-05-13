import { verifySession } from "@/lib/dal"
import { UserProvider } from "@/lib/user-context"
import { InventoryContent } from "./content"

export default async function InventoryPage() {
  const session = await verifySession()
  return (
    <UserProvider value={{ userId: session.userId, role: session.role, name: session.name }}>
      <InventoryContent />
    </UserProvider>
  )
}
