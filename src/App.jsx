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

      {/* ── Header (2 rows, sticky) ── */}
      <header style={{ position:'sticky', top:0, zIndex:100 }}>

        {/* Row 1 — Branding strip with stars */}
        <div style={{
          background:'#111111',
          borderBottom:'1px solid #2a2a2a',
          display:'flex', alignItems:'center', justifyContent:'center',
          height:30, position:'relative', overflow:'hidden',
        }}>
          {/* Scattered stars */}
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
          {/* Text centered */}
          <span style={{ fontSize:9, color:'#888', letterSpacing:'3px', textTransform:'uppercase', position:'relative', zIndex:1 }}>
            SAF &nbsp;·&nbsp; Dashboard
          </span>
        </div>

        {/* Row 2 — Navigation */}
        <div style={{
          background:'#4a4a4a',
          borderBottom:`2px solid #3a3a3a`,
          display:'flex', alignItems:'center',
          padding:'0 24px', height:48,
        }}>
          {/* Logo mark */}
          <div style={{ display:'flex', alignItems:'center', marginRight:28, flexShrink:0, borderRight:'1px solid #555', paddingRight:28 }}>
            <img src="/logos/Botafogo.png" alt="Botafogo" style={{ height:36, width:'auto', objectFit:'contain' }} />
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
                    padding:'0 10px', height:48, border:'none', cursor:'pointer',
                    background:'transparent',
                    color: active ? '#ffffff' : '#888',
                    fontFamily:FONT_UI, fontSize:10, fontWeight: active ? 700 : 400,
                    borderBottom: active ? `3px solid ${C.accent}` : '3px solid transparent',
                    borderTop: '3px solid transparent',
                    transition:'all 0.15s ease',
                    letterSpacing:'0.5px', whiteSpace:'nowrap', textTransform:'uppercase',
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
        {tab === 'pl'           && <PL />}
      </main>
    </div>
  );
}
