import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    lazy: () => import('../features/dashboard/DashboardPage').then((m) => ({ Component: m.default })),
  },
  {
    path: '/login',
    lazy: () => import('../features/auth/LoginPage').then((m) => ({ Component: m.default })),
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
