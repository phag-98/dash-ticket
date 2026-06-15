import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer,
} from 'recharts';
import { C, FONT_UI, SHADOW, CAMP_COLORS } from '../tokens';
import { COMP_LOGOS, LOGO_MAP } from '../teamData';
import { plPorPartida, faturamentoPorPartida } from '../data/data';
import FilterBtnBase from '../components/FilterBtn';

// ── Formatters ───────────────────────────────────────────────────────────────
const fmtBR = (v) => {
  if (v === 0 || v == null) return '0,00';
  const abs = Math.abs(v);
  const s = abs.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return v < 0 ? `-${s}` : s;
};
const fmtAtt = (v) => {
  if (!v) return '0';
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2).replace('.', ',')} Mi`;
  if (v >= 1_000) return `${Math.round(v / 1_000)} Mil`;
  return `${v}`;
};
const fmtAxis = (v) =>
  v >= 1e6 ? `${(v / 1e6).toFixed(1)} Mi` : `${(v / 1000).toFixed(0)} K`;

// ── Filter button ────────────────────────────────────────────────────────────
// P&L usa padding um pouco menor
const FilterBtn = (props) => <FilterBtnBase padding="4px 12px" {...props} />;

// ── Custom X-axis tick with team logo ────────────────────────────────────────
function LogoTick({ x, y, payload }) {
  const name = payload?.value;
  const logo = LOGO_MAP[name];
  const SIZE = 20;
  if (logo) {
    return (
      <g transform={`translate(${x},${y + 4})`}>
        <image href={`/logos/${logo}`} x={-SIZE / 2} y={0} width={SIZE} height={SIZE} />
      </g>
    );
  }
  const short = (name || '').split(' ').slice(-1)[0].slice(0, 6);
  return (
    <g transform={`translate(${x},${y + 4})`}>
      <text x={0} y={0} dy={12} textAnchor="middle" fill={C.t3} fontSize={8}>{short}</text>
    </g>
  );
}

// ── Custom chart tooltip ─────────────────────────────────────────────────────
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 12px', fontSize: 10, fontFamily: FONT_UI }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: C.t1 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.stroke, marginBottom: 2 }}>
          {p.dataKey === 'revenues' ? 'Revenues' : 'Costs'}: {fmtBR(p.value)}
        </div>
      ))}
    </div>
  );
}

// ── P&L row definitions ──────────────────────────────────────────────────────
const PL_ROWS = [
  { id: 'revenues',          label: 'revenues',                  type: 'cat',   key: 'totalRevenues',          cat: 'revenues' },
  { id: 'rebateIngresse',    label: 'rebate ingresse',           type: 'item',  key: 'rebateIngresse',         cat: 'revenues' },
  { id: 'parking',           label: 'parking',                   type: 'item',  key: 'parking',                cat: 'revenues' },
  { id: 'matchdayIngresse',  label: 'matchday ingresse',         type: 'item',  key: 'matchdayIngresse',       cat: 'revenues' },
  { id: 'firezone',          label: 'firezone',                  type: 'item',  key: 'firezone',               cat: 'revenues' },
  { id: 'arenaKids',         label: 'arena kids',                type: 'item',  key: 'arenaKids',              cat: 'revenues' },
  { id: 'aeb',               label: 'a&b',                       type: 'item',  key: 'aeb',                    cat: 'revenues' },
  { id: 'opex',              label: 'operating expenses',        type: 'cat',   key: 'totalOperatingExpenses', cat: 'opex' },
  { id: 'services',          label: 'services',                  type: 'item',  key: 'services',               cat: 'opex' },
  { id: 'security',          label: 'security',                  type: 'item',  key: 'security',               cat: 'opex' },
  { id: 'rentals',           label: 'rentals',                   type: 'item',  key: 'rentals',                cat: 'opex' },
  { id: 'operatingExpenses', label: 'operating expenses',        type: 'item',  key: 'operatingExpenses',      cat: 'opex' },
  { id: 'feesAndTaxes',      label: 'fees and taxes',            type: 'item',  key: 'feesAndTaxes',           cat: 'opex' },
  { id: 'facialRecognition', label: 'facial recognition system', type: 'item',  key: 'facialRecognition',      cat: 'opex' },
  { id: 'entertainment',     label: 'entertainment',             type: 'item',  key: 'entertainment',          cat: 'opex' },
  { id: 'margin',            label: 'margin',                    type: 'cat',   key: 'margin',                 cat: 'margin' },
  { id: 'marginItem',        label: 'margin',                    type: 'item',  key: 'margin',                 cat: 'margin' },
  { id: 'logistics',         label: 'logistics',                 type: 'cat',   key: 'totalLogistics',         cat: 'logistics' },
  { id: 'accommodation',     label: 'accommodation',             type: 'item',  key: 'accommodation',          cat: 'logistics' },
  { id: 'federations',       label: 'federations',               type: 'cat',   key: 'totalFederations',       cat: 'federations' },
  { id: 'taxes',             label: 'taxes',                     type: 'item',  key: 'taxes',                  cat: 'federations' },
  { id: 'personnelExpenses', label: 'personnel expenses',        type: 'item',  key: 'personnelExpenses',      cat: 'federations' },
  { id: 'meal',              label: 'meal',                      type: 'item',  key: 'meal',                   cat: 'federations' },
  { id: 'arbitration',       label: 'arbitration',               type: 'item',  key: 'arbitration',            cat: 'federations' },
  { id: 'total',             label: 'Total',                     type: 'total', key: 'total',                  cat: null },
];
const COLLAPSIBLE = new Set(['revenues', 'opex', 'margin', 'logistics', 'federations']);

// ── Static lists ─────────────────────────────────────────────────────────────
const CAMP_NAMES = [...new Set(plPorPartida.map(d => d.campeonato).filter(Boolean))].sort();
const YEARS      = [...new Set(plPorPartida.map(d => d.ano).filter(Boolean))].sort();
const FAT_MAP    = Object.fromEntries(faturamentoPorPartida.map(d => [d.idPartida, d.utilizados || 0]));

// Table dimensions
const LABEL_W = 190;
const COL_W   = 134;
const HEAD_H  = 26;

// ── Component ────────────────────────────────────────────────────────────────
export default function PL() {
  const [campFilter, setCampFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [collapsed, setCollapsed]   = useState(new Set());

  const toggleCollapse = (id) =>
    setCollapsed(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // plPorPartida is already sorted by date from generate_data.py
  const filtered = useMemo(() => plPorPartida.filter(d =>
    (campFilter === 'ALL' || d.campeonato === campFilter) &&
    (yearFilter === 'ALL' || d.ano === Number(yearFilter))
  ), [campFilter, yearFilter]);

  // KPI attendance
  const { attTotal, attAvg } = useMemo(() => {
    const total = filtered.reduce((s, d) => s + (FAT_MAP[d.idPartida] || 0), 0);
    return { attTotal: total, attAvg: filtered.length ? Math.round(total / filtered.length) : 0 };
  }, [filtered]);

  // Chart data — already ordered by date
  const chartData = useMemo(() => filtered.map(d => ({
    name:     d.time,
    revenues: d.totalRevenues,
    costs:    Math.abs(d.totalOperatingExpenses + d.totalLogistics + d.totalFederations),
  })), [filtered]);

  // Visible table rows
  const visibleRows = useMemo(() =>
    PL_ROWS.filter(r => !(r.type === 'item' && r.cat && collapsed.has(r.cat)))
  , [collapsed]);

  return (
    <div style={{ fontFamily: FONT_UI, color: C.t1 }}>

      {/* ── Filters + KPIs ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          {/* Championship filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <FilterBtn label="All" active={campFilter === 'ALL'} onClick={() => setCampFilter('ALL')} color={C.accent} />
            {CAMP_NAMES.map(c => (
              <FilterBtn key={c} label={c} active={campFilter === c} onClick={() => setCampFilter(c)}
                color={CAMP_COLORS[c]} logo={COMP_LOGOS[c]} />
            ))}
          </div>
          {/* Year filters */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: C.t3, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Ano</span>
            <FilterBtn label="Todos" active={yearFilter === 'ALL'} onClick={() => setYearFilter('ALL')} color={C.accent} />
            {YEARS.map(y => (
              <FilterBtn key={y} label={String(y)} active={yearFilter === String(y)} onClick={() => setYearFilter(String(y))} color={C.accent} />
            ))}
          </div>
        </div>
        {/* KPI cards */}
        <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
          {[{ v: attTotal, l: 'Attendance' }, { v: attAvg, l: 'Average Attendance' }].map(({ v, l }) => (
            <div key={l} style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
              padding: '12px 24px', minWidth: 140, textAlign: 'center', boxShadow: SHADOW.card,
            }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: C.t1, lineHeight: 1.1 }}>{fmtAtt(v)}</div>
              <div style={{ fontSize: 10, color: C.t3, textTransform: 'uppercase', letterSpacing: '1px', marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chart (full width, on top) ── */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
        boxShadow: SHADOW.card, padding: '16px 16px 8px', marginBottom: 16,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.t2, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>
          Revenues and Costs per Match
        </div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: C.t3 }}>Category</span>
          {[{ color: C.accent, label: 'Costs' }, { color: '#6b4fa0', label: 'Revenues' }].map(({ color, label }) => (
            <span key={label} style={{ fontSize: 10, color, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
              {label}
            </span>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 36 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis
              dataKey="name"
              tick={<LogoTick />}
              interval={0}
              height={36}
            />
            <YAxis tick={{ fontSize: 9, fill: C.t3 }} tickFormatter={fmtAxis} width={52} />
            <RTooltip content={<ChartTip />} />
            <Line type="monotone" dataKey="revenues" stroke="#6b4fa0" strokeWidth={2} dot={{ r: 3, fill: '#6b4fa0' }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="costs"    stroke={C.accent} strokeWidth={2} dot={{ r: 3, fill: C.accent }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ fontSize: 9, color: C.t3, textAlign: 'center', letterSpacing: '0.5px', textTransform: 'uppercase' }}>TIME</div>
      </div>

      {/* ── P&L Table (full width, below) ── */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
        boxShadow: SHADOW.card, overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 520 }}>
          <table style={{
            borderCollapse: 'collapse', fontSize: 10,
            minWidth: LABEL_W + filtered.length * COL_W,
            tableLayout: 'fixed',
          }}>

            {/* Header rows */}
            <thead>
              {[
                { bg: '#1e1e1e', fn: d => d.idPartida,   label: 'ID_PARTIDA',   color: () => '#bbb',                            fs: 8 },
                { bg: '#252525', fn: d => d.campeonato,  label: 'Championship', color: d => CAMP_COLORS[d.campeonato] || '#aaa', fs: 9 },
                { bg: '#2c2c2c', fn: d => d.time,        label: 'Team',         color: () => C.accent,                          fs: 9 },
              ].map((hdr, hi) => (
                <tr key={hi} style={{ background: hdr.bg, position: 'sticky', top: hi * HEAD_H, zIndex: 10 - hi }}>
                  <th style={{ ...thLabel, background: hdr.bg, color: '#bbb', position: 'sticky', left: 0, zIndex: 12 }}>
                    {hdr.label}
                  </th>
                  {filtered.map(d => (
                    <th key={d.idPartida} style={{ ...thVal, background: hdr.bg, color: hdr.color(d), fontSize: hdr.fs }}>
                      {hdr.fn(d)}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            {/* Body */}
            <tbody>
              {visibleRows.map((row, i) => {
                const isCat   = row.type === 'cat';
                const isTotal = row.type === 'total';
                const rowBg   = isTotal ? '#1a1a1a' : isCat ? '#2e2e2e' : i % 2 === 0 ? C.card : '#f9f9f9';
                return (
                  <tr key={row.id} style={{ background: rowBg }}>
                    <td
                      onClick={() => isCat && COLLAPSIBLE.has(row.id) && toggleCollapse(row.id)}
                      onKeyDown={(e) => { if ((isCat && COLLAPSIBLE.has(row.id)) && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggleCollapse(row.id); } }}
                      role={(isCat && COLLAPSIBLE.has(row.id)) ? 'button' : undefined}
                      tabIndex={(isCat && COLLAPSIBLE.has(row.id)) ? 0 : undefined}
                      aria-expanded={(isCat && COLLAPSIBLE.has(row.id)) ? !collapsed.has(row.id) : undefined}
                      style={{
                        ...tdLabel, background: rowBg,
                        fontWeight: (isCat || isTotal) ? 700 : 400,
                        color: isTotal ? '#fff' : isCat ? '#e0e0e0' : C.t1,
                        paddingLeft: isCat || isTotal ? 8 : 20,
                        cursor: (isCat && COLLAPSIBLE.has(row.id)) ? 'pointer' : 'default',
                      }}
                    >
                      {isCat && COLLAPSIBLE.has(row.id) && (
                        <span style={{ marginRight: 5, fontSize: 9, color: '#999' }}>
                          {collapsed.has(row.id) ? '▶' : '▼'}
                        </span>
                      )}
                      {row.label}
                    </td>
                    {filtered.map(d => {
                      const v   = d[row.key] ?? 0;
                      const abs = Math.abs(v);
                      const s   = abs.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                      const tc  = isTotal ? '#fff'
                        : isCat  ? (v < 0 ? '#ff9a9a' : v > 0 ? '#88cc88' : '#888')
                        : C.t1;
                      return (
                        <td key={d.idPartida} style={{ ...tdVal, background: rowBg, fontWeight: (isCat || isTotal) ? 700 : 400, color: tc }}>
                          {v === 0 ? <span style={{ color: '#aaa' }}>0,00</span> : (v < 0 ? `-${s}` : s)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Cell styles ───────────────────────────────────────────────────────────────
const thLabel = {
  padding: '4px 8px', textAlign: 'left', fontSize: 9, fontWeight: 600,
  letterSpacing: '0.5px', borderRight: '1px solid #444', borderBottom: '1px solid #444',
  width: LABEL_W, minWidth: LABEL_W, height: HEAD_H, whiteSpace: 'nowrap',
  overflow: 'hidden', textOverflow: 'ellipsis',
};
const thVal = {
  padding: '4px 6px', textAlign: 'center', fontWeight: 500,
  borderRight: '1px solid #444', borderBottom: '1px solid #444',
  width: COL_W, minWidth: COL_W, height: HEAD_H, whiteSpace: 'nowrap',
  overflow: 'hidden', textOverflow: 'ellipsis',
};
const tdLabel = {
  padding: '3px 8px', fontSize: 10, whiteSpace: 'nowrap',
  borderBottom: `1px solid ${C.border}`, borderRight: '1px solid #ddd',
  width: LABEL_W, minWidth: LABEL_W, overflow: 'hidden', textOverflow: 'ellipsis', height: 22,
};
const tdVal = {
  padding: '3px 8px', textAlign: 'right', fontSize: 10, whiteSpace: 'nowrap',
  borderBottom: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`,
  width: COL_W, minWidth: COL_W, height: 22,
};
