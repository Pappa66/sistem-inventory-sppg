"use server"

import { createHash } from "crypto"
import { supabase } from "./supabase"
import { createSession, deleteSession } from "./session"
import { redirect } from "next/navigation"

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

type LoginState = { error?: string } | undefined

export async function login(state: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email dan password wajib diisi" }
  }

  const { data: user, error } = await supabase
    .from("User")
    .select("*")
    .eq("email", email)
    .single()

  if (error || !user) {
    return { error: "Email tidak terdaftar" }
  }

  if (!user.isActive) {
    return { error: "Akun tidak aktif, hubungi Admin" }
  }

  const hashed = hashPassword(password)
  if (user.password !== hashed) {
    return { error: "Password salah" }
  }

  await createSession(user.id, user.role, user.name)
  redirect("/dashboard")
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}
