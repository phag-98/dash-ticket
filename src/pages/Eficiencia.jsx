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
const fmtM  = v => v >= 1e6 ? `${(v / 1e6).toFixed(2).replace('.', ',')} Mi` : `${(v / 1000).toFixed(0)} K`;
const fmtK  = v => v >= 1000 ? `${Math.round(v / 1000)} K` : String(v);
const fmtR  = v => `R$ ${v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
const fmtPct = v => `${v.toFixed(1).replace('.', ',')}%`;
const fmtBRL = v => {
  const abs = Math.abs(v);
  const s = abs.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return v < 0 ? `-R$ ${s}` : `R$ ${s}`;
};

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

// ── Card wrapper ──────────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, style }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
      boxShadow: SHADOW.card, padding: '14px 16px 10px', ...style,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.t2, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 2 }}>
        {title}
      </div>
      {subtitle && <div style={{ fontSize: 9, color: C.t3, marginBottom: 10 }}>{subtitle}</div>}
      {children}
    </div>
  );
}

// ── Build dataset ─────────────────────────────────────────────────────────────
const FAT_MAP = Object.fromEntries(faturamentoPorPartida.map(d => [d.idPartida, d.utilizados || 0]));

const CAMP_NAMES = [...new Set(plPorPartida.map(d => d.campeonato).filter(Boolean))].sort();
const YEARS      = [...new Set(plPorPartida.map(d => d.ano).filter(Boolean))].sort();

// ── Tooltips ──────────────────────────────────────────────────────────────────
function ScatterTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 12px', fontSize: 10, fontFamily: FONT_UI, minWidth: 160 }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: C.t1 }}>{d.time} <span style={{ color: C.t3 }}>({d.campeonato})</span></div>
      <div style={{ color: C.t2 }}>Público: <b>{d.publico?.toLocaleString('pt-BR')}</b></div>
      <div style={{ color: C.t2 }}>Receita: <b>{fmtBRL(d.receita)}</b></div>
      <div style={{ color: C.t2 }}>Despesa: <b>{fmtBRL(-d.despesa)}</b></div>
      <div style={{ color: d.resultado >= 0 ? '#3a9a5c' : '#c0392b' }}>Resultado: <b>{fmtBRL(d.resultado)}</b></div>
    </div>
  );
}

function ResultadoTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 12px', fontSize: 10, fontFamily: FONT_UI, minWidth: 160 }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: C.t1 }}>{d.time} <span style={{ color: C.t3 }}>({d.campeonato})</span></div>
      <div style={{ color: C.t2 }}>Público: <b>{d.publico?.toLocaleString('pt-BR')}</b></div>
      <div style={{ color: d.resultado >= 0 ? '#3a9a5c' : '#c0392b' }}>Resultado: <b>{fmtBRL(d.resultado)}</b></div>
      <div style={{ color: C.t3 }}>Margem: <b>{fmtPct(d.margem)}</b></div>
    </div>
  );
}

function BarTip({ active, payload, label, fmt }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 12px', fontSize: 10, fontFamily: FONT_UI }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: C.t1 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.fill || C.t2 }}>
          {p.name}: <b>{fmt ? fmt(p.value) : p.value}</b>
        </div>
      ))}
    </div>
  );
}

// ── Legend dot ────────────────────────────────────────────────────────────────
function LegendDot({ color, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: C.t3 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
      {label}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Eficiencia() {
  const [campFilter, setCampFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');

  const data = useMemo(() => {
    const base = plPorPartida.filter(d =>
      (campFilter === 'ALL' || d.campeonato === campFilter) &&
      (yearFilter === 'ALL' || d.ano === Number(yearFilter))
    );
    return base.map(d => {
      const publico  = FAT_MAP[d.idPartida] || 0;
      const receita  = d.totalRevenues || 0;
      const despesa  = Math.abs((d.totalOperatingExpenses || 0) + (d.totalLogistics || 0) + (d.totalFederations || 0));
      const resultado = d.total || 0;
      const margem   = receita > 0 ? (resultado / receita) * 100 : 0;
      const receitaPorTorcedor = publico > 0 ? receita / publico : 0;
      const custoPorTorcedor   = publico > 0 ? despesa / publico : 0;
      return { ...d, publico, receita, despesa, resultado, margem, receitaPorTorcedor, custoPorTorcedor };
    });
  }, [campFilter, yearFilter]);

  // Group by campeonato for scatter coloring
  const scatterGroups = useMemo(() => {
    const map = {};
    data.forEach(d => {
      if (!map[d.campeonato]) map[d.campeonato] = { campeonato: d.campeonato, fill: CAMP_COLORS[d.campeonato] || '#aaa', data: [] };
      map[d.campeonato].data.push(d);
    });
    return Object.values(map);
  }, [data]);

  // Max Z for bubble scaling
  const maxDespesa = useMemo(() => Math.max(...data.map(d => d.despesa), 1), [data]);

  // Bar chart data (sorted by date — already sorted from source)
  const barLabel = d => {
    const short = (d.time || '').split(' ').slice(-1)[0].slice(0, 5);
    return short;
  };

  return (
    <div style={{ fontFamily: FONT_UI, color: C.t1 }}>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <FilterBtn label="All" active={campFilter === 'ALL'} onClick={() => setCampFilter('ALL')} color={C.accent} />
          {CAMP_NAMES.map(c => (
            <FilterBtn key={c} label={c} active={campFilter === c} onClick={() => setCampFilter(c)}
              color={CAMP_COLORS[c]} logo={COMP_LOGOS[c]} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: C.t3, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Ano</span>
          <FilterBtn label="Todos" active={yearFilter === 'ALL'} onClick={() => setYearFilter('ALL')} color={C.accent} />
          {YEARS.map(y => (
            <FilterBtn key={y} label={String(y)} active={yearFilter === String(y)} onClick={() => setYearFilter(String(y))} color={C.accent} />
          ))}
        </div>
      </div>

      {/* ── Row 1: Scatter 3 vars + Resultado vs Público ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Bubble: Público × Receita (size = Despesa) */}
        <ChartCard
          title="Público · Receita · Despesa"
          subtitle="Eixo X = público · Eixo Y = receita · Tamanho da bolha = despesa total"
        >
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
            {scatterGroups.map(g => <LegendDot key={g.campeonato} color={g.fill} label={g.campeonato} />)}
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis
                dataKey="publico" type="number" name="Público"
                tick={{ fontSize: 9, fill: C.t3 }} tickFormatter={fmtK}
                label={{ value: 'Público', position: 'insideBottom', offset: -12, fontSize: 9, fill: C.t3 }}
              />
              <YAxis
                dataKey="receita" type="number" name="Receita"
                tick={{ fontSize: 9, fill: C.t3 }} tickFormatter={fmtM}
                width={56}
                label={{ value: 'Receita', angle: -90, position: 'insideLeft', offset: 12, fontSize: 9, fill: C.t3 }}
              />
              <ZAxis dataKey="despesa" range={[60, 600]} name="Despesa" />
              <RTooltip content={<ScatterTip />} />
              {scatterGroups.map(g => (
                <Scatter key={g.campeonato} name={g.campeonato} data={g.data} fill={g.fill} opacity={0.75} />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Scatter: Resultado vs Público */}
        <ChartCard
          title="Resultado vs Público"
          subtitle="Cada ponto = 1 jogo · Cor = campeonato"
        >
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
            {scatterGroups.map(g => <LegendDot key={g.campeonato} color={g.fill} label={g.campeonato} />)}
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis
                dataKey="publico" type="number" name="Público"
                tick={{ fontSize: 9, fill: C.t3 }} tickFormatter={fmtK}
                label={{ value: 'Público', position: 'insideBottom', offset: -12, fontSize: 9, fill: C.t3 }}
              />
              <YAxis
                dataKey="resultado" type="number" name="Resultado"
                tick={{ fontSize: 9, fill: C.t3 }} tickFormatter={fmtM}
                width={56}
                label={{ value: 'Resultado', angle: -90, position: 'insideLeft', offset: 12, fontSize: 9, fill: C.t3 }}
              />
              <ZAxis range={[30, 30]} />
              <ReferenceLine y={0} stroke="#aaa" strokeDasharray="4 2" />
              <RTooltip content={<ResultadoTip />} />
              {scatterGroups.map(g => (
                <Scatter key={g.campeonato} name={g.campeonato} data={g.data} fill={g.fill} opacity={0.8} />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Row 2: Margem % por jogo ── */}
      <ChartCard
        title="Margem (%) por Jogo"
        subtitle="resultado / receita · verde = positivo · vermelho = negativo"
        style={{ marginBottom: 16 }}
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 8, right: 16, bottom: 24, left: 8 }} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 8, fill: C.t3 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={48}
              tickFormatter={v => (v || '').split(' ').slice(-1)[0].slice(0, 6)}
            />
            <YAxis
              tick={{ fontSize: 9, fill: C.t3 }}
              tickFormatter={v => `${v.toFixed(0)}%`}
              width={44}
            />
            <ReferenceLine y={0} stroke="#999" strokeDasharray="4 2" />
            <RTooltip content={<BarTip fmt={fmtPct} />} />
            <Bar dataKey="margem" name="Margem %">
              {data.map((d, i) => (
                <Cell key={i} fill={d.margem >= 0 ? '#3a9a5c' : '#c0392b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── Row 3: Receita por torcedor + Custo por torcedor ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        <ChartCard
          title="Receita por Torcedor"
          subtitle="receita total / público presente"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 8, right: 16, bottom: 24, left: 8 }} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 8, fill: C.t3 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={48}
                tickFormatter={v => (v || '').split(' ').slice(-1)[0].slice(0, 6)}
              />
              <YAxis
                tick={{ fontSize: 9, fill: C.t3 }}
                tickFormatter={v => `R$ ${v.toFixed(0)}`}
                width={52}
              />
              <RTooltip content={<BarTip fmt={fmtR} />} />
              <Bar dataKey="receitaPorTorcedor" name="Receita/Torcedor" fill="#6b4fa0">
                {data.map((d, i) => (
                  <Cell key={i} fill={CAMP_COLORS[d.campeonato] || '#6b4fa0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Custo por Torcedor"
          subtitle="despesa total / público presente"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 8, right: 16, bottom: 24, left: 8 }} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 8, fill: C.t3 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={48}
                tickFormatter={v => (v || '').split(' ').slice(-1)[0].slice(0, 6)}
              />
              <YAxis
                tick={{ fontSize: 9, fill: C.t3 }}
                tickFormatter={v => `R$ ${v.toFixed(0)}`}
                width={52}
              />
              <RTooltip content={<BarTip fmt={fmtR} />} />
              <Bar dataKey="custoPorTorcedor" name="Custo/Torcedor">
                {data.map((d, i) => (
                  <Cell key={i} fill={CAMP_COLORS[d.campeonato] || C.accent} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </div>
  );
}
