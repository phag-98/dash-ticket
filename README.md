# Dash Ticket — Dashboard de Bilheteria (SAF Botafogo)

Dashboard de análise de bilheteria, público e resultado financeiro de partidas,
construído em **React 19 + Vite**. Os dados de jogos, setores, torcedores e
financeiro são consolidados a partir de planilhas Excel e renderizados em gráficos
interativos (Recharts).

## Abas

| Aba | Conteúdo |
|-----|----------|
| **Championship Report** | Visão por campeonato: público, faturamento e ticket médio por partida |
| **Comparativo** | Comparação entre partidas / adversários |
| **Setores** | Ocupação e faturamento por setor do estádio |
| **No Show** | Análise de público que comprou mas não compareceu |
| **Visão Geral** | KPIs gerais, dispersão público × ticket, sócios |
| **Preços** | Valor unitário por time e tipo de ingresso |
| **P&L** | Demonstrativo de receitas e custos por partida |

## Como rodar

Requer Node.js 18+.

```bash
npm install      # instala dependências
npm run dev      # ambiente de desenvolvimento (http://localhost:5173)
npm run build    # build de produção em dist/
npm run preview  # serve o build de produção localmente
npm run lint     # ESLint
```

## Dados

A camada de dados é **gerada**, não editada à mão.

- As fontes são os arquivos `.xlsx` na raiz (`dPartidas.xlsx`, `dSetores.xlsx`,
  `fIngressos.xlsx`, `fBordero.xlsx`, `dCampeonatos.xlsx`, etc.).
- O script `generate_data.py` lê essas planilhas, agrega/normaliza os dados e
  escreve `src/data/data.js` (já pré-calculado e ordenado para o front-end).

Para regenerar após atualizar as planilhas:

```bash
pip install pandas openpyxl
python generate_data.py
```

> ⚠️ Não edite `src/data/data.js` manualmente — ele é sobrescrito pelo script.

## Estrutura

```
src/
  main.jsx            # entrypoint React
  App.jsx             # layout + navegação por abas
  tokens.js           # design tokens (cores, fontes, sombras)
  teamLogos.jsx       # mapas de logos/cores dos times + componentes de tick
  data/data.js        # dados gerados (não editar)
  pages/              # uma página por aba
public/logos/         # escudos dos times e campeonatos
generate_data.py      # pipeline xlsx -> data.js
```

## Stack

- React 19 · Vite 8
- Recharts (gráficos) · lucide-react (ícones)
- ESLint (flat config)
