import { useState, useMemo } from 'react';
import { C, SHADOW, CAMP_COLORS } from '../tokens';
import { getCompLogo, LOGO_MAP } from '../teamLogos.jsx';
import { placares } from '../data/placares';

function parseDate(s) {
  if (!s) return '';
  const [d, m, y] = s.split('/');
  return `${y}-${m}-${d}`;
}

function formatDate(s) {
  if (!s) return '';
  const [d, m, y] = s.split('/');
  return `${d}/${m}/${y?.slice(-2)}`;
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
  const initials = name.split(' ').filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join('').toUpperCase() || name.slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: '#888',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 800, color: '#fff', flexShrink: 0,
    }}>{initials}</div>
  );
}

function ResultBadge({ resultado }) {
  if (!resultado) return <div style={{ width: 28 }} />;
  const colors = { V: '#16a34a', D: '#dc2626', E: '#6b7280' };
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%',
      background: colors[resultado] || '#6b7280',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 10, fontWeight: 800, color: '#fff', flexShrink: 0,
    }}>
      {resultado}
    </div>
  );
}

export default function CalendarioResultados({ campeonato = 'Todos', ano = 'Todos' }) {
  const [page, setPage] = useState(0);
  const PER_PAGE = 15;

  const filtered = useMemo(() => {
    return placares
      .filter(p => {
        if (campeonato !== 'Todos' && p.campeonato !== campeonato) return false;
        if (ano !== 'Todos') {
          const y = p.data ? p.data.split('/')[2] : '';
          if (y !== ano) return false;
        }
        return true;
      })
      .sort((a, b) => parseDate(b.data).localeCompare(parseDate(a.data)));
  }, [campeonato, ano]);

  useMemo(() => { setPage(0); }, [campeonato, ano]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const slice = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  // Group by competition
  const grouped = useMemo(() => {
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
  }, [slice]);

  return (
    <div style={{
      background: C.card, borderRadius: 12, border: `1px solid ${C.border}`,
      boxShadow: SHADOW.card, overflow: 'hidden', width: '100%',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 20px',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: C.t1 }}>
          Calendário e Resultados
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            style={{
              width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`,
              background: page === 0 ? C.bgAlt : C.card, cursor: page === 0 ? 'default' : 'pointer',
              color: page === 0 ? C.t3 : C.t1, fontSize: 16, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>‹</button>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            style={{
              width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`,
              background: page >= totalPages - 1 ? C.bgAlt : C.card,
              cursor: page >= totalPages - 1 ? 'default' : 'pointer',
              color: page >= totalPages - 1 ? C.t3 : C.t1, fontSize: 16, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>›</button>
        </div>
      </div>

      {/* Games */}
      <div>
        {grouped.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: C.t3, fontSize: 12 }}>
            Nenhuma partida encontrada
          </div>
        )}
        {grouped.map(({ camp, games }, gi) => {
          return (
            <div key={camp + gi}>
              {/* Competition header */}
              <div style={{
                padding: '8px 20px 6px',
                display: 'flex', alignItems: 'center', gap: 8,
                background: C.bgAlt,
                borderTop: gi > 0 ? `1px solid ${C.border}` : undefined,
              }}>
                {(() => { const logo = getCompLogo(camp); return logo
                  ? <img src={`/logos/${logo}`} style={{ width: 20, height: 20, objectFit: 'contain' }} />
                  : <div style={{ width: 20, height: 20, borderRadius: 4, background: CAMP_COLORS[camp] || C.accent, opacity: 0.7 }} />;
                })()}
                <span style={{ fontSize: 11, fontWeight: 700, color: C.t2 }}>{camp}</span>
              </div>

              {games.map((g, i) => (
                <div key={g.data + g.adversario + i} style={{
                  padding: '10px 20px',
                  borderTop: `1px solid ${C.border}`,
                  background: i % 2 === 0 ? '#fff' : '#fafafa',
                  display: 'grid',
                  gridTemplateColumns: '52px 1fr 64px 1fr 32px',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  {/* Data */}
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#666', lineHeight: 1.4 }}>
                    {formatDate(g.data)}
                  </div>

                  {/* Time mandante (esquerda) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 12, fontWeight: g.mandante === 'Botafogo' ? 800 : 500,
                      color: g.mandante === 'Botafogo' ? C.t1 : C.t2, textAlign: 'right',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
                      {g.mandante}
                    </span>
                    <TeamLogo name={g.mandante} size={26} />
                  </div>

                  {/* Placar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    {g.golsMandante !== null && g.golsVisitante !== null ? (
                      <>
                        <span style={{ fontSize: 17, fontWeight: 800, color: C.t1, minWidth: 14, textAlign: 'center' }}>{g.golsMandante}</span>
                        <span style={{ fontSize: 12, color: '#bbb' }}>–</span>
                        <span style={{ fontSize: 17, fontWeight: 800, color: C.t1, minWidth: 14, textAlign: 'center' }}>{g.golsVisitante}</span>
                      </>
                    ) : (
                      <span style={{ fontSize: 11, color: C.t3 }}>–</span>
                    )}
                  </div>

                  {/* Time visitante (direita) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <TeamLogo name={g.visitante} size={26} />
                    <span style={{ fontSize: 12, fontWeight: g.visitante === 'Botafogo' ? 800 : 500,
                      color: g.visitante === 'Botafogo' ? C.t1 : C.t2,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
                      {g.visitante}
                    </span>
                  </div>

                  {/* Badge */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <ResultBadge resultado={g.resultado} />
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Dots pagination */}
      {totalPages > 1 && (
        <div style={{
          padding: '8px 16px', borderTop: `1px solid ${C.border}`,
          display: 'flex', justifyContent: 'center', gap: 5,
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
