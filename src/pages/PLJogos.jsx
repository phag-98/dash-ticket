import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { C, FONT_UI, CAMP_COLORS } from '../tokens';
import { plPorPartida, partidas } from '../data/data';

// ── Ordenação e estrutura das linhas do P&L ─────────────────────────────────
const ROW_DEFS = [
  { key: 'revenues',            label: 'Revenues',                   cat: 'revenues',           isHeader: true },
  { key: 'rev:matchday ingresse', label: 'Matchday Ingresse',        cat: 'revenues',           sub: 'matchday ingresse' },
  { key: 'rev:parking',         label: 'Parking',                    cat: 'revenues',           sub: 'parking' },
  { key: 'rev:firezone',        label: 'Firezone',                   cat: 'revenues',           sub: 'firezone' },
  { key: 'rev:arena kids',      label: 'Arena Kids',                 cat: 'revenues',           sub: 'arena kids' },
  { key: 'rev:a&b',             label: 'A&B',                        cat: 'revenues',           sub: 'a&b' },
  { key: 'rev:rebate ingresse', label: 'Rebate Ingresse',            cat: 'revenues',           sub: 'rebate ingresse' },
  { key: 'operating expenses',  label: 'Operating Expenses',         cat: 'operating expenses', isHeader: true },
  { key: 'op:services',         label: 'Services',                   cat: 'operating expenses', sub: 'services' },
  { key: 'op:security',         label: 'Security',                   cat: 'operating expenses', sub: 'security' },
  { key: 'op:rentals',          label: 'Rentals',                    cat: 'operating expenses', sub: 'rentals' },
  { key: 'op:operating expenses', label: 'Operating Expenses',       cat: 'operating expenses', sub: 'operating expenses' },
  { key: 'op:fees and taxes',   label: 'Fees and Taxes',             cat: 'operating expenses', sub: 'fees and taxes' },
  { key: 'op:facial recognition system', label: 'Facial Recognition', cat: 'operating expenses', sub: 'facial recognition system' },
  { key: 'op:entertainment',    label: 'Entertainment',              cat: 'operating expenses', sub: 'entertainment' },
  { key: 'op:a&b',              label: 'A&B (Op.)',                  cat: 'operating expenses', sub: 'a&b' },
  { key: 'margin',              label: 'Margin',                     cat: 'margin',             isHeader: true },
  { key: 'mar:margin',          label: 'Margin',                     cat: 'margin',             sub: 'margin' },
  { key: 'logístics',           label: 'Logistics',                  cat: 'logístics',          isHeader: true },
  { key: 'log:accommodation',   label: 'Accommodation',              cat: 'logístics',          sub: 'accommodation' },
  { key: 'federations',         label: 'Federations',                cat: 'federations',        isHeader: true },
  { key: 'fed:taxes',           label: 'Taxes',                      cat: 'federations',        sub: 'taxes' },
  { key: 'fed:personnel expenses', label: 'Personnel Expenses',      cat: 'federations',        sub: 'personnel expenses' },
  { key: 'fed:meal',            label: 'Meal',                       cat: 'federations',        sub: 'meal' },
  { key: 'fed:arbitration',     label: 'Arbitration',                cat: 'federations',        sub: 'arbitration' },
  { key: '__total__',           label: 'Total',                      isTotal: true },
];

const CAMPS = ['Brasileirão', 'Carioca', 'Copa do Brasil', 'Libertadores', 'Recopa', 'Sulamericana', 'Supercopa', 'Mundial'];
const ANOS  = [2024, 2025];

function fmtM(v, dec = 2) {
  if (v === undefined || v === null) return '—';
  const m = v / 1_000_000;
  const sign = m < 0 ? '-' : '';
  return `${sign}${Math.abs(m).toFixed(dec)}`;
}

