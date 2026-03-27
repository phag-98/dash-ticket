import { useState } from 'react';
import { C, FONT, FONT_UI } from './tokens';
import ChampionshipReport from './pages/ChampionshipReport';
import Comparativo        from './pages/Comparativo';
import Setores            from './pages/Setores';
import NoShow             from './pages/NoShow';
import VisaoGeral         from './pages/VisaoGeral';
import Precos             from './pages/Precos';

const TABS = [
  { id: 'championship', label: 'Championship Report' },
  { id: 'comparativo',  label: 'Comparativo' },
  { id: 'setores',      label: 'Setores' },
  { id: 'noshow',       label: 'No Show' },
  { id: 'visaogeral',   label: 'Visão Geral' },
  { id: 'precos',       label: 'Preços' },
];

export default function App() {
  const [tab, setTab] = useState('championship');

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:FONT_UI, color:C.t1 }}>

      {/* ── Top bar ── */}
      <header style={{
        background:C.header, borderBottom:`1px solid ${C.border}`,
        display:'flex', alignItems:'center', gap:0,
        padding:'0 24px', height:52, position:'sticky', top:0, zIndex:100,
      }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginRight:32, flexShrink:0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" fill={C.accent}/>
          </svg>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:C.t1, letterSpacing:'2px', textTransform:'uppercase', lineHeight:1.1, fontFamily:FONT_UI }}>BOTAFOGO</div>
            <div style={{ fontSize:9, color:C.accentDim, textTransform:'uppercase', letterSpacing:'1.5px' }}>Ticket Dashboard</div>
          </div>
        </div>

        {/* Tabs */}
        <nav style={{ display:'flex', gap:4, flex:1, overflowX:'auto', scrollbarWidth:'none' }}>
          {TABS.map(t => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding:'0 16px', height:52, border:'none', cursor:'pointer',
                  background:'transparent', color: active ? C.accent : C.t2,
                  fontFamily:FONT_UI, fontSize:11, fontWeight: active ? 700 : 400,
                  borderBottom: active ? `2px solid ${C.accent}` : '2px solid transparent',
                  transition:'all 0.15s ease',
                  letterSpacing:'1px', whiteSpace:'nowrap', textTransform:'uppercase',
                }}
                onMouseEnter={e=>{ if(!active) e.currentTarget.style.color=C.t1; }}
                onMouseLeave={e=>{ if(!active) e.currentTarget.style.color=C.t2; }}
              >
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Right: branding */}
        <div style={{ fontSize:10, color:C.t3, flexShrink:0 }}>
          <span style={{ color:C.accentDim, letterSpacing:'1px', textTransform:'uppercase', fontSize:9 }}>Maracanã · 2024–2025</span>
        </div>
      </header>

      {/* ── Page content ── */}
      <main style={{ padding:'20px 24px' }}>
        {tab === 'championship' && <ChampionshipReport />}
        {tab === 'comparativo'  && <Comparativo />}
        {tab === 'setores'      && <Setores />}
        {tab === 'noshow'       && <NoShow />}
        {tab === 'visaogeral'   && <VisaoGeral />}
        {tab === 'precos'       && <Precos />}
      </main>
    </div>
  );
}
