import { useState, useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, ReferenceLine,
  LineChart, Line, BarChart, Bar, Cell, LabelList,
} from 'recharts';
import { C, FONT, SHADOW, CAMP_COLORS, SETOR_COLORS } from '../tokens';
import {
  CAMPEONATOS, SETORES, filtrarPartidas, kpiSummary, topFaturamento,
  getSetorBreakdown, unitarioPorTimeSetor, faturamentoPorCampeonatoAno,
} from '../data/mock';

const fmtM = v => {
  if (!v&&v!==0) return '—';
  if (v>=1_000_000) return `R$ ${(v/1_000_000).toFixed(1).replace('.',',')} Mi`;
  if (v>=1_000) return `R$ ${(v/1_000).toFixed(0)} Mil`;
  return `R$ ${v}`;
};
const fmtK = v => v>=1000?`${(v/1000).toFixed(0)}k`:`${v}`;

function Card({ children, title, style={} }) {
  return (
    <div style={{ background:C.card, borderRadius:10, border:`1px solid ${C.border}`, boxShadow:SHADOW.card, ...style }}>
      {title&&<div style={{ padding:'12px 16px 0', fontSize:11, fontWeight:700, color:C.t1, marginBottom:4 }}>{title}</div>}
      {children}
    </div>
  );
}

const DarkTooltip = ({ active, payload }) => {
  if (!active||!payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{ background:'#1e1e2e', border:`1px solid ${C.border}`, borderRadius:8, padding:'10px 14px', fontSize:11, boxShadow:SHADOW.md }}>
      <p style={{ fontWeight:700, color:C.t1, marginBottom:4 }}>{d.adversario||d.campeonato}</p>
      {d.publico && <p style={{ color:C.t2 }}>Público: <b style={{ color:C.t1 }}>{d.publico.toLocaleString('pt-BR')}</b></p>}
      {d.ticket_medio && <p style={{ color:C.t2 }}>Ticket Médio: <b style={{ color:C.accent }}>R$ {d.ticket_medio.toFixed(2)}</b></p>}
      {d.campeonato && <p style={{ color:CAMP_COLORS[d.campeonato] }}>{d.campeonato}</p>}
    </div>
  );
};

