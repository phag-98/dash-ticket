import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, Treemap,
} from 'recharts';
import { C, FONT, SHADOW, CAMP_COLORS as TOKEN_CAMP_COLORS } from '../tokens';
import { COMP_LOGOS } from '../teamLogos.jsx';
import {
  faturamentoPorSetor, faturamentoPorMes, unitarioPorTimeESetor,
  faturamentoPorAdversario, partidas,
} from '../data/data';

const fmtM = v => {
  if (!v && v !== 0) return '—';
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1).replace('.', ',')} Mi`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)} Mil`;
  return `R$ ${v}`;
};

// Unique campeonato names
const CAMP_NAMES = [...new Set(partidas.map(p => p.campeonato).filter(Boolean))].sort();

// Camp colors — use design tokens
const CAMP_COLORS = {
  ...TOKEN_CAMP_COLORS,
  'Sulamericana':   C.amber,
  'Supermundial':   C.green,
  'Mundial':        C.lib,
  'Supercopa':      C.t3,
};

// ── Consistent filter button
function FilterBtn({ label, active, onClick, color }) {
  const bg     = active ? (color || C.accent) : C.card;
  const col    = active ? '#000' : C.t2;
  const border = active ? (color || C.accent) : C.border;
  const logo   = COMP_LOGOS[label];
  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 14px', borderRadius: 20, border: `1px solid ${border}`,
        background: bg, color: col,
        fontSize: 10, fontWeight: active ? 700 : 500, cursor: 'pointer',
        letterSpacing: '0.5px', whiteSpace: 'nowrap', transition: 'all 0.12s ease',
        fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5,
      }}
    >
      {logo && <img src={`/logos/${logo}`} style={{ width: 16, height: 16, objectFit: 'contain' }} />}
      {label}
    </button>
  );
}

// ── Section title style
const sectionTitle = {
  fontSize: 10, fontWeight: 700, color: C.t2,
  textTransform: 'uppercase', letterSpacing: '1.5px',
};

// All unique setor names from faturamentoPorSetor
const ALL_SETORS = faturamentoPorSetor.map(s => s.setor);

