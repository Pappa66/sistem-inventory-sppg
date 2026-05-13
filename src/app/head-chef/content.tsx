"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/user-context"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { PageWrapper, ContentCard } from "@/components/layout-utils"
import { EmptyState } from "@/components/ui/empty-state"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { toast } from "sonner"
import { PlusCircle, Trash2, ClipboardList, UtensilsCrossed } from "lucide-react"
import { PageHeader } from "@/components/page-header"

type Barang = { id: string; nama: string; satuan: { singkatan: string } | null }
type BahanItem = { id: string; barangId: string; jumlah: number; Barang: Barang | null }
type ResepFull = { id: string; nama: string; ResepBahan: BahanItem[] }
type MenuPlanItem = { id: string; resepId: string; porsi: number; Resep: ResepFull | null }
type MenuPlan = { id: string; hari: string; MenuPlanItem: MenuPlanItem[] }
type BahanSummary = { barangId: string; nama: string; satuan: string; total: number }

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]

function getWeekDates(): string[] {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().split("T")[0]
  })
}

export function HeadChefContent() {
  const { userId } = useUser()
  const [tab, setTab] = useState("menu")
  const [barangs, setBarangs] = useState<Barang[]>([])
  const [reseps, setReseps] = useState<ResepFull[]>([])
  const [menuPlans, setMenuPlans] = useState<MenuPlan[]>([])
  const [loading, setLoading] = useState(true)

  async function loadAll() {
    const [barangRes, resepRes] = await Promise.all([
      supabase.from("Barang").select("*, satuan: satuanId(singkatan)").order("nama"),
      supabase.from("Resep").select("id, nama, ResepBahan(id, barangId, jumlah, Barang(id, nama, satuan: satuanId(singkatan)))").order("nama"),
    ])
    if (barangRes.data) setBarangs(barangRes.data as unknown as Barang[])
    if (resepRes.data) setReseps(resepRes.data as unknown as ResepFull[])

    const dates = getWeekDates()
    const { data: menuData } = await supabase
      .from("MenuPlan")
      .select("id, hari, MenuPlanItem(id, resepId, porsi, Resep(id, nama, ResepBahan(id, barangId, jumlah, Barang(id, nama, satuan: satuanId(singkatan)))))")
      .in("tanggal", dates)
    if (menuData) setMenuPlans(menuData as unknown as MenuPlan[])
  }

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      await loadAll()
      setLoading(false)
    })()
  }, [])

  return (
    <PageWrapper>
      <PageHeader title="Head Chef" description="Kelola menu dan resep" />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="menu">
            <ClipboardList className="size-4" />
            Menu 5 Hari
          </TabsTrigger>
          <TabsTrigger value="resep">
            <UtensilsCrossed className="size-4" />
            Resep
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ) : (
          <>
            <TabsContent value="resep">
              <ResepTab userId={userId} barangs={barangs} reseps={reseps} onSave={loadAll} />
            </TabsContent>
            <TabsContent value="menu">
              <MenuTab userId={userId} reseps={reseps} menuPlans={menuPlans} onSave={loadAll} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </PageWrapper>
  )
}

