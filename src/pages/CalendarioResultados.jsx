import { useState, useMemo } from 'react';
import { C, SHADOW, CAMP_COLORS, FONT_UI } from '../tokens';
import { COMP_LOGOS, LOGO_MAP } from '../teamLogos.jsx';
import { placares } from '../data/placares';

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

function TeamLogo({ name, size = 26 }) {
  const logo = name === 'Botafogo' ? 'Botafogo.png' : LOGO_MAP[name];
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
      width: size, height: size, borderRadius: '50%', background: '#888',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 800, color: '#fff', flexShrink: 0,
    }}>{initials}</div>
  );
}

function ResultBadge({ gm, gv, isBotHome }) {
  const bot = isBotHome ? gm : gv;
  const adv = isBotHome ? gv : gm;
  const win = bot > adv, lose = bot < adv;
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%',
      background: win ? '#16a34a' : lose ? '#dc2626' : '#6b7280',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 10, fontWeight: 800, color: '#fff', flexShrink: 0,
    }}>
      {win ? 'V' : lose ? 'D' : 'E'}
    </div>
  );
}

// Props: campeonato, ano — synced with parent filters
export default function CalendarioResultados({ campeonato = 'Todos', ano = 'Todos' }) {
  const [view, setView] = useState('finished');
  const [page, setPage] = useState(0);
  const PER_PAGE = 15;

  const filtered = useMemo(() => {
    return placares
      .filter(p => {
        if (campeonato !== 'Todos' && p.campeonato !== campeonato) return false;
        if (ano !== 'Todos') {
          const gameYear = p.data ? p.data.split('/')[2] : '';
          if (gameYear !== ano && gameYear !== ano.slice(-2)) return false;
        }
        return view === 'finished' ? p.status === 'FT' : p.status === 'upcoming';
      })
      .sort((a, b) => {
        // Finished: most recent first; Upcoming: soonest first
        const cmp = parseDate(a.data).localeCompare(parseDate(b.data));
        return view === 'finished' ? -cmp : cmp;
      });
  }, [campeonato, ano, view]);

  // Reset page when filters change
  useMemo(() => { setPage(0); }, [campeonato, ano, view]);

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
      boxShadow: SHADOW.card, overflow: 'hidden', width: '100%',
    }}>
      {/* ── Header row ── */}
      <div style={{
        padding: '12px 16px 10px',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
      }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: C.t1, letterSpacing: '-0.2px' }}>
          Calendário e Resultados
        </span>

        {/* Toggle + arrows */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            display: 'flex', borderRadius: 8, overflow: 'hidden',
            border: `1px solid ${C.border}`,
          }}>
            {[['finished','Encerrados'], ['upcoming','Próximos']].map(([v, label]) => {
              const active = view === v;
              return (
                <button key={v} onClick={() => setView(v)} style={{
                  padding: '6px 14px', border: 'none', cursor: 'pointer',
                  background: active ? '#1a1a2e' : 'transparent',
                  color: active ? '#fff' : C.t2,
                  fontSize: 10, fontWeight: active ? 700 : 500,
                  fontFamily: FONT_UI, letterSpacing: '0.3px',
                  transition: 'all 0.12s',
                }}>
                  {label}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`,
              background: page === 0 ? C.bgAlt : C.card,
              cursor: page === 0 ? 'default' : 'pointer',
              color: page === 0 ? C.t3 : C.t1,
              fontSize: 16, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1,
            }}
          >‹</button>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            style={{
              width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`,
              background: page >= totalPages - 1 ? C.bgAlt : C.card,
              cursor: page >= totalPages - 1 ? 'default' : 'pointer',
              color: page >= totalPages - 1 ? C.t3 : C.t1,
              fontSize: 16, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1,
            }}
          >›</button>
        </div>
      </div>

      {/* ── Game list ── */}
      <div>
        {grouped.length === 0 && (
          <div style={{ padding: '32px 0', textAlign: 'center', color: C.t3, fontSize: 12 }}>
            Nenhuma partida encontrada
          </div>
        )}
        {grouped.map(({ camp, games }, gi) => {
          const logo = COMP_LOGOS[camp];
          return (
            <div key={camp}>
              {/* Competition header */}
              <div style={{
                padding: '10px 20px 7px',
                display: 'flex', alignItems: 'center', gap: 8,
                borderTop: gi > 0 ? `1px solid ${C.border}` : undefined,
                background: C.bgAlt,
              }}>
                {logo
                  ? <img src={`/logos/${logo}`} style={{ width: 22, height: 22, objectFit: 'contain' }} />
                  : <div style={{ width: 22, height: 22, borderRadius: 4, background: CAMP_COLORS[camp] || C.accent, opacity: 0.8 }} />
                }
                <span style={{ fontSize: 11, fontWeight: 700, color: C.t2, letterSpacing: '0.3px' }}>
                  {camp}
                </span>
              </div>

              {/* Game rows */}
              {games.map((g, i) => {
                const isBotHome = g.mandante === 'Botafogo';
                const isFT = g.status === 'FT';

                return (
                  <div key={g.id} style={{
                    padding: '11px 20px',
                    borderTop: `1px solid ${C.border}`,
                    background: i % 2 === 0 ? '#fff' : '#fafafa',
                    display: 'grid',
                    gridTemplateColumns: '58px 1fr 72px 1fr 34px',
                    alignItems: 'center',
                    gap: 6,
                  }}>

                    {/* Col 1: Date + status */}
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#555', lineHeight: 1.5 }}>
                        {formatDate(g.data)}
                      </div>
                      <div style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: '0.4px',
                        color: isFT ? '#16a34a' : C.accent,
                        lineHeight: 1,
                      }}>
                        {isFT ? 'FT' : g.horario || '—'}
                      </div>
                    </div>

                    {/* Col 2: Home team (name right-aligned, then logo) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                      <span style={{
                        fontSize: 12, lineHeight: 1.2,
                        fontWeight: g.mandante === 'Botafogo' ? 800 : 500,
                        color: g.mandante === 'Botafogo' ? C.t1 : C.t2,
                        textAlign: 'right',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        maxWidth: 130,
                      }}>
                        {g.mandante}
                      </span>
                      <TeamLogo name={g.mandante} size={28} />
                    </div>

                    {/* Col 3: Score */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    }}>
                      {isFT ? (
                        <>
                          <span style={{ fontSize: 17, fontWeight: 800, color: C.t1, minWidth: 14, textAlign: 'center', lineHeight: 1 }}>
                            {g.golsMandante}
                          </span>
                          <span style={{ fontSize: 13, color: '#bbb', fontWeight: 300, lineHeight: 1 }}>–</span>
                          <span style={{ fontSize: 17, fontWeight: 800, color: C.t1, minWidth: 14, textAlign: 'center', lineHeight: 1 }}>
                            {g.golsVisitante}
                          </span>
                        </>
                      ) : (
                        <div style={{
                          background: C.bgAlt, borderRadius: 6, padding: '4px 8px',
                          fontSize: 11, fontWeight: 700, color: C.t2, whiteSpace: 'nowrap',
                        }}>
                          {g.horario || 'Em breve'}
                        </div>
                      )}
                    </div>

                    {/* Col 4: Away team (logo then name left-aligned) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <TeamLogo name={g.visitante} size={28} />
                      <span style={{
                        fontSize: 12, lineHeight: 1.2,
                        fontWeight: g.visitante === 'Botafogo' ? 800 : 500,
                        color: g.visitante === 'Botafogo' ? C.t1 : C.t2,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        maxWidth: 130,
                      }}>
                        {g.visitante}
                      </span>
                    </div>

                    {/* Col 5: Result badge (FT only) */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {isFT && (
                        <ResultBadge gm={g.golsMandante} gv={g.golsVisitante} isBotHome={isBotHome} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* ── Pagination dots ── */}
      {totalPages > 1 && (
        <div style={{
          padding: '8px 16px', borderTop: `1px solid ${C.border}`,
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 5,
        }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <div key={i} onClick={() => setPage(i)} style={{
              width: i === page ? 18 : 6, height: 6, borderRadius: 3,
              background: i === page ? C.accent : C.border,
              cursor: 'pointer', transition: 'all 0.2s',
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
