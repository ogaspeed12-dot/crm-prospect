export * from './tenant'

export type UserRole = 'commercial' | 'manager' | 'admin'

export interface User {
  id: string
  nom: string
  email: string
  initials: string
  role: UserRole
  zone: string
}

export interface Prospect {
  id: number
  nom: string
  secteur: string
  cat: string
  spec: string
  ville: string
  statut: 'chaud' | 'tiede' | 'froid'
  phone: string
  last: string
  historique: { date: string; objet: string; resultat: string }[]
}

export interface Relance {
  id: string
  nom: string
  motif: string
  due: string
  echue: boolean
  dueText?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}
