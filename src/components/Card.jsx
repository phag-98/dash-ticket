import { C, SHADOW } from '../tokens';

export default function Card({ title, subtitle, children, style, noPad }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      boxShadow: SHADOW.card,
      padding: noPad ? 0 : '20px 24px',
      overflow: 'hidden',
      ...style,
    }}>
      {(title || subtitle) && (
        <div style={{ marginBottom: 16 }}>
          {title && (
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.t2,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
            }}>{title}</div>
          )}
          {subtitle && (
            <div style={{ fontSize: 11, color: C.t3, marginTop: 2 }}>{subtitle}</div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
