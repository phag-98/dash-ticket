#!/usr/bin/env python3
"""
Generate /home/user/dash-ticket/src/data/data.js from the 8 xlsx files.
"""
import json
import math
import pandas as pd
from pathlib import Path

BASE = Path("/home/user/dash-ticket")
OUT  = BASE / "src/data/data.js"

# ── 1. Load all sheets ──────────────────────────────────────────────────────
dCamp  = pd.read_excel(BASE / "dCampeonatos.xlsx")
dEstad = pd.read_excel(BASE / "dEstadios.xlsx")
dPart  = pd.read_excel(BASE / "dPartidas.xlsx")
dSetor = pd.read_excel(BASE / "dSetores.xlsx")
dTimes = pd.read_excel(BASE / "dTimes.xlsx")
dTorc  = pd.read_excel(BASE / "dTorcedores.xlsx")
fBord  = pd.read_excel(BASE / "fBordero.xlsx")
fIngr  = pd.read_excel(BASE / "fIngressos.xlsx")

for df in [dCamp, dEstad, dPart, dSetor, dTimes, dTorc, fBord, fIngr]:
    df.columns = [str(c).strip() for c in df.columns]

# ── 2. Lookup maps ──────────────────────────────────────────────────────────
camp_map   = dict(zip(dCamp["ID_CAMPEONATO"], dCamp["NOME"]))       # id -> nome
time_map   = dict(zip(dTimes["ID_TIME"],    dTimes["TIME"]))        # id -> nome
setor_map  = dict(zip(dSetor["ID_SETOR"],   dSetor["SETOR"]))       # id -> nome
torc_map   = dict(zip(dTorc["ID_TORCEDOR"], dTorc["NOME"]))         # id -> nome
socio_map  = dict(zip(dTorc["ID_TORCEDOR"], dTorc["SÓCIO"]))        # id -> 'Sim'/'Não'

# ── 3. Enrich partidas ──────────────────────────────────────────────────────
dPart["DATA"] = pd.to_datetime(dPart["DATA"], errors="coerce")
dPart["ANO"]  = dPart["DATA"].dt.year
dPart["MES"]  = dPart["DATA"].dt.month
dPart["CAMPEONATO"] = dPart["ID_CAMPEONATO"].map(camp_map)
dPart["TIME"]       = dPart["ID_TIME"].map(time_map)

# ── 4. Merge fBordero with partidas ─────────────────────────────────────────
fBord["FATURAMENTO"] = fBord["UTILIZADOS"] * fBord["UNITÁRIO"]
fBord["TORCEDOR"]    = fBord["ID_TORCEDOR"].map(torc_map)
fBord["SÓCIO"]       = fBord["ID_TORCEDOR"].map(socio_map)
fBord["SETOR"]       = fBord["ID_SETOR"].map(setor_map)

bord_enrich = fBord.merge(dPart[["ID_PARTIDA","CAMPEONATO","TIME","DATA","ANO","MES","RODADA","DIA_DA_SEMANA","HORARIO","ID_CAMPEONATO","ID_TIME"]], on="ID_PARTIDA", how="left")

# ── 5. Merge fIngressos with partidas ───────────────────────────────────────
fIngr["TORCEDOR"] = fIngr["ID_TORCEDOR"].map(torc_map)
fIngr["SÓCIO"]    = fIngr["ID_TORCEDOR"].map(socio_map)
fIngr["SETOR"]    = fIngr["ID_SETOR"].map(setor_map)
fIngr["NO_SHOW"]  = fIngr["EMITIDOS"] - fIngr["VALIDADOS"]

ingr_enrich = fIngr.merge(dPart[["ID_PARTIDA","CAMPEONATO","TIME","DATA","ANO","MES","RODADA","DIA_DA_SEMANA","HORARIO","ID_CAMPEONATO","ID_TIME"]], on="ID_PARTIDA", how="left")

# ── 6. Helper: safe float ───────────────────────────────────────────────────
def sf(v, dec=2):
    if v is None or (isinstance(v, float) and math.isnan(v)):
        return 0.0
    return round(float(v), dec)

def si(v):
    if v is None or (isinstance(v, float) and math.isnan(v)):
        return 0
    return int(v)

# ── 7. Dimension arrays ─────────────────────────────────────────────────────
campeonatos = []
for _, r in dCamp.iterrows():
    campeonatos.append({
        "id": str(r["ID_CAMPEONATO"]),
        "nome": str(r["NOME"]),
        "nivel": str(r["NÍVEL"]),
        "centroCusto": str(r["Centro de Custo"]),
    })

estadios = []
for _, r in dEstad.iterrows():
    estadios.append({
        "id": str(r["ID_ESTÁDIO"]),
        "nome": str(r["ESTÁDIO"]),
        "cidade": str(r["CIDADE"]),
        "uf": str(r["UF"]),
        "capacidade": si(r["CAPACIDADE"]),
    })

partidas = []
for _, r in dPart.iterrows():
    dt = r["DATA"]
    data_str = dt.strftime("%d/%m/%Y") if pd.notna(dt) else ""
    horario = str(r["HORARIO"])
    if ":" in horario and len(horario) > 5:
        horario = horario[:5]
    partidas.append({
        "id": str(r["ID_PARTIDA"]),
        "idCampeonato": str(r["ID_CAMPEONATO"]),
        "campeonato": str(r["CAMPEONATO"]) if pd.notna(r["CAMPEONATO"]) else "",
        "idTime": str(r["ID_TIME"]),
        "time": str(r["TIME"]) if pd.notna(r["TIME"]) else "",
        "data": data_str,
        "ano": si(r["ANO"]),
        "mes": si(r["MES"]),
        "rodada": str(r["RODADA"]),
        "diaSemana": str(r["DIA_DA_SEMANA"]),
        "horario": horario,
    })

