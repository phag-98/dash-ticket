// ═══════════════════════════════════════════════════════════════════
// MOCK DATA — Botafogo Ticket Dashboard
// Baseado na estrutura: dCampeonatos, dEstadios, dPartidas, dSetores,
//                       dTimes, dTorcedores, fIngressos
// ═══════════════════════════════════════════════════════════════════

export const CAMPEONATOS = ['Brasileirão','Carioca','Copa do Brasil','Libertadores','Recopa'];

export const SETORES = [
  { id:'SETLIS', nome:'Leste Inferior',  capacidade:11_000, unitario_base:30 },
  { id:'SETLSS', nome:'Leste Superior',  capacidade:11_200, unitario_base:28 },
  { id:'SETMM',  nome:'Maracanã Mais',   capacidade: 2_000, unitario_base:350 },
  { id:'SETNO',  nome:'Norte',           capacidade: 5_500, unitario_base:25 },
  { id:'SETOEI', nome:'Oeste Inferior',  capacidade:10_800, unitario_base:30 },
  { id:'SETOSY', nome:'Oeste Superior',  capacidade:11_000, unitario_base:28 },
  { id:'SETSU',  nome:'Sul',             capacidade: 4_500, unitario_base:80 },
];

export const TIPOS_INGRESSO = [
  { id:'ALV', nome:'Alvinegro',           is_socio:true },
  { id:'MEI', nome:'Meia',                is_socio:false },
  { id:'GLO', nome:'Glorioso',            is_socio:true },
  { id:'INT', nome:'Inteira',             is_socio:false },
  { id:'PRE', nome:'Preto',               is_socio:true },
  { id:'G60', nome:'Glorioso 60%',        is_socio:true },
  { id:'BRA', nome:'Branco',              is_socio:true },
  { id:'GRA', nome:'Gratuidade',          is_socio:false },
  { id:'AOF', nome:'Alvinegro OFF',       is_socio:false },
  { id:'SVI', nome:'Sócio Visitante',     is_socio:false },
  { id:'FGL', nome:'Funcionário Glorioso',is_socio:false },
  { id:'IPR', nome:'Ingresso Prom.',      is_socio:false },
  { id:'COR', nome:'Cortesia',            is_socio:false },
];

