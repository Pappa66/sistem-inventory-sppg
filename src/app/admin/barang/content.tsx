"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"
import { PageHeader } from "@/components/page-header"

type Barang = {
  id: string
  kode: string
  nama: string
  kategori: { nama: string } | null
  satuan: { nama: string } | null
  stokMinimum: number
}

type Kategori = { id: string; nama: string }
type Satuan = { id: string; nama: string; singkatan: string }

export function MasterBarangContent() {
  const [barang, setBarang] = useState<Barang[]>([])
  const [kategoris, setKategoris] = useState<Kategori[]>([])
  const [satuans, setSatuans] = useState<Satuan[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [kode, setKode] = useState("")
  const [nama, setNama] = useState("")
  const [kategoriId, setKategoriId] = useState("")
  const [satuanId, setSatuanId] = useState("")
  const [stokMin, setStokMin] = useState("0")

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [barangRes, katRes, satRes] = await Promise.all([
      supabase
        .from("Barang")
        .select("*, kategori: kategoriId(nama), satuan: satuanId(nama)")
        .order("nama"),
      supabase.from("KategoriBarang").select("*").order("nama"),
      supabase.from("Satuan").select("*").order("nama"),
    ])
    if (barangRes.data) setBarang(barangRes.data as unknown as Barang[])
    if (katRes.data) setKategoris(katRes.data)
    if (satRes.data) setSatuans(satRes.data)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!kode || !nama || !kategoriId || !satuanId) {
      toast.error("Semua field wajib diisi")
      return
    }

    setSubmitting(true)
    const { error } = await supabase.from("Barang").insert({
      kode,
      nama,
      kategoriId,
      satuanId,
      stokMinimum: Number(stokMin),
    })
    setSubmitting(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success("Barang berhasil ditambahkan")
    setKode("")
    setNama("")
    setKategoriId("")
    setSatuanId("")
    setStokMin("0")
    loadData()
  }

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 space-y-8">
      <PageHeader title="Master Barang" description="Kelola data barang" />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="size-4" />
            Tambah Barang Baru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="kode">Kode Barang</Label>
              <Input id="kode" value={kode} onChange={(e) => setKode(e.target.value)} placeholder="Kode Barang" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nama">Nama Barang</Label>
              <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama Barang" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kategori">Kategori</Label>
              <Select value={kategoriId} onValueChange={(v) => v && setKategoriId(v)} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {kategoris.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="satuan">Satuan</Label>
              <Select value={satuanId} onValueChange={(v) => v && setSatuanId(v)} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Satuan" />
                </SelectTrigger>
                <SelectContent>
                  {satuans.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nama} ({s.singkatan})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stokMin">Stok Minimum</Label>
              <Input id="stokMin" type="number" value={stokMin} onChange={(e) => setStokMin(e.target.value)} placeholder="Stok Minimum" />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                {submitting ? "Menyimpan..." : "Tambah Barang"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Barang</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Satuan</TableHead>
                    <TableHead className="text-right">Stok Min</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {barang.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs">{b.kode}</TableCell>
                    <TableCell className="font-medium">{b.nama}</TableCell>
                    <TableCell>{b.kategori?.nama || "-"}</TableCell>
                    <TableCell>{b.satuan?.nama || "-"}</TableCell>
                    <TableCell className="text-right">{b.stokMinimum}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
