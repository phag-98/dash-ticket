import { useState, useMemo } from 'react';
import { C, SHADOW, CAMP_COLORS, FONT_UI } from '../tokens';
import { COMP_LOGOS, LOGO_MAP } from '../teamLogos.jsx';
import { placares } from '../data/placares';

const CAMP_NAMES = [...new Set(placares.map(p => p.campeonato).filter(Boolean))].sort();

function parseDate(s) {
  if (!s) return '';
  const p = s.split('/');
  if (p.length === 3) {
    const y = p[2].length === 2 ? `20${p[2]}` : p[2];
    return `${y}-${p[1]}-${p[0]}`;
  }
  return s;
}

function formatDate(s) {
  if (!s) return '';
  const p = s.split('/');
  if (p.length !== 3) return s;
  const y = p[2].length === 4 ? p[2].slice(2) : p[2];
  return `${p[0]}/${p[1]}/${y}`;
}

function TeamLogo({ name, size = 24 }) {
  const logo = LOGO_MAP[name];
  if (name === 'Botafogo') {
    return (
      <img src="/logos/Botafogo.png" alt="Botafogo"
        style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }} />
    );
  }
  if (logo) {
    return (
      <img src={`/logos/${logo}`} alt={name}
        style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }}
        onError={e => { e.target.style.display = 'none'; }} />
    );
  }
  const initials = name.split(' ').filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join('').toUpperCase()
    || name.slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: '#555',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 800, color: '#fff', flexShrink: 0,
    }}>{initials}</div>
  );
}

function ResultBadge({ gm, gv, isBotHome }) {
  const botGoals = isBotHome ? gm : gv;
  const advGoals = isBotHome ? gv : gm;
  let label, bg, color;
  if (botGoals > advGoals)      { label = 'V'; bg = '#16a34a'; color = '#fff'; }
  else if (botGoals < advGoals) { label = 'D'; bg = '#dc2626'; color = '#fff'; }
  else                          { label = 'E'; bg = '#6b7280'; color = '#fff'; }
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%', background: bg, color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 800, flexShrink: 0,
    }}>{label}</div>
  );
}

