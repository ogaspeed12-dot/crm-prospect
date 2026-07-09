import { useQuery } from '@tanstack/react-query'
import {
  fetchDashboard, fetchEquipe, fetchProspects, fetchRelancesEquipe, exportRapport, type Periode,
} from './api'

export function useDashboard(periode: Periode) {
  return useQuery({
    queryKey: ['dashboard', periode],
    queryFn: () => fetchDashboard(periode),
    staleTime: 1000 * 60 * 5,
  })
}

export function useEquipe() {
  return useQuery({
    queryKey: ['equipe'],
    queryFn: fetchEquipe,
    staleTime: 1000 * 60 * 10,
  })
}

export function useProspectsDirection(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['prospects-direction', params],
    queryFn: () => fetchProspects(params),
    staleTime: 1000 * 60 * 5,
  })
}

export function useRelancesEquipe() {
  return useQuery({
    queryKey: ['relances-equipe'],
    queryFn: fetchRelancesEquipe,
    staleTime: 1000 * 60 * 2,
  })
}

export async function triggerExport(periode: Periode) {
  const blob = await exportRapport(periode)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rapport-${periode}-${new Date().toISOString().slice(0, 10)}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}
