import { useState, useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, Cell, BarChart,
} from 'recharts';
import { C, FONT, SHADOW, CAMP_COLORS } from '../tokens';
import {
  kpis, faturamentoPorPartida, publicoPorTorcedor, publicoPorSetorPartida,
  campeonatos, partidas, faturamentoPorCampeonatoAno,
} from '../data/data';

// ── Unique campeonato names
const CAMP_NAMES = [...new Set(partidas.map(p => p.campeonato).filter(Boolean))].sort();

// ── Sector colors mapped by setor name
const SETOR_PALETTE = {
  'Leste Inferior': C.lesteInf,
  'Leste Superior': C.lesteSup,
  'Maracanã Mais':  C.maracana,
  'Norte':          C.norte,
  'Oeste Inferior': C.oesteInf,
  'Oeste Superior': C.oesteSup,
  'Sul':            C.sul,
  'Arquibancada':   '#f97316',
  'Social':         '#84cc16',
  'VIP':            C.lib,
  'Camarote':       C.accent,
  'Promocional':    C.green,
  'Gratuidade':     C.t3,
  'Setor Visitante': C.red,
};
const getSetorColor = (nome) => SETOR_PALETTE[nome] || C.t3;

// ── Section title style
const sectionTitle = {
  fontSize: 10, fontWeight: 700, color: C.t2,
  textTransform: 'uppercase', letterSpacing: '1.5px',
};

