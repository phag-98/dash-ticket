import { useState } from 'react';
import { C, FONT } from './tokens';
import ChampionshipReport from './pages/ChampionshipReport';
import Comparativo        from './pages/Comparativo';
import Setores            from './pages/Setores';
import NoShow             from './pages/NoShow';
import Precos             from './pages/Precos';

const TABS = [
  { id: 'championship', label: 'Championship Report' },
  { id: 'comparativo',  label: 'Comparativo' },
  { id: 'setores',      label: 'Setores' },
  { id: 'noshow',       label: 'No Show' },
  { id: 'precos',       label: 'Preços' },
];

export default function App() {
  const [tab, setTab] = useState('championship');

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:FONT, color:C.t1 }}>

      {/* ── Top bar ── */}
      <header style={{
        background:C.header, borderBottom:`1px solid ${C.border}`,
        display:'flex', alignItems:'center', gap:0,
        padding:'0 24px', height:52, position:'sticky', top:0, zIndex:100,
      }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginRight:32, flexShrink:0 }}>
          <div style={{
            width:32, height:32, borderRadius:6,
            background:C.accentBg, border:`1.5px solid ${C.accent}`,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" fill={C.accent}/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:800, color:'#fff', letterSpacing:'-0.3px', lineHeight:1.1 }}>BOTAFOGO</div>
            <div style={{ fontSize:9, color:C.t3, textTransform:'uppercase', letterSpacing:'0.8px' }}>Ticket Dashboard</div>
          </div>
        </div>

        {/* Tabs */}
        <nav style={{ display:'flex', gap:4, flex:1 }}>
          {TABS.map(t => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding:'0 16px', height:52, border:'none', cursor:'pointer',
                  background:'transparent', color: active ? '#fff' : C.t2,
                  fontFamily:FONT, fontSize:11, fontWeight: active ? 700 : 500,
                  borderBottom: active ? `2px solid ${C.accent}` : '2px solid transparent',
                  transition:'all 0.15s ease',
                  letterSpacing:'0.2px', whiteSpace:'nowrap',
                }}
                onMouseEnter={e=>{ if(!active) e.currentTarget.style.color='#fff'; }}
                onMouseLeave={e=>{ if(!active) e.currentTarget.style.color=C.t2; }}
              >
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Right: branding */}
        <div style={{ fontSize:10, color:C.t3, flexShrink:0 }}>
          Maracanã · 2024–2025
        </div>
      </header>

      {/* ── Page content ── */}
      <main style={{ padding:'20px 24px' }}>
        {tab === 'championship' && <ChampionshipReport />}
        {tab === 'comparativo'  && <Comparativo />}
        {tab === 'setores'      && <Setores />}
        {tab === 'noshow'       && <NoShow />}
        {tab === 'precos'       && <Precos />}
      </main>
    </div>
  );
}
