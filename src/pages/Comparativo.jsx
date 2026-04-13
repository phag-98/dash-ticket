import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, LabelList, Cell,
} from 'recharts';
import { C, FONT, SHADOW, CAMP_COLORS as TOKEN_CAMP_COLORS } from '../tokens';

const Y24 = '#555566';
const Y25 = '#C9A84C';
const Y26 = '#0284c7';
import { COMP_LOGOS, CompXTick, CompYTick, TeamBadge } from '../teamLogos.jsx';
import { faturamentoPorCampeonatoAno, faturamentoPorPartida, partidas } from '../data/data';

const fatByPartida = Object.fromEntries(faturamentoPorPartida.map(p => [p.idPartida, p]));

const fmtM = v => {
  if (!v) return '0';
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace('.', ',')} Mi`;
  return `${(v / 1_000).toFixed(0)} Mil`;
};
const fmtK = v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`;

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

// Unique campeonato names
const CAMP_NAMES = [...new Set(faturamentoPorCampeonatoAno.map(d => d.campeonato).filter(Boolean))].sort();

// Months that actually have data
const MESES_COM_DADOS = [...new Set(faturamentoPorPartida.map(p => p.mes).filter(Boolean))].sort((a,b) => a-b);

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

function Card({ children, title, subtitle, style = {} }) {
  return (
    <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, boxShadow: SHADOW.card, ...style }}>
      {(title || subtitle) && (
        <div style={{ padding: '12px 16px 4px' }}>
          {title && <div style={{ ...sectionTitle, marginBottom: 2 }}>{title}</div>}
          {subtitle && <div style={{ fontSize: 9, color: C.t3 }}>{subtitle}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', fontSize: 11, boxShadow: SHADOW.md }}>
      <p style={{ fontWeight: 700, color: C.t1, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill || C.t2, margin: '2px 0' }}>
          <span style={{ color: C.t3 }}>{p.name}: </span>
          <span style={{ fontWeight: 600 }}>{typeof p.value === 'number' ? fmtM(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

// Aggregate faturamentoPorPartida by campeonato+ano with optional month filter
function buildData(field, campFilter, mesFilter) {
  const rows = faturamentoPorPartida.filter(p => {
    if (campFilter && p.campeonato !== campFilter) return false;
    if (mesFilter && p.mes !== mesFilter) return false;
    return true;
  });

  const camps = [...new Set(rows.map(r => r.campeonato).filter(Boolean))];
  return camps.map(camp => {
    const byYear = (ano) => rows.filter(r => r.campeonato === camp && r.ano === ano);
    const agg = (rows, f) => {
      if (!rows.length) return 0;
      if (f === 'faturamento')  return rows.reduce((s,r) => s + (r.faturamento||0), 0);
      if (f === 'fatMedio')     return rows.reduce((s,r) => s + (r.faturamento||0), 0) / rows.length;
      if (f === 'ticketMedio')  { const pub = rows.reduce((s,r)=>s+(r.utilizados||0),0); return pub>0 ? rows.reduce((s,r)=>s+(r.faturamento||0),0)/pub : 0; }
      if (f === 'mediaPublico') return rows.reduce((s,r)=>s+(r.utilizados||0),0) / rows.length;
      return 0;
    };
    return {
      campeonato: camp,
      '2024': agg(byYear(2024), field),
      '2025': agg(byYear(2025), field),
      '2026': agg(byYear(2026), field),
    };
  });
}

export default function Comparativo() {
  const [campFilter, setCampFilter] = useState(null);
  const [mesFilter,  setMesFilter]  = useState(null);

  const fatData    = useMemo(() => buildData('faturamento',  campFilter, mesFilter), [campFilter, mesFilter]);
  const fatMedData = useMemo(() => buildData('fatMedio',     campFilter, mesFilter), [campFilter, mesFilter]);
  const tktData    = useMemo(() => buildData('ticketMedio',  campFilter, mesFilter), [campFilter, mesFilter]);
  const pubData    = useMemo(() => buildData('mediaPublico', campFilter, mesFilter), [campFilter, mesFilter]);

  // Total faturamento by year (with filters)
  const fatByYear = useMemo(() => {
    const rows = faturamentoPorPartida.filter(p => {
      if (campFilter && p.campeonato !== campFilter) return false;
      if (mesFilter  && p.mes        !== mesFilter)  return false;
      return true;
    });
    return {
      2024: rows.filter(r => r.ano === 2024).reduce((s,r) => s + r.faturamento, 0),
      2025: rows.filter(r => r.ano === 2025).reduce((s,r) => s + r.faturamento, 0),
      2026: rows.filter(r => r.ano === 2026).reduce((s,r) => s + r.faturamento, 0),
    };
  }, [campFilter, mesFilter]);

  // Jogos count (with filters)
  const jogosTable = useMemo(() => {
    const filtered = partidas.filter(p => {
      if (campFilter && p.campeonato !== campFilter) return false;
      if (mesFilter  && p.mes        !== mesFilter)  return false;
      return true;
    });
    const camps = [...new Set(filtered.map(p => p.campeonato).filter(Boolean))].sort();
    return camps.map(c => {
      const n24 = filtered.filter(p => p.campeonato === c && p.ano === 2024).length;
      const n25 = filtered.filter(p => p.campeonato === c && p.ano === 2025).length;
      const n26 = filtered.filter(p => p.campeonato === c && p.ano === 2026).length;
      return { campeonato: c, '2024': n24, '2025': n25, '2026': n26, total: n24+n25+n26 };
    }).filter(r => r.total > 0);
  }, [campFilter, mesFilter]);

  const totalJogos = useMemo(() => {
    const filtered = partidas.filter(p => {
      if (campFilter && p.campeonato !== campFilter) return false;
      if (mesFilter  && p.mes        !== mesFilter)  return false;
      return true;
    });
    return {
      '2024': filtered.filter(p => p.ano === 2024).length,
      '2025': filtered.filter(p => p.ano === 2025).length,
      '2026': filtered.filter(p => p.ano === 2026).length,
      total:  filtered.length,
    };
  }, [campFilter, mesFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Filters */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 10, padding: '10px 16px', boxShadow: SHADOW.card,
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {/* Campeonato row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={sectionTitle}>Campeonato</span>
          <div style={{ width: 1, height: 18, background: C.border, margin: '0 4px' }} />
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
        </div>

        {/* Month row */}
        {MESES_COM_DADOS.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={sectionTitle}>Mês</span>
            <div style={{ width: 1, height: 18, background: C.border, margin: '0 4px' }} />
            <FilterBtn label="Todos" active={!mesFilter} onClick={() => setMesFilter(null)} />
            {MESES_COM_DADOS.map(m => (
              <FilterBtn
                key={m}
                label={MESES[m - 1]}
                active={mesFilter === m}
                onClick={() => setMesFilter(mesFilter === m ? null : m)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>

        {/* Faturamento total por camp + ano (horizontal) */}
        <Card title="Faturamento por Campeonato e Ano" subtitle="● 2024  ● 2025  ● 2026">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={fatData} layout="vertical" margin={{ top: 8, right: 60, bottom: 4, left: 110 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fill: C.t3, fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={fmtM} />
              <YAxis type="category" dataKey="campeonato" tick={<CompYTick />} axisLine={false} tickLine={false} width={110} />
              <RTooltip content={<DarkTooltip />} />
              <Bar dataKey="2024" name="2024" fill={Y24} radius={[0, 3, 3, 0]} barSize={7}>
                <LabelList dataKey="2024" position="right" formatter={fmtM} style={{ fontSize: 7, fill: C.t3 }} />
              </Bar>
              <Bar dataKey="2025" name="2025" fill={Y25} radius={[0, 3, 3, 0]} barSize={7}>
                <LabelList dataKey="2025" position="right" formatter={fmtM} style={{ fontSize: 7, fill: Y25 }} />
              </Bar>
              <Bar dataKey="2026" name="2026" fill={Y26} radius={[0, 3, 3, 0]} barSize={7}>
                <LabelList dataKey="2026" position="right" formatter={fmtM} style={{ fontSize: 7, fill: Y26 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Faturamento médio */}
        <Card title="Faturamento Médio por Campeonato e Ano">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={fatMedData} margin={{ top: 8, right: 16, bottom: 12, left: 8 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="campeonato" tick={<CompXTick />} axisLine={false} tickLine={false} height={36} interval={0} />
              <YAxis tick={{ fill: C.t3, fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={fmtM} />
              <RTooltip content={<DarkTooltip />} />
              <Bar dataKey="2024" name="2024" fill={Y24} barSize={10} radius={[3, 3, 0, 0]}>
                <LabelList dataKey="2024" position="top" formatter={fmtM} style={{ fontSize: 7, fill: C.t3 }} />
              </Bar>
              <Bar dataKey="2025" name="2025" fill={Y25} barSize={10} radius={[3, 3, 0, 0]}>
                <LabelList dataKey="2025" position="top" formatter={fmtM} style={{ fontSize: 7, fill: Y25 }} />
              </Bar>
              <Bar dataKey="2026" name="2026" fill={Y26} barSize={10} radius={[3, 3, 0, 0]}>
                <LabelList dataKey="2026" position="top" formatter={fmtM} style={{ fontSize: 7, fill: Y26 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Faturamento por Ano */}
        <Card title="Faturamento por ANO">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[{ ano: '2024', valor: fatByYear[2024] }, { ano: '2025', valor: fatByYear[2025] }, { ano: '2026', valor: fatByYear[2026] }]} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="ano" tick={{ fill: C.t2, fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.t3, fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={fmtM} />
              <RTooltip content={<DarkTooltip />} />
              <Bar dataKey="valor" name="Faturamento" radius={[4, 4, 0, 0]} barSize={46}>
                <LabelList dataKey="valor" position="top" formatter={fmtM} style={{ fontSize: 9, fontWeight: 700, fill: C.t1 }} />
                <Cell fill={Y24} />
                <Cell fill={Y25} />
                <Cell fill={Y26} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Ticket Médio */}
        <Card title="Ticket Médio por Campeonato e Ano">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tktData} margin={{ top: 8, right: 16, bottom: 12, left: 8 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="campeonato" tick={<CompXTick />} axisLine={false} tickLine={false} height={36} interval={0} />
              <YAxis tick={{ fill: C.t3, fontSize: 8 }} axisLine={false} tickLine={false} />
              <RTooltip content={<DarkTooltip />} />
              <Bar dataKey="2024" name="2024" fill={Y24} barSize={10} radius={[3, 3, 0, 0]}>
                <LabelList dataKey="2024" position="top" style={{ fontSize: 7, fill: C.t3 }} />
              </Bar>
              <Bar dataKey="2025" name="2025" fill={Y25} barSize={10} radius={[3, 3, 0, 0]}>
                <LabelList dataKey="2025" position="top" style={{ fontSize: 7, fill: Y25 }} />
              </Bar>
              <Bar dataKey="2026" name="2026" fill={Y26} barSize={10} radius={[3, 3, 0, 0]}>
                <LabelList dataKey="2026" position="top" style={{ fontSize: 7, fill: Y26 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Média de Público */}
        <Card title="Média de Público por Campeonato e Ano">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pubData} margin={{ top: 8, right: 16, bottom: 12, left: 8 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="campeonato" tick={<CompXTick />} axisLine={false} tickLine={false} height={36} interval={0} />
              <YAxis tick={{ fill: C.t3, fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
              <RTooltip content={<DarkTooltip />} />
              <Bar dataKey="2024" name="2024" fill={Y24} barSize={10} radius={[3, 3, 0, 0]}>
                <LabelList dataKey="2024" position="top" formatter={fmtK} style={{ fontSize: 7, fill: C.t3 }} />
              </Bar>
              <Bar dataKey="2025" name="2025" fill={Y25} barSize={10} radius={[3, 3, 0, 0]}>
                <LabelList dataKey="2025" position="top" formatter={fmtK} style={{ fontSize: 7, fill: Y25 }} />
              </Bar>
              <Bar dataKey="2026" name="2026" fill={Y26} barSize={10} radius={[3, 3, 0, 0]}>
                <LabelList dataKey="2026" position="top" formatter={fmtK} style={{ fontSize: 7, fill: Y26 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Jogos count table */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', boxShadow: SHADOW.card }}>
          <div style={{ padding: '12px 16px 8px', fontSize: 11, fontWeight: 700, color: C.t1 }}>Nº de Jogos</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ background: C.bgAlt }}>
                <th style={{ padding: '6px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: C.t3, textTransform: 'uppercase' }}>Campeonato</th>
                <th style={{ padding: '6px 8px', textAlign: 'center', fontSize: 9, fontWeight: 700, color: Y24 }}>2024</th>
                <th style={{ padding: '6px 8px', textAlign: 'center', fontSize: 9, fontWeight: 700, color: Y25 }}>2025</th>
                <th style={{ padding: '6px 8px', textAlign: 'center', fontSize: 9, fontWeight: 700, color: Y26 }}>2026</th>
                <th style={{ padding: '6px 8px', textAlign: 'center', fontSize: 9, fontWeight: 700, color: C.t2 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {jogosTable.map((r, i) => (
                <tr key={r.campeonato} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? 'transparent' : C.bgAlt + '44' }}>
                  <td style={{ padding: '6px 12px', color: C.t1, fontSize: 10 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {COMP_LOGOS[r.campeonato]
                        ? <img src={`/logos/${COMP_LOGOS[r.campeonato]}`} style={{ width: 16, height: 16, objectFit: 'contain' }} />
                        : <span style={{ width: 8, height: 8, borderRadius: '50%', background: CAMP_COLORS[r.campeonato] || C.t3, display: 'inline-block', flexShrink: 0 }} />
                      }
                      {r.campeonato}
                    </span>
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', color: Y24, fontWeight: 600 }}>{r['2024'] || '—'}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', color: Y25, fontWeight: 600 }}>{r['2025'] || '—'}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', color: Y26, fontWeight: 600 }}>{r['2026'] || '—'}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', color: C.t1, fontWeight: 700 }}>{r.total}</td>
                </tr>
              ))}
              <tr style={{ borderTop: `2px solid ${C.border}`, background: C.bgAlt }}>
                <td style={{ padding: '6px 12px', fontWeight: 700, color: C.t1, fontSize: 10 }}>Total</td>
                <td style={{ padding: '6px 8px', textAlign: 'center', color: Y24, fontWeight: 700 }}>{totalJogos['2024']}</td>
                <td style={{ padding: '6px 8px', textAlign: 'center', color: Y25, fontWeight: 700 }}>{totalJogos['2025']}</td>
                <td style={{ padding: '6px 8px', textAlign: 'center', color: Y26, fontWeight: 700 }}>{totalJogos['2026']}</td>
                <td style={{ padding: '6px 8px', textAlign: 'center', color: C.t1, fontWeight: 800 }}>{totalJogos.total}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      {/* Detailed partidas table */}
      <Card title="Detalhe das Partidas">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
            <thead>
              <tr style={{ background: C.bgAlt, position: 'sticky', top: 0 }}>
                {['Time', 'Campeonato', 'Data', 'Rodada', 'Dia', 'Horário'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
                <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 9, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Público</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 9, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Faturamento</th>
              </tr>
            </thead>
            <tbody>
              {[...partidas].filter(p => {
                if (campFilter && p.campeonato !== campFilter) return false;
                if (mesFilter  && p.mes        !== mesFilter)  return false;
                return true;
              }).sort((a, b) => b.data.localeCompare(a.data)).map((p, i) => (
                <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? 'transparent' : C.bgAlt + '44' }}>
                  <td style={{ padding: '6px 12px', color: C.t1, fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <TeamBadge name={p.time} size={18} />
                      {p.time}
                    </div>
                  </td>
                  <td style={{ padding: '6px 12px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: (CAMP_COLORS[p.campeonato] || C.t3) + '22', color: CAMP_COLORS[p.campeonato] || C.t3, borderRadius: 4, padding: '2px 6px', fontSize: 9, fontWeight: 700 }}>
                      {COMP_LOGOS[p.campeonato] && <img src={`/logos/${COMP_LOGOS[p.campeonato]}`} style={{ width: 12, height: 12, objectFit: 'contain' }} />}
                      {p.campeonato}
                    </span>
                  </td>
                  <td style={{ padding: '6px 12px', color: C.t2 }}>{p.data}</td>
                  <td style={{ padding: '6px 12px', color: C.t2 }}>{p.rodada}</td>
                  <td style={{ padding: '6px 12px', color: C.t3 }}>{p.diaSemana}</td>
                  <td style={{ padding: '6px 12px', color: C.t3 }}>{p.horario}</td>
                  <td style={{ padding: '6px 12px', textAlign: 'right', color: C.t2, fontWeight: 500 }}>{fatByPartida[p.id]?.utilizados?.toLocaleString('pt-BR') ?? '—'}</td>
                  <td style={{ padding: '6px 12px', textAlign: 'right', color: C.accent, fontWeight: 700 }}>{fatByPartida[p.id] ? fmtM(fatByPartida[p.id].faturamento) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
