import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import { C, FONT, SHADOW, CAMP_COLORS } from '../tokens';
import {
  PARTIDAS, CAMPEONATOS, faturamentoPorCampeonatoAno, kpiSummary, filtrarPartidas,
} from '../data/mock';

const fmtM = v => {
  if (!v) return '0';
  if (v>=1_000_000) return `${(v/1_000_000).toFixed(1).replace('.',',')} Mi`;
  return `${(v/1_000).toFixed(0)} Mil`;
};
const fmtK = v => v>=1000 ? `${(v/1000).toFixed(0)} Mil` : `${v}`;

function Card({ children, title, subtitle, style={} }) {
  return (
    <div style={{ background:C.card, borderRadius:10, border:`1px solid ${C.border}`, boxShadow:SHADOW.card, ...style }}>
      {(title||subtitle) && (
        <div style={{ padding:'12px 16px 0' }}>
          {title && <div style={{ fontSize:11, fontWeight:700, color:C.t1, marginBottom:2 }}>{title}</div>}
          {subtitle && <div style={{ fontSize:9, color:C.t3 }}>{subtitle}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#1e1e2e', border:`1px solid ${C.border}`, borderRadius:8, padding:'10px 14px', fontSize:11, boxShadow:SHADOW.md }}>
      <p style={{ fontWeight:700, color:C.t1, marginBottom:4 }}>{label}</p>
      {payload.map((p,i)=>(
        <p key={i} style={{ color:p.fill||C.t2, margin:'2px 0' }}>
          <span style={{ color:C.t3 }}>{p.name}: </span>
          <span style={{ fontWeight:600 }}>{fmtM(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

// Builds chart data with 2024/2025 side-by-side
function buildComparativoData(allData, valueKey, filterFn = null) {
  const data = filterFn ? allData.filter(filterFn) : allData;
  const camps = CAMPEONATOS.filter(c => data.some(d=>d.campeonato===c));
  return camps.map(camp => {
    const d24 = data.find(d=>d.campeonato===camp&&d.ano===2024);
    const d25 = data.find(d=>d.campeonato===camp&&d.ano===2025);
    return { campeonato:camp, '2024':d24?.[valueKey]??0, '2025':d25?.[valueKey]??0 };
  });
}

export default function Comparativo() {
  const [roundFilter, setRoundFilter] = useState(null); // 1–12
  const [campFilter,  setCampFilter]  = useState(null);

  const allCampAno = useMemo(() => faturamentoPorCampeonatoAno(), []);

  const fatData     = useMemo(()=>buildComparativoData(allCampAno,'faturamento'), [allCampAno]);
  const fatMedData  = useMemo(()=>buildComparativoData(allCampAno,'fat_medio'), [allCampAno]);
  const tktData     = useMemo(()=>buildComparativoData(allCampAno,'ticket_medio'), [allCampAno]);
  const pubData     = useMemo(()=>buildComparativoData(allCampAno,'media_publico'), [allCampAno]);

  // Total faturamento by year
  const fat2024 = PARTIDAS.filter(p=>p.ano===2024).reduce((s,p)=>s+p.faturamento,0);
  const fat2025 = PARTIDAS.filter(p=>p.ano===2025).reduce((s,p)=>s+p.faturamento,0);

  // Jogos count table
  const jogosTable = useMemo(() => {
    return CAMPEONATOS.map(c => {
      const n24 = PARTIDAS.filter(p=>p.campeonato===c&&p.ano===2024).length;
      const n25 = PARTIDAS.filter(p=>p.campeonato===c&&p.ano===2025).length;
      return { campeonato:c, '2024':n24||'', '2025':n25||'', total:n24+n25 };
    }).filter(r=>r.total>0);
  }, []);
  const totalJogos = { campeonato:'Total', '2024':PARTIDAS.filter(p=>p.ano===2024).length, '2025':PARTIDAS.filter(p=>p.ano===2025).length, total:PARTIDAS.length };

  // Detailed table
  const detalhes = useMemo(() => {
    let ps = [...PARTIDAS];
    if (campFilter) ps = ps.filter(p=>p.campeonato===campFilter);
    return ps.sort((a,b)=> new Date(b.data.split('/').reverse().join('-')) - new Date(a.data.split('/').reverse().join('-')));
  }, [campFilter]);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* ── Filter row ── */}
      <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
        {/* Round buttons */}
        <div style={{ display:'flex', gap:4 }}>
          {Array.from({length:12},(_,i)=>i+1).map(n=>(
            <button key={n} onClick={()=>setRoundFilter(roundFilter===n?null:n)} style={{
              width:28, height:28, borderRadius:6, border:`1px solid ${C.border}`,
              background:roundFilter===n?C.accent:C.card,
              color:roundFilter===n?'#000':C.t2, fontSize:10, fontWeight:700, cursor:'pointer',fontFamily:FONT,
            }}>{n}</button>
          ))}
        </div>
        <div style={{ width:1, height:24, background:C.border }}/>
        {/* Campeonato buttons */}
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
          {['Todos',...CAMPEONATOS].map(c=>(
            <button key={c} onClick={()=>setCampFilter(c==='Todos'?null:c)} style={{
              padding:'4px 12px', borderRadius:6, border:`1px solid ${C.border}`,
              background:(campFilter===c||(c==='Todos'&&!campFilter))?C.accent:C.card,
              color:(campFilter===c||(c==='Todos'&&!campFilter))?'#000':C.t2,
              fontSize:10, fontWeight:600, cursor:'pointer', fontFamily:FONT,
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* ── Charts grid ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>

        {/* Faturamento by camp+ano */}
        <Card title="Faturamento por Campeonato e Ano" subtitle="Ano ● 2024 ● 2025" style={{ gridColumn:'1/2' }}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={fatData} layout="vertical" margin={{ top:8, right:24, bottom:4, left:80 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" horizontal={false}/>
              <XAxis type="number" tick={{ fill:C.t3, fontSize:8 }} axisLine={false} tickLine={false} tickFormatter={fmtM}/>
              <YAxis type="category" dataKey="campeonato" tick={{ fill:C.t2, fontSize:9 }} axisLine={false} tickLine={false} width={80}/>
              <RTooltip content={<DarkTooltip/>}/>
              <Bar dataKey="2024" name="2024" fill="#555566" radius={[0,3,3,0]} barSize={9}><LabelList dataKey="2024" position="right" formatter={fmtM} style={{ fontSize:7, fill:C.t3 }}/></Bar>
              <Bar dataKey="2025" name="2025" fill={C.accent} radius={[0,3,3,0]} barSize={9}><LabelList dataKey="2025" position="right" formatter={fmtM} style={{ fontSize:7, fill:C.accent }}/></Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Faturamento médio */}
        <Card title="Faturamento Médio por Campeonato e Ano" subtitle="Ano ● 2024 ● 2025">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={fatMedData} margin={{ top:8, right:16, bottom:32, left:8 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="campeonato" tick={{ fill:C.t3, fontSize:8 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={50} interval={0}/>
              <YAxis tick={{ fill:C.t3, fontSize:8 }} axisLine={false} tickLine={false} tickFormatter={fmtM}/>
              <RTooltip content={<DarkTooltip/>}/>
              <Bar dataKey="2024" name="2024" fill="#555566" barSize={14} radius={[3,3,0,0]}><LabelList dataKey="2024" position="top" formatter={fmtM} style={{ fontSize:7, fill:C.t3 }}/></Bar>
              <Bar dataKey="2025" name="2025" fill={C.accent} barSize={14} radius={[3,3,0,0]}><LabelList dataKey="2025" position="top" formatter={fmtM} style={{ fontSize:7, fill:C.accent }}/></Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Faturamento médio por ANO */}
        <Card title="Faturamento Médio por ANO">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[{ ano:'2024', valor:fat2024 },{ ano:'2025', valor:fat2025 }]} margin={{ top:8, right:16, bottom:8, left:8 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="ano" tick={{ fill:C.t2, fontSize:11, fontWeight:700 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:C.t3, fontSize:8 }} axisLine={false} tickLine={false} tickFormatter={fmtM}/>
              <RTooltip content={<DarkTooltip/>}/>
              <Bar dataKey="valor" name="Faturamento" radius={[4,4,0,0]} barSize={60}>
                <LabelList dataKey="valor" position="top" formatter={fmtM} style={{ fontSize:9, fontWeight:700, fill:C.t1 }}/>
                <Cell fill="#444455"/>
                <Cell fill={C.accent}/>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Ticket Médio */}
        <Card title="Ticket Médio por Campeonato e Ano" subtitle="Ano ● 2024 ● 2025">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tktData} margin={{ top:8, right:16, bottom:32, left:8 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="campeonato" tick={{ fill:C.t3, fontSize:8 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={50} interval={0}/>
              <YAxis tick={{ fill:C.t3, fontSize:8 }} axisLine={false} tickLine={false}/>
              <RTooltip content={<DarkTooltip/>}/>
              <Bar dataKey="2024" name="2024" fill="#555566" barSize={14} radius={[3,3,0,0]}><LabelList dataKey="2024" position="top" style={{ fontSize:7, fill:C.t3 }}/></Bar>
              <Bar dataKey="2025" name="2025" fill={C.accent} barSize={14} radius={[3,3,0,0]}><LabelList dataKey="2025" position="top" style={{ fontSize:7, fill:C.accent }}/></Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Média de Público */}
        <Card title="Média de Público por Campeonato e Ano" subtitle="Ano ● 2024 ● 2025">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pubData} margin={{ top:8, right:16, bottom:32, left:8 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="campeonato" tick={{ fill:C.t3, fontSize:8 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={50} interval={0}/>
              <YAxis tick={{ fill:C.t3, fontSize:8 }} axisLine={false} tickLine={false} tickFormatter={fmtK}/>
              <RTooltip content={<DarkTooltip/>}/>
              <Bar dataKey="2024" name="2024" fill="#555566" barSize={14} radius={[3,3,0,0]}><LabelList dataKey="2024" position="top" formatter={fmtK} style={{ fontSize:7, fill:C.t3 }}/></Bar>
              <Bar dataKey="2025" name="2025" fill={C.accent} barSize={14} radius={[3,3,0,0]}><LabelList dataKey="2025" position="top" formatter={fmtK} style={{ fontSize:7, fill:C.accent }}/></Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Jogos count table */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, overflow:'hidden', boxShadow:SHADOW.card }}>
          <div style={{ padding:'12px 16px 0', fontSize:11, fontWeight:700, color:C.t1, marginBottom:8 }}>Nº de Jogos</div>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
            <thead>
              <tr style={{ background:C.bgAlt }}>
                <th style={{ padding:'6px 12px', textAlign:'left', fontSize:9, fontWeight:700, color:C.t3, textTransform:'uppercase' }}>Campeonato</th>
                <th style={{ padding:'6px 8px', textAlign:'center', fontSize:9, fontWeight:700, color:'#555566' }}>2024</th>
                <th style={{ padding:'6px 8px', textAlign:'center', fontSize:9, fontWeight:700, color:C.accent }}>2025</th>
                <th style={{ padding:'6px 8px', textAlign:'center', fontSize:9, fontWeight:700, color:C.t2 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {jogosTable.map((r,i)=>(
                <tr key={r.campeonato} style={{ borderBottom:`1px solid ${C.border}`, background:i%2===0?'transparent':C.bgAlt+'44' }}>
                  <td style={{ padding:'6px 12px', color:C.t1, fontSize:10 }}>{r.campeonato}</td>
                  <td style={{ padding:'6px 8px', textAlign:'center', color:'#8888aa', fontWeight:600 }}>{r['2024']||'—'}</td>
                  <td style={{ padding:'6px 8px', textAlign:'center', color:C.accent, fontWeight:600 }}>{r['2025']||'—'}</td>
                  <td style={{ padding:'6px 8px', textAlign:'center', color:C.t1, fontWeight:700 }}>{r.total}</td>
                </tr>
              ))}
              <tr style={{ borderTop:`2px solid ${C.border}`, background:C.bgAlt }}>
                <td style={{ padding:'6px 12px', fontWeight:700, color:C.t1, fontSize:10 }}>Total</td>
                <td style={{ padding:'6px 8px', textAlign:'center', color:'#8888aa', fontWeight:700 }}>{totalJogos['2024']}</td>
                <td style={{ padding:'6px 8px', textAlign:'center', color:C.accent, fontWeight:700 }}>{totalJogos['2025']}</td>
                <td style={{ padding:'6px 8px', textAlign:'center', color:C.t1, fontWeight:800 }}>{totalJogos.total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detailed table ── */}
      <Card title="Detalhe das Partidas">
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:10 }}>
            <thead>
              <tr style={{ background:C.bgAlt, position:'sticky', top:0 }}>
                {['Time','Campeonato','Data','Público','Faturamento','Ticket Médio','Sócios'].map(h=>(
                  <th key={h} style={{ padding:'8px 12px', textAlign:h==='Público'||h==='Faturamento'||h==='Ticket Médio'||h==='Sócios'?'right':'left', fontSize:9, fontWeight:700, color:C.t3, textTransform:'uppercase', letterSpacing:'0.5px', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detalhes.map((p,i)=>(
                <tr key={p.id} style={{ borderBottom:`1px solid ${C.border}`, background:i%2===0?'transparent':C.bgAlt+'44' }}>
                  <td style={{ padding:'6px 12px', color:C.t1, fontWeight:500 }}>{p.adversario}</td>
                  <td style={{ padding:'6px 12px' }}>
                    <span style={{ background:CAMP_COLORS[p.campeonato]+'22', color:CAMP_COLORS[p.campeonato], borderRadius:4, padding:'2px 6px', fontSize:9, fontWeight:700 }}>{p.campeonato}</span>
                  </td>
                  <td style={{ padding:'6px 12px', color:C.t2 }}>{p.data}</td>
                  <td style={{ padding:'6px 12px', textAlign:'right', color:C.t1, fontVariantNumeric:'tabular-nums' }}>{p.publico.toLocaleString('pt-BR')}</td>
                  <td style={{ padding:'6px 12px', textAlign:'right', color:C.accent, fontWeight:600, fontVariantNumeric:'tabular-nums' }}>R$ {p.faturamento.toLocaleString('pt-BR')}</td>
                  <td style={{ padding:'6px 12px', textAlign:'right', color:C.t1, fontVariantNumeric:'tabular-nums' }}>{p.ticket_medio.toFixed(2).replace('.',',')}</td>
                  <td style={{ padding:'6px 12px', textAlign:'right', color:C.t2, fontVariantNumeric:'tabular-nums' }}>{(p.socios_pct*100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
