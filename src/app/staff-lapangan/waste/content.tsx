"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/user-context"
import { toast } from "sonner"

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2 } from "lucide-react"
import { PageWrapper, ContentCard } from "@/components/layout-utils"
import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader } from "@/components/page-header"

type Barang = {
  id: string
  nama: string
}

type WasteItem = {
  id: string
  barang: { nama: string }
  jumlah: number
}

type WasteRecord = {
  id: string
  tanggal: string
  alasan: string
  catatan: string | null
  items: WasteItem[]
}

export function WasteContent() {
  const { userId } = useUser()
  const [barangs, setBarangs] = useState<Barang[]>([])
  const [barangId, setBarangId] = useState("")
  const [jumlah, setJumlah] = useState(0)
  const [alasan, setAlasan] = useState("")
  const [catatan, setCatatan] = useState("")
  const [records, setRecords] = useState<WasteRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [barangRes, recordsRes] = await Promise.all([
      supabase.from("Barang").select("id, nama").order("nama"),
      supabase
        .from("Waste")
        .select("id, tanggal, alasan, catatan, items: WasteItem(barang: Barang(nama), jumlah)")
        .order("tanggal", { ascending: false })
        .limit(20),
    ])
    if (barangRes.data) setBarangs(barangRes.data as Barang[])
    if (recordsRes.data) setRecords(recordsRes.data as unknown as WasteRecord[])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!barangId || !jumlah || jumlah <= 0 || !alasan) {
      toast.error("Lengkapi semua field")
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

    const { data: waste, error: err1 } = await supabase
      .from("Waste")
      .insert({ userId, alasan, catatan: catatan || null })
      .select()
      .single()
    if (err1) { setSubmitting(false); toast.error(err1.message); return }

    const { error: err2 } = await supabase
      .from("WasteItem")
      .insert({ wasteId: waste.id, barangId, jumlah })
    if (err2) { setSubmitting(false); toast.error(err2.message); return }

    const { error: err3 } = await supabase
      .from("Stok")
      .update({ jumlah: stok.jumlah - jumlah })
      .eq("id", stok.id)
    if (err3) { setSubmitting(false); toast.error(err3.message); return }

    setSubmitting(false)
    setBarangId(""); setJumlah(0); setAlasan(""); setCatatan("")
    toast.success("Waste berhasil dicatat!")
    loadData()
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("id-ID")
  }

  return (
    <PageWrapper>
      <PageHeader title="Waste" description="Catat bahan yang terbuang" />

      <ContentCard header="Catat Waste">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
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
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="alasan">Alasan</Label>
                <Input
                  id="alasan"
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  placeholder="Alasan waste"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="catatan">Catatan</Label>
                <Input
                  id="catatan"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Catatan tambahan"
                />
              </div>
            </div>
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
              {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </form>
      </ContentCard>

      <ContentCard header="Riwayat Waste">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <EmptyState title="Belum ada catatan" />
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
                        <Badge variant="destructive">{r.alasan}</Badge>
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
      </ContentCard>
    </PageWrapper>
  )
}
