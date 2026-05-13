"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/user-context"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpFromLine } from "lucide-react"
import { PageHeader } from "@/components/page-header"

type Barang = {
  id: string
  nama: string
}

type BarangKeluarItem = {
  id: string
  barang: { nama: string }
  jumlah: number
}

type BarangKeluarRecord = {
  id: string
  tanggal: string
  alasan: string
  catatan: string | null
  items: BarangKeluarItem[]
}

const alasanList = [
  { value: "produksi", label: "Produksi" },
  { value: "waste", label: "Waste" },
  { value: "rusak", label: "Rusak" },
  { value: "lainnya", label: "Lainnya" },
]

export function KeluarContent() {
  const { userId } = useUser()
  const [barangs, setBarangs] = useState<Barang[]>([])
  const [barangId, setBarangId] = useState("")
  const [jumlah, setJumlah] = useState(0)
  const [alasan, setAlasan] = useState("produksi")
  const [catatan, setCatatan] = useState("")
  const [records, setRecords] = useState<BarangKeluarRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [barangRes, recordsRes] = await Promise.all([
      supabase.from("Barang").select("id, nama").order("nama"),
      supabase
        .from("BarangKeluar")
        .select("id, tanggal, alasan, catatan, items: BarangKeluarItem(barang: Barang(nama), jumlah)")
        .order("tanggal", { ascending: false })
        .limit(20),
    ])
    if (barangRes.data) setBarangs(barangRes.data as Barang[])
    if (recordsRes.data) setRecords(recordsRes.data as unknown as BarangKeluarRecord[])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!barangId || !jumlah || jumlah <= 0) {
      toast.error("Pilih barang dan isi jumlah")
      return
    }
    setSubmitting(true)

    const { data: stok } = await supabase
      .from("Stok")
      .select("id, jumlah")
      .eq("barangId", barangId)
      .maybeSingle()

    if (!stok || stok.jumlah < jumlah) {
      setSubmitting(false)
      toast.error("Stok tidak mencukupi!")
      return
    }

    const { data: keluar, error: err1 } = await supabase
      .from("BarangKeluar")
      .insert({ userId, alasan, catatan: catatan || null })
      .select()
      .single()
    if (err1) { setSubmitting(false); toast.error(err1.message); return }

    const { error: err2 } = await supabase
      .from("BarangKeluarItem")
      .insert({ barangKeluarId: keluar.id, barangId, jumlah })
    if (err2) { setSubmitting(false); toast.error(err2.message); return }

    const { error: err3 } = await supabase
      .from("Stok")
      .update({ jumlah: stok.jumlah - jumlah })
      .eq("id", stok.id)
    if (err3) { setSubmitting(false); toast.error(err3.message); return }

    setSubmitting(false)
    setBarangId(""); setJumlah(0); setAlasan("produksi"); setCatatan("")
    toast.success("Barang keluar berhasil dicatat!")
    loadData()
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("id-ID")
  }

  const alasanLabels: Record<string, string> = Object.fromEntries(
    alasanList.map((a) => [a.value, a.label])
  )

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 md:px-6 py-8">
      <PageHeader title="Barang Keluar" description="Catat pengeluaran barang dari gudang" />

      <Card>
        <CardHeader>
          <CardTitle>Catat Barang Keluar</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="barang">Barang</Label>
              <Select value={barangId} onValueChange={(v) => setBarangId(v ?? "")}>
                <SelectTrigger id="barang">
                  <SelectValue placeholder="Pilih Barang" />
                </SelectTrigger>
                <SelectContent>
                  {barangs.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jumlah">Jumlah</Label>
              <Input
                id="jumlah"
                type="number"
                value={jumlah || ""}
                onChange={(e) => setJumlah(Number(e.target.value))}
                placeholder="Jumlah"
                required
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alasan">Alasan</Label>
              <Select value={alasan} onValueChange={(v) => setAlasan(v ?? "produksi")}>
                <SelectTrigger id="alasan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {alasanList.map((a) => (
                    <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
          <div className="mt-4">
            <Label htmlFor="catatan">Catatan (opsional)</Label>
            <Input
              id="catatan"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan tambahan"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Barang Keluar</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada catatan</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Barang</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Alasan</TableHead>
                    <TableHead>Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r) =>
                  r.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{formatDate(r.tanggal)}</TableCell>
                      <TableCell className="font-medium">{item.barang.nama}</TableCell>
                      <TableCell>{item.jumlah}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {alasanLabels[r.alasan] || r.alasan}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {r.catatan || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
