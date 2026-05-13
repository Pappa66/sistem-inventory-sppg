-- ======================================
-- SPPG INVENTORY - FULL SETUP
-- Jalankan di Supabase SQL Editor
-- ======================================

-- 1. ENUMS (safe creation)
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('ADMIN', 'AKUNTAN', 'KEPALA_DAPUR', 'HEAD_CHEF', 'ASISTEN_LAPANGAN', 'STAFF_LAPANGAN');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "TipePembelian" AS ENUM ('STOK', 'OPERASIONAL');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "StatusPembelian" AS ENUM ('DRAFT', 'VERIFIED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "StatusVerifikasi" AS ENUM ('MENUNGGU', 'VALID', 'DITOLAK');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. TABLES (no FKs yet)
CREATE TABLE IF NOT EXISTS "User" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "email" TEXT NOT NULL, "password" TEXT NOT NULL, "name" TEXT NOT NULL, "role" "Role" NOT NULL, "isActive" BOOLEAN NOT NULL DEFAULT true, "noWa" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS "KategoriBarang" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "nama" TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS "Satuan" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "nama" TEXT NOT NULL, "singkatan" TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS "Barang" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "kode" TEXT NOT NULL, "nama" TEXT NOT NULL, "kategoriId" TEXT NOT NULL, "satuanId" TEXT NOT NULL, "stokMinimum" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS "Resep" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "userId" TEXT NOT NULL, "nama" TEXT NOT NULL, "deskripsi" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS "ResepBahan" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "resepId" TEXT NOT NULL, "barangId" TEXT NOT NULL, "jumlah" DOUBLE PRECISION NOT NULL);
CREATE TABLE IF NOT EXISTS "MenuPlan" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "userId" TEXT NOT NULL, "tanggal" TIMESTAMP(3) NOT NULL, "hari" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS "MenuPlanItem" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "menuPlanId" TEXT NOT NULL, "resepId" TEXT NOT NULL, "porsi" INTEGER NOT NULL DEFAULT 1, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS "Pembelian" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "userId" TEXT NOT NULL, "tipe" "TipePembelian" NOT NULL, "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "total" DOUBLE PRECISION, "keterangan" TEXT, "fotoStruk" TEXT, "status" "StatusPembelian" NOT NULL DEFAULT 'DRAFT', "verifiedById" TEXT, "verifiedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS "PembelianItem" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "pembelianId" TEXT NOT NULL, "barangId" TEXT, "namaBarang" TEXT, "jumlah" DOUBLE PRECISION, "satuan" TEXT, "hargaSatuan" DOUBLE PRECISION, "subtotal" DOUBLE PRECISION, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS "Verifikasi" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "pembelianId" TEXT NOT NULL, "userId" TEXT NOT NULL, "catatan" TEXT, "status" "StatusVerifikasi" NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS "Stok" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "barangId" TEXT NOT NULL, "jumlah" DOUBLE PRECISION NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS "StokBatch" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "stokId" TEXT NOT NULL, "noBatch" TEXT, "tanggalExp" TIMESTAMP(3), "jumlah" DOUBLE PRECISION NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS "Opname" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "userId" TEXT NOT NULL, "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "catatan" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS "OpnameItem" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "opnameId" TEXT NOT NULL, "barangId" TEXT NOT NULL, "stokSistem" DOUBLE PRECISION NOT NULL, "stokFisik" DOUBLE PRECISION NOT NULL, "selisih" DOUBLE PRECISION NOT NULL);
CREATE TABLE IF NOT EXISTS "BarangMasuk" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "userId" TEXT NOT NULL, "pembelianId" TEXT, "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "catatan" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS "BarangMasukItem" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "barangMasukId" TEXT NOT NULL, "barangId" TEXT NOT NULL, "jumlah" DOUBLE PRECISION NOT NULL, "tanggalExp" TIMESTAMP(3));
CREATE TABLE IF NOT EXISTS "BarangKeluar" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "userId" TEXT NOT NULL, "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "alasan" TEXT NOT NULL, "catatan" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS "BarangKeluarItem" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "barangKeluarId" TEXT NOT NULL, "barangId" TEXT NOT NULL, "jumlah" DOUBLE PRECISION NOT NULL);
CREATE TABLE IF NOT EXISTS "Waste" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "userId" TEXT NOT NULL, "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "alasan" TEXT NOT NULL, "catatan" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS "WasteItem" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "wasteId" TEXT NOT NULL, "barangId" TEXT NOT NULL, "jumlah" DOUBLE PRECISION NOT NULL);
CREATE TABLE IF NOT EXISTS "AuditLog" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "userId" TEXT NOT NULL, "action" TEXT NOT NULL, "entity" TEXT NOT NULL, "entityId" TEXT NOT NULL, "oldValue" JSONB, "newValue" JSONB, "alasanEdit" TEXT, "ipAddress" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);

