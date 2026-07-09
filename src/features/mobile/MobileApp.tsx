import { useState, useCallback } from 'react'
import type { Prospect, Relance } from '../../shared/types'

// ─── Design tokens ──────────────────────────────────────────────────────────
const C = {
  braise: '#E0431D',
  braiseDark: '#FF5A2C',
  ambre: '#F0A93B',
  creme: '#FBF7F1',
  encre: '#1A1512',
  surface: '#FFFFFF',
  nuit: '#17120F',
  muted: '#8A7E71',
  border: '#EAE1D6',
  chaud: { bg: '#FBE4DB', fg: '#C4300F' },
  tiede: { bg: '#FCEFD6', fg: '#9A6B12' },
  froid: { bg: '#E4EEF7', fg: '#2E6BB0' },
  success: { bg: '#E4F1E9', fg: '#268257' },
}

const F = {
  display: "'Archivo', sans-serif",
  ui: "'Space Grotesk', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
}

// ─── Static data ─────────────────────────────────────────────────────────────
const PROSPECTS: Prospect[] = [
  { id: 1, nom: 'Ets. Njoya & Fils', secteur: 'Quincaillerie', cat: 'grossiste', spec: 'Ouvert 7h–19h · livraison le matin', ville: 'Douala · Akwa', statut: 'chaud', phone: '+237 6 91 24 55 08', last: '2j', historique: [{ date: '12 juil.', objet: 'Négociation', resultat: 'À relancer' }, { date: '28 juin', objet: 'Prospection', resultat: 'Intéressé' }] },
  { id: 2, nom: 'Marché Mboppi Grossiste', secteur: 'Alimentaire', cat: 'grossiste', spec: '', ville: 'Douala · Nkololoun', statut: 'tiede', phone: '+237 6 55 10 42 77', last: '5j', historique: [{ date: '8 juil.', objet: 'Livraison', resultat: 'Commande' }] },
  { id: 3, nom: 'Pharmacie du Wouri', secteur: 'Santé', cat: 'boutique', spec: '', ville: 'Douala · Bonanjo', statut: 'froid', phone: '+237 6 99 03 18 21', last: '12j', historique: [] },
  { id: 4, nom: 'Boulangerie Saker', secteur: 'Agroalimentaire', cat: 'boutique', spec: 'Fermé le lundi', ville: 'Douala · Bonapriso', statut: 'chaud', phone: '+237 6 78 66 90 14', last: 'hier', historique: [{ date: '3 juil.', objet: 'Prospection', resultat: 'Intéressé' }] },
  { id: 5, nom: 'Quincaillerie Bimeg', secteur: 'BTP', cat: 'grossiste', spec: '', ville: 'Douala · Bépanda', statut: 'tiede', phone: '+237 6 90 47 32 05', last: '8j', historique: [] },
  { id: 6, nom: 'Ets. Tchakounté', secteur: 'Distribution', cat: 'grossiste', spec: '', ville: 'Yaoundé · Mvog-Mbi', statut: 'froid', phone: '+237 6 74 22 88 61', last: '20j', historique: [] },
  { id: 7, nom: 'Café Sic', secteur: 'Restauration', cat: 'resto', spec: '', ville: 'Douala · Deido', statut: 'tiede', phone: '+237 6 65 39 11 90', last: '3j', historique: [{ date: '1 juil.', objet: 'Relance', resultat: 'À relancer' }] },
  { id: 8, nom: 'Superette Bonamoussadi', secteur: 'Commerce', cat: 'supermarche', spec: '', ville: 'Douala · Bonamoussadi', statut: 'chaud', phone: '+237 6 82 50 74 33', last: '4j', historique: [] },
]

const RELANCES_BASE: Relance[] = [
  { id: 'r1', nom: 'Ets. Njoya & Fils', motif: 'Envoyer le devis quincaillerie', due: 'today', echue: true },
  { id: 'r2', nom: 'Boulangerie Saker', motif: 'Livrer les échantillons', due: 'today', echue: false },
  { id: 'r3', nom: 'Café Sic', motif: 'Relancer la proposition', due: 'demain', echue: false, dueText: 'DEMAIN' },
  { id: 'r4', nom: 'Pharmacie du Wouri', motif: 'Reprendre contact', due: '3j', echue: false, dueText: 'DANS 3J' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
function initials(nom: string) {
  const stop = ['ets', 'marche', 'marché', 'pharmacie', 'boulangerie', 'quincaillerie', 'cafe', 'café', 'superette', 'du', 'de', 'la', 'le', 'et', 'fils', 'sic', 'des', 'grossiste']
  let w = (nom.match(/[A-Za-zÀ-ÿ]{2,}/g) || []).filter(x => !stop.includes(x.toLowerCase()))
  if (!w.length) w = nom.match(/[A-Za-zÀ-ÿ]{2,}/g) || [nom]
  if (w.length === 1) return (w[0] || '??').slice(0, 2).toUpperCase()
  return (w[0][0] + w[1][0]).toUpperCase()
}

function chipStyle(statut: string) {
  const m: Record<string, { bg: string; fg: string }> = { chaud: C.chaud, tiede: C.tiede, froid: C.froid }
  const { bg, fg } = m[statut] || { bg: '#eee', fg: '#666' }
  return { display: 'inline-block', fontFamily: F.mono, fontWeight: 600, fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase' as const, padding: '4px 8px', borderRadius: 6, background: bg, color: fg, whiteSpace: 'nowrap' as const }
}

function chipLabel(statut: string) {
  return { chaud: '● Chaud', tiede: '● Tiède', froid: '● Froid' }[statut] || statut
}

// ─── SVG icons ───────────────────────────────────────────────────────────────
const icons = {
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></svg>,
  portfolio: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}><rect width="20" height="14" x="2" y="7" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
  clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}><path d="M5 12h14" /><path d="M12 5v14" /></svg>,
  plusSm: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}><path d="M5 12h14" /><path d="M12 5v14" /></svg>,
  back: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="m15 18-6-6 6-6" /></svg>,
  chevron: <svg viewBox="0 0 24 24" fill="none" stroke="#C7BEB0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="m9 18 6-6-6-6" /></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}><path d="M20 6 9 17l-5-5" /></svg>,
  phone: <svg viewBox="0 0 24 24" fill="none" stroke="#8A7E71" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" /></svg>,
  pin: <svg viewBox="0 0 24 24" fill="none" stroke="#8A7E71" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>,
  wifi: <svg viewBox="0 0 24 24" fill="none" stroke="#1A1512" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M5 13a10 10 0 0 1 14 0" /><path d="M8.5 16.4a5 5 0 0 1 7 0" /><path d="M2 8.8a15 15 0 0 1 20 0" /><path d="M12 20h.01" /></svg>,
  wifiOff: <svg viewBox="0 0 24 24" fill="none" stroke="#C81E3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="m2 2 20 20" /><path d="M8.5 16.4a5 5 0 0 1 7 0" /><path d="M5 13a10 10 0 0 1 5.2-2.8" /><path d="M12 20h.01" /></svg>,
  search: <svg viewBox="0 0 24 24" fill="none" stroke="#8A7E71" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>,
  sync: <svg viewBox="0 0 24 24" fill="none" stroke="#268257" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 19, height: 19 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>,
  logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>,
}

