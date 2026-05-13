"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { logout } from "@/lib/auth"
import { useUser } from "@/lib/user-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Package,
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
  LogOut,
  Building2,
  PackageSearch,
} from "lucide-react"

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  AKUNTAN: "Akuntan",
  KEPALA_DAPUR: "Kepala Dapur",
  HEAD_CHEF: "Head Chef",
  ASISTEN_LAPANGAN: "Asisten Lapangan",
  STAFF_LAPANGAN: "Staff Lapangan",
}

const roleMenus: Record<string, { label: string; href: string; icon: React.ReactNode }[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard /> },
    { label: "Inventaris", href: "/inventory", icon: <PackageSearch /> },
    { label: "Kelola Pengguna", href: "/admin", icon: <Users /> },
    { label: "Log Audit", href: "/admin/audit", icon: <ClipboardList /> },
    { label: "Master Data", href: "/master-data", icon: <Package /> },
  ],
  HEAD_CHEF: [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard /> },
    { label: "Menu 5 Hari", href: "/head-chef", icon: <UtensilsCrossed /> },
  ],
  ASISTEN_LAPANGAN: [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard /> },
    { label: "Input Pembelian", href: "/asisten-lapangan", icon: <ShoppingCart /> },
    { label: "Master Data", href: "/master-data", icon: <Package /> },
  ],
  STAFF_LAPANGAN: [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard /> },
    { label: "Opname Stok", href: "/staff-lapangan", icon: <ClipboardCheck /> },
    { label: "Barang Masuk", href: "/staff-lapangan/masuk", icon: <ArrowDownFromLine /> },
    { label: "Barang Keluar", href: "/staff-lapangan/keluar", icon: <ArrowUpFromLine /> },
    { label: "Waste", href: "/staff-lapangan/waste", icon: <Trash2 /> },
  ],
  AKUNTAN: [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard /> },
    { label: "Verifikasi", href: "/akuntan", icon: <CheckCircle /> },
    { label: "Laporan Keuangan", href: "/akuntan/laporan", icon: <FileBarChart /> },
  ],
  KEPALA_DAPUR: [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard /> },
    { label: "Laporan Stok", href: "/kepala-dapur", icon: <BarChart3 /> },
    { label: "Approval Belanja", href: "/kepala-dapur/approval", icon: <ShoppingBag /> },
  ],
}

export function AppSidebar() {
  const pathname = usePathname()
  const { name, role } = useUser()
  const menus = roleMenus[role] || []

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="size-4" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">SPPG Inventory</span>
            <span className="text-xs text-muted-foreground">Satuan Pelayanan Gizi</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menus.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    render={<Link href={item.href} />}
                    tooltip={item.label}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <div className="flex items-center gap-2 px-2 py-1 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium leading-tight">{name}</span>
            <Badge variant="secondary" className="w-fit text-[10px] px-1.5 py-0 h-4">
              {roleLabels[role] || role}
            </Badge>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <form action={logout}>
              <SidebarMenuButton type="submit" tooltip="Keluar">
                <LogOut />
                <span>Keluar</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
