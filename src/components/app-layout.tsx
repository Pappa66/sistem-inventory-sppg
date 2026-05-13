"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"

const pathLabels: Record<string, string> = {
  dashboard: "Dashboard",
  admin: "Admin",
  audit: "Log Audit",
  barang: "Master Barang",
  "master-data": "Master Data",
  "head-chef": "Menu 5 Hari",
  "asisten-lapangan": "Input Pembelian",
  "staff-lapangan": "Opname Stok",
  masuk: "Barang Masuk",
  keluar: "Barang Keluar",
  waste: "Waste",
  akuntan: "Verifikasi",
  laporan: "Laporan Keuangan",
  "kepala-dapur": "Laporan Stok",
  approval: "Approval Belanja",
}

function BreadcrumbNav() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
      {segments.map((seg, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/")
        const label = pathLabels[seg] || seg.charAt(0).toUpperCase() + seg.slice(1)
        const isLast = i === segments.length - 1

        return (
          <span key={href} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-muted-foreground/40">/</span>}
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors">{label}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
          <SidebarTrigger />
          <BreadcrumbNav />
        </header>
        <main className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 overflow-x-hidden">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
