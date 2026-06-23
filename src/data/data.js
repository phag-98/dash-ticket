// Data loader — fetches the generated dataset (public/data.json) at runtime so
// the ~1.2 MB payload stays OUT of the JS bundle (smaller, faster-parsing app +
// independently cacheable data).
//
// Top-level await is used on purpose: a module with top-level await blocks the
// evaluation of every module that imports it until it resolves. That means all
// the named exports below are already populated by the time any page module's
// body runs — so consumer code keeps using these as plain synchronous values,
// no loading state required. Pages are lazy-loaded in App.jsx, so this await
// lives in an async chunk and never blocks initial app startup.
//
// The dataset itself is produced by generate_data.py (xlsx -> public/data.json).
// Do NOT edit public/data.json by hand — it is overwritten by the script.

const data = await fetch(`${import.meta.env.BASE_URL}data.json`).then((r) => {
  if (!r.ok) throw new Error(`Falha ao carregar data.json (HTTP ${r.status})`);
  return r.json();
});

// ── Dimensions / fact tables ──────────────────────────────────────────────
export const campeonatos  = data.campeonatos;
export const estadios     = data.estadios;
export const partidas     = data.partidas;
export const setores      = data.setores;
export const times        = data.times;
export const torcedores   = data.torcedores;
export const bordero      = data.bordero;
export const ingressos    = data.ingressos;

// ── Pre-computed aggregations ───────────────────────────────────────────────
export const kpis                        = data.kpis;
export const faturamentoPorPartida       = data.faturamentoPorPartida;
export const publicoPorTorcedor          = data.publicoPorTorcedor;
export const publicoETicketPorTime       = data.publicoETicketPorTime;
export const faturamentoPorCampeonatoAno = data.faturamentoPorCampeonatoAno;
export const faturamentoPorMes           = data.faturamentoPorMes;
export const faturamentoPorSetor         = data.faturamentoPorSetor;
export const unitarioPorTimeESetor       = data.unitarioPorTimeESetor;
export const faturamentoPorAdversario    = data.faturamentoPorAdversario;
export const noShowAnalysis              = data.noShowAnalysis;
export const noShowPorTorcedor           = data.noShowPorTorcedor;
export const precosPorTimeETorcedor      = data.precosPorTimeETorcedor;
export const publicoPorSetorPartida      = data.publicoPorSetorPartida;
export const torcedorCols                = data.torcedorCols;
export const allSetorNames               = data.allSetorNames;
export const plPorPartida                = data.plPorPartida;

// ── Convenience lists ───────────────────────────────────────────────────────
export const CAMPEONATOS = data.CAMPEONATOS;
export const SETORES     = data.SETORES;
