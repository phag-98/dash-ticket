import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, LabelList, Cell,
} from 'recharts';
import { C, FONT, SHADOW } from '../tokens';
import { faturamentoPorCampeonatoAno, partidas } from '../data/data';

const fmtM = v => {
  if (!v) return '0';
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace('.', ',')} Mi`;
  return `${(v / 1_000).toFixed(0)} Mil`;
};
const fmtK = v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`;

// Unique campeonato names
const CAMP_NAMES = [...new Set(faturamentoPorCampeonatoAno.map(d => d.campeonato).filter(Boolean))].sort();

// Camp colors
const CAMP_COLORS = {
  'Brasileirão':    '#4ade80',
  'Carioca':        '#f87171',
  'Copa do Brasil': '#60a5fa',
  'Libertadores':   '#a78bfa',
  'Recopa':         '#fb923c',
  'Sulamericana':   '#fbbf24',
  'Supermundial':   '#34d399',
  'Mundial':        '#e879f9',
  'Supercopa':      '#64748b',
};

function Card({ children, title, subtitle, style = {} }) {
  return (
    <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, boxShadow: SHADOW.card, ...style }}>
      {(title || subtitle) && (
        <div style={{ padding: '12px 16px 4px' }}>
          {title && <div style={{ fontSize: 11, fontWeight: 700, color: C.t1, marginBottom: 2 }}>{title}</div>}
          {subtitle && <div style={{ fontSize: 9, color: C.t3 }}>{subtitle}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', fontSize: 11, boxShadow: SHADOW.md }}>
      <p style={{ fontWeight: 700, color: C.t1, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill || C.t2, margin: '2px 0' }}>
          <span style={{ color: C.t3 }}>{p.name}: </span>
          <span style={{ fontWeight: 600 }}>{typeof p.value === 'number' ? fmtM(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

function buildData(field, campFilter) {
  const filtered = campFilter
    ? faturamentoPorCampeonatoAno.filter(d => d.campeonato === campFilter)
    : faturamentoPorCampeonatoAno;
  const camps = [...new Set(filtered.map(d => d.campeonato))];
  return camps.map(camp => {
    const d24 = filtered.find(d => d.campeonato === camp && d.ano === 2024);
    const d25 = filtered.find(d => d.campeonato === camp && d.ano === 2025);
    return { campeonato: camp, '2024': d24?.[field] ?? 0, '2025': d25?.[field] ?? 0 };
  });
}

export default function Comparativo() {
  const [campFilter, setCampFilter] = useState(null);

  const fatData    = useMemo(() => buildData('faturamento', campFilter), [campFilter]);
  const fatMedData = useMemo(() => buildData('fatMedio', campFilter), [campFilter]);
  const tktData    = useMemo(() => buildData('ticketMedio', campFilter), [campFilter]);
  const pubData    = useMemo(() => buildData('mediaPublico', campFilter), [campFilter]);

  // Total faturamento by year
  const fat2024 = faturamentoPorCampeonatoAno.filter(d => d.ano === 2024).reduce((s, d) => s + d.faturamento, 0);
  const fat2025 = faturamentoPorCampeonatoAno.filter(d => d.ano === 2025).reduce((s, d) => s + d.faturamento, 0);

  // Jogos count
  const jogosTable = useMemo(() => {
    const camps = [...new Set(partidas.map(p => p.campeonato).filter(Boolean))].sort();
    return camps.map(c => {
      const n24 = partidas.filter(p => p.campeonato === c && p.ano === 2024).length;
      const n25 = partidas.filter(p => p.campeonato === c && p.ano === 2025).length;
      return { campeonato: c, '2024': n24, '2025': n25, total: n24 + n25 };
    }).filter(r => r.total > 0);
  }, []);
  const totalJogos = {
    '2024': partidas.filter(p => p.ano === 2024).length,
    '2025': partidas.filter(p => p.ano === 2025).length,
    total: partidas.length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {['Todos', ...CAMP_NAMES].map(c => (
          <button key={c} onClick={() => setCampFilter(c === 'Todos' ? null : c)} style={{
            padding: '5px 14px', borderRadius: 6, border: `1px solid ${C.border}`,
            background: (campFilter === c || (c === 'Todos' && !campFilter)) ? C.accent : C.card,
            color: (campFilter === c || (c === 'Todos' && !campFilter)) ? '#000' : C.t2,
            fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: FONT,
          }}>{c}</button>
        ))}
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>

        {/* Faturamento total por camp + ano (horizontal) */}
        <Card title="Faturamento por Campeonato e Ano" subtitle="● 2024  ● 2025">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={fatData} layout="vertical" margin={{ top: 8, right: 60, bottom: 4, left: 90 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fill: C.t3, fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={fmtM} />
              <YAxis type="category" dataKey="campeonato" tick={{ fill: C.t2, fontSize: 9 }} axisLine={false} tickLine={false} width={90} />
              <RTooltip content={<DarkTooltip />} />
              <Bar dataKey="2024" name="2024" fill="#555566" radius={[0, 3, 3, 0]} barSize={9}>
                <LabelList dataKey="2024" position="right" formatter={fmtM} style={{ fontSize: 7, fill: C.t3 }} />
              </Bar>
              <Bar dataKey="2025" name="2025" fill={C.accent} radius={[0, 3, 3, 0]} barSize={9}>
                <LabelList dataKey="2025" position="right" formatter={fmtM} style={{ fontSize: 7, fill: C.accent }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Faturamento médio */}
        <Card title="Faturamento Médio por Campeonato e Ano">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={fatMedData} margin={{ top: 8, right: 16, bottom: 36, left: 8 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="campeonato" tick={{ fill: C.t3, fontSize: 8 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={50} interval={0} />
              <YAxis tick={{ fill: C.t3, fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={fmtM} />
              <RTooltip content={<DarkTooltip />} />
              <Bar dataKey="2024" name="2024" fill="#555566" barSize={14} radius={[3, 3, 0, 0]}>
                <LabelList dataKey="2024" position="top" formatter={fmtM} style={{ fontSize: 7, fill: C.t3 }} />
              </Bar>
              <Bar dataKey="2025" name="2025" fill={C.accent} barSize={14} radius={[3, 3, 0, 0]}>
                <LabelList dataKey="2025" position="top" formatter={fmtM} style={{ fontSize: 7, fill: C.accent }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Faturamento por Ano */}
        <Card title="Faturamento por ANO">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[{ ano: '2024', valor: fat2024 }, { ano: '2025', valor: fat2025 }]} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="ano" tick={{ fill: C.t2, fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.t3, fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={fmtM} />
              <RTooltip content={<DarkTooltip />} />
              <Bar dataKey="valor" name="Faturamento" radius={[4, 4, 0, 0]} barSize={60}>
                <LabelList dataKey="valor" position="top" formatter={fmtM} style={{ fontSize: 9, fontWeight: 700, fill: C.t1 }} />
                <Cell fill="#444455" />
                <Cell fill={C.accent} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Ticket Médio */}
        <Card title="Ticket Médio por Campeonato e Ano">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tktData} margin={{ top: 8, right: 16, bottom: 36, left: 8 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="campeonato" tick={{ fill: C.t3, fontSize: 8 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={50} interval={0} />
              <YAxis tick={{ fill: C.t3, fontSize: 8 }} axisLine={false} tickLine={false} />
              <RTooltip content={<DarkTooltip />} />
              <Bar dataKey="2024" name="2024" fill="#555566" barSize={14} radius={[3, 3, 0, 0]}>
                <LabelList dataKey="2024" position="top" style={{ fontSize: 7, fill: C.t3 }} />
              </Bar>
              <Bar dataKey="2025" name="2025" fill={C.accent} barSize={14} radius={[3, 3, 0, 0]}>
                <LabelList dataKey="2025" position="top" style={{ fontSize: 7, fill: C.accent }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Média de Público */}
        <Card title="Média de Público por Campeonato e Ano">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pubData} margin={{ top: 8, right: 16, bottom: 36, left: 8 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="campeonato" tick={{ fill: C.t3, fontSize: 8 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={50} interval={0} />
              <YAxis tick={{ fill: C.t3, fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
              <RTooltip content={<DarkTooltip />} />
              <Bar dataKey="2024" name="2024" fill="#555566" barSize={14} radius={[3, 3, 0, 0]}>
                <LabelList dataKey="2024" position="top" formatter={fmtK} style={{ fontSize: 7, fill: C.t3 }} />
              </Bar>
              <Bar dataKey="2025" name="2025" fill={C.accent} barSize={14} radius={[3, 3, 0, 0]}>
                <LabelList dataKey="2025" position="top" formatter={fmtK} style={{ fontSize: 7, fill: C.accent }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Jogos count table */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', boxShadow: SHADOW.card }}>
          <div style={{ padding: '12px 16px 8px', fontSize: 11, fontWeight: 700, color: C.t1 }}>Nº de Jogos</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ background: C.bgAlt }}>
                <th style={{ padding: '6px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: C.t3, textTransform: 'uppercase' }}>Campeonato</th>
                <th style={{ padding: '6px 8px', textAlign: 'center', fontSize: 9, fontWeight: 700, color: '#555566' }}>2024</th>
                <th style={{ padding: '6px 8px', textAlign: 'center', fontSize: 9, fontWeight: 700, color: C.accent }}>2025</th>
                <th style={{ padding: '6px 8px', textAlign: 'center', fontSize: 9, fontWeight: 700, color: C.t2 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {jogosTable.map((r, i) => (
                <tr key={r.campeonato} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? 'transparent' : C.bgAlt + '44' }}>
                  <td style={{ padding: '6px 12px', color: C.t1, fontSize: 10 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: CAMP_COLORS[r.campeonato] || C.t3, display: 'inline-block', flexShrink: 0 }} />
                      {r.campeonato}
                    </span>
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', color: '#8888aa', fontWeight: 600 }}>{r['2024'] || '—'}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', color: C.accent, fontWeight: 600 }}>{r['2025'] || '—'}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', color: C.t1, fontWeight: 700 }}>{r.total}</td>
                </tr>
              ))}
              <tr style={{ borderTop: `2px solid ${C.border}`, background: C.bgAlt }}>
                <td style={{ padding: '6px 12px', fontWeight: 700, color: C.t1, fontSize: 10 }}>Total</td>
                <td style={{ padding: '6px 8px', textAlign: 'center', color: '#8888aa', fontWeight: 700 }}>{totalJogos['2024']}</td>
                <td style={{ padding: '6px 8px', textAlign: 'center', color: C.accent, fontWeight: 700 }}>{totalJogos['2025']}</td>
                <td style={{ padding: '6px 8px', textAlign: 'center', color: C.t1, fontWeight: 800 }}>{totalJogos.total}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      {/* Detailed partidas table */}
      <Card title="Detalhe das Partidas">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
            <thead>
              <tr style={{ background: C.bgAlt, position: 'sticky', top: 0 }}>
                {['Time', 'Campeonato', 'Data', 'Rodada', 'Dia', 'Horário'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...partidas].sort((a, b) => {
                if (campFilter && a.campeonato !== campFilter && b.campeonato === campFilter) return 1;
                if (campFilter && a.campeonato === campFilter && b.campeonato !== campFilter) return -1;
                return b.data.localeCompare(a.data);
              }).filter(p => !campFilter || p.campeonato === campFilter).map((p, i) => (
                <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? 'transparent' : C.bgAlt + '44' }}>
                  <td style={{ padding: '6px 12px', color: C.t1, fontWeight: 500 }}>{p.time}</td>
                  <td style={{ padding: '6px 12px' }}>
                    <span style={{ background: (CAMP_COLORS[p.campeonato] || C.t3) + '22', color: CAMP_COLORS[p.campeonato] || C.t3, borderRadius: 4, padding: '2px 6px', fontSize: 9, fontWeight: 700 }}>{p.campeonato}</span>
                  </td>
                  <td style={{ padding: '6px 12px', color: C.t2 }}>{p.data}</td>
                  <td style={{ padding: '6px 12px', color: C.t2 }}>{p.rodada}</td>
                  <td style={{ padding: '6px 12px', color: C.t3 }}>{p.diaSemana}</td>
                  <td style={{ padding: '6px 12px', color: C.t3 }}>{p.horario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
