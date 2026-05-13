"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PageHeader } from "@/components/page-header"
import { PageWrapper, ContentCard } from "@/components/layout-utils"
import { EmptyState } from "@/components/ui/empty-state"

type AuditLog = {
  id: string
  createdAt: string
  userId: string
  user: { name: string } | null
  action: string
  entity: string
  entityId: string
  oldValue: Record<string, unknown> | null
  newValue: Record<string, unknown> | null
  alasanEdit: string | null
}

const actionLabels: Record<string, string> = {
  CREATE: "Tambah",
  UPDATE: "Ubah",
  DELETE: "Hapus",
}

const actionVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  CREATE: "default",
  UPDATE: "secondary",
  DELETE: "destructive",
}

function formatDetailValue(value: unknown): string {
  if (value === null || value === undefined) return "-"
  if (typeof value === "boolean") return value ? "Ya" : "Tidak"
  return String(value)
}

function renderDetail(log: AuditLog) {
  if (log.action === "CREATE" && log.newValue) {
    return (
      <ul className="list-disc list-inside space-y-1">
        {Object.entries(log.newValue).map(([key, val]) => (
          <li key={key} className="text-sm">
            <span className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>{" "}
            {formatDetailValue(val)}
          </li>
        ))}
      </ul>
    )
  }

  if (log.action === "UPDATE") {
    const changedFields: { key: string; oldVal: unknown; newVal: unknown }[] = []
    const allKeys = new Set([
      ...Object.keys(log.oldValue || {}),
      ...Object.keys(log.newValue || {}),
    ])
    for (const key of allKeys) {
      const oldVal = log.oldValue?.[key]
      const newVal = log.newValue?.[key]
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changedFields.push({ key, oldVal, newVal })
      }
    }

    if (changedFields.length === 0) return <p className="text-sm text-muted-foreground">Tidak ada perubahan</p>

    return (
      <div className="space-y-2">
        {changedFields.map(({ key, oldVal, newVal }) => (
          <div key={key} className="text-sm border-l-2 border-border pl-3">
            <p className="font-medium capitalize mb-1">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-destructive line-through">{formatDetailValue(oldVal)}</span>
              <span className="text-muted-foreground">&rarr;</span>
              <span className="text-green-600 dark:text-green-400">{formatDetailValue(newVal)}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (log.action === "DELETE" && log.oldValue) {
    return (
      <ul className="list-disc list-inside space-y-1">
        {Object.entries(log.oldValue).map(([key, val]) => (
          <li key={key} className="text-sm">
            <span className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>{" "}
            {formatDetailValue(val)}
          </li>
        ))}
      </ul>
    )
  }

  return <p className="text-sm text-muted-foreground">Tidak ada detail</p>
}

export function AuditContent() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  async function loadLogs() {
    const { data } = await supabase
      .from("AuditLog")
      .select("*, user: userId(name)")
      .order("createdAt", { ascending: false })
      .limit(100)
    if (data) setLogs(data as unknown as AuditLog[])
    setLoading(false)
  }

  useEffect(() => {
    loadLogs()
  }, [])
  return (
    <PageWrapper>
      <PageHeader title="Audit Log" description="Monitor aktivitas sistem" />
      <ContentCard header="Riwayat Aktivitas">
        {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <EmptyState title="Belum ada aktivitas" description="Log audit akan muncul saat ada aktivitas sistem" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Pengguna</TableHead>
                    <TableHead>Aksi</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead className="text-right">Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="font-medium">{log.user?.name || log.userId}</TableCell>
                    <TableCell>
                      <Badge variant={actionVariants[log.action] || "outline"}>
                        {actionLabels[log.action] || log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.entity}</Badge>
                      {log.alasanEdit && (
                        <p className="text-xs text-muted-foreground mt-1">{log.alasanEdit}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger className="inline-flex items-center justify-center rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-accent hover:text-accent-foreground">
                          Lihat Detail
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle>
                              {actionLabels[log.action] || log.action} - {log.entity}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-2 text-sm border-b pb-3">
                              <div>
                                <span className="text-muted-foreground">Waktu:</span>{" "}
                                {new Date(log.createdAt).toLocaleString("id-ID")}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Oleh:</span>{" "}
                                {log.user?.name || log.userId}
                              </div>
                              <div>
                                <span className="text-muted-foreground">ID:</span>{" "}
                                <code className="text-xs bg-muted px-1 rounded">{log.entityId}</code>
                              </div>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">
                                Detail Perubahan
                              </p>
                              {renderDetail(log)}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </ContentCard>
      </PageWrapper>
    )
  }

