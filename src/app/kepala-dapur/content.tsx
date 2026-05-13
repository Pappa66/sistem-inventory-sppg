"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import * as XLSX from "xlsx"
import { Download, Share2 } from "lucide-react"

type ReportData = {
  label: string
  stokSistem: number
  stokFisik: number
  selisih: number
}

type TvAData = {
  barang: string
  theoreticalUsage: number
  actualUsage: number
  difference: number
  percentage: number
}

export function KepalaDapurContent() {
  const [reportData, setReportData] = useState<ReportData[]>([])
  const [tvaData, setTvaData] = useState<TvAData[]>([])
  const [loadingStok, setLoadingStok] = useState(true)
  const [loadingTva, setLoadingTva] = useState(true)

  const loadReport = useCallback(async () => {
    setLoadingStok(true)
    const { data: barangs } = await supabase.from("Barang").select("id, nama, Stok(jumlah)").order("nama")
    if (!barangs) { setLoadingStok(false); return }

    const { data: latestOpname } = await supabase
      .from("Opname")
      .select("id")
      .order("createdAt", { ascending: false })
      .limit(1)

    let opnameItems: Record<string, number> = {}
    if (latestOpname && latestOpname.length > 0) {
      const { data: items } = await supabase
        .from("OpnameItem")
        .select("barangId, stokFisik")
        .eq("opnameId", latestOpname[0].id)
      if (items) {
        for (const item of items) {
          opnameItems[item.barangId] = item.stokFisik
        }
      }
    }

    const data: ReportData[] = (barangs as unknown as Array<{ id: string; nama: string; Stok: Array<{ jumlah: number }> | null }>).map(b => {
      const stokSistem = b.Stok?.[0]?.jumlah || 0
      const stokFisik = opnameItems[b.id] ?? stokSistem
      return { label: b.nama, stokSistem, stokFisik, selisih: stokFisik - stokSistem }
    })
    setReportData(data)
    setLoadingStok(false)
  }, [])

  const loadTva = useCallback(async () => {
    setLoadingTva(true)
    const { data: menuItems } = await supabase
      .from("MenuPlanItem")
      .select("porsi, resepId")

    if (!menuItems || menuItems.length === 0) { setLoadingTva(false); return }

    const { data: resepBahans } = await supabase
      .from("ResepBahan")
      .select("resepId, barangId, jumlah, barang: barangId(nama)")

    if (!resepBahans) { setLoadingTva(false); return }

    const theoretical: Record<string, { nama: string; usage: number }> = {}
    for (const mi of menuItems) {
      for (const rb of resepBahans) {
        if (rb.resepId === mi.resepId) {
          const barangNama = (rb.barang as unknown as { nama: string }).nama
          if (!theoretical[rb.barangId]) {
            theoretical[rb.barangId] = { nama: barangNama, usage: 0 }
          }
          theoretical[rb.barangId].usage += rb.jumlah * mi.porsi
        }
      }
    }

    const { data: latestOpname } = await supabase
      .from("Opname")
      .select("id")
      .order("createdAt", { ascending: false })
      .limit(1)

    const actualUsage: Record<string, number> = {}
    if (latestOpname && latestOpname.length > 0) {
      const { data: items } = await supabase
        .from("OpnameItem")
        .select("barangId, selisih")
        .eq("opnameId", latestOpname[0].id)
      if (items) {
        for (const item of items) {
          actualUsage[item.barangId] = item.selisih
        }
      }
    }

    const data: TvAData[] = Object.entries(theoretical)
      .map(([barangId, t]) => {
        const actual = actualUsage[barangId] ?? 0
        const diff = t.usage - actual
        const pct = t.usage > 0 ? Math.round((diff / t.usage) * 100) : 0
        return {
          barang: t.nama,
          theoreticalUsage: Math.round(t.usage * 100) / 100,
          actualUsage: actual,
          difference: Math.round(diff * 100) / 100,
          percentage: pct,
        }
      })
      .sort((a, b) => a.barang.localeCompare(b.barang))

    setTvaData(data)
    setLoadingTva(false)
  }, [])

  useEffect(() => {
    loadReport()
    loadTva()
  }, [loadReport, loadTva])

  function exportExcel(tab: "stok" | "tva") {
    const wb = XLSX.utils.book_new()

    if (tab === "stok") {
      const ws = XLSX.utils.json_to_sheet(
        reportData.map(d => ({
          Barang: d.label,
          "Stok Sistem": d.stokSistem,
          "Stok Fisik": d.stokFisik,
          Selisih: d.selisih,
        }))
      )
      XLSX.utils.book_append_sheet(wb, ws, "Laporan Stok")
    } else {
      const ws = XLSX.utils.json_to_sheet(
        tvaData.map(d => ({
          Barang: d.barang,
          "Pemakaian Teoritis": d.theoreticalUsage,
          "Pemakaian Aktual": d.actualUsage,
          Selisih: d.difference,
          "Selisih %": `${d.percentage}%`,
        }))
      )
      XLSX.utils.book_append_sheet(wb, ws, "TvA Report")
    }

    XLSX.writeFile(wb, `laporan-${tab}-${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  function handleShareWa(tab: "stok" | "tva") {
    let msg = ""
    if (tab === "stok") {
      const summary = reportData
        .filter(d => d.selisih !== 0)
        .map(d => `${d.label}: ${d.selisih > 0 ? "+" : ""}${d.selisih}`)
        .join("\n")
      msg = `Laporan Stok ${new Date().toLocaleDateString("id-ID")}\n\n${summary || "Semua stok sesuai"}`
    } else {
      const summary = tvaData
        .filter(d => Math.abs(d.percentage) > 5)
        .map(d => `${d.barang}: Teoritis ${d.theoreticalUsage}, Aktual ${d.actualUsage} (${d.percentage > 0 ? "+" : ""}${d.percentage}%)`)
        .join("\n")
      msg = `TvA Report ${new Date().toLocaleDateString("id-ID")}\n\n${summary || "Semua dalam batas wajar"}`
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank")
  }

  return (
    <div>
      <Tabs defaultValue="stok">
        <TabsList className="mb-6">
          <TabsTrigger value="stok">Laporan Stok</TabsTrigger>
          <TabsTrigger value="tva">TvA Report</TabsTrigger>
        </TabsList>

        <TabsContent value="stok">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Laporan Perbandingan Stok</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => exportExcel("stok")}>
                <Download className="mr-1 h-4 w-4" />
                Export Excel
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleShareWa("stok")}>
                <Share2 className="mr-1 h-4 w-4" />
                Share WA
              </Button>
            </div>
          </div>

          {loadingStok ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Barang</TableHead>
                        <TableHead>Stok Sistem</TableHead>
                        <TableHead>Stok Fisik</TableHead>
                        <TableHead>Selisih</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            Belum ada data
                          </TableCell>
                        </TableRow>
                      ) : (
                        reportData.map((d, i) => (
                          <TableRow key={i}>
                            <TableCell>{d.label}</TableCell>
                            <TableCell>{d.stokSistem}</TableCell>
                            <TableCell>{d.stokFisik}</TableCell>
                            <TableCell>
                              <Badge variant={d.selisih !== 0 ? "destructive" : "outline"}>
                                {d.selisih > 0 ? "+" : ""}{d.selisih}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <Card>
                  <CardHeader><CardTitle className="text-sm text-muted-foreground">Total Barang</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-semibold">{reportData.length}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-sm text-muted-foreground">Stok Sesuai</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-semibold text-green-600">{reportData.filter(d => d.selisih === 0).length}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-sm text-muted-foreground">Ada Selisih</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-semibold text-red-600">{reportData.filter(d => d.selisih !== 0).length}</p></CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="tva">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Theoretical vs Actual (TvA)</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => exportExcel("tva")}>
                <Download className="mr-1 h-4 w-4" />
                Export Excel
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleShareWa("tva")}>
                <Share2 className="mr-1 h-4 w-4" />
                Share WA
              </Button>
            </div>
          </div>

          {loadingTva ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Barang</TableHead>
                      <TableHead>Pemakaian Teoritis</TableHead>
                      <TableHead>Pemakaian Aktual</TableHead>
                      <TableHead>Selisih</TableHead>
                      <TableHead>%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tvaData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Belum ada data
                        </TableCell>
                      </TableRow>
                    ) : (
                      tvaData.map((d, i) => (
                        <TableRow key={i}>
                          <TableCell>{d.barang}</TableCell>
                          <TableCell>{d.theoreticalUsage}</TableCell>
                          <TableCell>{d.actualUsage}</TableCell>
                          <TableCell>
                            <Badge variant={Math.abs(d.percentage) > 5 ? "destructive" : "outline"}>
                              {d.difference > 0 ? "+" : ""}{d.difference}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={Math.abs(d.percentage) > 5 ? "destructive" : "outline"}>
                              {d.percentage > 0 ? "+" : ""}{d.percentage}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
