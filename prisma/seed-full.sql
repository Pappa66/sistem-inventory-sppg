-- ======================================
-- SPPG INVENTORY - FULL SETUP
-- Jalankan di Supabase SQL Editor
-- ======================================

-- 1. ENUMS
CREATE TYPE "Role" AS ENUM ('ADMIN', 'AKUNTAN', 'KEPALA_DAPUR', 'HEAD_CHEF', 'ASISTEN_LAPANGAN', 'STAFF_LAPANGAN');
CREATE TYPE "TipePembelian" AS ENUM ('STOK', 'OPERASIONAL');
CREATE TYPE "StatusPembelian" AS ENUM ('DRAFT', 'VERIFIED', 'REJECTED');
CREATE TYPE "StatusVerifikasi" AS ENUM ('MENUNGGU', 'VALID', 'DITOLAK');

-- 2. TABLES (no FKs yet)
CREATE TABLE "User" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "email" TEXT NOT NULL, "password" TEXT NOT NULL, "name" TEXT NOT NULL, "role" "Role" NOT NULL, "isActive" BOOLEAN NOT NULL DEFAULT true, "noWa" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "KategoriBarang" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "nama" TEXT NOT NULL);
CREATE TABLE "Satuan" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "nama" TEXT NOT NULL, "singkatan" TEXT NOT NULL);
CREATE TABLE "Barang" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "kode" TEXT NOT NULL, "nama" TEXT NOT NULL, "kategoriId" TEXT NOT NULL, "satuanId" TEXT NOT NULL, "stokMinimum" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "Resep" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "userId" TEXT NOT NULL, "nama" TEXT NOT NULL, "deskripsi" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "ResepBahan" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "resepId" TEXT NOT NULL, "barangId" TEXT NOT NULL, "jumlah" DOUBLE PRECISION NOT NULL);
CREATE TABLE "MenuPlan" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "userId" TEXT NOT NULL, "tanggal" TIMESTAMP(3) NOT NULL, "hari" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "MenuPlanItem" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "menuPlanId" TEXT NOT NULL, "resepId" TEXT NOT NULL, "porsi" INTEGER NOT NULL DEFAULT 1, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "Pembelian" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "userId" TEXT NOT NULL, "tipe" "TipePembelian" NOT NULL, "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "total" DOUBLE PRECISION, "keterangan" TEXT, "fotoStruk" TEXT, "status" "StatusPembelian" NOT NULL DEFAULT 'DRAFT', "verifiedById" TEXT, "verifiedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "PembelianItem" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "pembelianId" TEXT NOT NULL, "barangId" TEXT, "namaBarang" TEXT, "jumlah" DOUBLE PRECISION, "satuan" TEXT, "hargaSatuan" DOUBLE PRECISION, "subtotal" DOUBLE PRECISION, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "Verifikasi" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "pembelianId" TEXT NOT NULL, "userId" TEXT NOT NULL, "catatan" TEXT, "status" "StatusVerifikasi" NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "Stok" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "barangId" TEXT NOT NULL, "jumlah" DOUBLE PRECISION NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "StokBatch" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "stokId" TEXT NOT NULL, "noBatch" TEXT, "tanggalExp" TIMESTAMP(3), "jumlah" DOUBLE PRECISION NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "Opname" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "userId" TEXT NOT NULL, "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "catatan" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "OpnameItem" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "opnameId" TEXT NOT NULL, "barangId" TEXT NOT NULL, "stokSistem" DOUBLE PRECISION NOT NULL, "stokFisik" DOUBLE PRECISION NOT NULL, "selisih" DOUBLE PRECISION NOT NULL);
CREATE TABLE "BarangMasuk" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "userId" TEXT NOT NULL, "pembelianId" TEXT, "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "catatan" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "BarangMasukItem" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "barangMasukId" TEXT NOT NULL, "barangId" TEXT NOT NULL, "jumlah" DOUBLE PRECISION NOT NULL, "tanggalExp" TIMESTAMP(3));
CREATE TABLE "BarangKeluar" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "userId" TEXT NOT NULL, "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "alasan" TEXT NOT NULL, "catatan" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "BarangKeluarItem" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "barangKeluarId" TEXT NOT NULL, "barangId" TEXT NOT NULL, "jumlah" DOUBLE PRECISION NOT NULL);
CREATE TABLE "Waste" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "userId" TEXT NOT NULL, "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "alasan" TEXT NOT NULL, "catatan" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "WasteItem" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "wasteId" TEXT NOT NULL, "barangId" TEXT NOT NULL, "jumlah" DOUBLE PRECISION NOT NULL);
CREATE TABLE "AuditLog" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "userId" TEXT NOT NULL, "action" TEXT NOT NULL, "entity" TEXT NOT NULL, "entityId" TEXT NOT NULL, "oldValue" JSONB, "newValue" JSONB, "alasanEdit" TEXT, "ipAddress" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);

