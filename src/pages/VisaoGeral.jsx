import { useState, useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, ReferenceLine,
  BarChart, Bar, Cell, LineChart, Line, ComposedChart, LabelList,
} from 'recharts';
import { C, FONT, SHADOW, CAMP_COLORS as TOKEN_CAMP_COLORS } from '../tokens';
import { TeamBadge, TeamXTick, TeamYTick, COMP_LOGOS } from '../teamLogos.jsx';
import {
  faturamentoPorPartida, unitarioPorTimeESetor,
  publicoETicketPorTime, partidas, kpis,
} from '../data/data';

const fmtM = v => {
  if (!v && v !== 0) return '—';
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1).replace('.', ',')} Mi`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)} Mil`;
  return `R$ ${v}`;
};
const fmtK = v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`;

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

const SETOR_PALETTE = [
  '#FFD700','#94a3b8','#00bcd4','#87ceeb','#6b7280','#b0b0c0','#6366f1',
  '#f97316','#84cc16','#e879f9','#fbbf24','#34d399','#64748b','#f43f5e',
];

const CAMP_NAMES = [...new Set(partidas.map(p => p.campeonato).filter(Boolean))].sort();

function Card({ children, title, style = {} }) {
  return (
    <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, boxShadow: SHADOW.card, ...style }}>
      {title && <div style={{ padding: '12px 16px 4px', ...sectionTitle, marginBottom: 4 }}>{title}</div>}
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
        <p key={i} style={{ color: p.fill || p.stroke || C.t2, margin: '2px 0' }}>
          <span style={{ color: C.t3 }}>{p.name}: </span>
          <span style={{ fontWeight: 600 }}>{typeof p.value === 'number' ? p.value.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

const ScatterTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', fontSize: 11, boxShadow: SHADOW.md }}>
      <p style={{ fontWeight: 700, color: C.t1, marginBottom: 4 }}>{d.time}</p>
      <p style={{ color: C.t2 }}>Público: <b style={{ color: C.t1 }}>{d.publico?.toLocaleString('pt-BR')}</b></p>
      <p style={{ color: C.t2 }}>Ticket Médio: <b style={{ color: C.accent }}>R$ {d.ticketMedio?.toFixed(2)}</b></p>
      <p style={{ color: CAMP_COLORS[d.campeonato] || C.t2 }}>{d.campeonato}</p>
    </div>
  );
};

export default function VisaoGeral() {
  const [campFilter, setCampFilter] = useState(null);
  const [anoFilter,  setAnoFilter]  = useState(null);

  // Filter faturamentoPorPartida
  const filteredFat = useMemo(() => faturamentoPorPartida.filter(p => {
    if (campFilter && p.campeonato !== campFilter) return false;
    if (anoFilter && p.ano !== anoFilter) return false;
    return true;
  }), [campFilter, anoFilter]);

  const filteredPartidas = useMemo(() => partidas.filter(p => {
    if (campFilter && p.campeonato !== campFilter) return false;
    if (anoFilter && p.ano !== anoFilter) return false;
    return true;
  }), [campFilter, anoFilter]);

  const nJogos = filteredPartidas.length;

  // Scatter data: group by campeonato
  const scatterGroups = useMemo(() => {
    return CAMP_NAMES.map(c => ({
      campeonato: c,
      data: faturamentoPorPartida.filter(p => p.campeonato === c && (!anoFilter || p.ano === anoFilter))
        .map(p => ({ ...p, x: p.utilizados, y: p.ticketMedio })),
      fill: CAMP_COLORS[c] || '#888',
    })).filter(g => g.data.length > 0);
  }, [anoFilter]);

  // publicoETicketPorTime for stacked bar
  const timePublico = useMemo(() => {
    return publicoETicketPorTime
      .filter(t => t.publico > 0)
      .slice(0, 20);
  }, []);

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

  // Faturamento por time (bar descending)
  const fatPorTime = useMemo(() => {
    const map = {};
    faturamentoPorPartida.filter(p => (!campFilter || p.campeonato === campFilter) && (!anoFilter || p.ano === anoFilter))
      .forEach(p => {
        if (!map[p.time]) map[p.time] = { time: p.time, faturamento: 0 };
        map[p.time].faturamento += p.faturamento;
      });
    return Object.values(map).sort((a, b) => b.faturamento - a.faturamento).slice(0, 15);
  }, [campFilter, anoFilter]);

  // Summary by campeonato
  const campSummary = useMemo(() => {
    return CAMP_NAMES.map(c => {
      const rows = filteredFat.filter(p => p.campeonato === c);
      if (!rows.length) return null;
      const fat = rows.reduce((s, p) => s + p.faturamento, 0);
      const util = rows.reduce((s, p) => s + p.utilizados, 0);
      const tm = util > 0 ? fat / util : 0;
      return {
        campeonato: c,
        nPartidas: rows.length,
        ticketMedio: tm,
        faturamento: fat,
        fatMedio: fat / rows.length,
      };
    }).filter(Boolean);
  }, [filteredFat]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Filters */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 10, padding: '10px 16px', boxShadow: SHADOW.card,
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
      }}>
        <span style={sectionTitle}>Campeonato</span>
        <FilterBtn label="Todos" active={!campFilter} onClick={() => setCampFilter(null)} />
        {CAMP_NAMES.map(c => (
          <FilterBtn
            key={c}
            label={c}
            active={campFilter === c}
            onClick={() => setCampFilter(campFilter === c ? null : c)}
            color={CAMP_COLORS[c]}
          />
        ))}
        <div style={{ width: 1, height: 18, background: C.border, margin: '0 4px' }} />
        <span style={sectionTitle}>Ano</span>
        {[null, 2024, 2025].map(a => (
          <FilterBtn
            key={a ?? 'todos'}
            label={a ?? 'Todos'}
            active={anoFilter === a}
            onClick={() => setAnoFilter(anoFilter === a ? null : a)}
          />
        ))}
        <div style={{ marginLeft: 'auto', background: C.accentBg, border: `1px solid ${C.accent}40`, borderRadius: 8, padding: '6px 14px' }}>
          <span style={{ fontSize: 10, color: C.t3 }}>Número de jogos: </span>
          <span style={{ fontSize: 14, fontWeight: 800, color: C.accent }}>{nJogos}</span>
        </div>
      </div>

      {/* Row 1: Summary table + Scatter */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 14 }}>

        {/* Summary table */}
        <Card title="Visão por Campeonato">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
              <thead>
                <tr style={{ background: C.bgAlt }}>
                  {['Campeonato', 'Jogos', 'Ticket M.', 'Fat. Total', 'Fat. Médio'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Campeonato' ? 'left' : 'right', fontSize: 9, fontWeight: 700, color: C.t3, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campSummary.map((r, i) => (
                  <tr key={r.campeonato} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? 'transparent' : C.bgAlt + '44' }}>
                    <td style={{ padding: '6px 10px' }}>
                      <span style={{ background: (CAMP_COLORS[r.campeonato] || C.t3) + '22', color: CAMP_COLORS[r.campeonato] || C.t3, borderRadius: 4, padding: '2px 6px', fontSize: 9, fontWeight: 700 }}>{r.campeonato}</span>
                    </td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', color: C.t1, fontWeight: 600 }}>{r.nPartidas}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', color: C.accent, fontWeight: 600 }}>R$ {r.ticketMedio.toFixed(2).replace('.', ',')}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', color: C.t1, fontVariantNumeric: 'tabular-nums' }}>{fmtM(r.faturamento)}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', color: C.t2, fontVariantNumeric: 'tabular-nums' }}>{fmtM(r.fatMedio)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Partidas table */}
          <div style={{ padding: '8px 0 0', borderTop: `1px solid ${C.border}` }}>
            <div style={{ padding: '8px 12px 4px', fontSize: 10, fontWeight: 700, color: C.t2 }}>Calendário de Partidas</div>
            <div style={{ maxHeight: 240, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
                <thead>
                  <tr style={{ background: C.bgAlt, position: 'sticky', top: 0 }}>
                    {['Time', 'Rodada', 'Data', 'Dia', 'Horário'].map(h => (
                      <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontSize: 8, fontWeight: 700, color: C.t3, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPartidas.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? 'transparent' : C.bgAlt + '44' }}>
                      <td style={{ padding: '4px 8px', color: C.t1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <TeamBadge name={p.time} size={16} />
                          {p.time}
                        </div>
                      </td>
                      <td style={{ padding: '4px 8px', color: C.t2 }}>{p.rodada}</td>
                      <td style={{ padding: '4px 8px', color: C.t2, whiteSpace: 'nowrap' }}>{p.data}</td>
                      <td style={{ padding: '4px 8px', color: C.t3 }}>{p.diaSemana?.slice(0, 3)}</td>
                      <td style={{ padding: '4px 8px', color: C.t3 }}>{p.horario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Scatter: público vs ticket médio */}
        <Card title="Público vs Ticket Médio por Partida">
          <div style={{ padding: '4px 16px 8px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {scatterGroups.map(g => (
              <span key={g.campeonato} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: C.t2 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: g.fill, display: 'inline-block' }} />
                {g.campeonato}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <ScatterChart margin={{ top: 8, right: 24, bottom: 20, left: 16 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
              <XAxis type="number" dataKey="x" name="Utilizados" tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={fmtK}
                label={{ value: 'PÚBLICO', position: 'insideBottom', fill: C.t3, fontSize: 9, offset: -8 }} />
              <YAxis type="number" dataKey="y" name="Ticket Médio" tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false}
                label={{ value: 'TICKET MÉDIO', angle: -90, position: 'insideLeft', fill: C.t3, fontSize: 9, dx: -4 }} />
              <RTooltip content={<ScatterTooltip />} />
              {scatterGroups.map(g => (
                <Scatter key={g.campeonato} name={g.campeonato} data={g.data} fill={g.fill} opacity={0.8} r={5} />
              ))}
              <ReferenceLine y={kpis.ticketMedio} stroke={C.t3} strokeDasharray="4 2" />
            </ScatterChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Row 2: Faturamento por time + Unitário por time e setor */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Faturamento por time descending */}
        <Card title="Soma de FATURAMENTO por Time (Top 15)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={fatPorTime} layout="vertical" margin={{ top: 8, right: 60, bottom: 4, left: 140 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fill: C.t3, fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={fmtM} />
              <YAxis type="category" dataKey="time" tick={<TeamYTick fill={C.t2} fontSize={9} />} axisLine={false} tickLine={false} width={140} />
              <RTooltip content={<DarkTooltip />} />
              <Bar dataKey="faturamento" name="Faturamento" radius={[0, 4, 4, 0]} barSize={12}>
                <LabelList dataKey="faturamento" position="right" formatter={fmtM} style={{ fontSize: 7, fill: C.t3 }} />
                {fatPorTime.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? C.accent : `hsl(${220 + i * 4}, 30%, ${40 - i}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Unitário por time e setor */}
        <Card title="Preço Unitário por Time e Setor">
          <div style={{ padding: '4px 16px 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {setorKeysUnit.slice(0, 6).map((s, i) => (
              <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: C.t2 }}>
                <span style={{ width: 14, height: 2, background: SETOR_PALETTE[i % SETOR_PALETTE.length], display: 'inline-block' }} />
                {s}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={unitarioPorTimeESetor.slice(0, 30)} margin={{ top: 8, right: 16, bottom: 36, left: 10 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" tick={<TeamXTick size={16} />} axisLine={false} tickLine={false} height={28} interval={0} />
              <YAxis tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} />
              <RTooltip content={<DarkTooltip />} />
              {setorKeysUnit.map((s, i) => (
                <Line key={s} type="monotone" dataKey={s} stroke={SETOR_PALETTE[i % SETOR_PALETTE.length]} strokeWidth={1.5} dot={false} connectNulls />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Row 3: Público por time */}
      <Card title="Público por Time (Top 15)">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={timePublico.slice(0, 15)} margin={{ top: 8, right: 16, bottom: 36, left: 10 }}>
            <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" tick={<TeamXTick size={18} />} axisLine={false} tickLine={false} height={30} interval={0} />
            <YAxis tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
            <RTooltip content={<DarkTooltip />} />
            <Bar dataKey="publico" name="Público" radius={[3, 3, 0, 0]} barSize={20}>
              {timePublico.slice(0, 15).map((_, i) => (
                <Cell key={i} fill={i === 0 ? C.accent : `hsl(${200 + i * 5}, 40%, ${50 - i}%)`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

    </div>
  );
}