// ─── Partidas (64 partidas) ──────────────────────────────────────
export const PARTIDAS = [
  // ── CARIOCA 2024 ──
  { id:'2024.01.21-CAR-1',   data:'21/01/2024', rodada:'1',      horario:'16:00', dia_semana:'Domingo',      campeonato:'Carioca',        adversario:'Madureira',              publico: 8_200, faturamento:  175_000, ticket_medio:21.34, socios_pct:0.58, no_show_pct:0.14, ano:2024 },
  { id:'2024.01.28-CAR-2',   data:'28/01/2024', rodada:'2',      horario:'16:00', dia_semana:'Domingo',      campeonato:'Carioca',        adversario:'Bangú',                  publico: 6_100, faturamento:  125_000, ticket_medio:20.49, socios_pct:0.60, no_show_pct:0.15, ano:2024 },
  { id:'2024.02.04-CAR-3',   data:'04/02/2024', rodada:'3',      horario:'16:00', dia_semana:'Domingo',      campeonato:'Carioca',        adversario:'Portuguesa',             publico: 5_400, faturamento:  108_000, ticket_medio:20.00, socios_pct:0.62, no_show_pct:0.16, ano:2024 },
  { id:'2024.02.11-CAR-4',   data:'11/02/2024', rodada:'4',      horario:'18:00', dia_semana:'Domingo',      campeonato:'Carioca',        adversario:'Vasco da Gama',          publico:26_400, faturamento:  810_000, ticket_medio:30.68, socios_pct:0.64, no_show_pct:0.10, ano:2024 },
  { id:'2024.02.18-CAR-5',   data:'18/02/2024', rodada:'5',      horario:'18:00', dia_semana:'Domingo',      campeonato:'Carioca',        adversario:'Boavista',               publico: 5_600, faturamento:  115_000, ticket_medio:20.54, socios_pct:0.61, no_show_pct:0.16, ano:2024 },
  { id:'2024.02.25-CAR-6',   data:'25/02/2024', rodada:'6',      horario:'16:00', dia_semana:'Domingo',      campeonato:'Carioca',        adversario:'Nova Iguaçu',            publico: 9_200, faturamento:  220_000, ticket_medio:23.91, socios_pct:0.63, no_show_pct:0.13, ano:2024 },
  { id:'2024.03.03-CAR-SF',  data:'03/03/2024', rodada:'SEMI',   horario:'18:30', dia_semana:'Domingo',      campeonato:'Carioca',        adversario:'Fluminense',             publico:22_100, faturamento:  640_000, ticket_medio:28.96, socios_pct:0.66, no_show_pct:0.11, ano:2024 },
  { id:'2024.03.10-CAR-F',   data:'10/03/2024', rodada:'FINAL',  horario:'18:30', dia_semana:'Domingo',      campeonato:'Carioca',        adversario:'Flamengo',               publico:35_400, faturamento:1_050_000, ticket_medio:29.66, socios_pct:0.67, no_show_pct:0.08, ano:2024 },
  // ── LIBERTADORES 2024 ──
  { id:'2024.02.28-LIB-1',   data:'28/02/2024', rodada:'1',      horario:'21:30', dia_semana:'Quarta-feira', campeonato:'Libertadores',   adversario:'Aurora',                 publico:22_111, faturamento:  520_756, ticket_medio:23.54, socios_pct:0.65, no_show_pct:0.11, ano:2024 },
  { id:'2024.03.13-LIB-2',   data:'13/03/2024', rodada:'2',      horario:'21:30', dia_semana:'Quarta-feira', campeonato:'Libertadores',   adversario:'Red Bull Bragantino',    publico:32_755, faturamento:  929_807, ticket_medio:28.39, socios_pct:0.66, no_show_pct:0.09, ano:2024 },
  { id:'2024.04.03-LIB-FG',  data:'03/04/2024', rodada:'FG',     horario:'21:30', dia_semana:'Quarta-feira', campeonato:'Libertadores',   adversario:'Junior de Barranquilla', publico:27_600, faturamento:1_219_870, ticket_medio:44.20, socios_pct:0.66, no_show_pct:0.10, ano:2024 },
  { id:'2024.04.24-LIB-4',   data:'24/04/2024', rodada:'4',      horario:'21:30', dia_semana:'Quarta-feira', campeonato:'Libertadores',   adversario:'Universitário',          publico:25_911, faturamento:  624_311, ticket_medio:24.09, socios_pct:0.65, no_show_pct:0.10, ano:2024 },
  { id:'2024.05.15-LIB-5',   data:'15/05/2024', rodada:'5',      horario:'21:30', dia_semana:'Quarta-feira', campeonato:'Libertadores',   adversario:'Atlético-MG',            publico:28_400, faturamento:  887_000, ticket_medio:31.23, socios_pct:0.67, no_show_pct:0.09, ano:2024 },
  { id:'2024.05.29-LIB-6',   data:'29/05/2024', rodada:'6',      horario:'21:30', dia_semana:'Quarta-feira', campeonato:'Libertadores',   adversario:'Universidad de Chile',   publico:28_900, faturamento:1_290_339, ticket_medio:44.65, socios_pct:0.66, no_show_pct:0.09, ano:2024 },
  { id:'2024.06.11-LIB-OIT1',data:'11/06/2024', rodada:'OITAVAS',horario:'21:30', dia_semana:'Terça-feira',  campeonato:'Libertadores',   adversario:'LDU Quito',              publico:27_076, faturamento:1_377_314, ticket_medio:50.86, socios_pct:0.65, no_show_pct:0.10, ano:2024 },
  { id:'2024.08.14-LIB-OIT2',data:'14/08/2024', rodada:'OITAVAS',horario:'21:30', dia_semana:'Quarta-feira', campeonato:'Libertadores',   adversario:'Palmeiras',              publico:37_722, faturamento:1_538_353, ticket_medio:40.78, socios_pct:0.67, no_show_pct:0.07, ano:2024 },
  { id:'2024.09.18-LIB-QUA', data:'18/09/2024', rodada:'QUARTAS',horario:'21:30', dia_semana:'Quarta-feira', campeonato:'Libertadores',   adversario:'São Paulo',              publico:36_100, faturamento:2_249_745, ticket_medio:62.32, socios_pct:0.68, no_show_pct:0.07, ano:2024 },
  { id:'2024.10.23-LIB-SEMI',data:'23/10/2024', rodada:'SEMIS',  horario:'21:30', dia_semana:'Quarta-feira', campeonato:'Libertadores',   adversario:'Peñarol',                publico:38_200, faturamento:2_518_640, ticket_medio:65.93, socios_pct:0.68, no_show_pct:0.07, ano:2024 },
  // ── COPA DO BRASIL 2024 ──
  { id:'2024.05.02-COB-OIT1',data:'02/05/2024', rodada:'OITAVAS',horario:'20:00', dia_semana:'Quinta-feira', campeonato:'Copa do Brasil', adversario:'Vitória',                publico:19_991, faturamento:  360_864, ticket_medio:18.05, socios_pct:0.64, no_show_pct:0.12, ano:2024 },
  { id:'2024.05.08-COB-OIT2',data:'08/05/2024', rodada:'OITAVAS',horario:'21:30', dia_semana:'Quarta-feira', campeonato:'Copa do Brasil', adversario:'Athletico-PR',           publico:23_875, faturamento:  757_182, ticket_medio:31.72, socios_pct:0.65, no_show_pct:0.11, ano:2024 },
  { id:'2024.07.03-COB-QUA', data:'03/07/2024', rodada:'QUARTAS',horario:'21:30', dia_semana:'Quarta-feira', campeonato:'Copa do Brasil', adversario:'Vasco da Gama',          publico:31_800, faturamento:1_420_988, ticket_medio:44.69, socios_pct:0.66, no_show_pct:0.08, ano:2024 },
  { id:'2024.08.28-COB-SEMI',data:'28/08/2024', rodada:'SEMIS',  horario:'21:30', dia_semana:'Quarta-feira', campeonato:'Copa do Brasil', adversario:'Flamengo',               publico:38_900, faturamento:1_890_000, ticket_medio:48.59, socios_pct:0.68, no_show_pct:0.07, ano:2024 },
  { id:'2024.10.09-COB-FIN', data:'09/10/2024', rodada:'FINAL',  horario:'21:30', dia_semana:'Quarta-feira', campeonato:'Copa do Brasil', adversario:'Racing',                 publico:38_500, faturamento:1_775_203, ticket_medio:46.11, socios_pct:0.68, no_show_pct:0.07, ano:2024 },
  // ── BRASILEIRÃO 2024 ──
  { id:'2024.04.18-BRA-3',   data:'18/04/2024', rodada:'3',      horario:'19:00', dia_semana:'Quinta-feira', campeonato:'Brasileirão',    adversario:'Atlético-GO',            publico: 9_857, faturamento:   93_532, ticket_medio: 9.49, socios_pct:0.62, no_show_pct:0.18, ano:2024 },
  { id:'2024.04.21-BRA-4',   data:'21/04/2024', rodada:'4',      horario:'16:00', dia_semana:'Domingo',      campeonato:'Brasileirão',    adversario:'Juventude',              publico:13_964, faturamento:  152_876, ticket_medio:10.95, socios_pct:0.63, no_show_pct:0.17, ano:2024 },
  { id:'2024.05.12-BRA-6',   data:'12/05/2024', rodada:'6',      horario:'20:00', dia_semana:'Domingo',      campeonato:'Brasileirão',    adversario:'Fluminense',             publico:20_954, faturamento:  320_422, ticket_medio:15.29, socios_pct:0.65, no_show_pct:0.14, ano:2024 },
  { id:'2024.05.26-BRA-8',   data:'26/05/2024', rodada:'8',      horario:'20:00', dia_semana:'Domingo',      campeonato:'Brasileirão',    adversario:'Bahia',                  publico:18_700, faturamento:  285_000, ticket_medio:15.24, socios_pct:0.64, no_show_pct:0.14, ano:2024 },
  { id:'2024.06.15-BRA-9',   data:'15/06/2024', rodada:'9',      horario:'18:30', dia_semana:'Sábado',       campeonato:'Brasileirão',    adversario:'Vasco da Gama',          publico:29_500, faturamento:1_240_150, ticket_medio:42.04, socios_pct:0.67, no_show_pct:0.09, ano:2024 },
  { id:'2024.07.13-BRA-17',  data:'13/07/2024', rodada:'17',     horario:'18:30', dia_semana:'Sábado',       campeonato:'Brasileirão',    adversario:'Palmeiras',              publico:38_042, faturamento:1_662_134, ticket_medio:43.69, socios_pct:0.67, no_show_pct:0.07, ano:2024 },
  { id:'2024.07.20-BRA-18',  data:'20/07/2024', rodada:'18',     horario:'18:30', dia_semana:'Sábado',       campeonato:'Brasileirão',    adversario:'Internacional',          publico:29_878, faturamento:1_178_718, ticket_medio:39.45, socios_pct:0.67, no_show_pct:0.09, ano:2024 },
  { id:'2024.07.27-BRA-19',  data:'27/07/2024', rodada:'19',     horario:'18:30', dia_semana:'Sábado',       campeonato:'Brasileirão',    adversario:'Athletico-PR',           publico:22_100, faturamento:  480_000, ticket_medio:21.72, socios_pct:0.65, no_show_pct:0.12, ano:2024 },
  { id:'2024.08.03-BRA-20',  data:'03/08/2024', rodada:'20',     horario:'18:30', dia_semana:'Sábado',       campeonato:'Brasileirão',    adversario:'Cuiabá',                 publico:18_200, faturamento:  310_000, ticket_medio:17.03, socios_pct:0.64, no_show_pct:0.14, ano:2024 },
  { id:'2024.08.11-BRA-21',  data:'11/08/2024', rodada:'21',     horario:'18:30', dia_semana:'Domingo',      campeonato:'Brasileirão',    adversario:'Bahia',                  publico:33_092, faturamento:  395_160, ticket_medio:11.94, socios_pct:0.65, no_show_pct:0.10, ano:2024 },
  { id:'2024.08.25-BRA-23',  data:'25/08/2024', rodada:'23',     horario:'18:30', dia_semana:'Domingo',      campeonato:'Brasileirão',    adversario:'Flamengo',               publico:28_281, faturamento:1_090_352, ticket_medio:38.55, socios_pct:0.67, no_show_pct:0.09, ano:2024 },
  { id:'2024.09.01-BRA-24',  data:'01/09/2024', rodada:'24',     horario:'18:30', dia_semana:'Domingo',      campeonato:'Brasileirão',    adversario:'Fortaleza',              publico:32_071, faturamento:  132_880, ticket_medio: 4.14, socios_pct:0.66, no_show_pct:0.10, ano:2024 },
  { id:'2024.09.14-BRA-25',  data:'14/09/2024', rodada:'25',     horario:'18:30', dia_semana:'Sábado',       campeonato:'Brasileirão',    adversario:'Corinthians',            publico:29_681, faturamento:1_134_264, ticket_medio:38.21, socios_pct:0.67, no_show_pct:0.09, ano:2024 },
  { id:'2024.09.22-BRA-26',  data:'22/09/2024', rodada:'26',     horario:'18:30', dia_semana:'Domingo',      campeonato:'Brasileirão',    adversario:'Cruzeiro',               publico:26_500, faturamento:  690_000, ticket_medio:26.04, socios_pct:0.66, no_show_pct:0.10, ano:2024 },
  { id:'2024.10.05-BRA-28',  data:'05/10/2024', rodada:'28',     horario:'18:30', dia_semana:'Sábado',       campeonato:'Brasileirão',    adversario:'Grêmio',                 publico:24_300, faturamento:  560_000, ticket_medio:23.05, socios_pct:0.66, no_show_pct:0.11, ano:2024 },
  { id:'2024.10.19-BRA-30',  data:'19/10/2024', rodada:'30',     horario:'16:00', dia_semana:'Sábado',       campeonato:'Brasileirão',    adversario:'Criciúma',               publico:38_900, faturamento:2_713_996, ticket_medio:69.77, socios_pct:0.69, no_show_pct:0.07, ano:2024 },
  { id:'2024.10.26-BRA-31',  data:'26/10/2024', rodada:'31',     horario:'18:30', dia_semana:'Sábado',       campeonato:'Brasileirão',    adversario:'São Paulo',              publico:34_200, faturamento:1_180_000, ticket_medio:34.50, socios_pct:0.68, no_show_pct:0.08, ano:2024 },
  { id:'2024.11.06-BRA-32',  data:'06/11/2024', rodada:'32',     horario:'20:00', dia_semana:'Quarta-feira', campeonato:'Brasileirão',    adversario:'Vasco da Gama',          publico:32_800, faturamento:1_202_835, ticket_medio:36.67, socios_pct:0.67, no_show_pct:0.08, ano:2024 },
  { id:'2024.11.09-BRA-33',  data:'09/11/2024', rodada:'33',     horario:'18:30', dia_semana:'Sábado',       campeonato:'Brasileirão',    adversario:'Cuiabá',                 publico:37_700, faturamento:1_815_358, ticket_medio:48.15, socios_pct:0.68, no_show_pct:0.07, ano:2024 },
  { id:'2024.11.20-BRA-35',  data:'20/11/2024', rodada:'35',     horario:'18:30', dia_semana:'Quarta-feira', campeonato:'Brasileirão',    adversario:'Vitória',                publico:35_500, faturamento:1_286_476, ticket_medio:36.24, socios_pct:0.68, no_show_pct:0.07, ano:2024 },
  { id:'2024.11.27-BRA-36',  data:'27/11/2024', rodada:'36',     horario:'18:30', dia_semana:'Quarta-feira', campeonato:'Brasileirão',    adversario:'RB Bragantino',          publico:26_700, faturamento:  750_000, ticket_medio:28.09, socios_pct:0.66, no_show_pct:0.10, ano:2024 },
  { id:'2024.12.04-BRA-38',  data:'04/12/2024', rodada:'38',     horario:'21:30', dia_semana:'Quarta-feira', campeonato:'Brasileirão',    adversario:'São Paulo',              publico:36_800, faturamento:1_294_702, ticket_medio:35.18, socios_pct:0.67, no_show_pct:0.07, ano:2024 },
  // ── RECOPA 2025 ──
  { id:'2025.02.12-REC-IDA', data:'12/02/2025', rodada:'IDA',    horario:'21:30', dia_semana:'Quarta-feira', campeonato:'Recopa',          adversario:'Racing',                publico:36_200, faturamento:1_450_000, ticket_medio:40.06, socios_pct:0.67, no_show_pct:0.08, ano:2025 },
  { id:'2025.02.19-REC-VLT', data:'19/02/2025', rodada:'VOLTA',  horario:'21:30', dia_semana:'Quarta-feira', campeonato:'Recopa',          adversario:'Racing',                publico:37_800, faturamento:1_580_000, ticket_medio:41.80, socios_pct:0.68, no_show_pct:0.07, ano:2025 },
  // ── CARIOCA 2025 ──
  { id:'2025.01.18-CAR5-1',  data:'18/01/2025', rodada:'1',      horario:'16:00', dia_semana:'Sábado',       campeonato:'Carioca',         adversario:'Madureira',             publico: 9_100, faturamento:  210_000, ticket_medio:23.08, socios_pct:0.60, no_show_pct:0.14, ano:2025 },
  { id:'2025.01.25-CAR5-2',  data:'25/01/2025', rodada:'2',      horario:'18:00', dia_semana:'Sábado',       campeonato:'Carioca',         adversario:'Sampaio Corrêa',        publico: 7_200, faturamento:  165_000, ticket_medio:22.92, socios_pct:0.61, no_show_pct:0.15, ano:2025 },
  { id:'2025.02.01-CAR5-3',  data:'01/02/2025', rodada:'3',      horario:'18:00', dia_semana:'Sábado',       campeonato:'Carioca',         adversario:'Boavista',              publico: 6_500, faturamento:  148_000, ticket_medio:22.77, socios_pct:0.62, no_show_pct:0.16, ano:2025 },
  { id:'2025.02.09-CAR5-4',  data:'09/02/2025', rodada:'4',      horario:'18:30', dia_semana:'Domingo',      campeonato:'Carioca',         adversario:'Vasco da Gama',         publico:28_500, faturamento:  920_000, ticket_medio:32.28, socios_pct:0.65, no_show_pct:0.10, ano:2025 },
  { id:'2025.02.16-CAR5-5',  data:'16/02/2025', rodada:'5',      horario:'18:00', dia_semana:'Domingo',      campeonato:'Carioca',         adversario:'Nova Iguaçu',           publico:10_400, faturamento:  255_000, ticket_medio:24.52, socios_pct:0.63, no_show_pct:0.13, ano:2025 },
  { id:'2025.03.02-CAR5-SF', data:'02/03/2025', rodada:'SEMI',   horario:'18:30', dia_semana:'Domingo',      campeonato:'Carioca',         adversario:'Fluminense',            publico:24_100, faturamento:  710_000, ticket_medio:29.46, socios_pct:0.66, no_show_pct:0.11, ano:2025 },
  { id:'2025.03.09-CAR5-F',  data:'09/03/2025', rodada:'FINAL',  horario:'18:30', dia_semana:'Domingo',      campeonato:'Carioca',         adversario:'Flamengo',              publico:37_200, faturamento:1_180_000, ticket_medio:31.72, socios_pct:0.67, no_show_pct:0.08, ano:2025 },
  // ── LIBERTADORES 2025 ──
  { id:'2025.04.02-LIB5-1',  data:'02/04/2025', rodada:'1',      horario:'21:30', dia_semana:'Quarta-feira', campeonato:'Libertadores',    adversario:'Atlético Nacional',     publico:24_600, faturamento:  780_000, ticket_medio:31.71, socios_pct:0.66, no_show_pct:0.10, ano:2025 },
  { id:'2025.04.16-LIB5-2',  data:'16/04/2025', rodada:'2',      horario:'21:30', dia_semana:'Quarta-feira', campeonato:'Libertadores',    adversario:'The Strongest',         publico:20_800, faturamento:  590_000, ticket_medio:28.37, socios_pct:0.65, no_show_pct:0.11, ano:2025 },
  { id:'2025.04.30-LIB5-3',  data:'30/04/2025', rodada:'3',      horario:'21:30', dia_semana:'Quarta-feira', campeonato:'Libertadores',    adversario:'Independiente',         publico:22_400, faturamento:  645_000, ticket_medio:28.79, socios_pct:0.65, no_show_pct:0.11, ano:2025 },
  { id:'2025.05.21-LIB5-5',  data:'21/05/2025', rodada:'5',      horario:'21:30', dia_semana:'Quarta-feira', campeonato:'Libertadores',    adversario:'Cerro Porteño',         publico:26_100, faturamento:  820_000, ticket_medio:31.42, socios_pct:0.66, no_show_pct:0.10, ano:2025 },
  { id:'2025.06.04-LIB5-6',  data:'04/06/2025', rodada:'6',      horario:'21:30', dia_semana:'Quarta-feira', campeonato:'Libertadores',    adversario:'Nacional',              publico:27_800, faturamento:  910_000, ticket_medio:32.73, socios_pct:0.66, no_show_pct:0.09, ano:2025 },
  { id:'2025.06.25-LIB5-OIT',data:'25/06/2025', rodada:'OITAVAS',horario:'21:30', dia_semana:'Quarta-feira', campeonato:'Libertadores',    adversario:'Olimpia',               publico:29_400, faturamento:1_050_000, ticket_medio:35.71, socios_pct:0.67, no_show_pct:0.09, ano:2025 },
  // ── BRASILEIRÃO 2025 ──
  { id:'2025.04.05-BRA5-3',  data:'05/04/2025', rodada:'3',      horario:'18:30', dia_semana:'Sábado',       campeonato:'Brasileirão',     adversario:'Palmeiras',             publico:37_600, faturamento:1_520_000, ticket_medio:40.43, socios_pct:0.68, no_show_pct:0.07, ano:2025 },
  { id:'2025.04.13-BRA5-5',  data:'13/04/2025', rodada:'5',      horario:'18:30', dia_semana:'Domingo',      campeonato:'Brasileirão',     adversario:'Flamengo',              publico:36_900, faturamento:1_390_000, ticket_medio:37.67, socios_pct:0.68, no_show_pct:0.07, ano:2025 },
  { id:'2025.04.20-BRA5-6',  data:'20/04/2025', rodada:'6',      horario:'18:30', dia_semana:'Domingo',      campeonato:'Brasileirão',     adversario:'São Paulo',             publico:27_300, faturamento:  890_000, ticket_medio:32.60, socios_pct:0.67, no_show_pct:0.09, ano:2025 },
  { id:'2025.05.03-BRA5-8',  data:'03/05/2025', rodada:'8',      horario:'18:30', dia_semana:'Sábado',       campeonato:'Brasileirão',     adversario:'Corinthians',           publico:30_100, faturamento:1_100_000, ticket_medio:36.55, socios_pct:0.67, no_show_pct:0.09, ano:2025 },
  { id:'2025.05.11-BRA5-10', data:'11/05/2025', rodada:'10',     horario:'18:30', dia_semana:'Domingo',      campeonato:'Brasileirão',     adversario:'Cruzeiro',              publico:28_700, faturamento:  960_000, ticket_medio:33.45, socios_pct:0.66, no_show_pct:0.09, ano:2025 },
  { id:'2025.05.18-BRA5-11', data:'18/05/2025', rodada:'11',     horario:'16:00', dia_semana:'Domingo',      campeonato:'Brasileirão',     adversario:'Grêmio',                publico:25_400, faturamento:  720_000, ticket_medio:28.35, socios_pct:0.66, no_show_pct:0.10, ano:2025 },
  { id:'2025.06.01-BRA5-13', data:'01/06/2025', rodada:'13',     horario:'18:30', dia_semana:'Domingo',      campeonato:'Brasileirão',     adversario:'Internacional',         publico:29_800, faturamento:1_050_000, ticket_medio:35.23, socios_pct:0.67, no_show_pct:0.09, ano:2025 },
  { id:'2025.06.15-BRA5-14', data:'15/06/2025', rodada:'14',     horario:'18:30', dia_semana:'Domingo',      campeonato:'Brasileirão',     adversario:'Atlético-MG',           publico:34_500, faturamento:1_280_000, ticket_medio:37.10, socios_pct:0.68, no_show_pct:0.08, ano:2025 },
  { id:'2025.06.22-BRA5-15', data:'22/06/2025', rodada:'15',     horario:'18:30', dia_semana:'Domingo',      campeonato:'Brasileirão',     adversario:'Bahia',                 publico:22_600, faturamento:  530_000, ticket_medio:23.45, socios_pct:0.65, no_show_pct:0.12, ano:2025 },
  { id:'2025.07.05-BRA5-17', data:'05/07/2025', rodada:'17',     horario:'18:30', dia_semana:'Sábado',       campeonato:'Brasileirão',     adversario:'Vasco da Gama',         publico:33_700, faturamento:1_260_000, ticket_medio:37.39, socios_pct:0.67, no_show_pct:0.08, ano:2025 },
  { id:'2025.07.12-BRA5-18', data:'12/07/2025', rodada:'18',     horario:'18:30', dia_semana:'Sábado',       campeonato:'Brasileirão',     adversario:'Criciúma',              publico:28_900, faturamento:  980_000, ticket_medio:33.91, socios_pct:0.66, no_show_pct:0.09, ano:2025 },
];

