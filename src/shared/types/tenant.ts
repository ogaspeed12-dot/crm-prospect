export interface Tenant {
  id: string
  slug: string
  name: string
  plan: 'free' | 'pro' | 'enterprise'
  createdAt: string
}

export interface TenantContext {
  tenant: Tenant | null
  isLoading: boolean
}
