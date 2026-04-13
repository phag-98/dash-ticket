import { useState } from 'react';
import { C, FONT, FONT_UI } from './tokens';
import ChampionshipReport from './pages/ChampionshipReport';
import Comparativo        from './pages/Comparativo';
import Setores            from './pages/Setores';
import NoShow             from './pages/NoShow';
import VisaoGeral         from './pages/VisaoGeral';
import Precos             from './pages/Precos';
import PL                from './pages/PL';

const TABS = [
  { id: 'championship', label: 'Championship Report' },
  { id: 'comparativo',  label: 'Comparativo' },
  { id: 'setores',      label: 'Setores' },
  { id: 'noshow',       label: 'No Show' },
  { id: 'visaogeral',   label: 'Visão Geral' },
  { id: 'precos',       label: 'Preços' },
  { id: 'pl',           label: 'P&L' },
];

export default function App() {
  const [tab, setTab] = useState('championship');

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:FONT_UI, color:C.t1 }}>

      {/* ── Header (sticky, logo spans both rows) ── */}
      <header style={{ position:'sticky', top:0, zIndex:100, display:'flex' }}>

        {/* Logo panel — spans full header height with diagonal right edge */}
        <div style={{
          background: '#0d0d0d',
          width: 86,
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          clipPath: 'polygon(0 0, 100% 0, calc(100% - 18px) 100%, 0 100%)',
          zIndex: 2,
          position: 'relative',
        }}>
          <img src="/logos/Botafogo.png" alt="Botafogo"
            style={{ height: 60, width: 'auto', objectFit: 'contain', position: 'relative', zIndex: 1 }} />
        </div>

        {/* Right side — two rows stacked */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Row 1 — Branding strip with stars */}
          <div style={{
            background: 'linear-gradient(90deg, #111 0%, #1a1a1a 50%, #111 100%)',
            borderBottom: '1px solid #2a2a2a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: 30, position: 'relative', overflow: 'hidden',
          }}>
            {[
              [4,40],[8,75],[12,20],[15,88],[18,55],[22,10],[25,65],[28,33],
              [32,80],[36,48],[40,15],[44,70],[48,38],[52,90],[56,25],[60,60],
              [64,8],[68,45],[72,82],[76,30],[80,68],[84,18],[88,52],[92,85],[96,42],
            ].map(([x, y], i) => {
              const size = [3,4,5,3,4,3,5,4,3,4,5,3,4,3,5,4,3,4,5,3,4,3,5,4,3][i];
              const op   = [0.5,0.7,0.4,0.8,0.5,0.6,0.9,0.4,0.7,0.5,0.6,0.8,0.4,0.7,0.5,0.6,0.9,0.4,0.7,0.5,0.6,0.8,0.4,0.7,0.6][i];
              return (
                <svg key={i} width={size} height={size} viewBox="0 0 24 24"
                  style={{ position:'absolute', left:`${x}%`, top:`${y}%`, transform:'translate(-50%,-50%)', opacity:op }}>
                  <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" fill="#ffffff"/>
                </svg>
              );
            })}
            <span style={{ fontSize:9, color:'#777', letterSpacing:'3px', textTransform:'uppercase', position:'relative', zIndex:1 }}>
              SAF &nbsp;·&nbsp; Dashboard
            </span>
          </div>

          {/* Row 2 — Navigation tabs */}
          <div style={{
            background: 'linear-gradient(180deg, #383838 0%, #2e2e2e 100%)',
            borderBottom: `3px solid ${C.accent}`,
            display: 'flex', alignItems: 'stretch',
            height: 56,
          }}>
            <nav style={{ display:'flex', gap:0, flex:1, overflowX:'auto', scrollbarWidth:'none', paddingLeft:4 }}>
              {TABS.map(t => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    style={{
                      padding: '0 16px', height: 56, border: 'none', cursor: 'pointer',
                      background: active ? `linear-gradient(180deg, transparent 60%, ${C.accent}18 100%)` : 'transparent',
                      color: active ? C.accent : '#999',
                      fontFamily: FONT_UI, fontSize: 11, fontWeight: active ? 800 : 500,
                      borderBottom: active ? `3px solid ${C.accent}` : '3px solid transparent',
                      borderTop: '3px solid transparent',
                      transition: 'all 0.15s ease',
                      letterSpacing: '1px', whiteSpace: 'nowrap', textTransform: 'uppercase',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.color='#ddd'; e.currentTarget.style.borderBottomColor='#666'; e.currentTarget.style.background=`${C.accent}0a`; }}}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.color='#999'; e.currentTarget.style.borderBottomColor='transparent'; e.currentTarget.style.background='transparent'; }}}
                  >
                    {t.label}
                  </button>
                );
              })}
            </nav>
          </div>
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
        {tab === 'pl'           && <PL />}
      </main>
    </div>
  );
}
