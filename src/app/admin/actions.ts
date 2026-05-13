"use server"

import { createHash } from "crypto"
import { supabase } from "@/lib/supabase"
import { verifySession } from "@/lib/dal"
import { createAuditLog } from "@/lib/audit"

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

export async function createUser(prev: unknown, formData: FormData) {
  const session = await verifySession()
  if (session.role !== "ADMIN") return { error: "Unauthorized" }

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as string
  const noWa = formData.get("noWa") as string

  if (!name || !email || !password || !role) {
    return { error: "Semua field wajib diisi" }
  }

  const validRoles = ["ADMIN", "AKUNTAN", "KEPALA_DAPUR", "HEAD_CHEF", "ASISTEN_LAPANGAN", "STAFF_LAPANGAN"]
  if (!validRoles.includes(role)) return { error: "Role tidak valid" }

  const { data: existing } = await supabase
    .from("User")
    .select("id")
    .eq("email", email)
    .single()

  if (existing) return { error: "Email sudah terdaftar" }

  const hashed = hashPassword(password)

  const { data, error } = await supabase
    .from("User")
    .insert({
      name,
      email,
      password: hashed,
      role,
      isActive: true,
      noWa: noWa || null,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  await createAuditLog({
    userId: session.userId,
    action: "CREATE",
    entity: "User",
    entityId: data.id,
    newValue: { name, email, role },
  })

  return { success: true }
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
  const session = await verifySession()
  if (session.role !== "ADMIN") return

  const { data: old } = await supabase.from("User").select("*").eq("id", userId).single()

  await supabase.from("User").update({ isActive }).eq("id", userId)

  await createAuditLog({
    userId: session.userId,
    action: "UPDATE",
    entity: "User",
    entityId: userId,
    oldValue: { isActive: old?.isActive },
    newValue: { isActive },
    alasanEdit: "Toggle status akun oleh Admin",
  })
}
