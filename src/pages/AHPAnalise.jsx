import { useState, useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, BarChart, Bar,
  Cell, LabelList, ReferenceLine,
} from 'recharts';
import { C, SHADOW, CAMP_COLORS } from '../tokens';
import { ahpScores } from '../data/data';

const BUCKETS = [
  { label: '1 – 2',   min: 1,   max: 2,   color: '#dc2626' },
  { label: '2 – 3',   min: 2,   max: 3,   color: '#f97316' },
  { label: '3 – 3,5', min: 3,   max: 3.5, color: '#ca8a04' },
  { label: '3,5 – 4', min: 3.5, max: 4,   color: '#a16207' },
  { label: '4 – 5',   min: 4,   max: 5,   color: '#16a34a' },
];

const getBucket = (total) => {
  if (total === null || total === undefined) return null;
  if (total < 2)   return 0;
  if (total < 3)   return 1;
  if (total < 3.5) return 2;
  if (total < 4)   return 3;
  return 4;
};

const fmtK = v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v);

const ANOS  = [...new Set(ahpScores.map(s => s.ano))].sort();
const CAMPS = [...new Set(ahpScores.map(s => s.campeonato).filter(Boolean))].sort();

const campColor = (c) => CAMP_COLORS?.[c] || C.accent;

const sectionTitle = { fontSize: 10, fontWeight: 700, color: C.t2, textTransform: 'uppercase', letterSpacing: '1.5px' };

const Card = ({ children, title, style }) => (
  <div style={{ background: C.card, borderRadius: 12, boxShadow: SHADOW.sm, border: `1px solid ${C.border}`, overflow: 'hidden', ...style }}>
    {title && (
      <div style={{ padding: '10px 16px', borderBottom: `1px solid ${C.border}`, ...sectionTitle }}>{title}</div>
    )}
    {children}
  </div>
);

const FilterBtn = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    padding: '4px 10px', borderRadius: 20, border: `1px solid ${active ? C.accent : C.border}`,
    background: active ? C.accent : 'transparent', color: active ? '#000' : C.t2,
    fontSize: 10, fontWeight: active ? 700 : 500, cursor: 'pointer', whiteSpace: 'nowrap',
  }}>{label}</button>
);