-- 3. PRIMARY KEYS & INDEXES
ALTER TABLE "User" ADD PRIMARY KEY ("id"); CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
ALTER TABLE "KategoriBarang" ADD PRIMARY KEY ("id"); CREATE UNIQUE INDEX "KategoriBarang_nama_key" ON "KategoriBarang"("nama");
ALTER TABLE "Satuan" ADD PRIMARY KEY ("id"); CREATE UNIQUE INDEX "Satuan_nama_key" ON "Satuan"("nama");
ALTER TABLE "Barang" ADD PRIMARY KEY ("id"); CREATE UNIQUE INDEX "Barang_kode_key" ON "Barang"("kode");
ALTER TABLE "Resep" ADD PRIMARY KEY ("id");
ALTER TABLE "ResepBahan" ADD PRIMARY KEY ("id");
ALTER TABLE "MenuPlan" ADD PRIMARY KEY ("id");
ALTER TABLE "MenuPlanItem" ADD PRIMARY KEY ("id");
ALTER TABLE "Pembelian" ADD PRIMARY KEY ("id");
ALTER TABLE "PembelianItem" ADD PRIMARY KEY ("id");
ALTER TABLE "Verifikasi" ADD PRIMARY KEY ("id");
ALTER TABLE "Stok" ADD PRIMARY KEY ("id");
ALTER TABLE "StokBatch" ADD PRIMARY KEY ("id");
ALTER TABLE "Opname" ADD PRIMARY KEY ("id");
ALTER TABLE "OpnameItem" ADD PRIMARY KEY ("id");
ALTER TABLE "BarangMasuk" ADD PRIMARY KEY ("id");
ALTER TABLE "BarangMasukItem" ADD PRIMARY KEY ("id");
ALTER TABLE "BarangKeluar" ADD PRIMARY KEY ("id");
ALTER TABLE "BarangKeluarItem" ADD PRIMARY KEY ("id");
ALTER TABLE "Waste" ADD PRIMARY KEY ("id");
ALTER TABLE "WasteItem" ADD PRIMARY KEY ("id");
ALTER TABLE "AuditLog" ADD PRIMARY KEY ("id");

