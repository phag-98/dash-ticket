import { useState, useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, Cell, BarChart, LabelList,
} from 'recharts';
import { C, SHADOW, CAMP_COLORS } from '../tokens';
import { LOGO_MAP, TEAM_COLORS, TeamBadge, COMP_LOGOS } from '../teamLogos.jsx';
import {
  kpis, faturamentoPorPartida, publicoPorTorcedor, publicoPorSetorPartida,
  partidas, faturamentoPorCampeonatoAno, ingressos, torcedores,
} from '../data/data';

const SOCIO_IDS = new Set(torcedores.filter(t => t.socio === 'Sim').map(t => t.id));
const SOCIO_NOMES = new Set(torcedores.filter(t => t.socio === 'Sim').map(t => t.nome));
const partidaById = Object.fromEntries(partidas.map(p => [p.id, p]));

function CustomXTick({ x, y, payload }) {
  const [timeName, rodada] = payload.value.split('|');
  const logoFile = LOGO_MAP[timeName];
  const initials = timeName.split(' ').filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join('').toUpperCase() || timeName.slice(0,2).toUpperCase();
  const bg = TEAM_COLORS[timeName] || '#888';

  return (
    <g transform={`translate(${x},${y})`}>
      {logoFile ? (
        <image href={`/logos/${logoFile}`} x={-10} y={4} width={20} height={20} style={{objectFit:'contain'}} />
      ) : (
        <foreignObject x={-10} y={4} width={20} height={20}>
          <div style={{width:20,height:20,borderRadius:'50%',background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:7,fontWeight:800,color:'#fff'}}>{initials}</div>
        </foreignObject>
      )}
      <text x={0} y={30} textAnchor="middle" fill={C.t3} fontSize={7}>{rodada}</text>
    </g>
  );
}

// Fix: merge ticketMedio correto de faturamentoPorPartida
const fatMap = Object.fromEntries(faturamentoPorPartida.map(p => [p.idPartida, p.ticketMedio]));
const publicoPorSetorPartidaFixed = publicoPorSetorPartida.map(p => ({
  ...p,
  ticketMedio: fatMap[p.idPartida] ?? p.ticketMedio,
}));

const CAMP_NAMES = [...new Set(partidas.map(p => p.campeonato).filter(Boolean))].sort();

const SETOR_PALETTE = {
  'Leste Inferior': C.lesteInf,
  'Leste Superior': C.lesteSup,
  'Maracanã Mais':  C.maracana,
  'Norte':          C.norte,
  'Oeste Inferior': C.oesteInf,
  'Oeste Superior': C.oesteSup,
  'Sul':            C.sul,
  'Arquibancada':   '#f97316',
  'Social':         '#84cc16',
  'VIP':            C.lib,
  'Camarote':       C.accent,
  'Promocional':    C.green,
  'Gratuidade':     C.t3,
  'Setor Visitante': C.red,
};
const getSetorColor = (nome) => SETOR_PALETTE[nome] || C.t3;

const sectionTitle = {
  fontSize: 10, fontWeight: 700, color: C.t2,
  textTransform: 'uppercase', letterSpacing: '1.5px',
};

