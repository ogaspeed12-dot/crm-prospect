export * from './tenant'

// ─── Rôles (DCT §8.2 RBAC) ───────────────────────────────────────────────────
export type UserRole = 'commercial' | 'manager' | 'admin'

// ─── Enums métier alignés DCT §5.3 (listes fermées PRD F2.5) ─────────────────
export type StatutProspect = 'NOUVEAU' | 'CHAUD' | 'TIEDE' | 'FROID' | 'CLIENT' | 'PERDU'
export type ResultatVisite = 'RDV_HONORE' | 'ABSENT' | 'INTERESSE' | 'REFUS' | 'A_RELANCER'
export type EtapeOpportunite = 'CONTACT' | 'PROPOSITION' | 'NEGOCIATION' | 'GAGNE' | 'PERDU'
export type StatutRelance = 'A_FAIRE' | 'FAIT'
export type SyncState = 'PENDING' | 'SYNCED' | 'ERROR'

// ─── Entités métier (PRD §8, DCT §5) ─────────────────────────────────────────
export interface User {
  id: string
  nom: string
  email: string
  initials: string
  role: UserRole
  zone: string
  territoireId?: string
  actif?: boolean
}

export interface Prospect {
  id: string
  localId?: string
  raisonSociale: string
  nom: string            // alias UI pour raisonSociale
  contact?: string
  telephone?: string
  adresse?: string
  secteur: string
  cat?: string           // UI category label
  spec?: string          // UI notes/spécificités
  ville: string
  statut: StatutProspect
  latitude?: number
  longitude?: number
  proprietaireId?: string
  updatedAt?: string
  deletedAt?: string | null
  syncState?: SyncState
  // UI helpers
  last?: string
  historique?: HistoriqueVisite[]
}

export interface HistoriqueVisite {
  date: string
  objet: string
  resultat: string
}

export interface Visite {
  id: string             // UUID généré côté client (idempotence DCT §6.1)
  localId?: string
  prospectId: string
  auteurId?: string
  dateVisite: string     // ISO 8601
  objet?: string
  resultat?: ResultatVisite
  prochaineAction?: string
  latitude?: number
  longitude?: number
  photoUrl?: string
  prochaineRelance?: string
  updatedAt?: string
  syncState?: SyncState
}

export interface Opportunite {
  id: string
  prospectId: string
  auteurId?: string
  libelle?: string
  montantEstime?: number
  etape: EtapeOpportunite
  probabilite: number    // 0.000 à 1.000
  echeance?: string
  deletedAt?: string | null
  updatedAt?: string
}

export interface Relance {
  id: string
  localId?: string
  nom: string            // raison sociale prospect (UI)
  motif: string          // objet
  prospectId?: string
  auteurId?: string
  echeance: string       // date ISO
  statut: StatutRelance
  due?: string           // UI helper: 'today' | 'demain' | '3j' ...
  echue?: boolean        // UI helper
  dueText?: string       // UI badge text
  updatedAt?: string
  syncState?: SyncState
}

export interface OutboxEntry {
  seq?: number           // auto-increment PK
  entity: 'prospects' | 'visites' | 'relances' | 'opportunites'
  op: 'CREATE' | 'UPDATE' | 'DELETE'
  localId: string
  payload: Record<string, unknown>
  tries: number
  createdAt: string
}

export interface SyncMeta {
  key: string
  value: string | number | null
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  accessToken?: string
}

// ─── API responses ────────────────────────────────────────────────────────────
export interface ApiError {
  error: {
    code: string
    message: string
    details?: Array<Record<string, unknown>>
  }
}

export interface DashboardSynthese {
  visites: number
  nouveaux: number
  tauxConversion: number       // %
  retards: number
  caPrevisionnel: number       // FCFA
  periodeLabel: string
}

export interface ClassementCommercial {
  id: string
  nom: string
  zone: string
  visites: number
  conv: number
  taux: number              // %
  caN: number               // millions FCFA
}
