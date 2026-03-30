import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { C, FONT_UI, CAMP_COLORS } from '../tokens';
import { COMP_LOGOS } from '../teamLogos.jsx';
import { plPorPartida } from '../data/data';

// ── Categorias de despesa (cat1 e cat2) ─────────────────────────────────────
const CAT1_EXPENSES = ['operating expenses', 'logístics', 'federations'];
const CAT1_LABELS   = {
  'operating expenses': 'Operating Expenses',
  'logístics':          'Logistics',
  'federations':        'Federations',
};
const CAT1_COLORS = {
  'operating expenses': '#C9A84C',
  'logístics':          '#7c3aed',
  'federations':        '#555555',
};

// subcategories of operating expenses
const OP_SUBS = [
  'services', 'security', 'rentals', 'operating expenses',
  'fees and taxes', 'facial recognition system', 'entertainment', 'a&b',
];
const FED_SUBS  = ['taxes', 'personnel expenses', 'meal', 'arbitration'];
const LOG_SUBS  = ['accommodation'];

const SUB_COLORS = [
  '#C9A84C','#7c3aed','#555555','#7db87d',
  '#c97b7b','#7da8c9','#9e8fba','#c9a07a',
];

function Pill({ label, active, color, logo, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 12px', borderRadius: 8,
        border: `2px solid ${active ? (color || C.accent) : 'transparent'}`,
        cursor: 'pointer',
        background: active ? (color || C.accent) + '22' : C.bgAlt,
        color: active ? (color || C.accent) : C.t2,
        fontFamily: FONT_UI, fontSize: 12, fontWeight: active ? 700 : 400,
        transition: 'all 0.15s',
      }}
    >
      {logo && (
        <img src={`/logos/${logo}`} alt={label}
          style={{ width: 18, height: 18, objectFit: 'contain' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      )}
      {label}
    </button>
  );
}

function fmtM(v) {
  if (!v) return '0';
  const m = Math.abs(v) / 1_000_000;
  return (v < 0 ? '-' : '') + m.toFixed(2);
}

function CustomXTick({ x, y, payload }) {
  const parts = (payload.value || '').split('|');
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0} y={0} dy={12}
        textAnchor="end"
        fill={C.t3}
        fontSize={9}
        transform="rotate(-45)"
      >
        {parts[0]}
      </text>
      {parts[1] && (
        <text x={0} y={0} dy={22} textAnchor="end" fill={C.t3} fontSize={8} transform="rotate(-45)">
          {parts[1]}
        </text>
      )}
    </g>
  );
}