-- 4. FOREIGN KEYS
ALTER TABLE "Barang" ADD CONSTRAINT "Barang_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "KategoriBarang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Barang" ADD CONSTRAINT "Barang_satuanId_fkey" FOREIGN KEY ("satuanId") REFERENCES "Satuan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Resep" ADD CONSTRAINT "Resep_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResepBahan" ADD CONSTRAINT "ResepBahan_resepId_fkey" FOREIGN KEY ("resepId") REFERENCES "Resep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResepBahan" ADD CONSTRAINT "ResepBahan_barangId_fkey" FOREIGN KEY ("barangId") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MenuPlan" ADD CONSTRAINT "MenuPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MenuPlanItem" ADD CONSTRAINT "MenuPlanItem_menuPlanId_fkey" FOREIGN KEY ("menuPlanId") REFERENCES "MenuPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MenuPlanItem" ADD CONSTRAINT "MenuPlanItem_resepId_fkey" FOREIGN KEY ("resepId") REFERENCES "Resep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Pembelian" ADD CONSTRAINT "Pembelian_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PembelianItem" ADD CONSTRAINT "PembelianItem_pembelianId_fkey" FOREIGN KEY ("pembelianId") REFERENCES "Pembelian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PembelianItem" ADD CONSTRAINT "PembelianItem_barangId_fkey" FOREIGN KEY ("barangId") REFERENCES "Barang"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Verifikasi" ADD CONSTRAINT "Verifikasi_pembelianId_fkey" FOREIGN KEY ("pembelianId") REFERENCES "Pembelian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Verifikasi" ADD CONSTRAINT "Verifikasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Stok" ADD CONSTRAINT "Stok_barangId_fkey" FOREIGN KEY ("barangId") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StokBatch" ADD CONSTRAINT "StokBatch_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES "Stok"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Opname" ADD CONSTRAINT "Opname_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OpnameItem" ADD CONSTRAINT "OpnameItem_opnameId_fkey" FOREIGN KEY ("opnameId") REFERENCES "Opname"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OpnameItem" ADD CONSTRAINT "OpnameItem_barangId_fkey" FOREIGN KEY ("barangId") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BarangMasuk" ADD CONSTRAINT "BarangMasuk_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BarangMasuk" ADD CONSTRAINT "BarangMasuk_pembelianId_fkey" FOREIGN KEY ("pembelianId") REFERENCES "Pembelian"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BarangMasukItem" ADD CONSTRAINT "BarangMasukItem_barangMasukId_fkey" FOREIGN KEY ("barangMasukId") REFERENCES "BarangMasuk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BarangMasukItem" ADD CONSTRAINT "BarangMasukItem_barangId_fkey" FOREIGN KEY ("barangId") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BarangKeluar" ADD CONSTRAINT "BarangKeluar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BarangKeluarItem" ADD CONSTRAINT "BarangKeluarItem_barangKeluarId_fkey" FOREIGN KEY ("barangKeluarId") REFERENCES "BarangKeluar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BarangKeluarItem" ADD CONSTRAINT "BarangKeluarItem_barangId_fkey" FOREIGN KEY ("barangId") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Waste" ADD CONSTRAINT "Waste_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WasteItem" ADD CONSTRAINT "WasteItem_wasteId_fkey" FOREIGN KEY ("wasteId") REFERENCES "Waste"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WasteItem" ADD CONSTRAINT "WasteItem_barangId_fkey" FOREIGN KEY ("barangId") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ======================================
-- 5. SEED DATA
-- ======================================

-- Admin (password: admin123)
INSERT INTO "User" (id, email, password, name, role, "isActive", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@sppg.com',
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  'Super Admin',
  'ADMIN',
  true,
  NOW()
);

-- Kategori
INSERT INTO "KategoriBarang" (id, nama) VALUES
  (gen_random_uuid()::text, 'Sembako'),
  (gen_random_uuid()::text, 'Lauk Pauk'),
  (gen_random_uuid()::text, 'Sayuran'),
  (gen_random_uuid()::text, 'Buah'),
  (gen_random_uuid()::text, 'Bumbu'),
  (gen_random_uuid()::text, 'Minuman');

-- Satuan
INSERT INTO "Satuan" (id, nama, singkatan) VALUES
  (gen_random_uuid()::text, 'Kilogram', 'kg'),
  (gen_random_uuid()::text, 'Gram', 'gr'),
  (gen_random_uuid()::text, 'Liter', 'L'),
  (gen_random_uuid()::text, 'MiliLiter', 'ml'),
  (gen_random_uuid()::text, 'Butir', 'bt'),
  (gen_random_uuid()::text, 'Ikat', 'ik'),
  (gen_random_uuid()::text, 'Bungkus', 'bg'),
  (gen_random_uuid()::text, 'Porsi', 'ps');