setores = []
for _, r in dSetor.iterrows():
    setores.append({
        "id": str(r["ID_SETOR"]),
        "nome": str(r["SETOR"]),
        "capacidade": si(r["CAPACIDADE"]),
        "idEstadio": str(r["ID_ESTÁDIO"]),
    })

times = []
for _, r in dTimes.iterrows():
    times.append({
        "id": str(r["ID_TIME"]),
        "nome": str(r["TIME"]),
        "pais": str(r["PAIS"]) if pd.notna(r["PAIS"]) else "",
        "uf": str(r["UF"]) if pd.notna(r["UF"]) else "",
        "cidade": str(r["CIDADE"]) if pd.notna(r["CIDADE"]) else "",
    })

torcedores = []
for _, r in dTorc.iterrows():
    torcedores.append({
        "id": str(r["ID_TORCEDOR"]),
        "nome": str(r["NOME"]),
        "socio": str(r["SÓCIO"]),
        "desconto": sf(r["Desconto"]),
    })

# ── 8. Fact arrays (slim, key columns) ────────────────────────────────────
bordero = []
for _, r in fBord.iterrows():
    bordero.append({
        "idPartida": str(r["ID_PARTIDA"]),
        "idEstadio": str(r["ID_ESTÁDIO"]),
        "idSetor": str(r["ID_SETOR"]),
        "idTorcedor": str(r["ID_TORCEDOR"]),
        "disponivel": sf(r["DISPONÍVEL"], 0),
        "devolvidos": sf(r["DEVOLVIDOS"], 0),
        "utilizados": sf(r["UTILIZADOS"], 0),
        "unitario": sf(r["UNITÁRIO"]),
        "faturamento": sf(r["FATURAMENTO"]),
    })

ingressos = []
for _, r in fIngr.iterrows():
    ns = sf(r["NO_SHOW"], 0)
    emitidos = sf(r["EMITIDOS"], 0)
    ingressos.append({
        "idPartida": str(r["ID_PARTIDA"]),
        "idSetor": str(r["ID_SETOR"]),
        "idEstadio": str(r["ID_ESTADIO"]),
        "clube": str(r["Clube"]) if pd.notna(r["Clube"]) else "",
        "idTorcedor": str(r["ID_TORCEDOR"]),
        "online": sf(r["ONLINE"], 0),
        "offline": sf(r["OFFLINE"], 0),
        "cortesia": sf(r["CORTESIA"], 0),
        "reembolsadas": sf(r["REEMBOLSADAS"], 0),
        "emitidos": emitidos,
        "publico": sf(r["PÚBLICO"], 0),
        "validados": sf(r["VALIDADOS"], 0),
        "unitario": sf(r["UNITÁRIO"]),
        "noShow": ns,
        "percentualNoShow": round(ns / emitidos, 4) if emitidos > 0 else 0.0,
    })

# ── 9. Pre-computed aggregations ─────────────────────────────────────────

# ── 9a. KPIs (global) ──────────────────────────────────────────────────────
ingr_enrich["FAT_INGR"] = ingr_enrich["PÚBLICO"] * ingr_enrich["UNITÁRIO"]
total_faturamento = sf(ingr_enrich["FAT_INGR"].sum())
total_utilizados  = sf(ingr_enrich["PÚBLICO"].sum(), 0)
total_publico_ingr = sf(ingr_enrich["PÚBLICO"].sum(), 0)

# % socios: ingressos where SÓCIO == 'Sim'
publico_socios = sf(ingr_enrich[ingr_enrich["SÓCIO"] == "Sim"]["PÚBLICO"].sum(), 0)
pct_socios = round(publico_socios / total_publico_ingr, 4) if total_publico_ingr > 0 else 0.0

ticket_medio_global = round(total_faturamento / total_utilizados, 2) if total_utilizados > 0 else 0.0

# media publico per partida
pub_por_partida = ingr_enrich.groupby("ID_PARTIDA")["PÚBLICO"].sum()
media_publico = round(pub_por_partida.mean(), 0) if len(pub_por_partida) > 0 else 0.0

kpis = {
    "percentualSocios": pct_socios,
    "ticketMedio": ticket_medio_global,
    "mediaPublico": int(media_publico),
    "publicoTotal": si(total_publico_ingr),
    "faturamentoTotal": total_faturamento,
}

# ── 9b. Faturamento por partida ─────────────────────────────────────────────
# Use ingressos (PÚBLICO * UNITÁRIO) so all 64 partidas are covered
ingr_enrich["FAT_INGR"] = ingr_enrich["PÚBLICO"] * ingr_enrich["UNITÁRIO"]
fat_por_partida = ingr_enrich.groupby("ID_PARTIDA").agg(
    FATURAMENTO=("FAT_INGR", "sum"),
    UTILIZADOS=("PÚBLICO", "sum"),
).reset_index()
fat_por_partida = fat_por_partida.merge(
    dPart[["ID_PARTIDA","CAMPEONATO","TIME","RODADA","DATA","ANO","MES","DIA_DA_SEMANA","HORARIO"]],
    on="ID_PARTIDA", how="left"
)
fat_por_partida["TICKET_MEDIO"] = fat_por_partida.apply(
    lambda r: round(r["FATURAMENTO"] / r["UTILIZADOS"], 2) if r["UTILIZADOS"] > 0 else 0.0, axis=1
)
fat_por_partida = fat_por_partida.sort_values("FATURAMENTO", ascending=False)