export default function PLDespesas() {
  const allCamps = useMemo(() => [...new Set(plPorPartida.map(p => p.campeonato))].filter(Boolean).sort(), []);
  const allAnos  = useMemo(() => [...new Set(plPorPartida.map(p => p.ano))].filter(Boolean).sort(), []);

  const [selCamps, setSelCamps] = useState(new Set(allCamps));
  const [selAnos,  setSelAnos]  = useState(new Set(allAnos));
  const [view, setView]         = useState('cat1'); // 'cat1' | 'cat2'
  const [selCat1, setSelCat1]   = useState(new Set(CAT1_EXPENSES));

  function toggleCamp(c) {
    setSelCamps(prev => { const n = new Set(prev); n.has(c) ? n.delete(c) : n.add(c); return n; });
  }
  function toggleAno(a) {
    setSelAnos(prev => { const n = new Set(prev); n.has(a) ? n.delete(a) : n.add(a); return n; });
  }
  function toggleCat1(c) {
    setSelCat1(prev => { const n = new Set(prev); n.has(c) ? n.delete(c) : n.add(c); return n; });
  }

  const filtered = useMemo(
    () => plPorPartida.filter(p => selCamps.has(p.campeonato) && selAnos.has(p.ano)),
    [selCamps, selAnos]
  );

  const totalExp = useMemo(() => filtered.reduce((s, p) => {
    let t = 0;
    CAT1_EXPENSES.forEach(c => { if (selCat1.has(c)) t += p.cat1?.[c] ?? 0; });
    return s + t;
  }, 0), [filtered, selCat1]);

  // ── Cat1 chart data ──────────────────────────────────────────────────────
  const cat1Data = useMemo(() => filtered.map(p => {
    const row = { label: `${p.time}|${p.data.slice(0,5)}` };
    CAT1_EXPENSES.forEach(c => {
      if (selCat1.has(c)) row[c] = Math.abs(p.cat1?.[c] ?? 0) / 1_000_000;
    });
    return row;
  }), [filtered, selCat1]);

  // ── Cat2 chart data (all op subcategories) ───────────────────────────────
  const allSubs = useMemo(() => {
    const subs = new Set();
    filtered.forEach(p => {
      CAT1_EXPENSES.forEach(c => {
        if (selCat1.has(c) && p.cat2?.[c]) {
          Object.keys(p.cat2[c]).forEach(s => subs.add(s));
        }
      });
    });
    return [...subs];
  }, [filtered, selCat1]);

  const cat2Data = useMemo(() => filtered.map(p => {
    const row = { label: `${p.time}|${p.data.slice(0,5)}` };
    CAT1_EXPENSES.forEach(c => {
      if (selCat1.has(c) && p.cat2?.[c]) {
        Object.entries(p.cat2[c]).forEach(([s, v]) => {
          row[s] = (row[s] ?? 0) + Math.abs(v) / 1_000_000;
        });
      }
    });
    return row;
  }), [filtered, selCat1]);

  const avgLine = useMemo(() => {
    if (!cat1Data.length) return 0;
    const active = CAT1_EXPENSES.filter(c => selCat1.has(c));
    const totals = cat1Data.map(d => active.reduce((s, c) => s + (d[c] ?? 0), 0));
    return totals.reduce((s, v) => s + v, 0) / totals.length;
  }, [cat1Data, selCat1]);

  const chartData = view === 'cat1' ? cat1Data : cat2Data;
  const bars      = view === 'cat1'
    ? CAT1_EXPENSES.filter(c => selCat1.has(c))
    : allSubs;
  const barColors = view === 'cat1'
    ? bars.map(b => CAT1_COLORS[b] || C.accent)
    : bars.map((_, i) => SUB_COLORS[i % SUB_COLORS.length]);

  return (
    <div style={{ fontFamily: FONT_UI, color: C.t1 }}>

      {/* ── Filters row ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {allCamps.map(c => (
          <Pill key={c} label={c} active={selCamps.has(c)} color={CAMP_COLORS[c] || C.accent} logo={COMP_LOGOS[c]} onClick={() => toggleCamp(c)} />
        ))}
        <div style={{ width: 1, height: 28, background: C.border, margin: '0 4px' }} />
        {allAnos.map(a => (
          <Pill key={a} label={String(a)} active={selAnos.has(a)} onClick={() => toggleAno(a)} />
        ))}
      </div>

      {/* ── Expense category filters ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {CAT1_EXPENSES.map(c => (
          <Pill key={c} label={CAT1_LABELS[c]} active={selCat1.has(c)} color={CAT1_COLORS[c]} onClick={() => toggleCat1(c)} />
        ))}
      </div>

      {/* ── KPI + View toggle ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
        <div style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: '16px 28px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.t3, textTransform: 'uppercase', letterSpacing: '1px' }}>TOTAL</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: totalExp < 0 ? C.red : C.green, marginTop: 4 }}>
            {totalExp < 0 ? '-' : ''}R$ {fmtM(Math.abs(totalExp))} Mi
          </div>
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', gap: 4 }}>
          {[['cat1', 'Categories'], ['cat2', 'Subcategories']].map(([v, lbl]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.border}`,
                cursor: 'pointer', fontFamily: FONT_UI, fontSize: 12, fontWeight: view === v ? 700 : 400,
                background: view === v ? C.accent : C.card,
                color: view === v ? '#fff' : C.t2,
                transition: 'all 0.15s',
              }}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* ── Bar chart ── */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
        padding: '20px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.t1, marginBottom: 4 }}>
          {view === 'cat1' ? 'Expenses by Category per Match' : 'Expenses by Subcategory per Match'}
        </div>
        <div style={{ fontSize: 11, color: C.t3, marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {bars.map((b, i) => (
            <span key={b} style={{ color: barColors[i] }}>
              ● {view === 'cat1' ? CAT1_LABELS[b] || b : b}
            </span>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={420}>
          <BarChart
            data={chartData}
            margin={{ top: 16, right: 16, bottom: 100, left: 20 }}
            barCategoryGap="20%"
            barGap={2}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis
              dataKey="label"
              tick={<CustomXTick />}
              interval={0}
              height={80}
            />
            <YAxis
              tickFormatter={v => `${v.toFixed(0)}`}
              tick={{ fontSize: 10, fill: C.t3 }}
              width={45}
              label={{ value: 'R$ Mi', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 10, fill: C.t3 } }}
            />
            <RTooltip
              formatter={(v, name) => [`R$ ${v.toFixed(2)} Mi`, view === 'cat1' ? (CAT1_LABELS[name] || name) : name]}
              labelFormatter={l => l.replace('|', ' – ')}
              labelStyle={{ color: C.t1, fontFamily: FONT_UI, fontSize: 11 }}
              contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11 }}
            />
            <ReferenceLine
              y={avgLine}
              stroke={C.t3}
              strokeDasharray="6 3"
              label={{ value: `avg ${avgLine.toFixed(2)}`, position: 'right', fontSize: 10, fill: C.t3 }}
            />
            {bars.map((b, i) => (
              <Bar key={b} dataKey={b} fill={barColors[i]} radius={[3, 3, 0, 0]} maxBarSize={28} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