-- 3. PRIMARY KEYS & INDEXES
DO $$ BEGIN ALTER TABLE "User" ADD PRIMARY KEY ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
DO $$ BEGIN ALTER TABLE "KategoriBarang" ADD PRIMARY KEY ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
CREATE INDEX IF NOT EXISTS "KategoriBarang_nama_idx" ON "KategoriBarang"("nama");
DO $$ BEGIN ALTER TABLE "Satuan" ADD PRIMARY KEY ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
CREATE INDEX IF NOT EXISTS "Satuan_nama_idx" ON "Satuan"("nama");
DO $$ BEGIN ALTER TABLE "Barang" ADD PRIMARY KEY ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
CREATE INDEX IF NOT EXISTS "Barang_kode_idx" ON "Barang"("kode");
DO $$ BEGIN ALTER TABLE "Resep" ADD PRIMARY KEY ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "ResepBahan" ADD PRIMARY KEY ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "MenuPlan" ADD PRIMARY KEY ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "MenuPlanItem" ADD PRIMARY KEY ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "Pembelian" ADD PRIMARY KEY ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "PembelianItem" ADD PRIMARY KEY ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "Verifikasi" ADD PRIMARY KEY ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "Stok" ADD PRIMARY KEY ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "StokBatch" ADD PRIMARY KEY ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "Opname" ADD PRIMARY KEY ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "OpnameItem" ADD PRIMARY KEY ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "BarangMasuk" ADD PRIMARY KEY ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "BarangMasukItem" ADD PRIMARY KEY ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "BarangKeluar" ADD PRIMARY KEY ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "BarangKeluarItem" ADD PRIMARY KEY ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "Waste" ADD PRIMARY KEY ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "WasteItem" ADD PRIMARY KEY ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "AuditLog" ADD PRIMARY KEY ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 4. FOREIGN KEYS (safe creation)
DO $$ BEGIN ALTER TABLE "Barang" ADD CONSTRAINT "Barang_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "KategoriBarang"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "Barang" ADD CONSTRAINT "Barang_satuanId_fkey" FOREIGN KEY ("satuanId") REFERENCES "Satuan"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "Resep" ADD CONSTRAINT "Resep_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "ResepBahan" ADD CONSTRAINT "ResepBahan_resepId_fkey" FOREIGN KEY ("resepId") REFERENCES "Resep"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "ResepBahan" ADD CONSTRAINT "ResepBahan_barangId_fkey" FOREIGN KEY ("barangId") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "MenuPlan" ADD CONSTRAINT "MenuPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "MenuPlanItem" ADD CONSTRAINT "MenuPlanItem_menuPlanId_fkey" FOREIGN KEY ("menuPlanId") REFERENCES "MenuPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "MenuPlanItem" ADD CONSTRAINT "MenuPlanItem_resepId_fkey" FOREIGN KEY ("resepId") REFERENCES "Resep"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "Pembelian" ADD CONSTRAINT "Pembelian_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "PembelianItem" ADD CONSTRAINT "PembelianItem_pembelianId_fkey" FOREIGN KEY ("pembelianId") REFERENCES "Pembelian"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "PembelianItem" ADD CONSTRAINT "PembelianItem_barangId_fkey" FOREIGN KEY ("barangId") REFERENCES "Barang"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "Verifikasi" ADD CONSTRAINT "Verifikasi_pembelianId_fkey" FOREIGN KEY ("pembelianId") REFERENCES "Pembelian"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "Verifikasi" ADD CONSTRAINT "Verifikasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "Stok" ADD CONSTRAINT "Stok_barangId_fkey" FOREIGN KEY ("barangId") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "StokBatch" ADD CONSTRAINT "StokBatch_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES "Stok"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "Opname" ADD CONSTRAINT "Opname_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "OpnameItem" ADD CONSTRAINT "OpnameItem_opnameId_fkey" FOREIGN KEY ("opnameId") REFERENCES "Opname"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "OpnameItem" ADD CONSTRAINT "OpnameItem_barangId_fkey" FOREIGN KEY ("barangId") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "BarangMasuk" ADD CONSTRAINT "BarangMasuk_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "BarangMasuk" ADD CONSTRAINT "BarangMasuk_pembelianId_fkey" FOREIGN KEY ("pembelianId") REFERENCES "Pembelian"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "BarangMasukItem" ADD CONSTRAINT "BarangMasukItem_barangMasukId_fkey" FOREIGN KEY ("barangMasukId") REFERENCES "BarangMasuk"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "BarangMasukItem" ADD CONSTRAINT "BarangMasukItem_barangId_fkey" FOREIGN KEY ("barangId") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "BarangKeluar" ADD CONSTRAINT "BarangKeluar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "BarangKeluarItem" ADD CONSTRAINT "BarangKeluarItem_barangKeluarId_fkey" FOREIGN KEY ("barangKeluarId") REFERENCES "BarangKeluar"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "BarangKeluarItem" ADD CONSTRAINT "BarangKeluarItem_barangId_fkey" FOREIGN KEY ("barangId") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "Waste" ADD CONSTRAINT "Waste_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "WasteItem" ADD CONSTRAINT "WasteItem_wasteId_fkey" FOREIGN KEY ("wasteId") REFERENCES "Waste"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "WasteItem" ADD CONSTRAINT "WasteItem_barangId_fkey" FOREIGN KEY ("barangId") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ======================================
-- 5. SEED DATA
-- ======================================

