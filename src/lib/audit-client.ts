import { supabase } from "./supabase"

export async function createAuditLogClient(params: {
  userId: string
  action: string
  entity: string
  entityId: string
  oldValue?: Record<string, unknown>
  newValue?: Record<string, unknown>
  alasanEdit?: string
}) {
  const { userId, action, entity, entityId, oldValue, newValue, alasanEdit } = params

  await supabase.from("AuditLog").insert({
    userId,
    action,
    entity,
    entityId,
    oldValue: oldValue ?? null,
    newValue: newValue ?? null,
    alasanEdit: alasanEdit ?? null,
    createdAt: new Date().toISOString(),
  })
}
