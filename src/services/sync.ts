/**
 * Moteur de synchronisation différentielle (DCT §7)
 * PUSH → envoie l'Outbox vers le serveur (idempotent via UUID client)
 * PULL → récupère les changements depuis le curseur lastSyncAt
 * Résolution LWW (Last-Write-Wins) sur les fiches partagées (DCT §7.4)
 */
import { apiClient } from '../lib/api/client'
import {
  db, getPendingOutbox, removeFromOutbox, incrementTries,
  getLastSyncAt, setLastSyncAt, upsertProspect, countPending,
} from './db'
import type { Prospect, Visite, Relance, OutboxEntry } from '../shared/types'

const MAX_TRIES = 5
const BATCH_SIZE = 20

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline'

export interface SyncResult {
  pushed: number
  pulled: number
  conflicts: number
  errors: number
}

// ─── LWW conflict resolution (DCT §7.4) ──────────────────────────────────────
function resolveConflict<T extends { updatedAt?: string }>(
  local: T,
  server: T,
): { action: 'INSERT' | 'UPDATE' | 'KEEP_SERVER'; value: T } {
  if (!server) return { action: 'INSERT', value: local }
  const localTs = new Date(local.updatedAt ?? 0).getTime()
  const serverTs = new Date(server.updatedAt ?? 0).getTime()
  if (localTs > serverTs) {
    console.debug('[sync] LWW_APPLIQUE', (local as any).id)
    return { action: 'UPDATE', value: local }
  }
  console.debug('[sync] LWW_REJETE', (local as any).id)
  return { action: 'KEEP_SERVER', value: server }
}

// ─── PUSH — vide l'Outbox vers le serveur ─────────────────────────────────────
async function push(): Promise<{ pushed: number; errors: number }> {
  const entries = await getPendingOutbox()
  const batches: OutboxEntry[][] = []
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    batches.push(entries.slice(i, i + BATCH_SIZE))
  }

  let pushed = 0
  let errors = 0

  for (const batch of batches) {
    try {
      const res = await apiClient.post('/sync/push', { operations: batch })
      const acks: Array<{ seq: number; serverId: string; syncState: string }> = res.data.acks ?? []
      for (const ack of acks) {
        // Update local record with serverId returned
        await removeFromOutbox(ack.seq)
        pushed++
      }
    } catch (err: any) {
      for (const entry of batch) {
        if (entry.seq !== undefined && entry.tries < MAX_TRIES) {
          await incrementTries(entry.seq)
        }
        errors++
      }
    }
  }
  return { pushed, errors }
}

// ─── PULL — récupère les changements depuis le curseur ────────────────────────
async function pull(): Promise<{ pulled: number; conflicts: number }> {
  const since = await getLastSyncAt()
  const params: Record<string, string> = {}
  if (since) params.since = since

  let pulled = 0
  let conflicts = 0

  try {
    const res = await apiClient.get('/sync/pull', { params })
    const { prospects = [], visites = [], relances = [], serverTime } = res.data

    // Prospects — LWW (peut être édité concurremment)
    for (const serverProspect of prospects as Prospect[]) {
      const local = await db.prospects.get(serverProspect.id)
      if (local) {
        const { action, value } = resolveConflict(local, serverProspect)
        if (action !== 'KEEP_SERVER') conflicts++
        await upsertProspect({ ...value, syncState: 'SYNCED' })
      } else {
        await upsertProspect({ ...serverProspect, syncState: 'SYNCED' })
      }
      pulled++
    }

    // Visites — append-only, pas de conflit possible (DCT §7.3)
    for (const v of visites as Visite[]) {
      await db.visites.put({ ...v, syncState: 'SYNCED' })
      pulled++
    }

    // Relances
    for (const r of relances as Relance[]) {
      await db.relances.put({ ...r, syncState: 'SYNCED' })
      pulled++
    }

    if (serverTime) await setLastSyncAt(serverTime)
  } catch {
    // Network error — keep local data, retry next time
  }

  return { pulled, conflicts }
}

// ─── Point d'entrée principal ─────────────────────────────────────────────────
export async function synchronize(): Promise<SyncResult> {
  if (!navigator.onLine) {
    return { pushed: 0, pulled: 0, conflicts: 0, errors: 0 }
  }

  const { pushed, errors } = await push()
  const { pulled, conflicts } = await pull()

  return { pushed, pulled, conflicts, errors }
}

export async function getPendingCount(): Promise<number> {
  return countPending()
}

// ─── Photo compression (DCT §3.5) ────────────────────────────────────────────
export async function compresserPhoto(
  file: File,
  maxCote = 1024,
  qualite = 0.72,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const ratio = Math.min(1, maxCote / Math.max(bitmap.width, bitmap.height))
  const canvas = new OffscreenCanvas(
    Math.round(bitmap.width * ratio),
    Math.round(bitmap.height * ratio),
  )
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvas.convertToBlob({ type: 'image/jpeg', quality: qualite })
}

// ─── Géolocalisation ponctuelle (DCT §3.6) ────────────────────────────────────
export function capturePosition(): Promise<GeolocationCoordinates | null> {
  return new Promise(resolve => {
    if (!navigator.geolocation) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      pos => resolve(pos.coords),
      () => resolve(null),
      { timeout: 8000, maximumAge: 60000 },
    )
  })
}

// ─── Auto-sync on reconnect ───────────────────────────────────────────────────
export function startSyncListener(onSync: (result: SyncResult) => void) {
  const handler = () => synchronize().then(onSync).catch(console.error)
  window.addEventListener('online', handler)
  return () => window.removeEventListener('online', handler)
}
