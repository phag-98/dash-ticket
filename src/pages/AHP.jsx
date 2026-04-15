import { useState, useMemo } from 'react';
import { C, SHADOW } from '../tokens';
import { ahpScores, AHP_WEIGHTS } from '../data/data';
import { TeamBadge } from '../teamLogos.jsx';

const SCORE_COLOR = (v) => {
  if (v === null || v === undefined) return C.t3;
  if (v >= 5) return '#16a34a';
  if (v >= 4) return '#65a30d';
  if (v >= 3) return '#ca8a04';
  if (v >= 2) return '#f97316';
  if (v >= 1) return '#dc2626';
  return '#991b1b';
};

const ScorePill = ({ value, max = 5 }) => {
  if (value === null || value === undefined) {
    return <span style={{ fontSize: 10, color: C.t3 }}>—</span>;
  }
  const color = SCORE_COLOR(value);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <span style={{ fontSize: 11, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      <div style={{ width: 28, height: 4, borderRadius: 2, background: '#ddd', overflow: 'hidden' }}>
        <div style={{ width: `${(value / max) * 100}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
    </div>
  );
};

const ANOS = [...new Set(ahpScores.map(s => s.ano))].sort();
const CAMPS = [...new Set(ahpScores.map(s => s.campeonato).filter(Boolean))].sort();

const FACTORS = [
  { key: 'scoreCampeonato', label: 'Camp.',    weight: AHP_WEIGHTS.campeonato, max: 5 },
  { key: 'scoreFase',       label: 'Fase',     weight: AHP_WEIGHTS.fase,       max: 5 },
  { key: 'scoreHorario',    label: 'Horário',  weight: AHP_WEIGHTS.horario,    max: 5 },
  { key: 'scoreDia',        label: 'Dia',      weight: AHP_WEIGHTS.dia,        max: 5 },
  { key: 'scoreAdversario', label: 'Advers.',  weight: AHP_WEIGHTS.adversario, max: 4 },
  { key: 'scoreForma',      label: 'Forma',    weight: AHP_WEIGHTS.forma,      max: 5 },
];

// Total score range for bar normalisation
const MAX_TOTAL = 0.1410*5 + 0.3107*5 + 0.0847*5 + 0.1001*5 + 0.0503*4 + 0.3132*5;
const MIN_TOTAL = 0.1410*2 + 0.3107*2 + 0.0847*2 + 0.1001*1 + 0.0503*1 + 0.3132*0;

const sectionTitle = { fontSize: 10, fontWeight: 700, color: C.t2, textTransform: 'uppercase', letterSpacing: '1.5px' };

export default function AHP() {
  const [ano, setAno]   = useState('Todos');
  const [camp, setCamp] = useState('Todos');
  const [sortKey, setSortKey] = useState('total');
  const [sortDir, setSortDir] = useState(-1); // -1 desc, 1 asc

  const filtered = useMemo(() => {
    let rows = ahpScores;
    if (ano !== 'Todos')  rows = rows.filter(s => String(s.ano) === ano);
    if (camp !== 'Todos') rows = rows.filter(s => s.campeonato === camp);
    return [...rows].sort((a, b) => {
      const av = a[sortKey] ?? -Infinity;
      const bv = b[sortKey] ?? -Infinity;
      return typeof av === 'string' ? av.localeCompare(bv) * sortDir : (av - bv) * sortDir;
    });
  }, [ano, camp, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d * -1);
    else { setSortKey(key); setSortDir(-1); }
  };

  const FilterBtn = ({ label, active, onClick }) => (
    <button onClick={onClick} style={{
      padding: '4px 10px', borderRadius: 20, border: `1px solid ${active ? C.accent : C.border}`,
      background: active ? C.accent : 'transparent', color: active ? '#000' : C.t2,
      fontSize: 10, fontWeight: active ? 700 : 500, cursor: 'pointer', whiteSpace: 'nowrap',
    }}>{label}</button>
  );

  const ThSortable = ({ colKey, children, right }) => {
    const active = sortKey === colKey;
    return (
      <th onClick={() => handleSort(colKey)} style={{
        padding: '8px 8px', textAlign: right ? 'right' : 'center',
        fontSize: 9, fontWeight: 700, color: active ? C.accent : C.t3,
        textTransform: 'uppercase', letterSpacing: '1px',
        cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
        borderBottom: active ? `2px solid ${C.accent}` : '2px solid transparent',
      }}>
        {children}{active ? (sortDir === -1 ? ' ▼' : ' ▲') : ''}
      </th>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Header card ── */}
      <div style={{ background: C.card, borderRadius: 12, padding: '16px 20px', boxShadow: SHADOW.sm, border: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.t1, letterSpacing: '0.5px' }}>Pontuação AHP por Partida</div>
            <div style={{ fontSize: 11, color: C.t3, marginTop: 3 }}>Potencial de público ponderado por múltiplos fatores</div>
          </div>
          {/* Weight legend */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {FACTORS.map(f => (
              <div key={f.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <span style={{ fontSize: 9, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: C.accent }}>{(f.weight * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
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
      </div>

      {/* ── Table ── */}
      <div style={{ background: C.card, borderRadius: 12, boxShadow: SHADOW.sm, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ background: C.bgAlt, borderBottom: `2px solid ${C.border}` }}>
                <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: 9, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '1px', width: 32 }}>#</th>
                <ThSortable colKey="time">Time</ThSortable>
                <ThSortable colKey="campeonato">Campeonato</ThSortable>
                <ThSortable colKey="rodada">Rodada</ThSortable>
                <ThSortable colKey="data">Data</ThSortable>
                <ThSortable colKey="diaSemana">Dia</ThSortable>
                <ThSortable colKey="horario">Horário</ThSortable>
                {FACTORS.map(f => (
                  <ThSortable key={f.key} colKey={f.key}>
                    {f.label}<br/>
                    <span style={{ fontSize: 8, fontWeight: 500, color: C.t3 }}>{(f.weight*100).toFixed(1)}%</span>
                  </ThSortable>
                ))}
                <ThSortable colKey="formaStr">Forma</ThSortable>
                <ThSortable colKey="total" right>
                  Total
                </ThSortable>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const totalPct = s.total != null
                  ? Math.max(0, Math.min(100, (s.total - MIN_TOTAL) / (MAX_TOTAL - MIN_TOTAL) * 100))
                  : 0;
                const totalColor = SCORE_COLOR(s.total != null ? (s.total / MAX_TOTAL) * 5 : null);
                const rowBg = i % 2 !== 0 ? '#f0f0f3' : '#ffffff';
                return (
                  <tr key={s.idPartida} style={{ borderBottom: `1px solid ${C.border}`, background: rowBg }}>
                    <td style={{ padding: '8px 10px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: i < 3 ? C.accent : C.t3, fontFamily: "'Courier New', monospace" }}>{i + 1}</td>
                    <td style={{ padding: '8px 10px', minWidth: 140 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <TeamBadge name={s.time} size={20} />
                        <span style={{ fontSize: 11, color: C.t1, fontWeight: 500 }}>{s.time}</span>
                      </div>
                    </td>
                    <td style={{ padding: '8px 8px', fontSize: 10, color: C.t2, whiteSpace: 'nowrap' }}>{s.campeonato}</td>
                    <td style={{ padding: '8px 8px', textAlign: 'center', fontSize: 10, color: C.t2, fontFamily: "'Courier New', monospace' " }}>{s.rodada}</td>
                    <td style={{ padding: '8px 8px', fontSize: 10, color: C.t2, whiteSpace: 'nowrap', fontFamily: "'Courier New', monospace" }}>{s.data}</td>
                    <td style={{ padding: '8px 8px', fontSize: 10, color: C.t2, whiteSpace: 'nowrap' }}>{s.diaSemana}</td>
                    <td style={{ padding: '8px 8px', textAlign: 'center', fontSize: 10, color: C.t2, fontFamily: "'Courier New', monospace" }}>{s.horario}</td>
                    {FACTORS.map(f => (
                      <td key={f.key} style={{ padding: '8px 6px', textAlign: 'center' }}>
                        <ScorePill value={s[f.key]} max={f.max} />
                      </td>
                    ))}
                    <td style={{ padding: '8px 8px', textAlign: 'center' }}>
                      {s.formaStr ? (
                        <span style={{
                          fontSize: 9, fontWeight: 700, letterSpacing: '0.5px',
                          color: SCORE_COLOR(s.scoreForma),
                          fontFamily: "'Courier New', monospace",
                        }}>{s.formaStr}</span>
                      ) : <span style={{ fontSize: 10, color: C.t3 }}>—</span>}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', minWidth: 90 }}>
                      {s.total != null ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: totalColor, fontVariantNumeric: 'tabular-nums' }}>
                            {s.total.toFixed(3)}
                          </span>
                          <div style={{ width: 60, height: 4, borderRadius: 2, background: '#ddd', overflow: 'hidden' }}>
                            <div style={{ width: `${totalPct}%`, height: '100%', background: totalColor, borderRadius: 2 }} />
                          </div>
                        </div>
                      ) : <span style={{ fontSize: 10, color: C.t3 }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '8px 16px', borderTop: `1px solid ${C.border}`, background: C.bgAlt, fontSize: 10, color: C.t3 }}>
          {filtered.length} partidas · CR = 9,89% (aprovado &lt; 10%)
        </div>
      </div>
    </div>
  );
}
