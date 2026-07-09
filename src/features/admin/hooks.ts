import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchUsers, inviteUser, updateUser, deactivateUser, fetchAuditLogs, fetchSecteurs, fetchZones, updateSecteur } from './api'
import type { UserRole } from '../../shared/types'

export function useUsers() {
  return useQuery({ queryKey: ['admin-users'], queryFn: fetchUsers, staleTime: 1000 * 60 * 5 })
}

export function useInviteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: inviteUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<{ nom: string; role: UserRole; zone: string; actif: boolean }> }) =>
      updateUser(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })
}

export function useDeactivateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })
}

export function useAuditLogs(params?: { userId?: string; limit?: number }) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => fetchAuditLogs(params),
    staleTime: 1000 * 60,
  })
}

export function useSecteurs() {
  return useQuery({ queryKey: ['secteurs'], queryFn: fetchSecteurs, staleTime: Infinity })
}

export function useZones() {
  return useQuery({ queryKey: ['zones'], queryFn: fetchZones, staleTime: Infinity })
}

export function useUpdateSecteurs() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateSecteur,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['secteurs'] }),
  })
}