const fmtR = v => {
  if (!v && v !== 0) return '—';
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(2).replace('.', ',')} Mi`;
  if (v >= 1_000)     return `R$ ${(v / 1_000).toFixed(0)} Mil`;
  return `R$ ${v.toLocaleString('pt-BR')}`;
};
const fmtK = v => v >= 1000 ? `${(v / 1000).toFixed(0)} Mil` : `${v}`;
const fmtPct = v => `${(v * 100).toFixed(1)}%`;

// ── Consistent filter button
function FilterBtn({ label, active, onClick, color }) {
  const bg     = active ? (color || C.accent) : C.card;
  const col    = active ? '#000' : C.t2;
  const border = active ? (color || C.accent) : C.border;
  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 14px', borderRadius: 20, border: `1px solid ${border}`,
        background: bg, color: col,
        fontSize: 10, fontWeight: active ? 700 : 500, cursor: 'pointer',
        letterSpacing: '0.5px', whiteSpace: 'nowrap', transition: 'all 0.12s ease',
        fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  );
}

function Card({ children, title, style = {} }) {
  return (
    <div style={{
      background: C.card, borderRadius: 10, border: `1px solid ${C.border}`,
      boxShadow: SHADOW.card, overflow: 'hidden', ...style,
    }}>
      {title && (
        <div style={{ padding: '12px 16px 0', ...sectionTitle, marginBottom: 8 }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

// ── KPI with year-over-year variation badge
function KPI({ label, value, icon, accent = false, variation }) {
  // variation: number like +12.5 or -3.2 (percentage change 2025 vs 2024)
  const hasVar = variation != null && !isNaN(variation);
  const isPos = hasVar && variation >= 0;
  const varColor = !hasVar ? C.t3 : variation > 0 ? C.green : variation < 0 ? C.red : C.t2;
  const varBg    = !hasVar ? 'transparent' : variation > 0 ? C.greenBg : variation < 0 ? C.redBg : C.accentBg;

  return (
    <div style={{
      background: accent ? C.accentBg : C.card,
      border: `1px solid ${accent ? C.accent + '40' : C.border}`,
      borderRadius: 10, padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 14,
      boxShadow: SHADOW.card, flex: 1, minWidth: 150,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        background: accent ? C.accent + '22' : C.bgAlt,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 9, color: C.t2, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: accent ? C.accent : C.t1, letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</div>
        {hasVar && (
          <div style={{
            marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 3,
            background: varBg, borderRadius: 6, padding: '2px 6px',
          }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: varColor }}>
              {isPos ? '+' : ''}{variation.toFixed(1)}% vs 2024
            </span>
          </div>
        )}
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
    const total_fat  = filteredFat.reduce((s, p) => s + p.faturamento, 0);
    const total_util = filteredFat.reduce((s, p) => s + p.utilizados, 0);
    const tm = total_util > 0 ? total_fat / total_util : 0;
    return {
      ...kpis,
      ticketMedio: Math.round(tm * 100) / 100,
      faturamentoTotal: total_fat,
    };
  }, [filteredFat, campeonato, ano]);

  // ── Compute YoY variation for KPI cards
  // Using faturamentoPorCampeonatoAno: sum across campeonatos per year
  const kpiVariations = useMemo(() => {
    const filterByCamp = (rows) => campeonato !== 'Todos' ? rows.filter(r => r.campeonato === campeonato) : rows;

    const rows2024 = filterByCamp(faturamentoPorCampeonatoAno.filter(r => r.ano === 2024));
    const rows2025 = filterByCamp(faturamentoPorCampeonatoAno.filter(r => r.ano === 2025));

    const sum = (arr, field) => arr.reduce((s, r) => s + (r[field] || 0), 0);
    const avg = (arr, field) => arr.length ? sum(arr, field) / arr.length : 0;
    const pctChange = (v2025, v2024) => v2024 > 0 ? ((v2025 - v2024) / v2024) * 100 : null;

    const fat2024  = sum(rows2024, 'faturamento');
    const fat2025  = sum(rows2025, 'faturamento');
    const pub2024  = avg(rows2024, 'mediaPublico');
    const pub2025  = avg(rows2025, 'mediaPublico');
    const tkt2024  = avg(rows2024, 'ticketMedio');
    const tkt2025  = avg(rows2025, 'ticketMedio');

    // publicoTotal: sum utilizados from faturamentoPorCampeonatoAno
    const util2024 = sum(rows2024, 'utilizados');
    const util2025 = sum(rows2025, 'utilizados');

    return {
      ticketMedio:   pctChange(tkt2025,  tkt2024),
      mediaPublico:  pctChange(pub2025,  pub2024),
      publicoTotal:  pctChange(util2025, util2024),
      // Sócios % — not broken down by year in data, skip variation
      percentualSocios: null,
    };
  }, [campeonato]);

  const top20 = filteredFat.slice(0, 20);
  const totalFat = filteredFat.reduce((s, p) => s + p.faturamento, 0);

  // ── Sort publicoPorTorcedor descending by publico (Task 5)
  const sortedPublicoPorTorcedor = useMemo(() => {
    return [...publicoPorTorcedor].sort((a, b) => b.publico - a.publico);
  }, []);

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
          <div style={sectionTitle}>Filtros</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 9, color: C.t3, marginBottom: 5, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Campeonato</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <FilterBtn label="Todos" active={campeonato === 'Todos'} onClick={() => setCampeonato('Todos')} />
                {CAMP_NAMES.map(c => (
                  <FilterBtn key={c} label={c} active={campeonato === c} onClick={() => setCampeonato(c)} color={CAMP_COLORS[c]} />
                ))}
              </div>
            </div>
            <div style={{ width: 1, height: 24, background: C.border, margin: '0 4px' }} />
            <div>
              <div style={{ fontSize: 9, color: C.t3, marginBottom: 5, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Ano</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {['Todos', '2024', '2025'].map(a => (
                  <FilterBtn key={a} label={a} active={ano === a} onClick={() => setAno(a)} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <KPI
          label="Sócios %"
          value={fmtPct(kpis.percentualSocios)}
          icon="⭐"
          accent
          variation={kpiVariations.percentualSocios}
        />
        <KPI
          label="Ticket Médio"
          value={`R$ ${filteredKpis.ticketMedio.toFixed(2).replace('.', ',')}`}
          icon="🎟"
          variation={kpiVariations.ticketMedio}
        />
        <KPI
          label="Média de Público"
          value={`${(kpis.mediaPublico / 1000).toFixed(1).replace('.', ',')} Mil`}
          icon="👥"
          variation={kpiVariations.mediaPublico}
        />
        <KPI
          label="Público Total"
          value={`${(kpis.publicoTotal / 1_000_000).toFixed(2).replace('.', ',')} Mi`}
          icon="🏟"
          variation={kpiVariations.publicoTotal}
        />
      </div>

      {/* Bottom section */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16 }}>

        {/* Faturamento table */}
        <Card title="Faturamento por Partida">
          <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 240px)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ background: C.bgAlt, position: 'sticky', top: 0 }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '1.5px', whiteSpace: 'nowrap' }}>Rod.</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Time</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: 9, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '1.5px', whiteSpace: 'nowrap', background: `${C.accent}10` }}>Faturamento</th>
                </tr>
              </thead>
              <tbody>
                {top20.map((p, i) => (
                  <tr key={p.idPartida} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? 'transparent' : 'rgba(57,57,57,0.25)', minHeight: 32 }}>
                    <td style={{ padding: '8px 10px', color: C.t2, fontWeight: 600, fontSize: 10, whiteSpace: 'nowrap', fontFamily: "'Courier New', monospace" }}>{p.rodada}</td>
                    <td style={{ padding: '8px 10px', color: C.t1, fontSize: 10, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.time}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: C.accent, fontSize: 10, whiteSpace: 'nowrap', background: `${C.accent}08`, fontFamily: "'Courier New', monospace" }}>
                      {fmtR(p.faturamento)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: `2px solid ${C.border}`, background: C.bgAlt }}>
                  <td colSpan={2} style={{ padding: '8px 10px', fontWeight: 700, color: C.t1, fontSize: 11 }}>Total</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: C.accent, fontSize: 12, background: `${C.accent}10`, fontFamily: "'Courier New', monospace" }}>
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
                <div style={{ ...sectionTitle, fontSize: 10 }}>Público e Ticket Médio por Partida, Time e Setor</div>
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {setorKeys.map(s => (
                    <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: C.t2 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: getSetorColor(s), display: 'inline-block' }} />
                      {s}
                    </span>
                  ))}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: C.t2 }}>
                    <svg width="14" height="3"><line x1={0} y1={1.5} x2={14} y2={1.5} stroke={C.ticketLine || C.accent} strokeWidth={2} /></svg>
                    Ticket Médio
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
                <Line yAxisId="tkt" type="monotone" dataKey="ticketMedio" name="Ticket Médio" stroke={C.ticketLine || C.accent} strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>

          {/* Bar: público por torcedor — sorted descending (Task 5) */}
          <Card>
            <div style={{ padding: '12px 16px 0', ...sectionTitle }}>
              Público por Tipo de Torcedor
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sortedPublicoPorTorcedor.slice(0, 12)} margin={{ top: 16, right: 16, bottom: 60, left: 10 }}>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="torcedor" tick={{ fill: C.t3, fontSize: 8 }} axisLine={false} tickLine={false} angle={-35} textAnchor="end" height={70} interval={0} />
                <YAxis tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
                <RTooltip content={<DarkTooltip />} />
                <Bar dataKey="publico" name="Público" radius={[3, 3, 0, 0]} barSize={28}>
                  {sortedPublicoPorTorcedor.slice(0, 12).map((_, i) => (
                    <Cell key={i} fill={i === 0 ? C.accent : C.bgAlt} />
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