export default function CalendarioResultados() {
  const [view, setView]         = useState('finished'); // 'finished' | 'upcoming'
  const [campFilter, setCampFilter] = useState('Todos');
  const [page, setPage]         = useState(0);
  const PER_PAGE = 20;

  const filtered = useMemo(() => {
    return placares
      .filter(p => {
        if (campFilter !== 'Todos' && p.campeonato !== campFilter) return false;
        if (view === 'finished') return p.status === 'FT';
        return p.status !== 'FT';
      })
      .sort((a, b) => {
        const cmp = parseDate(b.data).localeCompare(parseDate(a.data));
        return cmp;
      });
  }, [view, campFilter]);

  // Group by competition
  const grouped = useMemo(() => {
    const slice = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
    const groups = [];
    let cur = null;
    for (const p of slice) {
      if (!cur || cur.camp !== p.campeonato) {
        cur = { camp: p.campeonato, games: [] };
        groups.push(cur);
      }
      cur.games.push(p);
    }
    return groups;
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  return (
    <div style={{
      background: C.card, borderRadius: 12, border: `1px solid ${C.border}`,
      boxShadow: SHADOW.card, overflow: 'hidden', maxWidth: 480, minWidth: 320,
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px 10px',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: C.t1, letterSpacing: '-0.3px' }}>
          Partidas
        </span>

        {/* Competition filter dropdown */}
        <select
          value={campFilter}
          onChange={e => { setCampFilter(e.target.value); setPage(0); }}
          style={{
            border: `1px solid ${C.border}`, borderRadius: 8,
            padding: '4px 28px 4px 10px', fontSize: 11, fontWeight: 600,
            color: C.t1, background: C.bgAlt, cursor: 'pointer',
            fontFamily: FONT_UI, appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23666'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
          }}
        >
          <option value="Todos">Todos</option>
          {CAMP_NAMES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Finished / Upcoming toggle + pagination */}
      <div style={{
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{
          display: 'flex', borderRadius: 8, overflow: 'hidden',
          border: `1px solid ${C.border}`, flex: 1,
        }}>
          {['finished', 'upcoming'].map(v => {
            const active = view === v;
            const label  = v === 'finished' ? 'Encerrados' : 'Próximos';
            return (
              <button key={v} onClick={() => { setView(v); setPage(0); }} style={{
                flex: 1, padding: '7px 0', border: 'none', cursor: 'pointer',
                background: active ? '#1a1a2e' : 'transparent',
                color: active ? '#fff' : C.t2,
                fontSize: 11, fontWeight: active ? 700 : 500,
                fontFamily: FONT_UI, letterSpacing: '0.3px',
                transition: 'all 0.12s',
              }}>
                {label}
              </button>
            );
          })}
        </div>

        {/* Pagination arrows */}
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          style={{
            width: 30, height: 30, borderRadius: 6, border: `1px solid ${C.border}`,
            background: page === 0 ? C.bgAlt : C.card, cursor: page === 0 ? 'default' : 'pointer',
            color: page === 0 ? C.t3 : C.t1, fontSize: 14, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >‹</button>
        <button
          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={page >= totalPages - 1}
          style={{
            width: 30, height: 30, borderRadius: 6, border: `1px solid ${C.border}`,
            background: page >= totalPages - 1 ? C.bgAlt : C.card,
            cursor: page >= totalPages - 1 ? 'default' : 'pointer',
            color: page >= totalPages - 1 ? C.t3 : C.t1, fontSize: 14, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >›</button>
      </div>

      {/* Game list */}
      <div style={{ overflowY: 'auto', maxHeight: 540 }}>
        {grouped.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: C.t3, fontSize: 12 }}>
            Nenhuma partida encontrada
          </div>
        )}
        {grouped.map(({ camp, games }) => {
          const logo = COMP_LOGOS[camp];
          return (
            <div key={camp}>
              {/* Competition header */}
              <div style={{
                padding: '10px 16px 6px',
                display: 'flex', alignItems: 'center', gap: 8,
                borderTop: `1px solid ${C.border}`,
              }}>
                {logo
                  ? <img src={`/logos/${logo}`} style={{ width: 20, height: 20, objectFit: 'contain' }} />
                  : <div style={{ width: 20, height: 20, borderRadius: 4, background: CAMP_COLORS[camp] || C.accent, opacity: 0.7 }} />
                }
                <span style={{ fontSize: 11, fontWeight: 700, color: C.t2, letterSpacing: '0.5px' }}>
                  {camp}
                </span>
              </div>

              {/* Games in this competition */}
              {games.map((g, i) => {
                const isBotHome = g.mandante === 'Botafogo';
                const homeTeam = g.mandante;
                const awayTeam = g.visitante;
                const gm = g.golsMandante;
                const gv = g.golsVisitante;

                return (
                  <div key={g.id} style={{
                    padding: '10px 16px',
                    borderTop: i > 0 ? `1px solid ${C.border}` : 'none',
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: i % 2 === 0 ? '#fff' : C.bgAlt,
                  }}>
                    {/* Date + Status */}
                    <div style={{ width: 52, flexShrink: 0 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: C.t3, lineHeight: 1.4 }}>
                        {formatDate(g.data)}
                      </div>
                      <div style={{
                        fontSize: 8, fontWeight: 700, letterSpacing: '0.5px',
                        color: g.status === 'FT' ? '#16a34a' : C.accent,
                      }}>
                        {g.status === 'FT' ? 'FT' : 'Em breve'}
                      </div>
                    </div>

                    {/* Home team */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end' }}>
                      <span style={{
                        fontSize: 11, fontWeight: homeTeam === 'Botafogo' ? 800 : 500,
                        color: homeTeam === 'Botafogo' ? C.t1 : C.t2,
                        textAlign: 'right', lineHeight: 1.2,
                        maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {homeTeam === 'Botafogo' ? 'Botafogo' : homeTeam}
                      </span>
                      <TeamLogo name={homeTeam} size={26} />
                    </div>

                    {/* Score */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      flexShrink: 0, minWidth: 52, justifyContent: 'center',
                    }}>
                      {g.status === 'FT' ? (
                        <>
                          <span style={{ fontSize: 16, fontWeight: 800, color: C.t1, minWidth: 16, textAlign: 'center' }}>{gm}</span>
                          <span style={{ fontSize: 12, color: C.t3, fontWeight: 400 }}>–</span>
                          <span style={{ fontSize: 16, fontWeight: 800, color: C.t1, minWidth: 16, textAlign: 'center' }}>{gv}</span>
                        </>
                      ) : (
                        <span style={{ fontSize: 10, color: C.t3, fontWeight: 600, textAlign: 'center' }}>
                          {g.horario || '–:––'}
                        </span>
                      )}
                    </div>

                    {/* Away team */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-start' }}>
                      <TeamLogo name={awayTeam} size={26} />
                      <span style={{
                        fontSize: 11, fontWeight: awayTeam === 'Botafogo' ? 800 : 500,
                        color: awayTeam === 'Botafogo' ? C.t1 : C.t2,
                        maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {awayTeam === 'Botafogo' ? 'Botafogo' : awayTeam}
                      </span>
                    </div>

                    {/* Result badge */}
                    {g.status === 'FT' && <ResultBadge gm={gm} gv={gv} isBotHome={isBotHome} />}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer: page indicator */}
      {totalPages > 1 && (
        <div style={{
          padding: '8px 16px', borderTop: `1px solid ${C.border}`,
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4,
        }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <div key={i} onClick={() => setPage(i)} style={{
              width: i === page ? 20 : 6, height: 6, borderRadius: 3,
              background: i === page ? C.accent : C.border,
              cursor: 'pointer', transition: 'all 0.2s',
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
