"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import * as XLSX from "xlsx"
import { Download } from "lucide-react"

type Pembelian = {
  id: string
  tipe: "STOK" | "OPERASIONAL"
  total: number | null
  keterangan: string | null
  createdAt: string
  user: { name: string } | null
}

type DayGroup = {
  date: string
  label: string
  items: Pembelian[]
  totalStok: number
  totalOperasional: number
}

const rp = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n)

export function LaporanContent() {
  const [groups, setGroups] = useState<DayGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const loadData = useCallback(async (start?: string, end?: string) => {
    setLoading(true)
    let query = supabase
      .from("Pembelian")
      .select("*, user: userId(name)")
      .eq("status", "VERIFIED")
      .order("createdAt", { ascending: false })

    if (start) query = query.gte("createdAt", start)
    if (end) query = query.lte("createdAt", end)

    const { data } = await query
    if (!data) { setLoading(false); return }

    const raw = data as unknown as Pembelian[]
    const map = new Map<string, Pembelian[]>()

    for (const item of raw) {
      const day = item.createdAt.split("T")[0]
      if (!map.has(day)) map.set(day, [])
      map.get(day)!.push(item)
    }

    const result: DayGroup[] = []
    for (const [date, items] of map) {
      const d = new Date(date + "T00:00:00")
      const label = d.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
      result.push({
        date,
        label,
        items,
        totalStok: items.filter(i => i.tipe === "STOK").reduce((s, i) => s + (i.total || 0), 0),
        totalOperasional: items.filter(i => i.tipe === "OPERASIONAL").reduce((s, i) => s + (i.total || 0), 0),
      })
    }

    result.sort((a, b) => b.date.localeCompare(a.date))
    setGroups(result)
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  function handleFilter() {
    loadData(startDate || undefined, endDate || undefined)
  }

  const grandTotalStok = groups.reduce((s, g) => s + g.totalStok, 0)
  const grandTotalOperasional = groups.reduce((s, g) => s + g.totalOperasional, 0)
  const grandTotal = grandTotalStok + grandTotalOperasional

  function exportExcel() {
    const rows: Record<string, unknown>[] = []
    for (const g of groups) {
      for (const item of g.items) {
        rows.push({
          Tanggal: g.label,
          Tipe: item.tipe,
          "Nama User": item.user?.name || "-",
          Total: item.total || 0,
          Keterangan: item.keterangan || "",
        })
      }
    }

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Laporan")
    XLSX.writeFile(wb, `laporan-pembelian-${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Laporan Pembelian Terverifikasi</h2>
        {!loading && groups.length > 0 && (
          <Button variant="outline" size="sm" onClick={exportExcel}>
            <Download className="mr-1 h-4 w-4" />
            Export Excel
          </Button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-36">
          <label className="mb-1 block text-xs text-muted-foreground">Dari</label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="flex-1 min-w-36">
          <label className="mb-1 block text-xs text-muted-foreground">Sampai</label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <Button variant="secondary" size="sm" onClick={handleFilter}>Filter</Button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader><Skeleton className="h-4 w-20" /></CardHeader>
                <CardContent><Skeleton className="h-8 w-32" /></CardContent>
              </Card>
            ))}
          </div>
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-4 space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p>Belum ada pembelian terverifikasi</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader><CardTitle className="text-sm text-muted-foreground">Total Stok</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-semibold text-sky-600">{rp(grandTotalStok)}</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm text-muted-foreground">Total Operasional</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-semibold text-amber-600">{rp(grandTotalOperasional)}</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm text-muted-foreground">Grand Total</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-semibold">{rp(grandTotal)}</p></CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {groups.map(g => (
              <Card key={g.date}>
                <CardContent className="pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-medium">{g.label}</h3>
                    <Badge variant="outline">{g.items.length} transaksi</Badge>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Keterangan</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {g.items.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>{item.user?.name || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={item.tipe === "STOK" ? "default" : "secondary"} className="text-xs">
                              {item.tipe}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{item.keterangan || "-"}</TableCell>
                          <TableCell className="text-right font-medium">{rp(item.total || 0)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="mt-3 flex gap-4 text-sm">
                    <span className="text-sky-600">Stok: {rp(g.totalStok)}</span>
                    <span className="text-amber-600">Operasional: {rp(g.totalOperasional)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
