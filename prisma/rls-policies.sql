-- ======================================
-- RLS POLICIES - SPPG INVENTORY
-- Jalankan di Supabase SQL Editor setelah
-- menjalankan seed-full.sql
-- ======================================

-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Barang" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KategoriBarang" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Satuan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Resep" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ResepBahan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MenuPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MenuPlanItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Pembelian" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PembelianItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Verifikasi" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Stok" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StokBatch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Opname" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OpnameItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BarangMasuk" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BarangMasukItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BarangKeluar" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BarangKeluarItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Waste" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WasteItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all data
CREATE POLICY "Authenticated users can read users" ON "User" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read barang" ON "Barang" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read kategori" ON "KategoriBarang" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read satuan" ON "Satuan" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read resep" ON "Resep" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read resepbahan" ON "ResepBahan" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read menuplan" ON "MenuPlan" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read menuplanitem" ON "MenuPlanItem" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read pembelian" ON "Pembelian" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read pembelianitem" ON "PembelianItem" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read verifikasi" ON "Verifikasi" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read stok" ON "Stok" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read stokbatch" ON "StokBatch" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read opname" ON "Opname" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read opnameitem" ON "OpnameItem" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read barangmasuk" ON "BarangMasuk" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read barangmasukitem" ON "BarangMasukItem" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read barangkeluar" ON "BarangKeluar" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read barangkeluaritem" ON "BarangKeluarItem" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read waste" ON "Waste" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read wasteitem" ON "WasteItem" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read auditlog" ON "AuditLog" FOR SELECT USING (auth.role() = 'authenticated');

-- Insert/Update/Delete policies per role
-- Admin: full access
CREATE POLICY "Admin can insert users" ON "User" FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');
CREATE POLICY "Admin can update users" ON "User" FOR UPDATE USING (auth.jwt() ->> 'role' = 'ADMIN');
CREATE POLICY "Admin can delete users" ON "User" FOR DELETE USING (auth.jwt() ->> 'role' = 'ADMIN');
CREATE POLICY "Admin can manage audit log" ON "AuditLog" FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Barang: Admin, Asisten, Staff can manage
CREATE POLICY "Can insert barang" ON "Barang" FOR INSERT WITH CHECK (auth.jwt() ->> 'role' IN ('ADMIN', 'ASISTEN_LAPANGAN', 'STAFF_LAPANGAN'));
CREATE POLICY "Can update barang" ON "Barang" FOR UPDATE USING (auth.jwt() ->> 'role' IN ('ADMIN', 'ASISTEN_LAPANGAN', 'STAFF_LAPANGAN'));

-- Kategori & Satuan: same as Barang
CREATE POLICY "Can insert kategori" ON "KategoriBarang" FOR INSERT WITH CHECK (auth.jwt() ->> 'role' IN ('ADMIN', 'ASISTEN_LAPANGAN', 'STAFF_LAPANGAN'));
CREATE POLICY "Can insert satuan" ON "Satuan" FOR INSERT WITH CHECK (auth.jwt() ->> 'role' IN ('ADMIN', 'ASISTEN_LAPANGAN', 'STAFF_LAPANGAN'));

-- Pembelian: Asisten Lapangan insert, Akuntan/Kepala Dapur update
CREATE POLICY "Can insert pembelian" ON "Pembelian" FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'ASISTEN_LAPANGAN');
CREATE POLICY "Can update pembelian" ON "Pembelian" FOR UPDATE USING (auth.jwt() ->> 'role' IN ('AKUNTAN', 'KEPALA_DAPUR'));

-- Stok: auto-updated via RPC, allow all authenticated inserts/updates
CREATE POLICY "Can manage stok" ON "Stok" FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Can manage stokbatch" ON "StokBatch" FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Opname: Staff Lapangan
CREATE POLICY "Can manage opname" ON "Opname" FOR ALL USING (auth.jwt() ->> 'role' = 'STAFF_LAPANGAN') WITH CHECK (auth.jwt() ->> 'role' = 'STAFF_LAPANGAN');
CREATE POLICY "Can manage opnameitem" ON "OpnameItem" FOR ALL USING (auth.jwt() ->> 'role' = 'STAFF_LAPANGAN') WITH CHECK (auth.jwt() ->> 'role' = 'STAFF_LAPANGAN');
