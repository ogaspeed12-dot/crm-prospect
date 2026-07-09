import { apiClient } from '../../lib/api/client'
import type { User, UserRole } from '../../shared/types'

export interface AuditLog {
  id: string; userId: string; userNom: string; action: string
  entity: string; entityId?: string; createdAt: string; ip?: string
}

// ─── Utilisateurs ─────────────────────────────────────────────────────────────
export async function fetchUsers(): Promise<User[]> {
  const res = await apiClient.get<User[]>('/admin/users')
  return res.data
}

export async function inviteUser(body: { email: string; nom: string; role: UserRole; zone?: string }): Promise<User> {
  const res = await apiClient.post<User>('/admin/users/invite', body)
  return res.data
}

export async function updateUser(id: string, body: Partial<User>): Promise<User> {
  const res = await apiClient.put<User>(`/admin/users/${id}`, body)
  return res.data
}

export async function deactivateUser(id: string): Promise<void> {
  await apiClient.delete(`/admin/users/${id}`)
}

// ─── Référentiels ─────────────────────────────────────────────────────────────
export async function fetchSecteurs(): Promise<string[]> {
  const res = await apiClient.get<string[]>('/admin/referentiels/secteurs')
  return res.data
}

export async function updateSecteur(secteurs: string[]): Promise<void> {
  await apiClient.put('/admin/referentiels/secteurs', { values: secteurs })
}

export async function fetchZones(): Promise<string[]> {
  const res = await apiClient.get<string[]>('/admin/referentiels/zones')
  return res.data
}

// ─── Journal d'audit ──────────────────────────────────────────────────────────
export async function fetchAuditLogs(params?: { userId?: string; limit?: number }): Promise<AuditLog[]> {
  const res = await apiClient.get<AuditLog[]>('/admin/audit', { params })
  return res.data
}