// ─── Topo lines SVG background ───────────────────────────────────────────────
function TopoLines({ light = false, opacity = 0.4 }: { light?: boolean; opacity?: number }) {
  const stroke = light ? '#E0431D' : '#FF5A2C'
  return (
    <svg viewBox="0 0 380 760" preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none' }}
      fill="none" stroke={stroke} strokeWidth="1">
      <path d="M-20 120 C 80 90 160 150 260 120 S 420 108 420 138" />
      <path d="M-20 170 C 90 140 170 200 270 170 S 420 156 420 188" />
      <path d="M-20 220 C 80 190 180 250 280 220 S 420 206 420 240" />
      <path d="M-20 300 C 90 270 170 330 270 300 S 420 286 420 318" />
      <path d="M-20 360 C 80 330 180 390 280 360 S 420 346 420 380" />
      <path d="M-20 440 C 90 410 170 470 270 440 S 420 426 420 458" />
    </svg>
  )
}

// ─── Screen: Welcome ─────────────────────────────────────────────────────────
function WelcomeScreen({ appName, onLogin }: { appName: string; onLogin: () => void }) {
  return (
    <div style={{ minHeight: 756, display: 'flex', flexDirection: 'column', background: C.nuit, position: 'relative', overflow: 'hidden' }}>
      <TopoLines />
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', padding: '56px 32px 34px' }}>
        <div style={{ width: 60, height: 60, borderRadius: 17, background: C.braise, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'auto' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" style={{ width: 33, height: 33 }}>
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: '#FF8A5C' }}>{appName} · terrain</div>
        <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 46, letterSpacing: '-.035em', lineHeight: .98, color: '#F5EEE6', marginTop: 12 }}>
          Le terrain,<br /><span style={{ color: C.braiseDark }}>sans friction.</span>
        </div>
        <div style={{ fontSize: 15.5, lineHeight: 1.55, color: 'rgba(245,238,230,.72)', marginTop: 16, maxWidth: '34ch' }}>
          Prospection, visites et relances — dans votre poche, même sans réseau.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 34 }}>
          {[
            ['Saisie d\'une visite en moins d\'une minute', icons.plusSm],
            ['Fonctionne hors-ligne, synchro auto', icons.wifiOff],
            ['Portefeuille géolocalisé, Douala & Yaoundé', icons.pin],
          ].map(([text, icon], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <span style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,90,44,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', color: '#FF8A5C' }}>{icon as React.ReactNode}</span>
              <span style={{ fontSize: 14, color: 'rgba(245,238,230,.85)' }}>{text as string}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'relative', padding: '0 32px 40px', display: 'flex', flexDirection: 'column', gap: 11 }}>
        <button onClick={onLogin} style={{ width: '100%', background: C.braise, color: '#fff', fontFamily: F.ui, fontWeight: 700, fontSize: 16, padding: 16, borderRadius: 14, border: 'none', cursor: 'pointer' }}>
          Se connecter
        </button>
        <button onClick={onLogin} style={{ width: '100%', background: 'transparent', color: '#F5EEE6', fontFamily: F.ui, fontWeight: 600, fontSize: 15, padding: 13, borderRadius: 14, border: '1.5px solid rgba(245,238,230,.25)', cursor: 'pointer' }}>
          Découvrir la démo
        </button>
      </div>
    </div>
  )
}

