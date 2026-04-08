import { useState } from 'react';
import { C, FONT_UI, FONT_DISPLAY } from './tokens';
import ChampionshipReport from './pages/ChampionshipReport';
import Comparativo        from './pages/Comparativo';
import Setores            from './pages/Setores';
import NoShow             from './pages/NoShow';
import VisaoGeral         from './pages/VisaoGeral';
import Precos             from './pages/Precos';
import PL                from './pages/PL';

const TABS = [
  { id: 'visaogeral',   label: 'Dashboard Principal',  pageTitle: 'Dashboard de Performance',  subtitle: 'Visão geral de receita, público e tendências' },
  { id: 'championship', label: 'Championship Report',  pageTitle: 'Championship Report',        subtitle: 'Desempenho detalhado por campeonato e partida' },
  { id: 'comparativo',  label: 'Comparativo',          pageTitle: 'Análise Comparativa',        subtitle: 'Temporadas 2024 × 2025' },
  { id: 'setores',      label: 'Setores e Preços',     pageTitle: 'Setores de Arena',           subtitle: 'Ocupação, receita e preços por setor' },
  { id: 'noshow',       label: 'No Show',              pageTitle: 'Análise de No Show',         subtitle: 'Ausentismo por partida e perfil de torcedor' },
  { id: 'precos',       label: 'Matriz de Preços',     pageTitle: 'Matriz de Preços',           subtitle: 'Preços cruzados por adversário e tipo de torcedor' },
  { id: 'pl',           label: 'P&L',                  pageTitle: 'Profit & Loss',              subtitle: 'Receitas, custos e margem por partida' },
];

// Simple SVG icons
const Icons = {
  grid: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  trophy: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  ),
  barChart: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  map: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
      <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
    </svg>
  ),
  users: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  tag: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  dollar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
};

const TAB_ICONS = {
  visaogeral:   Icons.grid,
  championship: Icons.trophy,
  comparativo:  Icons.barChart,
  setores:      Icons.map,
  noshow:       Icons.users,
  precos:       Icons.tag,
  pl:           Icons.dollar,
};

export default function App() {
  const [tab, setTab] = useState('visaogeral');
  const current = TABS.find(t => t.id === tab);

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      background: C.surface, fontFamily: FONT_UI, color: C.onSurface,
    }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 272, flexShrink: 0,
        background: C.surfaceContainerLow,
        borderRight: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {/* Brand */}
        <div style={{ padding: '32px 24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
            <div style={{
              width: 40, height: 40, background: '#ffffff', borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <img src="/logos/Botafogo.png" alt="Botafogo"
                style={{ width: 36, height: 36, objectFit: 'contain' }} />
            </div>
            <h2 style={{
              fontFamily: FONT_DISPLAY, fontWeight: 700,
              letterSpacing: '-0.5px', fontSize: 17, lineHeight: 1.1,
            }}>
              ARENA<span style={{ color: 'rgba(255,255,255,0.3)' }}>BOTAFOGO</span>
            </h2>
          </div>

          {/* Navigation */}
          <nav>
            <p style={{
              fontSize: 10, textTransform: 'uppercase', letterSpacing: '2px',
              color: 'rgba(255,255,255,0.25)', fontWeight: 700,
              marginBottom: 12, paddingLeft: 16,
            }}>
              Menu Principal
            </p>
            {TABS.map(t => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 16px', borderRadius: 12, width: '100%',
                    background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                    border: active ? `1px solid rgba(255,255,255,0.1)` : '1px solid transparent',
                    color: active ? '#ffffff' : 'rgba(255,255,255,0.38)',
                    cursor: 'pointer', textAlign: 'left',
                    marginBottom: 2, transition: 'all 0.15s ease',
                    fontFamily: FONT_UI, fontSize: 13,
                    fontWeight: active ? 600 : 400,
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'rgba(255,255,255,0.38)'; e.currentTarget.style.background = 'transparent'; }}}
                >
                  {/* Active dot */}
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: active ? C.primaryContainer : 'transparent',
                    boxShadow: active ? `0 0 8px ${C.primaryContainer}` : 'none',
                    transition: 'all 0.15s',
                  }} />
                  {/* Icon */}
                  <span style={{ color: active ? C.primaryContainer : 'inherit', flexShrink: 0 }}>
                    {TAB_ICONS[t.id]}
                  </span>
                  {t.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom widgets */}
        <div style={{ marginTop: 'auto', padding: '16px 24px 24px' }}>
          {/* Progress widget */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05), transparent)',
            borderRadius: 16, padding: '14px 16px',
            border: `1px solid ${C.border}`, marginBottom: 16,
          }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>Meta de Público</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700 }}>82%</span>
              <span style={{ fontSize: 10, color: C.primaryContainer }}>Faltam 4k p/ jogo</span>
            </div>
            <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', height: 4, borderRadius: 9999, overflow: 'hidden' }}>
              <div style={{ width: '82%', height: '100%', background: C.primaryContainer, borderRadius: 9999 }} />
            </div>
          </div>

          {/* User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#1a1a1a', border: `1px solid ${C.border}`,
              flexShrink: 0,
            }} />
            <div>
              <p style={{ fontSize: 12, fontWeight: 700 }}>Admin Saf</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)' }}>Gestor Financeiro</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header (glassmorphism) */}
        <header style={{
          padding: '20px 32px',
          borderBottom: `1px solid ${C.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(5,5,5,0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          flexShrink: 0, zIndex: 10,
        }}>
          <div>
            <h1 style={{
              fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700,
              letterSpacing: '-0.5px', lineHeight: 1.2,
            }}>
              {current.pageTitle}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, fontStyle: 'italic', marginTop: 2 }}>
              {current.subtitle}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{
              padding: '9px 18px',
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid rgba(255,255,255,0.1)`,
              borderRadius: 12, color: 'rgba(255,255,255,0.7)',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
              fontFamily: FONT_UI, transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            >
              Comparar Temporadas
            </button>
            <button style={{
              padding: '9px 18px', borderRadius: 12, border: 'none',
              background: C.primaryGradient,
              color: '#000', fontSize: 12, fontWeight: 700,
              fontFamily: FONT_UI, cursor: 'pointer',
              boxShadow: `0 4px 16px rgba(197,160,89,0.25)`,
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(197,160,89,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(197,160,89,0.25)'; }}
            >
              Exportar Relatório
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          {tab === 'championship' && <ChampionshipReport />}
          {tab === 'comparativo'  && <Comparativo />}
          {tab === 'setores'      && <Setores />}
          {tab === 'noshow'       && <NoShow />}
          {tab === 'visaogeral'   && <VisaoGeral />}
          {tab === 'precos'       && <Precos />}
          {tab === 'pl'           && <PL />}
        </main>
      </div>
    </div>
  );
}
