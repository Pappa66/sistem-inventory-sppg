// Run with: npx tsx scripts/seed.ts
import "dotenv/config"
import { createHash } from "crypto"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const DEFAULT_PASSWORD = "admin123"

async function seed() {
  const { createClient } = await import("@supabase/supabase-js")
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  const hashedPassword = createHash("sha256").update(DEFAULT_PASSWORD).digest("hex")

  // Create Super Admin
  const { data: admin, error } = await supabase
    .from("User")
    .insert({
      email: "admin@sppg.com",
      password: hashedPassword,
      name: "Super Admin",
      role: "ADMIN",
      isActive: true,
    })
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      console.log("Admin already exists")
    } else {
      console.error("Error creating admin:", error)
    }
  } else {
    console.log("Admin created:", admin.email)
  }

  // Create default kategori
  const kategoris = ["Sembako", "Lauk Pauk", "Sayuran", "Buah", "Bumbu", "Minuman"]
  for (const k of kategoris) {
    await supabase.from("KategoriBarang").insert({ nama: k }).select()
  }

  // Create default satuan
  const satuans = [
    { nama: "Kilogram", singkatan: "kg" },
    { nama: "Gram", singkatan: "gr" },
    { nama: "Liter", singkatan: "L" },
    { nama: "MiliLiter", singkatan: "ml" },
    { nama: "Butir", singkatan: "bt" },
    { nama: "Ikat", singkatan: "ik" },
    { nama: "Bungkus", singkatan: "bg" },
    { nama: "Porsi", singkatan: "ps" },
  ]
  for (const s of satuans) {
    await supabase.from("Satuan").insert(s).select()
  }

  console.log("Seed selesai!")
  console.log("Login: admin@sppg.com / admin123")
}

seed().catch(console.error)
