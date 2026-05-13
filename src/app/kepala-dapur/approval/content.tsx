"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/user-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { createAuditLog } from "@/lib/audit"
import { toast } from "sonner"
import { ChevronDown, ChevronUp } from "lucide-react"

type PembelianItem = {
  id: string
  barangId: string
  jumlah: number
  hargaSatuan: number
  subtotal: number
  barang: { nama: string } | null
}

type Pembelian = {
  id: string
  tipe: string
  total: number | null
  keterangan: string | null
  status: string
  createdAt: string
  user: { name: string } | null
  PembelianItem: PembelianItem[] | null
}

const rp = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n)

export function ApprovalContent() {
  const { userId } = useUser()
  const [pembelians, setPembelians] = useState<Pembelian[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<"APPROVE" | "REJECT" | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from("Pembelian")
      .select("*, user: userId(name), PembelianItem(*, barang: barangId(nama))")
      .eq("status", "DRAFT")
      .order("createdAt", { ascending: false })
    if (data) setPembelians(data as unknown as Pembelian[])
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  function openConfirm(id: string, action: "APPROVE" | "REJECT") {
    setConfirmId(id)
    setConfirmAction(action)
  }

  function closeConfirm() {
    setConfirmId(null)
    setConfirmAction(null)
  }

  async function handleConfirm() {
    if (!confirmId || !confirmAction) return
    setSubmitting(true)
    const id = confirmId

    if (confirmAction === "APPROVE") {
      const pembelian = pembelians.find(p => p.id === id)
      if (!pembelian) { closeConfirm(); setSubmitting(false); return }

      const { error } = await supabase
        .from("Pembelian")
        .update({ status: "VERIFIED", verifiedById: userId, verifiedAt: new Date().toISOString() })
        .eq("id", id)
      if (error) { toast.error("Gagal menyetujui pembelian"); setSubmitting(false); return }

      await supabase.from("Verifikasi").insert({ pembelianId: id, userId, status: "VALID" })

      await createAuditLog({ userId, action: "UPDATE", entity: "Pembelian", entityId: id, newValue: { status: "VERIFIED" } })

      if (pembelian.tipe === "STOK" && pembelian.PembelianItem) {
        for (const item of pembelian.PembelianItem) {
          await supabase.rpc("update_stok", { p_barang_id: item.barangId, p_jumlah: item.jumlah })
        }
      }

      toast.success("Pembelian disetujui")
    } else {
      const { error } = await supabase
        .from("Pembelian")
        .update({ status: "REJECTED", verifiedById: userId, verifiedAt: new Date().toISOString() })
        .eq("id", id)
      if (error) { toast.error("Gagal menolak pembelian"); setSubmitting(false); return }

      await supabase.from("Verifikasi").insert({ pembelianId: id, userId, status: "DITOLAK" })

      await createAuditLog({ userId, action: "UPDATE", entity: "Pembelian", entityId: id, newValue: { status: "REJECTED" } })

      toast.success("Pembelian ditolak")
    }

    setPembelians(prev => prev.filter(p => p.id !== id))
    closeConfirm()
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-6">Daftar Pembelian Perlu Disetujui</h2>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-3 pt-4">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-6 w-1/4" />
                <div className="flex justify-end gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Daftar Pembelian Perlu Disetujui</h2>

      {pembelians.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p>Tidak ada pembelian yang perlu disetujui</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pembelians.map(p => (
            <Card key={p.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-2">
                    <Badge>{p.tipe}</Badge>
                    <Badge variant="outline">{p.status}</Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(p.createdAt).toLocaleString("id-ID")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Oleh: {p.user?.name || "-"}</p>
                <p className="mt-1 text-lg font-semibold">{p.total ? rp(p.total) : "Rp 0"}</p>
                {p.keterangan && (
                  <p className="mt-1 text-sm text-muted-foreground">{p.keterangan}</p>
                )}

                {p.PembelianItem && p.PembelianItem.length > 0 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-auto p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                    >
                      {expandedId === p.id ? (
                        <><ChevronUp className="mr-1 h-4 w-4" /> Sembunyikan detail</>
                      ) : (
                        <><ChevronDown className="mr-1 h-4 w-4" /> Lihat detail barang</>
                      )}
                    </Button>
                    {expandedId === p.id && (
                      <div className="mt-2">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Barang</TableHead>
                              <TableHead>Jumlah</TableHead>
                              <TableHead>Harga Satuan</TableHead>
                              <TableHead>Subtotal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {p.PembelianItem.map(item => (
                              <TableRow key={item.id}>
                                <TableCell>{item.barang?.nama || "-"}</TableCell>
                                <TableCell>{item.jumlah}</TableCell>
                                <TableCell>{rp(item.hargaSatuan)}</TableCell>
                                <TableCell>{rp(item.subtotal)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </>
                )}

                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={() => openConfirm(p.id, "REJECT")}
                  >
                    Tolak
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => openConfirm(p.id, "APPROVE")}
                  >
                    Setujui
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={confirmId !== null} onOpenChange={(open) => { if (!open) closeConfirm() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin{" "}
              <span className={confirmAction === "APPROVE" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                {confirmAction === "APPROVE" ? "MENYETUJUI" : "MENOLAK"}
              </span>{" "}
              pembelian ini?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeConfirm} disabled={submitting}>Batal</Button>
            <Button
              variant={confirmAction === "APPROVE" ? "default" : "destructive"}
              onClick={handleConfirm}
              disabled={submitting}
            >
              {confirmAction === "APPROVE" ? "Setujui" : "Tolak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
