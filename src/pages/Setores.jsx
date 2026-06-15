import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, Treemap,
} from 'recharts';
import { C, SHADOW, CAMP_COLORS as TOKEN_CAMP_COLORS } from '../tokens';
import { COMP_LOGOS, LOGO_MAP, TEAM_COLORS } from '../teamData';
import { useIsMobile } from '../hooks/useMediaQuery';
import {
  faturamentoPorSetor, faturamentoPorPartida,
  faturamentoPorAdversario, partidas, ingressos,
} from '../data/data';

// Setor ID → name map
const setorNameMap = Object.fromEntries(faturamentoPorSetor.map(s => [s.idSetor, s.setor]));

// Pre-compute per-partida unitário by setor (paying tickets only)
const unitarioByPartida = (() => {
  const map = {};
  ingressos.forEach(r => {
    if (!r.idPartida || !r.unitario || r.unitario <= 0) return;
    const setor = setorNameMap[r.idSetor];
    if (!setor) return;
    if (!map[r.idPartida]) map[r.idPartida] = {};
    if (!map[r.idPartida][setor]) map[r.idPartida][setor] = { total: 0, count: 0 };
    map[r.idPartida][setor].total += r.unitario * (r.publico || 0);
    map[r.idPartida][setor].count += (r.publico || 0);
  });
  return map;
})();

const fmtM = v => {
  if (!v && v !== 0) return '—';
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1).replace('.', ',')} Mi`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)} Mil`;
  return `R$ ${v}`;
};

const MONTH_NAMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const CAMP_NAMES  = [...new Set(partidas.map(p => p.campeonato).filter(Boolean))].sort();
const CAMP_COLORS = { ...TOKEN_CAMP_COLORS, 'Sulamericana': C.amber, 'Supermundial': C.green, 'Mundial': C.lib, 'Supercopa': C.t3 };

const ALL_SETORS = faturamentoPorSetor.map(s => s.setor);
const SETOR_PALETTE = [
  '#FFD700','#94a3b8','#00bcd4','#87ceeb','#6b7280','#b0b0c0','#6366f1',
  '#f97316','#84cc16','#e879f9','#fbbf24','#34d399','#64748b','#f43f5e',
];
const getSetorColor = nome => SETOR_PALETTE[ALL_SETORS.indexOf(nome) % SETOR_PALETTE.length] || '#555566';

const sectionTitle = { fontSize: 10, fontWeight: 700, color: C.t2, textTransform: 'uppercase', letterSpacing: '1.5px' };

function FilterBtn({ label, active, onClick, color }) {
  const bg = active ? (color || C.accent) : C.card;
  const col = active ? '#000' : C.t2;
  const border = active ? (color || C.accent) : C.border;
  const logo = COMP_LOGOS[label];
  return (
    <button onClick={onClick} style={{
      padding: '4px 14px', borderRadius: 20, border: `1px solid ${border}`,
      background: bg, color: col, fontSize: 10, fontWeight: active ? 700 : 500,
      cursor: 'pointer', letterSpacing: '0.5px', whiteSpace: 'nowrap',
      transition: 'all 0.12s ease', fontFamily: 'inherit',
      display: 'flex', alignItems: 'center', gap: 5,
    }}>
      {logo && <img src={`/logos/${logo}`} style={{ width: 16, height: 16, objectFit: 'contain' }} />}
      {label}
    </button>
  );
}