faturamentoPorPartida = []
for _, r in fat_por_partida.iterrows():
    dt = r["DATA"]
    data_str = dt.strftime("%d/%m/%Y") if pd.notna(dt) else ""
    horario = str(r["HORARIO"])
    if ":" in horario and len(horario) > 5:
        horario = horario[:5]
    faturamentoPorPartida.append({
        "idPartida": str(r["ID_PARTIDA"]),
        "time": str(r["TIME"]) if pd.notna(r["TIME"]) else "",
        "campeonato": str(r["CAMPEONATO"]) if pd.notna(r["CAMPEONATO"]) else "",
        "rodada": str(r["RODADA"]),
        "data": data_str,
        "ano": si(r["ANO"]),
        "mes": si(r["MES"]),
        "diaSemana": str(r["DIA_DA_SEMANA"]) if pd.notna(r["DIA_DA_SEMANA"]) else "",
        "horario": horario,
        "faturamento": sf(r["FATURAMENTO"]),
        "utilizados": si(r["UTILIZADOS"]),
        "ticketMedio": sf(r["TICKET_MEDIO"]),
    })

# ── 9c. Público por torcedor ─────────────────────────────────────────────
pub_torc = ingr_enrich.groupby("TORCEDOR")["PÚBLICO"].sum().reset_index()
pub_torc.columns = ["torcedor","publico"]
pub_torc = pub_torc.sort_values("publico", ascending=False)
publicoPorTorcedor = [{"torcedor": str(r["torcedor"]) if pd.notna(r["torcedor"]) else "—", "publico": si(r["publico"])} for _, r in pub_torc.iterrows()]

# ── 9d. Público e Ticket Médio por time ──────────────────────────────────
# Join bord_enrich with ingr_enrich on partida+setor for ticket per setor per time
time_agg = bord_enrich.groupby(["ID_TIME","TIME"]).agg(
    FATURAMENTO=("FATURAMENTO","sum"),
    UTILIZADOS=("UTILIZADOS","sum"),
).reset_index()

ingr_by_time = ingr_enrich.groupby(["ID_TIME","SETOR"])["PÚBLICO"].sum().reset_index()
ingr_by_time.columns = ["ID_TIME","SETOR","PUBLICO"]

publico_by_time = ingr_enrich.groupby("ID_TIME")["PÚBLICO"].sum().reset_index()
publico_by_time.columns = ["ID_TIME","PUBLICO_TOTAL"]

time_full = time_agg.merge(publico_by_time, on="ID_TIME", how="left")
time_full["TICKET_MEDIO"] = time_full.apply(
    lambda r: round(r["FATURAMENTO"]/r["UTILIZADOS"],2) if r["UTILIZADOS"] > 0 else 0.0, axis=1
)

# sectors breakdown per time
setor_pivot = ingr_by_time.groupby(["ID_TIME","SETOR"])["PUBLICO"].sum().unstack(fill_value=0)

publicoETicketPorTime = []
for _, r in time_full.iterrows():
    idtime = r["ID_TIME"]
    sectors = {}
    if idtime in setor_pivot.index:
        for col in setor_pivot.columns:
            v = setor_pivot.loc[idtime, col]
            if v > 0:
                sectors[str(col)] = si(v)
    publicoETicketPorTime.append({
        "idTime": str(idtime),
        "time": str(r["TIME"]) if pd.notna(r["TIME"]) else "",
        "publico": si(r["PUBLICO_TOTAL"]) if pd.notna(r["PUBLICO_TOTAL"]) else 0,
        "ticketMedio": sf(r["TICKET_MEDIO"]),
        "faturamento": sf(r["FATURAMENTO"]),
        "sectors": sectors,
    })
publicoETicketPorTime.sort(key=lambda x: -x["publico"])

# ── 9e. Faturamento por campeonato e ano ─────────────────────────────────
# Use ingr_enrich (all 64 partidas, 2024+2025) instead of bord_enrich (only 2024)
ingr_enrich["FAT_INGR"] = ingr_enrich["PÚBLICO"] * ingr_enrich["UNITÁRIO"]
camp_ano_agg = ingr_enrich.groupby(["CAMPEONATO","ANO"]).agg(
    FATURAMENTO=("FAT_INGR","sum"),
    UTILIZADOS=("PÚBLICO","sum"),
    N_PARTIDAS=("ID_PARTIDA", lambda x: x.nunique()),
).reset_index()
camp_ano_agg["TICKET_MEDIO"] = camp_ano_agg.apply(
    lambda r: round(r["FATURAMENTO"]/r["UTILIZADOS"],2) if r["UTILIZADOS"] > 0 else 0.0, axis=1
)
camp_ano_agg["FAT_MEDIO"] = camp_ano_agg.apply(
    lambda r: round(r["FATURAMENTO"]/r["N_PARTIDAS"],2) if r["N_PARTIDAS"] > 0 else 0.0, axis=1
)

