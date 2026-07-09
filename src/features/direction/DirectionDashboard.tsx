import { useState, useMemo } from 'react'

// ─── Design tokens ──────────────────────────────────────────────────────────
const C = {
  braise: '#E0431D', braiseDark: '#FF5A2C', ambre: '#F0A93B', creme: '#FBF7F1',
  encre: '#1A1512', surface: '#FFFFFF', nuit: '#17120F', muted: '#8A7E71',
  border: '#EAE1D6', hover: '#F6EDE0', froid: '#3E82C4', success: '#2FA36B',
}
const F = {
  display: "'Archivo', sans-serif",
  ui: "'Space Grotesk', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
}

// ─── Static data ─────────────────────────────────────────────────────────────
const TEAM_RAW = [
  { nom: 'Ariane Fotso', zone: 'Douala · Littoral', visites: 142, conv: 44, taux: 31, caN: 32.4 },
  { nom: 'Bernard Ndonga', zone: 'Douala · Bonabéri', visites: 128, conv: 35, taux: 27, caN: 28.1 },
  { nom: 'Cynthia Mbarga', zone: 'Yaoundé · Centre', visites: 119, conv: 41, taux: 34, caN: 30.7 },
  { nom: 'Didier Essomba', zone: 'Douala · Akwa', visites: 98, conv: 22, taux: 22, caN: 19.5 },
  { nom: 'Estelle Ngo Bell', zone: 'Yaoundé · Sud', visites: 87, conv: 25, taux: 29, caN: 21.9 },
]
const CHART_DAYS = [
  { label: 'Lun', v: 22, c: 7 }, { label: 'Mar', v: 28, c: 9 }, { label: 'Mer', v: 19, c: 5 },
  { label: 'Jeu', v: 31, c: 11 }, { label: 'Ven', v: 26, c: 8 }, { label: 'Sam', v: 34, c: 13 },
  { label: 'Dim', v: 12, c: 4 },
]
const PIPELINE = [
  { label: 'Chaud', count: 214, pct: 78, color: '#E0431D' },
  { label: 'Tiède', count: 486, pct: 62, color: '#F0A93B' },
  { label: 'Froid', count: 392, pct: 44, color: '#3E82C4' },
  { label: 'Converti', count: 192, pct: 30, color: '#2FA36B' },
]
const ZONES_RAW = [
  { name: 'Douala · Akwa', count: 48 }, { name: 'Douala · Bonabéri', count: 37 },
  { name: 'Douala · Bonanjo', count: 29 }, { name: 'Yaoundé · Centre', count: 34 },
  { name: 'Yaoundé · Sud', count: 21 },
]
const MAP_DATA = [
  { nom: 'Cluster Akwa', statut: 'chaud' as const, left: '55%', top: '46%', count: 4, com: 'A. Fotso' },
  { nom: 'Ets. Njoya & Fils', statut: 'chaud' as const, left: '60%', top: '40%', count: 1, com: 'A. Fotso' },
  { nom: 'Boulangerie Saker', statut: 'chaud' as const, left: '66%', top: '55%', count: 1, com: 'A. Fotso' },
  { nom: 'Café Sic', statut: 'tiede' as const, left: '44%', top: '22%', count: 1, com: 'A. Fotso' },
  { nom: 'Marché Mboppi', statut: 'tiede' as const, left: '24%', top: '34%', count: 1, com: 'B. Ndonga' },
  { nom: 'Cluster Bonabéri', statut: 'tiede' as const, left: '20%', top: '42%', count: 5, com: 'B. Ndonga' },
  { nom: 'Quincaillerie Bimeg', statut: 'tiede' as const, left: '34%', top: '68%', count: 1, com: 'B. Ndonga' },
  { nom: 'Cluster Bonanjo', statut: 'froid' as const, left: '62%', top: '66%', count: 3, com: 'C. Mbarga' },
  { nom: 'Superette B.', statut: 'froid' as const, left: '30%', top: '58%', count: 2, com: 'C. Mbarga' },
  { nom: 'Pharmacie du Wouri', statut: 'froid' as const, left: '70%', top: '70%', count: 1, com: 'C. Mbarga' },
]
const VISIT_ALL = [
  { nom: 'Ets. Njoya & Fils', zone: 'Akwa', commercial: 'A. Fotso', statut: 'chaud' as const, time: '11:42' },
  { nom: 'Boulangerie Saker', zone: 'Bonapriso', commercial: 'A. Fotso', statut: 'chaud' as const, time: '10:18' },
  { nom: 'Marché Mboppi', zone: 'Nkololoun', commercial: 'B. Ndonga', statut: 'tiede' as const, time: '09:55' },
  { nom: 'Quincaillerie Bimeg', zone: 'Bépanda', commercial: 'B. Ndonga', statut: 'tiede' as const, time: '09:30' },
  { nom: 'Pharmacie du Wouri', zone: 'Bonanjo', commercial: 'C. Mbarga', statut: 'froid' as const, time: '08:47' },
  { nom: 'Superette B.', zone: 'Bonamoussadi', commercial: 'C. Mbarga', statut: 'froid' as const, time: '08:12' },
]

