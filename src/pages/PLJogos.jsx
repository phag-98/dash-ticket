import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer,
} from 'recharts';
import { C, FONT_UI, CAMP_COLORS } from '../tokens';
import { COMP_LOGOS, LOGO_MAP } from '../teamLogos.jsx';
import { plPorPartida } from '../data/data';

// ── Estrutura P&L ────────────────────────────────────────────────────────────
const ROW_DEFS = [
  { key: 'revenues',                    label: 'Revenues',            cat: 'revenues',           isHeader: true },
  { key: 'rev:matchday ingresse',       label: 'Matchday Ingresse',   cat: 'revenues',           sub: 'matchday ingresse' },
  { key: 'rev:parking',                 label: 'Parking',             cat: 'revenues',           sub: 'parking' },
  { key: 'rev:firezone',                label: 'Firezone',            cat: 'revenues',           sub: 'firezone' },
  { key: 'rev:arena kids',              label: 'Arena Kids',          cat: 'revenues',           sub: 'arena kids' },
  { key: 'rev:a&b',                     label: 'A&B',                 cat: 'revenues',           sub: 'a&b' },
  { key: 'rev:rebate ingresse',         label: 'Rebate Ingresse',     cat: 'revenues',           sub: 'rebate ingresse' },
  { key: 'operating expenses',          label: 'Operating Expenses',  cat: 'operating expenses', isHeader: true },
  { key: 'op:services',                 label: 'Services',            cat: 'operating expenses', sub: 'services' },
  { key: 'op:security',                 label: 'Security',            cat: 'operating expenses', sub: 'security' },
  { key: 'op:rentals',                  label: 'Rentals',             cat: 'operating expenses', sub: 'rentals' },
  { key: 'op:operating expenses',       label: 'Operating Expenses',  cat: 'operating expenses', sub: 'operating expenses' },
  { key: 'op:fees and taxes',           label: 'Fees and Taxes',      cat: 'operating expenses', sub: 'fees and taxes' },
  { key: 'op:facial recognition system',label: 'Facial Recognition',  cat: 'operating expenses', sub: 'facial recognition system' },
  { key: 'op:entertainment',            label: 'Entertainment',       cat: 'operating expenses', sub: 'entertainment' },
  { key: 'op:a&b',                      label: 'A&B (Op.)',           cat: 'operating expenses', sub: 'a&b' },
  { key: 'margin',                      label: 'Margin',              cat: 'margin',             isHeader: true },
  { key: 'mar:margin',                  label: 'Margin',              cat: 'margin',             sub: 'margin' },
  { key: 'logístics',                   label: 'Logistics',           cat: 'logístics',          isHeader: true },
  { key: 'log:accommodation',           label: 'Accommodation',       cat: 'logístics',          sub: 'accommodation' },
  { key: 'federations',                 label: 'Federations',         cat: 'federations',        isHeader: true },
  { key: 'fed:taxes',                   label: 'Taxes',               cat: 'federations',        sub: 'taxes' },
  { key: 'fed:personnel expenses',      label: 'Personnel Expenses',  cat: 'federations',        sub: 'personnel expenses' },
  { key: 'fed:meal',                    label: 'Meal',                cat: 'federations',        sub: 'meal' },
  { key: 'fed:arbitration',             label: 'Arbitration',         cat: 'federations',        sub: 'arbitration' },
  { key: '__total__',                   label: 'Total',               isTotal: true },
];

function getRowValue(item, rowDef) {
  if (rowDef.isTotal)  return item.total ?? 0;
  if (rowDef.isHeader) return item.cat1?.[rowDef.cat] ?? null;
  return item.cat2?.[rowDef.cat]?.[rowDef.sub] ?? null;
}

function fmtM(v) {
  const m = Math.abs(v) / 1_000_000;
  return (v < 0 ? '-' : '') + 'R$ ' + m.toFixed(2) + ' Mi';
}

function fmtVal(v) {
  if (v === null || v === undefined || v === 0) return '—';
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Camp Pill com logo ───────────────────────────────────────────────────────
function CampPill({ camp, active, onClick }) {
  const logo = COMP_LOGOS[camp];
  const color = CAMP_COLORS[camp] || C.accent;
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 12px', borderRadius: 8, border: `2px solid ${active ? color : 'transparent'}`,
        cursor: 'pointer', background: active ? color + '22' : C.bgAlt,
        color: active ? color : C.t2,
        fontFamily: FONT_UI, fontSize: 12, fontWeight: active ? 700 : 400,
        transition: 'all 0.15s',
      }}
    >
      {logo && (
        <img
          src={`/logos/${logo}`}
          alt={camp}
          style={{ width: 18, height: 18, objectFit: 'contain', borderRadius: 2 }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      )}
      {camp}
    </button>
  );
}

