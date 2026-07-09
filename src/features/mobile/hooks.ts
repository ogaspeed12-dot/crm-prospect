import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { v4 as uuid } from 'uuid'
import {
  fetchProspects, fetchProspect, createProspect,
  fetchVisitesForProspect, createVisite, fetchRelances, updateRelance,
  uploadPhoto, type ProspectFilters,
} from './api'
import {
  db, upsertProspect, addVisite, listProspects, listRelances,
  getProspect, listVisitesForProspect as dbVisitesForProspect, enqueue,
} from '../../services/db'
import { compresserPhoto, capturePosition } from '../../services/sync'
import type { Visite, Prospect, ResultatVisite } from '../../shared/types'

// ─── Prospects ────────────────────────────────────────────────────────────────
export function useProspects(filters?: ProspectFilters) {
  return useQuery({
    queryKey: ['prospects', filters],
    queryFn: async () => {
      if (!navigator.onLine) {
        return listProspects({ statut: filters?.statut, secteur: filters?.secteur })
      }
      const { data } = await fetchProspects(filters)
      for (const p of data) await upsertProspect({ ...p, syncState: 'SYNCED' })
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useProspect(id: string) {
  return useQuery({
    queryKey: ['prospect', id],
    queryFn: async () => {
      if (!navigator.onLine) return getProspect(id)
      const p = await fetchProspect(id)
      await upsertProspect({ ...p, syncState: 'SYNCED' })
      return p
    },
    enabled: !!id,
  })
}

export function useCreateProspect() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Prospect, 'id' | 'syncState'>) => {
      const localId = uuid()
      const prospect: Prospect = {
        ...data,
        id: localId,
        localId,
        syncState: 'PENDING',
        updatedAt: new Date().toISOString(),
      }
      await upsertProspect(prospect)
      await enqueue({ entity: 'prospects', op: 'CREATE', localId, payload: prospect as any, tries: 0, createdAt: new Date().toISOString() })
      if (navigator.onLine) {
        const server = await createProspect(data)
        await upsertProspect({ ...server, syncState: 'SYNCED' })
        return server
      }
      return prospect
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prospects'] }),
  })
}

// ─── Visites ──────────────────────────────────────────────────────────────────
export function useVisitesForProspect(prospectId: string) {
  return useQuery({
    queryKey: ['visites', prospectId],
    queryFn: async () => {
      if (!navigator.onLine) return dbVisitesForProspect(prospectId)
      const list = await fetchVisitesForProspect(prospectId)
      for (const v of list) await db.visites.put({ ...v, syncState: 'SYNCED' })
      return list
    },
    enabled: !!prospectId,
  })
}

export interface VisiteFormData {
  prospectId: string
  objet: string
  resultat: ResultatVisite
  prochaineAction?: string
  prochaineRelance?: string
  photo?: File | null
  captureGps?: boolean
}

export function useCreateVisite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (form: VisiteFormData) => {
      const localId = uuid()
      let coords: GeolocationCoordinates | null = null

      if (form.captureGps) {
        coords = await capturePosition()
      }

      const visite: Visite = {
        id: localId,
        localId,
        prospectId: form.prospectId,
        dateVisite: new Date().toISOString(),
        objet: form.objet,
        resultat: form.resultat,
        prochaineAction: form.prochaineAction,
        prochaineRelance: form.prochaineRelance,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        syncState: 'PENDING',
        updatedAt: new Date().toISOString(),
      }

      // Photo compression + upload si disponible
      if (form.photo) {
        const blob = await compresserPhoto(form.photo)
        if (navigator.onLine) {
          const { url } = await uploadPhoto(blob, localId)
          visite.photoUrl = url
        } else {
          visite.photoUrl = URL.createObjectURL(blob)
        }
      }

      await addVisite(visite)
      await enqueue({ entity: 'visites', op: 'CREATE', localId, payload: visite as any, tries: 0, createdAt: new Date().toISOString() })

      if (navigator.onLine) {
        const server = await createVisite(visite)
        await db.visites.put({ ...server, syncState: 'SYNCED' })
        return server
      }
      return visite
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['visites', vars.prospectId] })
      qc.invalidateQueries({ queryKey: ['prospects'] })
    },
  })
}

// ─── Relances ─────────────────────────────────────────────────────────────────
export function useRelances(auteurId?: string) {
  return useQuery({
    queryKey: ['relances', auteurId],
    queryFn: async () => {
      if (!navigator.onLine) return listRelances(auteurId)
      const list = await fetchRelances(auteurId)
      for (const r of list) await db.relances.put({ ...r, syncState: 'SYNCED' })
      return list
    },
    staleTime: 1000 * 60 * 2,
  })
}

export function useMarquerRelanceFaite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await db.relances.update(id, { statut: 'FAIT', syncState: 'PENDING', updatedAt: new Date().toISOString() })
      if (navigator.onLine) {
        await updateRelance(id, { statut: 'FAIT', updatedAt: new Date().toISOString() })
      } else {
        await enqueue({ entity: 'relances', op: 'UPDATE', localId: id, payload: { id, statut: 'FAIT' }, tries: 0, createdAt: new Date().toISOString() })
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['relances'] }),
  })
}