// ─── Distribuição por setor ──────────────────────────────────────
const SETOR_DIST = {
  'Leste Inferior': 0.235, 'Leste Superior': 0.240, 'Maracanã Mais': 0.014,
  'Norte': 0.062, 'Oeste Inferior': 0.215, 'Oeste Superior': 0.188, 'Sul': 0.046,
};
const SETOR_TICKET_MULT = {
  'Leste Inferior': 0.88, 'Leste Superior': 0.85, 'Maracanã Mais': 10.5,
  'Norte': 0.76, 'Oeste Inferior': 0.86, 'Oeste Superior': 0.84, 'Sul': 2.36,
};
const TIPO_DIST = [
  { id:'ALV',pct:0.272 },{ id:'MEI',pct:0.172 },{ id:'GLO',pct:0.116 },{ id:'INT',pct:0.104 },
  { id:'PRE',pct:0.096 },{ id:'G60',pct:0.089 },{ id:'BRA',pct:0.064 },{ id:'GRA',pct:0.060 },
  { id:'AOF',pct:0.017 },{ id:'SVI',pct:0.005 },{ id:'FGL',pct:0.0023 },{ id:'IPR',pct:0.0018 },{ id:'COR',pct:0.0002 },
];
const TIPO_TICKET_MULT = {
  ALV:1.20,MEI:0.50,GLO:1.10,INT:1.00,PRE:1.15,G60:0.60,
  BRA:1.05,GRA:0.00,AOF:0.80,SVI:0.60,FGL:0.00,IPR:0.70,COR:0.00,
};

