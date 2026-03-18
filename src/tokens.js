// ═══════════════════════════════════════
// DESIGN TOKENS — Botafogo Ticket Dashboard
// Tema escuro com cores do Botafogo
// ═══════════════════════════════════════

export const C = {
  // Base — fundo escuro
  bg:        '#0d0d14',
  bgAlt:     '#111118',
  card:      '#16161f',
  cardHover: '#1c1c28',
  border:    '#252533',
  borderMid: '#2e2e3e',

  // Header/nav
  header:    '#0a0a11',

  // Botafogo accent — verde-amarelo estrela
  accent:    '#C8F400',
  accentDim: '#8eb000',
  accentBg:  'rgba(200,244,0,0.08)',

  // Text
  t1:        '#f0f0f8',
  t2:        '#94a3b8',
  t3:        '#555566',

  // Campeonatos
  bra:       '#4ade80',   // Brasileirão — verde
  car:       '#f87171',   // Carioca — vermelho
  cob:       '#60a5fa',   // Copa do Brasil — azul
  lib:       '#a78bfa',   // Libertadores — roxo
  rec:       '#fb923c',   // Recopa — laranja

  // Setores
  lesteInf:  '#FFD700',   // Leste Inferior — amarelo
  lesteSup:  '#94a3b8',   // Leste Superior — cinza
  maracana:  '#00bcd4',   // Maracanã Mais — teal
  norte:     '#87ceeb',   // Norte — azul claro
  oesteInf:  '#444455',   // Oeste Inferior — escuro
  oesteSup:  '#b0b0c0',   // Oeste Superior — cinza claro
  sul:       '#1a237e',   // Sul — azul escuro
  ticketLine:'#ff6b35',   // Linha Ticket Médio

  // Semântico
  green:     '#4ade80',
  greenBg:   'rgba(74,222,128,0.12)',
  red:       '#f87171',
  redBg:     'rgba(248,113,113,0.12)',
  amber:     '#fbbf24',
  amberBg:   'rgba(251,191,36,0.12)',
};

export const FONT = "'Inter', 'Segoe UI', -apple-system, sans-serif";

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
