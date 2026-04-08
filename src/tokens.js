// ═══════════════════════════════════════
// DESIGN TOKENS — The Prestige Athletic Standard
// Dark Theme: Monolithic Authority × Gilded Precision
// ═══════════════════════════════════════

export const C = {
  // ── Surfaces (dark, layered) ──
  surface:                 '#050505',   // Base page background
  surfaceContainerLow:     '#0A0A0A',   // Sidebar
  surfaceContainerLowest:  '#0F0F0F',   // Cards
  surfaceContainer:        '#141414',   // Mid-level containers
  surfaceContainerHigh:    '#1A1A1A',   // Secondary button backgrounds
  surfaceContainerHighest: '#222222',   // Unselected chips
  surfaceVariant:          '#ffffff0d', // Hover backgrounds (white/5)
  inverseSurface:          '#F5F2EF',   // Light element on dark

  // ── On-Surface Text ──
  onSurface:        '#ffffff',             // Primary text
  onSurfaceVariant: 'rgba(255,255,255,0.55)', // Secondary text

  // ── Primary — Gilded Gold ──
  primary:          '#8E6D2F',
  primaryContainer: '#C5A059',
  onPrimary:        '#000000',
  primaryFixed:     '#C5A059',            // Active chip / icon bg
  onPrimaryFixed:   '#000000',
  primaryGradient:  'linear-gradient(135deg, #C5A059 0%, #8E6D2F 100%)',

  // ── Secondary / Neutral ──
  secondary:        'rgba(255,255,255,0.35)',
  outlineVariant:   'rgba(255,255,255,0.08)',

  // ── Legacy aliases (pages reference these directly) ──
  bg:        '#050505',
  bgAlt:     '#0A0A0A',
  card:      '#0F0F0F',
  cardHover: '#141414',
  border:    'rgba(255,255,255,0.06)',
  borderMid: 'rgba(255,255,255,0.12)',
  header:    '#0A0A0A',
  accent:    '#C5A059',
  accentDim: '#8E6D2F',
  accentBg:  'rgba(197,160,89,0.12)',

  // ── Text aliases ──
  t1: '#ffffff',
  t2: 'rgba(255,255,255,0.55)',
  t3: 'rgba(255,255,255,0.3)',

  // ── Campeonatos ──
  bra: '#86efac',   // Brasileirão — verde
  car: '#fca5a5',   // Carioca — vermelho
  cob: '#93c5fd',   // Copa do Brasil — azul
  lib: '#c4b5fd',   // Libertadores — roxo
  rec: '#fdba74',   // Recopa — laranja

  // ── Setores ──
  lesteInf:   '#C5A059',
  lesteSup:   '#94a3b8',
  maracana:   '#67e8f9',
  norte:      '#7dd3fc',
  oesteInf:   '#9ca3af',
  oesteSup:   '#6b7280',
  sul:        '#818cf8',
  ticketLine: '#C5A059',

  // ── Data series: year comparison ──
  year2024: '#7c7c94',   // Muted purple-gray (2024 bars)
  year2025: '#C5A059',   // Gold (2025 bars = current)

  // ── Semântico ──
  green:   '#4ade80',
  greenBg: 'rgba(74,222,128,0.1)',
  red:     '#f87171',
  redBg:   'rgba(248,113,113,0.1)',
  amber:   '#C5A059',
  amberBg: 'rgba(197,160,89,0.1)',
};

// Typography — Space Grotesk (editorial) × Inter (technical)
export const FONT_DISPLAY = "'Space Grotesk', 'Inter', sans-serif";
export const FONT_UI      = "'Inter', 'Segoe UI', -apple-system, sans-serif";
export const FONT         = "'Space Grotesk', 'Georgia', serif"; // legacy alias

// Elevation — Ambient (dark-tinted, no pure black)
export const SHADOW = {
  card:    '0 2px 24px rgba(0,0,0,0.4)',
  md:      '0 4px 32px rgba(0,0,0,0.5)',
  lg:      '0 8px 40px rgba(0,0,0,0.6)',
  ambient: '0 4px 24px rgba(0,0,0,0.35)',
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
