import { useState, useMemo } from 'react';
import { C, SHADOW, CAMP_COLORS } from '../tokens';
import { TeamBadge as TeamLogo } from '../teamLogos';
import { precosPorTimeETorcedor, torcedorCols, partidas } from '../data/data';

// Filter buttons: 5 main campeonatos
const FILTER_CAMPS = ['Brasileirão', 'Carioca', 'Copa do Brasil', 'Libertadores', 'Recopa'];

// ── Consistent filter button component (Task 3)
function FilterBtn({ label, active, onClick, color }) {
  const bg     = active ? (color || C.accent) : C.card;
  const col    = active ? '#000' : C.t2;
  const border = active ? (color || C.accent) : C.border;
  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 14px', borderRadius: 20, border: `1px solid ${border}`,
        background: bg, color: col,
        fontSize: 10, fontWeight: active ? 700 : 500, cursor: 'pointer',
        letterSpacing: '0.5px', whiteSpace: 'nowrap', transition: 'all 0.12s ease',
        fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  );
}

// ── Section title style (Task 6)
const sectionTitle = {
  fontSize: 10, fontWeight: 700, color: C.t2,
  textTransform: 'uppercase', letterSpacing: '1.5px',
  marginBottom: 0,
};

export default function Precos() {
  const [campFilter, setCampFilter] = useState(null);

  // Times that appear in the selected campeonato
  const timesInCamp = useMemo(() => {
    if (!campFilter) return null;
    return new Set(partidas.filter(p => p.campeonato === campFilter).map(p => p.idTime));
  }, [campFilter]);

  const filteredPrecos = useMemo(() => {
    if (!timesInCamp) return precosPorTimeETorcedor;
    return precosPorTimeETorcedor.filter(r => timesInCamp.has(r.idTime));
  }, [timesInCamp]);

  // ── Heat map: find max value across all data cells
  const maxValue = useMemo(() => {
    let max = 0;
    filteredPrecos.forEach(r => {
      torcedorCols.forEach(col => {
        const v = r[col];
        if (v != null && v > max) max = v;
      });
    });
    return max || 1;
  }, [filteredPrecos]);

  // ── Total row: average per torcedor col
  const totals = useMemo(() => {
    const sums = {};
    const counts = {};
    torcedorCols.forEach(col => { sums[col] = 0; counts[col] = 0; });
    filteredPrecos.forEach(r => {
      torcedorCols.forEach(col => {
        if (r[col] != null && r[col] > 0) {
          sums[col] += r[col];
          counts[col]++;
        }
      });
    });
    const avgs = {};
    torcedorCols.forEach(col => {
      avgs[col] = counts[col] > 0 ? sums[col] / counts[col] : null;
    });
    return avgs;
  }, [filteredPrecos]);

  // ── Cell background: rgba gold tint proportional to value
  function cellBg(v) {
    if (!v || v <= 0) return 'transparent';
    const intensity = v / maxValue; // 0..1
    // rgba(201,168,76, intensity * 0.55) — max ~55% opacity
    return `rgba(201,168,76,${(intensity * 0.55).toFixed(3)})`;
  }

  function cellTextColor(v) {
    if (!v || v <= 0) return C.t3;
    const intensity = v / maxValue;
    if (intensity > 0.6) return '#fff';
    if (intensity > 0.3) return C.t1;
    return C.t2;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Filter buttons */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 10, padding: '12px 16px', boxShadow: SHADOW.card,
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
      }}>
        <span style={sectionTitle}>Campeonato</span>
        <div style={{ width: 1, height: 18, background: C.border, margin: '0 4px' }} />
        <FilterBtn label="Todos" active={!campFilter} onClick={() => setCampFilter(null)} />
        {FILTER_CAMPS.map(c => (
          <FilterBtn
            key={c}
            label={c}
            active={campFilter === c}
            onClick={() => setCampFilter(campFilter === c ? null : c)}
            color={CAMP_COLORS[c]}
          />
        ))}
      </div>

      {/* ── Price matrix table */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 10, boxShadow: SHADOW.card, overflow: 'hidden',
      }}>

        {/* Card header */}
        <div style={{ padding: '14px 16px 10px', borderBottom: `1px solid ${C.border}` }}>
          <div style={sectionTitle}>Matriz de Preços — Unitário Médio por Time e Tipo de Torcedor</div>
          {campFilter && (
            <div style={{ marginTop: 4, fontSize: 9, color: C.t3 }}>
              Filtrado por: <span style={{ color: CAMP_COLORS[campFilter] || C.accent, fontWeight: 700 }}>{campFilter}</span>
              {' '}· {filteredPrecos.length} adversários
            </div>
          )}
        </div>

        {/* Scrollable table wrapper */}
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 220px)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>

            {/* ── Sticky header row */}
            <thead>
              <tr style={{ background: C.bgAlt }}>
                {/* Sticky first column header */}
                <th style={{
                  padding: '10px 14px',
                  textAlign: 'left',
                  fontSize: 9, fontWeight: 700, color: C.t2,
                  textTransform: 'uppercase', letterSpacing: '1.2px',
                  whiteSpace: 'nowrap', minWidth: 160,
                  position: 'sticky', left: 0, top: 0, zIndex: 3,
                  background: C.bgAlt,
                  borderRight: `1px solid ${C.border}`,
                  borderBottom: `1px solid ${C.border}`,
                }}>
                  Time
                </th>
                {torcedorCols.map(col => (
                  <th key={col} style={{
                    padding: '10px 10px',
                    textAlign: 'right',
                    fontSize: 8, fontWeight: 700, color: C.t2,
                    textTransform: 'uppercase', letterSpacing: '0.8px',
                    whiteSpace: 'nowrap', minWidth: 80,
                    position: 'sticky', top: 0, zIndex: 2,
                    background: C.bgAlt,
                    borderBottom: `1px solid ${C.border}`,
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            {/* ── Data rows */}
            <tbody>
              {filteredPrecos.map((r, i) => (
                <tr
                  key={r.idTime}
                  style={{
                    borderBottom: `1px solid ${C.border}`,
                    background: i % 2 === 0 ? C.card : C.bgAlt,
                  }}
                >
                  {/* Sticky first column: TIME name */}
                  <td style={{
                    padding: '8px 14px',
                    color: C.t1, fontWeight: 600,
                    whiteSpace: 'nowrap', fontSize: 10,
                    position: 'sticky', left: 0, zIndex: 1,
                    background: i % 2 === 0 ? C.card : C.bgAlt,
                    borderRight: `1px solid ${C.border}`,
                    minHeight: 32,
                    minWidth: 160,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <TeamLogo name={r.time} size={20} />
                      {r.time}
                    </div>
                  </td>

                  {torcedorCols.map(col => {
                    const v = r[col];
                    const bg = cellBg(v);
                    const textCol = cellTextColor(v);
                    return (
                      <td key={col} style={{
                        padding: '8px 10px',
                        textAlign: 'right',
                        background: bg,
                        minHeight: 32,
                        fontFamily: "'Courier New', Courier, monospace",
                      }}>
                        {v != null && v > 0 ? (
                          <span style={{ color: textCol, fontWeight: v / maxValue > 0.5 ? 700 : 500 }}>
                            R$ {Number(v).toFixed(0)}
                          </span>
                        ) : (
                          <span style={{ color: C.t3 }}>—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>

            {/* ── Total / Average row */}
            <tfoot>
              <tr style={{ borderTop: `2px solid ${C.border}`, background: C.bgAlt }}>
                <td style={{
                  padding: '10px 14px',
                  fontWeight: 800, color: C.accent,
                  fontSize: 10, textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  position: 'sticky', left: 0, zIndex: 1,
                  background: C.bgAlt,
                  borderRight: `1px solid ${C.border}`,
                }}>
                  Média Geral
                </td>
                {torcedorCols.map(col => {
                  const v = totals[col];
                  const bg = cellBg(v);
                  const textCol = v && v > 0 ? C.accent : C.t3;
                  return (
                    <td key={col} style={{
                      padding: '10px 10px',
                      textAlign: 'right',
                      background: bg,
                      fontFamily: "'Courier New', Courier, monospace",
                    }}>
                      {v != null && v > 0 ? (
                        <span style={{ color: textCol, fontWeight: 800 }}>
                          R$ {Number(v).toFixed(0)}
                        </span>
                      ) : (
                        <span style={{ color: C.t3 }}>—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
}