const fmtR = v => {
  if (!v && v !== 0) return '—';
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(2).replace('.', ',')} Mi`;
  if (v >= 1_000)     return `R$ ${(v / 1_000).toFixed(0)} Mil`;
  return `R$ ${v.toLocaleString('pt-BR')}`;
};
const fmtK = v => v >= 1000 ? `${(v / 1000).toFixed(0)} Mil` : `${v}`;
const fmtPct = v => `${(v * 100).toFixed(1)}%`;

function FilterBtn({ label, active, onClick, color }) {
  const bg     = active ? (color || C.accent) : C.card;
  const col    = active ? '#000' : C.t2;
  const border = active ? (color || C.accent) : C.border;
  const logo   = COMP_LOGOS[label];
  return (
    <button onClick={onClick} style={{
      padding: '4px 14px', borderRadius: 20, border: `1px solid ${border}`,
      background: bg, color: col,
      fontSize: 10, fontWeight: active ? 700 : 500, cursor: 'pointer',
      letterSpacing: '0.5px', whiteSpace: 'nowrap', transition: 'all 0.12s ease',
      fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5,
    }}>
      {logo && <img src={`/logos/${logo}`} style={{ width: 16, height: 16, objectFit: 'contain' }} />}
      {label}
    </button>
  );
}

function Card({ children, title, style = {} }) {
  return (
    <div style={{
      background: C.card, borderRadius: 10, border: `1px solid ${C.border}`,
      boxShadow: SHADOW.card, overflow: 'hidden', ...style,
    }}>
      {title && <div style={{ padding: '12px 16px 0', ...sectionTitle, marginBottom: 8 }}>{title}</div>}
      {children}
    </div>
  );
}

function KPI({ label, value, icon, accent = false, variation }) {
  const hasVar = variation != null && !isNaN(variation) && Math.abs(variation) < 90;
  const varColor = !hasVar ? C.t3 : variation > 0 ? C.green : variation < 0 ? C.red : C.t2;
  const varBg    = !hasVar ? 'transparent' : variation > 0 ? C.greenBg : variation < 0 ? C.redBg : C.accentBg;

  return (
    <div style={{
      background: accent ? C.accentBg : C.card,
      border: `1px solid ${accent ? C.accent + '40' : C.border}`,
      borderRadius: 10, padding: '10px 14px',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: SHADOW.card, flex: 1, minWidth: 120,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 8,
        background: accent ? C.accent + '22' : C.bgAlt,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, flexShrink: 0, overflow: 'hidden',
      }}>
        {icon?.startsWith('/')
          ? <img src={icon} style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: 6 }} />
          : icon}
      </div>
      <div>
        <div style={{ fontSize: 9, color: C.t2, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: accent ? C.accent : C.t1, letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</div>
        {hasVar && (
          <div style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', background: varBg, borderRadius: 6, padding: '2px 6px' }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: varColor }}>
              {variation >= 0 ? '+' : ''}{variation.toFixed(1)}% vs 2024
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', fontSize: 11, boxShadow: SHADOW.md }}>
      <p style={{ fontWeight: 700, color: C.t1, marginBottom: 6, fontSize: 12 }}>{label?.replace('|', ' · ')}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill || C.t2, margin: '2px 0' }}>
          <span style={{ color: C.t3 }}>{p.name}: </span>
          <span style={{ fontWeight: 600 }}>{typeof p.value === 'number' ? (p.value > 1000 ? p.value.toLocaleString('pt-BR') : p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function ChampionshipReport() {
  const [campeonato, setCampeonato] = useState('Todos');
  const [ano, setAno] = useState('Todos');
  const [selectedPartida, setSelectedPartida] = useState(null);

  const handleRowClick = (idPartida) => {
    setSelectedPartida(prev => prev === idPartida ? null : idPartida);
  };

  const filteredFat = useMemo(() => {
    return faturamentoPorPartida.filter(p => {
      if (campeonato !== 'Todos' && p.campeonato !== campeonato) return false;
      if (ano !== 'Todos' && String(p.ano) !== ano) return false;
      return true;
    });
  }, [campeonato, ano]);

  const comboData = useMemo(() => {
    return publicoPorSetorPartidaFixed
      .filter(p => {
        if (campeonato !== 'Todos' && p.campeonato !== campeonato) return false;
        if (ano !== 'Todos' && String(p.ano) !== ano) return false;
        if (selectedPartida && p.idPartida !== selectedPartida) return false;
        return true;
      })
      .sort((a, b) => {
        const da = a.data.split('/').reverse().join('-');
        const db = b.data.split('/').reverse().join('-');
        return da.localeCompare(db);
      })
      .map(p => ({ ...p, label: `${p.time}|${p.rodada}` }));
  }, [campeonato, ano, selectedPartida]);

  const setorKeys = useMemo(() => {
    const keys = new Set();
    comboData.forEach(row => {
      Object.keys(row).forEach(k => {
        if (!['idPartida','time','campeonato','rodada','data','ano','mes','diaSemana','horario','ticketMedio','label'].includes(k)) {
          if (row[k] > 0) keys.add(k);
        }
      });
    });
    return [...keys];
  }, [comboData]);

  const filteredKpis = useMemo(() => {
    const base = selectedPartida
      ? filteredFat.filter(p => p.idPartida === selectedPartida)
      : filteredFat;

    // Compute percentualSocios from ingressos based on active filters
    let percentualSocios = kpis.percentualSocios;
    if (selectedPartida || campeonato !== 'Todos' || ano !== 'Todos') {
      const ingFiltered = ingressos.filter(r => {
        if (selectedPartida) return r.idPartida === selectedPartida;
        const p = partidaById[r.idPartida];
        if (!p) return false;
        if (campeonato !== 'Todos' && p.campeonato !== campeonato) return false;
        if (ano !== 'Todos' && String(p.ano) !== ano) return false;
        return true;
      });
      const totalPub = ingFiltered.reduce((s, r) => s + r.publico, 0);
      const socioPub = ingFiltered.filter(r => SOCIO_IDS.has(r.idTorcedor)).reduce((s, r) => s + r.publico, 0);
      if (totalPub > 0) percentualSocios = socioPub / totalPub;
    }

    if (!selectedPartida && campeonato === 'Todos' && ano === 'Todos') return kpis;
    const total_fat  = base.reduce((s, p) => s + p.faturamento, 0);
    const total_util = base.reduce((s, p) => s + p.utilizados, 0);
    const tm = total_util > 0 ? total_fat / total_util : 0;
    const pub_total  = base.reduce((s, p) => s + (p.utilizados || 0), 0);
    const media_pub  = base.length > 0 ? pub_total / base.length : 0;
    return { ...kpis, ticketMedio: Math.round(tm * 100) / 100, faturamentoTotal: total_fat, publicoTotal: pub_total, mediaPublico: media_pub, percentualSocios };
  }, [filteredFat, campeonato, ano, selectedPartida]);

  const kpiVariations = useMemo(() => {
    const filterByCamp = (rows) => campeonato !== 'Todos' ? rows.filter(r => r.campeonato === campeonato) : rows;
    const rows2024 = filterByCamp(faturamentoPorCampeonatoAno.filter(r => r.ano === 2024));
    const rows2025 = filterByCamp(faturamentoPorCampeonatoAno.filter(r => r.ano === 2025));
    const sum = (arr, f) => arr.reduce((s, r) => s + (r[f] || 0), 0);
    const avg = (arr, f) => arr.length ? sum(arr, f) / arr.length : 0;
    const pct = (v25, v24) => v24 > 0 ? ((v25 - v24) / v24) * 100 : null;
    return {
      ticketMedio:  pct(avg(rows2025, 'ticketMedio'), avg(rows2024, 'ticketMedio')),
      mediaPublico: pct(avg(rows2025, 'mediaPublico'), avg(rows2024, 'mediaPublico')),
      publicoTotal: pct(sum(rows2025, 'utilizados'), sum(rows2024, 'utilizados')),
      percentualSocios: null,
    };
  }, [campeonato]);

  const comboSocioData = useMemo(() => {
    const byPartida = {};
    ingressos.forEach(r => {
      const p = partidaById[r.idPartida];
      if (!p) return;
      if (campeonato !== 'Todos' && p.campeonato !== campeonato) return;
      if (ano !== 'Todos' && String(p.ano) !== ano) return;
      if (selectedPartida && r.idPartida !== selectedPartida) return;
      if (!byPartida[r.idPartida]) byPartida[r.idPartida] = { socio: 0, naoSocio: 0 };
      if (SOCIO_IDS.has(r.idTorcedor)) byPartida[r.idPartida].socio += r.publico || 0;
      else byPartida[r.idPartida].naoSocio += r.publico || 0;
    });
    return partidas
      .filter(p => {
        if (campeonato !== 'Todos' && p.campeonato !== campeonato) return false;
        if (ano !== 'Todos' && String(p.ano) !== ano) return false;
        if (selectedPartida && p.id !== selectedPartida) return false;
        return !!byPartida[p.id];
      })
      .sort((a, b) => (a.data || '').split('/').reverse().join('-').localeCompare((b.data || '').split('/').reverse().join('-')))
      .map(p => ({
        label: `${p.time}|${p.rodada}`,
        socio: byPartida[p.id]?.socio || 0,
        naoSocio: byPartida[p.id]?.naoSocio || 0,
        ticketMedio: fatMap[p.id] ?? 0,
      }));
  }, [campeonato, ano, selectedPartida]);

  const top20 = filteredFat.slice(0, 20);
  const totalFat = filteredFat.reduce((s, p) => s + p.faturamento, 0);
  const maxFat = top20.length > 0 ? top20[0].faturamento : 1;

  const sortedPublicoPorTorcedor = useMemo(() => {
    let base;
    if (selectedPartida || campeonato !== 'Todos' || ano !== 'Todos') {
      const torcedorMap = Object.fromEntries(torcedores.map(t => [t.id, t.nome]));
      const filtered = ingressos.filter(r => {
        if (selectedPartida) return r.idPartida === selectedPartida;
        const p = partidaById[r.idPartida];
        if (!p) return false;
        if (campeonato !== 'Todos' && p.campeonato !== campeonato) return false;
        if (ano !== 'Todos' && String(p.ano) !== ano) return false;
        return true;
      });
      const grouped = {};
      filtered.forEach(r => {
        const nome = torcedorMap[r.idTorcedor] || r.idTorcedor || 'Outros';
        grouped[nome] = (grouped[nome] || 0) + (r.publico || 0);
      });
      base = Object.entries(grouped).map(([torcedor, publico]) => ({ torcedor, publico }));
    } else {
      base = [...publicoPorTorcedor];
    }
    return base.filter(d => d.publico > 0).sort((a, b) => b.publico - a.publico);
  }, [selectedPartida, campeonato, ano]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Row 1: Filtros + 4 KPIs em linha ── */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', flexWrap: 'wrap' }}>

        {/* Filtros */}
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 10, padding: '10px 14px',
          display: 'flex', flexDirection: 'column', gap: 6,
          boxShadow: SHADOW.card, flexShrink: 0,
        }}>
          <div style={sectionTitle}>Filtros</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <FilterBtn label="Todos" active={campeonato === 'Todos'} onClick={() => setCampeonato('Todos')} />
            {CAMP_NAMES.map(c => (
              <FilterBtn key={c} label={c} active={campeonato === c} onClick={() => setCampeonato(c)} color={CAMP_COLORS[c]} />
            ))}
            <div style={{ width: 1, height: 18, background: C.border, flexShrink: 0 }} />
            {['Todos', '2024', '2025'].map(a => (
              <FilterBtn key={a} label={a} active={ano === a} onClick={() => setAno(a)} />
            ))}
          </div>
        </div>

        {/* 4 KPIs */}
        <KPI label="Sócios %" value={fmtPct(filteredKpis.percentualSocios)} icon="/logos/sócio.png" variation={null} />
        <KPI label="Ticket Médio" value={`R$ ${filteredKpis.ticketMedio.toFixed(2).replace('.', ',')}`} icon="🎟" variation={selectedPartida ? null : kpiVariations.ticketMedio} />
        <KPI label="Média de Público" value={fmtK(Math.round(filteredKpis.mediaPublico))} icon="👥" variation={selectedPartida ? null : kpiVariations.mediaPublico} />
        <KPI label="Público Total" value={filteredKpis.publicoTotal >= 1_000_000 ? `${(filteredKpis.publicoTotal/1_000_000).toFixed(2).replace('.',',')} Mi` : fmtK(Math.round(filteredKpis.publicoTotal))} icon="🏟" variation={selectedPartida ? null : kpiVariations.publicoTotal} />
      </div>

      {/* ── Row 2: Tabela + Gráficos ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 16 }}>

        {/* Tabela Faturamento */}
        <Card title="Faturamento por Partida">
          <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 260px)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ background: C.bgAlt, position: 'sticky', top: 0 }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '1.2px', whiteSpace: 'nowrap' }}>Rod.</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '1.2px' }}>Time</th>
                  <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: 9, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '1.2px' }}>Ano</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: 9, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '1.2px', whiteSpace: 'nowrap', background: `${C.accent}10` }}>Faturamento</th>
                </tr>
              </thead>
              <tbody>
                {filteredFat.map((p, i) => {
                  const pct = (p.faturamento / maxFat) * 100;
                  const isTop = i === 0;
                  const isSelected = selectedPartida === p.idPartida;
                  const rowBg = isSelected
                    ? `${C.accent}18`
                    : i % 2 !== 0 ? '#F8FAFC' : '#ffffff';
                  return (
                    <tr
                      key={p.idPartida}
                      onClick={() => handleRowClick(p.idPartida)}
                      style={{
                        borderBottom: `1px solid ${C.border}`,
                        background: rowBg,
                        cursor: 'pointer',
                        borderLeft: isSelected ? `3px solid ${C.accent}` : '3px solid transparent',
                        transition: 'background 0.15s',
                      }}
                    >
                      <td style={{ padding: '8px 10px', color: C.t2, fontWeight: 700, fontSize: 10, whiteSpace: 'nowrap', fontFamily: "'Courier New', monospace" }}>{p.rodada}</td>
                      <td style={{ padding: '8px 10px', color: C.t1, fontSize: 11, fontWeight: 500, maxWidth: 140 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <TeamBadge name={p.time} size={22} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.time}</span>
                        </div>
                      </td>
                      <td style={{ padding: '8px 6px', textAlign: 'center', fontSize: 10, color: C.t3, fontFamily: "'Courier New', monospace" }}>{p.ano}</td>
                      <td style={{ padding: '8px 10px', background: isSelected ? `${C.accent}18` : `${C.accent}08` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                          <div style={{ flex: 1, height: 5, borderRadius: 2, background: 'rgba(255,255,255,0.1)', overflow: 'hidden', minWidth: 40 }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: isTop ? C.accent : `${C.accent}99`, borderRadius: 2 }} />
                          </div>
                          <span style={{ fontWeight: 700, color: isTop ? C.accent : C.t2, fontSize: 10, whiteSpace: 'nowrap', fontFamily: "'Courier New', monospace" }}>
                            {fmtR(p.faturamento)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: `2px solid ${C.border}`, background: C.bgAlt }}>
                  <td colSpan={3} style={{ padding: '8px 10px', fontWeight: 700, color: C.t1, fontSize: 11 }}>Total</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: C.accent, fontSize: 12, background: `${C.accent}10`, fontFamily: "'Courier New', monospace" }}>
                    {fmtR(totalFat)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {/* Gráficos direita */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Combo público + ticket médio */}
          <Card>
            <div style={{ padding: '12px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ ...sectionTitle }}>Público e Ticket Médio por Partida, Time e Sócio</div>
                  {selectedPartida && (
                    <button onClick={() => setSelectedPartida(null)} style={{
                      fontSize: 9, padding: '2px 8px', borderRadius: 10,
                      background: C.accent, color: '#000', border: 'none',
                      cursor: 'pointer', fontWeight: 700, letterSpacing: '0.5px',
                    }}>✕ limpar filtro</button>
                  )}
                </div>
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: C.t2 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: C.accent, display: 'inline-block' }} />
                    Sócio
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: C.t2 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: '#64748b', display: 'inline-block' }} />
                    Não Sócio
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: C.t2 }}>
                    <svg width="14" height="3"><line x1={0} y1={1.5} x2={14} y2={1.5} stroke={C.accentDim} strokeWidth={2} strokeDasharray="3 2" /></svg>
                    Ticket Médio
                  </span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={comboSocioData} margin={{ top: 8, right: 60, bottom: 60, left: 10 }}>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={<CustomXTick />} axisLine={false} tickLine={false} height={50} interval={0} />
                <YAxis yAxisId="pub" orientation="left" tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <YAxis yAxisId="tkt" orientation="right" tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} />
                <RTooltip content={<DarkTooltip />} />
                <Bar yAxisId="pub" dataKey="socio" name="Sócio" stackId="pub" fill={C.accent} barSize={14} />
                <Bar yAxisId="pub" dataKey="naoSocio" name="Não Sócio" stackId="pub" fill="#64748b" barSize={14} radius={[3, 3, 0, 0]} />
                <Line yAxisId="tkt" type="monotone" dataKey="ticketMedio" name="Ticket Médio" stroke={C.accentDim} strokeWidth={2} dot={false} strokeDasharray="4 2" />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>

          {/* Público por tipo de torcedor */}
          <Card>
            <div style={{ padding: '12px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
              <span style={sectionTitle}>Público por Tipo de Torcedor</span>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                {(() => {
                  const totalSocio = sortedPublicoPorTorcedor.filter(d => SOCIO_NOMES.has(d.torcedor)).reduce((s, d) => s + d.publico, 0);
                  const totalNao   = sortedPublicoPorTorcedor.filter(d => !SOCIO_NOMES.has(d.torcedor)).reduce((s, d) => s + d.publico, 0);
                  const total = totalSocio + totalNao;
                  return (
                    <>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: C.t2 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 2, background: C.accent, display: 'inline-block' }} />
                        Sócio {total > 0 ? `· ${((totalSocio / total) * 100).toFixed(0)}%` : ''}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: C.t2 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 2, background: '#64748b', display: 'inline-block' }} />
                        Não Sócio {total > 0 ? `· ${((totalNao / total) * 100).toFixed(0)}%` : ''}
                      </span>
                    </>
                  );
                })()}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sortedPublicoPorTorcedor} margin={{ top: 28, right: 16, bottom: 60, left: 10 }}>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="torcedor" tick={{ fill: C.t3, fontSize: 8 }} axisLine={false} tickLine={false} angle={-35} textAnchor="end" height={70} interval={0} />
                <YAxis hide />
                <RTooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  const isSocio = SOCIO_NOMES.has(d.torcedor);
                  return (
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', fontSize: 11, boxShadow: SHADOW.md }}>
                      <p style={{ fontWeight: 700, color: C.t1, marginBottom: 3 }}>{d.torcedor}</p>
                      <p style={{ color: isSocio ? C.accent : '#64748b', fontSize: 10, marginBottom: 2 }}>{isSocio ? 'Sócio' : 'Não Sócio'}</p>
                      <p style={{ color: C.t2 }}>Público: <strong>{d.publico.toLocaleString('pt-BR')}</strong></p>
                    </div>
                  );
                }} />
                <Bar dataKey="publico" name="Público" radius={[3, 3, 0, 0]} barSize={26}>
                  {sortedPublicoPorTorcedor.map((d, i) => (
                    <Cell key={i} fill={SOCIO_NOMES.has(d.torcedor) ? C.accent : '#64748b'} />
                  ))}
                  <LabelList dataKey="publico" position="top" formatter={fmtK} style={{ fontSize: 8, fill: C.t2, fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

        </div>
      </div>
    </div>
  );
}
