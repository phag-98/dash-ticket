// ═══════════════════════════════════════
// DESIGN TOKENS — The Prestige Athletic Standard
// Light Theme: Clean Authority × Gilded Precision
// ═══════════════════════════════════════

export const C = {
  // ── Surface Hierarchy (light, minimal) ──
  surface:                 '#F8FAFC',   // slate-50 — page background
  surfaceContainerLow:     '#ffffff',   // sidebar
  surfaceContainerLowest:  '#ffffff',   // cards
  surfaceContainer:        '#F1F5F9',   // inputs, containers (slate-100)
  surfaceContainerHigh:    '#E2E8F0',   // secondary buttons (slate-200)
  surfaceContainerHighest: '#CBD5E1',   // unselected chips (slate-300)
  surfaceVariant:          '#F8FAFC',   // hover backgrounds
  inverseSurface:          '#0F172A',   // dark element on light

  // ── On-Surface Text ──
  onSurface:        '#0F172A',   // slate-900
  onSurfaceVariant: '#475569',   // slate-600

  // ── Primary — Gilded Gold ──
  primary:          '#8E6D2F',
  primaryContainer: '#C5A059',
  onPrimary:        '#ffffff',
  primaryFixed:     '#C5A059',
  onPrimaryFixed:   '#ffffff',
  primaryGradient:  'linear-gradient(135deg, #C5A059 0%, #8E6D2F 100%)',

  // ── Secondary / Neutral ──
  secondary:        '#64748b',   // slate-500
  outlineVariant:   '#e2e8f0',   // slate-200

  // ── Legacy aliases ──
  bg:        '#F8FAFC',
  bgAlt:     '#F1F5F9',
  card:      '#ffffff',
  cardHover: '#F8FAFC',
  border:    '#e2e8f0',   // slate-200
  borderMid: '#cbd5e1',   // slate-300
  header:    '#ffffff',
  accent:    '#C5A059',
  accentDim: '#8E6D2F',
  accentBg:  'rgba(197,160,89,0.1)',

  // ── Text aliases ──
  t1: '#0F172A',   // slate-900
  t2: '#475569',   // slate-600
  t3: '#94a3b8',   // slate-400

  // ── Campeonatos ──
  bra: '#16a34a',   // green-600
  car: '#dc2626',   // red-600
  cob: '#2563eb',   // blue-600
  lib: '#7c3aed',   // violet-600
  rec: '#ea580c',   // orange-600

  // ── Setores ──
  lesteInf:   '#C5A059',
  lesteSup:   '#64748b',
  maracana:   '#0891b2',
  norte:      '#0284c7',
  oesteInf:   '#374151',
  oesteSup:   '#6b7280',
  sul:        '#4338ca',
  ticketLine: '#C5A059',

  // ── Data series: year comparison ──
  year2024: '#94a3b8',   // slate-400 (muted, 2024)
  year2025: '#C5A059',   // gold (2025)
  year2026: '#0284c7',   // sky-600 (2026 = current)

  // ── Semântico ──
  green:   '#16a34a',
  greenBg: 'rgba(22,163,74,0.08)',
  red:     '#dc2626',
  redBg:   'rgba(220,38,38,0.08)',
  amber:   '#C5A059',
  amberBg: 'rgba(197,160,89,0.1)',
};

// Typography — Space Grotesk (editorial) × Inter (technical)
export const FONT_DISPLAY = "'Space Grotesk', 'Inter', sans-serif";
export const FONT_UI      = "'Inter', 'Segoe UI', -apple-system, sans-serif";
export const FONT         = "'Space Grotesk', 'Georgia', serif"; // legacy alias

// Elevation — subtle ambient shadows
export const SHADOW = {
  card:    '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  md:      '0 4px 16px rgba(0,0,0,0.08)',
  lg:      '0 8px 32px rgba(0,0,0,0.1)',
  ambient: '0 4px 24px rgba(0,0,0,0.06)',
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
