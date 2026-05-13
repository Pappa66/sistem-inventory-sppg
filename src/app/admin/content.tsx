"use client"

import { useActionState, useEffect, useState } from "react"
import { createUser, toggleUserStatus } from "./actions"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Loader2, Plus, Check, X } from "lucide-react"
import { PageHeader } from "@/components/page-header"

type User = {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  noWa: string | null
}

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  AKUNTAN: "Akuntan",
  KEPALA_DAPUR: "Kepala Dapur",
  HEAD_CHEF: "Head Chef",
  ASISTEN_LAPANGAN: "Asisten Lapangan",
  STAFF_LAPANGAN: "Staff Lapangan",
}

const roles = Object.entries(roleLabels)

export function AdminContent() {
  const [users, setUsers] = useState<User[]>([])
  const [state, action, pending] = useActionState(createUser, undefined)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  async function loadUsers() {
    const { data } = await supabase
      .from("User")
      .select("*")
      .order("createdAt", { ascending: false })
    if (data) setUsers(data as User[])
    setLoading(false)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (state?.success) {
      toast.success("Pengguna berhasil ditambahkan")
      loadUsers()
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state])
  async function handleToggle(id: string, current: boolean) {
    setToggling(id)
    try {
      await toggleUserStatus(id, !current)
      await loadUsers()
      toast.success(`Pengguna ${current ? "dinonaktifkan" : "diaktifkan"}`)
    } catch {
      toast.error("Gagal mengubah status")
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 space-y-8">
      <PageHeader title="Admin" description="Kelola pengguna sistem" />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="size-4" />
            Tambah Pengguna Baru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" name="name" placeholder="Nama Lengkap" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="Email" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Password" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Select name="role" required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="noWa">No WA (opsional)</Label>
              <Input id="noWa" name="noWa" placeholder="No WA" />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={pending} className="w-full">
                {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                {pending ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>No WA</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{roleLabels[u.role] || u.role}</Badge>
                    </TableCell>
                    <TableCell>{u.noWa || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={u.isActive ? "default" : "destructive"}>
                        {u.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={u.isActive ? "destructive" : "outline"}
                        size="xs"
                        onClick={() => handleToggle(u.id, u.isActive)}
                        disabled={toggling === u.id}
                      >
                        {toggling === u.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : u.isActive ? (
                          <X className="size-3" />
                        ) : (
                          <Check className="size-3" />
                        )}
                        {u.isActive ? "Nonaktifkan" : "Aktifkan"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
