// ═══════════════════════════════════════
// MOCK DATA — Financial Dashboard MVP
// Empresa: Grupo Meridian S.A.
// Período base: Jan–Dez 2025 (acum. até Jun)
// ═══════════════════════════════════════

// KPIs do período acumulado (Jan–Jun 2025)
export const KPI_DATA = {
  receita:       { real: 42_340_000, budget: 48_600_000, ly: 37_800_000 },
  ebitda_pct:    { real: 28.1,       budget: 29.3,       ly: 26.4 },
  lucro_liquido: { real: 8_720_000,  budget: 9_400_000,  ly: 7_910_000 },
  caixa:         { real: 15_080_000, budget: 14_200_000, ly: 12_300_000 },
};

// Série mensal — 12 meses (Jan–Dez 2025)
export const SERIES_MENSAL = [
  { mes: 'Jan', real: 6_100_000, budget: 7_200_000, forecast: 6_100_000, ly: 5_400_000 },
  { mes: 'Fev', real: 6_800_000, budget: 7_500_000, forecast: 6_800_000, ly: 5_900_000 },
  { mes: 'Mar', real: 7_200_000, budget: 8_100_000, forecast: 7_200_000, ly: 6_300_000 },
  { mes: 'Abr', real: 7_640_000, budget: 8_400_000, forecast: 7_640_000, ly: 6_800_000 },
  { mes: 'Mai', real: 7_400_000, budget: 8_700_000, forecast: 7_400_000, ly: 6_600_000 },
  { mes: 'Jun', real: 7_200_000, budget: 8_700_000, forecast: 7_200_000, ly: 6_800_000 },
  // Forecast only (Jul–Dez)
  { mes: 'Jul', real: null, budget: 9_200_000, forecast: 8_600_000, ly: 7_100_000 },
  { mes: 'Ago', real: null, budget: 9_500_000, forecast: 8_900_000, ly: 7_400_000 },
  { mes: 'Set', real: null, budget: 9_800_000, forecast: 9_100_000, ly: 7_700_000 },
  { mes: 'Out', real: null, budget: 10_100_000, forecast: 9_400_000, ly: 8_000_000 },
  { mes: 'Nov', real: null, budget: 10_400_000, forecast: 9_700_000, ly: 8_200_000 },
  { mes: 'Dez', real: null, budget: 10_900_000, forecast: 10_200_000, ly: 8_600_000 },
];

// Waterfall EBITDA — Jan–Jun 2025 acumulado
export const WATERFALL = [
  { name: 'Receita Bruta',   value: 42_340_000,   type: 'total' },
  { name: 'Deduções',        value: -4_800_000,   type: 'negative' },
  { name: 'Receita Líq.',    value: 37_540_000,   type: 'subtotal' },
  { name: 'CPV',             value: -18_200_000,  type: 'negative' },
  { name: 'Lucro Bruto',     value: 19_340_000,   type: 'subtotal' },
  { name: 'Vendas & Mktg',   value: -4_600_000,   type: 'negative' },
  { name: 'G&A',             value: -3_200_000,   type: 'negative' },
  { name: 'P&D',             value: -2_640_000,   type: 'negative' },
  { name: 'Outros',          value: -720_000,     type: 'negative' },
  { name: 'EBITDA',          value: 8_180_000,    type: 'total' },
];

// DRE resumida
export const DRE = [
  { conta: 'Receita Bruta',   real: 42_340_000,  budget: 48_600_000 },
  { conta: '(-) Deduções',    real: -4_800_000,  budget: -5_200_000 },
  { conta: 'Receita Líq.',    real: 37_540_000,  budget: 43_400_000 },
  { conta: '(-) CPV',         real: -18_200_000, budget: -20_100_000 },
  { conta: 'Lucro Bruto',     real: 19_340_000,  budget: 23_300_000 },
  { conta: '(-) Vendas',      real: -4_600_000,  budget: -4_800_000 },
  { conta: '(-) G&A',         real: -3_200_000,  budget: -3_400_000 },
  { conta: '(-) P&D',         real: -2_640_000,  budget: -2_900_000 },
  { conta: 'EBITDA',          real: 8_180_000,   budget: 11_900_000 },
  { conta: '(-) D&A',         real: -1_800_000,  budget: -1_900_000 },
  { conta: 'EBIT',            real: 6_380_000,   budget: 10_000_000 },
  { conta: 'Res. Financeiro', real: -820_000,    budget: -700_000 },
  { conta: '(-) IR/CS',       real: -1_840_000,  budget: -2_200_000 },
  { conta: 'Lucro Líquido',   real: 8_720_000,   budget: 9_400_000 },
];

// Top variações (positivas e negativas)
export const VARIACOES = [
  { item: 'Produto B',     variacao: -18.2, valor: -5_200_000, direcao: 'down' },
  { item: 'G&A',           variacao: -6.4,  valor: -220_000,   direcao: 'down' },
  { item: 'Receita Total', variacao: -12.9, valor: -6_260_000, direcao: 'down' },
  { item: 'CPV',           variacao: +9.5,  valor: +1_900_000, direcao: 'up' },
  { item: 'Produto A',     variacao: -5.7,  valor: -1_100_000, direcao: 'down' },
];

// Alertas
export const ALERTAS = [
  {
    nivel: 'red',
    titulo: 'Receita Produto B',
    desc: '-18% vs Budget acumulado',
    detalhe: 'R$ 5,2M abaixo do planejado',
  },
  {
    nivel: 'red',
    titulo: 'Margem Bruta',
    desc: '51.5% vs 47.9% meta',
    detalhe: 'Abaixo do piso definido (50%)',
  },
  {
    nivel: 'amber',
    titulo: 'G&A',
    desc: '+6,4% vs Budget',
    detalhe: 'Dentro da tolerância de 10%',
  },
  {
    nivel: 'amber',
    titulo: 'CPV',
    desc: '+9,5% acima do planejado',
    detalhe: 'Pressão em matéria-prima (+12%)',
  },
  {
    nivel: 'green',
    titulo: 'Caixa',
    desc: '+6,2% vs Budget',
    detalhe: 'R$ 15,1M — melhor que o plano',
  },
  {
    nivel: 'green',
    titulo: 'EBITDA Margem',
    desc: '28,1% vs 29,3% budget',
    detalhe: '-1,2pp — dentro da tolerância',
  },
];

// Bullet chart — UNs vs meta
export const BULLET_UNs = [
  { un: 'UN Sul',     real: 89, meta: 100, min: 70 },
  { un: 'UN Norte',   real: 72, meta: 100, min: 70 },
  { un: 'UN Centro',  real: 103, meta: 100, min: 70 },
  { un: 'UN Leste',   real: 94, meta: 100, min: 70 },
  { un: 'Exportação', real: 67, meta: 100, min: 70 },
];
