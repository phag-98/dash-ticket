import { useState, useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, ReferenceLine,
  LineChart, Line, BarChart, Bar, Cell,
} from 'recharts';
import { C, FONT, SHADOW } from '../tokens';
import {
  precosPorTimeETorcedor, torcedorCols, faturamentoPorPartida,
  unitarioPorTimeESetor, partidas, kpis,
} from '../data/data';

const fmtR = v => {
  if (!v && v !== 0) return '—';
  return `R$ ${Number(v).toFixed(2).replace('.', ',')}`;
};
const fmtK = v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`;

const CAMP_COLORS = {
  'Brasileirão':    '#4ade80',
  'Carioca':        '#f87171',
  'Copa do Brasil': '#60a5fa',
  'Libertadores':   '#a78bfa',
  'Recopa':         '#fb923c',
  'Sulamericana':   '#fbbf24',
  'Supermundial':   '#34d399',
  'Mundial':        '#e879f9',
  'Supercopa':      '#64748b',
};

const SETOR_PALETTE = [
  '#FFD700','#94a3b8','#00bcd4','#87ceeb','#6b7280','#b0b0c0','#6366f1',
  '#f97316','#84cc16','#e879f9','#fbbf24','#34d399','#64748b','#f43f5e',
];

const CAMP_NAMES = [...new Set(partidas.map(p => p.campeonato).filter(Boolean))].sort();

function Card({ children, title, style = {} }) {
  return (
    <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, boxShadow: SHADOW.card, ...style }}>
      {title && <div style={{ padding: '12px 16px 4px', fontSize: 11, fontWeight: 700, color: C.t1 }}>{title}</div>}
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
        <p key={i} style={{ color: p.stroke || p.fill || C.t2, margin: '2px 0' }}>
          <span style={{ color: C.t3 }}>{p.name}: </span>
          <span style={{ fontWeight: 600 }}>R$ {Number(p.value).toFixed(2)}</span>
        </p>
      ))}
    </div>
  );
};

export default function Precos() {
  const [campFilter, setCampFilter] = useState(null);

  // Filter precosPorTimeETorcedor based on partidas in selected campeonato
  const timesInCamp = useMemo(() => {
    if (!campFilter) return null;
    return new Set(partidas.filter(p => p.campeonato === campFilter).map(p => p.idTime));
  }, [campFilter]);

  const filteredPrecos = useMemo(() => {
    if (!timesInCamp) return precosPorTimeETorcedor;
    return precosPorTimeETorcedor.filter(r => timesInCamp.has(r.idTime));
  }, [timesInCamp]);

  // Scatter: faturamento por partida, x=utilizados, y=ticketMedio
  const scatterGroups = useMemo(() => {
    return CAMP_NAMES.map(c => ({
      campeonato: c,
      data: faturamentoPorPartida.filter(p => !campFilter || p.campeonato === campFilter)
        .filter(p => p.campeonato === c)
        .map(p => ({ ...p, x: p.utilizados, y: p.ticketMedio })),
      fill: CAMP_COLORS[c] || '#888',
    })).filter(g => g.data.length > 0);
  }, [campFilter]);

  // Setor keys from unitarioPorTimeESetor
  const setorKeysUnit = useMemo(() => {
    const keys = new Set();
    unitarioPorTimeESetor.forEach(row => {
      Object.keys(row).forEach(k => {
        if (k !== 'idTime' && k !== 'time' && row[k] != null) keys.add(k);
      });
    });
    return [...keys];
  }, []);

  // Ticket médio by campeonato
  const campSummary = useMemo(() => {
    return CAMP_NAMES.map(c => {
      const rows = faturamentoPorPartida.filter(p => p.campeonato === c);
      if (!rows.length) return null;
      const fat = rows.reduce((s, p) => s + p.faturamento, 0);
      const util = rows.reduce((s, p) => s + p.utilizados, 0);
      return { campeonato: c, ticketMedio: util > 0 ? fat / util : 0, nJogos: rows.length };
    }).filter(Boolean);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => setCampFilter(null)} style={{
          padding: '5px 14px', borderRadius: 6, border: `1px solid ${C.border}`,
          background: !campFilter ? C.accent : C.card, color: !campFilter ? '#000' : C.t2,
          fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: FONT,
        }}>Todos</button>
        {CAMP_NAMES.map(c => (
          <button key={c} onClick={() => setCampFilter(campFilter === c ? null : c)} style={{
            padding: '5px 14px', borderRadius: 6, border: `1px solid ${C.border}`,
            background: campFilter === c ? (CAMP_COLORS[c] || C.accent) : C.card,
            color: campFilter === c ? '#000' : C.t2,
            fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: FONT,
          }}>{c}</button>
        ))}
      </div>

      {/* Row 1: Jogos count + Scatter */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 14 }}>

        {/* Número de jogos + ticket por camp */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Card>
            <div style={{ padding: '20px 20px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.t2, textTransform: 'uppercase', marginBottom: 4 }}>Número de Jogos</div>
              <div style={{ fontSize: 52, fontWeight: 900, color: C.accent, lineHeight: 1 }}>{partidas.length}</div>
            </div>
          </Card>

          <Card title="Ticket Médio por Campeonato">
            <div style={{ padding: '4px 0 8px' }}>
              {campSummary.map((r, i) => (
                <div key={r.campeonato} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 14px', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 10, color: C.t1 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: CAMP_COLORS[r.campeonato] || C.t3, display: 'inline-block', marginRight: 5 }} />
                    {r.campeonato}
                  </span>
                  <span style={{ fontSize: 10, color: C.accent, fontWeight: 700 }}>R$ {r.ticketMedio.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Scatter: Público vs Ticket Médio */}
        <Card title="Público e Ticket Médio por Partida">
          <div style={{ padding: '4px 16px 8px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {scatterGroups.map(g => (
              <span key={g.campeonato} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: C.t2 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: g.fill, display: 'inline-block' }} />
                {g.campeonato}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 8, right: 24, bottom: 20, left: 16 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
              <XAxis type="number" dataKey="x" name="Utilizados" tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={fmtK}
                label={{ value: 'Público', position: 'insideBottom', fill: C.t3, fontSize: 9, offset: -8 }} />
              <YAxis type="number" dataKey="y" name="Ticket Médio" tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false}
                label={{ value: 'Ticket Médio', angle: -90, position: 'insideLeft', fill: C.t3, fontSize: 9, dx: -4 }} />
              <RTooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', fontSize: 11 }}>
                    <p style={{ fontWeight: 700, color: C.t1 }}>{d.time}</p>
                    <p style={{ color: C.t2 }}>Público: <b style={{ color: C.t1 }}>{d.utilizados?.toLocaleString('pt-BR')}</b></p>
                    <p style={{ color: C.accent }}>TM: R$ {d.ticketMedio?.toFixed(2)}</p>
                  </div>
                );
              }} />
              {scatterGroups.map(g => (
                <Scatter key={g.campeonato} name={g.campeonato} data={g.data} fill={g.fill} opacity={0.8} r={5} />
              ))}
              <ReferenceLine y={kpis.ticketMedio} stroke={C.t3} strokeDasharray="4 2" />
            </ScatterChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Matrix table: TIME x TORCEDOR */}
      <Card title="Preço Médio por Time e Tipo de Torcedor">
        <div style={{ overflowX: 'auto', padding: '8px 0 8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
            <thead>
              <tr style={{ background: C.bgAlt, position: 'sticky', top: 0 }}>
                <th style={{ padding: '7px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: C.t3, textTransform: 'uppercase', whiteSpace: 'nowrap', minWidth: 120 }}>Time</th>
                {torcedorCols.map(col => (
                  <th key={col} style={{ padding: '7px 8px', textAlign: 'right', fontSize: 8, fontWeight: 700, color: C.t3, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPrecos.map((r, i) => (
                <tr key={r.idTime} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? 'transparent' : C.bgAlt + '44' }}>
                  <td style={{ padding: '5px 12px', color: C.t1, fontWeight: 500, whiteSpace: 'nowrap', fontSize: 10 }}>{r.time}</td>
                  {torcedorCols.map(col => {
                    const v = r[col];
                    return (
                      <td key={col} style={{ padding: '5px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {v != null ? (
                          <span style={{ color: v > 100 ? C.accent : v > 50 ? C.green : v > 0 ? C.t2 : C.t3, fontWeight: v > 100 ? 700 : 400 }}>
                            R$ {Number(v).toFixed(0)}
                          </span>
                        ) : (
                          <span style={{ color: C.t3 }}>—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Unitário por time e setor */}
      <Card title="Preço Unitário por Time e Setor (Linha)">
        <div style={{ padding: '4px 16px 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {setorKeysUnit.map((s, i) => (
            <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: C.t2 }}>
              <span style={{ width: 14, height: 2, background: SETOR_PALETTE[i % SETOR_PALETTE.length], display: 'inline-block' }} />
              {s}
            </span>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={unitarioPorTimeESetor.slice(0, 30)} margin={{ top: 8, right: 16, bottom: 80, left: 10 }}>
            <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: C.t3, fontSize: 7 }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={90} interval={0} />
            <YAxis tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} />
            <RTooltip content={<DarkTooltip />} />
            {setorKeysUnit.map((s, i) => (
              <Line key={s} type="monotone" dataKey={s} stroke={SETOR_PALETTE[i % SETOR_PALETTE.length]} strokeWidth={1.5} dot={false} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>

    </div>
  );
}
