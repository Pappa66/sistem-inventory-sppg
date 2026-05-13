"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { toast } from "sonner"
import { PlusCircle, Package, Tags, Ruler } from "lucide-react"
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

export function MasterDataContent() {
  const [tab, setTab] = useState("barang")
  const [loading, setLoading] = useState(true)

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 space-y-6">
      <PageHeader title="Master Data" description="Kelola barang, kategori, dan satuan" />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="barang">
            <Package className="size-4" />
            Barang
          </TabsTrigger>
          <TabsTrigger value="kategori">
            <Tags className="size-4" />
            Kategori
          </TabsTrigger>
          <TabsTrigger value="satuan">
            <Ruler className="size-4" />
            Satuan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="barang">
          <BarangTab loading={loading} setLoading={setLoading} />
        </TabsContent>
        <TabsContent value="kategori">
          <KategoriTab loading={loading} setLoading={setLoading} />
        </TabsContent>
        <TabsContent value="satuan">
          <SatuanTab loading={loading} setLoading={setLoading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BarangTab({
  loading,
  setLoading,
}: {
  loading: boolean
  setLoading: (v: boolean) => void
}) {
  const [barang, setBarang] = useState<Barang[]>([])
  const [kategoris, setKategoris] = useState<Kategori[]>([])
  const [satuans, setSatuans] = useState<Satuan[]>([])
  const [kode, setKode] = useState("")
  const [nama, setNama] = useState("")
  const [kategoriId, setKategoriId] = useState("")
  const [satuanId, setSatuanId] = useState("")
  const [stokMin, setStokMin] = useState(0)
  const [saving, setSaving] = useState(false)

  async function loadData() {
    const [barangRes, katRes, satRes] = await Promise.all([
      supabase.from("Barang").select("*, kategori: kategoriId(nama), satuan: satuanId(nama)").order("nama"),
      supabase.from("KategoriBarang").select("*").order("nama"),
      supabase.from("Satuan").select("*").order("nama"),
    ])
    if (barangRes.data) setBarang(barangRes.data as unknown as Barang[])
    if (katRes.data) setKategoris(katRes.data)
    if (satRes.data) setSatuans(satRes.data)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!kode || !nama || !kategoriId || !satuanId) {
      toast.error("Semua field wajib diisi")
      return
    }
    setSaving(true)
    const { error } = await supabase.from("Barang").insert({
      kode, nama, kategoriId, satuanId, stokMinimum: stokMin,
    })
    setSaving(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Barang berhasil ditambahkan")
    setKode(""); setNama(""); setKategoriId(""); setSatuanId(""); setStokMin(0)
    loadData()
  }

  if (loading) return <Skeleton className="h-64 w-full rounded-xl" />

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tambah Barang Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Kode Barang</label>
              <Input value={kode} onChange={e => setKode(e.target.value)} placeholder="BRG-001" required className="w-full" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Nama Barang</label>
              <Input value={nama} onChange={e => setNama(e.target.value)} placeholder="Nama Barang" required className="w-full" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Kategori</label>
              <Select value={kategoriId} onValueChange={(v) => setKategoriId(v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {kategoris.map(k => (
                    <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Satuan</label>
              <Select value={satuanId} onValueChange={(v) => setSatuanId(v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Satuan" />
                </SelectTrigger>
                <SelectContent>
                  {satuans.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.nama} ({s.singkatan})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Stok Minimum</label>
              <Input type="number" value={stokMin} onChange={e => setStokMin(Number(e.target.value))} placeholder="0" className="w-full" />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Menyimpan..." : "Tambah Barang"}
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead>Stok Min</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {barang.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Belum ada barang
                    </TableCell>
                  </TableRow>
                ) : (
                  barang.map(b => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-xs">{b.kode}</TableCell>
                      <TableCell className="font-medium">{b.nama}</TableCell>
                      <TableCell><Badge variant="secondary">{b.kategori?.nama || "-"}</Badge></TableCell>
                      <TableCell>{b.satuan?.nama || "-"}</TableCell>
                      <TableCell>{b.stokMinimum}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function KategoriTab({
  loading,
  setLoading,
}: {
  loading: boolean
  setLoading: (v: boolean) => void
}) {
  const [kategoris, setKategoris] = useState<Kategori[]>([])
  const [nama, setNama] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Kategori | null>(null)

  async function loadData() {
    const { data } = await supabase.from("KategoriBarang").select("*").order("nama")
    if (data) setKategoris(data)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nama) {
      toast.error("Nama kategori wajib diisi")
      return
    }
    setSaving(true)
    const { error } = await supabase.from("KategoriBarang").insert({ nama })
    setSaving(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Kategori berhasil ditambahkan")
    setNama("")
    loadData()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const { error } = await supabase.from("KategoriBarang").delete().eq("id", deleteTarget.id)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Kategori berhasil dihapus")
    setDeleteTarget(null)
    loadData()
  }

  if (loading) return <Skeleton className="h-64 w-full rounded-xl" />

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tambah Kategori Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Nama Kategori</label>
              <Input value={nama} onChange={e => setNama(e.target.value)} placeholder="Nama Kategori" required className="w-full" />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={saving} className="w-full">
                <PlusCircle className="size-4" />
                {saving ? "Menyimpan..." : "Tambah"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead className="w-24">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kategoris.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                      Belum ada kategori
                    </TableCell>
                  </TableRow>
                ) : (
                  kategoris.map(k => (
                    <TableRow key={k.id}>
                      <TableCell className="font-medium">{k.nama}</TableCell>
                      <TableCell>
                        <Button variant="destructive" size="xs" onClick={() => setDeleteTarget(k)}>
                          Hapus
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus kategori "{deleteTarget?.nama}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Batal</Button>} />
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SatuanTab({
  loading,
  setLoading,
}: {
  loading: boolean
  setLoading: (v: boolean) => void
}) {
  const [satuans, setSatuans] = useState<Satuan[]>([])
  const [nama, setNama] = useState("")
  const [singkatan, setSingkatan] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Satuan | null>(null)

  async function loadData() {
    const { data } = await supabase.from("Satuan").select("*").order("nama")
    if (data) setSatuans(data)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nama || !singkatan) {
      toast.error("Nama dan singkatan wajib diisi")
      return
    }
    setSaving(true)
    const { error } = await supabase.from("Satuan").insert({ nama, singkatan })
    setSaving(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Satuan berhasil ditambahkan")
    setNama("")
    setSingkatan("")
    loadData()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const { error } = await supabase.from("Satuan").delete().eq("id", deleteTarget.id)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Satuan berhasil dihapus")
    setDeleteTarget(null)
    loadData()
  }

  if (loading) return <Skeleton className="h-64 w-full rounded-xl" />

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tambah Satuan Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Nama Satuan</label>
              <Input value={nama} onChange={e => setNama(e.target.value)} placeholder="Kilogram" required className="w-full" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Singkatan</label>
              <Input value={singkatan} onChange={e => setSingkatan(e.target.value)} placeholder="kg" required className="w-full" />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={saving} className="w-full">
                <PlusCircle className="size-4" />
                {saving ? "Menyimpan..." : "Tambah"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Satuan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Singkatan</TableHead>
                  <TableHead className="w-24">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {satuans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      Belum ada satuan
                    </TableCell>
                  </TableRow>
                ) : (
                  satuans.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.nama}</TableCell>
                      <TableCell><Badge variant="outline">{s.singkatan}</Badge></TableCell>
                      <TableCell>
                        <Button variant="destructive" size="xs" onClick={() => setDeleteTarget(s)}>
                          Hapus
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus satuan "{deleteTarget?.nama}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Batal</Button>} />
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