# media publico per campeonato ano
pub_camp_ano = ingr_enrich.groupby(["CAMPEONATO","ANO","ID_PARTIDA"])["PÚBLICO"].sum().reset_index()
pub_camp_ano_agg = pub_camp_ano.groupby(["CAMPEONATO","ANO"]).agg(
    MEDIA_PUBLICO=("PÚBLICO","mean"),
    TOTAL_PUBLICO=("PÚBLICO","sum"),
).reset_index()

camp_ano_full = camp_ano_agg.merge(pub_camp_ano_agg, on=["CAMPEONATO","ANO"], how="left")

faturamentoPorCampeonatoAno = []
for _, r in camp_ano_full.iterrows():
    if pd.isna(r["CAMPEONATO"]):
        continue
    faturamentoPorCampeonatoAno.append({
        "campeonato": str(r["CAMPEONATO"]),
        "ano": si(r["ANO"]),
        "faturamento": sf(r["FATURAMENTO"]),
        "utilizados": si(r["UTILIZADOS"]),
        "nPartidas": si(r["N_PARTIDAS"]),
        "ticketMedio": sf(r["TICKET_MEDIO"]),
        "fatMedio": sf(r["FAT_MEDIO"]),
        "mediaPublico": sf(r["MEDIA_PUBLICO"], 0) if pd.notna(r["MEDIA_PUBLICO"]) else 0.0,
        "totalPublico": si(r["TOTAL_PUBLICO"]) if pd.notna(r["TOTAL_PUBLICO"]) else 0,
    })

# Same for ticket medio
ticketMedioPorCampeonatoAno = faturamentoPorCampeonatoAno  # already has ticketMedio

# Same for mediaPublico
mediaPublicoPorCampeonatoAno = faturamentoPorCampeonatoAno  # already has mediaPublico

# ── 9f. Faturamento por mês ─────────────────────────────────────────────
fat_mes = bord_enrich.groupby("MES")["FATURAMENTO"].sum().reset_index()
fat_mes.columns = ["mes","faturamento"]
MONTHS = {1:"Jan",2:"Fev",3:"Mar",4:"Abr",5:"Mai",6:"Jun",7:"Jul",8:"Ago",9:"Set",10:"Out",11:"Nov",12:"Dez"}
fat_mes["mesNome"] = fat_mes["mes"].map(MONTHS)
faturamentoPorMes = [{"mes": MONTHS.get(si(r["mes"]),""), "mesNum": si(r["mes"]), "faturamento": sf(r["faturamento"])} for _, r in fat_mes.sort_values("mes").iterrows()]

# ── 9g. Faturamento por setor ─────────────────────────────────────────────
setor_fat = bord_enrich.groupby(["ID_SETOR","SETOR"]).agg(
    FATURAMENTO=("FATURAMENTO","sum"),
    UTILIZADOS=("UTILIZADOS","sum"),
    DISPONIVEL=("DISPONÍVEL","sum"),
    N_PARTIDAS=("ID_PARTIDA", lambda x: x.nunique()),
).reset_index()
setor_fat["TICKET_MEDIO"] = setor_fat.apply(
    lambda r: round(r["FATURAMENTO"]/r["UTILIZADOS"],2) if r["UTILIZADOS"] > 0 else 0.0, axis=1
)
setor_fat["TAXA_OCUPACAO"] = setor_fat.apply(
    lambda r: round(r["UTILIZADOS"]/r["DISPONIVEL"]*100, 1) if r["DISPONIVEL"] > 0 else 0.0, axis=1
)
# media publico per setor from ingressos
pub_setor = ingr_enrich.groupby(["ID_SETOR","ID_PARTIDA"])["PÚBLICO"].sum().reset_index()
pub_setor_agg = pub_setor.groupby("ID_SETOR").agg(
    PUBLICO_TOTAL=("PÚBLICO","sum"),
    MEDIA_PUBLICO=("PÚBLICO","mean"),
).reset_index()
setor_fat = setor_fat.merge(pub_setor_agg, on="ID_SETOR", how="left")

faturamentoPorSetor = []
for _, r in setor_fat.sort_values("FATURAMENTO", ascending=False).iterrows():
    if pd.isna(r["SETOR"]):
        continue
    faturamentoPorSetor.append({
        "idSetor": str(r["ID_SETOR"]),
        "setor": str(r["SETOR"]),
        "faturamento": sf(r["FATURAMENTO"]),
        "utilizados": si(r["UTILIZADOS"]),
        "publico": si(r["PUBLICO_TOTAL"]) if pd.notna(r["PUBLICO_TOTAL"]) else 0,
        "ticketMedio": sf(r["TICKET_MEDIO"]),
        "mediaPublico": sf(r["MEDIA_PUBLICO"], 0) if pd.notna(r["MEDIA_PUBLICO"]) else 0.0,
        "taxaOcupacao": sf(r["TAXA_OCUPACAO"]),
    })

# ── 9h. Unitário por time e setor (for line chart) ───────────────────────
unit_ts = bord_enrich.groupby(["ID_TIME","TIME","SETOR"])["UNITÁRIO"].mean().reset_index()
unit_ts.columns = ["ID_TIME","TIME","SETOR","UNITARIO_MEDIO"]
unit_ts_pivot = unit_ts.pivot_table(index=["ID_TIME","TIME"], columns="SETOR", values="UNITARIO_MEDIO", aggfunc="mean").reset_index()
# flatten columns
unit_ts_pivot.columns = [str(c) for c in unit_ts_pivot.columns]

