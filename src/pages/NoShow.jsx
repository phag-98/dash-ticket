import { useState, useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, ReferenceLine,
  BarChart, Bar, Cell,
} from 'recharts';
import { C, FONT, SHADOW, CAMP_COLORS as TOKEN_CAMP_COLORS } from '../tokens';
import { noShowAnalysis, noShowPorTorcedor, partidas } from '../data/data';
import { useIsMobile } from '../hooks/useMediaQuery';
import FilterBtnBase from '../components/FilterBtn';

const fmtM = v => {
  if (!v && v !== 0) return '—';
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(2).replace('.', ',')} Mi`;
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
// No Show usa chips sem logo e padding menor
const FilterBtn = (props) => (
  <FilterBtnBase padding="4px 10px" inactiveBg={C.bgAlt} autoLogo={false} {...props} />
);

// ── Section title style
const sectionTitle = {
  fontSize: 9, fontWeight: 700, color: C.t2,
  textTransform: 'uppercase', letterSpacing: '1.5px',
  marginBottom: 6,
};

// Derived filter options
const HORARIOS = [...new Set(partidas.map(p => p.horario).filter(Boolean))].sort();
const DIAS = [...new Set(partidas.map(p => p.diaSemana).filter(Boolean))].sort();
const CAMP_NAMES = [...new Set(partidas.map(p => p.campeonato).filter(Boolean))].sort();

function Card({ children, title, style = {} }) {
  return (
    <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, boxShadow: SHADOW.card, ...style }}>
      {title && <div style={{ padding: '12px 16px 0', fontSize: 11, fontWeight: 700, color: C.t1, marginBottom: 4 }}>{title}</div>}
      {children}
    </div>
  );
}

const ScatterTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', fontSize: 11, boxShadow: SHADOW.md }}>
      <p style={{ fontWeight: 700, color: C.t1, marginBottom: 4 }}>{d.time}</p>
      <p style={{ color: C.t2 }}>Data: <b style={{ color: C.t1 }}>{d.data}</b></p>
      <p style={{ color: C.t2 }}>Público: <b style={{ color: C.t1 }}>{d.publico?.toLocaleString('pt-BR')}</b></p>
      <p style={{ color: C.t2 }}>No Show: <b style={{ color: C.red }}>{(d.percentualNoShow * 100).toFixed(1)}%</b></p>
      <p style={{ color: CAMP_COLORS[d.campeonato] || C.t2 }}>{d.campeonato}</p>
    </div>
  );
};

export default function NoShow() {
  const isMobile = useIsMobile();
  const [horFilter, setHorFilter] = useState(null);
  const [diaFilter, setDiaFilter] = useState(null);
  const [anoFilter, setAnoFilter] = useState(null);
  const [campFilter, setCampFilter] = useState(null);

  const filtered = useMemo(() => noShowAnalysis.filter(d => {
    if (horFilter && d.horario !== horFilter) return false;
    if (diaFilter && d.diaSemana !== diaFilter) return false;
    if (anoFilter && d.ano !== anoFilter) return false;
    if (campFilter && d.campeonato !== campFilter) return false;
    return true;
  }), [horFilter, diaFilter, anoFilter, campFilter]);

  // Scatter data per campeonato
  const scatterGroups = useMemo(() => {
    return CAMP_NAMES.map(c => ({
      campeonato: c,
      data: filtered.filter(d => d.campeonato === c).map(d => ({
        ...d, x: d.publico, y: d.percentualNoShow,
      })),
      fill: CAMP_COLORS[c] || '#888',
    })).filter(g => g.data.length > 0);
  }, [filtered]);

  const avgNS = filtered.length ? filtered.reduce((s, d) => s + d.percentualNoShow, 0) / filtered.length : 0;
  const totalNoShow = filtered.reduce((s, d) => s + d.noShow, 0);
  const totalFatNS  = filtered.reduce((s, d) => s + d.fatNoShow, 0);

  // No show per campeonato summary
  const byCamp = useMemo(() => {
    const map = {};
    CAMP_NAMES.forEach(c => { map[c] = { campeonato: c, noShow: 0, fatNoShow: 0, n: 0, sumPct: 0 }; });
    filtered.forEach(d => {
      if (map[d.campeonato]) {
        map[d.campeonato].noShow    += d.noShow;
        map[d.campeonato].fatNoShow += d.fatNoShow;
        map[d.campeonato].n++;
        map[d.campeonato].sumPct += d.percentualNoShow;
      }
    });
    return Object.values(map).filter(c => c.n > 0).sort((a, b) => b.noShow - a.noShow);
  }, [filtered]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Filters */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', boxShadow: SHADOW.card }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={sectionTitle}>Horário</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {HORARIOS.map(h => (
                <FilterBtn key={h} label={h} active={horFilter === h} onClick={() => setHorFilter(horFilter === h ? null : h)} />
              ))}
            </div>
          </div>
          <div>
            <div style={sectionTitle}>Dia da Semana</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {DIAS.map(d => (
                <FilterBtn key={d} label={d} active={diaFilter === d} onClick={() => setDiaFilter(diaFilter === d ? null : d)} />
              ))}
            </div>
          </div>
          <div>
            <div style={sectionTitle}>Ano</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[null, 2024, 2025].map(a => (
                <FilterBtn key={a ?? 'todos'} label={a ?? 'Todos'} active={anoFilter === a} onClick={() => setAnoFilter(anoFilter === a ? null : a)} />
              ))}
            </div>
          </div>
          <div>
            <div style={sectionTitle}>Campeonato</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {CAMP_NAMES.map(c => (
                <FilterBtn key={c} label={c} active={campFilter === c} onClick={() => setCampFilter(campFilter === c ? null : c)} color={CAMP_COLORS[c]} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 360px', gap: 14 }}>

        {/* Scatter */}
        <Card title="PÚBLICO vs Percentual NO SHOW por Partida">
          <div style={{ padding: '4px 16px 8px', display: 'flex', gap: 12 }}>
            {scatterGroups.map(g => (
              <span key={g.campeonato} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: C.t2 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: g.fill, display: 'inline-block' }} />
                {g.campeonato}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top: 8, right: 24, bottom: 20, left: 16 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
              <XAxis type="number" dataKey="x" name="Público" tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={fmtK}
                label={{ value: 'PÚBLICO', position: 'insideBottom', fill: C.t3, fontSize: 9, offset: -8 }} />
              <YAxis type="number" dataKey="y" name="No Show %" tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v * 100).toFixed(0)}%`}
                label={{ value: '% NO SHOW', angle: -90, position: 'insideLeft', fill: C.t3, fontSize: 9, dx: -4 }} />
              <RTooltip content={<ScatterTooltip />} />
              {scatterGroups.map(g => (
                <Scatter key={g.campeonato} name={g.campeonato} data={g.data} fill={g.fill} opacity={0.8} r={5} />
              ))}
              <ReferenceLine y={avgNS} stroke={C.t3} strokeDasharray="4 2"
                label={{ value: `Média ${(avgNS * 100).toFixed(1)}%`, fill: C.t3, fontSize: 8, position: 'insideTopRight' }} />
            </ScatterChart>
          </ResponsiveContainer>
        </Card>

        {/* No show table + KPIs */}
        <Card title="No Show por Campeonato">
          <div style={{ padding: '8px 0 4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
              <thead>
                <tr style={{ background: C.bgAlt }}>
                  <th style={{ padding: '7px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: C.t3, textTransform: 'uppercase' }}>Campeonato</th>
                  <th style={{ padding: '7px 8px', textAlign: 'right', fontSize: 9, fontWeight: 700, color: C.t3, textTransform: 'uppercase' }}>No Show</th>
                  <th style={{ padding: '7px 8px', textAlign: 'right', fontSize: 9, fontWeight: 700, color: C.t3, textTransform: 'uppercase' }}>Fat. NS</th>
                  <th style={{ padding: '7px 10px', textAlign: 'right', fontSize: 9, fontWeight: 700, color: C.t3, textTransform: 'uppercase' }}>% NS</th>
                </tr>
              </thead>
              <tbody>
                {byCamp.map((r, i) => (
                  <tr key={r.campeonato} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? 'transparent' : C.bgAlt + '44' }}>
                    <td style={{ padding: '6px 12px' }}>
                      <span style={{ background: (CAMP_COLORS[r.campeonato] || C.t3) + '22', color: CAMP_COLORS[r.campeonato] || C.t3, borderRadius: 4, padding: '2px 6px', fontSize: 9, fontWeight: 700 }}>{r.campeonato}</span>
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: C.t1, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{r.noShow.toLocaleString('pt-BR')}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: C.amber, fontVariantNumeric: 'tabular-nums' }}>{fmtM(r.fatNoShow)}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', color: C.red, fontWeight: 700 }}>{(r.sumPct / r.n * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: `2px solid ${C.border}`, background: C.bgAlt }}>
                  <td style={{ padding: '7px 12px', fontWeight: 700, color: C.t1 }}>Total</td>
                  <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 700, color: C.t1, fontVariantNumeric: 'tabular-nums' }}>{totalNoShow.toLocaleString('pt-BR')}</td>
                  <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 700, color: C.amber, fontVariantNumeric: 'tabular-nums' }}>{fmtM(totalFatNS)}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700, color: C.red }}>{(avgNS * 100).toFixed(1)}%</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style={{ display: 'flex', gap: 8, padding: '12px' }}>
            <div style={{ flex: 1, background: C.bgAlt, borderRadius: 8, padding: '10px 12px', border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 8, color: C.t3, textTransform: 'uppercase', marginBottom: 4 }}>Total No Show</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.red }}>{totalNoShow.toLocaleString('pt-BR')}</div>
            </div>
            <div style={{ flex: 1, background: C.bgAlt, borderRadius: 8, padding: '10px 12px', border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 8, color: C.t3, textTransform: 'uppercase', marginBottom: 4 }}>Média %</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.amber }}>{(avgNS * 100).toFixed(1)}%</div>
            </div>
          </div>
        </Card>
      </div>

      {/* No show % por campeonato — cards */}
      <Card title="Percentual NO SHOW por Campeonato">
        <div style={{ display: 'flex', gap: 12, padding: '8px 16px 16px', flexWrap: 'wrap' }}>
          {byCamp.map(c => (
            <div key={c.campeonato} style={{ flex: 1, minWidth: 120, background: C.bgAlt, borderRadius: 8, padding: '12px 14px', border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 9, color: CAMP_COLORS[c.campeonato] || C.t2, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{c.campeonato}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.red }}>{(c.sumPct / c.n * 100).toFixed(1)}%</div>
              <div style={{ marginTop: 6, background: C.border, borderRadius: 3, height: 4, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min((c.sumPct / c.n) * 500, 100)}%`, height: '100%', background: C.red, borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 8, color: C.t3, marginTop: 4 }}>{c.n} partidas</div>
            </div>
          ))}
        </div>
      </Card>

      {/* No show por torcedor table */}
      <Card title="No Show por Tipo de Torcedor">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
            <thead>
              <tr style={{ background: C.bgAlt }}>
                {['Torcedor', 'Sócio', 'No Show', 'Fat. No Show', '% No Show', 'Emitidos'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Torcedor' ? 'left' : 'right', fontSize: 9, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {noShowPorTorcedor.map((r, i) => (
                <tr key={r.idTorcedor} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? 'transparent' : C.bgAlt + '44' }}>
                  <td style={{ padding: '6px 12px', color: C.t1, fontWeight: 500 }}>{r.torcedor}</td>
                  <td style={{ padding: '6px 12px', textAlign: 'right' }}>
                    <span style={{ background: r.socio === 'Sim' ? C.green + '22' : C.t3 + '22', color: r.socio === 'Sim' ? C.green : C.t3, borderRadius: 4, padding: '2px 6px', fontSize: 9, fontWeight: 700 }}>{r.socio}</span>
                  </td>
                  <td style={{ padding: '6px 12px', textAlign: 'right', color: C.red, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{r.noShow.toLocaleString('pt-BR')}</td>
                  <td style={{ padding: '6px 12px', textAlign: 'right', color: C.amber, fontVariantNumeric: 'tabular-nums' }}>{fmtM(r.fatNoShow)}</td>
                  <td style={{ padding: '6px 12px', textAlign: 'right', color: C.red, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{(r.percentualNoShow * 100).toFixed(1)}%</td>
                  <td style={{ padding: '6px 12px', textAlign: 'right', color: C.t2, fontVariantNumeric: 'tabular-nums' }}>{r.emitidos.toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
