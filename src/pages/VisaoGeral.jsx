import { useState } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Cell, ReferenceLine, BarChart,
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, BarChart2, Activity, Landmark,
  AlertTriangle, CheckCircle, Info, ChevronDown, ChevronUp,
} from 'lucide-react';

import { C, SHADOW } from '../tokens';
import Card from '../components/Card';
import KPICard from '../components/KPICard';
import { ChartTooltip } from '../components/Tooltip';
import { KPI_DATA, SERIES_MENSAL, WATERFALL, DRE, VARIACOES, ALERTAS, BULLET_UNs } from '../data/mock';

// ─── Formatters ─────────────────────────────────────────────────
const fmtM = (v) => {
  if (v === null || v === undefined) return '';
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}R$${(abs / 1_000_000).toFixed(1).replace('.', ',')}M`;
  return `${sign}R$${(abs / 1_000).toFixed(0)}K`;
};

const fmtFull = (v) => {
  if (v === null || v === undefined) return '—';
  const abs = Math.abs(v);
  const sign = v < 0 ? '(' : '';
  const signEnd = v < 0 ? ')' : '';
  if (abs >= 1_000_000) return `${sign}R$ ${(abs / 1_000_000).toFixed(2).replace('.', ',')}M${signEnd}`;
  return `${sign}R$ ${abs.toLocaleString('pt-BR')}${signEnd}`;
};

const varPct = (real, budget) =>
  budget !== 0 ? (((real - budget) / Math.abs(budget)) * 100).toFixed(1).replace('.', ',') + '%' : '—';

const varColor = (real, budget, inverted = false) => {
  const d = real - budget;
  if (Math.abs(d / budget) < 0.01) return C.t2;
  const pos = d > 0;
  return (pos && !inverted) || (!pos && inverted) ? C.green : C.red;
};

// ─── Waterfall chart data builder ───────────────────────────────
const buildWaterfall = () => {
  let running = 0;
  return WATERFALL.map((item) => {
    if (item.type === 'total' || item.type === 'subtotal') {
      running = item.value;
      return { ...item, base: 0, bar: item.value };
    }
    const base = running + Math.min(item.value, 0);
    const bar = Math.abs(item.value);
    running += item.value;
    return { ...item, base, bar };
  });
};
const WF_DATA = buildWaterfall();

// ─── Alert icon ─────────────────────────────────────────────────
const AlertIcon = ({ nivel }) => {
  const map = {
    red:   { Icon: AlertTriangle, color: C.red,   bg: C.redBg },
    amber: { Icon: Info,          color: C.amber,  bg: C.amberBg },
    green: { Icon: CheckCircle,   color: C.green,  bg: C.greenBg },
  };
  const { Icon, color, bg } = map[nivel];
  return (
    <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={15} color={color} />
    </div>
  );
};

// ─── Section label ───────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <div style={{ fontSize: 10, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
    {children}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function VisaoGeral() {
  const [dreOpen, setDreOpen] = useState(true);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Period badge ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 8, padding: '7px 14px', boxShadow: SHADOW.card,
        }}>
          <Activity size={13} color={C.blue} />
          <span style={{ fontSize: 12, fontWeight: 600, color: C.t1 }}>
            Acumulado Jan–Jun 2025
          </span>
          <span style={{ fontSize: 10, color: C.t3 }}>·</span>
          <span style={{ fontSize: 10, color: C.t2 }}>Série projetada até Dez 2025</span>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: C.indigoBg, borderRadius: 6, padding: '5px 10px',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: C.indigo }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: C.indigo }}>Forecast ativo: Base</span>
        </div>
      </div>

      {/* ── KPI Row ─── */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <KPICard
          icon={DollarSign} label="Receita Bruta"
          real={KPI_DATA.receita.real} budget={KPI_DATA.receita.budget} ly={KPI_DATA.receita.ly}
          iconBg="#EFF6FF"
        />
        <KPICard
          icon={BarChart2} label="EBITDA Margem"
          real={KPI_DATA.ebitda_pct.real} budget={KPI_DATA.ebitda_pct.budget} ly={KPI_DATA.ebitda_pct.ly}
          type="pct" iconBg="#F0FDF4"
        />
        <KPICard
          icon={TrendingUp} label="Lucro Líquido"
          real={KPI_DATA.lucro_liquido.real} budget={KPI_DATA.lucro_liquido.budget} ly={KPI_DATA.lucro_liquido.ly}
          iconBg="#FFF7ED"
        />
        <KPICard
          icon={Landmark} label="Posição de Caixa"
          real={KPI_DATA.caixa.real} budget={KPI_DATA.caixa.budget} ly={KPI_DATA.caixa.ly}
          iconBg="#F0FDF4"
        />
      </div>

      {/* ── Combo Chart + Waterfall ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 16 }}>

        {/* Combo: Real vs Budget vs Forecast */}
        <Card title="Receita Bruta — Real vs Budget vs Forecast" subtitle="Série mensal Jan–Dez 2025 · R$ milhões">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={SERIES_MENSAL} margin={{ top: 8, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="mes"
                tick={{ fill: C.t3, fontSize: 10, fontWeight: 500 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fill: C.t3, fontSize: 9 }}
                axisLine={false} tickLine={false}
                tickFormatter={v => `R$${(v / 1_000_000).toFixed(0)}M`}
              />
              <RTooltip content={<ChartTooltip formatter={(v) => v ? fmtM(v) : '—'} />} />

              {/* Budget line */}
              <Line
                type="monotone" dataKey="budget" name="Budget"
                stroke={C.budget} strokeWidth={2} dot={false}
                strokeDasharray="6 3"
              />
              {/* Forecast line */}
              <Line
                type="monotone" dataKey="forecast" name="Forecast"
                stroke={C.indigo} strokeWidth={2} dot={false}
                strokeDasharray="3 3"
              />
              {/* LY line */}
              <Line
                type="monotone" dataKey="ly" name="LY"
                stroke={C.ly} strokeWidth={1.5} dot={false}
              />
              {/* Real bars */}
              <Bar dataKey="real" name="Real" fill={C.navy} radius={[4, 4, 0, 0]} barSize={22} />

              {/* Separator: atual vs forecast */}
              <ReferenceLine x="Jun" stroke={C.border} strokeDasharray="4 2" label={{ value: 'Hoje', fill: C.t3, fontSize: 9, position: 'top' }} />
            </ComposedChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
            {[
              { label: 'Real', color: C.navy, type: 'bar' },
              { label: 'Budget', color: C.budget, type: 'dash' },
              { label: 'Forecast', color: C.indigo, type: 'dotdash' },
              { label: 'LY', color: C.ly, type: 'line' },
            ].map(({ label, color, type }) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: C.t2 }}>
                {type === 'bar'
                  ? <span style={{ width: 14, height: 8, borderRadius: 2, background: color, display: 'inline-block' }} />
                  : <svg width={20} height={4}><line x1={0} y1={2} x2={20} y2={2} stroke={color} strokeWidth={2} strokeDasharray={type === 'dash' ? '5 2' : type === 'dotdash' ? '2 2' : 'none'} /></svg>
                }
                {label}
              </span>
            ))}
          </div>
        </Card>

        {/* Waterfall EBITDA */}
        <Card title="Bridge EBITDA" subtitle="Acumulado Jan–Jun 2025 · R$ milhões">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={WF_DATA} margin={{ top: 8, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: C.t3, fontSize: 8, fontWeight: 500 }}
                axisLine={false} tickLine={false}
                angle={-28} textAnchor="end" height={52}
              />
              <YAxis
                tick={{ fill: C.t3, fontSize: 9 }}
                axisLine={false} tickLine={false}
                tickFormatter={v => `R$${(v / 1_000_000).toFixed(0)}M`}
              />
              <RTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  return (
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', fontSize: 11, boxShadow: SHADOW.md }}>
                      <p style={{ fontWeight: 700, color: C.t1, marginBottom: 4 }}>{d.name}</p>
                      <p style={{ color: C.t2 }}>{fmtFull(d.value)}</p>
                    </div>
                  );
                }}
              />

              {/* Invisible base bar */}
              <Bar dataKey="base" stackId="wf" fill="transparent" />
              {/* Visible bar */}
              <Bar dataKey="bar" stackId="wf" radius={[3, 3, 0, 0]} barSize={32}
                label={{ position: 'top', fontSize: 8, fontWeight: 700, fill: C.t1, formatter: (v, _, props) => fmtM(props?.payload?.value) }}
              >
                {WF_DATA.map((d, i) => (
                  <Cell
                    key={i}
                    fill={
                      d.type === 'total' ? C.navy
                      : d.type === 'subtotal' ? C.blue
                      : d.value > 0 ? C.green
                      : C.red
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Middle row: DRE + Variações + Alertas ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.7fr 0.7fr', gap: 16 }}>

        {/* DRE Resumida */}
        <Card noPad>
          <button
            onClick={() => setDreOpen(o => !o)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '16px 24px', borderBottom: dreOpen ? `1px solid ${C.border}` : 'none',
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.t2, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                DRE Resumida
              </div>
              <div style={{ fontSize: 10, color: C.t3, marginTop: 1 }}>Acumulado Jan–Jun 2025</div>
            </div>
            {dreOpen ? <ChevronUp size={15} color={C.t3} /> : <ChevronDown size={15} color={C.t3} />}
          </button>

          {dreOpen && (
            <div style={{ padding: '0 0 8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    <th style={{ textAlign: 'left', padding: '8px 24px', fontSize: 9, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Conta</th>
                    <th style={{ textAlign: 'right', padding: '8px 16px', fontSize: 9, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Real</th>
                    <th style={{ textAlign: 'right', padding: '8px 16px', fontSize: 9, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Budget</th>
                    <th style={{ textAlign: 'right', padding: '8px 20px 8px 8px', fontSize: 9, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Var%</th>
                  </tr>
                </thead>
                <tbody>
                  {DRE.map((row, i) => {
                    const isTotal = row.conta === 'EBITDA' || row.conta === 'Lucro Líquido' || row.conta === 'Receita Líq.' || row.conta === 'Lucro Bruto' || row.conta === 'EBIT';
                    const inverted = row.conta.startsWith('(-)');
                    const vc = varColor(row.real, row.budget, inverted);
                    const vp = varPct(row.real, row.budget);
                    return (
                      <tr
                        key={i}
                        style={{
                          borderBottom: `1px solid ${C.border}`,
                          background: isTotal ? '#F8FAFC' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '7px 24px', fontWeight: isTotal ? 700 : 400, color: isTotal ? C.t1 : C.t2, whiteSpace: 'nowrap' }}>
                          {row.conta}
                        </td>
                        <td style={{ padding: '7px 16px', textAlign: 'right', fontWeight: isTotal ? 700 : 500, color: C.t1, fontVariantNumeric: 'tabular-nums' }}>
                          {fmtFull(row.real)}
                        </td>
                        <td style={{ padding: '7px 16px', textAlign: 'right', color: C.t3, fontVariantNumeric: 'tabular-nums' }}>
                          {fmtFull(row.budget)}
                        </td>
                        <td style={{ padding: '7px 20px 7px 8px', textAlign: 'right', fontWeight: 700, color: vc, fontVariantNumeric: 'tabular-nums' }}>
                          {vp}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Top Variações */}
        <Card title="Top Variações" subtitle="vs Budget · Jan–Jun">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {VARIACOES.map((v, i) => {
              const isPos = v.direcao === 'up';
              const color = isPos ? C.green : C.red;
              const bg = isPos ? C.greenBg : C.redBg;
              const pct = Math.abs(v.variacao);
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: C.t1 }}>{v.item}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color,
                      background: bg, borderRadius: 4, padding: '2px 6px',
                    }}>
                      {isPos ? '+' : '-'}{pct.toFixed(1).replace('.', ',')}%
                    </span>
                  </div>
                  <div style={{ background: C.border, borderRadius: 2, height: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(pct * 4, 100)}%`, height: '100%', background: color, borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: 9, color: C.t3, marginTop: 2 }}>{fmtFull(v.valor)}</div>
                </div>
              );
            })}
          </div>

          {/* Bullet UN */}
          <div style={{ marginTop: 20 }}>
            <SectionLabel>% Budget por UN</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {BULLET_UNs.map((b, i) => {
                const color = b.real >= 100 ? C.green : b.real >= b.min ? C.amber : C.red;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 9, color: C.t2, width: 68, flexShrink: 0 }}>{b.un}</span>
                    <div style={{ flex: 1, background: C.border, borderRadius: 2, height: 6, position: 'relative', overflow: 'visible' }}>
                      {/* Min threshold */}
                      <div style={{
                        position: 'absolute', left: `${b.min}%`, top: -3, width: 2, height: 12,
                        background: C.t3, borderRadius: 1,
                      }} />
                      <div style={{ width: `${Math.min(b.real, 100)}%`, height: '100%', background: color, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color, width: 34, textAlign: 'right' }}>{b.real}%</span>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 2, height: 10, background: C.t3, borderRadius: 1 }} />
              <span style={{ fontSize: 9, color: C.t3 }}>Piso mínimo (70%)</span>
            </div>
          </div>
        </Card>

        {/* Alertas */}
        <Card title="Alertas Ativos" subtitle={`${ALERTAS.filter(a => a.nivel === 'red').length} críticos · ${ALERTAS.filter(a => a.nivel === 'amber').length} atenção`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ALERTAS.map((a, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                padding: '10px 12px',
                background: a.nivel === 'red' ? '#FFF5F5' : a.nivel === 'amber' ? '#FFFBEB' : '#F0FDF4',
                borderRadius: 8,
                borderLeft: `3px solid ${a.nivel === 'red' ? C.red : a.nivel === 'amber' ? C.amber : C.green}`,
              }}>
                <AlertIcon nivel={a.nivel} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.t1 }}>{a.titulo}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: a.nivel === 'red' ? C.red : a.nivel === 'amber' ? C.amber : C.green }}>{a.desc}</div>
                  <div style={{ fontSize: 9, color: C.t3, marginTop: 1 }}>{a.detalhe}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

    </div>
  );
}
