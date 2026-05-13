"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useUser } from "@/lib/user-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { PageWrapper, PageHeader, DataGrid } from "@/components/layout-utils"
import {
  Users,
  Package,
  ClipboardList,
  UtensilsCrossed,
  ShoppingCart,
  ClipboardCheck,
  ArrowDownFromLine,
  ArrowUpFromLine,
  Trash2,
  CheckCircle,
  FileBarChart,
  BarChart3,
  ShoppingBag,
  LayoutDashboard,
  ArrowRight,
} from "lucide-react"

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  AKUNTAN: "Akuntan",
  KEPALA_DAPUR: "Kepala Dapur",
  HEAD_CHEF: "Head Chef",
  ASISTEN_LAPANGAN: "Asisten Lapangan",
  STAFF_LAPANGAN: "Staff Lapangan",
}

const iconMap: Record<string, React.ReactNode> = {
  users: <Users className="size-5" />,
  package: <Package className="size-5" />,
  clipboard: <ClipboardList className="size-5" />,
  utensils: <UtensilsCrossed className="size-5" />,
  cart: <ShoppingCart className="size-5" />,
  check: <ClipboardCheck className="size-5" />,
  arrowDown: <ArrowDownFromLine className="size-5" />,
  arrowUp: <ArrowUpFromLine className="size-5" />,
  trash: <Trash2 className="size-5" />,
  verify: <CheckCircle className="size-5" />,
  report: <FileBarChart className="size-5" />,
  chart: <BarChart3 className="size-5" />,
  bag: <ShoppingBag className="size-5" />,
  dashboard: <LayoutDashboard className="size-5" />,
}

type ActionItem = {
  label: string
  desc: string
  icon: string
  href: string
}

const roleActions: Record<string, ActionItem[]> = {
  ADMIN: [
    { label: "Kelola Pengguna", desc: "Atur akses & hak pengguna sistem", icon: "users", href: "/admin" },
    { label: "Master Barang", desc: "Kelola barang & kategori", icon: "package", href: "/admin/barang" },
    { label: "Log Audit", desc: "Monitor aktivitas sistem", icon: "clipboard", href: "/admin/audit" },
  ],
  AKUNTAN: [
    { label: "Verifikasi", desc: "Validasi pembelian & pengeluaran", icon: "verify", href: "/akuntan" },
    { label: "Laporan Keuangan", desc: "Laporan keuangan & rekap", icon: "report", href: "/akuntan/laporan" },
  ],
  KEPALA_DAPUR: [
    { label: "Laporan Stok", desc: "Pantau stok & bahan", icon: "chart", href: "/kepala-dapur" },
    { label: "Approval Belanja", desc: "Setujui pembelian", icon: "bag", href: "/kepala-dapur/approval" },
  ],
  HEAD_CHEF: [
    { label: "Menu 5 Hari", desc: "Rencanakan menu mingguan", icon: "utensils", href: "/head-chef" },
  ],
  ASISTEN_LAPANGAN: [
    { label: "Input Pembelian", desc: "Catat belanja harian", icon: "cart", href: "/asisten-lapangan" },
  ],
  STAFF_LAPANGAN: [
    { label: "Opname Stok", desc: "Cek stok fisik harian", icon: "check", href: "/staff-lapangan" },
    { label: "Barang Masuk", desc: "Catat penerimaan barang", icon: "arrowDown", href: "/staff-lapangan/masuk" },
    { label: "Barang Keluar", desc: "Catat pengeluaran barang", icon: "arrowUp", href: "/staff-lapangan/keluar" },
    { label: "Waste", desc: "Catat bahan terbuang", icon: "trash", href: "/staff-lapangan/waste" },
  ],
}

function DashboardSkeleton() {
  return (
    <PageWrapper>
      <Card>
        <CardHeader>
          <CardTitle>Selamat Datang</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
      <div>
        <Skeleton className="mb-4 h-6 w-24" />
        <DataGrid cols="3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-3 pt-4">
                <Skeleton className="size-8 rounded-lg" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </DataGrid>
      </div>
    </PageWrapper>
  )
}

export function DashboardContent() {
  const { name, role } = useUser()
  const [loading, setLoading] = useState(true)
  const actions = roleActions[role] || []

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 250)
    return () => clearTimeout(t)
  }, [])

  if (loading) return <DashboardSkeleton />

  return (
    <PageWrapper>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Selamat datang, {name} • {roleLabels[role] || role}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="text-2xl font-bold text-primary">Aktif</p>
              <p className="text-xs text-muted-foreground">Sistem berjalan normal</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Jam Kerja</p>
              <p className="text-2xl font-bold">08:00 - 17:00</p>
              <p className="text-xs text-muted-foreground">Jam operasional standar</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Versi</p>
              <p className="text-2xl font-bold">v1.0</p>
              <p className="text-xs text-muted-foreground">Latest version</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Menu Cepat</h2>
          <p className="text-sm text-muted-foreground">Akses fitur utama dengan mudah</p>
        </div>
        <DataGrid cols={actions.length > 6 ? "3" : "3"}>
          {actions.map((item) => (
            <Link key={item.label} href={item.href}>
              <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-primary/50 group">
                <CardContent className="flex flex-col gap-3 pt-4 h-full">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    {iconMap[item.icon]}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {item.label}
                    </div>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </DataGrid>
      </div>
    </PageWrapper>
  )
}