export default function AHPAnalise() {
  const [ano,  setAno]  = useState('Todos');
  const [camp, setCamp] = useState('Todos');

  const filtered = useMemo(() => {
    let rows = ahpScores.filter(s => s.total !== null && s.publico > 0);
    if (ano  !== 'Todos') rows = rows.filter(s => String(s.ano) === ano);
    if (camp !== 'Todos') rows = rows.filter(s => s.campeonato === camp);
    return rows;
  }, [ano, camp]);

  // ── KPI cards por bucket ──
  const bucketStats = useMemo(() => BUCKETS.map((b, i) => {
    const rows = filtered.filter(s => getBucket(s.total) === i);
    const avg  = rows.length ? Math.round(rows.reduce((s, r) => s + r.publico, 0) / rows.length) : 0;
    const max  = rows.length ? Math.max(...rows.map(r => r.publico)) : 0;
    const min  = rows.length ? Math.min(...rows.map(r => r.publico)) : 0;
    return { ...b, n: rows.length, avg, max, min, rows };
  }), [filtered]);

  // ── Bar chart data: avg público por bucket ──
  const barData = bucketStats.map(b => ({ label: b.label, avg: b.avg, n: b.n, color: b.color }));

  // ── Scatter data ──
  const scatterData = filtered.map(s => ({
    x: s.total,
    y: s.publico,
    campeonato: s.campeonato,
    time: s.time,
    data: s.data,
    bucket: getBucket(s.total),
  }));

  // ── Correlations (Pearson + Spearman) ──
  const corr = useMemo(() => {
    if (filtered.length < 3) return null;
    const xs = filtered.map(s => s.total);
    const ys = filtered.map(s => s.publico);

    // Pearson
    const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
    const my = ys.reduce((a, b) => a + b, 0) / ys.length;
    const num = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0);
    const den = Math.sqrt(xs.reduce((s, x) => s + (x - mx) ** 2, 0) * ys.reduce((s, y) => s + (y - my) ** 2, 0));
    const pearson = den === 0 ? 0 : num / den;

    // Spearman (rank correlation)
    const rank = (arr) => {
      const sorted = [...arr].map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
      const ranks = new Array(arr.length);
      sorted.forEach((item, ri) => { ranks[item.i] = ri + 1; });
      return ranks;
    };
    const rx = rank(xs), ry = rank(ys);
    const mrx = rx.reduce((a, b) => a + b, 0) / rx.length;
    const mry = ry.reduce((a, b) => a + b, 0) / ry.length;
    const snum = rx.reduce((s, r, i) => s + (r - mrx) * (ry[i] - mry), 0);
    const sden = Math.sqrt(rx.reduce((s, r) => s + (r - mrx) ** 2, 0) * ry.reduce((s, r) => s + (r - mry) ** 2, 0));
    const spearman = sden === 0 ? 0 : snum / sden;

    return { pearson, spearman };
  }, [filtered]);

  const DotTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const b = BUCKETS[d.bucket];
    return (
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', fontSize: 11, boxShadow: SHADOW.md }}>
        <p style={{ fontWeight: 700, color: C.t1, marginBottom: 3 }}>{d.time}</p>
        <p style={{ color: C.t3, fontSize: 10, marginBottom: 4 }}>{d.campeonato} · {d.data}</p>
        <p style={{ color: C.accent }}>AHP: <strong>{d.x.toFixed(3)}</strong></p>
        <p style={{ color: C.t2 }}>Público: <strong>{d.y.toLocaleString('pt-BR')}</strong></p>
        <p style={{ color: b.color, fontWeight: 700, fontSize: 10 }}>Categoria {b.label}</p>
      </div>
    );
  };

  const BarTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', fontSize: 11, boxShadow: SHADOW.md }}>
        <p style={{ fontWeight: 700, color: C.t1 }}>Categoria {d.label}</p>
        <p style={{ color: C.t2 }}>Média: <strong>{d.avg.toLocaleString('pt-BR')}</strong></p>
        <p style={{ color: C.t3 }}>{d.n} partida{d.n !== 1 ? 's' : ''}</p>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Filtros ── */}
      <div style={{ background: C.card, borderRadius: 12, padding: '14px 20px', boxShadow: SHADOW.sm, border: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={sectionTitle}>Ano</span>
            <FilterBtn label="Todos" active={ano === 'Todos'} onClick={() => setAno('Todos')} />
            {ANOS.map(a => <FilterBtn key={a} label={String(a)} active={ano === String(a)} onClick={() => setAno(String(a))} />)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={sectionTitle}>Campeonato</span>
            <FilterBtn label="Todos" active={camp === 'Todos'} onClick={() => setCamp('Todos')} />
            {CAMPS.map(c => <FilterBtn key={c} label={c} active={camp === c} onClick={() => setCamp(c)} />)}
          </div>
        </div>
        {corr !== null && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, color: C.t3 }}>Correlação AHP × Público ({filtered.length} partidas):</span>
            {[
              { label: 'Pearson', value: corr.pearson },
              { label: 'Spearman', value: corr.spearman },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 10, color: C.t3 }}>{label}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: value > 0.7 ? '#16a34a' : value > 0.5 ? C.accent : '#dc2626' }}>
                  r = {value.toFixed(3)}
                </span>
                <span style={{ fontSize: 9, color: C.t3 }}>
                  ({value > 0.7 ? 'forte' : value > 0.5 ? 'moderada' : 'fraca'})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── KPI cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {bucketStats.map(b => (
          <div key={b.label} style={{
            background: C.card, borderRadius: 12, padding: '14px 16px',
            boxShadow: SHADOW.sm, border: `1px solid ${C.border}`,
            borderTop: `3px solid ${b.color}`,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: b.color, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
              Categoria {b.label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.t1, fontVariantNumeric: 'tabular-nums' }}>
              {b.n > 0 ? fmtK(b.avg) : '—'}
            </div>
            <div style={{ fontSize: 9, color: C.t3, marginTop: 2 }}>público médio</div>
            {b.n > 0 && (
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 9, color: C.t3 }}>
                <span>mín {fmtK(b.min)}</span>
                <span style={{ fontWeight: 700, color: C.t2 }}>{b.n} jogos</span>
                <span>máx {fmtK(b.max)}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16 }}>

        {/* Bar chart */}
        <Card title="Público Médio por Categoria AHP">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} margin={{ top: 20, right: 24, bottom: 8, left: 10 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: C.t3, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
              <RTooltip content={<BarTooltip />} />
              <Bar dataKey="avg" radius={[6, 6, 0, 0]} barSize={52}>
                {barData.map((d, i) => <Cell key={i} fill={d.color} />)}
                <LabelList dataKey="avg" position="top" formatter={fmtK} style={{ fontSize: 10, fontWeight: 700, fill: C.t2 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Scatter plot */}
        <Card title="AHP Score × Público por Partida">
          <div style={{ padding: '6px 16px 0', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {BUCKETS.map(b => (
              <span key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: C.t2 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: b.color, display: 'inline-block' }} />
                {b.label}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 12, right: 24, bottom: 8, left: 10 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
              <XAxis
                type="number" dataKey="x" name="AHP" domain={[1, 5]}
                tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false}
                label={{ value: 'AHP Score', position: 'insideBottom', offset: -2, fill: C.t3, fontSize: 9 }}
              />
              <YAxis
                type="number" dataKey="y" name="Público"
                tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false}
                tickFormatter={fmtK}
              />
              <RTooltip content={<DotTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              {[2, 3, 3.5, 4].map(v => (
                <ReferenceLine key={v} x={v} stroke={C.border} strokeDasharray="4 2" />
              ))}
              <Scatter data={scatterData} shape={(props) => {
                const { cx, cy, payload } = props;
                const color = BUCKETS[payload.bucket]?.color || C.accent;
                return <circle cx={cx} cy={cy} r={5} fill={color} fillOpacity={0.75} stroke="#fff" strokeWidth={1} />;
              }} />
            </ScatterChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Tabela por categoria ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {bucketStats.filter(b => b.n > 0).map(b => (
          <Card key={b.label} title={`Categoria ${b.label} — ${b.n} partida${b.n !== 1 ? 's' : ''}`}>
            <div style={{ overflowY: 'auto', maxHeight: 240 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: C.bgAlt, position: 'sticky', top: 0 }}>
                    <th style={{ padding: '6px 10px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: C.t3, textTransform: 'uppercase' }}>Partida</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right', fontSize: 9, fontWeight: 700, color: b.color }}>AHP</th>
                    <th style={{ padding: '6px 10px', textAlign: 'right', fontSize: 9, fontWeight: 700, color: C.t3 }}>Público</th>
                  </tr>
                </thead>
                <tbody>
                  {[...b.rows].sort((a, z) => z.publico - a.publico).map((s, i) => (
                    <tr key={s.idPartida} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 !== 0 ? C.bgAlt + '66' : 'transparent' }}>
                      <td style={{ padding: '6px 10px', color: C.t1 }}>
                        <div style={{ fontWeight: 600 }}>{s.time}</div>
                        <div style={{ fontSize: 9, color: C.t3 }}>{s.campeonato} · {s.data}</div>
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, color: b.color, fontVariantNumeric: 'tabular-nums' }}>
                        {s.total.toFixed(3)}
                      </td>
                      <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600, color: C.t1, fontVariantNumeric: 'tabular-nums' }}>
                        {s.publico.toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>

    </div>
  );
}
