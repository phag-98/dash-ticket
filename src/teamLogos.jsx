// Shared team logo utilities

export const COMP_LOGOS = {
  'Brasileirão':    'brasileirão_.png',
  'Carioca':        'Carioca.png',
  'Copa do Brasil': 'CopaDoBrasil.png',
  'Libertadores':   'Libertadores.png',
  'Sulamericana':   'sulamericana.png',
};

// XAxis tick for vertical bar charts with campeonato on X (shows logo + short name)
export function CompXTick({ x, y, payload }) {
  const logo = COMP_LOGOS[payload.value];
  const size = 16;
  const label = payload.value.length > 10 ? payload.value.slice(0, 9) + '…' : payload.value;
  return (
    <g transform={`translate(${x},${y + 4})`}>
      {logo
        ? <image href={`/logos/${logo}`} x={-size / 2} y={0} width={size} height={size} />
        : <text x={0} y={size / 2} textAnchor="middle" fill="#999" fontSize={8}>{label}</text>
      }
      <text x={0} y={size + 6} textAnchor="middle" fill="#aaa" fontSize={7}>{label}</text>
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

export const LOGO_MAP = {
  'Flamengo':              'Flamengo.png',
  'Fluminense':            'Fluminense.png',
  'Vasco da Gama':         'Vasco.png',
  'Palmeiras':             'Palmeiras.png',
  'São Paulo':             'Sao Paulo.png',
  'Corinthians':           'Corinthians.png',
  'Red Bull Bragantino':   'RedBullBragantino.png',
  'Internacional':         'Internacional.png',
  'Athlético':             'Athletico.png',
  'Atlético-MG':           'Atletico mineiro.png',
  'Cruzeiro':              'Cruzeiro.png',
  'Atlético-GO':           'Atlético Goianiense.png',
  'Bahia':                 'Bahia.png',
  'Fortaleza':             'Fortaleza.png',
  'Vitória':               'Vitória.png',
  'Ceará':                 'Ceará.png',
  'Cuiabá':                'Cuiabá.png',
  'Criciúma':              'Criciúma.png',
  'Mirassol':              'Mirassol.png',
  'Juventude':             'Juventude.png',
  'Grêmio':                'Gremio.png',
  'Volta Redonda':         'Volta Redonda.png',
  'Bangu':                 'Bangu.png',
  'Maricá':                'Maricá.png',
  'Madureira':             'Madureira.png',
  'LDU Quito':             'LDU Quito.png',
  'Universitario':         'Universitario.png',
  'Peñarol':               'Peñarol.png',
  'Aurora':                'Aurora.png',
  'Junior de Barranquilla':'Junior Barranquilla.png',
  'Boavista':              'Boavista.png',
  'Capital':               'Capital.png',
  'Carabobo':              'Carabobo.png',
  'Estudiantes':           'Estudiantes de la Plata.png',
  'Portuguesa':            'Portuguesa.png',
  'Racing':                'Racing.png',
  'Sampaio Corrêa':        'Sampaio Corrêa.png',
  'Universidad de Chile':  'Universidad de Chile.png',
};

export const TEAM_COLORS = {
  'Flamengo': '#cc0000', 'Fluminense': '#6b0f1a', 'Vasco da Gama': '#000000',
  'Palmeiras': '#006400', 'São Paulo': '#cc0000', 'Corinthians': '#000000',
  'Red Bull Bragantino': '#cc0000', 'Internacional': '#cc0000', 'Athlético': '#cc0000',
  'Atlético-MG': '#000000', 'Cruzeiro': '#003087', 'Atlético-GO': '#cc0000',
  'Bahia': '#003087', 'Fortaleza': '#003087', 'Vitória': '#cc0000',
  'Ceará': '#000000', 'Cuiabá': '#cc8800', 'Criciúma': '#cc8800',
  'Mirassol': '#cc8800', 'Juventude': '#006400', 'Grêmio': '#003087',
  'Peñarol': '#cc8800', 'Racing': '#003087', 'LDU Quito': '#cc8800',
  'Universitario': '#cc0000', 'Estudiantes': '#000000', 'Universidad de Chile': '#003087',
  'Junior de Barranquilla': '#cc0000', 'Aurora': '#006400',
  'Volta Redonda': '#cc0000', 'Bangu': '#006400', 'Maricá': '#0044cc',
  'Madureira': '#cc8800', 'Boavista': '#cc0000', 'Capital': '#003087',
  'Carabobo': '#cc0000', 'Portuguesa': '#cc0000', 'Sampaio Corrêa': '#cc0000',
};

function getInitials(name) {
  return name.split(' ').filter(w => w.length > 2).slice(0, 2).map(w => w[0].toUpperCase()).join('')
    || name.slice(0, 2).toUpperCase();
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
