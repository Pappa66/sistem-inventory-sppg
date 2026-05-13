-- Tambah DEFAULT ke semua kolom id
ALTER TABLE "User" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "KategoriBarang" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Satuan" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Barang" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Resep" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "ResepBahan" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "MenuPlan" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "MenuPlanItem" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Pembelian" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "PembelianItem" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Verifikasi" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Stok" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "StokBatch" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Opname" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "OpnameItem" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "BarangMasuk" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "BarangMasukItem" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "BarangKeluar" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "BarangKeluarItem" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Waste" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "WasteItem" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "AuditLog" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- Tambah DEFAULT ke semua kolom updatedAt
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Barang" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Resep" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "MenuPlan" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Pembelian" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Stok" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Opname" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
