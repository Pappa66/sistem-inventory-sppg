"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/user-context"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowDownToLine } from "lucide-react"
import { PageHeader } from "@/components/page-header"

type Barang = {
  id: string
  nama: string
}

type BarangMasukItem = {
  id: string
  barang: { nama: string }
  jumlah: number
  tanggalExp: string | null
}

type BarangMasukRecord = {
  id: string
  tanggal: string
  items: BarangMasukItem[]
}

export function MasukContent() {
  const { userId } = useUser()
  const [barangs, setBarangs] = useState<Barang[]>([])
  const [barangId, setBarangId] = useState("")
  const [jumlah, setJumlah] = useState(0)
  const [tanggalExp, setTanggalExp] = useState("")
  const [records, setRecords] = useState<BarangMasukRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [barangRes, recordsRes] = await Promise.all([
      supabase.from("Barang").select("id, nama").order("nama"),
      supabase
        .from("BarangMasuk")
        .select("id, tanggal, items: BarangMasukItem(barang: Barang(nama), jumlah, tanggalExp)")
        .order("tanggal", { ascending: false })
        .limit(20),
    ])
    if (barangRes.data) setBarangs(barangRes.data as Barang[])
    if (recordsRes.data) setRecords(recordsRes.data as unknown as BarangMasukRecord[])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!barangId || !jumlah || jumlah <= 0) {
      toast.error("Pilih barang dan isi jumlah")
      return
    }
    setSubmitting(true)

    const { data: masuk, error: err1 } = await supabase
      .from("BarangMasuk")
      .insert({ userId })
      .select()
      .single()
    if (err1) { setSubmitting(false); toast.error(err1.message); return }

    const { error: err2 } = await supabase
      .from("BarangMasukItem")
      .insert({
        barangMasukId: masuk.id,
        barangId,
        jumlah,
        tanggalExp: tanggalExp || null,
      })
    if (err2) { setSubmitting(false); toast.error(err2.message); return }

    const { data: existingStok } = await supabase
      .from("Stok")
      .select("id, jumlah")
      .eq("barangId", barangId)
      .maybeSingle()

    if (existingStok) {
      const { error: err3 } = await supabase
        .from("Stok")
        .update({ jumlah: existingStok.jumlah + jumlah })
        .eq("id", existingStok.id)
      if (err3) { setSubmitting(false); toast.error(err3.message); return }
    } else {
      const { error: err3 } = await supabase
        .from("Stok")
        .insert({ barangId, jumlah })
      if (err3) { setSubmitting(false); toast.error(err3.message); return }
    }

    setSubmitting(false)
    setBarangId(""); setJumlah(0); setTanggalExp("")
    toast.success("Barang masuk berhasil dicatat!")
    loadData()
  }

  function formatDate(d: string | null) {
    if (!d) return "-"
    return new Date(d).toLocaleDateString("id-ID")
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 md:px-6 py-8">
      <PageHeader title="Barang Masuk" description="Catat penerimaan barang baru" />

      <Card>
        <CardHeader>
          <CardTitle>Catat Barang Masuk</CardTitle>
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
              <Label htmlFor="exp">Tanggal Expired</Label>
              <Input
                id="exp"
                type="date"
                value={tanggalExp}
                onChange={(e) => setTanggalExp(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Barang Masuk</CardTitle>
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
                    <TableHead>Expired</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r) =>
                  r.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{formatDate(r.tanggal)}</TableCell>
                      <TableCell className="font-medium">{item.barang.nama}</TableCell>
                      <TableCell>{item.jumlah}</TableCell>
                      <TableCell>{formatDate(item.tanggalExp)}</TableCell>
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
