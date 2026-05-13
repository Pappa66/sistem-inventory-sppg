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
import { PageHeader } from "@/components/page-header"
import { PageWrapper, ContentCard } from "@/components/layout-utils"
import { Form, FormGroup, FormSection } from "@/components/ui/form-utils"
import { RowActions, commonActions } from "@/components/ui/row-actions"
import { toast } from "sonner"
import { Loader2, Plus, Check, X, Trash } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

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
    <PageWrapper>
      <PageHeader title="Admin" description="Kelola pengguna sistem" />

      <ContentCard
        header={<div className="flex items-center gap-2"><Plus className="size-4" /> Tambah Pengguna Baru</div>}
      >
        <Form action={action} layout="grid-2">
          <FormGroup>
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" name="name" placeholder="Nama Lengkap" required />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="Email" required />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="Password" required />
          </FormGroup>
          <FormGroup>
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
          </FormGroup>
          <FormGroup span={2}>
            <Label htmlFor="noWa">No WA (opsional)</Label>
            <Input id="noWa" name="noWa" placeholder="No WA" />
          </FormGroup>
          <FormGroup span={2}>
            <Button type="submit" disabled={pending} size="lg" className="w-full">
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              {pending ? "Menyimpan..." : "Tambah Pengguna"}
            </Button>
          </FormGroup>
        </Form>
      </ContentCard>

      <ContentCard header="Daftar Pengguna">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <div className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>No WA</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right w-12">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{roleLabels[u.role] || u.role}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{u.noWa || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={u.isActive ? "default" : "destructive"}>
                        {u.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <RowActions
                        actions={[
                          {
                            label: u.isActive ? "Nonaktifkan" : "Aktifkan",
                            onClick: () => handleToggle(u.id, u.isActive),
                            variant: u.isActive ? "destructive" : "default",
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </ContentCard>

      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Pengguna?</DialogTitle>
            <DialogDescription>
              Aksi ini tidak dapat dibatalkan. Pengguna akan dihapus dari sistem.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={() => setDeleteConfirm(null)}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  )
}
