import axios from 'axios'

export const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_URL ?? '') + '/api/v1',
  headers: { 'Content-Type': 'application/json; charset=UTF-8' },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  const tenantId = localStorage.getItem('tenantId')
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (tenantId) config.headers['X-Tenant-ID'] = tenantId
  return config
})

apiClient.interceptors.response.use(
  r => r,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré — tenter refresh (DCT §8.3)
      const refresh = localStorage.getItem('refreshToken')
      if (refresh) {
        try {
          const res = await axios.post('/api/v1/auth/refresh', { refreshToken: refresh })
          localStorage.setItem('token', res.data.accessToken)
          error.config.headers.Authorization = `Bearer ${res.data.accessToken}`
          return apiClient.request(error.config)
        } catch {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        }
      } else {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)
