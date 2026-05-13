"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Separator } from "@/components/ui/separator"

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
    <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm">
      {segments.map((seg, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/")
        const label = pathLabels[seg] || seg.charAt(0).toUpperCase() + seg.slice(1)
        const isLast = i === segments.length - 1

        return (
          <span key={href} className="flex items-center gap-2">
            {i > 0 && <span className="text-muted-foreground/40">/</span>}
            {isLast ? (
              <span className="font-semibold text-foreground">{label}</span>
            ) : (
              <Link href={href} className="text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
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
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <SidebarTrigger className="lg:hidden" />
            <Separator orientation="vertical" className="h-6 lg:hidden" />
            <BreadcrumbNav />
          </div>
          <ThemeToggle />
        </header>
        <main className="w-full flex-1 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 md:px-6 py-6">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