function Card({ children, title, style = {} }) {
  return (
    <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, boxShadow: SHADOW.card, ...style }}>
      {title && <div style={{ padding: '12px 16px 0', ...sectionTitle, marginBottom: 4 }}>{title}</div>}
      {children}
    </div>
  );
}

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const title = label?.includes('|') ? label.replace('|', ' · ') : label;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', fontSize: 11, boxShadow: SHADOW.md }}>
      <p style={{ fontWeight: 700, color: C.t1, marginBottom: 4 }}>{title}</p>
      {payload.filter(p => p.value != null).map((p, i) => (
        <p key={i} style={{ color: p.stroke || p.fill || C.t2, margin: '2px 0' }}>
          <span style={{ color: C.t3 }}>{p.name}: </span>
          <span style={{ fontWeight: 600 }}>{typeof p.value === 'number' ? fmtM(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

// Treemap content with team name + value
const TREEMAP_COLORS = ['#C9A84C','#a08030','#7a6020','#556b00','#cc5522','#6699cc','#4477aa','#88aadd','#e879f9','#fbbf24','#34d399','#64748b','#f43f5e','#a78bfa','#4ade80','#60a5fa','#fb923c'];
const TreeContent = ({ x, y, width, height, name, value, index }) => {
  if (!width || !height || width < 20 || height < 20) return null;
  const fill = TREEMAP_COLORS[index % TREEMAP_COLORS.length];
  const logo = LOGO_MAP[name];
  const logoSize = Math.min(width - 8, height - 20, 28);
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} stroke="#fff" strokeWidth={1} rx={2} />
      {logo && logoSize >= 14 && (
        <image href={`/logos/${logo}`} x={x + 4} y={y + 4} width={logoSize} height={logoSize} style={{ objectFit: 'contain' }} />
      )}
      {width > 50 && height > 32 && (
        <text x={x + 6} y={y + height - 14} fill="#fff" fontSize={8} fontWeight={700}>{name}</text>
      )}
      {width > 50 && height > 44 && (
        <text x={x + 6} y={y + height - 4} fill="#ffffff99" fontSize={7}>{fmtM(value)}</text>
      )}
    </g>
  );
};

// XAxis tick with team logo (for bottom line chart)
function TeamXTick({ x, y, payload }) {
  const name = (payload.value || '').split('|')[0];
  const logoFile = LOGO_MAP[name];
  const bg = TEAM_COLORS[name] || '#888';
  const initials = name.split(' ').filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join('').toUpperCase() || name.slice(0, 2).toUpperCase();
  const size = 18;
  return (
    <g transform={`translate(${x},${y + 4})`}>
      {logoFile
        ? <image href={`/logos/${logoFile}`} x={-size / 2} y={0} width={size} height={size} />
        : <foreignObject x={-size / 2} y={0} width={size} height={size}>
            <div style={{ width: size, height: size, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6, fontWeight: 800, color: '#fff' }}>{initials}</div>
          </foreignObject>
      }
    </g>
  );
}

export default function Setores() {
  const isMobile = useIsMobile();
  const [ano, setAno]         = useState('Todos');
  const [campeonato, setCamp] = useState('Todos');

  // Two lines per year
  const mesData = useMemo(() => {
    const base = faturamentoPorPartida.filter(p => campeonato === 'Todos' || p.campeonato === campeonato);
    const m24 = {}, m25 = {};
    base.forEach(p => {
      const m = MONTH_NAMES[(p.mes || 1) - 1];
      if (p.ano === 2024) m24[m] = (m24[m] || 0) + p.faturamento;
      if (p.ano === 2025) m25[m] = (m25[m] || 0) + p.faturamento;
    });
    return MONTH_NAMES.map(m => ({ mes: m, '2024': m24[m] || null, '2025': m25[m] || null }));
  }, [campeonato]);


  const filteredUnitario = useMemo(() => {
    return partidas
      .filter(p => {
        if (campeonato !== 'Todos' && p.campeonato !== campeonato) return false;
        if (ano !== 'Todos' && String(p.ano) !== ano) return false;
        return true;
      })
      .sort((a, b) => (a.data || '').split('/').reverse().join('-').localeCompare((b.data || '').split('/').reverse().join('-')))
      .map(p => {
        const setorData = unitarioByPartida[p.id] || {};
        const row = { time: p.time, label: `${p.time}|${p.rodada}` };
        Object.entries(setorData).forEach(([setor, { total, count }]) => {
          row[setor] = count > 0 ? Math.round(total / count * 100) / 100 : null;
        });
        return row;
      });
  }, [campeonato, ano]);

  const setorKeysUnit = useMemo(() => {
    const keys = new Set();
    filteredUnitario.forEach(row => Object.keys(row).forEach(k => {
      if (k !== 'time' && k !== 'label' && row[k] != null) keys.add(k);
    }));
    return [...keys];
  }, [filteredUnitario]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Filters */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 16px', boxShadow: SHADOW.card, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={sectionTitle}>Ano</span>
        {['Todos', '2024', '2025'].map(y => (
          <FilterBtn key={y} label={y} active={ano === y} onClick={() => setAno(y)} />
        ))}
        <div style={{ width: 1, height: 18, background: C.border, margin: '0 4px' }} />
        <span style={sectionTitle}>Campeonato</span>
        <FilterBtn label="Todos" active={campeonato === 'Todos'} onClick={() => setCamp('Todos')} />
        {CAMP_NAMES.map(c => (
          <FilterBtn key={c} label={c} active={campeonato === c} onClick={() => setCamp(c)} color={CAMP_COLORS[c]} />
        ))}
      </div>

      {/* Setor table + right charts */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '440px 1fr', gap: 14 }}>

        <Card title="Resumo por Setor">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
              <thead>
                <tr style={{ background: C.bgAlt }}>
                  {['ID', 'Setor', 'Faturamento', 'Público', 'Ticket M.', 'Méd. Pub.', '% Ocup.'].map(h => (
                    <th key={h} style={{ padding: '7px 8px', textAlign: h === 'Setor' || h === 'ID' ? 'left' : 'right', fontSize: 8, fontWeight: 700, color: C.t3, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {faturamentoPorSetor.map((s, i) => (
                  <tr key={s.idSetor} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? 'transparent' : C.bgAlt + '44' }}>
                    <td style={{ padding: '6px 8px', color: C.t3, fontSize: 9, fontFamily: 'monospace' }}>{s.idSetor}</td>
                    <td style={{ padding: '6px 8px', color: C.t1, fontWeight: 500 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: getSetorColor(s.setor), flexShrink: 0, display: 'inline-block' }} />
                        {s.setor}
                      </span>
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: C.accent, fontWeight: 600, fontSize: 9 }}>{fmtM(s.faturamento)}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: C.t1, fontSize: 9 }}>{s.publico.toLocaleString('pt-BR')}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: C.t2, fontSize: 9 }}>{s.ticketMedio > 0 ? `R$ ${s.ticketMedio.toFixed(2)}` : '—'}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: C.t2, fontSize: 9 }}>{s.mediaPublico > 0 ? s.mediaPublico.toFixed(0) : '—'}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: 9 }}>
                      <span style={{ color: s.taxaOcupacao >= 70 ? C.green : s.taxaOcupacao >= 50 ? C.amber : C.red, fontWeight: 700 }}>{s.taxaOcupacao.toFixed(1)}%</span>
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: `2px solid ${C.border}`, background: C.bgAlt }}>
                  <td colSpan={2} style={{ padding: '6px 8px', fontWeight: 700, color: C.t1 }}>Total</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', color: C.accent, fontWeight: 800 }}>{fmtM(faturamentoPorSetor.reduce((s, x) => s + x.faturamento, 0))}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', color: C.t1, fontWeight: 700 }}>{faturamentoPorSetor.reduce((s, x) => s + x.publico, 0).toLocaleString('pt-BR')}</td>
                  <td colSpan={3} />
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Faturamento por mês — 2 linhas */}
          <Card title="Soma de FATURAMENTO por Mês">
            <div style={{ padding: '4px 16px 0', display: 'flex', gap: 16 }}>
              {(ano === 'Todos' || ano === '2024') && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: C.t2 }}><span style={{ width: 16, height: 2, background: '#888', display: 'inline-block' }} />2024</span>}
              {(ano === 'Todos' || ano === '2025') && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: C.t2 }}><span style={{ width: 16, height: 2, background: C.accent, display: 'inline-block' }} />2025</span>}
            </div>
            <ResponsiveContainer width="100%" height={170}>
              <LineChart data={mesData} margin={{ top: 8, right: 16, bottom: 8, left: 10 }}>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1_000_000).toFixed(1)}M`} />
                <RTooltip content={<DarkTooltip />} />
                {(ano === 'Todos' || ano === '2024') && <Line type="monotone" dataKey="2024" name="2024" stroke="#888" strokeWidth={2} dot={{ fill: '#888', r: 2 }} connectNulls />}
                {(ano === 'Todos' || ano === '2025') && <Line type="monotone" dataKey="2025" name="2025" stroke={C.accent} strokeWidth={2.5} dot={{ fill: C.accent, r: 3 }} connectNulls />}
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Faturamento por adversário — treemap com escudos */}
          <Card title="Faturamento por Adversário (Time)">
            <ResponsiveContainer width="100%" height={220}>
              <Treemap
                data={faturamentoPorAdversario.slice(0, 20).map(a => ({ name: a.time || a.idTime, value: a.faturamento }))}
                dataKey="value"
                content={<TreeContent />}
              >
                <RTooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  return (
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', fontSize: 11 }}>
                      <p style={{ fontWeight: 700, color: C.t1 }}>{d.name}</p>
                      <p style={{ color: C.accent }}>{fmtM(d.value)}</p>
                    </div>
                  );
                }} />
              </Treemap>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Unitário por time e setor */}
      <Card title="Soma de UNITÁRIO por TIME e SETOR">
        <div style={{ padding: '8px 16px 0', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {setorKeysUnit.map(s => (
            <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: C.t2 }}>
              <span style={{ width: 16, height: 2, background: getSetorColor(s), display: 'inline-block' }} />
              {s}
            </span>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={filteredUnitario} margin={{ top: 8, right: 16, bottom: 36, left: 10 }}>
            <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={<TeamXTick />} axisLine={false} tickLine={false} height={30} interval={0} />
            <YAxis tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} />
            <RTooltip content={<DarkTooltip />} />
            {setorKeysUnit.map(s => (
              <Line key={s} type="monotone" dataKey={s} stroke={getSetorColor(s)} strokeWidth={1.5} dot={{ r: 2, fill: getSetorColor(s) }} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>

    </div>
  );
}