const SETOR_PALETTE = [
  '#FFD700','#94a3b8','#00bcd4','#87ceeb','#6b7280','#b0b0c0','#6366f1',
  '#f97316','#84cc16','#e879f9','#fbbf24','#34d399','#64748b','#f43f5e',
  '#a78bfa','#4ade80','#60a5fa','#f87171','#fb923c','#38bdf8','#d946ef','#2dd4bf',
];
const getSetorColor = (nome) => {
  const idx = ALL_SETORS.indexOf(nome);
  return SETOR_PALETTE[idx % SETOR_PALETTE.length] || '#555566';
};

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
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', fontSize: 11, boxShadow: SHADOW.md }}>
      <p style={{ fontWeight: 700, color: C.t1, marginBottom: 4 }}>{label}</p>
      {payload.filter(p => p.value != null).map((p, i) => (
        <p key={i} style={{ color: p.stroke || C.t2, margin: '2px 0' }}>
          <span style={{ color: C.t3 }}>{p.name}: </span>
          <span style={{ fontWeight: 600 }}>{typeof p.value === 'number' ? p.value.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

// Treemap custom content
const TREEMAP_COLORS = ['#C8F400','#a0c000','#7a9600','#556b00','#ff6b35','#cc5522','#6699cc','#4477aa','#88aadd','#e879f9','#fbbf24','#34d399','#64748b','#f43f5e','#a78bfa','#4ade80','#60a5fa'];
const TreeContent = ({ x, y, width, height, name, value, index }) => {
  if (!width || !height || width < 20 || height < 20) return null;
  const fill = TREEMAP_COLORS[index % TREEMAP_COLORS.length];
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} stroke={C.bg} strokeWidth={1} rx={2} />
      {width > 50 && height > 30 && (
        <>
          <text x={x + 6} y={y + 14} fill="#000" fontSize={9} fontWeight={700}>{name}</text>
          {height > 44 && <text x={x + 6} y={y + 26} fill="#00000099" fontSize={8}>{fmtM(value)}</text>}
        </>
      )}
    </g>
  );
};

export default function Setores() {
  const [ano, setAno]         = useState('Todos');
  const [campeonato, setCamp] = useState('Todos');

  // Filter faturamentoPorMes (we only have global — show all)
  const mesData = faturamentoPorMes;

  // Filter unitarioPorTimeESetor based on partidas that match filter
  const filteredPartidaIds = useMemo(() => {
    return new Set(partidas.filter(p => {
      if (ano !== 'Todos' && String(p.ano) !== ano) return false;
      if (campeonato !== 'Todos' && p.campeonato !== campeonato) return false;
      return true;
    }).map(p => p.id));
  }, [ano, campeonato]);

  // Setor names present in unitario data
  const setorKeysUnit = useMemo(() => {
    const keys = new Set();
    unitarioPorTimeESetor.forEach(row => {
      Object.keys(row).forEach(k => {
        if (k !== 'idTime' && k !== 'time' && row[k] != null) keys.add(k);
      });
    });
    return [...keys];
  }, []);

  const treemapData = faturamentoPorAdversario.slice(0, 20).map(a => ({ name: a.time || a.idTime, value: a.faturamento }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Filters */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 10, padding: '10px 16px', boxShadow: SHADOW.card,
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
      }}>
        <span style={sectionTitle}>Ano</span>
        {['Todos', '2024', '2025'].map(y => (
          <FilterBtn key={y} label={y} active={ano === y} onClick={() => setAno(y)} />
        ))}
        <div style={{ width: 1, height: 18, background: C.border, margin: '0 4px' }} />
        <span style={sectionTitle}>Campeonato</span>
        <FilterBtn label="Todos" active={campeonato === 'Todos'} onClick={() => setCamp('Todos')} />
        {CAMP_NAMES.map(c => (
          <FilterBtn
            key={c}
            label={c}
            active={campeonato === c}
            onClick={() => setCamp(c)}
            color={CAMP_COLORS[c]}
          />
        ))}
      </div>

      {/* Setor table + charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', gap: 14 }}>

        {/* Setor summary table */}
        <Card title="Resumo por Setor">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
              <thead>
                <tr style={{ background: C.bgAlt }}>
                  {['ID', 'Setor', 'Faturamento', 'Público', 'Ticket M.', 'Méd. Pub.', '% Ocup.'].map(h => (
                    <th key={h} style={{ padding: '7px 8px', textAlign: h === 'Setor' || h === 'ID' ? 'left' : 'right', fontSize: 8, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>{h}</th>
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
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: C.accent, fontWeight: 600, fontVariantNumeric: 'tabular-nums', fontSize: 9 }}>
                      {fmtM(s.faturamento)}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: C.t1, fontVariantNumeric: 'tabular-nums', fontSize: 9 }}>{s.publico.toLocaleString('pt-BR')}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: C.t2, fontVariantNumeric: 'tabular-nums', fontSize: 9 }}>
                      {s.ticketMedio > 0 ? `R$ ${s.ticketMedio.toFixed(2)}` : '—'}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: C.t2, fontVariantNumeric: 'tabular-nums', fontSize: 9 }}>{s.mediaPublico > 0 ? s.mediaPublico.toFixed(0) : '—'}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: 9 }}>
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

        {/* Right: line + treemap */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Faturamento por mês */}
          <Card title="Soma de FATURAMENTO por Mês">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={mesData} margin={{ top: 12, right: 16, bottom: 8, left: 10 }}>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1_000_000).toFixed(1)}M`} />
                <RTooltip content={<DarkTooltip />} />
                <Line type="monotone" dataKey="faturamento" name="Faturamento" stroke={C.accent} strokeWidth={2.5} dot={{ fill: C.accent, r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Treemap faturamento por adversário */}
          <Card title="Faturamento por Adversário (Time)">
            <ResponsiveContainer width="100%" height={220}>
              <Treemap data={treemapData} dataKey="value" content={<TreeContent />}>
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
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={unitarioPorTimeESetor} margin={{ top: 8, right: 16, bottom: 80, left: 10 }}>
            <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: C.t3, fontSize: 7 }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={90} interval={0} />
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
