import { verifySession } from "@/lib/dal"
import { redirect } from "next/navigation"
import { UserProvider } from "@/lib/user-context"
import { HeadChefContent } from "./content"

export default async function HeadChefPage() {
  const session = await verifySession()
  if (session.role !== "HEAD_CHEF") redirect("/dashboard")
  return (
    <UserProvider value={{ userId: session.userId, role: session.role, name: session.name }}>
      <HeadChefContent />
    </UserProvider>
  )
}