unitarioPorTimeESetor = []
for _, r in unit_ts_pivot.iterrows():
    row = {"idTime": str(r["ID_TIME"]), "time": str(r["TIME"])}
    for col in unit_ts_pivot.columns:
        if col not in ["ID_TIME","TIME"]:
            v = r[col]
            row[col] = round(float(v), 2) if pd.notna(v) else None
    unitarioPorTimeESetor.append(row)

# ── 9i. Faturamento por adversário (treemap) ────────────────────────────
fat_adv = bord_enrich.groupby(["TIME","ID_TIME"]).agg(
    FATURAMENTO=("FATURAMENTO","sum"),
    UTILIZADOS=("UTILIZADOS","sum"),
).reset_index()
fat_adv.columns = ["time","idTime","faturamento","utilizados"]
fat_adv = fat_adv.sort_values("faturamento", ascending=False)
faturamentoPorAdversario = [
    {"time": str(r["time"]) if pd.notna(r["time"]) else "", "idTime": str(r["idTime"]),
     "faturamento": sf(r["faturamento"]), "utilizados": si(r["utilizados"])}
    for _, r in fat_adv.iterrows()
]

# ── 9j. No Show Analysis ────────────────────────────────────────────────
ingr_part = ingr_enrich.groupby("ID_PARTIDA").agg(
    PUBLICO=("PÚBLICO","sum"),
    EMITIDOS=("EMITIDOS","sum"),
    VALIDADOS=("VALIDADOS","sum"),
    NO_SHOW=("NO_SHOW","sum"),
).reset_index()
ingr_part["PCT_NO_SHOW"] = ingr_part.apply(
    lambda r: round(r["NO_SHOW"]/r["EMITIDOS"], 4) if r["EMITIDOS"] > 0 else 0.0, axis=1
)
ingr_part = ingr_part.merge(
    dPart[["ID_PARTIDA","CAMPEONATO","TIME","RODADA","DATA","ANO","MES","DIA_DA_SEMANA","HORARIO"]],
    on="ID_PARTIDA", how="left"
)
# faturamento do no show: avg UNITÁRIO * NO_SHOW per partida
# We compute from ingressos: unitário * noShow per row
ingr_enrich["FAT_NO_SHOW"] = ingr_enrich["NO_SHOW"] * ingr_enrich["UNITÁRIO"]
fat_ns_part = ingr_enrich.groupby("ID_PARTIDA")["FAT_NO_SHOW"].sum().reset_index()
fat_ns_part.columns = ["ID_PARTIDA","FAT_NO_SHOW"]
ingr_part = ingr_part.merge(fat_ns_part, on="ID_PARTIDA", how="left")

noShowAnalysis = []
for _, r in ingr_part.iterrows():
    dt = r["DATA"]
    data_str = dt.strftime("%d/%m/%Y") if pd.notna(dt) else ""
    horario = str(r["HORARIO"])
    if ":" in horario and len(horario) > 5:
        horario = horario[:5]
    noShowAnalysis.append({
        "idPartida": str(r["ID_PARTIDA"]),
        "campeonato": str(r["CAMPEONATO"]) if pd.notna(r["CAMPEONATO"]) else "",
        "time": str(r["TIME"]) if pd.notna(r["TIME"]) else "",
        "rodada": str(r["RODADA"]),
        "data": data_str,
        "ano": si(r["ANO"]),
        "mes": si(r["MES"]),
        "diaSemana": str(r["DIA_DA_SEMANA"]) if pd.notna(r["DIA_DA_SEMANA"]) else "",
        "horario": horario,
        "publico": si(r["PUBLICO"]),
        "emitidos": si(r["EMITIDOS"]),
        "validados": si(r["VALIDADOS"]),
        "noShow": si(r["NO_SHOW"]),
        "percentualNoShow": sf(r["PCT_NO_SHOW"], 4),
        "fatNoShow": sf(r["FAT_NO_SHOW"]) if pd.notna(r["FAT_NO_SHOW"]) else 0.0,
    })

# ── 9k. No Show por Torcedor ─────────────────────────────────────────────
ingr_enrich["FAT_NO_SHOW"] = ingr_enrich["NO_SHOW"] * ingr_enrich["UNITÁRIO"]
ns_torc = ingr_enrich.groupby(["ID_TORCEDOR","TORCEDOR","SÓCIO"]).agg(
    NO_SHOW=("NO_SHOW","sum"),
    FAT_NO_SHOW=("FAT_NO_SHOW","sum"),
    EMITIDOS=("EMITIDOS","sum"),
).reset_index()
ns_torc["PCT_NO_SHOW"] = ns_torc.apply(
    lambda r: round(r["NO_SHOW"]/r["EMITIDOS"], 4) if r["EMITIDOS"] > 0 else 0.0, axis=1
)
ns_torc = ns_torc.sort_values("NO_SHOW", ascending=False)
noShowPorTorcedor = []
for _, r in ns_torc.iterrows():
    noShowPorTorcedor.append({
        "idTorcedor": str(r["ID_TORCEDOR"]),
        "torcedor": str(r["TORCEDOR"]) if pd.notna(r["TORCEDOR"]) else "—",
        "socio": str(r["SÓCIO"]) if pd.notna(r["SÓCIO"]) else "Não",
        "noShow": si(r["NO_SHOW"]),
        "fatNoShow": sf(r["FAT_NO_SHOW"]),
        "emitidos": si(r["EMITIDOS"]),
        "percentualNoShow": sf(r["PCT_NO_SHOW"], 4),
    })

