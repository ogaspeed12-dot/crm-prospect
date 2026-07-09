import type { UserRole } from '../shared/types'

export interface AuthSession {
  role: UserRole
  nom: string
  initials: string
  zone: string
  tenantId: string
}

export function getSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem('wara_session')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setSession(s: AuthSession) {
  localStorage.setItem('wara_session', JSON.stringify(s))
  localStorage.setItem('tenantId', s.tenantId)
}

export function clearSession() {
  localStorage.removeItem('wara_session')
  localStorage.removeItem('tenantId')
  localStorage.removeItem('token')
}

export function isMobileDevice(): boolean {
  return window.innerWidth < 768 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export function resolveInterface(role: UserRole, _mobile?: boolean): 'mobile' | 'direction' | 'admin' {
  if (role === 'admin') return 'admin'
  if (role === 'manager') return 'direction'
  return 'mobile'
}