// ─── Screen: Login ───────────────────────────────────────────────────────────
function LoginScreen({ appName, onLogin }: { appName: string; onLogin: () => void }) {
  return (
    <div style={{ minHeight: 756, display: 'flex', flexDirection: 'column', padding: '0 0 32px' }}>
      <div style={{ position: 'relative', overflow: 'hidden', padding: '48px 30px 30px' }}>
        <svg viewBox="0 0 380 220" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .5, pointerEvents: 'none' }} fill="none" stroke={C.braise} strokeWidth="1">
          <path d="M-20 50 C 80 20 160 80 260 50 S 420 38 420 68" /><path d="M-20 86 C 90 56 170 116 270 86 S 420 72 420 104" />
          <path d="M-20 122 C 80 92 180 152 280 122 S 420 108 420 140" /><path d="M-20 158 C 90 128 170 188 270 158 S 420 144 420 176" />
        </svg>
        <div style={{ position: 'relative' }}>
          <div style={{ width: 56, height: 56, borderRadius: 15, background: C.braise, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 26 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#FBF7F1" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" style={{ width: 31, height: 31 }}>
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: '#C4300F' }}>{appName}</div>
          <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 42, letterSpacing: '-.035em', lineHeight: .98, color: C.encre, marginTop: 8 }}>
            Prêt pour<br />le terrain&nbsp;?
          </div>
          <div style={{ fontSize: 15, color: '#6B625B', marginTop: 14, maxWidth: '32ch' }}>
            Retrouvez votre portefeuille et saisissez vos visites — même hors-ligne.
          </div>
        </div>
      </div>
      <div style={{ padding: '6px 30px 0' }}>
        <div style={{ fontFamily: F.mono, fontSize: 10, color: C.muted, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Téléphone ou identifiant</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: C.surface, border: `1.5px solid #E3D9CB`, borderRadius: 11, padding: '13px 14px', marginBottom: 14 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#8A7E71" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          <span style={{ fontSize: 15, color: C.encre }}>ariane.fotso</span>
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 10, color: C.muted, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Mot de passe</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: C.surface, border: `1.5px solid #E3D9CB`, borderRadius: 11, padding: '13px 14px', marginBottom: 24 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#8A7E71" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          <span style={{ fontSize: 16, color: C.encre, letterSpacing: 3 }}>••••••••</span>
        </div>
        <button onClick={onLogin} style={{ background: C.braise, color: '#fff', fontFamily: F.ui, fontWeight: 700, fontSize: 16, padding: 15, borderRadius: 12, border: 'none', cursor: 'pointer', width: '100%' }}>
          Se connecter
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 22, color: C.muted, fontFamily: F.mono, fontSize: 11 }}>
          {icons.wifiOff}Fonctionne hors-ligne
        </div>
      </div>
    </div>
  )
}

// ─── Screen: Home ─────────────────────────────────────────────────────────────
function HomeScreen({ appName, offline, pending, relancesToday, onNewVisit, onGoProspects, onGoRelances, onGoPlan, onGoReport, onSync, onLogout }:
  { appName: string; offline: boolean; pending: number; relancesToday: Relance[]; onNewVisit: () => void; onGoProspects: () => void; onGoRelances: () => void; onGoPlan: () => void; onGoReport: () => void; onSync: () => void; onLogout: () => void }) {
  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ position: 'relative', overflow: 'hidden', padding: '10px 20px 8px' }}>
        <svg viewBox="0 0 380 120" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .45, pointerEvents: 'none' }} fill="none" stroke={C.braise} strokeWidth="1">
          <path d="M-20 34 C 80 10 160 58 260 34 S 420 24 420 52" /><path d="M-20 66 C 90 42 170 92 270 66 S 420 52 420 84" />
        </svg>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '.14em', color: '#C4300F' }}>MAR. 8 JUIL. · DOUALA</div>
            <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 25, letterSpacing: '-.02em', color: C.encre, marginTop: 3 }}>Bonjour, Ariane</div>
          </div>
          <div onClick={onLogout} style={{ width: 46, height: 46, borderRadius: 13, background: C.encre, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 800, color: C.ambre, cursor: 'pointer', fontSize: 15 }}>AF</div>
        </div>
      </div>
      <div style={{ padding: '8px 20px 0' }}>
        {/* Ledger card */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '15px 18px 16px', marginBottom: 14, boxShadow: '0 10px 26px -18px rgba(196,48,15,.4)' }}>
          <div style={{ fontFamily: F.mono, fontSize: 9.5, letterSpacing: '.14em', color: '#A89C90', marginBottom: 13 }}>RELEVÉ · SEMAINE 28</div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ flex: 1.25 }}>
              <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 46, lineHeight: .9, letterSpacing: '-.03em', color: C.encre }}>27</div>
              <div style={{ width: 24, height: 3, background: C.braise, borderRadius: 2, margin: '8px 0 5px' }} />
              <div style={{ fontSize: 11, color: C.muted }}>visites cette semaine</div>
            </div>
            <div style={{ width: 1, alignSelf: 'stretch', background: '#F1E9DD', margin: '2px 14px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 30, lineHeight: 1, color: '#268257' }}>6</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>nouveaux</div>
            </div>
            <div style={{ width: 1, alignSelf: 'stretch', background: '#F1E9DD', margin: '2px 14px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 30, lineHeight: 1, color: C.braise }}>{relancesToday.length}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>relances</div>
            </div>
          </div>
        </div>

        {/* Sync banners */}
        {offline && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F1E9DD', border: `1px solid #E3D9CB`, borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
            {icons.wifiOff}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: '#45413B' }}>Mode hors-ligne</div>
              <div style={{ fontFamily: F.mono, fontSize: 11, color: C.muted }}>{pending} saisie(s) en file d'attente</div>
            </div>
          </div>
        )}
        {!offline && pending > 0 && (
          <div onClick={onSync} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FCEFD6', border: '1px solid #EFD9A6', borderRadius: 12, padding: '12px 14px', marginBottom: 14, cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#B37A16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 19, height: 19, flex: 'none', animation: 'v2spin 1.8s linear infinite' }}>
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: '#9A6B12' }}>{pending} visite(s) en attente</div>
              <div style={{ fontFamily: F.mono, fontSize: 11, color: '#B37A16' }}>Touchez pour synchroniser</div>
            </div>
          </div>
        )}
        {!offline && pending === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#E4F1E9', border: '1px solid #C6E3D3', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
            {icons.sync}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: '#268257' }}>Tout est synchronisé</div>
              <div style={{ fontFamily: F.mono, fontSize: 11, color: '#5E9A78' }}>à l'instant</div>
            </div>
          </div>
        )}

        {/* Relances */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '6px 0 11px' }}>
          <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 18, color: C.encre }}>Relances du jour</span>
          <span onClick={onGoRelances} style={{ fontFamily: F.mono, fontSize: 12, fontWeight: 600, color: '#C4300F', cursor: 'pointer' }}>TOUT VOIR →</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 22 }}>
          {relancesToday.slice(0, 2).map(r => (
            <div key={r.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 13, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: 99, background: C.braise, flex: 'none' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.encre }}>{r.nom}</div>
                <div style={{ fontSize: 12.5, color: C.muted }}>{r.motif}</div>
              </div>
              <button style={{ background: '#E4F1E9', color: '#268257', fontFamily: F.mono, fontWeight: 600, fontSize: 11, padding: '8px 11px', borderRadius: 8, border: 'none', cursor: 'pointer', flex: 'none' }}>TRAITER</button>
            </div>
          ))}
        </div>

        {/* Main CTA */}
        <button onClick={onNewVisit} style={{ width: '100%', background: C.braise, color: '#fff', fontFamily: F.ui, fontWeight: 700, fontSize: 16, padding: 16, borderRadius: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, marginBottom: 14 }}>
          {icons.plusSm}Nouvelle visite
        </button>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div onClick={onGoPlan} style={{ background: C.nuit, borderRadius: 14, padding: 16, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
            <svg viewBox="0 0 200 120" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .4, pointerEvents: 'none' }} fill="none" stroke={C.braiseDark} strokeWidth="1">
              <path d="M-10 40 C 50 20 100 60 150 40 S 220 30 220 55" /><path d="M-10 74 C 50 54 100 94 150 74 S 220 64 220 90" />
            </svg>
            <div style={{ position: 'relative' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#FF8A5C" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
                <rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="M8 2v4" /><path d="M16 2v4" /><path d="m9 16 2 2 4-4" />
              </svg>
              <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 15, color: '#F5EEE6', marginTop: 10, lineHeight: 1.1 }}>Plan de<br />prospection</div>
              <div style={{ fontFamily: F.mono, fontSize: 9.5, color: 'rgba(245,238,230,.55)', marginTop: 6 }}>Proposer un plan →</div>
            </div>
          </div>
          <div onClick={onGoReport} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#C4300F" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" />
            </svg>
            <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 15, color: C.encre, marginTop: 10, lineHeight: 1.1 }}>Rapport<br />du jour</div>
            <div style={{ fontFamily: F.mono, fontSize: 9.5, color: '#A89C90', marginTop: 6 }}>Générer →</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Screen: Prospects ───────────────────────────────────────────────────────