// ── Ano Pill ─────────────────────────────────────────────────────────────────
function AnoPill({ ano, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 14px', borderRadius: 8,
        border: `2px solid ${active ? C.accent : 'transparent'}`,
        cursor: 'pointer', background: active ? C.accentBg : C.bgAlt,
        color: active ? C.accent : C.t2,
        fontFamily: FONT_UI, fontSize: 12, fontWeight: active ? 700 : 400,
        transition: 'all 0.15s',
      }}
    >
      {ano}
    </button>
  );
}

// ── Custom X tick do gráfico com logo do time ────────────────────────────────
function CustomXTick({ x, y, payload }) {
  const name = payload.value;
  const logo = LOGO_MAP[name];
  const SIZE = 20;
  return (
    <g transform={`translate(${x},${y + 6})`}>
      {logo ? (
        <image
          href={`/logos/${logo}`}
          x={-SIZE / 2} y={0}
          width={SIZE} height={SIZE}
          preserveAspectRatio="xMidYMid meet"
        />
      ) : (
        <text
          x={0} y={SIZE / 2 + 4}
          textAnchor="middle" fill={C.t3} fontSize={9}
        >
          {name.slice(0, 8)}
        </text>
      )}
    </g>
  );
}

export default function PLJogos() {
  const allCamps = useMemo(() => [...new Set(plPorPartida.map(p => p.campeonato))].filter(Boolean).sort(), []);
  const allAnos  = useMemo(() => [...new Set(plPorPartida.map(p => p.ano))].filter(Boolean).sort(), []);

  const [selCamps, setSelCamps] = useState(new Set(allCamps));
  const [selAnos,  setSelAnos]  = useState(new Set(allAnos));

  function toggleCamp(c) {
    setSelCamps(prev => { const n = new Set(prev); n.has(c) ? n.delete(c) : n.add(c); return n; });
  }
  function toggleAno(a) {
    setSelAnos(prev => { const n = new Set(prev); n.has(a) ? n.delete(a) : n.add(a); return n; });
  }

  const filtered = useMemo(
    () => plPorPartida.filter(p => selCamps.has(p.campeonato) && selAnos.has(p.ano)),
    [selCamps, selAnos]
  );

  const totalPL = useMemo(() => filtered.reduce((s, p) => s + (p.total ?? 0), 0), [filtered]);

  const lineData = useMemo(() => filtered.map(p => ({
    label: p.time,
    revenues: p.cat1?.revenues ?? 0,
    costs: Math.abs(
      (p.cat1?.['operating expenses'] ?? 0) +
      (p.cat1?.['logístics'] ?? 0) +
      (p.cat1?.['federations'] ?? 0) +
      (p.cat1?.['margin'] ?? 0)
    ),
  })), [filtered]);

  return (
    <div style={{ fontFamily: FONT_UI, color: C.t1 }}>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        {allCamps.map(c => (
          <CampPill key={c} camp={c} active={selCamps.has(c)} onClick={() => toggleCamp(c)} />
        ))}
        <div style={{ width: 1, height: 28, background: C.border, margin: '0 4px' }} />
        {allAnos.map(a => (
          <AnoPill key={a} ano={a} active={selAnos.has(a)} onClick={() => toggleAno(a)} />
        ))}

        {/* KPI inline */}
        <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ fontSize: 10, color: C.t3, textTransform: 'uppercase', letterSpacing: '1px' }}>Total P&L</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: totalPL >= 0 ? C.green : C.red, lineHeight: 1 }}>
            {fmtM(totalPL)}
          </div>
        </div>
      </div>

      {/* ── Gráfico ── */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
        padding: '20px 16px', marginBottom: 16,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Revenues and Costs per Match</div>
        <div style={{ fontSize: 11, color: C.t3, marginBottom: 12 }}>
          <span style={{ color: '#7c3aed', marginRight: 16 }}>● Revenues</span>
          <span style={{ color: C.accent }}>● Costs</span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={lineData} margin={{ top: 8, right: 16, bottom: 48, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis
              dataKey="label"
              tick={<CustomXTick />}
              interval={0}
              height={52}
            />
            <YAxis
              tickFormatter={v => `${(v / 1e6).toFixed(1)} Mi`}
              tick={{ fontSize: 10, fill: C.t3 }}
              width={62}
            />
            <RTooltip
              formatter={(v, name) => [`R$ ${(v / 1e6).toFixed(2)} Mi`, name === 'revenues' ? 'Revenues' : 'Costs']}
              labelStyle={{ color: C.t1, fontFamily: FONT_UI, fontSize: 11 }}
              contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11 }}
            />
            <Line type="monotone" dataKey="revenues" stroke="#7c3aed" strokeWidth={2} dot={{ r: 4, fill: '#7c3aed' }} />
            <Line type="monotone" dataKey="costs"    stroke={C.accent}  strokeWidth={2} dot={{ r: 4, fill: C.accent }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Tabela P&L ── */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
        overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 600, fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{
                  position: 'sticky', left: 0, zIndex: 3,
                  background: C.header, color: '#fff',
                  padding: '8px 14px', textAlign: 'left', fontWeight: 600,
                  borderBottom: `1px solid rgba(255,255,255,0.1)`,
                  minWidth: 180, whiteSpace: 'nowrap',
                }}>
                  Category
                </th>
                {filtered.map(p => {
                  const campLogo = COMP_LOGOS[p.campeonato];
                  const teamLogo = LOGO_MAP[p.time];
                  const campColor = CAMP_COLORS[p.campeonato] || C.accent;
                  return (
                    <th key={p.idPartida} style={{
                      background: C.header, color: '#fff',
                      padding: '6px 10px', textAlign: 'center',
                      borderBottom: `1px solid rgba(255,255,255,0.1)`,
                      borderLeft: `1px solid rgba(255,255,255,0.07)`,
                      minWidth: 120, whiteSpace: 'nowrap', fontWeight: 400,
                    }}>
                      {/* Date */}
                      <div style={{ fontSize: 9, color: campColor, fontWeight: 700, marginBottom: 2 }}>
                        {p.idPartida.slice(0, 10)}
                      </div>
                      {/* Camp logo + name */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
                        {campLogo && (
                          <img src={`/logos/${campLogo}`} alt={p.campeonato}
                            style={{ width: 14, height: 14, objectFit: 'contain' }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <span style={{ fontSize: 9, color: '#bbb' }}>{p.campeonato}</span>
                      </div>
                      {/* Team logo + name */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        {teamLogo && (
                          <img src={`/logos/${teamLogo}`} alt={p.time}
                            style={{ width: 20, height: 20, objectFit: 'contain' }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>{p.time}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {ROW_DEFS.map((row, ri) => {
                const isTotal  = row.isTotal;
                const isHeader = row.isHeader;
                const isSub    = !isHeader && !isTotal;
                const bgRow    = isTotal ? C.header : isHeader ? '#2d2d2d' : ri % 2 === 0 ? C.card : C.bgAlt;
                const fgRow    = isTotal || isHeader ? '#fff' : C.t1;

                return (
                  <tr key={row.key} style={{ transition: 'background 0.1s' }}>
                    <td style={{
                      position: 'sticky', left: 0, zIndex: 1,
                      background: bgRow, color: fgRow,
                      padding: isSub ? '4px 8px 4px 28px' : '6px 14px',
                      fontWeight: isHeader || isTotal ? 700 : 400,
                      borderBottom: `1px solid ${C.border}`,
                      whiteSpace: 'nowrap', fontSize: isTotal ? 12 : 11,
                    }}>
                      {row.label}
                    </td>
                    {filtered.map(p => {
                      const val  = getRowValue(p, row);
                      const show = val !== null && val !== 0;
                      const pos  = val >= 0;
                      return (
                        <td key={p.idPartida} style={{
                          background: bgRow,
                          color: isTotal || isHeader ? '#fff'
                               : show ? (pos ? C.green : C.red) : C.t3,
                          padding: '4px 10px',
                          textAlign: 'right',
                          borderBottom: `1px solid ${C.border}`,
                          borderLeft: `1px solid ${C.border}`,
                          fontWeight: isHeader || isTotal ? 700 : 400,
                          whiteSpace: 'nowrap', fontSize: isTotal ? 12 : 11,
                        }}>
                          {show ? fmtVal(val) : '—'}
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
