import { C } from '../tokens';
import { COMP_LOGOS } from '../teamData';

// Shared pill-style filter button used across all dashboard pages.
// `logo` can be passed explicitly; otherwise it is derived from the label
// (campeonato name) unless `autoLogo` is disabled.
export default function FilterBtn({
  label, active, onClick, color,
  logo, autoLogo = true,
  padding = '4px 14px', inactiveBg = C.card,
}) {
  const bg     = active ? (color || C.accent) : inactiveBg;
  const col    = active ? '#000' : C.t2;
  const border = active ? (color || C.accent) : C.border;
  const src    = logo ?? (autoLogo ? COMP_LOGOS[label] : null);
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        padding, borderRadius: 20, border: `1px solid ${border}`,
        background: bg, color: col,
        fontSize: 10, fontWeight: active ? 700 : 500, cursor: 'pointer',
        letterSpacing: '0.5px', whiteSpace: 'nowrap', transition: 'all 0.12s ease',
        fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5,
      }}
    >
      {src && <img src={`/logos/${src}`} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />}
      {label}
    </button>
  );
}
