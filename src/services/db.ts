/**
 * IndexedDB schema via Dexie.js (DCT §3.4)
 * Reproduit les entités métier nécessaires au travail déconnecté + table Outbox.
 */
import Dexie, { type Table } from 'dexie'
import type { Prospect, Visite, Relance, OutboxEntry, SyncMeta } from '../shared/types'

export class CrmDatabase extends Dexie {
  prospects!: Table<Prospect, string>
  visites!: Table<Visite, string>
  relances!: Table<Relance, string>
  outbox!: Table<OutboxEntry, number>
  meta!: Table<SyncMeta, string>

  constructor() {
    super('crm_terrain')
    this.version(1).stores({
      // Index : PK, then indexed fields for filtering/sync
      prospects: 'id, statut, secteur, updatedAt, syncState, deletedAt, proprietaireId',
      visites: 'id, prospectId, auteurId, dateVisite, syncState, updatedAt',
      relances: 'id, prospectId, auteurId, echeance, statut, syncState',
      outbox: '++seq, entity, op, localId, tries, createdAt',
      meta: 'key',
    })
  }
}

export const db = new CrmDatabase()

// ─── Meta helpers ─────────────────────────────────────────────────────────────
export async function getLastSyncAt(): Promise<string | null> {
  const row = await db.meta.get('lastSyncAt')
  return row ? String(row.value) : null
}

export async function setLastSyncAt(ts: string) {
  await db.meta.put({ key: 'lastSyncAt', value: ts })
}

// ─── Prospect helpers ─────────────────────────────────────────────────────────
export async function upsertProspect(p: Prospect) {
  await db.prospects.put({ ...p, updatedAt: p.updatedAt ?? new Date().toISOString() })
}

export async function getProspect(id: string): Promise<Prospect | undefined> {
  return db.prospects.get(id)
}

export async function listProspects(filter?: { statut?: string; secteur?: string }): Promise<Prospect[]> {
  const all = await db.prospects.filter(p => !p.deletedAt).toArray()
  if (!filter) return all
  return all.filter(p => {
    if (filter.statut && p.statut !== filter.statut) return false
    if (filter.secteur && p.secteur !== filter.secteur) return false
    return true
  })
}

// ─── Visite helpers ───────────────────────────────────────────────────────────
export async function addVisite(v: Visite) {
  await db.visites.put({ ...v, updatedAt: new Date().toISOString(), syncState: 'PENDING' })
}

export async function listVisitesForProspect(prospectId: string): Promise<Visite[]> {
  return db.visites.where('prospectId').equals(prospectId).sortBy('dateVisite')
}

// ─── Relance helpers ──────────────────────────────────────────────────────────
export async function listRelances(auteurId?: string): Promise<Relance[]> {
  const all = await db.relances.where('statut').equals('A_FAIRE').toArray()
  return auteurId ? all.filter(r => r.auteurId === auteurId) : all
}

// ─── Outbox helpers ───────────────────────────────────────────────────────────
export async function enqueue(entry: Omit<OutboxEntry, 'seq'>) {
  await db.outbox.add({ ...entry, tries: 0, createdAt: new Date().toISOString() })
}

export async function getPendingOutbox(): Promise<OutboxEntry[]> {
  return db.outbox.orderBy('seq').toArray()
}

export async function removeFromOutbox(seq: number) {
  await db.outbox.delete(seq)
}

export async function incrementTries(seq: number) {
  await db.outbox.where('seq').equals(seq).modify(e => { e.tries += 1 })
}

export async function countPending(): Promise<number> {
  return db.outbox.count()
}