# ── 9l. Preços por time e torcedor (matrix) ──────────────────────────────
preco_matrix = bord_enrich.groupby(["ID_TIME","TIME","ID_TORCEDOR","TORCEDOR"])["UNITÁRIO"].mean().reset_index()
preco_matrix.columns = ["ID_TIME","TIME","ID_TORCEDOR","TORCEDOR","UNITARIO_MEDIO"]
preco_pivot = preco_matrix.pivot_table(index=["ID_TIME","TIME"], columns="TORCEDOR", values="UNITARIO_MEDIO", aggfunc="mean").reset_index()
preco_pivot.columns = [str(c) for c in preco_pivot.columns]

precosPorTimeETorcedor = []
torcedorCols = [c for c in preco_pivot.columns if c not in ["ID_TIME","TIME"]]
for _, r in preco_pivot.iterrows():
    row = {"idTime": str(r["ID_TIME"]), "time": str(r["TIME"])}
    for col in torcedorCols:
        v = r[col]
        row[col] = round(float(v), 2) if pd.notna(v) else None
    precosPorTimeETorcedor.append(row)

# Sorted by time name
precosPorTimeETorcedor.sort(key=lambda x: x.get("time",""))

# ── 9m. Combo chart data: público por setor e partida ──────────────────
# For ChampionshipReport: public by setor per partida with ticket medio
pub_setor_part = ingr_enrich.groupby(["ID_PARTIDA","SETOR"])["PÚBLICO"].sum().unstack(fill_value=0).reset_index()
ticket_part = bord_enrich.groupby("ID_PARTIDA").agg(
    FAT=("FATURAMENTO","sum"), UTIL=("UTILIZADOS","sum")
).reset_index()
ticket_part["TICKET_MEDIO"] = ticket_part.apply(
    lambda r: round(r["FAT"]/r["UTIL"],2) if r["UTIL"] > 0 else 0.0, axis=1
)
pub_setor_part = pub_setor_part.merge(ticket_part[["ID_PARTIDA","TICKET_MEDIO"]], on="ID_PARTIDA", how="left")
pub_setor_part = pub_setor_part.merge(
    dPart[["ID_PARTIDA","CAMPEONATO","TIME","RODADA","DATA","ANO","MES","DIA_DA_SEMANA","HORARIO"]],
    on="ID_PARTIDA", how="left"
)
pub_setor_part_cols = [c for c in pub_setor_part.columns if c not in ["ID_PARTIDA","TICKET_MEDIO","CAMPEONATO","TIME","RODADA","DATA","ANO","MES","DIA_DA_SEMANA","HORARIO"]]

publicoPorSetorPartida = []
for _, r in pub_setor_part.iterrows():
    dt = r["DATA"]
    data_str = dt.strftime("%d/%m/%Y") if pd.notna(dt) else ""
    horario = str(r["HORARIO"])
    if ":" in horario and len(horario) > 5:
        horario = horario[:5]
    row = {
        "idPartida": str(r["ID_PARTIDA"]),
        "time": str(r["TIME"]) if pd.notna(r["TIME"]) else "",
        "campeonato": str(r["CAMPEONATO"]) if pd.notna(r["CAMPEONATO"]) else "",
        "rodada": str(r["RODADA"]),
        "data": data_str,
        "ano": si(r["ANO"]),
        "mes": si(r["MES"]),
        "diaSemana": str(r["DIA_DA_SEMANA"]) if pd.notna(r["DIA_DA_SEMANA"]) else "",
        "horario": horario,
        "ticketMedio": sf(r["TICKET_MEDIO"]) if pd.notna(r["TICKET_MEDIO"]) else 0.0,
    }
    for col in pub_setor_part_cols:
        v = r[col]
        row[col] = si(v) if pd.notna(v) else 0
    publicoPorSetorPartida.append(row)

# sorted by data
publicoPorSetorPartida.sort(key=lambda x: x.get("data",""))

# Also collect unique setor names in the data
all_setor_names = sorted(set(s["nome"] for s in setores))

# ── 10. P&L por partida ─────────────────────────────────────────────────────
dCatFin1 = pd.read_excel(BASE / "dCatFinanceira1.xlsx")
dCatFin2 = pd.read_excel(BASE / "dCatFinanceira2.xlsx")
dDescDesp = pd.read_excel(BASE / "dDescDespesa.xlsx")
fDesp     = pd.read_excel(BASE / "fDespesas.xlsx")
fAnB_rev  = pd.read_excel(BASE / "fA&B.xlsx")
fAcom     = pd.read_excel(BASE / "fAcomodacao.xlsx")
fAK       = pd.read_excel(BASE / "fArenaKids.xlsx")
fEstac    = pd.read_excel(BASE / "fEstacionamento.xlsx")
fFac      = pd.read_excel(BASE / "fFacial.xlsx")
fFire     = pd.read_excel(BASE / "fFirezone.xlsx")

