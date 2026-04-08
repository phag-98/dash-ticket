// ═══════════════════════════════════════
// DESIGN TOKENS — The Prestige Athletic Standard
// "The Elite Performance Journal"
// Monolithic Authority × Gilded Precision
// ═══════════════════════════════════════

export const C = {
  // ── Surface Hierarchy (no borders — use tonal shifts) ──
  surface:                 '#fcf9f8',   // Level 0 — Base page background
  surfaceContainerLow:     '#f6f3f2',   // Level 1 — Sections / page regions
  surfaceContainerLowest:  '#ffffff',   // Level 2 — Cards / data containers
  surfaceContainer:        '#ede9e7',   // Mid-level containers
  surfaceContainerHigh:    '#e7e3e1',   // Secondary button backgrounds
  surfaceContainerHighest: '#e1dddb',   // Unselected chips
  surfaceVariant:          '#eae5e3',   // Hover backgrounds for tertiary elements
  inverseSurface:          '#313030',   // Header, overlays, dark elements

  // ── On-Surface Text ──
  onSurface:        '#1c1b1b',   // Primary text
  onSurfaceVariant: '#4f4b47',   // Secondary text / labels

  // ── Primary — Gilded Gold ──
  primary:          '#775a08',
  primaryContainer: '#c5a14d',
  onPrimary:        '#ffffff',
  primaryFixed:     '#ffdf9b',   // Selected chip backgrounds
  onPrimaryFixed:   '#251a00',   // Text on selected chips
  primaryGradient:  'linear-gradient(135deg, #775a08, #c5a14d)',

  // ── Secondary — Technical Grayscale ──
  secondary:        '#5e5e5e',
  outlineVariant:   '#d0c5b2',   // Ghost borders at 15% opacity only

  // ── Legacy aliases (pages reference these) ──
  bg:        '#fcf9f8',
  bgAlt:     '#f6f3f2',
  card:      '#ffffff',
  cardHover: '#f6f3f2',
  border:    'rgba(208,197,178,0.15)',  // Ghost border — felt, not seen
  borderMid: '#d0c5b2',
  header:    '#313030',
  accent:    '#c5a14d',
  accentDim: '#775a08',
  accentBg:  'rgba(119,90,8,0.08)',

  // ── Text aliases ──
  t1: '#1c1b1b',   // Primary — near black
  t2: '#4f4b47',   // Secondary — warm gray
  t3: '#5e5e5e',   // Tertiary — muted

  // ── Campeonatos ──
  bra: '#7db87d',   // Brasileirão — verde médio
  car: '#c97b7b',   // Carioca — vermelho médio
  cob: '#7da8c9',   // Copa do Brasil — azul médio
  lib: '#9e8fba',   // Libertadores — roxo médio
  rec: '#c9a07a',   // Recopa — laranja médio

  // ── Setores ──
  lesteInf:   '#c5a14d',   // Leste Inferior — dourado
  lesteSup:   '#8a9aa8',   // Leste Superior — cinza azulado
  maracana:   '#5b9eac',   // Maracanã Mais — teal suave
  norte:      '#7ab0c4',   // Norte — azul claro
  oesteInf:   '#555555',   // Oeste Inferior — cinza escuro
  oesteSup:   '#9a9a9a',   // Oeste Superior — cinza médio
  sul:        '#4a5f8a',   // Sul — azul escuro suave
  ticketLine: '#c5a14d',   // Linha Ticket Médio — dourado

  // ── Semântico ──
  green:   '#2d7d32',
  greenBg: 'rgba(45,125,50,0.08)',
  red:     '#c0392b',
  redBg:   'rgba(192,57,43,0.08)',
  amber:   '#c5a14d',
  amberBg: 'rgba(197,161,77,0.08)',
};

// Typography — Space Grotesk (editorial) × Inter (technical)
export const FONT_DISPLAY = "'Space Grotesk', 'Inter', sans-serif";
export const FONT_UI      = "'Inter', 'Segoe UI', -apple-system, sans-serif";
export const FONT         = "'Space Grotesk', 'Georgia', serif"; // legacy alias

// Elevation — Ambient only (no dirty black shadows)
export const SHADOW = {
  card:    '0 2px 24px rgba(28,27,27,0.05)',
  md:      '0 4px 32px rgba(28,27,27,0.06)',
  lg:      '0 8px 40px rgba(28,27,27,0.06)',
  ambient: '0 4px 24px rgba(28,27,27,0.04)',
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
