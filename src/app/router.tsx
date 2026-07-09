import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { getSession, resolveInterface, isMobileDevice } from '../lib/auth'

const MobileApp = lazy(() => import('../features/mobile/MobileApp'))
const DirectionDashboard = lazy(() => import('../features/direction/DirectionDashboard'))
const AdminSpace = lazy(() => import('../features/admin/AdminSpace'))
const LoginPage = lazy(() => import('../features/auth/LoginPage'))

function Spinner() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FBF7F1' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#E0431D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ width: 32, height: 32, animation: 'v2spin 1.2s linear infinite' }}>
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
        </svg>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase' as const, color: '#8A7E71' }}>
          Chargement…
        </span>
      </div>
    </div>
  )
}

function RootRedirect() {
  const session = getSession()
  if (!session) return <Navigate to="/login" replace />
  const iface = resolveInterface(session.role, isMobileDevice())
  return <Navigate to={`/${iface}`} replace />
}

function ProtectedMobile() {
  const session = getSession()
  if (!session) return <Navigate to="/login" replace />
  if (session.role !== 'commercial') return <Navigate to="/" replace />
  return (
    <Suspense fallback={<Spinner />}>
      <MobileApp appName="Wara space" />
    </Suspense>
  )
}

function ProtectedDirection() {
  const session = getSession()
  if (!session) return <Navigate to="/login" replace />
  if (session.role !== 'manager') return <Navigate to="/" replace />
  return (
    <Suspense fallback={<Spinner />}>
      <DirectionDashboard appName="Wara space" />
    </Suspense>
  )
}

function ProtectedAdmin() {
  const session = getSession()
  if (!session) return <Navigate to="/login" replace />
  if (session.role !== 'admin') return <Navigate to="/" replace />
  return (
    <Suspense fallback={<Spinner />}>
      <AdminSpace appName="Wara space" />
    </Suspense>
  )
}

const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },
  {
    path: '/login',
    element: (
      <Suspense fallback={<Spinner />}>
        <LoginPage />
      </Suspense>
    ),
  },
  { path: '/mobile', element: <ProtectedMobile /> },
  { path: '/direction', element: <ProtectedDirection /> },
  { path: '/admin', element: <ProtectedAdmin /> },
  { path: '*', element: <Navigate to="/" replace /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
