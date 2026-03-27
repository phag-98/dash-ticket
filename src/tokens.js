// ═══════════════════════════════════════
// DESIGN TOKENS — Botafogo Ticket Dashboard
// Tema escuro com cores do Botafogo
// ═══════════════════════════════════════

export const C = {
  // Base — cinza claro / tema claro
  bg:        '#efefef',
  bgAlt:     '#e6e6e6',
  card:      '#ffffff',
  cardHover: '#f7f7f7',
  border:    '#d8d8d8',
  borderMid: '#c8c8c8',

  // Header/nav
  header:    '#1a1a1a',

  // Botafogo accent — dourado quente
  accent:    '#C9A84C',
  accentDim: '#8f7330',
  accentBg:  'rgba(201,168,76,0.12)',

  // Text
  t1:        '#1a1a1a',   // quase preto
  t2:        '#555555',   // cinza médio
  t3:        '#999999',   // cinza claro

  // Campeonatos
  bra:       '#7db87d',   // Brasileirão — verde médio
  car:       '#c97b7b',   // Carioca — vermelho médio
  cob:       '#7da8c9',   // Copa do Brasil — azul médio
  lib:       '#9e8fba',   // Libertadores — roxo médio
  rec:       '#c9a07a',   // Recopa — laranja médio

  // Setores
  lesteInf:  '#C9A84C',   // Leste Inferior — dourado
  lesteSup:  '#8a9aa8',   // Leste Superior — cinza azulado
  maracana:  '#5b9eac',   // Maracanã Mais — teal suave
  norte:     '#7ab0c4',   // Norte — azul claro
  oesteInf:  '#555555',   // Oeste Inferior — cinza escuro
  oesteSup:  '#9a9a9a',   // Oeste Superior — cinza médio
  sul:       '#4a5f8a',   // Sul — azul escuro suave
  ticketLine:'#c9a84c',   // Linha Ticket Médio — dourado

  // Semântico
  green:     '#3a8a3a',
  greenBg:   'rgba(58,138,58,0.10)',
  red:       '#c0392b',
  redBg:     'rgba(192,57,43,0.10)',
  amber:     '#C9A84C',
  amberBg:   'rgba(201,168,76,0.12)',
};

export const FONT = "'Georgia', 'Times New Roman', serif";
export const FONT_UI = "'Inter', 'Segoe UI', -apple-system, sans-serif";

export const SHADOW = {
  card: '0 2px 8px rgba(0,0,0,0.4)',
  md:   '0 4px 16px rgba(0,0,0,0.5)',
  lg:   '0 8px 32px rgba(0,0,0,0.6)',
};

export const SETOR_COLORS = {
  'Leste Inferior': C.lesteInf,
  'Leste Superior': C.lesteSup,
  'Maracanã Mais':  C.maracana,
  'Norte':          C.norte,
  'Oeste Inferior': C.oesteInf,
  'Oeste Superior': C.oesteSup,
  'Sul':            C.sul,
};

export const CAMP_COLORS = {
  'Brasileirão':    C.bra,
  'Carioca':        C.car,
  'Copa do Brasil': C.cob,
  'Libertadores':   C.lib,
  'Recopa':         C.rec,
};