for df in [dCatFin1, dCatFin2, dDescDesp, fDesp, fAnB_rev, fAcom, fAK, fEstac, fFac, fFire]:
    df.columns = [str(c).strip() for c in df.columns]

# Revenue: matchday ingresse from ingressos
ingr_enrich["FAT_INGR"] = ingr_enrich["PÚBLICO"] * ingr_enrich["UNITÁRIO"]
matchday_rev = ingr_enrich.groupby("ID_PARTIDA").agg(
    matchdayIngresse=("FAT_INGR", "sum")
).reset_index()

# Revenue: parking
parking_rev = fEstac.groupby("ID_PARTIDA")["VALOR"].sum().reset_index()
parking_rev.columns = ["ID_PARTIDA", "parking"]

# Revenue: firezone (deduplicate first)
firezone_rev = fFire.drop_duplicates().groupby("ID_PARTIDA")["FATURAMENTO_FIREZONE"].sum().reset_index()
firezone_rev.columns = ["ID_PARTIDA", "firezone"]

# Revenue: arena kids (deduplicate first)
ak_rev = fAK.drop_duplicates().groupby("ID_PARTIDA")["FATURAMENTO_ARENA_KIDS"].sum().reset_index()
ak_rev.columns = ["ID_PARTIDA", "arenaKids"]

# Revenue: a&b
anb_rev = fAnB_rev.groupby("ID_PARTIDA")["VALOR"].sum().reset_index()
anb_rev.columns = ["ID_PARTIDA", "aeb"]

# Expenses: merge fDespesas with dDescDespesa to get ID_CAT_FIN_2
fDesp_cat = fDesp.merge(dDescDesp[["ID_DESC_DESPESA", "ID_CAT_FIN_2"]], on="ID_DESC_DESPESA", how="left")

def get_expense_by_cat(cat_id, col_name):
    mask = fDesp_cat["ID_CAT_FIN_2"] == cat_id
    return fDesp_cat[mask].groupby("ID_PARTIDA")["VALOR"].sum().reset_index().rename(columns={"VALOR": col_name})

services_exp   = get_expense_by_cat("ser-10", "services")
security_exp   = get_expense_by_cat("sec-9",  "security")
rentals_exp    = get_expense_by_cat("ren-11",  "rentals")
opex_exp       = get_expense_by_cat("ope-12",  "operatingExpenses")
fees_exp       = get_expense_by_cat("fee-13",  "feesAndTaxes")
entertain_exp  = get_expense_by_cat("ent-14",  "entertainment")
taxes_exp      = get_expense_by_cat("tax-17",  "taxes")
arbitration_exp= get_expense_by_cat("arb-18",  "arbitration")
personnel_exp  = get_expense_by_cat("per-19",  "personnelExpenses")
meal_exp       = get_expense_by_cat("mea-20",  "meal")

# Facial recognition
fac_exp = fFac.groupby("ID_PARTIDA")["VALOR"].sum().reset_index()
fac_exp.columns = ["ID_PARTIDA", "facialRecognition"]

# Logistics: accommodation
accom_exp = fAcom.groupby("ID_PARTIDA")["VALOR"].sum().reset_index()
accom_exp.columns = ["ID_PARTIDA", "accommodation"]

# Build base: all partidas
pl_base = dPart[["ID_PARTIDA", "ID_CAMPEONATO", "ID_TIME", "DATA", "ANO", "MES"]].copy()
pl_base["CAMPEONATO"] = pl_base["ID_CAMPEONATO"].map(camp_map)
pl_base["TIME"]       = pl_base["ID_TIME"].map(time_map)

for df_m in [matchday_rev, parking_rev, firezone_rev, ak_rev, anb_rev,
             services_exp, security_exp, rentals_exp, opex_exp, fees_exp,
             entertain_exp, fac_exp, accom_exp, taxes_exp, arbitration_exp,
             personnel_exp, meal_exp]:
    pl_base = pl_base.merge(df_m, on="ID_PARTIDA", how="left")

num_pl = ["matchdayIngresse", "parking", "firezone", "arenaKids", "aeb",
          "services", "security", "rentals", "operatingExpenses", "feesAndTaxes",
          "entertainment", "facialRecognition", "accommodation",
          "taxes", "arbitration", "personnelExpenses", "meal"]
pl_base[num_pl] = pl_base[num_pl].fillna(0.0)

pl_base["totalRevenues"]           = pl_base[["matchdayIngresse","parking","firezone","arenaKids","aeb"]].sum(axis=1)
pl_base["totalOperatingExpenses"]  = pl_base[["services","security","rentals","operatingExpenses","feesAndTaxes","entertainment","facialRecognition"]].sum(axis=1)
pl_base["margin"]                  = pl_base["totalRevenues"] + pl_base["totalOperatingExpenses"]
pl_base["totalLogistics"]          = pl_base["accommodation"]
pl_base["totalFederations"]        = pl_base[["taxes","arbitration","personnelExpenses","meal"]].sum(axis=1)
pl_base["total"]                   = pl_base["margin"] + pl_base["totalLogistics"] + pl_base["totalFederations"]

# Sort by data
pl_base = pl_base.merge(dPart[["ID_PARTIDA","RODADA"]], on="ID_PARTIDA", how="left")
pl_base = pl_base.sort_values("DATA")