const SC: Record<string, string> = { chaud: '#E0431D', tiede: '#F0A93B', froid: '#3E82C4' }

function initials(nom: string) {
  const w = nom.split(' ').filter(Boolean)
  return w.length >= 2 ? (w[0][0] + w[1][0]).toUpperCase() : (nom.slice(0, 2).toUpperCase())
}

// ─── Mini components ──────────────────────────────────────────────────────────
function Delta({ v, up }: { v: string; up: boolean }) {
  const arrow = up
    ? '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>'
    : '<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: F.mono, fontWeight: 600, fontSize: 12.5, color: up ? C.success : '#C81E3C' }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }} dangerouslySetInnerHTML={{ __html: arrow }} />
      {v}
    </span>
  )
}

function KpiCard({ label, value, icon, delta, up }: { label: string; value: string; icon: React.ReactNode; delta: string; up: boolean }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase' as const, color: '#8A7E71' }}>{label}</span>
        {icon}
      </div>
      <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 40, lineHeight: 1, letterSpacing: '-.03em', color: C.encre }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 9 }}>
        <Delta v={delta} up={up} />
        <span style={{ fontSize: 12, color: '#A89C90' }}>vs préc.</span>
      </div>
    </div>
  )
}

function KpiIcon({ path, stroke, bg }: { path: string; stroke: string; bg: string }) {
  return (
    <span style={{ width: 34, height: 34, borderRadius: 9, background: bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
      <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }} dangerouslySetInnerHTML={{ __html: path }} />
    </span>
  )
}

