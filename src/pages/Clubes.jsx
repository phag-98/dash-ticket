import { useState, useMemo } from 'react';
import { C, SHADOW } from '../tokens';
import { placares, ADV_LOGO, CAMP_LOGO } from '../data/placares';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const BOTAFOGO_LOGO = '/logos/Botafogo.png';

const sectionTitle = {
  fontSize: 10, fontWeight: 700, color: C.t2,
  textTransform: 'uppercase', letterSpacing: '1.5px',
};

function getInitials(name) {
  return name.split(/\s|-/).filter(w => w.length > 2).slice(0, 2)
    .map(w => w[0].toUpperCase()).join('') || name.slice(0, 2).toUpperCase();
}

// Badge: logo do clube ou fallback com iniciais
function ClubLogo({ name, file, size = 28 }) {
  const logo = file || ADV_LOGO[name];
  const [broken, setBroken] = useState(false);
  if (logo && !broken) {
    return (
      <img
        src={`/logos/${logo}`}
        alt={name}
        title={name}
        style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }}
        onError={() => setBroken(true)}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: '#888',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 800, color: '#fff', flexShrink: 0,
    }} title={name}>
      {getInitials(name)}
    </div>
  );
}

// Lista única de adversários (ordem alfabética) com contagem de jogos
const CLUBES = (() => {
  const map = {};
  placares.forEach(p => {
    if (!map[p.adversario]) map[p.adversario] = 0;
    map[p.adversario]++;
  });
  return Object.entries(map)
    .map(([nome, jogos]) => ({ nome, jogos }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
})();

const RESULT_META = {
  V: { label: 'Vitória', color: C.green, bg: C.greenBg },
  E: { label: 'Empate',  color: C.t2,    bg: C.accentBg },
  D: { label: 'Derrota', color: C.red,   bg: C.redBg },
};

// ─────────────────────────────────────────────
// Sub-componentes
// ─────────────────────────────────────────────
function StatBox({ label, value, color = C.t1, sub }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
      padding: '12px 16px', boxShadow: SHADOW.card, flex: 1, minWidth: 110,
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1.1, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: C.t3, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function MatchRow({ m }) {
  const meta = RESULT_META[m.resultado] || RESULT_META.E;
  const localLabel = m.local === 'C' ? 'Casa' : m.local === 'F' ? 'Fora' : 'Neutro';
  const linhaMeta = [
    localLabel,
    m.diaSemana?.replace('-feira', ''),
    m.horario,
  ].filter(Boolean).join(' · ');
  return (
    <div className="bfr-match">
      {/* Data + local/dia/horário */}
      <div className="bfr-match__meta">
        <div style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>{m.dataBR}</div>
        <div style={{ fontSize: 10, color: C.t3 }}>{linhaMeta}</div>
      </div>

      {/* Placar: Botafogo x Adversário */}
      <div className="bfr-match__score">
        <div className="bfr-match__side bfr-match__side--home">
          <span className="bfr-match__name">Botafogo</span>
          <ClubLogo name="Botafogo" file="Botafogo.png" size={24} />
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 18, fontWeight: 800, color: C.t1,
          background: C.bgAlt, borderRadius: 8, padding: '2px 12px', minWidth: 58, justifyContent: 'center',
        }}>
          <span>{m.golsBotafogo}</span>
          <span style={{ color: C.t3, fontWeight: 500 }}>×</span>
          <span>{m.golsAdversario}</span>
        </div>
        <div className="bfr-match__side">
          <ClubLogo name={m.adversario} size={24} />
          <span className="bfr-match__name">{m.adversario}</span>
        </div>
      </div>

      {/* Resultado */}
      <div className="bfr-match__result" style={{
        fontSize: 10, fontWeight: 800, color: meta.color, background: meta.bg,
        borderRadius: 6, padding: '4px 0', textAlign: 'center', letterSpacing: '0.5px',
      }} title={meta.label}>{m.resultado}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Página
// ─────────────────────────────────────────────
export default function Clubes() {
  const [selected, setSelected] = useState(CLUBES[0]?.nome ?? null);
  const [busca, setBusca] = useState('');

  const clubesFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return CLUBES;
    return CLUBES.filter(c => c.nome.toLowerCase().includes(q));
  }, [busca]);

  // Jogos do clube selecionado
  const jogos = useMemo(
    () => placares.filter(p => p.adversario === selected),
    [selected]
  );

  // Resumo do confronto (perspectiva do Botafogo)
  const resumo = useMemo(() => {
    const r = { v: 0, e: 0, d: 0, gp: 0, gc: 0 };
    jogos.forEach(j => {
      if (j.resultado === 'V') r.v++;
      else if (j.resultado === 'E') r.e++;
      else if (j.resultado === 'D') r.d++;
      r.gp += j.golsBotafogo ?? 0;
      r.gc += j.golsAdversario ?? 0;
    });
    return r;
  }, [jogos]);

  // Agrupar por competição (base), depois ordenar jogos por data desc
  const porCompeticao = useMemo(() => {
    const map = {};
    jogos.forEach(j => {
      const key = j.competicao;
      if (!map[key]) map[key] = [];
      map[key].push(j);
    });
    return Object.entries(map)
      .map(([comp, lista]) => ({
        comp,
        lista: [...lista].sort((a, b) => (b.data || '').localeCompare(a.data || '')),
      }))
      .sort((a, b) => b.lista.length - a.lista.length || a.comp.localeCompare(b.comp, 'pt-BR'));
  }, [jogos]);

  const saldo = resumo.gp - resumo.gc;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Título */}
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: C.t1, margin: 0 }}>Clubes — Histórico de Confrontos</h1>
        <p style={{ fontSize: 12, color: C.t3, margin: '4px 0 0' }}>
          Selecione um clube para ver os jogos do Botafogo, por campeonato — com placar, dia da semana e horário.
        </p>
      </div>

      {/* Seletor de clube */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
        boxShadow: SHADOW.card, padding: '14px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
          <div style={sectionTitle}>Selecione o clube</div>
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar clube…"
            style={{
              border: `1px solid ${C.border}`, borderRadius: 20, padding: '6px 14px',
              fontSize: 12, color: C.t1, outline: 'none', width: 'min(200px, 100%)', fontFamily: 'inherit',
              background: C.bg,
            }}
          />
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 8, maxHeight: 230, overflowY: 'auto',
        }}>
          {clubesFiltrados.map(c => {
            const active = c.nome === selected;
            return (
              <button
                key={c.nome}
                onClick={() => setSelected(c.nome)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                  border: `1px solid ${active ? C.accent : C.border}`,
                  background: active ? C.accentBg : C.card,
                  textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.12s ease',
                }}
              >
                <ClubLogo name={c.nome} size={22} />
                <span style={{
                  fontSize: 11, fontWeight: active ? 700 : 500,
                  color: active ? C.t1 : C.t2, lineHeight: 1.15,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{c.nome}</span>
              </button>
            );
          })}
          {clubesFiltrados.length === 0 && (
            <div style={{ fontSize: 12, color: C.t3, gridColumn: '1 / -1', padding: '8px 0' }}>
              Nenhum clube encontrado.
            </div>
          )}
        </div>
      </div>

      {selected && (
        <>
          {/* Cabeçalho do clube + resumo */}
          <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
            boxShadow: SHADOW.card, padding: '18px 22px',
            display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
          }}>
            <ClubLogo name={selected} size={64} />
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.t1 }}>{selected}</div>
              <div style={{ fontSize: 12, color: C.t3 }}>
                {jogos.length} {jogos.length === 1 ? 'jogo' : 'jogos'} contra o Botafogo
                {' · '}{porCompeticao.length} {porCompeticao.length === 1 ? 'campeonato' : 'campeonatos'}
              </div>
            </div>
          </div>

          {/* KPIs do confronto */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <StatBox label="Jogos" value={jogos.length} />
            <StatBox label="Vitórias BFR" value={resumo.v} color={C.green} />
            <StatBox label="Empates" value={resumo.e} color={C.t2} />
            <StatBox label="Derrotas BFR" value={resumo.d} color={C.red} />
            <StatBox
              label="Saldo de gols"
              value={`${saldo > 0 ? '+' : ''}${saldo}`}
              color={saldo > 0 ? C.green : saldo < 0 ? C.red : C.t2}
              sub={`${resumo.gp} pró · ${resumo.gc} contra`}
            />
          </div>

          {/* Jogos por campeonato */}
          {porCompeticao.map(({ comp, lista }) => {
            const logo = CAMP_LOGO[comp];
            return (
              <div key={comp} style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
                boxShadow: SHADOW.card, overflow: 'hidden',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', background: C.bgAlt, borderBottom: `1px solid ${C.border}`,
                }}>
                  {logo && <img src={`/logos/${logo}`} alt={comp} style={{ width: 22, height: 22, objectFit: 'contain' }} />}
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>{comp}</span>
                  <span style={{ fontSize: 10, color: C.t3, marginLeft: 'auto' }}>
                    {lista.length} {lista.length === 1 ? 'jogo' : 'jogos'}
                  </span>
                </div>
                {lista.map((m, i) => <MatchRow key={`${m.data}-${i}`} m={m} />)}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