plPorPartida = []
for _, r in pl_base.iterrows():
    dt = r["DATA"]
    data_str = dt.strftime("%d/%m/%Y") if pd.notna(dt) else ""
    plPorPartida.append({
        "idPartida":              str(r["ID_PARTIDA"]),
        "campeonato":             str(r["CAMPEONATO"]) if pd.notna(r["CAMPEONATO"]) else "",
        "time":                   str(r["TIME"]) if pd.notna(r["TIME"]) else "",
        "data":                   data_str,
        "ano":                    si(r["ANO"]) if pd.notna(r["ANO"]) else 0,
        "mes":                    si(r["MES"]) if pd.notna(r["MES"]) else 0,
        # revenues
        "matchdayIngresse":       sf(r["matchdayIngresse"]),
        "rebateIngresse":         0.0,
        "parking":                sf(r["parking"]),
        "firezone":               sf(r["firezone"]),
        "arenaKids":              sf(r["arenaKids"]),
        "aeb":                    sf(r["aeb"]),
        "totalRevenues":          sf(r["totalRevenues"]),
        # operating expenses
        "services":               sf(r["services"]),
        "security":               sf(r["security"]),
        "rentals":                sf(r["rentals"]),
        "operatingExpenses":      sf(r["operatingExpenses"]),
        "feesAndTaxes":           sf(r["feesAndTaxes"]),
        "facialRecognition":      sf(r["facialRecognition"]),
        "entertainment":          sf(r["entertainment"]),
        "totalOperatingExpenses": sf(r["totalOperatingExpenses"]),
        # margin
        "margin":                 sf(r["margin"]),
        # logistics
        "accommodation":          sf(r["accommodation"]),
        "totalLogistics":         sf(r["totalLogistics"]),
        # federations
        "taxes":                  sf(r["taxes"]),
        "arbitration":            sf(r["arbitration"]),
        "personnelExpenses":      sf(r["personnelExpenses"]),
        "meal":                   sf(r["meal"]),
        "totalFederations":       sf(r["totalFederations"]),
        # total
        "total":                  sf(r["total"]),
    })

# ── 11. Write JS file ────────────────────────────────────────────────────────
def to_js(obj):
    """Convert to compact JS-compatible JSON (no trailing commas)."""
    return json.dumps(obj, ensure_ascii=False, separators=(",",":"))

lines = [
    "// AUTO-GENERATED by generate_data.py – do not edit manually",
    "",
    f"export const campeonatos = {to_js(campeonatos)};",
    f"export const estadios = {to_js(estadios)};",
    f"export const partidas = {to_js(partidas)};",
    f"export const setores = {to_js(setores)};",
    f"export const times = {to_js(times)};",
    f"export const torcedores = {to_js(torcedores)};",
    "",
    "// Fact tables (compact)",
    f"export const bordero = {to_js(bordero)};",
    f"export const ingressos = {to_js(ingressos)};",
    "",
    "// Pre-computed aggregations",
    f"export const kpis = {to_js(kpis)};",
    f"export const faturamentoPorPartida = {to_js(faturamentoPorPartida)};",
    f"export const publicoPorTorcedor = {to_js(publicoPorTorcedor)};",
    f"export const publicoETicketPorTime = {to_js(publicoETicketPorTime)};",
    f"export const faturamentoPorCampeonatoAno = {to_js(faturamentoPorCampeonatoAno)};",
    f"export const faturamentoPorMes = {to_js(faturamentoPorMes)};",
    f"export const faturamentoPorSetor = {to_js(faturamentoPorSetor)};",
    f"export const unitarioPorTimeESetor = {to_js(unitarioPorTimeESetor)};",
    f"export const faturamentoPorAdversario = {to_js(faturamentoPorAdversario)};",
    f"export const noShowAnalysis = {to_js(noShowAnalysis)};",
    f"export const noShowPorTorcedor = {to_js(noShowPorTorcedor)};",
    f"export const precosPorTimeETorcedor = {to_js(precosPorTimeETorcedor)};",
    f"export const publicoPorSetorPartida = {to_js(publicoPorSetorPartida)};",
    f"export const torcedorCols = {to_js(torcedorCols)};",
    f"export const allSetorNames = {to_js(all_setor_names)};",
    f"export const plPorPartida = {to_js(plPorPartida)};",
    "",
    "// Convenience: unique campeonato names",
    f"export const CAMPEONATOS = {to_js(sorted(set(p['campeonato'] for p in partidas if p['campeonato'])))};",
    "",
    "// Convenience: unique setor names present in bordero",
    f"export const SETORES = {to_js(sorted(set(b['idSetor'] for b in bordero)))};",
]

OUT.write_text("\n".join(lines), encoding="utf-8")
print(f"\n✓ Written {OUT}")
print(f"  campeonatos: {len(campeonatos)}")
print(f"  estadios: {len(estadios)}")
print(f"  partidas: {len(partidas)}")
print(f"  setores: {len(setores)}")
print(f"  times: {len(times)}")
print(f"  torcedores: {len(torcedores)}")
print(f"  bordero rows: {len(bordero)}")
print(f"  ingressos rows: {len(ingressos)}")
print(f"  faturamentoPorPartida: {len(faturamentoPorPartida)}")
print(f"  noShowAnalysis: {len(noShowAnalysis)}")
print(f"  publicoPorSetorPartida: {len(publicoPorSetorPartida)}")
print(f"  torcedorCols: {torcedorCols}")
print(f"  KPIs: {kpis}")
