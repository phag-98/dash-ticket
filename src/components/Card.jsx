import { C, SHADOW, FONT_DISPLAY, FONT_UI } from '../tokens';

export default function Card({ title, subtitle, children, style, noPad }) {
  return (
    <div style={{
      background: C.surfaceContainerLowest,
      border: `1px solid ${C.border}`,
      borderRadius: 24,
      boxShadow: SHADOW.card,
      padding: noPad ? 0 : '20px 24px',
      overflow: 'hidden',
      ...style,
    }}>
      {(title || subtitle) && (
        <div style={{ marginBottom: 20 }}>
          {title && (
            <div style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 11, fontWeight: 700,
              color: C.t2,
              textTransform: 'uppercase', letterSpacing: '1px',
            }}>{title}</div>
          )}
          {subtitle && (
            <div style={{ fontFamily: FONT_UI, fontSize: 11, color: C.t3, marginTop: 3 }}>{subtitle}</div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
