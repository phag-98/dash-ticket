// Shared team/championship logo + color data (no components — keeps fast-refresh happy)

export const COMP_LOGOS = {
  'Brasileirão':    'brasileirão_.png',
  'Carioca':        'Carioca.png',
  'Copa do Brasil': 'CopaDoBrasil.png',
  'Libertadores':   'Libertadores.png',
  'Sulamericana':   'sulamericana.png',
  'Recopa':         'Recopa.png',
};

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

export function getInitials(name) {
  return name.split(' ').filter(w => w.length > 2).slice(0, 2).map(w => w[0].toUpperCase()).join('')
    || name.slice(0, 2).toUpperCase();
}