function ResepTab({
  userId,
  barangs,
  reseps,
  onSave,
}: {
  userId: string
  barangs: Barang[]
  reseps: ResepFull[]
  onSave: () => void
}) {
  const [nama, setNama] = useState("")
  const [bahanList, setBahanList] = useState<{ barangId: string; jumlah: number }[]>([{ barangId: "", jumlah: 0 }])
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ResepFull | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nama) {
      toast.error("Nama resep wajib diisi")
      return
    }
    setSaving(true)
    const { data: resep, error } = await supabase.from("Resep").insert({ nama, userId }).select().single()
    if (error) {
      toast.error(error.message)
      setSaving(false)
      return
    }

    for (const b of bahanList) {
      if (b.barangId && b.jumlah > 0) {
        await supabase.from("ResepBahan").insert({ resepId: resep.id, barangId: b.barangId, jumlah: b.jumlah })
      }
    }
    setSaving(false)
    toast.success("Resep berhasil ditambahkan")
    setNama("")
    setBahanList([{ barangId: "", jumlah: 0 }])
    onSave()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await supabase.from("ResepBahan").delete().eq("resepId", deleteTarget.id)
    const { error } = await supabase.from("Resep").delete().eq("id", deleteTarget.id)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Resep berhasil dihapus")
    setDeleteTarget(null)
    onSave()
  }

  return (
    <div className="space-y-6">
      <ContentCard header="Tambah Resep Baru">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Nama Resep</label>
              <Input
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Nama Resep"
                required
              />
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium">Bahan-bahan</span>
              {bahanList.map((item, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Bahan</label>
                    <Select
                      value={item.barangId}
                      onValueChange={(v) => {
                        const l = [...bahanList]
                        l[i].barangId = v ?? ""
                        setBahanList(l)
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Bahan" />
                      </SelectTrigger>
                      <SelectContent>
                        {barangs.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.nama} ({b.satuan?.singkatan || ""})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24 space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Jumlah</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.jumlah || ""}
                      onChange={(e) => {
                        const l = [...bahanList]
                        l[i].jumlah = Number(e.target.value)
                        setBahanList(l)
                      }}
                      placeholder="0"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="xs"
                    onClick={() => setBahanList(bahanList.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setBahanList([...bahanList, { barangId: "", jumlah: 0 }])}
              >
                <PlusCircle className="size-4" />
                Tambah Bahan
              </Button>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Resep"}
            </Button>
          </form>
      </ContentCard>

      <ContentCard header="Daftar Resep">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Bahan</TableHead>
                  <TableHead className="w-24">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reseps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <EmptyState title="Belum ada resep" className="border-0" />
                  </TableCell>
                </TableRow>
              ) : (
                reseps.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.nama}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {r.ResepBahan.length === 0 ? (
                          <span className="text-muted-foreground text-sm">(tidak ada bahan)</span>
                        ) : (
                          r.ResepBahan.map((b) => (
                            <Badge key={b.id} variant="secondary">
                              {b.Barang?.nama} {b.jumlah} {b.Barang?.satuan?.singkatan || ""}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="destructive" size="xs" onClick={() => setDeleteTarget(r)}>
                        Hapus
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
            </div>
      </ContentCard>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus resep "{deleteTarget?.nama}"?
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

function MenuTab({
  userId,
  reseps,
  menuPlans,
  onSave,
}: {
  userId: string
  reseps: ResepFull[]
  menuPlans: MenuPlan[]
  onSave: () => void
}) {
  const [items, setItems] = useState<{ hari: string; resepId: string; porsi: number }[]>(
    DAYS.map((d) => ({ hari: d, resepId: "", porsi: 50 }))
  )
  const [editingPorsi, setEditingPorsi] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const porsiMap: Record<string, number> = {}
    menuPlans.forEach((mp) => {
      mp.MenuPlanItem?.forEach((item) => {
        porsiMap[item.id] = item.porsi
      })
    })
    setEditingPorsi(porsiMap)
  }, [menuPlans])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const hasSelection = items.some((i) => i.resepId)
    if (!hasSelection) {
      toast.error("Pilih minimal satu resep")
      return
    }
    setSaving(true)
    const tanggal = new Date().toISOString().split("T")[0]

    for (const item of items) {
      if (!item.resepId) continue

      const { data: existingPlan } = await supabase
        .from("MenuPlan")
        .select("id")
        .eq("tanggal", tanggal)
        .eq("hari", item.hari)
        .maybeSingle()

      let planId: string
      if (existingPlan) {
        planId = existingPlan.id
      } else {
        const { data: newPlan } = await supabase
          .from("MenuPlan")
          .insert({ userId, tanggal, hari: item.hari })
          .select("id")
          .single()
        if (!newPlan) continue
        planId = newPlan.id
      }

      await supabase.from("MenuPlanItem").insert({ menuPlanId: planId, resepId: item.resepId, porsi: item.porsi })
    }

    setSaving(false)
    toast.success("Menu berhasil disimpan")
    onSave()
  }

  async function updatePorsi(itemId: string) {
    await supabase.from("MenuPlanItem").update({ porsi: editingPorsi[itemId] }).eq("id", itemId)
    toast.success("Porsi berhasil diperbarui")
    onSave()
  }

  function calculateSummary(): BahanSummary[] {
    const map = new Map<string, BahanSummary>()
    menuPlans.forEach((mp) => {
      mp.MenuPlanItem?.forEach((mpi) => {
        mpi.Resep?.ResepBahan?.forEach((rb) => {
          const total = mpi.porsi * rb.jumlah
          const existing = map.get(rb.barangId)
          if (existing) {
            existing.total += total
          } else {
            map.set(rb.barangId, {
              barangId: rb.barangId,
              nama: rb.Barang?.nama || "",
              satuan: rb.Barang?.satuan?.singkatan || "",
              total,
            })
          }
        })
      })
    })
    return Array.from(map.values())
  }

  const summary = calculateSummary()
  const hasMenuItems = menuPlans.some((mp) => (mp.MenuPlanItem?.length ?? 0) > 0)

  return (
    <div className="space-y-6">
      {hasMenuItems && (
        <>
          <ContentCard header="Menu Minggu Ini">
            <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hari</TableHead>
                      <TableHead>Resep</TableHead>
                      <TableHead>Porsi</TableHead>
                      <TableHead className="w-24">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menuPlans.map((mp) =>
                    (mp.MenuPlanItem || []).map((mpi) => (
                      <TableRow key={mpi.id}>
                        <TableCell className="font-medium">{mp.hari}</TableCell>
                        <TableCell>{mpi.Resep?.nama || "-"}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editingPorsi[mpi.id] ?? mpi.porsi}
                            onChange={(e) =>
                              setEditingPorsi((prev) => ({ ...prev, [mpi.id]: Number(e.target.value) }))
                            }
                            className="w-20 h-7"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="xs"
                            onClick={() => updatePorsi(mpi.id)}
                            disabled={(editingPorsi[mpi.id] ?? mpi.porsi) === mpi.porsi}
                          >
                            Simpan
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  </TableBody>
                </Table>
                </div>
            </ContentCard>

            {summary.length > 0 && (
            <ContentCard header="Kebutuhan Bahan Total">
              <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bahan</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Satuan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.map((s) => (
                      <TableRow key={s.barangId}>
                        <TableCell>{s.nama}</TableCell>
                        <TableCell className="font-semibold">{s.total}</TableCell>
                        <TableCell>{s.satuan}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </div>
            </ContentCard>

            )}
        </>
      )}

      <ContentCard header="Tambah Menu Baru">
          <form onSubmit={handleSubmit} className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border p-3">
                <span className="w-20 text-sm font-medium">{item.hari}</span>
                <div className="flex-1">
                  <Select
                    value={item.resepId}
                    onValueChange={(v) => {
                      const l = [...items]
                      l[i].resepId = v ?? ""
                      setItems(l)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Resep" />
                    </SelectTrigger>
                    <SelectContent>
                      {reseps.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  type="number"
                  value={item.porsi}
                  onChange={(e) => {
                    const l = [...items]
                    l[i].porsi = Number(e.target.value)
                    setItems(l)
                  }}
                  className="w-20"
                  placeholder="Porsi"
                />
              </div>
            ))}
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Menu"}
            </Button>
          </form>
      </ContentCard>
    </div>
  )
}