function ProspectsScreen({ prospects, onOpenProspect, onNewProspect }: {
  prospects: Prospect[]; onOpenProspect: (id: number) => void; onNewProspect: () => void
}) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'tous' | 'chaud' | 'tiede' | 'froid'>('tous')

  const filtered = prospects.filter(p => {
    if (filter !== 'tous' && p.statut !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return p.nom.toLowerCase().includes(q) || p.ville.toLowerCase().includes(q) || p.secteur.toLowerCase().includes(q)
    }
    return true
  })

  const filterBtn = (active: boolean) => ({
    background: active ? C.braise : C.surface, color: active ? '#fff' : '#6B625B',
    border: `1.5px solid ${active ? C.braise : '#E3D9CB'}`, fontFamily: F.mono, fontWeight: 600 as const,
    fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase' as const,
    padding: '7px 14px', borderRadius: 99, cursor: 'pointer', whiteSpace: 'nowrap' as const,
  })

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ position: 'relative', overflow: 'hidden', padding: '10px 20px 12px' }}>
        <svg viewBox="0 0 380 120" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .4, pointerEvents: 'none' }} fill="none" stroke={C.braise} strokeWidth="1">
          <path d="M-20 40 C 80 16 160 64 260 40 S 420 30 420 58" /><path d="M-20 72 C 90 48 170 98 270 72 S 420 58 420 90" />
        </svg>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: F.mono, fontSize: 9.5, letterSpacing: '.14em', color: '#C4300F' }}>PORTEFEUILLE · A. FOTSO</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, marginTop: 4 }}>
              <span style={{ fontFamily: F.display, fontWeight: 900, fontSize: 40, lineHeight: .9, letterSpacing: '-.03em', color: C.encre }}>{filtered.length}</span>
              <span style={{ fontFamily: F.ui, fontSize: 17, color: C.muted }}>prospects</span>
            </div>
          </div>
          <button onClick={onNewProspect} style={{ width: 44, height: 44, borderRadius: 12, background: C.braise, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flex: 'none' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
          </button>
        </div>
      </div>
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: C.surface, border: `1.5px solid #E3D9CB`, borderRadius: 11, padding: '11px 13px', marginBottom: 12 }}>
          {icons.search}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un prospect, une ville…"
            style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: F.ui, fontSize: 15, color: C.encre, width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
          {(['tous', 'chaud', 'tiede', 'froid'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={filterBtn(filter === f)}>
              {f === 'tous' ? 'Tous' : f === 'chaud' ? '● Chaud' : f === 'tiede' ? '● Tiède' : '● Froid'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {filtered.map(p => (
            <div key={p.id} onClick={() => onOpenProspect(p.id)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 13, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: C.encre, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 15, color: C.ambre, flex: 'none' }}>{initials(p.nom)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: C.encre, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nom}</div>
                <div style={{ fontFamily: F.mono, fontSize: 11.5, color: C.muted }}>{p.secteur} · {p.ville}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flex: 'none' }}>
                <span style={chipStyle(p.statut)}>{chipLabel(p.statut)}</span>
                <span style={{ fontFamily: F.mono, fontSize: 10, color: '#A89C90' }}>{p.last}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Screen: Detail ──────────────────────────────────────────────────────────
function DetailScreen({ prospect, onBack, onStartVisit }: { prospect: Prospect; onBack: () => void; onStartVisit: () => void }) {
  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ position: 'relative', overflow: 'hidden', background: C.nuit, padding: '14px 20px 22px', borderRadius: '0 0 22px 22px' }}>
        <svg viewBox="0 0 380 180" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .4, pointerEvents: 'none' }} fill="none" stroke={C.braiseDark} strokeWidth="1">
          <path d="M-20 44 C 80 16 160 70 260 44 S 420 30 420 62" /><path d="M-20 82 C 90 54 170 110 270 82 S 420 68 420 100" /><path d="M-20 120 C 80 92 180 148 280 120 S 420 106 420 138" />
        </svg>
        <div style={{ position: 'relative' }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: 'rgba(245,238,230,.8)', fontFamily: F.ui, fontWeight: 600, fontSize: 14, cursor: 'pointer', padding: 0, marginBottom: 16 }}>
            {icons.back}Portefeuille
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 54, height: 54, borderRadius: 15, background: C.braiseDark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 19, color: C.nuit, flex: 'none' }}>{initials(prospect.nom)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 21, color: '#F5EEE6', lineHeight: 1.12 }}>{prospect.nom}</div>
              <div style={{ fontFamily: F.mono, fontSize: 12, color: 'rgba(245,238,230,.65)', marginTop: 3 }}>{prospect.secteur} · {prospect.ville}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 9, marginTop: 18 }}>
            <button style={{ flex: 1, background: 'rgba(245,238,230,.12)', color: '#F5EEE6', fontWeight: 600, fontSize: 13.5, padding: 11, borderRadius: 11, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              {icons.phone}Appeler
            </button>
            <button onClick={onStartVisit} style={{ flex: 1, background: C.braise, color: '#fff', fontWeight: 700, fontSize: 13.5, padding: 11, borderRadius: 11, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              {icons.plusSm}Visite
            </button>
          </div>
        </div>
      </div>
      <div style={{ padding: '18px 20px 0' }}>
        <span style={{ ...chipStyle(prospect.statut), fontSize: 11, padding: '5px 11px' }}>
          {{ chaud: '● Prospect chaud', tiede: '● Prospect tiède', froid: '● Prospect froid' }[prospect.statut]}
        </span>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, margin: '16px 0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>{icons.phone}<span style={{ fontFamily: F.mono, fontSize: 14, color: C.encre }}>{prospect.phone}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>{icons.pin}<span style={{ fontSize: 14.5, color: C.encre }}>{prospect.ville}</span></div>
        </div>
        {prospect.spec && (
          <div style={{ background: '#FCEFD6', border: '1px solid #EFD9A6', borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ fontFamily: F.mono, fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase', color: '#B37A16', marginBottom: 3 }}>Spécificités</div>
            <div style={{ fontSize: 13.5, color: '#7A5A12', lineHeight: 1.5 }}>{prospect.spec}</div>
          </div>
        )}
        <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 18, color: C.encre, marginBottom: 11 }}>Historique des visites</div>
        {prospect.historique.length === 0 ? (
          <div style={{ background: '#F1E9DD', border: '1px dashed #D8CDBC', borderRadius: 13, padding: 18, textAlign: 'center', fontSize: 13.5, color: C.muted }}>
            Aucune visite enregistrée. Touchez «&nbsp;Visite&nbsp;» pour commencer.
          </div>
        ) : (
          <div>
            {prospect.historique.map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: 13 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 'none' }}>
                  <div style={{ width: 11, height: 11, borderRadius: 99, background: C.braise, marginTop: 5 }} />
                  {i < prospect.historique.length - 1 && <div style={{ width: 2, flex: 1, background: C.border }} />}
                </div>
                <div style={{ paddingBottom: 16, flex: 1 }}>
                  <div style={{ fontFamily: F.mono, fontSize: 11, color: '#A89C90' }}>{h.date}</div>
                  <div style={{ fontWeight: 600, fontSize: 14.5, color: C.encre, marginTop: 2 }}>{h.objet}</div>
                  <div style={{ fontSize: 13, color: C.muted }}>Résultat : {h.resultat}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Screen: Visit ───────────────────────────────────────────────────────────
function VisitScreen({ prospect, onCancel, onSave }: { prospect: Prospect; onCancel: () => void; onSave: () => void }) {
  const [type, setType] = useState('prospection')
  const [objet, setObjet] = useState('')
  const [result, setResult] = useState('')
  const [note, setNote] = useState('')
  const [geo, setGeo] = useState(true)
  const [photo, setPhoto] = useState(false)

  const chip = (active: boolean) => ({
    background: active ? C.encre : C.surface, color: active ? '#F6EDE0' : '#45413B',
    border: `1.5px solid ${active ? C.encre : '#E3D9CB'}`, fontFamily: F.ui, fontWeight: 600 as const,
    fontSize: 13.5, padding: '9px 15px', borderRadius: 10, cursor: 'pointer',
  })

  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ position: 'relative', overflow: 'hidden', padding: '12px 20px 14px' }}>
        <svg viewBox="0 0 380 110" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .4, pointerEvents: 'none' }} fill="none" stroke={C.braise} strokeWidth="1">
          <path d="M-20 34 C 80 10 160 58 260 34 S 420 24 420 52" /><path d="M-20 66 C 90 42 170 92 270 66 S 420 52 420 84" />
        </svg>
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <button onClick={onCancel} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: '#45413B', fontWeight: 600, fontSize: 14, cursor: 'pointer', padding: 0 }}>{icons.back}Annuler</button>
            <span style={{ fontFamily: F.mono, fontSize: 11, color: '#C4300F', background: '#FBE4DB', padding: '4px 9px', borderRadius: 7 }}>≈ 45 s</span>
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 9.5, letterSpacing: '.16em', color: '#C4300F' }}>RELEVÉ DE VISITE</div>
          <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 26, letterSpacing: '-.02em', color: C.encre, marginTop: 3 }}>Nouvelle visite</div>
        </div>
      </div>
      <div style={{ padding: '8px 20px 0' }}>
        {/* Prospect */}
        <div style={{ fontFamily: F.mono, fontSize: 10, color: C.muted, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 7 }}>Prospect</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.surface, border: `1.5px solid #E3D9CB`, borderRadius: 12, padding: '12px 14px', marginBottom: 18 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: C.encre, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 14, color: C.ambre, flex: 'none' }}>{initials(prospect.nom)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: C.encre }}>{prospect.nom}</div>
            <div style={{ fontFamily: F.mono, fontSize: 11.5, color: C.muted }}>{prospect.ville}</div>
          </div>
          {icons.chevron}
        </div>

        {/* Type */}
        <div style={{ fontFamily: F.mono, fontSize: 10, color: C.muted, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Type de visite</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
          {[['prospection', 'Prospection'], ['suivi', 'Suivi / fidélisation'], ['reclamation', 'Réclamation / SAV']].map(([k, l]) => (
            <button key={k} onClick={() => setType(k)} style={chip(type === k)}>{l}</button>
          ))}
        </div>

        {/* Objet */}
        <div style={{ fontFamily: F.mono, fontSize: 10, color: C.muted, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Objet</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
          {[['prospection', 'Prospection'], ['relance', 'Relance'], ['negociation', 'Négociation'], ['livraison', 'Livraison']].map(([k, l]) => (
            <button key={k} onClick={() => setObjet(k)} style={chip(objet === k)}>{l}</button>
          ))}
        </div>

        {/* Résultat */}
        <div style={{ fontFamily: F.mono, fontSize: 10, color: C.muted, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Résultat</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
          {[['interesse', 'Intéressé'], ['arelancer', 'À relancer'], ['commande', 'Commande'], ['sanssuite', 'Sans suite']].map(([k, l]) => (
            <button key={k} onClick={() => setResult(k)} style={chip(result === k)}>{l}</button>
          ))}
        </div>

        {/* Note */}
        <div style={{ fontFamily: F.mono, fontSize: 10, color: C.muted, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Note</div>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Compte-rendu court…"
          style={{ width: '100%', minHeight: 74, resize: 'none', background: C.surface, border: `1.5px solid #E3D9CB`, borderRadius: 12, padding: '12px 14px', fontFamily: F.ui, fontSize: 15, color: C.encre, outline: 'none', marginBottom: 18, boxSizing: 'border-box' }} />

        {/* Photo + Geo */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <button onClick={() => setPhoto(p => !p)} style={{ flex: 1, background: C.surface, border: '1.5px dashed #CFC3B2', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, cursor: 'pointer', color: '#6B625B' }}>
            {photo ? <><svg viewBox="0 0 24 24" fill="none" stroke="#268257" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg><span style={{ fontSize: 12.5, fontWeight: 600, color: '#268257' }}>Photo ajoutée</span></> : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" /><circle cx="12" cy="13" r="3" /></svg><span style={{ fontSize: 12.5, fontWeight: 600 }}>Photo</span></>}
          </button>
          <div onClick={() => setGeo(g => !g)} style={{ flex: 1, background: C.surface, border: `1.5px solid #E3D9CB`, borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, cursor: 'pointer', color: '#6B625B' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={C.braise} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: C.encre }}>Position</span>
              <span style={{ width: 34, height: 20, borderRadius: 99, background: geo ? C.braise : '#DDD3C4', padding: 2.5, display: 'flex', justifyContent: geo ? 'flex-end' : 'flex-start' }}>
                <span style={{ width: 15, height: 15, borderRadius: 99, background: '#fff' }} />
              </span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 20px 22px', background: 'linear-gradient(to top,#FBF7F1 68%,rgba(251,247,241,0))', zIndex: 6 }}>
        <button onClick={onSave} style={{ width: '100%', background: C.braise, color: '#fff', fontFamily: F.ui, fontWeight: 700, fontSize: 16, padding: 16, borderRadius: 14, border: 'none', cursor: 'pointer' }}>
          Enregistrer la visite
        </button>
      </div>
    </div>
  )
}

// ─── Screen: Relances ─────────────────────────────────────────────────────────
function RelancesScreen({ relances, done, onMark }: { relances: Relance[]; done: string[]; onMark: (id: string) => void }) {
  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ position: 'relative', overflow: 'hidden', padding: '12px 20px 14px' }}>
        <svg viewBox="0 0 380 110" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .4, pointerEvents: 'none' }} fill="none" stroke={C.braise} strokeWidth="1">
          <path d="M-20 34 C 80 10 160 58 260 34 S 420 24 420 52" /><path d="M-20 66 C 90 42 170 92 270 66 S 420 52 420 84" />
        </svg>
        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: F.mono, fontSize: 9.5, letterSpacing: '.16em', color: '#C4300F' }}>À TRAITER · DU PLUS URGENT</div>
          <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 26, letterSpacing: '-.02em', color: C.encre, marginTop: 4 }}>Relances</div>
        </div>
      </div>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {relances.map(r => {
          const isDone = done.includes(r.id)
          const isRetard = r.echue && !isDone
          const isToday = r.due === 'today' && !r.echue && !isDone
          const isLater = r.due !== 'today' && !isDone
          return (
            <div key={r.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 13, padding: 14, display: 'flex', alignItems: 'center', gap: 13 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  {isRetard && <span style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 10, padding: '2px 7px', borderRadius: 6, background: '#FBE4DB', color: '#C4300F' }}>EN RETARD</span>}
                  {isToday && <span style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 10, padding: '2px 7px', borderRadius: 6, background: '#FCEFD6', color: '#9A6B12' }}>AUJOURD'HUI</span>}
                  {isLater && <span style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 10, padding: '2px 7px', borderRadius: 6, background: '#F1E9DD', color: C.muted }}>{r.dueText}</span>}
                  {isDone && <span style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 10, padding: '2px 7px', borderRadius: 6, background: '#E4F1E9', color: '#268257' }}>TRAITÉ</span>}
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: C.encre }}>{r.nom}</div>
                <div style={{ fontSize: 13, color: C.muted }}>{r.motif}</div>
              </div>
              {!isDone ? (
                <button onClick={() => onMark(r.id)} style={{ flex: 'none', width: 42, height: 42, borderRadius: 11, background: '#E4F1E9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#268257' }}>
                  {icons.check}
                </button>
              ) : (
                <span style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 5, color: '#A89C90', fontFamily: F.mono, fontWeight: 600, fontSize: 11 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M20 6 9 17l-5-5" /></svg>OK
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Screen: Profile ─────────────────────────────────────────────────────────
function ProfileScreen({ appName, onLogout }: { appName: string; onLogout: () => void }) {
  const [dark, setDark] = useState(false)
  const [notif, setNotif] = useState(true)
  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <div onClick={onToggle} style={{ cursor: 'pointer' }}>
      <span style={{ width: 46, height: 27, borderRadius: 99, background: on ? C.braise : '#DDD3C4', padding: 3, display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start' }}>
        <span style={{ width: 21, height: 21, borderRadius: 99, background: '#fff' }} />
      </span>
    </div>
  )
  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ position: 'relative', overflow: 'hidden', background: C.nuit, borderRadius: '0 0 22px 22px', padding: '24px 20px 28px' }}>
        <svg viewBox="0 0 380 200" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .4, pointerEvents: 'none' }} fill="none" stroke={C.braiseDark} strokeWidth="1">
          <path d="M-20 48 C 80 20 160 74 260 48 S 420 34 420 66" /><path d="M-20 86 C 90 58 170 114 270 86 S 420 72 420 104" /><path d="M-20 124 C 80 96 180 152 280 124 S 420 110 420 142" />
        </svg>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: 78, height: 78, borderRadius: 22, background: C.braiseDark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 28, color: C.nuit }}>AF</div>
          <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 23, letterSpacing: '-.02em', color: '#F5EEE6', marginTop: 13 }}>Ariane Fotso</div>
          <div style={{ fontFamily: F.mono, fontSize: 11.5, color: 'rgba(245,238,230,.65)', marginTop: 3 }}>ariane.fotso@waraspace.cm</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, background: 'rgba(255,90,44,.18)', borderRadius: 7, padding: '5px 12px' }}>
            <span style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: '#FF8A5C' }}>● Commerciale · Littoral</span>
          </div>
        </div>
      </div>
      <div style={{ padding: '18px 20px 0' }}>
        {/* Stats terminal */}
        <div style={{ background: C.nuit, borderRadius: 14, padding: '16px 18px', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
            <span style={{ width: 9, height: 9, borderRadius: 99, background: C.braise }} />
            <span style={{ width: 9, height: 9, borderRadius: 99, background: C.ambre }} />
            <span style={{ width: 9, height: 9, borderRadius: 99, background: '#2FA36B' }} />
            <span style={{ fontFamily: F.mono, fontSize: 10.5, color: '#A89C90', marginLeft: 6 }}>stats/semaine</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
            {[['142', 'VISITES'], ['44', 'CONV.'], ['31%', 'TAUX']].map(([v, l], i) => (
              <div key={i}>
                <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 26, color: i === 2 ? '#FF8A5C' : '#F5EEE6', lineHeight: 1 }}>{v}</div>
                <div style={{ fontFamily: F.mono, fontSize: 9.5, color: '#8A7E71', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Préférences */}
        <div style={{ fontFamily: F.mono, fontSize: 10, color: C.muted, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 9 }}>Préférences</div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px', borderBottom: `1px solid #F1E9DD` }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#C4300F" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" style={{ width: 19, height: 19, flex: 'none' }}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 14.5, color: C.encre }}>Thème sombre</span>
            <Toggle on={dark} onToggle={() => setDark(d => !d)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#C4300F" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" style={{ width: 19, height: 19, flex: 'none' }}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 14.5, color: C.encre }}>Notifications</span>
            <Toggle on={notif} onToggle={() => setNotif(n => !n)} />
          </div>
        </div>
        <button onClick={onLogout} style={{ width: '100%', background: '#FBE4DB', color: '#C4300F', fontFamily: F.ui, fontWeight: 700, fontSize: 15, padding: 15, borderRadius: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {icons.logout}Se déconnecter
        </button>
        <div style={{ textAlign: 'center', fontFamily: F.mono, fontSize: 10.5, color: '#A89C90', marginTop: 16 }}>{appName} · v2 · Douala</div>
      </div>
    </div>
  )
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────
function TabBar({ screen, onHome, onProspects, onNewVisit, onRelances, onProfile }: {
  screen: string; onHome: () => void; onProspects: () => void; onNewVisit: () => void; onRelances: () => void; onProfile: () => void
}) {
  const tabColor = (active: boolean) => active ? C.braiseDark : 'rgba(245,238,230,.5)'
  const tabFontWeight = 600
  return (
    <div style={{ flex: 'none', padding: '9px 16px 14px', background: C.creme }}>
      <div style={{ background: C.encre, borderRadius: 18, padding: '9px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {([
          ['home', icons.home, 'HOME', onHome],
          ['prospects', icons.portfolio, 'FICHES', onProspects],
        ] as [string, React.ReactNode, string, () => void][]).map(([key, icon, label, fn]) => {
          const active = screen === key || (key === 'prospects' && screen === 'detail')
          return (
            <div key={key} onClick={fn} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', width: 56, color: tabColor(active) }}>
              {icon}
              <span style={{ fontFamily: F.mono, fontSize: 9, fontWeight: tabFontWeight }}>{label}</span>
            </div>
          )
        })}
        <div onClick={onNewVisit} style={{ width: 52, height: 52, borderRadius: 15, background: C.braise, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginTop: -22, flex: 'none', color: '#fff' }}>
          {icons.plus}
        </div>
        {([
          ['relances', icons.clock, 'RAPPELS', onRelances],
          ['profile', icons.user, 'PROFIL', onProfile],
        ] as [string, React.ReactNode, string, () => void][]).map(([key, icon, label, fn]) => {
          const active = screen === key
          return (
            <div key={key} onClick={fn} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', width: 56, color: tabColor(active) }}>
              {icon}
              <span style={{ fontFamily: F.mono, fontSize: 9, fontWeight: tabFontWeight }}>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main MobileApp ───────────────────────────────────────────────────────────
type Screen = 'welcome' | 'login' | 'home' | 'prospects' | 'detail' | 'visit' | 'relances' | 'profile'

interface MobileAppProps {
  appName?: string
  onSwitchRole?: () => void
}

export default function MobileApp({ appName = 'Wara space', onSwitchRole }: MobileAppProps) {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [offline, setOffline] = useState(false)
  const [pending, setPending] = useState(2)
  const [selectedId, setSelectedId] = useState(1)
  const [done, setDone] = useState<string[]>([])
  const [toast, setToast] = useState('')

  const flash = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }, [])

  const go = (s: Screen) => setScreen(s)

  const relances = RELANCES_BASE.map(r => r)
  const relancesToday = relances.filter(r => r.due === 'today' && !done.includes(r.id))
  const prospect = PROSPECTS.find(p => p.id === selectedId) || PROSPECTS[0]

  const showTabbar = ['home', 'prospects', 'relances', 'detail', 'profile'].includes(screen)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, padding: '40px 20px 60px', background: '#E7E0D4' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, fontWeight: 500, letterSpacing: '.2em', textTransform: 'uppercase', color: '#C4300F' }}>{appName} · app terrain · v2</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>Espace commercial · Vue mobile</div>
      </div>

      {/* Phone frame */}
      <div style={{ width: 400, background: '#0C0906', borderRadius: 46, padding: 13, boxShadow: '0 30px 70px -24px rgba(90,30,10,.5)' }}>
        <div style={{ position: 'relative', width: 374, height: 798, borderRadius: 34, overflow: 'hidden', background: C.creme, display: 'flex', flexDirection: 'column' }}>

          {/* Status bar */}
          <div style={{ flex: 'none', height: 42, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', fontFamily: F.mono, fontSize: 13, fontWeight: 600, color: C.encre, zIndex: 5 }}>
            <span>9:41</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div onClick={() => setOffline(o => !o)} style={{ cursor: 'pointer' }}>
                {offline ? icons.wifiOff : icons.wifi}
              </div>
              <svg viewBox="0 0 24 12" fill="none" style={{ width: 24, height: 12 }}>
                <rect x="1" y="1" width="19" height="10" rx="2.5" stroke={C.encre} strokeWidth="1.4" />
                <rect x="3" y="3" width="13" height="6" rx="1" fill={C.encre} />
                <rect x="21" y="4" width="2" height="4" rx="1" fill={C.encre} />
              </svg>
            </div>
          </div>

          {/* Screen content */}
          <div className="v2scr" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            {screen === 'welcome' && <WelcomeScreen appName={appName} onLogin={() => go('login')} />}
            {screen === 'login' && <LoginScreen appName={appName} onLogin={() => go('home')} />}
            {screen === 'home' && (
              <HomeScreen
                appName={appName} offline={offline} pending={pending} relancesToday={relancesToday}
                onNewVisit={() => go('visit')} onGoProspects={() => go('prospects')}
                onGoRelances={() => go('relances')} onGoPlan={() => flash('Plan de prospection')}
                onGoReport={() => flash('Rapport généré')}
                onSync={() => { if (!offline) { setPending(0); flash('Tout est synchronisé') } else { flash('Hors-ligne — synchro en attente') } }}
                onLogout={() => go('login')}
              />
            )}
            {screen === 'prospects' && (
              <ProspectsScreen prospects={PROSPECTS} onOpenProspect={id => { setSelectedId(id); go('detail') }} onNewProspect={() => flash('Nouveau prospect')} />
            )}
            {screen === 'detail' && (
              <DetailScreen prospect={prospect} onBack={() => go('prospects')} onStartVisit={() => go('visit')} />
            )}
            {screen === 'visit' && (
              <VisitScreen prospect={prospect} onCancel={() => go('home')} onSave={() => { setPending(p => p + 1); go('home'); flash('Visite enregistrée') }} />
            )}
            {screen === 'relances' && (
              <RelancesScreen relances={relances} done={done} onMark={id => { setDone(d => [...d, id]); flash('Relance traitée') }} />
            )}
            {screen === 'profile' && <ProfileScreen appName={appName} onLogout={() => go('login')} />}
          </div>

          {/* Tab bar */}
          {showTabbar && (
            <TabBar screen={screen} onHome={() => go('home')} onProspects={() => go('prospects')} onNewVisit={() => go('visit')} onRelances={() => go('relances')} onProfile={() => go('profile')} />
          )}

          {/* Toast */}
          {toast && (
            <div style={{ position: 'absolute', left: '50%', bottom: 96, transform: 'translateX(-50%)', background: C.encre, color: '#F5EEE6', padding: '12px 18px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 9, whiteSpace: 'nowrap', animation: 'v2up .25s ease', zIndex: 20 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={C.braiseDark} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M20 6 9 17l-5-5" /></svg>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{toast}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
