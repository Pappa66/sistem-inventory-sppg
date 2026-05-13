"use client"

import { logout } from "@/lib/auth"
import Link from "next/link"
import { usePathname } from "next/navigation"

const roleMenus: Record<string, { label: string; href: string }[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Kelola Pengguna", href: "/admin" },
    { label: "Master Barang", href: "/admin/barang" },
    { label: "Log Audit", href: "/admin/audit" },
  ],
  HEAD_CHEF: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Menu 5 Hari", href: "/head-chef" },
  ],
  ASISTEN_LAPANGAN: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Input Pembelian", href: "/asisten-lapangan" },
  ],
  STAFF_LAPANGAN: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Opname Stok", href: "/staff-lapangan" },
    { label: "Barang Masuk", href: "/staff-lapangan/masuk" },
    { label: "Barang Keluar", href: "/staff-lapangan/keluar" },
    { label: "Waste", href: "/staff-lapangan/waste" },
  ],
  AKUNTAN: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Verifikasi", href: "/akuntan" },
    { label: "Laporan", href: "/akuntan/laporan" },
  ],
  KEPALA_DAPUR: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Laporan Stok", href: "/kepala-dapur" },
    { label: "Approval Belanja", href: "/kepala-dapur/approval" },
  ],
}

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  AKUNTAN: "Akuntan",
  KEPALA_DAPUR: "Kepala Dapur",
  HEAD_CHEF: "Head Chef",
  ASISTEN_LAPANGAN: "Asisten Lapangan",
  STAFF_LAPANGAN: "Staff Lapangan",
}

export default function AppLayout({ children, role, name }: { children: React.ReactNode; role: string; name: string }) {
  const pathname = usePathname()
  const menus = roleMenus[role] || []

  return (
    <div className="drawer lg:drawer-open">
      <input id="drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <div className="navbar bg-base-100 border-b border-base-200 lg:hidden">
          <div className="flex-none">
            <label htmlFor="drawer" className="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </label>
          </div>
          <div className="flex-1 font-bold">SPPG Inventory</div>
          <form action={logout}><button className="btn btn-ghost btn-sm text-error">Keluar</button></form>
        </div>
        <main className="p-4 md:p-8">{children}</main>
      </div>
      <div className="drawer-side">
        <label htmlFor="drawer" className="drawer-overlay"></label>
        <aside className="bg-base-200 min-h-screen w-64 p-4 flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-bold">SPPG Inventory</h2>
            <p className="text-sm text-base-content/60">Satuan Pelayanan Gizi</p>
          </div>

          <div className="mb-4 px-3 py-2 bg-base-300 rounded-lg">
            <p className="text-sm font-medium">{name}</p>
            <span className="badge badge-primary badge-sm">{roleLabels[role] || role}</span>
          </div>

          <ul className="menu menu-sm rounded-box flex-1 gap-1">
            {menus.map((m) => (
              <li key={m.href}>
                <Link href={m.href} className={pathname === m.href ? "active" : ""}>{m.label}</Link>
              </li>
            ))}
          </ul>

          <form action={logout} className="mt-4">
            <button className="btn btn-ghost btn-sm w-full text-error">Keluar</button>
          </form>
        </aside>
      </div>
    </div>
  )
}
