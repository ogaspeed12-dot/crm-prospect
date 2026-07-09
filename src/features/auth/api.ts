import { apiClient } from '../../lib/api/client'
import type { UserRole } from '../../shared/types'

export interface LoginRequest { login: string; password: string; tenantId: string }
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: { id: string; nom: string; email: string; role: UserRole; zone: string; initials: string; tenantId: string }
}

export async function login(body: LoginRequest): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>('/auth/login', body)
  return res.data
}

export async function refreshToken(token: string): Promise<{ accessToken: string }> {
  const res = await apiClient.post<{ accessToken: string }>('/auth/refresh', { refreshToken: token })
  return res.data
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout').catch(() => null)
}