export function getSetorBreakdown(partida) {
  return SETORES.map(s => {
    const publico = Math.round(partida.publico * SETOR_DIST[s.nome]);
    const ticket  = partida.ticket_medio * SETOR_TICKET_MULT[s.nome];
    return {
      setor:s.nome, id_setor:s.id, publico,
      ticket_medio:parseFloat(ticket.toFixed(2)),
      faturamento:Math.round(publico*ticket),
      occ: publico / s.capacidade,
    };
  });
}

export function getTipoBreakdown(partida) {
  return TIPOS_INGRESSO.map(t => {
    const dist = TIPO_DIST.find(d => d.id === t.id);
    const publico = Math.round(partida.publico * (dist?.pct ?? 0));
    const ticket  = partida.ticket_medio * (TIPO_TICKET_MULT[t.id] ?? 1);
    return { tipo:t.nome, id_tipo:t.id, publico, ticket_medio:parseFloat(ticket.toFixed(2)), faturamento:Math.round(publico*ticket) };
  });
}

// ─── Funções de filtro e agregação ──────────────────────────────
export function filtrarPartidas({ campeonato='Todos', ano='Todos' } = {}) {
  return PARTIDAS.filter(p => {
    if (campeonato !== 'Todos' && p.campeonato !== campeonato) return false;
    if (ano !== 'Todos' && p.ano !== Number(ano)) return false;
    return true;
  });
}

