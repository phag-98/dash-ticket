import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, Treemap,
} from 'recharts';
import { C, FONT, SHADOW, SETOR_COLORS, CAMP_COLORS } from '../tokens';
import {
  CAMPEONATOS, SETORES, filtrarPartidas,
  setorSummary, unitarioPorTimeSetor, faturamentoPorMes, faturamentoPorAdversario,
} from '../data/mock';

const fmtM = v => {
  if (!v&&v!==0) return '—';
  if (v>=1_000_000) return `R$ ${(v/1_000_000).toFixed(1).replace('.',',')} Mi`;
  if (v>=1_000) return `R$ ${(v/1_000).toFixed(0)} Mil`;
  return `R$ ${v}`;
};

function Card({ children, title, style={} }) {
  return (
    <div style={{ background:C.card, borderRadius:10, border:`1px solid ${C.border}`, boxShadow:SHADOW.card, ...style }}>
      {title&&<div style={{ padding:'12px 16px 0', fontSize:11, fontWeight:700, color:C.t1 }}>{title}</div>}
      {children}
    </div>
  );
}

const DarkTooltip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{ background:'#1e1e2e', border:`1px solid ${C.border}`, borderRadius:8, padding:'10px 14px', fontSize:11, boxShadow:SHADOW.md }}>
      <p style={{ fontWeight:700, color:C.t1, marginBottom:4 }}>{label}</p>
      {payload.filter(p=>p.value!=null).map((p,i)=>(
        <p key={i} style={{ color:p.stroke||C.t2, margin:'2px 0' }}>
          <span style={{ color:C.t3 }}>{p.name}: </span>
          <span style={{ fontWeight:600 }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// Treemap custom content
const TreeContent = ({ x, y, width, height, name, value, depth }) => {
  if (!width||!height||width<20||height<20) return null;
  const colors = ['#C8F400','#a0c000','#7a9600','#556b00','#ff6b35','#cc5522','#6699cc','#4477aa','#88aadd'];
  const idx = ['Palmeiras','Flamengo','Vasco da Gama','Corinthians','Criciúma','Peñarol','São Paulo','Racing','Atlético-MG','Fluminense'].indexOf(name)%colors.length;
  const fill = depth===1 ? (colors[idx]||'#333') : 'transparent';
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} stroke={C.border} strokeWidth={1} rx={2}/>
      {width>50&&height>30&&(
        <>
          <text x={x+6} y={y+14} fill="#000" fontSize={9} fontWeight={700}>{name}</text>
          <text x={x+6} y={y+26} fill="#00000099" fontSize={8}>{fmtM(value)}</text>
        </>
      )}
    </g>
  );
};

export default function Setores() {
  const [ano,       setAno]  = useState('Todos');
  const [campeonato,setCamp] = useState('Todos');

  const partidas = useMemo(()=>filtrarPartidas({campeonato,ano}),[campeonato,ano]);
  const setor    = useMemo(()=>setorSummary(partidas),[partidas]);
  const unitario = useMemo(()=>unitarioPorTimeSetor(partidas),[partidas]);
  const mesData  = useMemo(()=>faturamentoPorMes(partidas),[partidas]);
  const advData  = useMemo(()=>faturamentoPorAdversario(partidas).slice(0,20),[partidas]);

  const treemapData = { name:'root', children: advData.map(a=>({ name:a.adversario, value:a.faturamento })) };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* ── Filters ── */}
      <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
        {/* Year */}
        {['Todos','2024','2025'].map(y=>(
          <button key={y} onClick={()=>setAno(y)} style={{
            padding:'5px 14px', borderRadius:6, border:`1px solid ${C.border}`,
            background:ano===y?C.accent:C.card, color:ano===y?'#000':C.t2,
            fontSize:10, fontWeight:600, cursor:'pointer', fontFamily:FONT,
          }}>{y}</button>
        ))}
        <div style={{ width:1, height:24, background:C.border }}/>
        {/* Campeonato */}
        {['Todos',...CAMPEONATOS].map(c=>(
          <button key={c} onClick={()=>setCamp(c==='Todos'?'Todos':c)} style={{
            padding:'5px 12px', borderRadius:6, border:`1px solid ${C.border}`,
            background:(campeonato===c||(c==='Todos'&&campeonato==='Todos'))?CAMP_COLORS[c]||C.accent:C.card,
            color:(campeonato===c||(c==='Todos'&&campeonato==='Todos'))?'#000':C.t2,
            fontSize:10, fontWeight:600, cursor:'pointer', fontFamily:FONT,
          }}>{c}</button>
        ))}
      </div>

      {/* ── Setor table + charts row ── */}
      <div style={{ display:'grid', gridTemplateColumns:'420px 1fr', gap:14 }}>

        {/* Setor summary table */}
        <Card title="Resumo por Setor">
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:10 }}>
              <thead>
                <tr style={{ background:C.bgAlt }}>
                  {['ID','Setor','Faturamento','Público','TM','Méd. Público','% Ocup.'].map(h=>(
                    <th key={h} style={{ padding:'7px 10px', textAlign:'right', fontSize:8, fontWeight:700, color:C.t3, textTransform:'uppercase', letterSpacing:'0.4px', whiteSpace:'nowrap', textAlign:h==='Setor'||h==='ID'?'left':'right' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {setor.map((s,i)=>(
                  <tr key={s.id_setor} style={{ borderBottom:`1px solid ${C.border}`, background:i%2===0?'transparent':C.bgAlt+'44' }}>
                    <td style={{ padding:'6px 10px', color:C.t3, fontSize:9, fontFamily:'monospace' }}>{s.id_setor}</td>
                    <td style={{ padding:'6px 10px', color:C.t1, fontWeight:500 }}>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}>
                        <span style={{ width:8, height:8, borderRadius:2, background:SETOR_COLORS[s.setor], flexShrink:0, display:'inline-block' }}/>
                        {s.setor}
                      </span>
                    </td>
                    <td style={{ padding:'6px 10px', textAlign:'right', color:C.accent, fontWeight:600, fontVariantNumeric:'tabular-nums' }}>R$ {Math.round(s.faturamento).toLocaleString('pt-BR')}</td>
                    <td style={{ padding:'6px 10px', textAlign:'right', color:C.t1, fontVariantNumeric:'tabular-nums' }}>{s.publico.toLocaleString('pt-BR')}</td>
                    <td style={{ padding:'6px 10px', textAlign:'right', color:C.t2, fontVariantNumeric:'tabular-nums' }}>{s.ticket_medio.toFixed(2)}</td>
                    <td style={{ padding:'6px 10px', textAlign:'right', color:C.t2, fontVariantNumeric:'tabular-nums' }}>{s.media_publico.toFixed(0)}</td>
                    <td style={{ padding:'6px 10px', textAlign:'right', fontVariantNumeric:'tabular-nums' }}>
                      <span style={{ color: s.occ_pct>=70?C.green:s.occ_pct>=50?C.amber:C.red, fontWeight:700 }}>{s.occ_pct.toFixed(1)}%</span>
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop:`2px solid ${C.border}`, background:C.bgAlt }}>
                  <td colSpan={2} style={{ padding:'6px 10px', fontWeight:700, color:C.t1 }}>Total</td>
                  <td style={{ padding:'6px 10px', textAlign:'right', color:C.accent, fontWeight:800, fontVariantNumeric:'tabular-nums' }}>R$ {setor.reduce((s,x)=>s+x.faturamento,0).toLocaleString('pt-BR',{maximumFractionDigits:0})}</td>
                  <td style={{ padding:'6px 10px', textAlign:'right', color:C.t1, fontWeight:700, fontVariantNumeric:'tabular-nums' }}>{setor.reduce((s,x)=>s+x.publico,0).toLocaleString('pt-BR')}</td>
                  <td colSpan={3}/>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right: faturamento por mês + treemap */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Faturamento por mês */}
          <Card title="Soma de FATURAMENTO por Mês">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={mesData} margin={{ top:12, right:16, bottom:8, left:10 }}>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="mes" tick={{ fill:C.t3, fontSize:9 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:C.t3, fontSize:9 }} axisLine={false} tickLine={false} tickFormatter={v=>`R$${(v/1_000_000).toFixed(1)}M`}/>
                <RTooltip content={<DarkTooltip/>}/>
                <Line type="monotone" dataKey="faturamento" name="Faturamento" stroke={C.accent} strokeWidth={2.5} dot={{ fill:C.accent, r:3 }}
                  label={{ position:'top', fontSize:8, fill:C.t2, formatter:v=>`R$${(v/1_000_000).toFixed(1)}M` }}/>
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Faturamento por adversário — treemap */}
          <Card title="Faturamento por Adversário">
            <ResponsiveContainer width="100%" height={220}>
              <Treemap data={treemapData.children} dataKey="value" aspectRatio={4/3} content={<TreeContent/>}>
                <RTooltip content={({ active, payload }) => {
                  if (!active||!payload?.length) return null;
                  const d = payload[0]?.payload;
                  return (
                    <div style={{ background:'#1e1e2e', border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 12px', fontSize:11 }}>
                      <p style={{ fontWeight:700, color:C.t1 }}>{d.name}</p>
                      <p style={{ color:C.accent }}>{fmtM(d.value)}</p>
                    </div>
                  );
                }}/>
              </Treemap>
            </ResponsiveContainer>
          </Card>

        </div>
      </div>

      {/* ── Unitário por time e setor ── */}
      <Card title="Soma de UNITÁRIO por TIME e SETOR">
        <div style={{ padding:'0 0 4px', display:'flex', gap:10, flexWrap:'wrap', padding:'8px 16px 0' }}>
          {SETORES.map(s=>(
            <span key={s.id} style={{ display:'flex', alignItems:'center', gap:4, fontSize:9, color:C.t2 }}>
              <span style={{ width:16, height:2, background:SETOR_COLORS[s.nome], display:'inline-block' }}/>
              {s.nome}
            </span>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={unitario} margin={{ top:8, right:16, bottom:64, left:10 }}>
            <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false}/>
            <XAxis dataKey="adversario" tick={{ fill:C.t3, fontSize:8 }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={70} interval={0}/>
            <YAxis tick={{ fill:C.t3, fontSize:9 }} axisLine={false} tickLine={false}/>
            <RTooltip content={<DarkTooltip/>}/>
            {SETORES.map(s=>(
              <Line key={s.id} type="monotone" dataKey={s.nome} stroke={SETOR_COLORS[s.nome]} strokeWidth={1.5} dot={{ r:2, fill:SETOR_COLORS[s.nome] }} connectNulls/>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>

    </div>
  );
}