function fmtVal(v) {
  if (v === undefined || v === null || v === 0) return '—';
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getRowValue(item, rowDef) {
  if (rowDef.isTotal) return item.total ?? 0;
  if (rowDef.isHeader) return item.cat1?.[rowDef.cat] ?? null;
  return item.cat2?.[rowDef.cat]?.[rowDef.sub] ?? null;
}

function Pill({ label, active, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
        background: active ? (color || C.accent) : C.bgAlt,
        color: active ? '#fff' : C.t2,
        fontFamily: FONT_UI, fontSize: 12, fontWeight: active ? 600 : 400,
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
}

export default function PLJogos() {
  const allCamps = useMemo(() => [...new Set(plPorPartida.map(p => p.campeonato))].filter(Boolean).sort(), []);
  const allAnos  = useMemo(() => [...new Set(plPorPartida.map(p => p.ano))].filter(Boolean).sort(), []);

  const [selCamps, setSelCamps] = useState(new Set(allCamps));
  const [selAnos,  setSelAnos]  = useState(new Set(allAnos));

  function toggleCamp(c) {
    setSelCamps(prev => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  }
  function toggleAno(a) {
    setSelAnos(prev => {
      const next = new Set(prev);
      next.has(a) ? next.delete(a) : next.add(a);
      return next;
    });
  }

  const filtered = useMemo(
    () => plPorPartida.filter(p => selCamps.has(p.campeonato) && selAnos.has(p.ano)),
    [selCamps, selAnos]
  );

  const totalPL = useMemo(() => filtered.reduce((s, p) => s + (p.total ?? 0), 0), [filtered]);

  // Line chart data
  const lineData = useMemo(() => filtered.map(p => ({
    label: p.time,
    revenues: (p.cat1?.revenues ?? 0),
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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {allCamps.map(c => (
          <Pill key={c} label={c} active={selCamps.has(c)} color={CAMP_COLORS[c] || C.accent} onClick={() => toggleCamp(c)} />
        ))}
        <div style={{ width: 1, background: C.border, alignSelf: 'stretch', margin: '0 4px' }} />
        {allAnos.map(a => (
          <Pill key={a} label={String(a)} active={selAnos.has(a)} onClick={() => toggleAno(a)} />
        ))}
      </div>

      {/* ── KPI ── */}
      <div style={{
        display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end',
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
        padding: '16px 28px', marginBottom: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.t3, textTransform: 'uppercase', letterSpacing: '1px' }}>TOTAL P&L</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: totalPL >= 0 ? C.green : C.red, marginTop: 4 }}>
          {totalPL < 0 ? '-' : ''}R$ {fmtM(Math.abs(totalPL))} Mi
        </div>
      </div>

      {/* ── Charts + Table row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, alignItems: 'start' }}>

        {/* ── Line chart ── */}
        <div style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: '20px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.t1, marginBottom: 16 }}>
            Revenues and Costs per Match
          </div>
          <div style={{ fontSize: 11, color: C.t3, marginBottom: 8 }}>
            <span style={{ color: '#7c3aed', marginRight: 12 }}>● Revenues</span>
            <span style={{ color: C.accent }}>● Costs</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={lineData} margin={{ top: 8, right: 8, bottom: 80, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: C.t3 }}
                angle={-45}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tickFormatter={v => `${(v / 1e6).toFixed(1)} Mi`}
                tick={{ fontSize: 10, fill: C.t3 }}
                width={60}
              />
              <RTooltip
                formatter={(v, name) => [`R$ ${(v / 1e6).toFixed(2)} Mi`, name === 'revenues' ? 'Revenues' : 'Costs']}
                labelStyle={{ color: C.t1, fontFamily: FONT_UI, fontSize: 11 }}
                contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11 }}
              />
              <Line type="monotone" dataKey="revenues" stroke="#7c3aed" strokeWidth={2} dot={{ r: 4, fill: '#7c3aed' }} name="revenues" />
              <Line type="monotone" dataKey="costs"    stroke={C.accent}  strokeWidth={2} dot={{ r: 4, fill: C.accent }}  name="costs" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ── Pivot table ── */}
        <div style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
          overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 420 }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 600, fontSize: 11 }}>
              <thead>
                <tr>
                  {/* Sticky row label column */}
                  <th style={{
                    position: 'sticky', left: 0, zIndex: 3,
                    background: C.header, color: '#fff', padding: '6px 12px',
                    textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${C.border}`,
                    minWidth: 170, whiteSpace: 'nowrap',
                  }}>
                    Category
                  </th>
                  {filtered.map(p => (
                    <th key={p.idPartida} style={{
                      background: C.header, color: '#fff', padding: '4px 8px',
                      textAlign: 'right', borderBottom: `1px solid ${C.border}`,
                      borderLeft: `1px solid rgba(255,255,255,0.1)`,
                      minWidth: 110, whiteSpace: 'nowrap', fontWeight: 400,
                    }}>
                      <div style={{ fontSize: 9, color: C.accent, fontWeight: 600 }}>{p.idPartida.slice(0, 10)}</div>
                      <div style={{ fontSize: 9, color: '#aaa' }}>{p.campeonato}</div>
                      <div style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>{p.time}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROW_DEFS.map((row, ri) => {
                  const isTotal   = row.isTotal;
                  const isHeader  = row.isHeader;
                  const isSub     = !isHeader && !isTotal;
                  const bgRow     = isTotal  ? C.header
                                 : isHeader  ? '#2a2a2a'
                                 : ri % 2 === 0 ? C.card : C.bgAlt;
                  const fgRow     = isTotal || isHeader ? '#fff' : C.t1;

                  return (
                    <tr key={row.key}>
                      <td style={{
                        position: 'sticky', left: 0, zIndex: 1,
                        background: bgRow, color: fgRow,
                        padding: isSub ? '4px 8px 4px 24px' : '6px 12px',
                        fontWeight: isHeader || isTotal ? 600 : 400,
                        borderBottom: `1px solid ${C.border}`,
                        whiteSpace: 'nowrap',
                        fontSize: isTotal ? 12 : 11,
                      }}>
                        {row.label}
                      </td>
                      {filtered.map(p => {
                        const val = getRowValue(p, row);
                        const show = val !== null && val !== 0;
                        const pos  = val >= 0;
                        return (
                          <td key={p.idPartida} style={{
                            background: bgRow,
                            color: isTotal || isHeader ? '#fff'
                                 : show ? (pos ? C.green : C.red) : C.t3,
                            padding: '4px 8px',
                            textAlign: 'right',
                            borderBottom: `1px solid ${C.border}`,
                            borderLeft: `1px solid ${C.border}`,
                            fontWeight: isHeader || isTotal ? 600 : 400,
                            whiteSpace: 'nowrap',
                            fontSize: isTotal ? 12 : 11,
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
    </div>
  );
}
