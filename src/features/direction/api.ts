import { apiClient } from '../../lib/api/client'
import type { DashboardSynthese, ClassementCommercial, Prospect, Relance } from '../../shared/types'

export type Periode = 'semaine' | 'mois' | 'trimestre'

export interface DashboardPayload {
  synthese: DashboardSynthese
  classement: ClassementCommercial[]
  alertes: Array<{ id: string; type: 'retard' | 'objectif' | 'inactif'; message: string; userId?: string }>
  tauxConversionZones: Array<{ zone: string; taux: number; prospects: number }>
}

export async function fetchDashboard(periode: Periode): Promise<DashboardPayload> {
  const res = await apiClient.get<DashboardPayload>('/dashboard', { params: { periode } })
  return res.data
}

export async function fetchEquipe() {
  const res = await apiClient.get<ClassementCommercial[]>('/equipe')
  return res.data
}

export async function fetchProspects(params?: Record<string, string>) {
  const res = await apiClient.get<{ data: Prospect[]; total: number }>('/prospects', { params })
  return res.data
}

export async function fetchRelancesEquipe() {
  const res = await apiClient.get<Relance[]>('/relances', { params: { all: true } })
  return res.data
}

export async function exportRapport(periode: Periode): Promise<Blob> {
  const res = await apiClient.get('/dashboard/export', {
    params: { periode },
    responseType: 'blob',
  })
  return res.data
}
