"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select"
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { PageWrapper, PageHeader, DataGrid } from "@/components/layout-utils"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Package, Plus, Search, MoreHorizontal, Edit, History, Trash2,
  AlertTriangle, Clock, PackagePlus,
  Layers,
} from "lucide-react"

type BarangItem = {
  id: string
  kode: string
  nama: string
  stokMinimum: number
  kategori: { nama: string } | null
  satuan: { nama: string; singkatan: string } | null
  Stok: Array<{ jumlah: number }> | null
}

type Kategori = { id: string; nama: string }

const rp = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n)

export function InventoryContent() {
  const [items, setItems] = useState<BarangItem[]>([])
  const [kategoris, setKategoris] = useState<Kategori[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [adjustTarget, setAdjustTarget] = useState<BarangItem | null>(null)
  const [adjustQty, setAdjustQty] = useState(0)
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    const [barangRes, katRes] = await Promise.all([
      supabase
        .from("Barang")
        .select("*, kategori: kategoriId(nama), satuan: satuanId(nama, singkatan), Stok(jumlah)")
        .order("nama"),
      supabase.from("KategoriBarang").select("*").order("nama"),
    ])
    if (barangRes.data) setItems(barangRes.data as unknown as BarangItem[])
    if (katRes.data) setKategoris(katRes.data)
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const totalItems = items.length
  const lowStockItems = items.filter((i) => (i.Stok?.[0]?.jumlah ?? 0) <= i.stokMinimum)
  const recentlyAdded = items.slice(0, 5).length

  const filtered = items.filter((i) => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      i.nama.toLowerCase().includes(q) ||
      i.kode.toLowerCase().includes(q) ||
      i.kategori?.nama?.toLowerCase().includes(q)
    const matchesCategory = categoryFilter === "all" || i.kategori?.nama === categoryFilter
    const stock = i.Stok?.[0]?.jumlah ?? 0
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "low" && stock <= i.stokMinimum) ||
      (statusFilter === "out" && stock === 0) ||
      (statusFilter === "in" && stock > i.stokMinimum)
    return matchesSearch && matchesCategory && matchesStatus
  })

  function getStockLevel(stock: number, min: number) {
    if (stock === 0) return { label: "Habis", variant: "destructive" as const, color: "text-red-600" }
    if (stock <= min) return { label: "Stok Rendah", variant: "destructive" as const, color: "text-red-600" }
    if (stock <= min * 2) return { label: "Menipis", variant: "secondary" as const, color: "text-amber-600" }
    return { label: "Tersedia", variant: "default" as const, color: "text-green-600" }
  }

  function getStockWidth(stock: number, min: number) {
    const max = min * 5 || 100
    const pct = Math.min((stock / Math.max(max, stock)) * 100, 100)
    return Math.max(pct, 2)
  }

  function getBarColor(stock: number, min: number) {
    if (stock === 0) return "bg-red-500"
    if (stock <= min) return "bg-red-500"
    if (stock <= min * 2) return "bg-amber-500"
    return "bg-green-500"
  }

  async function handleAdjustStock() {
    if (!adjustTarget) return
    setSaving(true)

    const existing = await supabase
      .from("Stok")
      .select("id, jumlah")
      .eq("barangId", adjustTarget.id)
      .maybeSingle()

    if (existing.data) {
      await supabase
        .from("Stok")
        .update({ jumlah: existing.data.jumlah + adjustQty })
        .eq("id", existing.data.id)
    } else {
      await supabase
        .from("Stok")
        .insert({ barangId: adjustTarget.id, jumlah: adjustQty })
    }

    setSaving(false)
    setAdjustTarget(null)
    setAdjustQty(0)
    toast.success("Stok berhasil disesuaikan")
    loadData()
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Inventaris"
        description="Kelola stok barang dan monitoring inventory"
        action={
          <Button className="gap-1.5">
            <PackagePlus className="size-4" />
            Tambah Barang
          </Button>
        }
      />

      <DataGrid cols="4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Package className="size-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Total Barang</p>
              <p className="text-xl font-bold font-mono">{totalItems}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
              <AlertTriangle className="size-5 text-red-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Stok Menipis</p>
              <p className="text-xl font-bold font-mono text-red-600">{lowStockItems.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
              <Layers className="size-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Total Kategori</p>
              <p className="text-xl font-bold font-mono">{kategoris.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
              <Clock className="size-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Barang Baru</p>
              <p className="text-xl font-bold font-mono">+{recentlyAdded}</p>
            </div>
          </CardContent>
        </Card>
      </DataGrid>

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nama, kode, atau kategori..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={categoryFilter} onValueChange={(v) => v && setCategoryFilter(v)}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {kategoris.map((k) => (
                    <SelectItem key={k.id} value={k.nama}>{k.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="in">Tersedia</SelectItem>
                  <SelectItem value="low">Stok Rendah</SelectItem>
                  <SelectItem value="out">Habis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-center">#</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Nama Barang</TableHead>
                <TableHead className="hidden md:table-cell">Kategori</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead className="hidden lg:table-cell">Satuan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12">
                    <EmptyState
                      title="Tidak ada barang"
                      description={search || categoryFilter !== "all" || statusFilter !== "all" ? "Coba ubah filter pencarian" : "Belum ada barang yang ditambahkan"}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item, idx) => {
                  const stock = item.Stok?.[0]?.jumlah ?? 0
                  const level = getStockLevel(stock, item.stokMinimum)
                  const barWidth = getStockWidth(stock, item.stokMinimum)
                  const barColor = getBarColor(stock, item.stokMinimum)

                  return (
                    <TableRow key={item.id} className="group">
                      <TableCell className="text-center text-xs text-muted-foreground font-mono">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
                          {item.kode}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{item.nama}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">{item.kategori?.nama || "-"}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className={`font-mono text-sm font-semibold ${level.color}`}>
                            {stock}
                          </span>
                          <div className="hidden sm:block h-2 w-16 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${barColor}`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {item.satuan?.singkatan || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={level.variant} className="text-[10px]">
                          {level.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors">
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                              <Edit className="size-4" />
                              Edit Barang
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer"
                              onClick={() => { setAdjustTarget(item); setAdjustQty(0) }}
                            >
                              <PackagePlus className="size-4" />
                              Adjust Stok
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                              <History className="size-4" />
                              Riwayat
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                              <Trash2 className="size-4" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={!!adjustTarget} onOpenChange={(open) => { if (!open) setAdjustTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stok</DialogTitle>
            <DialogDescription>
              Sesuaikan stok untuk <strong>{adjustTarget?.nama}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Layers className="size-4" />
              Stok saat ini: <span className="font-semibold text-foreground font-mono">
                {adjustTarget ? (adjustTarget.Stok?.[0]?.jumlah ?? 0) : 0}
              </span>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Jumlah Penyesuaian
              </label>
              <Input
                type="number"
                value={adjustQty || ""}
                onChange={(e) => setAdjustQty(Number(e.target.value))}
                placeholder="Gunakan + untuk tambah, - untuk kurangi"
              />
              <p className="text-[10px] text-muted-foreground">
                Contoh: 10 untuk menambah, -5 untuk mengurangi
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustTarget(null)}>Batal</Button>
            <Button onClick={handleAdjustStock} disabled={!adjustQty || saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  )
}
