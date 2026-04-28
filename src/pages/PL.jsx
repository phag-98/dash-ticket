import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer,
} from 'recharts';
import { C, FONT_UI, SHADOW, CAMP_COLORS } from '../tokens';
import { COMP_LOGOS, LOGO_MAP } from '../teamLogos.jsx';
import { plPorPartida, faturamentoPorPartida, plDetalhe } from '../data/data';

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
const fmtMoney = (v) => {
  if (!v) return 'R$ 0';
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1).replace('.', ',')} Mi`;
  return `R$ ${(v / 1_000).toFixed(0)} Mil`;
};

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

// ── Custom X-axis tick with team logo + championship logo below ──────────────
function makeLogoTick(chartData, selectedMatch, filtered) {
  return function LogoTick({ x, y, payload, index }) {
    const name = payload?.value;
    const logo = LOGO_MAP[name];
    const entry = chartData[index];
    const campeonato = entry?.campeonato;
    const compLogo = campeonato ? COMP_LOGOS[campeonato] : null;
    const isSel = selectedMatch && entry?.idPartida === selectedMatch;
    const TEAM_SIZE = 20;
    const COMP_SIZE = 14;
    const GAP = 3;

    return (
      <g transform={`translate(${x},${y + 4})`}>
        {isSel && <circle cx={0} cy={TEAM_SIZE / 2} r={13} fill={C.accent} opacity={0.18} />}
        {logo
          ? <image href={`/logos/${logo}`} x={-TEAM_SIZE / 2} y={0} width={TEAM_SIZE} height={TEAM_SIZE} />
          : <text x={0} y={0} dy={12} textAnchor="middle" fill={C.t3} fontSize={8}>
              {(name || '').split(' ').slice(-1)[0].slice(0, 6)}
            </text>
        }
        {compLogo && (
          <image
            href={`/logos/${compLogo}`}
            x={-COMP_SIZE / 2}
            y={TEAM_SIZE + GAP}
            width={COMP_SIZE}
            height={COMP_SIZE}
          />
        )}
      </g>
    );
  };
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
  { id: 'services',          label: 'services',                  type: 'item',  key: 'services',               cat: 'opex',         catFin2: 'ser-10' },
  { id: 'security',          label: 'security',                  type: 'item',  key: 'security',               cat: 'opex',         catFin2: 'sec-9'  },
  { id: 'rentals',           label: 'rentals',                   type: 'item',  key: 'rentals',                cat: 'opex',         catFin2: 'ren-11' },
  { id: 'operatingExpenses', label: 'operating expenses',        type: 'item',  key: 'operatingExpenses',      cat: 'opex',         catFin2: 'ope-12' },
  { id: 'feesAndTaxes',      label: 'fees and taxes',            type: 'item',  key: 'feesAndTaxes',           cat: 'opex',         catFin2: 'fee-13' },
  { id: 'facialRecognition', label: 'facial recognition system', type: 'item',  key: 'facialRecognition',      cat: 'opex' },
  { id: 'entertainment',     label: 'entertainment',             type: 'item',  key: 'entertainment',          cat: 'opex',         catFin2: 'ent-14' },
  { id: 'margin',            label: 'margin',                    type: 'cat',   key: 'margin',                 cat: 'margin' },
  { id: 'marginItem',        label: 'margin',                    type: 'item',  key: 'margin',                 cat: 'margin' },
  { id: 'logistics',         label: 'logistics',                 type: 'cat',   key: 'totalLogistics',         cat: 'logistics' },
  { id: 'accommodation',     label: 'accommodation',             type: 'item',  key: 'accommodation',          cat: 'logistics',    catFin2: 'acc-21' },
  { id: 'federations',       label: 'federations',               type: 'cat',   key: 'totalFederations',       cat: 'federations' },
  { id: 'taxes',             label: 'taxes',                     type: 'item',  key: 'taxes',                  cat: 'federations',  catFin2: 'tax-17' },
  { id: 'personnelExpenses', label: 'personnel expenses',        type: 'item',  key: 'personnelExpenses',      cat: 'federations',  catFin2: 'per-19' },
  { id: 'meal',              label: 'meal',                      type: 'item',  key: 'meal',                   cat: 'federations',  catFin2: 'mea-20' },
  { id: 'arbitration',       label: 'arbitration',               type: 'item',  key: 'arbitration',            cat: 'federations',  catFin2: 'arb-18' },
  { id: 'total',             label: 'Total',                     type: 'total', key: 'total',                  cat: null },
];
const COLLAPSIBLE     = new Set(['revenues', 'opex', 'margin', 'logistics', 'federations']);
const DETAIL_ROW_IDS  = PL_ROWS.filter(r => r.catFin2).map(r => r.id);

// Pre-build detail lookup: catFin2 -> idPartida -> [{ desc, valor }]
const DETAIL_MAP = {};
plDetalhe.forEach(({ catFin2, idPartida, desc, valor }) => {
  if (!DETAIL_MAP[catFin2]) DETAIL_MAP[catFin2] = {};
  if (!DETAIL_MAP[catFin2][idPartida]) DETAIL_MAP[catFin2][idPartida] = {};
  DETAIL_MAP[catFin2][idPartida][desc] = (DETAIL_MAP[catFin2][idPartida][desc] || 0) + valor;
});
// Unique desc labels per catFin2
const DETAIL_DESCS = {};
plDetalhe.forEach(({ catFin2, desc }) => {
  if (!DETAIL_DESCS[catFin2]) DETAIL_DESCS[catFin2] = new Set();
  DETAIL_DESCS[catFin2].add(desc);
});

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
  const [campFilter, setCampFilter]         = useState('ALL');
  const [yearFilter, setYearFilter]         = useState('ALL');
  const [collapsed, setCollapsed]           = useState(new Set());
  const [detailExpanded, setDetailExpanded] = useState(new Set());
  const [selectedMatch, setSelectedMatch]   = useState(null);
  const [hideZero, setHideZero]             = useState(false);

  const toggleCollapse = (id) =>
    setCollapsed(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleDetail = (id) =>
    setDetailExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const allExpanded = collapsed.size === 0 && DETAIL_ROW_IDS.every(id => detailExpanded.has(id));

  const toggleExpandAll = () => {
    if (allExpanded) {
      setDetailExpanded(new Set());
    } else {
      setCollapsed(new Set());
      setDetailExpanded(new Set(DETAIL_ROW_IDS));
    }
  };

  // plPorPartida is already sorted by date from generate_data.py
  const filtered = useMemo(() => plPorPartida.filter(d =>
    (campFilter === 'ALL' || d.campeonato === campFilter) &&
    (yearFilter === 'ALL' || d.ano === Number(yearFilter))
  ), [campFilter, yearFilter]);

  // KPI attendance + avg revenue/expense
  const { attTotal, attAvg, avgRevenue, avgExpense } = useMemo(() => {
    const n = filtered.length;
    const total = filtered.reduce((s, d) => s + (FAT_MAP[d.idPartida] || 0), 0);
    const totalRev = filtered.reduce((s, d) => s + (d.totalRevenues || 0), 0);
    const totalExp = filtered.reduce((s, d) => s + Math.abs((d.totalOperatingExpenses || 0) + (d.totalLogistics || 0) + (d.totalFederations || 0)), 0);
    return {
      attTotal: total,
      attAvg:   n ? Math.round(total / n) : 0,
      avgRevenue: n ? totalRev / n : 0,
      avgExpense: n ? totalExp / n : 0,
    };
  }, [filtered]);

  // Chart data — already ordered by date
  const chartData = useMemo(() => filtered.map(d => ({
    name:       d.time,
    campeonato: d.campeonato,
    idPartida:  d.idPartida,
    revenues:   d.totalRevenues,
    costs:      Math.abs(d.totalOperatingExpenses + d.totalLogistics + d.totalFederations),
  })), [filtered]);

  // Table columns: all filtered, or just the selected match
  const tableRows = useMemo(() =>
    selectedMatch ? filtered.filter(d => d.idPartida === selectedMatch) : filtered
  , [filtered, selectedMatch]);

  const exportExcel = () => {
    const aoa = [
      ['ID_PARTIDA',    ...tableRows.map(d => d.idPartida)],
      ['Championship',  ...tableRows.map(d => d.campeonato)],
      ['Team',          ...tableRows.map(d => d.time)],
    ];
    PL_ROWS.forEach(row => {
      aoa.push([row.label, ...tableRows.map(d => d[row.key] ?? 0)]);
      if (row.catFin2 && DETAIL_DESCS[row.catFin2]) {
        [...DETAIL_DESCS[row.catFin2]].sort().forEach(desc => {
          aoa.push([`  ${desc}`, ...tableRows.map(d => DETAIL_MAP[row.catFin2]?.[d.idPartida]?.[desc] ?? 0)]);
        });
      }
    });
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'P&L');
    XLSX.writeFile(wb, 'pl_botafogo.xlsx');
  };

  // Visible table rows
  const visibleRows = useMemo(() => {
    let rows = PL_ROWS.filter(r => !(r.type === 'item' && r.cat && collapsed.has(r.cat)));
    if (hideZero) {
      rows = rows.filter(r => {
        if (r.type !== 'item') return true;
        return tableRows.some(d => (d[r.key] ?? 0) !== 0);
      });
    }
    return rows;
  }, [collapsed, hideZero, tableRows]);

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
          {[{ v: attTotal, l: 'Attendance', fmt: fmtAtt },
            { v: attAvg,   l: 'Average Attendance', fmt: fmtAtt },
            { v: avgRevenue, l: 'Average Revenue', fmt: fmtMoney },
            { v: avgExpense, l: 'Average Expense', fmt: fmtMoney },
          ].map(({ v, l, fmt }) => (
            <div key={l} style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
              padding: '12px 24px', minWidth: 140, textAlign: 'center', boxShadow: SHADOW.card,
            }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: C.t1, lineHeight: 1.1 }}>{fmt(v)}</div>
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
          <LineChart
            data={chartData}
            margin={{ top: 4, right: 16, left: 0, bottom: 54 }}
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              const id = e?.activePayload?.[0]?.payload?.idPartida;
              if (!id) return;
              setSelectedMatch(prev => prev === id ? null : id);
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis
              dataKey="name"
              tick={makeLogoTick(chartData, selectedMatch, filtered)}
              interval={0}
              height={54}
            />
            <YAxis tick={{ fontSize: 9, fill: C.t3 }} tickFormatter={fmtAxis} width={52} />
            <RTooltip content={<ChartTip />} />
            <Line type="monotone" dataKey="revenues" stroke="#6b4fa0" strokeWidth={2}
              dot={(props) => {
                const { cx, cy, payload } = props;
                const sel = payload.idPartida === selectedMatch;
                return <circle key={cx} cx={cx} cy={cy} r={sel ? 5 : 3} fill="#6b4fa0" stroke={sel ? '#fff' : 'none'} strokeWidth={2} />;
              }}
              activeDot={{ r: 6, stroke: '#6b4fa0', strokeWidth: 2, fill: '#fff' }}
            />
            <Line type="monotone" dataKey="costs" stroke={C.accent} strokeWidth={2}
              dot={(props) => {
                const { cx, cy, payload } = props;
                const sel = payload.idPartida === selectedMatch;
                return <circle key={cx} cx={cx} cy={cy} r={sel ? 5 : 3} fill={C.accent} stroke={sel ? '#fff' : 'none'} strokeWidth={2} />;
              }}
              activeDot={{ r: 6, stroke: C.accent, strokeWidth: 2, fill: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <div style={{ fontSize: 9, color: C.t3, letterSpacing: '0.5px', textTransform: 'uppercase' }}>TIME</div>
          {selectedMatch && (
            <button onClick={() => setSelectedMatch(null)} style={{
              fontSize: 9, padding: '2px 8px', borderRadius: 10, background: C.accent,
              color: '#000', border: 'none', cursor: 'pointer', fontWeight: 700,
            }}>✕ limpar filtro</button>
          )}
        </div>
      </div>

      {/* ── P&L Table (full width, below) ── */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
        boxShadow: SHADOW.card, overflow: 'hidden',
      }}>
        <div style={{ padding: '8px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={toggleExpandAll} style={{
            fontSize: 10, padding: '4px 12px', borderRadius: 20, cursor: 'pointer',
            border: `1px solid ${allExpanded ? C.accent : C.border}`,
            background: allExpanded ? C.accent : C.card,
            color: allExpanded ? '#000' : C.t2,
            fontWeight: allExpanded ? 700 : 500, fontFamily: 'inherit',
            transition: 'all 0.12s',
          }}>
            {allExpanded ? '▾ Collapse All' : '▸ Expand All'}
          </button>
          <button onClick={() => setHideZero(h => !h)} style={{
            fontSize: 10, padding: '4px 12px', borderRadius: 20, cursor: 'pointer',
            border: `1px solid ${hideZero ? C.accent : C.border}`,
            background: hideZero ? C.accent : C.card,
            color: hideZero ? '#000' : C.t2,
            fontWeight: hideZero ? 700 : 500, fontFamily: 'inherit',
            transition: 'all 0.12s',
          }}>
            {hideZero ? '✓ ' : ''}Hide zero rows
          </button>
          <button onClick={exportExcel} style={{
            fontSize: 10, padding: '4px 12px', borderRadius: 20, cursor: 'pointer',
            border: `1px solid ${C.border}`,
            background: C.card, color: C.t2,
            fontWeight: 500, fontFamily: 'inherit',
            transition: 'all 0.12s',
          }}>
            ↓ Export Excel
          </button>
        </div>
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 520 }}>
          <table style={{
            borderCollapse: 'collapse', fontSize: 10,
            minWidth: LABEL_W + tableRows.length * COL_W,
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
                  {tableRows.map(d => (
                    <th key={d.idPartida} style={{ ...thVal, background: hdr.bg, color: hdr.color(d), fontSize: hdr.fs }}>
                      {hdr.fn(d)}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            {/* Body */}
            <tbody>
              {visibleRows.flatMap((row, i) => {
                const isCat      = row.type === 'cat';
                const isTotal    = row.type === 'total';
                const hasDetail  = !!row.catFin2 && !!DETAIL_DESCS[row.catFin2];
                const isExpanded = hasDetail && detailExpanded.has(row.id);
                const rowBg      = isTotal ? '#1a1a1a' : isCat ? '#2e2e2e' : i % 2 === 0 ? C.card : '#f9f9f9';

                const mainRow = (
                  <tr key={row.id} style={{ background: rowBg }}>
                    <td
                      onClick={() => {
                        if (isCat && COLLAPSIBLE.has(row.id)) toggleCollapse(row.id);
                        else if (hasDetail) toggleDetail(row.id);
                      }}
                      style={{
                        ...tdLabel, background: rowBg,
                        fontWeight: (isCat || isTotal) ? 700 : 400,
                        color: isTotal ? '#fff' : isCat ? '#e0e0e0' : C.t1,
                        paddingLeft: isCat || isTotal ? 8 : 20,
                        cursor: (isCat && COLLAPSIBLE.has(row.id)) || hasDetail ? 'pointer' : 'default',
                      }}
                    >
                      {isCat && COLLAPSIBLE.has(row.id) && (
                        <span style={{ marginRight: 5, fontSize: 9, color: '#999' }}>
                          {collapsed.has(row.id) ? '▶' : '▼'}
                        </span>
                      )}
                      {hasDetail && (
                        <span style={{ marginRight: 5, fontSize: 9, color: '#aaa' }}>
                          {isExpanded ? '▾' : '▸'}
                        </span>
                      )}
                      {row.label}
                    </td>
                    {tableRows.map(d => {
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

                if (!isExpanded) return [mainRow];

                const descs = [...DETAIL_DESCS[row.catFin2]].sort()
                  .filter(desc => !hideZero || tableRows.some(d => (DETAIL_MAP[row.catFin2]?.[d.idPartida]?.[desc] ?? 0) !== 0));
                const subRows = descs.map(desc => (
                  <tr key={`${row.id}__${desc}`} style={{ background: '#fafafa' }}>
                    <td style={{ ...tdLabel, paddingLeft: 32, color: C.t3, fontSize: 9, background: '#fafafa', fontStyle: 'italic' }}>
                      {desc}
                    </td>
                    {tableRows.map(d => {
                      const v   = DETAIL_MAP[row.catFin2]?.[d.idPartida]?.[desc] ?? 0;
                      const abs = Math.abs(v);
                      const s   = abs.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                      return (
                        <td key={d.idPartida} style={{ ...tdVal, background: '#fafafa', fontSize: 9, color: v < 0 ? '#c0392b' : v > 0 ? '#27ae60' : '#ccc' }}>
                          {v === 0 ? <span style={{ color: '#ddd' }}>—</span> : (v < 0 ? `-${s}` : s)}
                        </td>
                      );
                    })}
                  </tr>
                ));

                return [mainRow, ...subRows];
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
