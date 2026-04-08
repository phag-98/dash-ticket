import { C, SHADOW, FONT_DISPLAY, FONT_UI } from '../tokens';

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
      background: C.surfaceContainerLowest,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: '10px 14px',
      fontSize: 11,
      boxShadow: SHADOW.md,
      minWidth: 160,
    }}>
      <p style={{
        fontFamily: FONT_DISPLAY,
        color: C.onSurface, fontWeight: 700,
        marginBottom: 8, fontSize: 12,
      }}>{label}</p>
      {payload.map((p, i) => (
        p.value !== null && (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, margin: '4px 0' }}>
            <span style={{ fontFamily: FONT_UI, color: C.t2, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 8, height: 8, borderRadius: 2,
                background: p.color || p.stroke,
                display: 'inline-block', flexShrink: 0,
              }} />
              {p.name}
            </span>
            <span style={{ fontFamily: FONT_UI, fontWeight: 700, color: C.onSurface, fontVariantNumeric: 'tabular-nums' }}>
              {formatter ? formatter(p.value, p.name) : fmtBRL(p.value)}
            </span>
          </div>
        )
      ))}
    </div>
  );
}
