"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/user-context"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ClipboardCheck, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import Link from "next/link"

type BarangStok = {
  id: string
  nama: string
  stokMinimum: number
  stok: { jumlah: number } | null
}

export function StaffContent() {
  const { userId } = useUser()
  const [barangs, setBarangs] = useState<BarangStok[]>([])
  const [stokFisik, setStokFisik] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data } = await supabase
      .from("Barang")
      .select("id, nama, stokMinimum, stok: Stok(jumlah)")
      .order("nama")
    if (data) {
      setBarangs(data as unknown as BarangStok[])
      const fisik: Record<string, number> = {}
      data.forEach((b: unknown) => {
        const barang = b as BarangStok
        fisik[barang.id] = barang.stok?.jumlah || 0
      })
      setStokFisik(fisik)
    }
    setLoading(false)
  }

  async function handleOpname() {
    setSaving(true)
    const { data: opname, error } = await supabase
      .from("Opname")
      .insert({ userId })
      .select()
      .single()
    if (error) {
      setSaving(false)
      toast.error(error.message)
      return
    }

    for (const b of barangs) {
      const sistem = b.stok?.jumlah || 0
      const fisik = stokFisik[b.id] || 0
      await supabase.from("OpnameItem").insert({
        opnameId: opname.id,
        barangId: b.id,
        stokSistem: sistem,
        stokFisik: fisik,
        selisih: fisik - sistem,
      })
    }

    setSaving(false)
    toast.success("Opname selesai dicatat!")
  }

  const totalItems = barangs.length
  const discrepancyItems = barangs.filter((b) => {
    const sistem = b.stok?.jumlah || 0
    const fisik = stokFisik[b.id] || 0
    return fisik !== sistem
  }).length

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 space-y-6">
      <PageHeader title="Opname Stok Harian" description="Catat stok fisik dan cek selisih">
        <div className="flex gap-2">
          <Link
            href="/staff-lapangan/masuk"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium whitespace-nowrap transition-all hover:bg-muted hover:text-foreground"
          >
            <ExternalLink className="size-4" />
            Barang Masuk
          </Link>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-primary/10 p-3">
              <ClipboardCheck className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Item</p>
              <p className="text-2xl font-bold">{totalItems}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className={`rounded-full p-3 ${discrepancyItems > 0 ? "bg-amber-100 dark:bg-amber-900/20" : "bg-green-100 dark:bg-green-900/20"}`}>
              {discrepancyItems > 0 ? (
                <AlertTriangle className="size-6 text-amber-600 dark:text-amber-400" />
              ) : (
                <CheckCircle className="size-6 text-green-600 dark:text-green-400" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Item dengan Selisih</p>
              <p className={`text-2xl font-bold ${discrepancyItems > 0 ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"}`}>
                {discrepancyItems}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Barang</CardTitle>
            <Button onClick={handleOpname} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Opname"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barang</TableHead>
                  <TableHead>Stok Sistem</TableHead>
                  <TableHead>Stok Fisik</TableHead>
                  <TableHead>Selisih</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {barangs.map((b) => {
                const sistem = b.stok?.jumlah || 0
                const fisik = stokFisik[b.id] || 0
                const selisih = fisik - sistem
                const isBelowMinimum = fisik < b.stokMinimum
                return (
                  <TableRow key={b.id} className={selisih !== 0 ? "bg-amber-50 dark:bg-amber-950/20" : ""}>
                    <TableCell className="font-medium">{b.nama}</TableCell>
                    <TableCell>{sistem}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={fisik}
                        onChange={(e) =>
                          setStokFisik({ ...stokFisik, [b.id]: Number(e.target.value) })
                        }
                        className="h-8 w-24"
                      />
                    </TableCell>
                    <TableCell>
                      {selisih !== 0 ? (
                        <Badge variant={selisih > 0 ? "default" : "destructive"}>
                          {selisih > 0 ? `+${selisih}` : selisih}
                        </Badge>
                      ) : (
                        <Badge variant="outline">0</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {isBelowMinimum && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            const msg = `Peringatan Stok: ${b.nama} tersisa ${fisik} (minimum ${b.stokMinimum})`
                            window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank")
                          }}
                        >
                          <ExternalLink className="size-3" />
                          WA
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              </TableBody>
            </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