export function kpiSummary(partidas = PARTIDAS) {
  if (!partidas.length) return { socios_pct:0, ticket_medio:0, media_publico:0, publico_total:0, fat_total:0, n_jogos:0 };
  const publico_total = partidas.reduce((s,p)=>s+p.publico,0);
  const fat_total     = partidas.reduce((s,p)=>s+p.faturamento,0);
  const socios_pct    = partidas.reduce((s,p)=>s+p.socios_pct,0) / partidas.length;
  return {
    socios_pct, ticket_medio: fat_total/publico_total,
    media_publico: publico_total/partidas.length,
    publico_total, fat_total, n_jogos: partidas.length,
  };
}

export function topFaturamento(partidas = PARTIDAS, n = 20) {
  return [...partidas].sort((a,b)=>b.faturamento-a.faturamento).slice(0,n);
}

export function faturamentoPorCampeonatoAno(partidas = PARTIDAS) {
  const map = {};
  partidas.forEach(p => {
    const key = `${p.campeonato}|${p.ano}`;
    if (!map[key]) map[key] = { campeonato:p.campeonato, ano:p.ano, faturamento:0, publico:0, n:0, ticket_sum:0 };
    map[key].faturamento += p.faturamento;
    map[key].publico     += p.publico;
    map[key].n++;
    map[key].ticket_sum  += p.ticket_medio;
  });
  return Object.values(map).map(c=>({
    ...c,
    fat_medio:    Math.round(c.faturamento/c.n),
    media_publico:Math.round(c.publico/c.n),
    ticket_medio: parseFloat((c.ticket_sum/c.n).toFixed(2)),
  }));
}

