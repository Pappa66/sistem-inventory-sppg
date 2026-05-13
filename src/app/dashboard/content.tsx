"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useUser } from "@/lib/user-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/page-header"
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
    <div className="flex flex-col gap-6">
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-3 pt-4">
                <Skeleton className="size-8 rounded-lg" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
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
    <div className="flex flex-col gap-6 px-4 md:px-6">
      <PageHeader title="Dashboard" description={`Selamat datang, ${name} (${roleLabels[role] || role})`} />

      <div>
        <h2 className="mb-4 text-lg font-semibold">Menu Cepat</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((item) => (
            <Link key={item.label} href={item.href}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-3 pt-4">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {iconMap[item.icon]}
                  </div>
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
