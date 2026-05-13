"use server"

import bcrypt from "bcryptjs"
import { supabase } from "./supabase"
import { createSession, deleteSession } from "./session"
import { redirect } from "next/navigation"

type LoginState = { error?: string } | undefined

export async function login(state: LoginState, formData: FormData): Promise<LoginState> {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      return { error: "Email dan password wajib diisi" }
    }

    const { data: user, error: queryError } = await supabase
      .from("User")
      .select("*")
      .eq("email", email)
      .single()

    if (queryError) {
      return { error: "Gagal query user: " + queryError.message }
    }

    if (!user) {
      return { error: "Email tidak terdaftar" }
    }

    if (!user.isActive) {
      return { error: "Akun tidak aktif, hubungi Admin" }
    }

    if (!user.password) {
      return { error: "Password hash tidak ditemukan di database" }
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return { error: "Password salah" }
    }

    await createSession(user.id, user.role, user.name)
    redirect("/dashboard")
  } catch (err) {
    if (err && typeof err === 'object' && 'digest' in err && String(err.digest).startsWith('NEXT_REDIRECT')) {
      throw err
    }
    console.error("Login error:", err)
    return { error: err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga" }
  }
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}