export function faturamentoPorMes(partidas = PARTIDAS) {
  const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const map   = {};
  partidas.forEach(p => {
    const m = MESES[parseInt(p.data.split('/')[1],10)-1];
    if (!map[m]) map[m] = { mes:m, faturamento:0, publico:0 };
    map[m].faturamento += p.faturamento;
    map[m].publico     += p.publico;
  });
  return MESES.filter(m=>map[m]).map(m=>map[m]);
}

export function publicoPorTipoAgregado(partidas = PARTIDAS) {
  const map = {};
  TIPOS_INGRESSO.forEach(t=>{ map[t.id]={tipo:t.nome, publico:0, faturamento:0}; });
  partidas.forEach(p => getTipoBreakdown(p).forEach(td => {
    if (map[td.id_tipo]) { map[td.id_tipo].publico+=td.publico; map[td.id_tipo].faturamento+=td.faturamento; }
  }));
  return Object.values(map).filter(t=>t.publico>0).sort((a,b)=>b.publico-a.publico);
}

export function publicoPorSetorPartida(partidas = PARTIDAS) {
  return partidas.map(p => {
    const bd = getSetorBreakdown(p);
    const row = { id_partida:p.id, adversario:p.adversario, campeonato:p.campeonato, publico:p.publico, ticket_medio:p.ticket_medio };
    bd.forEach(s=>{ row[s.setor]=s.publico; });
    return row;
  });
}

