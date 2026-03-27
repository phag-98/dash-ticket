import { useState, useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, BarChart, Cell,
  Legend,
} from 'recharts';
import { C, FONT, SHADOW, SETOR_COLORS, CAMP_COLORS } from '../tokens';
import {
  filtrarPartidas, kpiSummary, topFaturamento,
  publicoPorSetorPartida, publicoPorTipoAgregado,
  CAMPEONATOS, SETORES,
} from '../data/mock';

// ─── Helpers ────────────────────────────────────────────────────
const fmtR = v => {
  if (!v && v !== 0) return '—';
  if (v >= 1_000_000) return `R$ ${(v/1_000_000).toFixed(2).replace('.',',')} Mi`;
  if (v >= 1_000)     return `R$ ${(v/1_000).toFixed(0).replace('.',',')} Mil`;
  return `R$ ${v.toLocaleString('pt-BR')}`;
};
const fmtK = v => v >= 1000 ? `${(v/1000).toFixed(0)} Mil` : `${v}`;
const fmtPct = v => `${(v*100).toFixed(0)}%`;

// ─── Card wrapper ────────────────────────────────────────────────
function Card({ children, title, style={} }) {
  return (
    <div style={{
      background:C.card, borderRadius:10, border:`1px solid ${C.border}`,
      boxShadow:SHADOW.card, overflow:'hidden', ...style,
    }}>
      {title && (
        <div style={{ padding:'12px 16px 0', fontSize:11, fontWeight:700, color:C.t2, textTransform:'uppercase', letterSpacing:'0.6px' }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────
function KPI({ label, value, icon, accent=false }) {
  return (
    <div style={{
      background: accent ? C.accentBg : C.card,
      border:`1px solid ${accent ? C.accent+'40' : C.border}`,
      borderRadius:10, padding:'14px 18px',
      display:'flex', alignItems:'center', gap:14,
      boxShadow:SHADOW.card, flex:1, minWidth:150,
    }}>
      <div style={{
        width:42, height:42, borderRadius:10,
        background: accent ? C.accent+'22' : C.bgAlt,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:20, flexShrink:0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize:9, color:C.t2, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:2 }}>{label}</div>
        <div style={{ fontSize:22, fontWeight:800, color: accent ? C.accent : C.t1, letterSpacing:'-0.5px', lineHeight:1 }}>{value}</div>
      </div>
    </div>
  );
}

// ─── Custom Tooltip ──────────────────────────────────────────────
const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#1e1e2e', border:`1px solid ${C.border}`, borderRadius:8, padding:'10px 14px', fontSize:11, boxShadow:SHADOW.md }}>
      <p style={{ fontWeight:700, color:C.t1, marginBottom:6, fontSize:12 }}>{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{ color:p.color||C.t2, margin:'2px 0' }}>
          <span style={{ color:C.t3 }}>{p.name}: </span>
          <span style={{ fontWeight:600 }}>{typeof p.value==='number'? (p.value>100?p.value.toLocaleString('pt-BR'):p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────
export default function ChampionshipReport() {
  const [campeonato, setCampeonato] = useState('Todos');
  const [ano,        setAno]        = useState('Todos');

  const partidas = useMemo(() => filtrarPartidas({ campeonato, ano }), [campeonato, ano]);
  const kpi      = useMemo(() => kpiSummary(partidas), [partidas]);
  const topList  = useMemo(() => topFaturamento(partidas, 20), [partidas]);
  const comboData= useMemo(() => publicoPorSetorPartida(partidas), [partidas]);
  const tipoData = useMemo(() => publicoPorTipoAgregado(partidas), [partidas]);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* ── Filters + KPIs ── */}
      <div style={{ display:'flex', gap:12, alignItems:'stretch', flexWrap:'wrap' }}>

        {/* Filters block */}
        <div style={{
          background:C.card, border:`1px solid ${C.border}`,
          borderRadius:10, padding:'12px 16px',
          display:'flex', flexDirection:'column', gap:8, boxShadow:SHADOW.card,
        }}>
          <div style={{ fontSize:9, color:C.t3, textTransform:'uppercase', letterSpacing:'0.8px' }}>Filtros</div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <div>
              <div style={{ fontSize:9, color:C.t3, marginBottom:3 }}>Campeonato</div>
              <select
                value={campeonato} onChange={e=>setCampeonato(e.target.value)}
                style={{ background:C.bgAlt, border:`1px solid ${C.border}`, borderRadius:6, color:C.t1, padding:'5px 10px', fontSize:11, fontFamily:FONT, cursor:'pointer' }}
              >
                <option>Todos</option>
                {CAMPEONATOS.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:9, color:C.t3, marginBottom:3 }}>Ano</div>
              <select
                value={ano} onChange={e=>setAno(e.target.value)}
                style={{ background:C.bgAlt, border:`1px solid ${C.border}`, borderRadius:6, color:C.t1, padding:'5px 10px', fontSize:11, fontFamily:FONT, cursor:'pointer' }}
              >
                <option>Todos</option>
                <option>2024</option>
                <option>2025</option>
              </select>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <KPI label="Sócios"          value={fmtPct(kpi.socios_pct)}   icon="⭐" accent />
        <KPI label="Ticket Médio"    value={`${kpi.ticket_medio.toFixed(2).replace('.',',')}`} icon="🎟" />
        <KPI label="Média de Público" value={`${(kpi.media_publico/1000).toFixed(2).replace('.',',')} Mil`} icon="👥" />
        <KPI label="Público Total"   value={`${(kpi.publico_total/1_000_000).toFixed(2).replace('.',',')} Mi`} icon="🏟" />
      </div>

      {/* ── Bottom section: Faturamento table | Charts ── */}
      <div style={{ display:'grid', gridTemplateColumns:'340px 1fr', gap:16 }}>

        {/* Left: Faturamento table */}
        <Card title="Faturamento">
          <div style={{ overflowY:'auto', maxHeight:'calc(100vh - 240px)' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
              <thead>
                <tr style={{ background:C.bgAlt, position:'sticky', top:0 }}>
                  <th style={{ padding:'8px 12px', textAlign:'left', fontSize:9, fontWeight:700, color:C.t3, textTransform:'uppercase', letterSpacing:'0.6px', whiteSpace:'nowrap' }}>Rodada</th>
                  <th style={{ padding:'8px 12px', textAlign:'left', fontSize:9, fontWeight:700, color:C.t3, textTransform:'uppercase', letterSpacing:'0.6px' }}>Time</th>
                  <th style={{ padding:'8px 12px', textAlign:'right', fontSize:9, fontWeight:700, color:C.accent, textTransform:'uppercase', letterSpacing:'0.6px', whiteSpace:'nowrap', background:`${C.accent}10` }}>Faturamento</th>
                </tr>
              </thead>
              <tbody>
                {topList.map((p,i) => (
                  <tr key={p.id} style={{ borderBottom:`1px solid ${C.border}`, background: i%2===0?'transparent':C.bgAlt+'44' }}>
                    <td style={{ padding:'7px 12px', color:C.t2, fontWeight:600, fontSize:10, whiteSpace:'nowrap' }}>{p.rodada}</td>
                    <td style={{ padding:'7px 12px', color:C.t1, fontSize:11, maxWidth:130, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.adversario}</td>
                    <td style={{ padding:'7px 12px', textAlign:'right', fontWeight:700, color:C.accent, fontSize:11, whiteSpace:'nowrap', background:`${C.accent}08` }}>
                      {`R$ ${p.faturamento.toLocaleString('pt-BR')}`}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop:`2px solid ${C.border}`, background:C.bgAlt }}>
                  <td colSpan={2} style={{ padding:'8px 12px', fontWeight:700, color:C.t1, fontSize:11 }}>Total</td>
                  <td style={{ padding:'8px 12px', textAlign:'right', fontWeight:800, color:C.accent, fontSize:12, background:`${C.accent}10` }}>
                    {`R$ ${partidas.reduce((s,p)=>s+p.faturamento,0).toLocaleString('pt-BR')}`}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {/* Right: charts stacked */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Combo chart: Público por setor + Ticket Médio */}
          <Card>
            <div style={{ padding:'12px 16px 8px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:C.t1 }}>PÚBLICO e TICKET MÉDIO por PARTIDA, TIME e SETOR</div>
                <div style={{ marginTop:8, display:'flex', flexWrap:'wrap', gap:10 }}>
                  {SETORES.map(s=>(
                    <span key={s.id} style={{ display:'flex', alignItems:'center', gap:4, fontSize:9, color:C.t2 }}>
                      <span style={{ width:8, height:8, borderRadius:2, background:SETOR_COLORS[s.nome], display:'inline-block' }}/>
                      {s.nome}
                    </span>
                  ))}
                  <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:9, color:C.t2 }}>
                    <svg width="14" height="3"><line x1={0} y1={1.5} x2={14} y2={1.5} stroke={C.ticketLine} strokeWidth={2}/></svg>
                    TICKET MÉDIO
                  </span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={comboData} margin={{ top:8, right:60, bottom:60, left:10 }}>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="adversario" tick={{ fill:C.t3, fontSize:8 }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={70} interval={0}/>
                <YAxis yAxisId="pub" orientation="left"  tick={{ fill:C.t3, fontSize:9 }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`} label={{ value:'PÚBLICO', angle:-90, position:'insideLeft', fill:C.t3, fontSize:9, dx:-4 }}/>
                <YAxis yAxisId="tkt" orientation="right" tick={{ fill:C.t3, fontSize:9 }} axisLine={false} tickLine={false} label={{ value:'TICKET MÉDIO', angle:90, position:'insideRight', fill:C.t3, fontSize:9, dx:12 }}/>
                <RTooltip content={<DarkTooltip/>}/>
                {SETORES.map(s=>(
                  <Bar key={s.id} yAxisId="pub" dataKey={s.nome} stackId="pub" fill={SETOR_COLORS[s.nome]} barSize={14}/>
                ))}
                <Line yAxisId="tkt" type="monotone" dataKey="ticket_medio" name="Ticket Médio" stroke={C.ticketLine} strokeWidth={2} dot={false}/>
              </ComposedChart>
            </ResponsiveContainer>
          </Card>

          {/* Bar chart: Público por tipo ingresso */}
          <Card>
            <div style={{ padding:'12px 16px 0', fontSize:11, fontWeight:700, color:C.t1 }}>
              PÚBLICO por Tipo de Ingresso
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={tipoData} margin={{ top:16, right:16, bottom:48, left:10 }}>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="tipo" tick={{ fill:C.t3, fontSize:8 }} axisLine={false} tickLine={false} angle={-35} textAnchor="end" height={60} interval={0}/>
                <YAxis tick={{ fill:C.t3, fontSize:9 }} axisLine={false} tickLine={false} tickFormatter={fmtK}/>
                <RTooltip content={<DarkTooltip/>}/>
                <Bar dataKey="publico" name="Público" radius={[3,3,0,0]} barSize={28}
                  label={{ position:'top', fontSize:8, fontWeight:700, fill:C.t2, formatter:fmtK }}>
                  {tipoData.map((_,i)=><Cell key={i} fill={i===0?C.accent:'#2a2a3e'}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

        </div>
      </div>
    </div>
  );
}
