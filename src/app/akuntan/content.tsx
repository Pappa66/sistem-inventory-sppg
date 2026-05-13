"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/user-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { createAuditLog } from "@/lib/audit"
import { toast } from "sonner"
import { CheckCircle, ImageIcon } from "lucide-react"
import { PageHeader } from "@/components/page-header"

type Pembelian = {
  id: string
  tipe: "STOK" | "OPERASIONAL"
  total: number | null
  keterangan: string | null
  fotoStruk: string | null
  status: string
  createdAt: string
  user: { name: string } | null
}

const rp = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n)

export function AkuntanContent() {
  const { userId } = useUser()
  const [pembelians, setPembelians] = useState<Pembelian[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<"VERIFIED" | "REJECTED" | null>(null)
  const [catatan, setCatatan] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from("Pembelian")
      .select("*, user: userId(name)")
      .eq("status", "DRAFT")
      .order("createdAt", { ascending: false })
    if (data) setPembelians(data as unknown as Pembelian[])
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const grouped = pembelians.reduce(
    (acc, p) => {
      if (p.tipe === "STOK") acc.stok.push(p)
      else acc.operasional.push(p)
      return acc
    },
    { stok: [] as Pembelian[], operasional: [] as Pembelian[] }
  )

  const ordered = [...grouped.stok, ...grouped.operasional]

  function openConfirm(id: string, action: "VERIFIED" | "REJECTED") {
    setConfirmId(id)
    setConfirmAction(action)
    setCatatan("")
  }

  function closeConfirm() {
    setConfirmId(null)
    setConfirmAction(null)
    setCatatan("")
  }

  async function handleVerifikasi() {
    if (!confirmId || !confirmAction) return
    setSubmitting(true)
    const id = confirmId
    const status = confirmAction

    const { error } = await supabase
      .from("Pembelian")
      .update({ status, verifiedById: userId, verifiedAt: new Date().toISOString() })
      .eq("id", id)
    if (error) { toast.error("Gagal memperbarui status"); setSubmitting(false); return }

    await supabase.from("Verifikasi").insert({
      pembelianId: id,
      userId,
      status: status === "VERIFIED" ? "VALID" : "DITOLAK",
      catatan: catatan || null,
    })

    await createAuditLog({
      userId,
      action: "UPDATE",
      entity: "Pembelian",
      entityId: id,
      newValue: { status, catatan: catatan || null },
    })

    if (status === "VERIFIED") {
      const pembelian = pembelians.find(p => p.id === id)
      if (pembelian?.tipe === "STOK") {
        const { data: items } = await supabase
          .from("PembelianItem")
          .select("barangId, jumlah")
          .eq("pembelianId", id)
        if (items) {
          for (const item of items) {
            await supabase.rpc("update_stok", { p_barang_id: item.barangId, p_jumlah: item.jumlah })
          }
        }
      }
    }

    setPembelians(prev => prev.filter(p => p.id !== id))
    closeConfirm()
    toast.success(status === "VERIFIED" ? "Pembelian divalidasi" : "Pembelian ditolak")
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Verifikasi Pembelian</h2>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-3 pt-4">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex justify-end gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Verifikasi Pembelian" description="Validasi nominal & foto struk sebelum disetujui" />

      {ordered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <CheckCircle className="mb-2 h-12 w-12 text-green-500" />
            <p>Semua pembelian telah diverifikasi</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {grouped.stok.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Badge variant="default">STOK</Badge>
                <span className="text-sm text-muted-foreground">{grouped.stok.length} pembelian</span>
              </div>
              {grouped.stok.map(p => renderCard(p))}
            </div>
          )}
          {grouped.operasional.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Badge variant="secondary">OPERASIONAL</Badge>
                <span className="text-sm text-muted-foreground">{grouped.operasional.length} pembelian</span>
              </div>
              {grouped.operasional.map(p => renderCard(p))}
            </div>
          )}
        </div>
      )}

      <Dialog open={confirmId !== null} onOpenChange={(open) => { if (!open) closeConfirm() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Verifikasi</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin{" "}
              <span className={confirmAction === "VERIFIED" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                {confirmAction === "VERIFIED" ? "MEMVALIDASI" : "MENOLAK"}
              </span>{" "}
              pembelian ini?
            </DialogDescription>
          </DialogHeader>
          <Input
            value={catatan}
            onChange={e => setCatatan(e.target.value)}
            placeholder="Catatan (opsional)"
          />
          <DialogFooter>
            <Button variant="outline" onClick={closeConfirm} disabled={submitting}>Batal</Button>
            <Button
              variant={confirmAction === "VERIFIED" ? "default" : "destructive"}
              onClick={handleVerifikasi}
              disabled={submitting}
            >
              {confirmAction === "VERIFIED" ? "Validasi" : "Tolak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  function renderCard(p: Pembelian) {
    return (
      <Card key={p.id}>
        <CardContent className="pt-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant={p.tipe === "STOK" ? "default" : "secondary"}>{p.tipe}</Badge>
              {p.user && <span className="text-sm text-muted-foreground">{p.user.name}</span>}
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(p.createdAt).toLocaleString("id-ID")}
            </span>
          </div>

          <p className="mt-2 text-lg font-semibold">{p.total ? rp(p.total) : "Rp 0"}</p>
          {p.keterangan && <p className="mt-1 text-sm text-muted-foreground">{p.keterangan}</p>}

          {p.fotoStruk && (
            <div className="mt-2">
              <button
                onClick={() => window.open(p.fotoStruk!, "_blank")}
                className="group relative inline-block"
              >
                <img
                  src={p.fotoStruk}
                  alt="Foto struk"
                  className="max-h-32 w-auto rounded-lg border object-contain"
                />
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition-colors group-hover:bg-black/20">
                  <ImageIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100" />
                </div>
              </button>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => openConfirm(p.id, "REJECTED")}>
              Tolak
            </Button>
            <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => openConfirm(p.id, "VERIFIED")}>
              Valid
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
}
