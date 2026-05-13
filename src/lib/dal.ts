import "server-only"
import { cookies } from "next/headers"
import { cache } from "react"
import { redirect } from "next/navigation"
import { decrypt } from "./session"

export const verifySession = cache(async () => {
  const cookieStore = await cookies()
  const cookie = cookieStore.get("session")?.value
  const session = await decrypt(cookie)

  if (!session?.userId) {
    redirect("/login")
  }

  return { userId: session.userId, role: session.role, name: session.name }
})

export const getCurrentRole = cache(async () => {
  const session = await verifySession()
  return session.role
})
