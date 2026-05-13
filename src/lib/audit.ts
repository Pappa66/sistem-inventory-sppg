import { supabase } from "./supabase"

type AuditAction = "CREATE" | "UPDATE" | "DELETE"

export async function createAuditLog(params: {
  userId: string
  action: AuditAction
  entity: string
  entityId: string
  oldValue?: Record<string, unknown>
  newValue?: Record<string, unknown>
  alasanEdit?: string
}) {
  const { userId, action, entity, entityId, oldValue, newValue, alasanEdit } = params

  const { error } = await supabase.from("AuditLog").insert({
    userId,
    action,
    entity,
    entityId,
    oldValue: oldValue ?? null,
    newValue: newValue ?? null,
    alasanEdit: alasanEdit ?? null,
    createdAt: new Date().toISOString(),
  })

  if (error) console.error("Audit log error:", error)
}

export async function createAuditLogAdmin(params: {
  userId: string
  action: AuditAction
  entity: string
  entityId: string
  oldValue?: Record<string, unknown>
  newValue?: Record<string, unknown>
  alasanEdit?: string
}) {
  const { supabaseAdmin } = await import("./supabase")
  const { userId, action, entity, entityId, oldValue, newValue, alasanEdit } = params

  const { error } = await supabaseAdmin.from("AuditLog").insert({
    userId,
    action,
    entity,
    entityId,
    oldValue: oldValue ?? null,
    newValue: newValue ?? null,
    alasanEdit: alasanEdit ?? null,
    createdAt: new Date().toISOString(),
  })

  if (error) console.error("Audit log error:", error)
}
