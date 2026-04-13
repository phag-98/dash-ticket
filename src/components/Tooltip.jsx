import { C, SHADOW } from '../tokens';

const fmtBRL = (v) => {
  if (v === null || v === undefined) return '—';
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}R$ ${(abs / 1_000_000).toFixed(2).replace('.', ',')}M`;
  if (abs >= 1_000) return `${sign}R$ ${(abs / 1_000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}K`;
  return `${sign}R$ ${abs}`;
};

export function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 11,
      boxShadow: SHADOW.md,
      minWidth: 160,
    }}>
      <p style={{ color: C.t1, fontWeight: 700, marginBottom: 6, fontSize: 12 }}>{label}</p>
      {payload.map((p, i) => (
        p.value !== null && (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, margin: '3px 0' }}>
            <span style={{ color: C.t2, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color || p.stroke, display: 'inline-block', flexShrink: 0 }} />
              {p.name}
            </span>
            <span style={{ fontWeight: 700, color: C.t1, fontVariantNumeric: 'tabular-nums' }}>
              {formatter ? formatter(p.value, p.name) : fmtBRL(p.value)}
            </span>
          </div>
        )
      ))}
    </div>
  );
}
