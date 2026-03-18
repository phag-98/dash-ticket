import { useState } from 'react';
import {
  LayoutDashboard, BarChart2, Target, TrendingUp,
  Landmark, Bell, Settings, ChevronRight,
} from 'lucide-react';
import { C, FONT, SHADOW } from './tokens';
import VisaoGeral from './pages/VisaoGeral';

const NAV_ITEMS = [
  { id: 'visao-geral',  label: 'Visão Geral',    Icon: LayoutDashboard, active: true },
  { id: 'dre',          label: 'DRE',             Icon: BarChart2,        active: false },
  { id: 'budget',       label: 'Budget',          Icon: Target,           active: false },
  { id: 'forecast',     label: 'Forecast',        Icon: TrendingUp,       active: false },
  { id: 'caixa',        label: 'Fluxo de Caixa',  Icon: Landmark,         active: false },
  { id: 'alertas',      label: 'Alertas',         Icon: Bell,             active: false, badge: 2 },
];

const COMING_SOON = (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, flexDirection: 'column', gap: 12 }}>
    <div style={{ fontSize: 40 }}>🚧</div>
    <div style={{ fontSize: 18, fontWeight: 700, color: C.t1 }}>Em desenvolvimento</div>
    <div style={{ fontSize: 13, color: C.t3 }}>Esta seção estará disponível na próxima sprint</div>
  </div>
);

export default function App() {
  const [active, setActive] = useState('visao-geral');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: FONT, background: C.bg }}>

      {/* ── Sidebar ─── */}
      <aside style={{
        width: sidebarCollapsed ? 64 : 220,
        background: C.navy,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowX: 'hidden',
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 16px',
          borderBottom: `1px solid ${C.navyMid}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: C.blue,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <BarChart2 size={16} color="#fff" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>FinDash</div>
              <div style={{ fontSize: 9, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Grupo Meridian</div>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(({ id, label, Icon, badge }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => setActive(id)}
                title={sidebarCollapsed ? label : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: sidebarCollapsed ? '10px 16px' : '10px 12px',
                  borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: isActive ? C.blue : 'transparent',
                  color: isActive ? '#fff' : '#94A3B8',
                  fontFamily: FONT,
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 13,
                  transition: 'all 0.15s ease',
                  width: '100%',
                  textAlign: 'left',
                  position: 'relative',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.navyMid; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={16} style={{ flexShrink: 0 }} />
                {!sidebarCollapsed && <span style={{ flex: 1 }}>{label}</span>}
                {!sidebarCollapsed && badge && (
                  <span style={{
                    background: C.red, color: '#fff',
                    borderRadius: 10, fontSize: 9, fontWeight: 700,
                    padding: '1px 5px', minWidth: 16, textAlign: 'center',
                  }}>{badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle + Settings */}
        <div style={{ padding: '12px 8px', borderTop: `1px solid ${C.navyMid}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button
            onClick={() => setActive('settings')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8,
              border: 'none', cursor: 'pointer',
              background: 'transparent', color: '#94A3B8',
              fontFamily: FONT, fontWeight: 500, fontSize: 13,
              width: '100%', whiteSpace: 'nowrap',
            }}
          >
            <Settings size={16} />
            {!sidebarCollapsed && 'Configurações'}
          </button>
          <button
            onClick={() => setSidebarCollapsed(c => !c)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-end',
              padding: '8px 12px', borderRadius: 8,
              border: 'none', cursor: 'pointer',
              background: 'transparent', color: '#64748B',
              fontFamily: FONT, fontSize: 11, gap: 4,
              width: '100%',
            }}
          >
            <ChevronRight size={14} style={{ transform: sidebarCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }} />
            {!sidebarCollapsed && <span>Recolher</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ─── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top bar */}
        <header style={{
          background: C.card,
          borderBottom: `1px solid ${C.border}`,
          padding: '0 28px',
          height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 1px 0 #E2E8F0',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.t1 }}>
              {NAV_ITEMS.find(n => n.id === active)?.label ?? 'Dashboard'}
            </span>
            <span style={{ fontSize: 11, color: C.t3, marginLeft: 8 }}>
              Grupo Meridian S.A. · Consolidado
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Period selector */}
            <select style={{
              border: `1px solid ${C.border}`, borderRadius: 6,
              padding: '6px 12px', fontSize: 11, fontWeight: 600,
              color: C.t1, background: C.card, cursor: 'pointer',
              fontFamily: FONT,
            }}>
              <option>Jan–Jun 2025</option>
              <option>Jan–Dez 2025</option>
              <option>2024 (Ano Completo)</option>
            </select>

            {/* Currency */}
            <select style={{
              border: `1px solid ${C.border}`, borderRadius: 6,
              padding: '6px 10px', fontSize: 11, fontWeight: 600,
              color: C.t1, background: C.card, cursor: 'pointer',
              fontFamily: FONT,
            }}>
              <option>BRL</option>
              <option>USD</option>
            </select>

            {/* Avatar */}
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>CF</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ padding: '24px 28px', flex: 1 }}>
          {active === 'visao-geral' ? <VisaoGeral /> : COMING_SOON}
        </main>
      </div>
    </div>
  );
}
