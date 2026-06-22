import { useState, useMemo } from 'react';
import { C, SHADOW } from '../tokens';
import { TeamBadge, getCompLogo } from '../teamLogos.jsx';
import { placares } from '../data/placares';
import { partidas } from '../data/data';

const BOTAFOGO = 'Botafogo';
const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// Horário por (data|adversário), a partir das partidas (apenas mandante tem registro)
const HORARIO_MAP = (() => {
  const m = {};
  partidas.forEach(p => { if (p.data && p.time) m[`${p.data}|${p.time}`] = p.horario; });
  return m;
})();

function diaDaSemana(dataBR) {
  const [d, mes, a] = (dataBR || '').split('/').map(Number);
  if (!d || !mes || !a) return null;
  return DIAS[new Date(a, mes - 1, d).getDay()];
}

// Normaliza cada placar para a perspectiva do Botafogo
function normalizar(p) {
  const mandanteBFR = p.mandante === BOTAFOGO;
  const adversario = mandanteBFR ? p.visitante : p.mandante;
  return {
    ...p,
    adversario,
    local: mandanteBFR ? 'Casa' : 'Fora',
    golsBotafogo: mandanteBFR ? p.golsMandante : p.golsVisitante,
    golsAdversario: mandanteBFR ? p.golsVisitante : p.golsMandante,
    ano: Number((p.data || '').split('/')[2]) || null,
    diaSemana: diaDaSemana(p.data),
    horario: HORARIO_MAP[`${p.data}|${adversario}`] || null,
    iso: (p.data || '').split('/').reverse().join('-'),
  };
}

const JOGOS = placares.map(normalizar);

