import { useState, useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, ReferenceLine,
  BarChart, Bar, Cell, XAxis as XA, YAxis as YA,
} from 'recharts';
import { C, FONT, SHADOW, CAMP_COLORS } from '../tokens';
import { PARTIDAS, CAMPEONATOS, noShowSummary } from '../data/mock';

const fmtM = v => v>=1_000_000?`R$${(v/1_000_000).toFixed(2)}M`:`R$${(v/1_000).toFixed(0)}K`;
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
      <p style={{ fontWeight:700, color:C.t1, marginBottom:4 }}>{d.adversario}</p>
      <p style={{ color:C.t2 }}>Público: <b style={{ color:C.t1 }}>{d.publico?.toLocaleString('pt-BR')}</b></p>
      <p style={{ color:C.t2 }}>No Show %: <b style={{ color:C.red }}>{(d.no_show_pct*100).toFixed(1)}%</b></p>
      <p style={{ color:C.t2 }}>Campeonato: <b style={{ color:CAMP_COLORS[d.campeonato] }}>{d.campeonato}</b></p>
    </div>
  );
};

const HORARIOS = ['14:00','16:00','18:00','18:30','19:00','20:00','20:30','21:30'];
const DIAS = ['Domingo','Sábado','Quarta-feira','Quinta-feira','Terça-feira','Sexta-feira'];