export function setorSummary(partidas = PARTIDAS) {
  const map = {};
  SETORES.forEach(s=>{
    map[s.id]={ id_setor:s.id, setor:s.nome, faturamento:0, publico:0, ticket_sum:0, n:0, cap_total:s.capacidade*partidas.length };
  });
  partidas.forEach(p => getSetorBreakdown(p).forEach(sd=>{
    const key = SETORES.find(s=>s.nome===sd.setor)?.id;
    if (!key||!map[key]) return;
    map[key].faturamento+=sd.faturamento; map[key].publico+=sd.publico; map[key].ticket_sum+=sd.ticket_medio; map[key].n++;
  }));
  return Object.values(map).map(s=>({
    ...s,
    ticket_medio:   s.n ? parseFloat((s.ticket_sum/s.n).toFixed(2)) : 0,
    media_publico:  s.n ? parseFloat((s.publico/s.n).toFixed(2)) : 0,
    occ_pct:        s.cap_total ? parseFloat(((s.publico/s.cap_total)*100).toFixed(2)) : 0,
  }));
}

export function unitarioPorTimeSetor(partidas = PARTIDAS) {
  const times = [...new Set(partidas.map(p=>p.adversario))];
  return times.map(adv => {
    const ps  = partidas.filter(p=>p.adversario===adv);
    const row = { adversario:adv };
    SETORES.forEach(s=>{
      const vals = ps.flatMap(p=>getSetorBreakdown(p).filter(sd=>sd.setor===s.nome).map(sd=>sd.ticket_medio));
      row[s.nome] = vals.length ? parseFloat((vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2)) : null;
    });
    return row;
  });
}

export function faturamentoPorAdversario(partidas = PARTIDAS) {
  const map = {};
  partidas.forEach(p=>{
    if (!map[p.adversario]) map[p.adversario]={ adversario:p.adversario, faturamento:0, publico:0, n:0 };
    map[p.adversario].faturamento+=p.faturamento; map[p.adversario].publico+=p.publico; map[p.adversario].n++;
  });
  return Object.values(map).sort((a,b)=>b.faturamento-a.faturamento);
}

export function noShowSummary(partidas = PARTIDAS) {
  return partidas.map(p=>({
    id_partida:p.id, adversario:p.adversario, campeonato:p.campeonato,
    publico:p.publico, no_show_pct:p.no_show_pct,
    no_show_count:Math.round(p.publico*p.no_show_pct/(1-p.no_show_pct)),
    faturamento_noshow:Math.round(p.faturamento*p.no_show_pct*0.4),
    ano:p.ano, horario:p.horario, dia_semana:p.dia_semana,
    ticket_medio:p.ticket_medio,
  }));
}
