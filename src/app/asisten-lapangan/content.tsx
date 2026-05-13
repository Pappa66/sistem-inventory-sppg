"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/user-context"
import { toast } from "sonner"
import { PageWrapper, ContentCard, DataGrid } from "@/components/layout-utils"
import { EmptyState } from "@/components/ui/empty-state"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, ArrowUp, Camera } from "lucide-react"
import { PageHeader } from "@/components/page-header"

type Barang = { id: string; nama: string }

interface PembelianRow {
  id: string
  tipe: "STOK" | "OPERASIONAL"
  total: number | null
  keterangan: string | null
  fotoStruk: string | null
  status: string
  createdAt: string
  PembelianItem: Array<{
    id: string
    barangId: string | null
    namaBarang: string | null
    jumlah: number | null
    hargaSatuan: number | null
    subtotal: number | null
    Barang: { nama: string } | null
  }>
}

export function AsistenContent() {
  const { userId } = useUser()
  const [tipe, setTipe] = useState<"STOK" | "OPERASIONAL">("STOK")
  const [barangs, setBarangs] = useState<Barang[]>([])
  const [barangId, setBarangId] = useState("")
  const [namaBarang, setNamaBarang] = useState("")
  const [jumlah, setJumlah] = useState("")
  const [hargaSatuan, setHargaSatuan] = useState("")
  const [keterangan, setKeterangan] = useState("")
  const [transport, setTransport] = useState("")
  const [fotoStruk, setFotoStruk] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [purchases, setPurchases] = useState<PembelianRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchToday = useCallback(async () => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    const { data } = await supabase
      .from("Pembelian")
      .select("*, PembelianItem(*, Barang(nama))")
      .gte("createdAt", d.toISOString())
      .order("createdAt", { ascending: false })
    if (data) setPurchases(data as unknown as PembelianRow[])
    setLoading(false)
  }, [])

  useEffect(() => {
    supabase.from("Barang").select("id, nama").order("nama").then((r) => {
      if (r.data) setBarangs(r.data)
    })
    fetchToday()
  }, [fetchToday])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      let fotoStrukUrl: string | null = null
      if (fotoStruk) {
        const ext = fotoStruk.name.split(".").pop()
        const fileName = `${crypto.randomUUID()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from("struk")
          .upload(fileName, fotoStruk)
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("struk")
            .getPublicUrl(fileName)
          fotoStrukUrl = urlData.publicUrl
        } else {
          toast.error("Upload struk gagal: " + uploadError.message)
        }
      }

      const total =
        tipe === "STOK"
          ? Number(jumlah) * Number(hargaSatuan)
          : Number(transport)

      const { data: pembelian, error } = await supabase
        .from("Pembelian")
        .insert({
          userId,
          tipe,
          total,
          keterangan: keterangan || null,
          fotoStruk: fotoStrukUrl,
          status: "DRAFT",
        })
        .select()
        .single()

      if (error) {
        toast.error(error.message)
        return
      }

      if (tipe === "STOK") {
        await supabase.from("PembelianItem").insert({
          pembelianId: pembelian.id,
          barangId,
          jumlah: Number(jumlah),
          hargaSatuan: Number(hargaSatuan),
          subtotal: total,
        })

        await supabase.from("BarangMasuk").insert({
          userId,
          pembelianId: pembelian.id,
          catatan: `Pembelian stok: ${barangs.find((b) => b.id === barangId)?.nama}`,
        })

        const { data: existingStok } = await supabase
          .from("Stok")
          .select("id, jumlah")
          .eq("barangId", barangId)
          .maybeSingle()

        if (existingStok) {
          await supabase
            .from("Stok")
            .update({ jumlah: existingStok.jumlah + Number(jumlah) })
            .eq("id", existingStok.id)
        } else {
          await supabase
            .from("Stok")
            .insert({ barangId, jumlah: Number(jumlah) })
        }
      }

      toast.success("Pembelian berhasil dicatat!")
      setBarangId("")
      setJumlah("")
      setHargaSatuan("")
      setKeterangan("")
      setTransport("")
      setNamaBarang("")
      setFotoStruk(null)
      fetchToday()
    } finally {
      setSubmitting(false)
    }
  }

  const totalHariIni = purchases.reduce((sum, p) => sum + (p.total ?? 0), 0)

  return (
    <PageWrapper>
      <PageHeader title="Asisten Lapangan" description="Input pembelian harian" />
      <DataGrid cols="2">
        <ContentCard>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Package className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Pembelian Hari Ini</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 0,
                }).format(totalHariIni)}
              </p>
            </div>
          </div>
        </ContentCard>
        <ContentCard>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <ArrowUp className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Jumlah Transaksi</p>
              <p className="text-2xl font-bold">{purchases.length}</p>
            </div>
          </div>
        </ContentCard>
      </DataGrid>

      <ContentCard header="Input Pembelian">
        <Tabs value={tipe} onValueChange={(v) => setTipe(v as "STOK" | "OPERASIONAL")}>
          <TabsList className="mb-4">
            <TabsTrigger value="STOK">Stok</TabsTrigger>
            <TabsTrigger value="OPERASIONAL">Operasional</TabsTrigger>
          </TabsList>

            <form onSubmit={handleSubmit} className="space-y-4">
              <TabsContent value="STOK" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="barang">Barang</Label>
                  <Select value={barangId} onValueChange={(v) => setBarangId(v ?? "")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Barang" />
                    </SelectTrigger>
                    <SelectContent>
                      {barangs.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jumlah">Jumlah</Label>
                  <Input
                    id="jumlah"
                    type="number"
                    step="0.01"
                    value={jumlah}
                    onChange={(e) => setJumlah(e.target.value)}
                    placeholder="Jumlah"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="harga">Harga Satuan</Label>
                  <Input
                    id="harga"
                    type="number"
                    step="0.01"
                    value={hargaSatuan}
                    onChange={(e) => setHargaSatuan(e.target.value)}
                    placeholder="Harga Satuan"
                    required
                  />
                </div>
              </TabsContent>

              <TabsContent value="OPERASIONAL" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="namaPengeluaran">Nama Pengeluaran</Label>
                  <Input
                    id="namaPengeluaran"
                    value={namaBarang}
                    onChange={(e) => setNamaBarang(e.target.value)}
                    placeholder="Nama Pengeluaran (misal: Bensin Ojek)"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nominal">Nominal</Label>
                  <Input
                    id="nominal"
                    type="number"
                    step="0.01"
                    value={transport}
                    onChange={(e) => setTransport(e.target.value)}
                    placeholder="Nominal"
                    required
                  />
                </div>
              </TabsContent>

              <div className="space-y-2">
                <Label htmlFor="keterangan">Keterangan</Label>
                <Input
                  id="keterangan"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Keterangan (opsional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="foto">Upload Foto Struk</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="foto"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFotoStruk(e.target.files?.[0] ?? null)}
                    className="file:text-foreground"
                  />
                  <Camera className="size-5 shrink-0 text-muted-foreground" />
                </div>
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Menyimpan..." : "Simpan Pembelian"}
              </Button>
            </form>
          </Tabs>
      </ContentCard>

      <ContentCard header="Daftar Pembelian Hari Ini">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : purchases.length === 0 ? (
            <EmptyState title="Belum ada pembelian" description="Belum ada pembelian hari ini" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Barang</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Struk</TableHead>
                    <TableHead>Waktu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((p) => {
                  const item = p.PembelianItem?.[0]
                  const nama = item?.Barang?.nama ?? item?.namaBarang ?? "-"
                  const qty = item?.jumlah ?? "-"
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Badge variant={p.tipe === "STOK" ? "default" : "secondary"}>
                          {p.tipe}
                        </Badge>
                      </TableCell>
                      <TableCell>{nama}</TableCell>
                      <TableCell>{qty}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          maximumFractionDigits: 0,
                        }).format(p.total ?? 0)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{p.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {p.fotoStruk ? (
                          <a
                            href={p.fotoStruk}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary underline underline-offset-4"
                          >
                            Lihat
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(p.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            </div>
          )}
      </ContentCard>
    </PageWrapper>
  )
}
