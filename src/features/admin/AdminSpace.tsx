import { useState } from 'react'

// ─── Design tokens ──────────────────────────────────────────────────────────
const C = {
  braise: '#E0431D', ambre: '#F0A93B', creme: '#FBF7F1',
  encre: '#1A1512', surface: '#FFFFFF', nuit: '#17120F', muted: '#8A7E71', border: '#EAE1D6',
}
const F = {
  display: "'Archivo', sans-serif",
  ui: "'Space Grotesk', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const USERS_RAW = [
  { nom: 'Ariane Fotso', email: 'ariane.fotso', role: 'Commercial' as const, zone: 'Douala · Littoral', actif: true },
  { nom: 'Paul Kamga', email: 'paul.kamga', role: 'Manager' as const, zone: 'Toutes zones', actif: true },
  { nom: 'Bernard Ndonga', email: 'bernard.ndonga', role: 'Commercial' as const, zone: 'Douala · Bonabéri', actif: true },
  { nom: 'Cynthia Mbarga', email: 'cynthia.mbarga', role: 'Commercial' as const, zone: 'Yaoundé · Centre', actif: true },
  { nom: 'Serge Atangana', email: 'serge.atangana', role: 'Admin' as const, zone: '—', actif: true },
  { nom: 'Didier Essomba', email: 'didier.essomba', role: 'Commercial' as const, zone: 'Douala · Akwa', actif: false },
]

const ROLE_CHIPS: Record<string, { bg: string; fg: string }> = {
  Commercial: { bg: '#FBE4DB', fg: '#C4300F' },
  Manager: { bg: '#FCEFD6', fg: '#9A6B12' },
  Admin: { bg: '#E4EEF7', fg: '#2E6BB0' },
}

const ROLE_CARDS = [
  {
    name: 'Commercial', count: '17 comptes', accent: '#E0431D',
    desc: 'App terrain mobile — saisie et suivi de son portefeuille.',
    perms: [
      { label: 'Saisir des visites', on: true }, { label: 'Gérer ses prospects', on: true },
      { label: 'Voir ses relances', on: true }, { label: 'Voir les autres commerciaux', on: false },
      { label: 'Configurer la plateforme', on: false },
    ],
  },
  {
    name: 'Manager', count: '4 comptes', accent: '#F0A93B',
    desc: 'Tableau de bord — pilotage de l\'équipe et des chiffres.',
    perms: [
      { label: 'Tableau de bord', on: true }, { label: 'Comparer les commerciaux', on: true },
      { label: 'Exporter les données', on: true }, { label: 'Réaffecter un portefeuille', on: true },
      { label: 'Gérer les comptes', on: false },
    ],
  },
  {
    name: 'Admin', count: '2 comptes', accent: '#3E82C4',
    desc: 'Configuration — comptes, rôles et référentiels.',
    perms: [
      { label: 'Gérer les comptes', on: true }, { label: 'Définir les rôles', on: true },
      { label: 'Éditer les référentiels', on: true }, { label: 'Consulter le journal', on: true },
      { label: 'Voir les données commerciales', on: false },
    ],
  },
]

const REFERENTIELS = [
  { title: 'Secteurs d\'activité', sub: '8 secteurs', items: ['Quincaillerie', 'Alimentaire', 'Santé', 'BTP', 'Distribution', 'Restauration', 'Commerce', 'Agroalimentaire'] },
  { title: 'Statuts de prospect', sub: '3 statuts', items: ['Chaud', 'Tiède', 'Froid'] },
  { title: 'Zones commerciales', sub: '6 zones', items: ['Douala · Akwa', 'Douala · Bonabéri', 'Douala · Bonanjo', 'Douala · Bépanda', 'Yaoundé · Centre', 'Yaoundé · Sud'] },
  { title: 'Objets de visite', sub: '4 objets', items: ['Prospection', 'Relance', 'Négociation', 'Livraison'] },
]

