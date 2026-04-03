import { useState, useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, BarChart, Bar,
  ReferenceLine, Cell, LabelList,
} from 'recharts';
import { C, FONT_UI, SHADOW, CAMP_COLORS } from '../tokens';
import { COMP_LOGOS } from '../teamLogos.jsx';
import { plPorPartida, faturamentoPorPartida } from '../data/data';

// ── Formatters ────────────────────────────────────────────────────────────────
const fmtM   = v => v >= 1e6 ? `${(v / 1e6).toFixed(1).replace('.', ',')} Mi` : `${(v / 1000).toFixed(0)} K`;
const fmtK   = v => v >= 1000 ? `${Math.round(v / 1000)} K` : String(Math.round(v));
const fmtR   = v => `R$ ${v.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
const fmtPct = v => `${v.toFixed(1).replace('.', ',')}%`;
const fmtBRL = v => {
  const abs = Math.abs(v);
  const s = abs.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return v < 0 ? `-R$ ${s}` : `R$ ${s}`;
};

// ── Static lists ──────────────────────────────────────────────────────────────
const FAT_MAP    = Object.fromEntries(faturamentoPorPartida.map(d => [d.idPartida, d.utilizados || 0]));
const CAMP_NAMES = [...new Set(plPorPartida.map(d => d.campeonato).filter(Boolean))].sort();
const YEARS      = [...new Set(plPorPartida.map(d => d.ano).filter(Boolean))].sort();

// ── Filter button ─────────────────────────────────────────────────────────────
function FilterBtn({ label, active, onClick, color, logo }) {
  return (
    <button onClick={onClick} style={{
      padding: '4px 12px', borderRadius: 20,
      border: `1px solid ${active ? (color || C.accent) : C.border}`,
      background: active ? (color || C.accent) : C.card,
      color: active ? '#000' : C.t2,
      fontSize: 10, fontWeight: active ? 700 : 500,
      cursor: 'pointer', letterSpacing: '0.5px', whiteSpace: 'nowrap',
      fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5,
    }}>
      {logo && <img src={`/logos/${logo}`} style={{ width: 15, height: 15, objectFit: 'contain' }} />}
      {label}
    </button>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
function Card({ title, subtitle, children, style }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
      boxShadow: SHADOW.card, padding: '14px 16px 12px', ...style,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.t2, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 2 }}>
        {title}
      </div>
      {subtitle && <div style={{ fontSize: 9, color: C.t3, marginBottom: 10 }}>{subtitle}</div>}
      {children}
    </div>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────
function Legend({ groups }) {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
      {groups.map(g => (
        <span key={g.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: C.t3 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: g.color, display: 'inline-block' }} />
          {g.label}
        </span>
      ))}
    </div>
  );
}

// ── Custom Y-axis tick with campeonato badge ──────────────────────────────────
function CampTick({ x, y, payload }) {
  const name = payload?.value;
  const color = CAMP_COLORS[name] || '#aaa';
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={-6} y={0} dy={4} textAnchor="end" fill={color} fontSize={9} fontWeight={700}>
        {name}
      </text>
    </g>
  );
}

// ── Tooltips ──────────────────────────────────────────────────────────────────
function ScatterTip3({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 12px', fontSize: 10, fontFamily: FONT_UI, minWidth: 170, boxShadow: SHADOW.card }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: C.t1, borderBottom: `1px solid ${C.border}`, paddingBottom: 4 }}>
        {d.time} <span style={{ color: CAMP_COLORS[d.campeonato] || C.t3, fontWeight: 600 }}>· {d.campeonato}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Row label="Público"  value={d.publico?.toLocaleString('pt-BR')} color={C.t1} />
        <Row label="Receita"  value={fmtBRL(d.receita)}  color="#3a9a5c" />
        <Row label="Despesa"  value={fmtBRL(d.despesa)}  color="#c0392b" />
        <Row label="Resultado" value={fmtBRL(d.resultado)} color={d.resultado >= 0 ? '#3a9a5c' : '#c0392b'} />
      </div>
    </div>
  );
}

function ScatterTip2({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 12px', fontSize: 10, fontFamily: FONT_UI, minWidth: 160, boxShadow: SHADOW.card }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: C.t1, borderBottom: `1px solid ${C.border}`, paddingBottom: 4 }}>
        {d.time} <span style={{ color: CAMP_COLORS[d.campeonato] || C.t3 }}>· {d.campeonato}</span>
      </div>
      <Row label="Público"   value={d.publico?.toLocaleString('pt-BR')}              color={C.t1} />
      <Row label="Resultado" value={fmtBRL(d.resultado)}                              color={d.resultado >= 0 ? '#3a9a5c' : '#c0392b'} />
      <Row label="Margem"    value={fmtPct(d.margem)}                                 color={C.t2} />
    </div>
  );
}

function BarTip({ active, payload, label, fmt }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 12px', fontSize: 10, fontFamily: FONT_UI, boxShadow: SHADOW.card }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: CAMP_COLORS[label] || C.t1 }}>{label}</div>
      {payload.map(p => (
        <Row key={p.dataKey} label={p.name} value={(fmt || String)(p.value)} color={p.fill || C.t2} />
      ))}
    </div>
  );
}

function Row({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 2 }}>
      <span style={{ color: C.t3 }}>{label}</span>
      <span style={{ fontWeight: 600, color }}>{value}</span>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Eficiencia() {
  const [campFilter, setCampFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');

  // Per-match data
  const matches = useMemo(() => {
    return plPorPartida
      .filter(d =>
        (campFilter === 'ALL' || d.campeonato === campFilter) &&
        (yearFilter === 'ALL' || d.ano === Number(yearFilter))
      )
      .map(d => {
        const publico   = FAT_MAP[d.idPartida] || 0;
        const receita   = d.totalRevenues || 0;
        const despesa   = Math.abs((d.totalOperatingExpenses || 0) + (d.totalLogistics || 0) + (d.totalFederations || 0));
        const resultado = d.total || 0;
        const margem    = receita > 0 ? (resultado / receita) * 100 : 0;
        const receitaPorTorcedor = publico > 0 ? receita / publico : 0;
        const custoPorTorcedor   = publico > 0 ? despesa / publico : 0;
        return { ...d, publico, receita, despesa, resultado, margem, receitaPorTorcedor, custoPorTorcedor };
      });
  }, [campFilter, yearFilter]);

  // Aggregated by campeonato (for bar charts)
  const byCamp = useMemo(() => {
    const map = {};
    matches.forEach(d => {
      if (!map[d.campeonato]) map[d.campeonato] = { campeonato: d.campeonato, n: 0, receita: 0, despesa: 0, resultado: 0, publico: 0, margem: [] };
      const m = map[d.campeonato];
      m.n++;
      m.receita   += d.receita;
      m.despesa   += d.despesa;
      m.resultado += d.resultado;
      m.publico   += d.publico;
      m.margem.push(d.margem);
    });
    return Object.values(map).map(m => ({
      campeonato: m.campeonato,
      color: CAMP_COLORS[m.campeonato] || '#aaa',
      n: m.n,
      receitaMedia:        m.n > 0 ? m.receita / m.n : 0,
      despesaMedia:        m.n > 0 ? m.despesa / m.n : 0,
      resultadoMedio:      m.n > 0 ? m.resultado / m.n : 0,
      publicoMedio:        m.n > 0 ? Math.round(m.publico / m.n) : 0,
      margemMedia:         m.margem.reduce((s, v) => s + v, 0) / m.margem.length,
      receitaPorTorcedor:  m.publico > 0 ? m.receita / m.publico : 0,
      custoPorTorcedor:    m.publico > 0 ? m.despesa / m.publico : 0,
    })).sort((a, b) => b.receitaMedia - a.receitaMedia);
  }, [matches]);

  // Scatter groups by campeonato
  const scatterGroups = useMemo(() => {
    const map = {};
    matches.forEach(d => {
      if (!map[d.campeonato]) map[d.campeonato] = { campeonato: d.campeonato, fill: CAMP_COLORS[d.campeonato] || '#aaa', data: [] };
      map[d.campeonato].data.push(d);
    });
    return Object.values(map);
  }, [matches]);

  const campLegend = scatterGroups.map(g => ({ label: g.campeonato, color: g.fill }));

  return (
    <div style={{ fontFamily: FONT_UI, color: C.t1, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Filters ── */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
        boxShadow: SHADOW.card, padding: '10px 16px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <FilterBtn label="All" active={campFilter === 'ALL'} onClick={() => setCampFilter('ALL')} color={C.accent} />
          {CAMP_NAMES.map(c => (
            <FilterBtn key={c} label={c} active={campFilter === c} onClick={() => setCampFilter(c)}
              color={CAMP_COLORS[c]} logo={COMP_LOGOS[c]} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 9, color: C.t3, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginRight: 2 }}>Ano</span>
          <FilterBtn label="Todos" active={yearFilter === 'ALL'} onClick={() => setYearFilter('ALL')} color={C.accent} />
          {YEARS.map(y => (
            <FilterBtn key={y} label={String(y)} active={yearFilter === String(y)} onClick={() => setYearFilter(String(y))} color={C.accent} />
          ))}
        </div>
      </div>

      {/* ── Row 1: Scatter 3 variáveis (full width) ── */}
      <Card
        title="Público · Receita · Despesa"
        subtitle="Cada ponto = 1 jogo  ·  Eixo X = público  ·  Eixo Y = receita  ·  Tamanho = despesa total"
      >
        <Legend groups={campLegend} />
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 8, right: 24, bottom: 28, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis
              dataKey="publico" type="number" name="Público"
              tick={{ fontSize: 9, fill: C.t3 }} tickFormatter={fmtK} axisLine={false} tickLine={false}
              label={{ value: 'PÚBLICO', position: 'insideBottom', offset: -14, fontSize: 9, fill: C.t3, letterSpacing: '1px' }}
            />
            <YAxis
              dataKey="receita" type="number" name="Receita"
              tick={{ fontSize: 9, fill: C.t3 }} tickFormatter={fmtM} width={52} axisLine={false} tickLine={false}
              label={{ value: 'RECEITA', angle: -90, position: 'insideLeft', offset: 14, fontSize: 9, fill: C.t3, letterSpacing: '1px' }}
            />
            <ZAxis dataKey="despesa" range={[40, 400]} name="Despesa" />
            <RTooltip content={<ScatterTip3 />} cursor={{ strokeDasharray: '4 2' }} />
            {scatterGroups.map(g => (
              <Scatter key={g.campeonato} name={g.campeonato} data={g.data} fill={g.fill} opacity={0.72} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Row 2: Resultado vs Público + Margem por campeonato ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Scatter: Resultado vs Público */}
        <Card
          title="Resultado vs Público"
          subtitle="Cada ponto = 1 jogo  ·  Acima de zero = lucro"
        >
          <Legend groups={campLegend} />
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 8, right: 16, bottom: 28, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis
                dataKey="publico" type="number" name="Público"
                tick={{ fontSize: 9, fill: C.t3 }} tickFormatter={fmtK} axisLine={false} tickLine={false}
                label={{ value: 'PÚBLICO', position: 'insideBottom', offset: -14, fontSize: 9, fill: C.t3, letterSpacing: '1px' }}
              />
              <YAxis
                dataKey="resultado" type="number" name="Resultado"
                tick={{ fontSize: 9, fill: C.t3 }} tickFormatter={fmtM} width={52} axisLine={false} tickLine={false}
                label={{ value: 'RESULTADO', angle: -90, position: 'insideLeft', offset: 14, fontSize: 9, fill: C.t3, letterSpacing: '1px' }}
              />
              <ZAxis range={[28, 28]} />
              <ReferenceLine y={0} stroke="#bbb" strokeDasharray="5 3" />
              <RTooltip content={<ScatterTip2 />} cursor={{ strokeDasharray: '4 2' }} />
              {scatterGroups.map(g => (
                <Scatter key={g.campeonato} name={g.campeonato} data={g.data} fill={g.fill} opacity={0.82} />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </Card>

        {/* Margem média por campeonato — horizontal bars */}
        <Card
          title="Margem Média por Campeonato"
          subtitle="Média de (resultado / receita) por campeonato"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={[...byCamp].sort((a, b) => b.margemMedia - a.margemMedia)}
              layout="vertical"
              margin={{ top: 8, right: 56, bottom: 8, left: 0 }}
              barSize={16}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: C.t3 }} tickFormatter={v => `${v.toFixed(0)}%`} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="campeonato" tick={<CampTick />} axisLine={false} tickLine={false} width={90} />
              <ReferenceLine x={0} stroke="#bbb" strokeDasharray="5 3" />
              <RTooltip content={<BarTip fmt={fmtPct} />} />
              <Bar dataKey="margemMedia" name="Margem %" radius={[0, 4, 4, 0]}>
                <LabelList dataKey="margemMedia" position="right" formatter={fmtPct} style={{ fontSize: 9, fill: C.t3 }} />
                {[...byCamp].sort((a, b) => b.margemMedia - a.margemMedia).map((d, i) => (
                  <Cell key={i} fill={d.margemMedia >= 0 ? (d.color) : '#c0392b'} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Row 3: Receita/torcedor vs Custo/torcedor por campeonato ── */}
      <Card
        title="Receita e Custo por Torcedor  —  Média por Campeonato"
        subtitle="receita / público  vs  despesa / público  ·  valores médios por jogo de cada campeonato"
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={byCamp}
            layout="vertical"
            margin={{ top: 8, right: 80, bottom: 8, left: 0 }}
            barSize={12}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 9, fill: C.t3 }} tickFormatter={v => `R$ ${v.toFixed(0)}`} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="campeonato" tick={<CampTick />} axisLine={false} tickLine={false} width={90} />
            <RTooltip content={<BarTip fmt={fmtR} />} />
            <Bar dataKey="receitaPorTorcedor" name="Receita/Torcedor" radius={[0, 4, 4, 0]}>
              <LabelList dataKey="receitaPorTorcedor" position="right" formatter={fmtR} style={{ fontSize: 8, fill: C.t3 }} />
              {byCamp.map((d, i) => (
                <Cell key={i} fill={d.color} opacity={0.9} />
              ))}
            </Bar>
            <Bar dataKey="custoPorTorcedor" name="Custo/Torcedor" radius={[0, 4, 4, 0]}>
              <LabelList dataKey="custoPorTorcedor" position="right" formatter={fmtR} style={{ fontSize: 8, fill: C.t3 }} />
              {byCamp.map((d, i) => (
                <Cell key={i} fill={d.color} opacity={0.4} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 4 }}>
          <span style={{ fontSize: 9, color: C.t3, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 12, height: 10, borderRadius: 2, background: '#888', opacity: 0.9, display: 'inline-block' }} /> Receita/Torcedor
          </span>
          <span style={{ fontSize: 9, color: C.t3, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 12, height: 10, borderRadius: 2, background: '#888', opacity: 0.4, display: 'inline-block' }} /> Custo/Torcedor
          </span>
        </div>
      </Card>

    </div>
  );
}
