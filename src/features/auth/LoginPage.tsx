import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setSession, resolveInterface, isMobileDevice } from '../../lib/auth'
import type { UserRole } from '../../shared/types'

const C = {
  braise: '#E0431D', braiseDark: '#FF5A2C', ambre: '#F0A93B',
  creme: '#FBF7F1', encre: '#1A1512', nuit: '#17120F', muted: '#8A7E71', border: '#EAE1D6',
}
const F = {
  display: "'Archivo', sans-serif",
  ui: "'Space Grotesk', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
}

const DEMO_USERS: Record<UserRole, { nom: string; initials: string; zone: string; login: string }> = {
  commercial: { nom: 'Ariane Fotso', initials: 'AF', zone: 'Douala · Littoral', login: 'ariane.fotso' },
  manager: { nom: 'Paul Kamga', initials: 'PK', zone: 'Toutes zones', login: 'paul.kamga' },
  admin: { nom: 'Serge Atangana', initials: 'SA', zone: '—', login: 'serge.atangana' },
}

const ROLE_META: Record<UserRole, { label: string; desc: string; badge: string; badgeBg: string; badgeFg: string; accent: string }> = {
  commercial: { label: 'Commercial', desc: 'App terrain — visites, prospects, relances', badge: 'Terrain', badgeBg: '#FBE4DB', badgeFg: '#C4300F', accent: C.braise },
  manager: { label: 'Manager', desc: 'Tableau de bord — KPIs, équipe, carte', badge: 'Direction', badgeBg: '#FCEFD6', badgeFg: '#9A6B12', accent: '#F0A93B' },
  admin: { label: 'Admin', desc: 'Configuration — comptes, rôles, référentiels', badge: 'Admin', badgeBg: '#E4EEF7', badgeFg: '#2E6BB0', accent: '#3E82C4' },
}