const JOURNAL = [
  { who: 'Serge Atangana', action: 'a créé le compte', target: 'cynthia.mbarga · Commercial', time: 'il y a 12 min', iconBg: '#E4F1E9', iconStroke: '#268257', path: '<path d="M5 12h14"/><path d="M12 5v14"/>' },
  { who: 'Paul Kamga', action: 'a exporté', target: 'Rapport hebdomadaire · Douala', time: 'il y a 1 h', iconBg: '#E4EEF7', iconStroke: '#2E6BB0', path: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>' },
  { who: 'Serge Atangana', action: 'a modifié le référentiel', target: 'Secteurs d\'activité (+1)', time: 'il y a 3 h', iconBg: '#FCEFD6', iconStroke: '#9A6B12', path: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>' },
  { who: 'Serge Atangana', action: 'a suspendu le compte', target: 'didier.essomba · Commercial', time: 'hier', iconBg: '#FBE4DB', iconStroke: '#C4300F', path: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>' },
  { who: 'Paul Kamga', action: 'a réaffecté le portefeuille', target: '12 prospects → Estelle Ngo Bell', time: 'hier', iconBg: '#E4F1E9', iconStroke: '#268257', path: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
  { who: 'Serge Atangana', action: 'a défini les permissions', target: 'Rôle Manager', time: 'il y a 2 j', iconBg: '#E4EEF7', iconStroke: '#2E6BB0', path: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>' },
]

function initials(nom: string) {
  const w = nom.split(' ').filter(Boolean)
  return w.length >= 2 ? (w[0][0] + w[1][0]).toUpperCase() : nom.slice(0, 2).toUpperCase()
}

// ─── Invite modal ─────────────────────────────────────────────────────────────
function InviteModal({ onClose }: { onClose: () => void }) {
  const [role, setRole] = useState('commercial')
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,21,18,.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.creme, borderRadius: 18, width: 440, maxWidth: '100%', padding: 28, boxShadow: '0 30px 70px -20px rgba(0,0,0,.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 23, letterSpacing: '-.02em' }}>Inviter un utilisateur</div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 9, background: '#F1E9DD', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B625B' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 10, color: '#8A7E71', letterSpacing: '.1em', textTransform: 'uppercase' as const, marginBottom: 7 }}>Nom complet</div>
        <div style={{ background: C.surface, border: '1.5px solid #E3D9CB', borderRadius: 11, padding: '12px 14px', marginBottom: 14, fontSize: 15, color: '#A89C90' }}>Ex. Marie Ngo…</div>
        <div style={{ fontFamily: F.mono, fontSize: 10, color: '#8A7E71', letterSpacing: '.1em', textTransform: 'uppercase' as const, marginBottom: 7 }}>Rôle</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
          {[['commercial', 'Commercial'], ['manager', 'Manager'], ['admin', 'Admin']].map(([k, l]) => (
            <button key={k} onClick={() => setRole(k)} style={{ flex: 1, background: role === k ? C.encre : C.surface, color: role === k ? '#F6EDE0' : '#45413B', border: `1.5px solid ${role === k ? C.encre : '#E3D9CB'}`, fontFamily: F.ui, fontWeight: 600, fontSize: 13.5, padding: '9px 15px', borderRadius: 10, cursor: 'pointer' }}>{l}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1.5px solid #E3D9CB', color: '#45413B', fontFamily: F.ui, fontWeight: 600, fontSize: 15, padding: 13, borderRadius: 12, cursor: 'pointer' }}>Annuler</button>
          <button onClick={onClose} style={{ flex: 1, background: C.braise, color: '#fff', fontFamily: F.ui, fontWeight: 700, fontSize: 15, padding: 13, borderRadius: 12, border: 'none', cursor: 'pointer' }}>Envoyer</button>
        </div>
      </div>
    </div>
  )
}

// ─── Users section ────────────────────────────────────────────────────────────
function UsersSection({ appName }: { appName: string }) {
  const [roleFilter, setRoleFilter] = useState('tous')
  const domain = appName.toLowerCase().replace(/[^a-z]/g, '')

  const pbtn = (a: boolean) => ({
    fontFamily: F.ui, fontWeight: 600 as const, fontSize: 12.5, padding: '6px 13px', borderRadius: 8,
    border: 'none' as const, cursor: 'pointer' as const, background: a ? C.surface : 'transparent', color: a ? C.encre : '#8A7E71',
    boxShadow: a ? '0 1px 2px rgba(26,21,18,.1)' : 'none',
  })

  const filtered = USERS_RAW.filter(u => roleFilter === 'tous' || u.role.toLowerCase() === roleFilter)

  return (
    <>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        {[['Utilisateurs', '23', C.encre], ['Commerciaux', '17', '#E0431D'], ['Managers', '4', '#B37A16'], ['Actifs 30j', '21', '#268257']].map(([l, v, col]) => (
          <div key={l} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '18px 20px' }}>
            <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase' as const, color: '#8A7E71', marginBottom: 8 }}>{l}</div>
            <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 34, lineHeight: 1, letterSpacing: '-.02em', color: col as string }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #EEE7DA' }}>
          <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 19, letterSpacing: '-.01em' }}>Utilisateurs</div>
          <div style={{ display: 'flex', background: '#F1E9DD', border: `1px solid ${C.border}`, borderRadius: 10, padding: 3 }}>
            {[['tous', 'Tous'], ['commercial', 'Commerciaux'], ['manager', 'Managers'], ['admin', 'Admins']].map(([k, l]) => (
              <button key={k} onClick={() => setRoleFilter(k)} style={pbtn(roleFilter === k)}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.3fr 1.4fr 1fr 44px', gap: 14, padding: '11px 22px', background: '#FAF5EC', fontFamily: F.mono, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase' as const, color: '#A89C90' }}>
          <div>Utilisateur</div><div>Rôle</div><div>Zone</div><div>Statut</div><div />
        </div>
        {filtered.map(u => {
          const chip = ROLE_CHIPS[u.role]
          return (
            <div key={u.nom} style={{ display: 'grid', gridTemplateColumns: '2fr 1.3fr 1.4fr 1fr 44px', gap: 14, alignItems: 'center', padding: '13px 22px', borderBottom: '1px solid #F4EEE4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: C.encre, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 14, color: C.ambre, flex: 'none' }}>{initials(u.nom)}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.nom}</div>
                  <div style={{ fontFamily: F.mono, fontSize: 11, color: '#A89C90' }}>{u.email}@{domain}.cm</div>
                </div>
              </div>
              <div>
                <span style={{ display: 'inline-block', fontFamily: F.mono, fontWeight: 600, fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase' as const, padding: '4px 9px', borderRadius: 6, background: chip.bg, color: chip.fg, whiteSpace: 'nowrap' }}>{u.role}</span>
              </div>
              <div style={{ fontSize: 13.5, color: '#45413B' }}>{u.zone}</div>
              <div>
                {u.actif
                  ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: F.mono, fontWeight: 600, fontSize: 12, color: '#268257' }}><span style={{ width: 7, height: 7, borderRadius: 99, background: '#2FA36B' }} />ACTIF</span>
                  : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: F.mono, fontWeight: 600, fontSize: 12, color: '#A89C90' }}><span style={{ width: 7, height: 7, borderRadius: 99, background: '#C7BEB0' }} />SUSPENDU</span>
                }
              </div>
              <button style={{ width: 34, height: 34, borderRadius: 9, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#A89C90' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
              </button>
            </div>
          )
        })}
      </div>
    </>
  )
}

// ─── Roles section ────────────────────────────────────────────────────────────
function RolesSection() {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
        {ROLE_CARDS.map(r => (
          <div key={r.name} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22, borderTop: `4px solid ${r.accent}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 20, letterSpacing: '-.01em' }}>{r.name}</div>
              <span style={{ fontFamily: F.mono, fontSize: 12, color: '#A89C90' }}>{r.count}</span>
            </div>
            <div style={{ fontSize: 13, color: '#6B625B', lineHeight: 1.5, marginBottom: 16 }}>{r.desc}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {r.perms.map(p => (
                <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ width: 19, height: 19, borderRadius: 6, background: p.on ? '#E4F1E9' : '#F1E9DD', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                    {p.on
                      ? <svg viewBox="0 0 24 24" fill="none" stroke="#268257" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}><path d="M20 6 9 17l-5-5" /></svg>
                      : <svg viewBox="0 0 24 24" fill="none" stroke="#C0B6A6" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    }
                  </span>
                  <span style={{ fontSize: 13.5, color: p.on ? C.encre : '#B7AE9E' }}>{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: '#E4EEF7', border: '1px solid #C9DCEE', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#2E6BB0" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20, flex: 'none', marginTop: 1 }}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
        <div style={{ fontSize: 13.5, color: '#2E6BB0', lineHeight: 1.5 }}>
          Le rôle détermine l'interface : le <strong>commercial</strong> ouvre l'app terrain, le <strong>manager</strong> le tableau de bord, l'<strong>admin</strong> cet espace. Une seule plateforme.
        </div>
      </div>
    </>
  )
}

// ─── Referentiels section ─────────────────────────────────────────────────────
function RefSection() {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {REFERENTIELS.map(ref => (
          <div key={ref.title} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 18, letterSpacing: '-.01em' }}>{ref.title}</div>
                <div style={{ fontFamily: F.mono, fontSize: 11.5, color: '#8A7E71' }}>{ref.sub}</div>
              </div>
              <button style={{ width: 36, height: 36, borderRadius: 10, background: '#FBE4DB', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#C4300F' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
              {ref.items.map(item => (
                <span key={item} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 9, background: C.creme, border: `1px solid ${C.border}`, fontFamily: F.mono, fontSize: 12.5, color: C.encre }}>
                  {item}
                  <svg viewBox="0 0 24 24" fill="none" stroke="#C0B6A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, cursor: 'pointer' }}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: '#FCEFD6', border: '1px solid #EFD9A6', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: 16 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#9A6B12" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20, flex: 'none', marginTop: 1 }}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
        <div style={{ fontSize: 13.5, color: '#9A6B12', lineHeight: 1.5 }}>
          Ces listes alimentent les menus de l'app terrain. Une modification est propagée à tous les commerciaux à la prochaine synchro.
        </div>
      </div>
    </>
  )
}

// ─── Journal section ──────────────────────────────────────────────────────────
function JournalSection() {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '8px 24px 12px' }}>
      {JOURNAL.map((j, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '15px 0', borderBottom: i < JOURNAL.length - 1 ? '1px solid #F4EEE4' : 'none' }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: j.iconBg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={j.iconStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }} dangerouslySetInnerHTML={{ __html: j.path }} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, color: C.encre }}><strong>{j.who}</strong> {j.action}</div>
            <div style={{ fontFamily: F.mono, fontSize: 11.5, color: '#A89C90' }}>{j.target}</div>
          </div>
          <span style={{ fontFamily: F.mono, fontSize: 11.5, color: '#A89C90', flex: 'none' }}>{j.time}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Profile section ──────────────────────────────────────────────────────────
function ProfileSection() {
  const [dark, setDark] = useState(false)
  const [notif, setNotif] = useState(true)
  const [lang, setLang] = useState('fr')
  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <div onClick={onToggle} style={{ cursor: 'pointer' }}>
      <span style={{ width: 46, height: 27, borderRadius: 99, background: on ? C.braise : '#DDD3C4', padding: 3, display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start' }}>
        <span style={{ width: 21, height: 21, borderRadius: 99, background: '#fff' }} />
      </span>
    </div>
  )
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16, maxWidth: 1000 }}>
      <div style={{ background: C.nuit, borderRadius: 18, padding: '30px 26px', position: 'relative', overflow: 'hidden' }}>
        <svg viewBox="0 0 300 340" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .4, pointerEvents: 'none' }} fill="none" stroke="#FF5A2C" strokeWidth="1">
          <path d="M-10 60 C 70 34 130 88 210 60 S 320 48 320 82" />
          <path d="M-10 110 C 80 84 140 138 220 110 S 320 98 320 132" />
          <path d="M-10 160 C 70 134 150 188 220 160 S 320 148 320 182" />
        </svg>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: 88, height: 88, borderRadius: 24, background: '#FF5A2C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 32, color: C.nuit }}>SA</div>
          <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 24, letterSpacing: '-.02em', color: '#F5EEE6', marginTop: 15 }}>Serge Atangana</div>
          <div style={{ fontFamily: F.mono, fontSize: 12, color: 'rgba(245,238,230,.65)', marginTop: 4 }}>serge.atangana@waraspace.cm</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, background: 'rgba(255,90,44,.18)', borderRadius: 7, padding: '6px 13px' }}>
            <span style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase' as const, color: '#FF8A5C' }}>● Administrateur · accès complet</span>
          </div>
          <div style={{ width: '100%', borderTop: '1px solid rgba(245,238,230,.14)', marginTop: 22, paddingTop: 18, display: 'flex', justifyContent: 'space-between' }}>
            {[['23', 'COMPTES'], ['3', 'RÔLES'], ['4', 'RÉFÉR.']].map(([v, l], i) => (
              <div key={l} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 22, color: i === 2 ? '#FF8A5C' : '#F5EEE6' }}>{v}</div>
                <div style={{ fontFamily: F.mono, fontSize: 9, color: 'rgba(245,238,230,.55)', marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: '22px 24px' }}>
          <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: '#8A7E71', marginBottom: 14 }}>Préférences</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 0', borderBottom: '1px solid #F1E9DD' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#C4300F" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" style={{ width: 19, height: 19, flex: 'none' }}><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 14.5 }}>Langue</span>
            <div style={{ display: 'flex', background: '#F1E9DD', borderRadius: 8, padding: 3 }}>
              {[['fr', 'FR'], ['en', 'EN']].map(([k, l]) => (
                <button key={k} onClick={() => setLang(k)} style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 11, padding: '5px 11px', borderRadius: 6, border: 'none', cursor: 'pointer', background: lang === k ? C.encre : 'transparent', color: lang === k ? '#F6EDE0' : '#8A7E71' }}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 0', borderBottom: '1px solid #F1E9DD' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#C4300F" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" style={{ width: 19, height: 19, flex: 'none' }}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 14.5 }}>Thème sombre</span>
            <Toggle on={dark} onToggle={() => setDark(d => !d)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 0' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#C4300F" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" style={{ width: 19, height: 19, flex: 'none' }}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 14.5 }}>Alertes système</span>
            <Toggle on={notif} onToggle={() => setNotif(n => !n)} />
          </div>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: '22px 24px' }}>
          <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: '#8A7E71', marginBottom: 6 }}>Compte</div>
          {[['Changer le mot de passe', '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'],
            ['Journal d\'audit complet', '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>']].map(([l, p], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0', borderBottom: i === 0 ? '1px solid #F1E9DD' : 'none', cursor: 'pointer' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#6B625B" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" style={{ width: 19, height: 19, flex: 'none' }} dangerouslySetInnerHTML={{ __html: p }} />
              <span style={{ flex: 1, fontWeight: 600, fontSize: 14.5 }}>{l}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="#C7BEB0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}><path d="m9 18 6-6-6-6" /></svg>
            </div>
          ))}
        </div>
        <button style={{ alignSelf: 'flex-start', background: '#FBE4DB', color: '#C4300F', fontFamily: F.ui, fontWeight: 700, fontSize: 14.5, padding: '13px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
          Se déconnecter
        </button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
type Nav = 'users' | 'roles' | 'ref' | 'log' | 'profile'

interface AdminSpaceProps {
  appName?: string
  onSwitchRole?: () => void
}

const PAGE_META: Record<Nav, [string, string, string]> = {
  users: ['Utilisateurs', '23 comptes · 3 rôles', 'comptes'],
  roles: ['Rôles & permissions', 'ce que chaque profil peut faire', 'permissions'],
  ref: ['Référentiels', 'listes partagées avec l\'app terrain', 'listes'],
  log: ['Journal d\'activité', 'traçabilité des actions', 'activité'],
  profile: ['Mon profil', 'compte, rôle et préférences', 'profil'],
}

export default function AdminSpace({ appName = 'Wara space' }: AdminSpaceProps) {
  const [nav, setNav] = useState<Nav>('users')
  const [showInvite, setShowInvite] = useState(false)

  const navItems: [Nav, string, boolean, string][] = [
    ['users', 'Utilisateurs', true, '23'],
    ['roles', 'Rôles', false, ''],
    ['ref', 'Référentiels', false, ''],
    ['log', 'Journal', false, ''],
  ]

  const [pageTitle, pageSub, eyebrow] = PAGE_META[nav]

  return (
    <div style={{ minHeight: '100vh', background: C.creme, display: 'flex', flexDirection: 'column', fontFamily: F.ui }}>
      {/* Top nav */}
      <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(251,247,241,.9)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.border}`, padding: '0 34px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 66 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: C.braise, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 19, height: 19 }}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
              </div>
              <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-.02em' }}>{appName}</span>
              <span style={{ fontFamily: F.mono, fontSize: 9, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: '#2E6BB0', background: '#E4EEF7', padding: '3px 7px', borderRadius: 6, marginLeft: 2 }}>Admin</span>
            </div>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {navItems.map(([key, label, hasBadge, badge]) => {
                const active = nav === key
                return (
                  <div key={key} onClick={() => setNav(key)} style={{ display: 'flex', alignItems: 'center', fontWeight: active ? 600 : 500, fontSize: 14, color: active ? C.encre : '#6B625B', background: active ? '#F6EDE0' : 'transparent', padding: '8px 13px', borderRadius: 9, cursor: 'pointer' }}>
                    {label}
                    {hasBadge && <span style={{ fontFamily: F.mono, fontSize: 10, fontWeight: 600, color: '#C4300F', background: '#FBE4DB', padding: '1px 6px', borderRadius: 99, marginLeft: 6 }}>{badge}</span>}
                  </div>
                )
              })}
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: C.surface, border: '1.5px solid #E3D9CB', borderRadius: 10, padding: '8px 13px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#8A7E71" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              <span style={{ fontFamily: F.mono, fontSize: 12, color: '#A89C90' }}>Rechercher…</span>
            </div>
            <button onClick={() => setShowInvite(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: C.braise, color: '#fff', fontFamily: F.ui, fontWeight: 600, fontSize: 13.5, padding: '9px 15px', borderRadius: 10, border: 'none', cursor: 'pointer' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
              Inviter
            </button>
            <div onClick={() => setNav('profile')} style={{ display: 'flex', alignItems: 'center', gap: 9, paddingLeft: 14, borderLeft: `1px solid ${C.border}`, cursor: 'pointer' }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: C.encre, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 13, color: C.ambre }}>SA</div>
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Serge Atangana</div>
                <div style={{ fontFamily: F.mono, fontSize: 10, color: '#8A7E71' }}>Administrateur</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="v2s" style={{ flex: 1, overflowY: 'auto', padding: '28px 34px 44px' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase' as const, color: '#2E6BB0' }}>Configuration · {eyebrow}</div>
          <h1 style={{ fontFamily: F.display, fontWeight: 900, fontSize: 42, letterSpacing: '-.03em', margin: '6px 0 0', lineHeight: 1 }}>{pageTitle}</h1>
          <div style={{ fontSize: 14, color: '#6B625B', marginTop: 6 }}>{pageSub}</div>
        </div>

        {nav === 'users' && <UsersSection appName={appName} />}
        {nav === 'roles' && <RolesSection />}
        {nav === 'ref' && <RefSection />}
        {nav === 'log' && <JournalSection />}
        {nav === 'profile' && <ProfileSection />}
      </main>

      {/* Invite modal */}
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </div>
  )
}