// Lista de adversários (alfabética) com nº de jogos
const CLUBES = (() => {
  const map = {};
  JOGOS.forEach(j => { map[j.adversario] = (map[j.adversario] || 0) + 1; });
  return Object.entries(map)
    .map(([nome, jogos]) => ({ nome, jogos }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
})();

const RESULT_META = {
  V: { label: 'Vitória', color: C.green, bg: C.greenBg },
  E: { label: 'Empate',  color: C.t2,    bg: C.accentBg },
  D: { label: 'Derrota', color: C.red,   bg: C.redBg },
};

const sectionTitle = {
  fontSize: 10, fontWeight: 700, color: C.t2,
  textTransform: 'uppercase', letterSpacing: '1.5px',
};

function StatBox({ label, value, color = C.t1 }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
      padding: '10px 16px', boxShadow: SHADOW.card, flex: 1, minWidth: 90,
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1.1, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function MatchRow({ m }) {
  const meta = RESULT_META[m.resultado] || RESULT_META.E;
  const quando = [m.diaSemana, m.horario].filter(Boolean).join(' · ');
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
      padding: '12px 16px', borderTop: `1px solid ${C.border}`,
    }}>
      {/* Data / dia / horário */}
      <div style={{ width: 150, minWidth: 130, flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>{m.data}</div>
        <div style={{ fontSize: 10, color: C.t3 }}>{[m.local, quando].filter(Boolean).join(' · ')}</div>
      </div>

      {/* Placar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flex: 1, minWidth: 220 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', flex: 1 }}>
          <span style={{ fontSize: 11, color: C.t2, fontWeight: 600 }}>Botafogo</span>
          <TeamBadge name="Botafogo" size={24} />
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 17, fontWeight: 800, color: C.t1,
          background: C.bgAlt, borderRadius: 8, padding: '2px 12px', minWidth: 56, justifyContent: 'center',
        }}>
          <span>{m.golsBotafogo}</span>
          <span style={{ color: C.t3, fontWeight: 500 }}>×</span>
          <span>{m.golsAdversario}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
          <TeamBadge name={m.adversario} size={24} />
          <span style={{ fontSize: 11, color: C.t2, fontWeight: 600 }}>{m.adversario}</span>
        </div>
      </div>

      {/* Resultado */}
      <div style={{
        width: 54, flexShrink: 0,
        fontSize: 10, fontWeight: 800, color: meta.color, background: meta.bg,
        borderRadius: 6, padding: '4px 0', textAlign: 'center', letterSpacing: '0.5px',
      }} title={meta.label}>{m.resultado}</div>
    </div>
  );
}

export default function Clubes() {
  const [selected, setSelected] = useState(CLUBES[0]?.nome ?? null);
  const [busca, setBusca] = useState('');

  const clubesFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return q ? CLUBES.filter(c => c.nome.toLowerCase().includes(q)) : CLUBES;
  }, [busca]);

  const jogos = useMemo(
    () => JOGOS.filter(j => j.adversario === selected),
    [selected]
  );

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

  const porCampeonato = useMemo(() => {
    const map = {};
    jogos.forEach(j => { (map[j.campeonato] ??= []).push(j); });
    return Object.entries(map)
      .map(([camp, lista]) => ({ camp, lista: [...lista].sort((a, b) => b.iso.localeCompare(a.iso)) }))
      .sort((a, b) => b.lista.length - a.lista.length || a.camp.localeCompare(b.camp, 'pt-BR'));
  }, [jogos]);

  const saldo = resumo.gp - resumo.gc;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Seletor de clube */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
        boxShadow: SHADOW.card, padding: '14px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
          <span style={sectionTitle}>Selecione o clube</span>
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar clube…"
            style={{
              border: `1px solid ${C.border}`, borderRadius: 20, padding: '6px 14px',
              fontSize: 12, color: C.t1, outline: 'none', width: 'min(220px, 100%)',
              fontFamily: 'inherit', background: C.bg,
            }}
          />
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: 8, maxHeight: 220, overflowY: 'auto',
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
                  textAlign: 'left', fontFamily: 'inherit',
                }}
              >
                <TeamBadge name={c.nome} size={22} />
                <span style={{
                  fontSize: 11, fontWeight: active ? 700 : 500, color: active ? C.t1 : C.t2,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{c.nome}</span>
              </button>
            );
          })}
          {clubesFiltrados.length === 0 && (
            <div style={{ fontSize: 12, color: C.t3, gridColumn: '1 / -1' }}>Nenhum clube encontrado.</div>
          )}
        </div>
      </div>

      {selected && (
        <>
          {/* Cabeçalho do clube */}
          <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
            boxShadow: SHADOW.card, padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
          }}>
            <TeamBadge name={selected} size={56} />
            <div style={{ minWidth: 150 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.t1 }}>{selected}</div>
              <div style={{ fontSize: 12, color: C.t3 }}>
                {jogos.length} {jogos.length === 1 ? 'jogo' : 'jogos'} vs Botafogo
                {' · '}{porCampeonato.length} {porCampeonato.length === 1 ? 'campeonato' : 'campeonatos'}
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <StatBox label="Jogos" value={jogos.length} />
            <StatBox label="Vitórias" value={resumo.v} color={C.green} />
            <StatBox label="Empates" value={resumo.e} color={C.t2} />
            <StatBox label="Derrotas" value={resumo.d} color={C.red} />
            <StatBox label="Saldo" value={`${saldo > 0 ? '+' : ''}${saldo}`} color={saldo > 0 ? C.green : saldo < 0 ? C.red : C.t2} />
          </div>

          {/* Jogos por campeonato */}
          {porCampeonato.map(({ camp, lista }) => {
            const logo = getCompLogo(camp);
            return (
              <div key={camp} style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
                boxShadow: SHADOW.card, overflow: 'hidden',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', background: C.bgAlt, borderBottom: `1px solid ${C.border}`,
                }}>
                  {logo && <img src={`/logos/${logo}`} alt={camp} style={{ width: 22, height: 22, objectFit: 'contain' }} />}
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>{camp}</span>
                  <span style={{ fontSize: 10, color: C.t3, marginLeft: 'auto' }}>
                    {lista.length} {lista.length === 1 ? 'jogo' : 'jogos'}
                  </span>
                </div>
                {lista.map((m, i) => <MatchRow key={`${m.iso}-${i}`} m={m} />)}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
