"use server"

import bcrypt from "bcryptjs"
import { supabaseAdmin } from "./supabase"
import { createSession, deleteSession } from "./session"
import { redirect } from "next/navigation"

type LoginState = { error?: string } | undefined

export async function login(state: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email dan password wajib diisi" }
  }

  const { data: user, error } = await supabaseAdmin
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

  if (!await bcrypt.compare(password, user.password)) {
    return { error: "Password salah" }
  }

  await createSession(user.id, user.role, user.name)
  redirect("/dashboard")
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}