export default function LoginPage() {
  const [role, setRole] = useState<UserRole>('commercial')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const meta = ROLE_META[role]
  const demo = DEMO_USERS[role]

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setSession({ role, nom: demo.nom, initials: demo.initials, zone: demo.zone, tenantId: 'waraspace-cm' })
      const iface = resolveInterface(role, isMobileDevice())
      navigate(`/${iface}`, { replace: true })
    }, 600)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: C.nuit, position: 'relative', overflow: 'hidden' }}>
      {/* Topo lines */}
      <svg viewBox="0 0 1440 900" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .35, pointerEvents: 'none' }} fill="none" stroke={C.braiseDark} strokeWidth="1">
        <path d="M-40 180 C 200 120 400 250 720 180 S 1100 150 1480 200" />
        <path d="M-40 300 C 220 240 440 370 760 300 S 1140 270 1480 320" />
        <path d="M-40 440 C 200 380 440 510 720 440 S 1100 410 1480 460" />
        <path d="M-40 580 C 220 520 440 650 720 580 S 1100 550 1480 600" />
        <path d="M-40 720 C 200 660 440 790 720 720 S 1100 690 1480 740" />
      </svg>

      {/* Left panel — brand */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '48px 56px', position: 'relative', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: C.braise, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}>
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 20, color: '#F5EEE6', letterSpacing: '-.02em' }}>Wara space</div>
            <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase' as const, color: '#FF8A5C' }}>CRM · Terrain</div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingBottom: 24 }}>
          <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase' as const, color: '#FF8A5C', marginBottom: 14 }}>Une seule plateforme</div>
          <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 56, letterSpacing: '-.04em', lineHeight: .95, color: '#F5EEE6' }}>
            Adapté à<br /><span style={{ color: C.braiseDark }}>votre rôle.</span>
          </div>
          <div style={{ fontSize: 17, color: 'rgba(245,238,230,.7)', marginTop: 20, maxWidth: '38ch', lineHeight: 1.55 }}>
            Commercial, manager ou administrateur — une seule URL, trois interfaces taillées pour chaque métier.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 36 }}>
            {(Object.entries(ROLE_META) as [UserRole, typeof ROLE_META[UserRole]][]).map(([r, m]) => (
              <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,90,44,.13)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: m.accent }} />
                </span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14.5, color: '#F5EEE6' }}>{m.label}</div>
                  <div style={{ fontSize: 13, color: 'rgba(245,238,230,.6)' }}>{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ width: 480, background: C.creme, display: 'flex', flexDirection: 'column', padding: '48px 44px', position: 'relative' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase' as const, color: '#C4300F', marginBottom: 8 }}>Connexion</div>
          <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 38, letterSpacing: '-.03em', lineHeight: .95, color: C.encre }}>Bienvenue<br />sur Wara.</div>
          <div style={{ fontSize: 14.5, color: '#6B625B', marginTop: 10 }}>Choisissez votre profil et connectez-vous.</div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 0, flex: 1 }}>
          {/* Role selector */}
          <div style={{ fontFamily: F.mono, fontSize: 10, color: C.muted, letterSpacing: '.12em', textTransform: 'uppercase' as const, marginBottom: 9 }}>Profil de connexion</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
            {(Object.entries(ROLE_META) as [UserRole, typeof ROLE_META[UserRole]][]).map(([r, m]) => {
              const active = role === r
              return (
                <div key={r} onClick={() => setRole(r)} style={{ display: 'flex', alignItems: 'center', gap: 13, background: active ? '#FFFFFF' : 'transparent', border: `1.5px solid ${active ? m.accent : '#E3D9CB'}`, borderRadius: 13, padding: '12px 14px', cursor: 'pointer', transition: 'border-color .15s' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: active ? m.accent : '#F1E9DD', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                    <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 13, color: active ? '#fff' : '#A89C90' }}>{DEMO_USERS[r].initials}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: C.encre }}>{m.label}</div>
                    <div style={{ fontFamily: F.mono, fontSize: 11, color: C.muted }}>{m.desc}</div>
                  </div>
                  <span style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 10, padding: '3px 8px', borderRadius: 6, background: m.badgeBg, color: m.badgeFg, flex: 'none' }}>{m.badge}</span>
                </div>
              )
            })}
          </div>

          {/* Fields */}
          <div style={{ fontFamily: F.mono, fontSize: 10, color: C.muted, letterSpacing: '.1em', textTransform: 'uppercase' as const, marginBottom: 6 }}>Identifiant</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FFFFFF', border: '1.5px solid #E3D9CB', borderRadius: 11, padding: '12px 14px', marginBottom: 14 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#8A7E71" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            <span style={{ fontFamily: F.mono, fontSize: 14, color: C.encre }}>{demo.login}@waraspace.cm</span>
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 10, color: C.muted, letterSpacing: '.1em', textTransform: 'uppercase' as const, marginBottom: 6 }}>Mot de passe</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FFFFFF', border: '1.5px solid #E3D9CB', borderRadius: 11, padding: '12px 14px', marginBottom: 26 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#8A7E71" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            <span style={{ fontSize: 18, color: C.encre, letterSpacing: 4 }}>••••••••</span>
          </div>

          <button type="submit" disabled={loading} style={{ background: loading ? '#C4300F' : C.braise, color: '#fff', fontFamily: F.ui, fontWeight: 700, fontSize: 16, padding: 16, borderRadius: 13, border: 'none', cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            {loading && (
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, animation: 'v2spin 1s linear infinite' }}>
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
              </svg>
            )}
            {loading ? 'Connexion…' : `Accéder à l'espace ${meta.label.toLowerCase()}`}
          </button>

          <div style={{ paddingTop: 28, borderTop: '1px solid #EAE1D6', marginTop: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: F.mono, fontSize: 11, color: C.muted }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
              Démo — identifiants pré-remplis selon le rôle sélectionné.
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
