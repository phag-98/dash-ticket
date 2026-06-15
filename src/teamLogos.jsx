// Shared team logo components (data lives in ./teamData)
import { COMP_LOGOS, LOGO_MAP, TEAM_COLORS, getInitials } from './teamData';

// XAxis tick for vertical bar charts with campeonato on X (shows logo + short name)
export function CompXTick({ x, y, payload }) {
  const logo = COMP_LOGOS[payload.value];
  const size = 16;
  const label = payload.value.length > 10 ? payload.value.slice(0, 9) + '…' : payload.value;
  return (
    <g transform={`translate(${x},${y + 4})`}>
      {logo
        ? <image href={`/logos/${logo}`} x={-size / 2} y={0} width={size} height={size} />
        : <text x={0} y={size / 2} textAnchor="middle" fill="#666" fontSize={8}>{label}</text>
      }
      <text x={0} y={size + 6} textAnchor="middle" fill="#666" fontSize={7}>{label}</text>
    </g>
  );
}

// YAxis tick for horizontal bar charts with campeonato on Y (shows logo + name)
export function CompYTick({ x, y, payload }) {
  const logo = COMP_LOGOS[payload.value];
  const size = 14;
  const label = payload.value.length > 12 ? payload.value.slice(0, 11) + '…' : payload.value;
  return (
    <g transform={`translate(${x},${y})`}>
      {logo && <image href={`/logos/${logo}`} x={-size - 6} y={-size / 2} width={size} height={size} />}
      <text x={-size - 10} y={0} dy="0.35em" textAnchor="end" fill="#555" fontSize={9}>{label}</text>
    </g>
  );
}

export function TeamBadge({ name, size = 22 }) {
  const logo = LOGO_MAP[name];
  const bg = TEAM_COLORS[name] || '#555';
  if (logo) {
    return (
      <img
        src={`/logos/${logo}`}
        alt={name}
        style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }}
        onError={e => { e.target.style.display = 'none'; }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 800, color: '#fff',
      flexShrink: 0, letterSpacing: '-0.5px',
    }}>
      {getInitials(name)}
    </div>
  );
}

// Simple XAxis tick showing just a logo (for charts where dataKey is the team name directly)
export function TeamXTick({ x, y, payload, size = 18 }) {
  const name = payload.value;
  const logo = LOGO_MAP[name];
  const bg = TEAM_COLORS[name] || '#888';
  const half = size / 2;
  return (
    <g transform={`translate(${x},${y + 4})`}>
      {logo ? (
        <image href={`/logos/${logo}`} x={-half} y={0} width={size} height={size} />
      ) : (
        <foreignObject x={-half} y={0} width={size} height={size}>
          <div style={{ width: size, height: size, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 800, color: '#fff' }}>
            {getInitials(name)}
          </div>
        </foreignObject>
      )}
    </g>
  );
}

// YAxis tick for horizontal bar charts (logo + team name)
export function TeamYTick({ x, y, payload, fill = '#555', fontSize = 9 }) {
  const name = payload.value;
  const logo = LOGO_MAP[name];
  const bg = TEAM_COLORS[name] || '#888';
  const size = 14;
  return (
    <g transform={`translate(${x},${y})`}>
      {logo ? (
        <image href={`/logos/${logo}`} x={-size - 6} y={-size / 2} width={size} height={size} />
      ) : (
        <foreignObject x={-size - 6} y={-size / 2} width={size} height={size}>
          <div style={{ width: size, height: size, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6, fontWeight: 800, color: '#fff' }}>
            {getInitials(name)}
          </div>
        </foreignObject>
      )}
      <text x={-size - 10} y={0} dy="0.35em" textAnchor="end" fill={fill} fontSize={fontSize}>
        {name.length > 14 ? name.slice(0, 13) + '…' : name}
      </text>
    </g>
  );
}
