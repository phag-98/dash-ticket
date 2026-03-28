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

      {/* ── Header (2 rows, sticky) ── */}
      <header style={{ position:'sticky', top:0, zIndex:100 }}>

        {/* Row 1 — Branding strip */}
        <div style={{
          background:'#111111',
          borderBottom:'1px solid #2a2a2a',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'0 24px', height:30,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <svg width="14" height="14" viewBox="0 0 24 24">
              <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" fill={C.accent}/>
            </svg>
            <span style={{ fontSize:11, fontWeight:800, color:C.accent, letterSpacing:'3px', textTransform:'uppercase', fontFamily:FONT_UI }}>
              Botafogo
            </span>
            <span style={{ width:1, height:12, background:'#333', display:'inline-block', margin:'0 6px' }} />
            <span style={{ fontSize:9, color:'#666', letterSpacing:'2px', textTransform:'uppercase' }}>
              SAF · Ticket Dashboard
            </span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24">
            <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" fill="#ffffff"/>
          </svg>
        </div>

        {/* Row 2 — Navigation */}
        <div style={{
          background:C.header,
          borderBottom:`2px solid #2a2a2a`,
          display:'flex', alignItems:'center',
          padding:'0 24px', height:48,
        }}>
          {/* Logo mark */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginRight:28, flexShrink:0, borderRight:'1px solid #333', paddingRight:28 }}>
            <svg width="22" height="22" viewBox="0 0 24 24">
              <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" fill={C.accent}/>
            </svg>
            <span style={{ fontSize:10, fontWeight:700, color:'#ffffff', letterSpacing:'1.5px', textTransform:'uppercase', fontFamily:FONT_UI, lineHeight:1 }}>
              Ticket<br/>
              <span style={{ color:C.accent }}>Dashboard</span>
            </span>
          </div>

          {/* Tabs */}
          <nav style={{ display:'flex', gap:0, flex:1, overflowX:'auto', scrollbarWidth:'none' }}>
            {TABS.map(t => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    padding:'0 18px', height:48, border:'none', cursor:'pointer',
                    background:'transparent',
                    color: active ? '#ffffff' : '#888',
                    fontFamily:FONT_UI, fontSize:11, fontWeight: active ? 700 : 400,
                    borderBottom: active ? `3px solid ${C.accent}` : '3px solid transparent',
                    borderTop: '3px solid transparent',
                    transition:'all 0.15s ease',
                    letterSpacing:'0.8px', whiteSpace:'nowrap', textTransform:'uppercase',
                  }}
                  onMouseEnter={e=>{ if(!active){ e.currentTarget.style.color='#ccc'; e.currentTarget.style.borderBottomColor='#444'; }}}
                  onMouseLeave={e=>{ if(!active){ e.currentTarget.style.color='#888'; e.currentTarget.style.borderBottomColor='transparent'; }}}
                >
                  {t.label}
                </button>
              );
            })}
          </nav>
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
