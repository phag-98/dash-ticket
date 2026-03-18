import { C, SHADOW } from '../tokens';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const fmt = (v, type) => {
  if (type === 'pct') return `${v.toFixed(1).replace('.', ',')}%`;
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1).replace('.', ',')}M`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}K`;
  return `R$ ${v}`;
};

const delta = (real, budget) => ((real - budget) / Math.abs(budget)) * 100;

export default function KPICard({ icon: Icon, label, real, budget, ly, type = 'brl', iconBg }) {
  const d = delta(real, budget);
  const isPos = d >= 0;
  const isNeutral = Math.abs(d) < 0.5;

  const color = isNeutral ? C.t2 : isPos ? C.green : C.red;
  const bg    = isNeutral ? '#F1F5F9' : isPos ? C.greenBg : C.redBg;
  const Icon2 = isNeutral ? Minus : isPos ? TrendingUp : TrendingDown;

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      boxShadow: SHADOW.card,
      padding: '20px 22px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      flex: 1,
      minWidth: 200,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8,
          background: iconBg || '#EFF6FF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={C.blue} />
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: bg, borderRadius: 6, padding: '4px 8px',
        }}>
          <Icon2 size={12} color={color} />
          <span style={{ fontSize: 11, fontWeight: 700, color }}>
            {isPos ? '+' : ''}{d.toFixed(1).replace('.', ',')}% Budget
          </span>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 10, fontWeight: 600, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ fontSize: 30, fontWeight: 800, color: C.t1, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}>
          {fmt(real, type)}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
        <div>
          <div style={{ fontSize: 9, color: C.t3, fontWeight: 600, textTransform: 'uppercase' }}>Budget</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.t2, fontVariantNumeric: 'tabular-nums' }}>{fmt(budget, type)}</div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: C.t3, fontWeight: 600, textTransform: 'uppercase' }}>LY</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.t2, fontVariantNumeric: 'tabular-nums' }}>{fmt(ly, type)}</div>
        </div>
      </div>
    </div>
  );
}
