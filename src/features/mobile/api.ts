import { apiClient } from '../../lib/api/client'
import type { Prospect, Visite, Relance, StatutProspect } from '../../shared/types'

// ─── Prospects ────────────────────────────────────────────────────────────────
export interface ProspectFilters { statut?: StatutProspect; secteur?: string; q?: string; page?: number; limit?: number }

export async function fetchProspects(filters?: ProspectFilters) {
  const res = await apiClient.get<{ data: Prospect[]; total: number }>('/prospects', { params: filters })
  return res.data
}

export async function fetchProspect(id: string) {
  const res = await apiClient.get<Prospect>(`/prospects/${id}`)
  return res.data
}

export async function createProspect(body: Omit<Prospect, 'id' | 'syncState'>): Promise<Prospect> {
  const res = await apiClient.post<Prospect>('/prospects', body)
  return res.data
}

export async function updateProspect(id: string, body: Partial<Prospect>): Promise<Prospect> {
  const res = await apiClient.put<Prospect>(`/prospects/${id}`, body)
  return res.data
}

// ─── Visites ──────────────────────────────────────────────────────────────────
export async function fetchVisitesForProspect(prospectId: string) {
  const res = await apiClient.get<Visite[]>(`/prospects/${prospectId}/visites`)
  return res.data
}

export async function createVisite(body: Omit<Visite, 'syncState'>): Promise<Visite> {
  const res = await apiClient.post<Visite>('/visites', body)
  return res.data
}

// ─── Relances ─────────────────────────────────────────────────────────────────
export async function fetchRelances(auteurId?: string) {
  const res = await apiClient.get<Relance[]>('/relances', { params: { auteurId, statut: 'A_FAIRE' } })
  return res.data
}

export async function updateRelance(id: string, body: Partial<Relance>): Promise<Relance> {
  const res = await apiClient.put<Relance>(`/relances/${id}`, body)
  return res.data
}

// ─── Upload photo (DCT §3.5) ──────────────────────────────────────────────────
export async function uploadPhoto(blob: Blob, localId: string): Promise<{ url: string }> {
  const form = new FormData()
  form.append('file', blob, `${localId}.jpg`)
  const res = await apiClient.post<{ url: string }>('/visites/photo', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}
