import { useState, useMemo, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer,
} from 'recharts';
import { C, FONT_UI, SHADOW, CAMP_COLORS } from '../tokens';
import { COMP_LOGOS, LOGO_MAP } from '../teamLogos.jsx';
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

// ── Filter button ────────────────────────────────────────────────────────────
function FilterBtn({ label, active, onClick, color, logo }) {
  const bg = active ? (color || C.accent) : C.card;
  const col = active ? '#000' : C.t2;
  const border = active ? (color || C.accent) : C.border;
  return (
    <button onClick={onClick} style={{
      padding: '4px 12px', borderRadius: 20, border: `1px solid ${border}`,
      background: bg, color: col, fontSize: 10, fontWeight: active ? 700 : 500,
      cursor: 'pointer', letterSpacing: '0.5px', whiteSpace: 'nowrap',
      transition: 'all 0.12s', fontFamily: 'inherit',
      display: 'flex', alignItems: 'center', gap: 5,
    }}>
      {logo && <img src={`/logos/${logo}`} style={{ width: 15, height: 15, objectFit: 'contain' }} />}
      {label}
    </button>
  );
}

// ── Custom X-axis tick with team logo + competition badge ────────────────────
function LogoTick({ x, y, payload, index, chartData }) {
  const name = payload?.value;
  const logo = LOGO_MAP[name];
  const entry = chartData?.[index];
  const compLogo = entry ? COMP_LOGOS[entry.campeonato] : null;
  const TEAM_SIZE = 20;
  const COMP_SIZE = 13;
  const short = (name || '').split(' ').slice(-1)[0].slice(0, 6);
  return (
    <g transform={`translate(${x},${y + 4})`}>
      {/* team logo or initials */}
      {logo
        ? <image href={`/logos/${logo}`} x={-TEAM_SIZE / 2} y={0} width={TEAM_SIZE} height={TEAM_SIZE} />
        : <text x={0} y={0} dy={12} textAnchor="middle" fill={C.t3} fontSize={8}>{short}</text>
      }
      {/* competition badge below */}
      {compLogo && (
        <image href={`/logos/${compLogo}`} x={-COMP_SIZE / 2} y={TEAM_SIZE + 3} width={COMP_SIZE} height={COMP_SIZE} />
      )}
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

// Breakdown: which items belong to each category
const BREAKDOWN_GROUPS = {
  revenues:   ['rebateIngresse', 'parking', 'matchdayIngresse', 'firezone', 'arenaKids', 'aeb'],
  opex:       ['services', 'security', 'rentals', 'operatingExpenses', 'feesAndTaxes', 'facialRecognition', 'entertainment'],
  margin:     ['margin'],
  logistics:  ['accommodation'],
  federations:['taxes', 'personnelExpenses', 'meal', 'arbitration'],
  total:      ['totalRevenues', 'totalOperatingExpenses', 'margin', 'totalLogistics', 'totalFederations'],
};
// Label for each key used in breakdown
const KEY_LABEL = Object.fromEntries(PL_ROWS.map(r => [r.key, r.label]));
KEY_LABEL['totalRevenues']          = 'revenues';
KEY_LABEL['totalOperatingExpenses'] = 'operating expenses';
KEY_LABEL['totalLogistics']         = 'logistics';
KEY_LABEL['totalFederations']       = 'federations';

// ── Breakdown tooltip ────────────────────────────────────────────────────────
function BreakdownTooltip({ info, partida }) {
  if (!info || !partida) return null;
  const keys = BREAKDOWN_GROUPS[info.rowId];
  if (!keys || keys.length <= 1) return null;

  const items = keys.map(k => ({ label: KEY_LABEL[k] || k, value: partida[k] ?? 0 }))
    .filter(it => it.value !== 0);
  if (!items.length) return null;

  // Position: keep inside viewport
  const TIP_W = 220;
  const TIP_H = items.length * 22 + 48;
  let left = info.x + 14;
  let top  = info.y - TIP_H / 2;
  if (left + TIP_W > window.innerWidth - 8)  left = info.x - TIP_W - 8;
  if (top < 8)                               top  = 8;
  if (top + TIP_H > window.innerHeight - 8) top  = window.innerHeight - TIP_H - 8;

  return (
    <div style={{
      position: 'fixed', left, top, zIndex: 9999,
      background: '#1e1e1e', border: '1px solid #444', borderRadius: 8,
      padding: '10px 14px', minWidth: TIP_W, pointerEvents: 'none',
      boxShadow: '0 8px 28px rgba(0,0,0,0.45)',
      fontFamily: FONT_UI, fontSize: 10,
    }}>
      {/* Header */}
      <div style={{ color: '#bbb', fontWeight: 700, fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8, borderBottom: '1px solid #333', paddingBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
        <span>DESC</span><span>VALOR</span>
      </div>
      {/* Rows */}
      {items.map(it => (
        <div key={it.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, gap: 16 }}>
          <span style={{ color: '#ccc', textTransform: 'capitalize' }}>{it.label}</span>
          <span style={{ color: it.value < 0 ? '#ff9a9a' : it.value > 0 ? '#88cc88' : '#888', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {fmtBR(it.value)}
          </span>
        </div>
      ))}
      {/* Total line */}
      <div style={{ borderTop: '1px solid #333', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#fff', fontWeight: 700 }}>Total</span>
        <span style={{ color: '#fff', fontWeight: 700 }}>
          {fmtBR(items.reduce((s, it) => s + it.value, 0))}
        </span>
      </div>
    </div>
  );
}

// ── Static lists ─────────────────────────────────────────────────────────────
const CAMP_NAMES = [...new Set(plPorPartida.map(d => d.campeonato).filter(Boolean))].sort();
const YEARS      = [...new Set(plPorPartida.map(d => d.ano).filter(Boolean))].sort();
const FAT_MAP    = Object.fromEntries(faturamentoPorPartida.map(d => [d.idPartida, d.utilizados || 0]));

// Table dimensions
const LABEL_W = 190;
const COL_W   = 134;
const HEAD_H  = 26;
// Team logo row height (taller to fit logo)
const TEAM_H  = 40;

// ── Component ────────────────────────────────────────────────────────────────
export default function PL() {
  const [campFilter, setCampFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [collapsed, setCollapsed]   = useState(new Set());
  const [tooltipInfo, setTooltipInfo] = useState(null); // { rowId, partidaId, x, y }

  const toggleCollapse = (id) =>
    setCollapsed(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // Hide tooltip on scroll
  const tableRef = useRef(null);
  useEffect(() => {
    const el = tableRef.current;
    if (!el) return;
    const hide = () => setTooltipInfo(null);
    el.addEventListener('scroll', hide, { passive: true });
    return () => el.removeEventListener('scroll', hide);
  }, []);

  const filtered = useMemo(() => plPorPartida.filter(d =>
    (campFilter === 'ALL' || d.campeonato === campFilter) &&
    (yearFilter === 'ALL' || d.ano === Number(yearFilter))
  ), [campFilter, yearFilter]);

  const partidaMap = useMemo(() =>
    Object.fromEntries(filtered.map(d => [d.idPartida, d]))
  , [filtered]);

  const activePartida = tooltipInfo ? partidaMap[tooltipInfo.partidaId] : null;

  // KPI attendance
  const { attTotal, attAvg } = useMemo(() => {
    const total = filtered.reduce((s, d) => s + (FAT_MAP[d.idPartida] || 0), 0);
    return { attTotal: total, attAvg: filtered.length ? Math.round(total / filtered.length) : 0 };
  }, [filtered]);

  // Chart data
  const chartData = useMemo(() => filtered.map(d => ({
    name:       d.time,
    campeonato: d.campeonato,
    revenues:   d.totalRevenues,
    costs:      Math.abs(d.totalOperatingExpenses + d.totalLogistics + d.totalFederations),
  })), [filtered]);

  // Visible table rows
  const visibleRows = useMemo(() =>
    PL_ROWS.filter(r => !(r.type === 'item' && r.cat && collapsed.has(r.cat)))
  , [collapsed]);

  const handleCellEnter = (e, rowId, partidaId) => {
    if (!BREAKDOWN_GROUPS[rowId] || BREAKDOWN_GROUPS[rowId].length <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipInfo({ rowId, partidaId, x: rect.right, y: rect.top + rect.height / 2 });
  };
  const handleCellLeave = () => setTooltipInfo(null);

  return (
    <div style={{ fontFamily: FONT_UI, color: C.t1 }}>

      {/* ── Filters + KPIs ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <FilterBtn label="All" active={campFilter === 'ALL'} onClick={() => setCampFilter('ALL')} color={C.accent} />
            {CAMP_NAMES.map(c => (
              <FilterBtn key={c} label={c} active={campFilter === c} onClick={() => setCampFilter(c)}
                color={CAMP_COLORS[c]} logo={COMP_LOGOS[c]} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: C.t3, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Ano</span>
            <FilterBtn label="Todos" active={yearFilter === 'ALL'} onClick={() => setYearFilter('ALL')} color={C.accent} />
            {YEARS.map(y => (
              <FilterBtn key={y} label={String(y)} active={yearFilter === String(y)} onClick={() => setYearFilter(String(y))} color={C.accent} />
            ))}
          </div>
        </div>
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

      {/* ── Chart ── */}
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
            <XAxis dataKey="name" tick={<LogoTick chartData={chartData} />} interval={0} height={52} />
            <YAxis tick={{ fontSize: 9, fill: C.t3 }} tickFormatter={fmtAxis} width={52} />
            <RTooltip content={<ChartTip />} />
            <Line type="monotone" dataKey="revenues" stroke="#6b4fa0" strokeWidth={2} dot={{ r: 3, fill: '#6b4fa0' }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="costs"    stroke={C.accent} strokeWidth={2} dot={{ r: 3, fill: C.accent }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ fontSize: 9, color: C.t3, textAlign: 'center', letterSpacing: '0.5px', textTransform: 'uppercase' }}>TIME</div>
      </div>

      {/* ── P&L Table ── */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
        boxShadow: SHADOW.card, overflow: 'hidden',
      }}>
        <div ref={tableRef} style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 520 }}>
          <table style={{
            borderCollapse: 'collapse', fontSize: 10,
            minWidth: LABEL_W + filtered.length * COL_W,
            tableLayout: 'fixed',
          }}>

            {/* Header rows */}
            <thead>
              {/* ID_PARTIDA row */}
              <tr style={{ background: '#1e1e1e', position: 'sticky', top: 0, zIndex: 10 }}>
                <th style={{ ...thLabel, background: '#1e1e1e', color: '#bbb', position: 'sticky', left: 0, zIndex: 12 }}>
                  ID_PARTIDA
                </th>
                {filtered.map(d => (
                  <th key={d.idPartida} style={{ ...thVal, background: '#1e1e1e', color: '#bbb', fontSize: 8 }}>
                    {d.idPartida}
                  </th>
                ))}
              </tr>

              {/* Championship row */}
              <tr style={{ background: '#252525', position: 'sticky', top: HEAD_H, zIndex: 9 }}>
                <th style={{ ...thLabel, background: '#252525', color: '#bbb', position: 'sticky', left: 0, zIndex: 12 }}>
                  Championship
                </th>
                {filtered.map(d => (
                  <th key={d.idPartida} style={{ ...thVal, background: '#252525', fontSize: 9 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      {COMP_LOGOS[d.campeonato] && (
                        <img src={`/logos/${COMP_LOGOS[d.campeonato]}`} style={{ width: 13, height: 13, objectFit: 'contain', flexShrink: 0 }} />
                      )}
                      <span style={{ color: CAMP_COLORS[d.campeonato] || '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {d.campeonato}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>

              {/* Team row — with shield logo */}
              <tr style={{ background: '#2c2c2c', position: 'sticky', top: HEAD_H * 2, zIndex: 8 }}>
                <th style={{ ...thLabel, background: '#2c2c2c', color: '#bbb', position: 'sticky', left: 0, zIndex: 12, height: TEAM_H }}>
                  Team
                </th>
                {filtered.map(d => {
                  const logo = LOGO_MAP[d.time];
                  return (
                    <th key={d.idPartida} style={{ ...thVal, background: '#2c2c2c', height: TEAM_H, padding: '4px 6px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        {logo ? (
                          <img
                            src={`/logos/${logo}`}
                            alt={d.time}
                            style={{ width: 22, height: 22, objectFit: 'contain' }}
                          />
                        ) : (
                          <div style={{
                            width: 22, height: 22, borderRadius: '50%',
                            background: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 7, color: '#fff', fontWeight: 700,
                          }}>
                            {d.time.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span style={{ color: C.accent, fontSize: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: COL_W - 12, display: 'block', textAlign: 'center' }}>
                          {d.time}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {visibleRows.map((row, i) => {
                const isCat   = row.type === 'cat';
                const isTotal = row.type === 'total';
                // category rows use own id; item rows use parent cat id
                const breakdownId = BREAKDOWN_GROUPS[row.id]?.length > 1
                  ? row.id
                  : (row.cat && BREAKDOWN_GROUPS[row.cat]?.length > 1 ? row.cat : null);
                const hasBreakdown = !!breakdownId;
                const rowBg   = isTotal ? '#1a1a1a' : isCat ? '#2e2e2e' : i % 2 === 0 ? C.card : '#f9f9f9';
                return (
                  <tr key={row.id} style={{ background: rowBg }}>
                    <td
                      onClick={() => isCat && COLLAPSIBLE.has(row.id) && toggleCollapse(row.id)}
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
                      const isHovered = tooltipInfo?.partidaId === d.idPartida &&
                        (tooltipInfo?.rowId === row.id || tooltipInfo?.rowId === breakdownId);
                      return (
                        <td
                          key={d.idPartida}
                          onMouseEnter={hasBreakdown ? (e) => handleCellEnter(e, breakdownId, d.idPartida) : undefined}
                          onMouseLeave={hasBreakdown ? handleCellLeave : undefined}
                          style={{
                            ...tdVal,
                            background: isHovered ? (isTotal ? '#2a2a2a' : isCat ? '#3a3a3a' : '#eef0ff') : rowBg,
                            fontWeight: (isCat || isTotal) ? 700 : 400,
                            color: tc,
                            cursor: hasBreakdown ? 'crosshair' : 'default',
                          }}
                        >
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

      {/* ── Breakdown tooltip (portal-like fixed position) ── */}
      <BreakdownTooltip info={tooltipInfo} partida={activePartida} />
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
