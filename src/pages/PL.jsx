import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer,
} from 'recharts';
import { C, FONT_UI, SHADOW, CAMP_COLORS } from '../tokens';
import { COMP_LOGOS } from '../teamLogos.jsx';
import { plPorPartida, faturamentoPorPartida } from '../data/data';

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

// ── Championship filter button ───────────────────────────────────────────────
function FilterBtn({ label, active, onClick, color }) {
  const bg = active ? (color || C.accent) : C.card;
  const col = active ? '#000' : C.t2;
  const border = active ? (color || C.accent) : C.border;
  const logo = COMP_LOGOS[label];
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

// ── P&L row definitions ──────────────────────────────────────────────────────
// type: 'cat' = category header (bold, collapsible)
//       'item' = detail row (indented)
//       'total' = grand total row
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

// Categories that can be collapsed (have children)
const COLLAPSIBLE_CATS = new Set(['revenues', 'opex', 'margin', 'logistics', 'federations']);

// Unique championship names
const CAMP_NAMES = [...new Set(plPorPartida.map(d => d.campeonato).filter(Boolean))].sort();

// Lookup utilizados per partida from faturamentoPorPartida
const FAT_MAP = Object.fromEntries(faturamentoPorPartida.map(d => [d.idPartida, d.utilizados || 0]));

// ── Custom chart tooltip ─────────────────────────────────────────────────────
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 12px', fontSize: 10, fontFamily: FONT_UI }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: C.t1 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.stroke, marginBottom: 2 }}>
          {p.dataKey === 'revenues' ? 'Revenues' : 'Costs'}: {fmtBR(p.value)}
        </div>
      ))}
    </div>
  );
}

// ── Table constants ──────────────────────────────────────────────────────────
const LABEL_W  = 190;
const COL_W    = 134;
const HEAD_H   = 26; // px per header row

