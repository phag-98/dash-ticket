import { useState, useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, Cell, BarChart,
} from 'recharts';
import { C, FONT, SHADOW } from '../tokens';
import {
  kpis, faturamentoPorPartida, publicoPorTorcedor, publicoPorSetorPartida,
  campeonatos, partidas,
} from '../data/data';

// ── Unique campeonato names
const CAMP_NAMES = [...new Set(partidas.map(p => p.campeonato).filter(Boolean))].sort();

// ── Sector colors mapped by setor name
const SETOR_PALETTE = {
  'Leste Inferior': '#FFD700',
  'Leste Superior': '#94a3b8',
  'Maracanã Mais':  '#00bcd4',
  'Norte':          '#87ceeb',
  'Oeste Inferior': '#6b7280',
  'Oeste Superior': '#b0b0c0',
  'Sul':            '#6366f1',
  'Arquibancada':   '#f97316',
  'Social':         '#84cc16',
  'VIP':            '#e879f9',
  'Camarote':       '#fbbf24',
  'Promocional':    '#34d399',
  'Gratuidade':     '#64748b',
  'Setor Visitante':'#f43f5e',
};
const getSetorColor = (nome) => SETOR_PALETTE[nome] || '#555566';

const fmtR = v => {
  if (!v && v !== 0) return '—';
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(2).replace('.', ',')} Mi`;
  if (v >= 1_000)     return `R$ ${(v / 1_000).toFixed(0)} Mil`;
  return `R$ ${v.toLocaleString('pt-BR')}`;
};
const fmtK = v => v >= 1000 ? `${(v / 1000).toFixed(0)} Mil` : `${v}`;
const fmtPct = v => `${(v * 100).toFixed(1)}%`;

function Card({ children, title, style = {} }) {
  return (
    <div style={{
      background: C.card, borderRadius: 10, border: `1px solid ${C.border}`,
      boxShadow: SHADOW.card, overflow: 'hidden', ...style,
    }}>
      {title && (
        <div style={{ padding: '12px 16px 0', fontSize: 11, fontWeight: 700, color: C.t2, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

function KPI({ label, value, icon, accent = false }) {
  return (
    <div style={{
      background: accent ? C.accentBg : C.card,
      border: `1px solid ${accent ? C.accent + '40' : C.border}`,
      borderRadius: 10, padding: '14px 18px',
      display: 'flex', alignItems: 'center', gap: 14,
      boxShadow: SHADOW.card, flex: 1, minWidth: 150,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        background: accent ? C.accent + '22' : C.bgAlt,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 9, color: C.t2, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: accent ? C.accent : C.t1, letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</div>
      </div>
    </div>
  );
}

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', fontSize: 11, boxShadow: SHADOW.md }}>
      <p style={{ fontWeight: 700, color: C.t1, marginBottom: 6, fontSize: 12 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill || C.t2, margin: '2px 0' }}>
          <span style={{ color: C.t3 }}>{p.name}: </span>
          <span style={{ fontWeight: 600 }}>{typeof p.value === 'number' ? (p.value > 1000 ? p.value.toLocaleString('pt-BR') : p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function ChampionshipReport() {
  const [campeonato, setCampeonato] = useState('Todos');
  const [ano, setAno] = useState('Todos');

  // Filter faturamentoPorPartida
  const filteredFat = useMemo(() => {
    return faturamentoPorPartida.filter(p => {
      if (campeonato !== 'Todos' && p.campeonato !== campeonato) return false;
      if (ano !== 'Todos' && String(p.ano) !== ano) return false;
      return true;
    });
  }, [campeonato, ano]);

  // Filter publicoPorSetorPartida for combo chart
  const comboData = useMemo(() => {
    let data = publicoPorSetorPartida.filter(p => {
      if (campeonato !== 'Todos' && p.campeonato !== campeonato) return false;
      if (ano !== 'Todos' && String(p.ano) !== ano) return false;
      return true;
    });
    return data.map(p => ({
      ...p,
      label: `${p.time} R${p.rodada}`,
    }));
  }, [campeonato, ano]);

  // Get all setor keys present in comboData
  const setorKeys = useMemo(() => {
    const keys = new Set();
    comboData.forEach(row => {
      Object.keys(row).forEach(k => {
        if (!['idPartida','time','campeonato','rodada','data','ano','mes','diaSemana','horario','ticketMedio','label'].includes(k)) {
          if (row[k] > 0) keys.add(k);
        }
      });
    });
    return [...keys];
  }, [comboData]);

  // KPI values filtered
  const filteredKpis = useMemo(() => {
    if (campeonato === 'Todos' && ano === 'Todos') return kpis;
    // Re-calc from faturamentoPorPartida
    const total_fat = filteredFat.reduce((s, p) => s + p.faturamento, 0);
    const total_util = filteredFat.reduce((s, p) => s + p.utilizados, 0);
    const tm = total_util > 0 ? total_fat / total_util : 0;
    return {
      ...kpis,
      ticketMedio: Math.round(tm * 100) / 100,
      faturamentoTotal: total_fat,
    };
  }, [filteredFat, campeonato, ano]);

  const top20 = filteredFat.slice(0, 20);
  const totalFat = filteredFat.reduce((s, p) => s + p.faturamento, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Filters + KPIs */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', flexWrap: 'wrap' }}>
        {/* Filters */}
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 10, padding: '12px 16px',
          display: 'flex', flexDirection: 'column', gap: 8, boxShadow: SHADOW.card,
        }}>
          <div style={{ fontSize: 9, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Filtros</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 9, color: C.t3, marginBottom: 3 }}>Campeonato</div>
              <select value={campeonato} onChange={e => setCampeonato(e.target.value)}
                style={{ background: C.bgAlt, border: `1px solid ${C.border}`, borderRadius: 6, color: C.t1, padding: '5px 10px', fontSize: 11, fontFamily: FONT, cursor: 'pointer' }}>
                <option>Todos</option>
                {CAMP_NAMES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 9, color: C.t3, marginBottom: 3 }}>Ano</div>
              <select value={ano} onChange={e => setAno(e.target.value)}
                style={{ background: C.bgAlt, border: `1px solid ${C.border}`, borderRadius: 6, color: C.t1, padding: '5px 10px', fontSize: 11, fontFamily: FONT, cursor: 'pointer' }}>
                <option>Todos</option>
                <option>2024</option>
                <option>2025</option>
              </select>
            </div>
          </div>
        </div>

        <KPI label="Sócios %" value={fmtPct(kpis.percentualSocios)} icon="⭐" accent />
        <KPI label="Ticket Médio" value={`R$ ${filteredKpis.ticketMedio.toFixed(2).replace('.', ',')}`} icon="🎟" />
        <KPI label="Média de Público" value={`${(kpis.mediaPublico / 1000).toFixed(1).replace('.', ',')} Mil`} icon="👥" />
        <KPI label="Público Total" value={`${(kpis.publicoTotal / 1_000_000).toFixed(2).replace('.', ',')} Mi`} icon="🏟" />
      </div>

      {/* Bottom section */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16 }}>

        {/* Faturamento table */}
        <Card title="Faturamento por Partida">
          <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 240px)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ background: C.bgAlt, position: 'sticky', top: 0 }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.6px', whiteSpace: 'nowrap' }}>Rod.</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Time</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: 9, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.6px', whiteSpace: 'nowrap', background: `${C.accent}10` }}>Faturamento</th>
                </tr>
              </thead>
              <tbody>
                {top20.map((p, i) => (
                  <tr key={p.idPartida} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? 'transparent' : C.bgAlt + '44' }}>
                    <td style={{ padding: '7px 10px', color: C.t2, fontWeight: 600, fontSize: 10, whiteSpace: 'nowrap' }}>{p.rodada}</td>
                    <td style={{ padding: '7px 10px', color: C.t1, fontSize: 10, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.time}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700, color: C.accent, fontSize: 10, whiteSpace: 'nowrap', background: `${C.accent}08` }}>
                      {fmtR(p.faturamento)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: `2px solid ${C.border}`, background: C.bgAlt }}>
                  <td colSpan={2} style={{ padding: '8px 10px', fontWeight: 700, color: C.t1, fontSize: 11 }}>Total</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: C.accent, fontSize: 12, background: `${C.accent}10` }}>
                    {fmtR(totalFat)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {/* Right: charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Combo: público por setor + ticket médio */}
          <Card>
            <div style={{ padding: '12px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.t1 }}>PÚBLICO e TICKET MÉDIO por PARTIDA, TIME e SETOR</div>
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {setorKeys.map(s => (
                    <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: C.t2 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: getSetorColor(s), display: 'inline-block' }} />
                      {s}
                    </span>
                  ))}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: C.t2 }}>
                    <svg width="14" height="3"><line x1={0} y1={1.5} x2={14} y2={1.5} stroke={C.ticketLine || '#ff6b35'} strokeWidth={2} /></svg>
                    TICKET MÉDIO
                  </span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={comboData} margin={{ top: 8, right: 60, bottom: 60, left: 10 }}>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: C.t3, fontSize: 7 }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={70} interval={0} />
                <YAxis yAxisId="pub" orientation="left" tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <YAxis yAxisId="tkt" orientation="right" tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} />
                <RTooltip content={<DarkTooltip />} />
                {setorKeys.map(s => (
                  <Bar key={s} yAxisId="pub" dataKey={s} stackId="pub" fill={getSetorColor(s)} barSize={14} />
                ))}
                <Line yAxisId="tkt" type="monotone" dataKey="ticketMedio" name="Ticket Médio" stroke={C.ticketLine || '#ff6b35'} strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>

          {/* Bar: público por torcedor */}
          <Card>
            <div style={{ padding: '12px 16px 0', fontSize: 11, fontWeight: 700, color: C.t1 }}>
              PÚBLICO por Tipo de Torcedor
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={publicoPorTorcedor.slice(0, 12)} margin={{ top: 16, right: 16, bottom: 60, left: 10 }}>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="torcedor" tick={{ fill: C.t3, fontSize: 8 }} axisLine={false} tickLine={false} angle={-35} textAnchor="end" height={70} interval={0} />
                <YAxis tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
                <RTooltip content={<DarkTooltip />} />
                <Bar dataKey="publico" name="Público" radius={[3, 3, 0, 0]} barSize={28}>
                  {publicoPorTorcedor.slice(0, 12).map((_, i) => (
                    <Cell key={i} fill={i === 0 ? C.accent : '#2a2a3e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

        </div>
      </div>
    </div>
  );
}