// ─── Apercu section ───────────────────────────────────────────────────────────
function ApercuSection({ sort, setSort }: { sort: string; setSort: (s: string) => void }) {
  const maxV = Math.max(...CHART_DAYS.map(d => d.v))

  const team = useMemo(() => {
    const key = sort === 'visites' ? 'visites' : sort === 'taux' ? 'taux' : 'caN'
    return [...TEAM_RAW].sort((a, b) => (b as any)[key] - (a as any)[key])
  }, [sort])

  const maxCA = Math.max(...TEAM_RAW.map(t => t.caN))
  const maxZ = Math.max(...ZONES_RAW.map(z => z.count))

  const sortLabel = sort === 'ca' ? 'CA prévisionnel' : sort === 'visites' ? 'visites' : 'taux de conversion'

  const pbtn = (active: boolean) => ({
    fontFamily: F.ui, fontWeight: 600, fontSize: 12.5, padding: '6px 13px', borderRadius: 8,
    border: 'none', cursor: 'pointer', background: active ? C.surface : 'transparent', color: active ? C.encre : '#8A7E71',
    boxShadow: active ? '0 1px 2px rgba(26,21,18,.1)' : 'none',
  })

  return (
    <>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 16 }}>
        <KpiCard label="Visites" value="142" delta="+18%" up icon={<KpiIcon path='<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>' stroke="#C4300F" bg="#FBE4DB" />} />
        <KpiCard label="Nouveaux" value="38" delta="+9%" up icon={<KpiIcon path='<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' stroke="#B37A16" bg="#FCEFD6" />} />
        <KpiCard label="Taux conv." value="31%" delta="+4pts" up icon={<KpiIcon path='<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>' stroke="#2E6BB0" bg="#E4EEF7" />} />
        <KpiCard label="Retard" value="12" delta="-3" up={false} icon={<KpiIcon path='<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' stroke="#C81E3C" bg="#F8DEE2" />} />
      </div>

      {/* Chart + Pipeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Bar chart */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
            <div>
              <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 19, letterSpacing: '-.01em' }}>Visites &amp; conversions</div>
              <div style={{ fontFamily: F.mono, fontSize: 11.5, color: '#8A7E71' }}>7 derniers jours</div>
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              {[['#E0431D', 'Visites'], ['#F0A93B', 'Conversions']].map(([col, lbl]) => (
                <span key={lbl} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B625B' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: col }} />
                  {lbl}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14, height: 200, paddingTop: 10 }}>
            {CHART_DAYS.map(d => (
              <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, width: '100%', justifyContent: 'center', flex: 1 }}>
                  <div style={{ width: '46%', background: '#E0431D', borderRadius: '5px 5px 0 0', height: `${Math.round(d.v / maxV * 100)}%` }} />
                  <div style={{ width: '46%', background: '#F0A93B', borderRadius: '5px 5px 0 0', height: `${Math.round(d.c / maxV * 100)}%` }} />
                </div>
                <span style={{ fontFamily: F.mono, fontSize: 11, color: '#A89C90' }}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px' }}>
          <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 19, letterSpacing: '-.01em' }}>Pipeline</div>
          <div style={{ fontFamily: F.mono, fontSize: 11.5, color: '#8A7E71', marginBottom: 20 }}>Répartition des prospects</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            {PIPELINE.map(p => (
              <div key={p.label}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 99, background: p.color }} />
                    {p.label}
                  </span>
                  <span style={{ fontFamily: F.mono, fontSize: 13, fontWeight: 600, color: '#45413B' }}>{p.count}</span>
                </div>
                <div style={{ height: 9, background: '#F1E9DD', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${p.pct}%`, background: p.color, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid #EEE7DA', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase' as const, color: '#8A7E71' }}>CA prévisionnel</div>
              <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 26, letterSpacing: '-.02em', lineHeight: 1.1 }}>142,6 M<span style={{ fontSize: 15, color: '#8A7E71' }}> FCFA</span></div>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#E4F1E9', color: '#268257', fontFamily: F.mono, fontWeight: 600, fontSize: 12, padding: '6px 10px', borderRadius: 8 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
              +12%
            </span>
          </div>
        </div>
      </div>

      {/* Bottom row: Objectif + Atteinte + Climat */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(232px,1fr))', gap: 16, marginBottom: 16 }}>
        {/* Objectif trimestriel */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px' }}>
          <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 18, letterSpacing: '-.01em' }}>Objectif trimestriel</div>
          <div style={{ fontFamily: F.mono, fontSize: 11.5, color: '#8A7E71', marginBottom: 6 }}>CA cumulé · T3</div>
          <div style={{ position: 'relative', height: 194, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            {[{ s: 180, bg: '#FBE0D4', fg: '#C4300F' }, { s: 138, bg: '#F6C7AE', fg: '#9A3A16' }, { s: 98, bg: '#EF9A5F', fg: '#5A2410' }, { s: 58, bg: '#E0431D', fg: '#fff' }].map((b, i) => (
              <div key={i} style={{ position: 'absolute', bottom: 0, width: b.s, height: b.s, borderRadius: '50%', background: b.bg, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: i === 3 ? 0 : 8, ...(i === 3 ? { alignItems: 'center' } : {}) }}>
                <span style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 12.5, color: b.fg }}>
                  {['180 M', '143 M', '96 M', '48 M'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Atteinte */}
        <div style={{ background: C.nuit, borderRadius: 16, padding: '22px 24px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <svg viewBox="0 0 300 120" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, width: '100%', height: 120, opacity: .4, pointerEvents: 'none' }} fill="none" stroke="#FF5A2C" strokeWidth="1">
            <path d="M-10 30 C 70 8 130 56 210 30 S 320 20 320 50" />
            <path d="M-10 62 C 80 38 140 88 220 62 S 320 50 320 82" />
          </svg>
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 18, color: '#F5EEE6', letterSpacing: '-.01em' }}>Atteinte objectif</div>
            <div style={{ fontFamily: F.mono, fontSize: 11.5, color: 'rgba(245,238,230,.6)' }}>équipe · ce trimestre</div>
          </div>
          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 14 }}>
            <div style={{ width: 132, height: 132, borderRadius: '50%', background: 'conic-gradient(#FF5A2C 0% 68%,rgba(245,238,230,.14) 68% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 100, height: 100, borderRadius: '50%', background: C.nuit, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: F.display, fontWeight: 900, fontSize: 30, color: '#F5EEE6', lineHeight: 1 }}>68%</span>
                <span style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: '.06em', color: '#FF8A5C', marginTop: 3 }}>96,9/142M</span>
              </div>
            </div>
          </div>
        </div>

        {/* Climat */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 18, letterSpacing: '-.01em' }}>Climat de l'équipe</div>
          <div style={{ fontFamily: F.mono, fontSize: 11.5, color: '#8A7E71', marginBottom: 16 }}>moral fin de tournée</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            {[
              'M8 16s1.2-2 4-2 4 2 4 2', 'M8 15h8', 'M8 15s1.5 1 4 1 4-1 4-1',
              'M8 14s1.5 2 4 2 4-2 4-2', 'M7 13s2 3 5 3 5-3 5-3',
            ].map((d, i) => {
              const active = i === 3
              return (
                <div key={i} style={{ width: 38, height: 38, borderRadius: '50%', background: active ? '#E0431D' : '#F1E9DD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#B7B0A0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 19, height: 19 }}>
                    <circle cx="12" cy="12" r="10" /><path d="M8 9h.01" /><path d="M16 9h.01" /><path d={d} />
                  </svg>
                </div>
              )
            })}
            <div style={{ marginLeft: 6 }}>
              <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 20, color: '#268257', lineHeight: 1 }}>Positif</div>
              <div style={{ fontFamily: F.mono, fontSize: 10.5, color: '#A89C90' }}>14 réponses</div>
            </div>
          </div>
          <div style={{ marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
              <span style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase' as const, color: '#8A7E71' }}>Jours de tournée · juil.</span>
              <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 15 }}>18<span style={{ fontSize: 11, color: '#A89C90' }}>/22</span></span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {Array.from({ length: 22 }, (_, i) => (
                <span key={i} style={{ width: 12, height: 12, borderRadius: 4, background: i < 18 ? (i % 6 === 5 ? '#F0A93B' : '#E0431D') : '#E6DFD2' }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team comparison */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px 10px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 19, letterSpacing: '-.01em' }}>Comparaison des commerciaux</div>
            <div style={{ fontFamily: F.mono, fontSize: 11.5, color: '#8A7E71' }}>classé par {sortLabel}</div>
          </div>
          <div style={{ display: 'flex', background: '#F1E9DD', border: `1px solid ${C.border}`, borderRadius: 10, padding: 3 }}>
            {[['ca', 'CA'], ['visites', 'Visites'], ['taux', 'Taux']].map(([k, l]) => (
              <button key={k} onClick={() => setSort(k)} style={pbtn(sort === k)}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '26px 1.6fr 1fr 1fr 1fr 1.4fr', gap: 14, padding: '0 6px 11px', borderBottom: '1px solid #EEE7DA', fontFamily: F.mono, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase' as const, color: '#A89C90' }}>
          <div>#</div><div>Commercial</div><div style={{ textAlign: 'right' }}>Visites</div><div style={{ textAlign: 'right' }}>Conv.</div><div style={{ textAlign: 'right' }}>Taux</div><div>CA prévisionnel</div>
        </div>
        {team.map((t, i) => (
          <div key={t.nom} style={{ display: 'grid', gridTemplateColumns: '26px 1.6fr 1fr 1fr 1fr 1.4fr', gap: 14, alignItems: 'center', padding: '13px 6px', borderBottom: '1px solid #F4EEE4' }}>
            <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 16, color: i === 0 ? '#C4300F' : '#C7BEB0' }}>{i + 1}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: C.encre, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 14, color: C.ambre, flex: 'none' }}>{initials(t.nom)}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.nom}</div>
                <div style={{ fontFamily: F.mono, fontSize: 11, color: '#A89C90' }}>{t.zone}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontFamily: F.mono, fontSize: 14, color: '#45413B' }}>{t.visites}</div>
            <div style={{ textAlign: 'right', fontFamily: F.mono, fontSize: 14, color: '#45413B' }}>{t.conv}</div>
            <div style={{ textAlign: 'right', fontFamily: F.mono, fontSize: 14, fontWeight: 600, color: '#268257' }}>{t.taux}%</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 8, background: '#F1E9DD', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.round(t.caN / maxCA * 100)}%`, background: '#E0431D', borderRadius: 99 }} />
              </div>
              <span style={{ fontFamily: F.mono, fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', width: 70, textAlign: 'right' }}>{t.caN.toFixed(1)} M</span>
            </div>
          </div>
        ))}
      </div>

      {/* Zones + Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px' }}>
          <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 19, letterSpacing: '-.01em' }}>Couverture par zone</div>
          <div style={{ fontFamily: F.mono, fontSize: 11.5, color: '#8A7E71', marginBottom: 20 }}>visites sur la période</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            {ZONES_RAW.map(z => (
              <div key={z.name} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ width: 118, flex: 'none', fontSize: 13.5, color: '#45413B' }}>{z.name}</span>
                <div style={{ flex: 1, height: 22, background: '#F1E9DD', borderRadius: 7, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.round(z.count / maxZ * 100)}%`, background: 'linear-gradient(90deg,#B92E10,#E0431D)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}>
                    <span style={{ fontFamily: F.mono, fontSize: 10.5, fontWeight: 600, color: '#fff' }}>{z.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px' }}>
          <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 19, letterSpacing: '-.01em' }}>Points d'attention</div>
          <div style={{ fontFamily: F.mono, fontSize: 11.5, color: '#8A7E71', marginBottom: 18 }}>ce qui demande une action</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {[
              { title: '12 relances en retard', desc: 'réparties sur 4 commerciaux', bg: '#FBE4DB', border: '#F2CFC2', iconBg: '#F6D3C6', iconStroke: '#C4300F', titleColor: '#C4300F', path: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>' },
              { title: 'Didier Essomba sous objectif', desc: '22% de conversion — accompagnement', bg: '#FCEFD6', border: '#EFD9A6', iconBg: '#F3E4B8', iconStroke: '#B37A16', titleColor: '#9A6B12', path: '<path d="M12 3a6 6 0 0 0-6 6c0 7-3 9-3 9h18s-3-2-3-9a6 6 0 0 0-6-6Z"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>' },
              { title: 'Zone Bonanjo peu couverte', desc: '29 visites ce mois-ci', bg: '#E4EEF7', border: '#C9DCEE', iconBg: '#D2E2F1', iconStroke: '#2E6BB0', titleColor: '#2E6BB0', path: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>' },
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: a.bg, border: `1px solid ${a.border}`, borderRadius: 12, padding: '13px 14px' }}>
                <span style={{ width: 32, height: 32, borderRadius: 9, background: a.iconBg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke={a.iconStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }} dangerouslySetInnerHTML={{ __html: a.path }} />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: a.titleColor }}>{a.title}</div>
                  <div style={{ fontSize: 12.5, color: '#8A7E71', marginTop: 1 }}>{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Carte section ────────────────────────────────────────────────────────────
function CarteSection() {
  const [mapFilter, setMapFilter] = useState('tous')
  const filters = ['tous', 'A. Fotso', 'B. Ndonga', 'C. Mbarga']
  const fchip = (active: boolean) => ({
    background: active ? C.braise : C.surface, color: active ? '#fff' : '#6B625B',
    border: `1.5px solid ${active ? C.braise : '#E3D9CB'}`, fontFamily: F.mono, fontWeight: 600 as const,
    fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase' as const,
    padding: '7px 13px', borderRadius: 99, cursor: 'pointer', whiteSpace: 'nowrap' as const,
  })
  const filtered = MAP_DATA.filter(v => mapFilter === 'tous' || v.com === mapFilter)
  const visits = VISIT_ALL.filter(v => mapFilter === 'tous' || v.commercial === mapFilter)
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: '#8A7E71', marginRight: 2 }}>Filtrer par commercial</span>
        {filters.map(f => <button key={f} onClick={() => setMapFilter(f)} style={fchip(mapFilter === f)}>{f === 'tous' ? 'Toute l\'équipe' : f}</button>)}
        <span style={{ marginLeft: 'auto', fontFamily: F.mono, fontSize: 12, color: '#A89C90' }}>{filtered.reduce((n, v) => n + v.count, 0)} visites</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', gap: 16 }}>
        {/* Map */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 14, position: 'relative', overflow: 'hidden', minHeight: 540 }}>
          <div style={{ position: 'absolute', inset: 14, borderRadius: 12, overflow: 'hidden', background: '#F2EADD' }}>
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .55 }} preserveAspectRatio="none" viewBox="0 0 400 400" fill="none" stroke="#E0D3BF" strokeWidth="1">
              <ellipse cx="140" cy="150" rx="60" ry="46" /><ellipse cx="140" cy="150" rx="100" ry="80" /><ellipse cx="140" cy="150" rx="146" ry="118" />
              <ellipse cx="300" cy="280" rx="50" ry="40" /><ellipse cx="300" cy="280" rx="92" ry="74" />
            </svg>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '47%', width: 34, background: 'linear-gradient(90deg,transparent,#DCC7A8 40%,#DCC7A8 60%,transparent)', transform: 'rotate(11deg)' }} />
            {[['46%', '8%', 'Wouri', 'rotate(11deg)', true], ['18%', '26%', 'Bonabéri', '', false], ['58%', '34%', 'Akwa', '', false], ['64%', '62%', 'Bonanjo', '', false], ['30%', '70%', 'Bépanda', '', false], ['40%', '14%', 'Deido', '', false]].map(([l, t, label, tr, mono], i) => (
              <span key={i} style={{ position: 'absolute', left: l as string, top: t as string, fontFamily: mono ? F.mono : undefined, fontWeight: mono ? undefined : 700, fontSize: mono ? 10 : 13, color: '#A8987F', transform: tr as string }}>{label as string}</span>
            ))}
            {filtered.map((v, i) => (
              <div key={i} title={v.nom} style={{ position: 'absolute', left: v.left, top: v.top, transform: 'translate(-50%,-50%)', width: v.count > 1 ? 32 : 20, height: v.count > 1 ? 32 : 20, borderRadius: 999, background: SC[v.statut], border: '2.5px solid #FFFFFF', boxShadow: '0 3px 8px -2px rgba(90,30,10,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: F.mono, fontWeight: 600, fontSize: v.count > 1 ? 12 : 0, cursor: 'pointer', zIndex: v.count > 1 ? 3 : 2 }}>
                {v.count > 1 ? String(v.count) : ''}
              </div>
            ))}
            {/* Legend */}
            <div style={{ position: 'absolute', left: 12, bottom: 12, background: 'rgba(255,255,255,.95)', border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontFamily: F.mono, fontSize: 9.5, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: '#8A7E71' }}>Statut prospect</div>
              {[['#E0431D', 'Chaud'], ['#F0A93B', 'Tiède'], ['#3E82C4', 'Froid']].map(([col, lbl]) => (
                <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#45413B' }}>
                  <span style={{ width: 11, height: 11, borderRadius: 99, background: col, border: '2px solid #fff' }} />{lbl}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[['128', 'Visites géoloc.', C.encre], ['90%', 'Taux géoloc.', '#268257']].map(([v, l, c]) => (
              <div key={l} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase' as const, color: '#8A7E71', marginBottom: 6 }}>{l}</div>
                <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 30, lineHeight: 1, letterSpacing: '-.02em', color: c as string }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 22px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 18, letterSpacing: '-.01em' }}>Visites récentes</div>
              <span style={{ fontFamily: F.mono, fontSize: 11, color: '#A89C90' }}>auj.</span>
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 11.5, color: '#8A7E71', marginBottom: 16 }}>position à l'arrivée</div>
            <div>
              {visits.map((v, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < visits.length - 1 ? '1px solid #F4EEE4' : 'none' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 99, background: SC[v.statut], flex: 'none' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.nom}</div>
                    <div style={{ fontFamily: F.mono, fontSize: 11, color: '#A89C90' }}>{v.zone} · {v.commercial}</div>
                  </div>
                  <span style={{ fontFamily: F.mono, fontSize: 11.5, color: '#A89C90', flex: 'none' }}>{v.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Profile section ──────────────────────────────────────────────────────────
function ProfileSection({ appName, onLogout }: { appName: string; onLogout: () => void }) {
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
          <div style={{ width: 88, height: 88, borderRadius: 24, background: '#FF5A2C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 32, color: C.nuit }}>PK</div>
          <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 24, letterSpacing: '-.02em', color: '#F5EEE6', marginTop: 15 }}>Paul Kamga</div>
          <div style={{ fontFamily: F.mono, fontSize: 12, color: 'rgba(245,238,230,.65)', marginTop: 4 }}>paul.kamga@waraspace.cm</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, background: 'rgba(255,90,44,.18)', borderRadius: 7, padding: '6px 13px' }}>
            <span style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase' as const, color: '#FF8A5C' }}>● Directeur · Manager</span>
          </div>
          <div style={{ width: '100%', borderTop: '1px solid rgba(245,238,230,.14)', marginTop: 22, paddingTop: 18, display: 'flex', justifyContent: 'space-between' }}>
            {[['5', 'COMMERCIAUX'], ['2', 'ZONES'], ['142M', 'CA PRÉV']].map(([v, l], i) => (
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
          {/* Langue */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 0', borderBottom: '1px solid #F1E9DD' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#C4300F" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" style={{ width: 19, height: 19, flex: 'none' }}><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 14.5 }}>Langue</span>
            <div style={{ display: 'flex', background: '#F1E9DD', borderRadius: 8, padding: 3 }}>
              {[['fr', 'FR'], ['en', 'EN']].map(([k, l]) => (
                <button key={k} onClick={() => setLang(k)} style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 11, padding: '5px 11px', borderRadius: 6, border: 'none', cursor: 'pointer', background: lang === k ? C.encre : 'transparent', color: lang === k ? '#F6EDE0' : '#8A7E71' }}>{l}</button>
              ))}
            </div>
          </div>
          {/* Dark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 0', borderBottom: '1px solid #F1E9DD' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#C4300F" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" style={{ width: 19, height: 19, flex: 'none' }}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 14.5 }}>Thème sombre</span>
            <Toggle on={dark} onToggle={() => setDark(d => !d)} />
          </div>
          {/* Notif */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 0' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#C4300F" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" style={{ width: 19, height: 19, flex: 'none' }}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 14.5 }}>Notifications e-mail</span>
            <Toggle on={notif} onToggle={() => setNotif(n => !n)} />
          </div>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: '22px 24px' }}>
          <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: '#8A7E71', marginBottom: 6 }}>Compte</div>
          {[['Changer le mot de passe', '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'],
            ['Aide & support', '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>']].map(([label, path], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0', borderBottom: i === 0 ? '1px solid #F1E9DD' : 'none', cursor: 'pointer' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#6B625B" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" style={{ width: 19, height: 19, flex: 'none' }} dangerouslySetInnerHTML={{ __html: path }} />
              <span style={{ flex: 1, fontWeight: 600, fontSize: 14.5 }}>{label}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="#C7BEB0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}><path d="m9 18 6-6-6-6" /></svg>
            </div>
          ))}
        </div>
        <button onClick={onLogout} style={{ alignSelf: 'flex-start', background: '#FBE4DB', color: '#C4300F', fontFamily: F.ui, fontWeight: 700, fontSize: 14.5, padding: '13px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
          Se déconnecter
        </button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
type Nav = 'apercu' | 'equipe' | 'prospects' | 'carte' | 'relances' | 'profile'
type Period = 'sem' | 'mois' | 'tri'

interface DirectionDashboardProps {
  appName?: string
  onSwitchRole?: () => void
}

const maxZ = Math.max(...ZONES_RAW.map(z => z.count))

export default function DirectionDashboard({ appName = 'Wara space', onSwitchRole }: DirectionDashboardProps) {
  const [nav, setNav] = useState<Nav>('apercu')
  const [period, setPeriod] = useState<Period>('sem')
  const [sort, setSort] = useState('ca')

  const navItems: [Nav, string, boolean, string][] = [
    ['apercu', 'Vue d\'ensemble', false, ''],
    ['equipe', 'Équipe', false, ''],
    ['prospects', 'Prospects', true, '1 284'],
    ['carte', 'Carte', false, ''],
    ['relances', 'Relances', true, '37'],
  ]

  const pbtnPeriod = (active: boolean) => ({
    fontFamily: F.ui, fontWeight: 600, fontSize: 12.5, padding: '6px 13px', borderRadius: 8,
    border: 'none', cursor: 'pointer', background: active ? C.surface : 'transparent', color: active ? C.encre : '#8A7E71',
    boxShadow: active ? '0 1px 2px rgba(26,21,18,.1)' : 'none',
  })

  const closeTotal = 31, closeElapsed = 22
  const closeDots = Array.from({ length: closeTotal }, (_, i) => ({ color: i < closeElapsed ? '#E0431D' : (i < closeElapsed + 3 ? '#F0A93B' : '#E6DFD2') }))

  const eyebrow = nav === 'profile' ? 'Compte · préférences'
    : nav === 'carte' ? 'Carte · géolocalisation'
    : `Direction · ${{ sem: 'cette semaine', mois: 'ce mois', tri: 'ce trimestre' }[period]}`
  const pageTitle = nav === 'profile' ? 'Mon profil' : nav === 'carte' ? 'Carte des visites' : 'Vue d\'ensemble'
  const pageSub = nav === 'profile' ? 'Compte, rôle et préférences'
    : nav === 'carte' ? 'Visites géolocalisées — 7 derniers jours'
    : 'Activité commerciale — équipe terrain Douala & Yaoundé'

  return (
    <div style={{ minHeight: '100vh', background: C.creme, display: 'flex', flexDirection: 'column', fontFamily: F.ui }}>
      {/* Top nav */}
      <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(251,247,241,.9)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.border}`, padding: '0 34px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 66 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: C.braise, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 19, height: 19 }}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
              </div>
              <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-.02em' }}>{appName}</span>
              <span style={{ fontFamily: F.mono, fontSize: 9, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: '#C4300F', background: '#FBE4DB', padding: '3px 7px', borderRadius: 6, marginLeft: 2 }}>Direction</span>
            </div>
            {/* Nav */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {navItems.map(([key, label, hasBadge, badge]) => {
                const active = nav === key
                return (
                  <div key={key} onClick={() => setNav(key)} style={{ display: 'flex', alignItems: 'center', fontFamily: F.ui, fontWeight: active ? 600 : 500, fontSize: 14, color: active ? C.encre : '#6B625B', background: active ? '#F6EDE0' : 'transparent', padding: '8px 13px', borderRadius: 9, cursor: 'pointer' }}>
                    {label}
                    {hasBadge && <span style={{ fontFamily: F.mono, fontSize: 10, fontWeight: 600, color: '#C4300F', background: '#FBE4DB', padding: '1px 6px', borderRadius: 99, marginLeft: 6 }}>{badge}</span>}
                  </div>
                )
              })}
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#F6EDE0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B625B', cursor: 'pointer' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}><path d="M12 3a6 6 0 0 0-6 6c0 7-3 9-3 9h18s-3-2-3-9a6 6 0 0 0-6-6Z" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
            </div>
            <div onClick={() => setNav('profile')} style={{ display: 'flex', alignItems: 'center', gap: 9, paddingLeft: 14, borderLeft: `1px solid ${C.border}`, cursor: 'pointer' }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: C.encre, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 13, color: C.ambre }}>PK</div>
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Paul Kamga</div>
                <div style={{ fontFamily: F.mono, fontSize: 10, color: '#8A7E71' }}>Directeur</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="v2s" style={{ flex: 1, overflowY: 'auto', padding: '28px 34px 44px' }}>
        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase' as const, color: '#C4300F' }}>{eyebrow}</div>
            <h1 style={{ fontFamily: F.display, fontWeight: 900, fontSize: 42, letterSpacing: '-.03em', margin: '6px 0 0', lineHeight: 1 }}>{pageTitle}</h1>
            <div style={{ fontSize: 14, color: '#6B625B', marginTop: 6 }}>{pageSub}</div>
          </div>
          {nav !== 'profile' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Close counter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '8px 14px 8px 12px' }}>
                <div style={{ textAlign: 'center', flex: 'none' }}>
                  <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 22, lineHeight: .95, color: '#E0431D' }}>{closeTotal - closeElapsed}</div>
                  <div style={{ fontFamily: F.mono, fontSize: 8, letterSpacing: '.06em', textTransform: 'uppercase' as const, color: '#A89C90' }}>jours</div>
                </div>
                <div style={{ width: 1, alignSelf: 'stretch', background: '#EEE7DA', margin: '2px 0' }} />
                <div>
                  <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: '#8A7E71', marginBottom: 5 }}>Clôture · JUIL.</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, width: 150 }}>
                    {closeDots.map((d, i) => <span key={i} style={{ width: 6, height: 6, borderRadius: 2, background: d.color }} />)}
                  </div>
                </div>
              </div>
              {/* Period selector */}
              <div style={{ display: 'flex', background: '#F1E9DD', border: `1px solid ${C.border}`, borderRadius: 11, padding: 3 }}>
                {[['sem', 'Semaine'], ['mois', 'Mois'], ['tri', 'Trimestre']].map(([k, l]) => (
                  <button key={k} onClick={() => setPeriod(k as Period)} style={pbtnPeriod(period === k)}>{l}</button>
                ))}
              </div>
              {/* Export */}
              <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.encre, color: '#F6EDE0', fontFamily: F.ui, fontWeight: 600, fontSize: 13.5, padding: '10px 15px', borderRadius: 11, border: 'none', cursor: 'pointer' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M12 15V3" /><path d="m7 10 5 5 5-5" /><path d="M21 21H3" /></svg>
                Exporter
              </button>
            </div>
          )}
        </div>

        {nav === 'apercu' && <ApercuSection sort={sort} setSort={setSort} />}
        {nav === 'carte' && <CarteSection />}
        {nav === 'profile' && <ProfileSection appName={appName} onLogout={() => {}} />}
        {['equipe', 'prospects', 'relances'].includes(nav) && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: 14, color: C.muted }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 40, height: 40, opacity: .4 }}><rect width="20" height="20" x="2" y="2" rx="4" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>
            <div style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase' as const }}>Section «&nbsp;{nav}&nbsp;» — à implémenter</div>
          </div>
        )}
      </main>
    </div>
  )
}