-- Admin (password: admin123)
INSERT INTO "User" (id, email, password, name, role, "isActive", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@sppg.com',
  '$2b$12$2P4bOxea698BVyQxEco/SORC.0dKp/Uqba9Zlf0oNiQvLxa8.M7jO',
  'Super Admin',
  'ADMIN',
  true,
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Kategori
INSERT INTO "KategoriBarang" (id, nama) VALUES
  (gen_random_uuid()::text, 'Sembako'),
  (gen_random_uuid()::text, 'Lauk Pauk'),
  (gen_random_uuid()::text, 'Sayuran'),
  (gen_random_uuid()::text, 'Buah'),
  (gen_random_uuid()::text, 'Bumbu'),
  (gen_random_uuid()::text, 'Minuman')
ON CONFLICT (nama) DO NOTHING;

-- Satuan
INSERT INTO "Satuan" (id, nama, singkatan) VALUES
  (gen_random_uuid()::text, 'Kilogram', 'kg'),
  (gen_random_uuid()::text, 'Gram', 'gr'),
  (gen_random_uuid()::text, 'Liter', 'L'),
  (gen_random_uuid()::text, 'MiliLiter', 'ml'),
  (gen_random_uuid()::text, 'Butir', 'bt'),
  (gen_random_uuid()::text, 'Ikat', 'ik'),
  (gen_random_uuid()::text, 'Bungkus', 'bg'),
  (gen_random_uuid()::text, 'Porsi', 'ps')
ON CONFLICT (nama) DO NOTHING;