// Header row styles
const HDR_ROWS = [
  { bg: '#1e1e1e', color: '#aaa',      label: 'ID_PARTIDA',  fn: d => d.idPartida },
  { bg: '#252525', color: null,        label: 'Championship', fn: d => d.campeonato },
  { bg: '#2c2c2c', color: C.accent,   label: 'Team',         fn: d => d.time },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function PL() {
  const [campFilter, setCampFilter] = useState('ALL');
  const [collapsed, setCollapsed] = useState(new Set());

  const toggleCollapse = (catId) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId); else next.add(catId);
      return next;
    });
  };

  const filtered = useMemo(() => (
    campFilter === 'ALL' ? plPorPartida : plPorPartida.filter(d => d.campeonato === campFilter)
  ), [campFilter]);

  // Attendance KPIs
  const { attTotal, attAvg } = useMemo(() => {
    const total = filtered.reduce((s, d) => s + (FAT_MAP[d.idPartida] || 0), 0);
    return { attTotal: total, attAvg: filtered.length ? Math.round(total / filtered.length) : 0 };
  }, [filtered]);

  // Chart data — one point per match
  const chartData = useMemo(() => filtered.map(d => ({
    name: d.time,
    revenues: d.totalRevenues,
    costs: Math.abs(d.totalOperatingExpenses + d.totalLogistics + d.totalFederations),
  })), [filtered]);

  // Visible rows after collapse
  const visibleRows = useMemo(() => PL_ROWS.filter(row => {
    if (row.type === 'item' && row.cat && collapsed.has(row.cat)) return false;
    return true;
  }), [collapsed]);

  return (
    <div style={{ fontFamily: FONT_UI, color: C.t1 }}>

      {/* ── Top: filters + KPI cards ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1, alignItems: 'center' }}>
          <FilterBtn label="All" active={campFilter === 'ALL'} onClick={() => setCampFilter('ALL')} color={C.accent} />
          {CAMP_NAMES.map(c => (
            <FilterBtn key={c} label={c} active={campFilter === c} onClick={() => setCampFilter(c)} color={CAMP_COLORS[c]} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
          {[{ value: attTotal, label: 'Attendance' }, { value: attAvg, label: 'Average Attendance' }].map(({ value, label }) => (
            <div key={label} style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
              padding: '12px 24px', minWidth: 140, textAlign: 'center', boxShadow: SHADOW.card,
            }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: C.t1, lineHeight: 1.1 }}>{fmtAtt(value)}</div>
              <div style={{ fontSize: 10, color: C.t3, textTransform: 'uppercase', letterSpacing: '1px', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main content: chart + table ── */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

        {/* Left: Line chart */}
        <div style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
          boxShadow: SHADOW.card, padding: '16px 12px 8px 12px',
          flex: '0 0 380px', minWidth: 0,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.t2, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8 }}>
            Revenues and Costs per Match
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: C.t3 }}>Category</span>
            {[{ color: C.accent, label: 'Costs' }, { color: '#6b4fa0', label: 'Revenues' }].map(({ color, label }) => (
              <span key={label} style={{ fontSize: 10, color, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                {label}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 8, fill: C.t3 }}
                angle={-45}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 9, fill: C.t3 }} tickFormatter={fmtAxis} width={52} />
              <RTooltip content={<ChartTip />} />
              <Line type="monotone" dataKey="revenues" stroke="#6b4fa0" strokeWidth={2} dot={{ r: 3, fill: '#6b4fa0' }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="costs"    stroke={C.accent} strokeWidth={2} dot={{ r: 3, fill: C.accent }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 9, color: C.t3, textAlign: 'center', marginTop: 2, letterSpacing: '0.5px', textTransform: 'uppercase' }}>TIME</div>
        </div>

        {/* Right: P&L Table */}
        <div style={{
          flex: 1, minWidth: 0,
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
          boxShadow: SHADOW.card, overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 480 }}>
            <table style={{
              borderCollapse: 'collapse', fontSize: 10,
              minWidth: LABEL_W + filtered.length * COL_W,
              tableLayout: 'fixed',
            }}>

              {/* ── Table header (3 rows) ── */}
              <thead>
                {HDR_ROWS.map((hdr, hi) => (
                  <tr key={hi} style={{ background: hdr.bg, position: 'sticky', top: hi * HEAD_H, zIndex: 10 - hi }}>
                    {/* Label column */}
                    <th style={{
                      ...thLabelBase,
                      background: hdr.bg,
                      color: '#bbb',
                      position: 'sticky', left: 0, zIndex: 12,
                    }}>
                      {hdr.label}
                    </th>
                    {/* Value columns */}
                    {filtered.map(d => (
                      <th key={d.idPartida} style={{
                        ...thValBase,
                        background: hdr.bg,
                        color: hdr.color
                          ? (hi === 1 ? CAMP_COLORS[d.campeonato] || '#aaa' : hdr.color)
                          : '#bbb',
                        fontSize: hi === 0 ? 8 : 9,
                      }}>
                        {hdr.fn(d)}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              {/* ── Table body ── */}
              <tbody>
                {visibleRows.map((row, i) => {
                  const isCat   = row.type === 'cat';
                  const isTotal = row.type === 'total';
                  const rowBg   = isTotal ? '#1a1a1a'
                    : isCat  ? '#2e2e2e'
                    : i % 2 === 0 ? C.card : '#f9f9f9';

                  return (
                    <tr key={row.id} style={{ background: rowBg }}>
                      {/* Label cell */}
                      <td
                        onClick={() => isCat && COLLAPSIBLE_CATS.has(row.id) && toggleCollapse(row.id)}
                        style={{
                          ...tdLabelBase,
                          background: rowBg,
                          fontWeight: (isCat || isTotal) ? 700 : 400,
                          color: isTotal ? '#fff' : isCat ? '#e0e0e0' : C.t1,
                          paddingLeft: isCat || isTotal ? 8 : 20,
                          cursor: (isCat && COLLAPSIBLE_CATS.has(row.id)) ? 'pointer' : 'default',
                        }}
                      >
                        {isCat && COLLAPSIBLE_CATS.has(row.id) && (
                          <span style={{ marginRight: 5, fontSize: 9, color: '#999' }}>
                            {collapsed.has(row.id) ? '▶' : '▼'}
                          </span>
                        )}
                        {row.label}
                      </td>

                      {/* Value cells */}
                      {filtered.map(d => {
                        const v = d[row.key] ?? 0;
                        const abs = Math.abs(v);
                        const s = abs.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        let textColor;
                        if (isTotal) textColor = '#fff';
                        else if (isCat) textColor = v < 0 ? '#ff9a9a' : v > 0 ? '#88cc88' : '#888';
                        else textColor = v < 0 ? C.t1 : v > 0 ? C.t1 : C.t3;

                        return (
                          <td key={d.idPartida} style={{
                            ...tdValBase,
                            background: rowBg,
                            fontWeight: (isCat || isTotal) ? 700 : 400,
                            color: textColor,
                          }}>
                            {v === 0
                              ? <span style={{ color: '#aaa' }}>0,00</span>
                              : (v < 0 ? `-${s}` : s)
                            }
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
    </div>
  );
}

// ── Shared cell styles ────────────────────────────────────────────────────────
const thLabelBase = {
  padding: '4px 8px',
  textAlign: 'left',
  fontSize: 9,
  fontWeight: 600,
  letterSpacing: '0.5px',
  borderRight: '1px solid #444',
  borderBottom: '1px solid #444',
  width: LABEL_W,
  minWidth: LABEL_W,
  height: HEAD_H,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const thValBase = {
  padding: '4px 6px',
  textAlign: 'center',
  fontWeight: 500,
  borderRight: '1px solid #444',
  borderBottom: '1px solid #444',
  width: COL_W,
  minWidth: COL_W,
  height: HEAD_H,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const tdLabelBase = {
  padding: '3px 8px',
  fontSize: 10,
  whiteSpace: 'nowrap',
  borderBottom: `1px solid ${C.border}`,
  borderRight: '1px solid #ddd',
  width: LABEL_W,
  minWidth: LABEL_W,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  height: 22,
};

const tdValBase = {
  padding: '3px 8px',
  textAlign: 'right',
  fontSize: 10,
  whiteSpace: 'nowrap',
  borderBottom: `1px solid ${C.border}`,
  borderRight: `1px solid ${C.border}`,
  width: COL_W,
  minWidth: COL_W,
  height: 22,
};