export default function NoShow() {
  const [horFilter, setHorFilter] = useState(null);
  const [diaFilter, setDiaFilter] = useState(null);
  const [anoFilter, setAnoFilter] = useState(null);

  const all = useMemo(()=>noShowSummary(),[]);

  const data = useMemo(()=>all.filter(d=>{
    if (horFilter && d.horario!==horFilter) return false;
    if (diaFilter && d.dia_semana!==diaFilter) return false;
    if (anoFilter && d.ano!==anoFilter) return false;
    return true;
  }),[all,horFilter,diaFilter,anoFilter]);

  // scatter: x=publico, y=no_show_pct
  const scatterData = data.map(d=>({ ...d, x:d.publico, y:d.no_show_pct }));

  // no show by campeonato
  const byCamp = useMemo(()=>{
    const map = {};
    CAMPEONATOS.forEach(c=>{ map[c]={ campeonato:c, no_show:0, fat_noshow:0, n:0 }; });
    data.forEach(d=>{
      if (map[d.campeonato]) {
        map[d.campeonato].no_show   += d.no_show_count;
        map[d.campeonato].fat_noshow+= d.faturamento_noshow;
        map[d.campeonato].n++;
      }
    });
    return Object.values(map).filter(c=>c.n>0).sort((a,b)=>b.no_show-a.no_show);
  },[data]);

  const totalNoShow = data.reduce((s,d)=>s+d.no_show_count,0);
  const totalFatNS  = data.reduce((s,d)=>s+d.faturamento_noshow,0);
  const avgNS       = data.length ? data.reduce((s,d)=>s+d.no_show_pct,0)/data.length : 0;

  // by partida (scatter)
  const byPartidaGroups = CAMPEONATOS.map(c=>({
    campeonato:c,
    data:data.filter(d=>d.campeonato===c).map(d=>({ x:c, y:d.no_show_pct, ...d })),
    fill:CAMP_COLORS[c],
  })).filter(g=>g.data.length>0);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* ── Filters ── */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:'14px 16px', boxShadow:SHADOW.card }}>
        <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
          <div>
            <div style={{ fontSize:9, color:C.t3, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:6 }}>Horário</div>
            <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
              {HORARIOS.map(h=>(
                <button key={h} onClick={()=>setHorFilter(horFilter===h?null:h)} style={{
                  padding:'4px 10px', borderRadius:6, border:`1px solid ${C.border}`,
                  background:horFilter===h?C.accent:C.bgAlt,
                  color:horFilter===h?'#000':C.t2,
                  fontSize:10, fontWeight:600, cursor:'pointer', fontFamily:FONT,
                }}>{h}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize:9, color:C.t3, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:6 }}>Dia da Semana</div>
            <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
              {DIAS.map(d=>(
                <button key={d} onClick={()=>setDiaFilter(diaFilter===d?null:d)} style={{
                  padding:'4px 10px', borderRadius:6, border:`1px solid ${C.border}`,
                  background:diaFilter===d?C.accent:C.bgAlt,
                  color:diaFilter===d?'#000':C.t2,
                  fontSize:10, fontWeight:600, cursor:'pointer', fontFamily:FONT,
                }}>{d}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize:9, color:C.t3, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:6 }}>Ano</div>
            <div style={{ display:'flex', gap:4 }}>
              {[null,2024,2025].map(a=>(
                <button key={a??'todos'} onClick={()=>setAnoFilter(anoFilter===a?null:a)} style={{
                  padding:'4px 10px', borderRadius:6, border:`1px solid ${C.border}`,
                  background:anoFilter===a?C.accent:C.bgAlt,
                  color:anoFilter===a?'#000':C.t2,
                  fontSize:10, fontWeight:600, cursor:'pointer', fontFamily:FONT,
                }}>{a??'Todos'}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:14 }}>

        {/* Scatter: público vs no-show % */}
        <Card title="PÚBLICO vs Percentual NO SHOW por Partida">
          <div style={{ padding:'4px 16px 8px', display:'flex', gap:12 }}>
            {CAMPEONATOS.filter(c=>byPartidaGroups.some(g=>g.campeonato===c)).map(c=>(
              <span key={c} style={{ display:'flex', alignItems:'center', gap:4, fontSize:9, color:C.t2 }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:CAMP_COLORS[c], display:'inline-block' }}/>
                {c}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top:8, right:24, bottom:16, left:16 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3"/>
              <XAxis type="number" dataKey="x" name="Público" tick={{ fill:C.t3, fontSize:9 }} axisLine={false} tickLine={false} tickFormatter={fmtK} label={{ value:'PÚBLICO', position:'insideBottom', fill:C.t3, fontSize:9, offset:-4 }}/>
              <YAxis type="number" dataKey="y" name="No Show %" tick={{ fill:C.t3, fontSize:9 }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v*100).toFixed(0)}%`} label={{ value:'% NO SHOW', angle:-90, position:'insideLeft', fill:C.t3, fontSize:9, dx:-4 }}/>
              <RTooltip content={<DarkTooltip/>}/>
              {byPartidaGroups.map(g=>(
                <Scatter key={g.campeonato} name={g.campeonato} data={g.data} fill={g.fill} opacity={0.8} r={5}/>
              ))}
              <ReferenceLine y={avgNS} stroke={C.t3} strokeDasharray="4 2" label={{ value:`Média ${(avgNS*100).toFixed(0)}%`, fill:C.t3, fontSize:8 }}/>
            </ScatterChart>
          </ResponsiveContainer>
        </Card>

        {/* No show summary table */}
        <Card title="No Show por Campeonato">
          <div style={{ padding:'8px 0 4px' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:10 }}>
              <thead>
                <tr style={{ background:C.bgAlt }}>
                  <th style={{ padding:'7px 12px', textAlign:'left', fontSize:9, fontWeight:700, color:C.t3, textTransform:'uppercase' }}>Campeonato</th>
                  <th style={{ padding:'7px 8px', textAlign:'right', fontSize:9, fontWeight:700, color:C.t3, textTransform:'uppercase' }}>No Show</th>
                  <th style={{ padding:'7px 8px', textAlign:'right', fontSize:9, fontWeight:700, color:C.t3, textTransform:'uppercase' }}>Fat. NS</th>
                  <th style={{ padding:'7px 10px', textAlign:'right', fontSize:9, fontWeight:700, color:C.t3, textTransform:'uppercase' }}>% NS</th>
                </tr>
              </thead>
              <tbody>
                {byCamp.map((r,i)=>{
                  const pct = data.filter(d=>d.campeonato===r.campeonato).reduce((s,d)=>s+d.no_show_pct,0) / (r.n||1);
                  return (
                    <tr key={r.campeonato} style={{ borderBottom:`1px solid ${C.border}`, background:i%2===0?'transparent':C.bgAlt+'44' }}>
                      <td style={{ padding:'6px 12px', fontWeight:500 }}>
                        <span style={{ background:CAMP_COLORS[r.campeonato]+'22', color:CAMP_COLORS[r.campeonato], borderRadius:4, padding:'2px 6px', fontSize:9, fontWeight:700 }}>{r.campeonato}</span>
                      </td>
                      <td style={{ padding:'6px 8px', textAlign:'right', color:C.t1, fontWeight:600, fontVariantNumeric:'tabular-nums' }}>{r.no_show.toLocaleString('pt-BR')}</td>
                      <td style={{ padding:'6px 8px', textAlign:'right', color:C.amber, fontVariantNumeric:'tabular-nums' }}>{fmtM(r.fat_noshow)}</td>
                      <td style={{ padding:'6px 10px', textAlign:'right', color:C.red, fontWeight:700 }}>{(pct*100).toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop:`2px solid ${C.border}`, background:C.bgAlt }}>
                  <td style={{ padding:'7px 12px', fontWeight:700, color:C.t1 }}>Total</td>
                  <td style={{ padding:'7px 8px', textAlign:'right', fontWeight:700, color:C.t1, fontVariantNumeric:'tabular-nums' }}>{totalNoShow.toLocaleString('pt-BR')}</td>
                  <td style={{ padding:'7px 8px', textAlign:'right', fontWeight:700, color:C.amber, fontVariantNumeric:'tabular-nums' }}>{fmtM(totalFatNS)}</td>
                  <td style={{ padding:'7px 10px', textAlign:'right', fontWeight:700, color:C.red }}>{(avgNS*100).toFixed(1)}%</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* KPI cards */}
          <div style={{ display:'flex', gap:8, padding:'12px 12px' }}>
            <div style={{ flex:1, background:C.bgAlt, borderRadius:8, padding:'10px 12px', border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:8, color:C.t3, textTransform:'uppercase', marginBottom:4 }}>Total No Show</div>
              <div style={{ fontSize:18, fontWeight:800, color:C.red }}>{totalNoShow.toLocaleString('pt-BR')}</div>
            </div>
            <div style={{ flex:1, background:C.bgAlt, borderRadius:8, padding:'10px 12px', border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:8, color:C.t3, textTransform:'uppercase', marginBottom:4 }}>Média %</div>
              <div style={{ fontSize:18, fontWeight:800, color:C.amber }}>{(avgNS*100).toFixed(1)}%</div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── % NO SHOW por campeonato — bar ── */}
      <Card title="Percentual NO SHOW por Campeonato">
        <div style={{ display:'flex', gap:16, padding:'0 16px 8px', flexWrap:'wrap' }}>
          {CAMPEONATOS.map(c=>({campeonato:c, pct:data.filter(d=>d.campeonato===c).reduce((s,d)=>s+d.no_show_pct,0)/(data.filter(d=>d.campeonato===c).length||1)}))
            .filter(c=>data.some(d=>d.campeonato===c.campeonato))
            .sort((a,b)=>b.pct-a.pct)
            .map((c,i)=>(
            <div key={c.campeonato} style={{ flex:1, minWidth:120, background:C.bgAlt, borderRadius:8, padding:'12px 14px', border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:9, color:CAMP_COLORS[c.campeonato], fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>{c.campeonato}</div>
              <div style={{ fontSize:22, fontWeight:800, color:C.red }}>{(c.pct*100).toFixed(1)}%</div>
              <div style={{ marginTop:6, background:C.border, borderRadius:3, height:4, overflow:'hidden' }}>
                <div style={{ width:`${Math.min(c.pct*500,100)}%`, height:'100%', background:C.red, borderRadius:3 }}/>
              </div>
              <div style={{ fontSize:8, color:C.t3, marginTop:4 }}>{data.filter(d=>d.campeonato===c.campeonato).length} jogos</div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