export default function Precos() {
  const [campeonato, setCampeonato] = useState(null);
  const [ano,        setAno]        = useState(null);

  const partidas = useMemo(()=>filtrarPartidas({ campeonato:campeonato||'Todos', ano:ano||'Todos' }),[campeonato,ano]);
  const kpi      = useMemo(()=>kpiSummary(partidas),[partidas]);
  const top5     = useMemo(()=>topFaturamento(partidas,5),[partidas]);

  // Scatter data: público vs ticket médio, colored by campeonato
  const scatterGroups = useMemo(()=>{
    return CAMPEONATOS.map(c=>({
      campeonato:c,
      data:partidas.filter(p=>p.campeonato===c).map(p=>({ ...p, x:p.publico, y:p.ticket_medio })),
      fill:CAMP_COLORS[c],
    })).filter(g=>g.data.length>0);
  },[partidas]);

  // Preço inteira by time+setor (ticket médio proxy)
  const precoSetor = useMemo(()=>unitarioPorTimeSetor(partidas),[partidas]);

  // Faturamento by campeonato ano for table
  const campAnoData = useMemo(()=>faturamentoPorCampeonatoAno(),[]);

  // Grouped bar by campeonato: ticket médio x setor (aggregate)
  const ticketCampData = useMemo(()=>{
    return CAMPEONATOS.map(c=>{
      const ps = partidas.filter(p=>p.campeonato===c);
      const row = { campeonato:c };
      if (!ps.length) return null;
      SETORES.forEach(s=>{
        const vals = ps.flatMap(p=>getSetorBreakdown(p).filter(sd=>sd.setor===s.nome).map(sd=>sd.ticket_medio));
        row[s.nome] = vals.length ? parseFloat((vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2)) : 0;
      });
      return row;
    }).filter(Boolean);
  },[partidas]);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* ── Filters ── */}
      <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:4 }}>
          {[null,...CAMPEONATOS].map(c=>(
            <button key={c??'todos'} onClick={()=>setCampeonato(c)} style={{
              padding:'5px 12px', borderRadius:6, border:`1px solid ${C.border}`,
              background:campeonato===c?(c?CAMP_COLORS[c]:C.accent):C.card,
              color:campeonato===c?'#000':C.t2,
              fontSize:10, fontWeight:600, cursor:'pointer', fontFamily:FONT,
            }}>{c??'Todos'}</button>
          ))}
        </div>
        <div style={{ width:1, height:24, background:C.border }}/>
        <div style={{ display:'flex', gap:4 }}>
          {[null,2024,2025].map(a=>(
            <button key={a??'todos'} onClick={()=>setAno(a)} style={{
              padding:'5px 12px', borderRadius:6, border:`1px solid ${C.border}`,
              background:ano===a?C.accent:C.card, color:ano===a?'#000':C.t2,
              fontSize:10, fontWeight:600, cursor:'pointer', fontFamily:FONT,
            }}>{a??'Todos'}</button>
          ))}
        </div>
      </div>

      {/* ── Row 1: KPI + Scatter ── */}
      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:14 }}>

        {/* Left: Número de jogos + top partidas */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <Card>
            <div style={{ padding:'20px 20px 12px', textAlign:'center' }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.t2, textTransform:'uppercase', marginBottom:4 }}>Número de Jogos</div>
              <div style={{ fontSize:52, fontWeight:900, color:C.accent, lineHeight:1 }}>{kpi.n_jogos}</div>
            </div>
          </Card>

          {/* Top 5 campeonatos */}
          <Card title="Por Campeonato">
            <div style={{ padding:'4px 0 8px' }}>
              {campAnoData.filter(d=>!campeonato||d.campeonato===campeonato).reduce((acc,d)=>{
                const ex = acc.find(a=>a.campeonato===d.campeonato);
                if (ex) { ex.ticket_sum+=d.ticket_medio; ex.n++; ex.fat+=d.faturamento; }
                else acc.push({ campeonato:d.campeonato, ticket_sum:d.ticket_medio, n:1, fat:d.faturamento });
                return acc;
              },[]).map((r,i)=>(
                <div key={r.campeonato} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 14px', borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ fontSize:10, color:C.t1 }}>{r.campeonato}</span>
                  <span style={{ fontSize:10, color:C.accent, fontWeight:700 }}>R$ {(r.ticket_sum/r.n).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Scatter: Público vs Ticket Médio */}
        <Card title="Público e Ticket Médio por Partida e Campeonato">
          <div style={{ padding:'4px 16px 8px', display:'flex', gap:12 }}>
            {scatterGroups.map(g=>(
              <span key={g.campeonato} style={{ display:'flex', alignItems:'center', gap:4, fontSize:9, color:C.t2 }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:g.fill, display:'inline-block' }}/>
                {g.campeonato}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top:8, right:24, bottom:16, left:16 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3"/>
              <XAxis type="number" dataKey="x" name="Público" tick={{ fill:C.t3, fontSize:9 }} axisLine={false} tickLine={false} tickFormatter={fmtK} label={{ value:'Público', position:'insideBottom', fill:C.t3, fontSize:9, offset:-4 }}/>
              <YAxis type="number" dataKey="y" name="Ticket Médio" tick={{ fill:C.t3, fontSize:9 }} axisLine={false} tickLine={false} label={{ value:'Ticket Médio', angle:-90, position:'insideLeft', fill:C.t3, fontSize:9, dx:-4 }}/>
              <RTooltip content={<DarkTooltip/>}/>
              {scatterGroups.map(g=>(
                <Scatter key={g.campeonato} name={g.campeonato} data={g.data} fill={g.fill} opacity={0.8} r={5}/>
              ))}
              <ReferenceLine y={kpi.ticket_medio} stroke={C.t3} strokeDasharray="4 2"/>
            </ScatterChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Row 2: Preço por setor + stacked bars ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>

        {/* Preço inteira por time e setor */}
        <Card title="Ticket Médio por Time e Setor">
          <div style={{ padding:'4px 16px 8px', display:'flex', gap:10, flexWrap:'wrap' }}>
            {SETORES.map(s=>(
              <span key={s.id} style={{ display:'flex', alignItems:'center', gap:4, fontSize:9, color:C.t2 }}>
                <span style={{ width:14, height:2, background:SETOR_COLORS[s.nome], display:'inline-block' }}/>
                {s.nome}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={precoSetor} margin={{ top:8, right:16, bottom:60, left:10 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="adversario" tick={{ fill:C.t3, fontSize:8 }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={70} interval={0}/>
              <YAxis tick={{ fill:C.t3, fontSize:9 }} axisLine={false} tickLine={false}/>
              <RTooltip content={({ active, payload, label }) => {
                if (!active||!payload?.length) return null;
                return (
                  <div style={{ background:'#1e1e2e', border:`1px solid ${C.border}`, borderRadius:8, padding:'10px 14px', fontSize:11 }}>
                    <p style={{ fontWeight:700, color:C.t1, marginBottom:4 }}>{label}</p>
                    {payload.filter(p=>p.value!=null).map((p,i)=>(
                      <p key={i} style={{ color:p.stroke, margin:'2px 0', fontSize:10 }}>{p.name}: <b>{p.value}</b></p>
                    ))}
                  </div>
                );
              }}/>
              {SETORES.map(s=>(
                <Line key={s.id} type="monotone" dataKey={s.nome} stroke={SETOR_COLORS[s.nome]} strokeWidth={1.5} dot={{ r:2, fill:SETOR_COLORS[s.nome] }} connectNulls/>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Ticket médio por campeonato e setor — grouped bars */}
        <Card title="Ticket Médio por Campeonato e Setor">
          <div style={{ padding:'4px 16px 8px', display:'flex', gap:10, flexWrap:'wrap' }}>
            {SETORES.map(s=>(
              <span key={s.id} style={{ display:'flex', alignItems:'center', gap:4, fontSize:9, color:C.t2 }}>
                <span style={{ width:8, height:8, borderRadius:2, background:SETOR_COLORS[s.nome], display:'inline-block' }}/>
                {s.nome}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ticketCampData} margin={{ top:8, right:16, bottom:32, left:10 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="campeonato" tick={{ fill:C.t3, fontSize:9 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={40} interval={0}/>
              <YAxis tick={{ fill:C.t3, fontSize:9 }} axisLine={false} tickLine={false}/>
              <RTooltip content={({ active, payload, label }) => {
                if (!active||!payload?.length) return null;
                return (
                  <div style={{ background:'#1e1e2e', border:`1px solid ${C.border}`, borderRadius:8, padding:'10px 14px', fontSize:11 }}>
                    <p style={{ fontWeight:700, color:C.t1, marginBottom:4 }}>{label}</p>
                    {payload.map((p,i)=>(
                      <p key={i} style={{ color:p.fill, margin:'2px 0', fontSize:10 }}>{p.name}: <b>{p.value}</b></p>
                    ))}
                  </div>
                );
              }}/>
              {SETORES.map(s=>(
                <Bar key={s.id} dataKey={s.nome} fill={SETOR_COLORS[s.nome]} barSize={8} radius={[2,2,0,0]}/>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Card>

      </div>

    </div>
  );
}
