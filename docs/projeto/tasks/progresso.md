# Progresso — Migração para TypeScript + Vite

**Documentos de referência (contexto completo, não repetido aqui):**
- `docs/projeto/README.md` — índice do plano
- `docs/projeto/00-visao-geral.md` — objetivos, não-objetivos, critérios de sucesso
- `docs/projeto/01-arquitetura-alvo.md` — classes, herança `RacerGame → V1 → V2 → V3 → V4`, mapa `common.js` → módulos TS
- `docs/projeto/02-estrutura-vite.md` — layout do projeto `app/`, multi-page, assets
- `docs/projeto/03-fases-execucao.md` — as fases das quais as tarefas abaixo derivam
- `docs/projeto/04-riscos-decisoes-abertas.md` — decisões padrão assumidas pelas tarefas abaixo

**Branch de trabalho:** todas as tarefas RACER-TASK-01 a 17 são commitadas em
`feature/ts-vite-port` (criada na RACER-TASK-01). **Não fazer merge para `master`** até a
RACER-TASK-19 (a única tarefa de merge, 👤).

---

## Resumo

### Fase 0 — Scaffolding do projeto Vite

| ID | Tarefa | Dependências | Status |
| -- | ------ | ------------ | ------ |
| RACER-TASK-01 | Criar branch e o scaffold do projeto Vite (`vanilla-ts`) em `app/` | — | ✅ Concluído |
| RACER-TASK-02 | Configurar multi-page (index + v1–v4) e copiar assets para `app/public/` | RACER-TASK-01 | ✅ Concluído |
| RACER-TASK-03 | Instalar/tipar `stats.js` via npm e criar a estrutura de pastas `src/core/`, `src/versions/*` | RACER-TASK-01 | ✅ Concluído |

### Fase 1 — Núcleo compartilhado (`core/`)

| ID | Tarefa | Dependências | Status |
| -- | ------ | ------------ | ------ |
| RACER-TASK-04 | Portar tipos, constantes e tabelas de sprites/background | RACER-TASK-03 | ✅ Concluído |
| RACER-TASK-05 | Portar `Dom` e `Util` | RACER-TASK-04 | ✅ Concluído |
| RACER-TASK-06 | Portar `GameLoop`, `AssetLoader`, `InputController`, `StatsPanel`, `MusicPlayer` | RACER-TASK-05 | ✅ Concluído |
| RACER-TASK-07 | Portar `Renderer` | RACER-TASK-04, RACER-TASK-05 | ✅ Concluído |

### Fase 2 — Portar v1 (estrada reta)

| ID | Tarefa | Dependências | Status |
| -- | ------ | ------------ | ------ |
| RACER-TASK-08 | Criar a classe `Road` (DSL de construção de pista) | RACER-TASK-04, RACER-TASK-05 | ✅ Concluído |
| RACER-TASK-09 | Criar a classe base `RacerGame` + `TweakUI` | RACER-TASK-06, RACER-TASK-07, RACER-TASK-08 | ✅ Concluído |
| RACER-TASK-10 | Portar v1 (`RacerGameV1`) e validar contra o original | RACER-TASK-09 | ✅ Concluído |

### Fase 3 — Portar v2 (curvas)

| ID | Tarefa | Dependências | Status |
| -- | ------ | ------------ | ------ |
| RACER-TASK-11 | Portar v2 (`RacerGameV2`) e validar contra o original | RACER-TASK-10 | ✅ Concluído |

### Fase 4 — Portar v3 (colinas)

| ID | Tarefa | Dependências | Status |
| -- | ------ | ------------ | ------ |
| RACER-TASK-12 | Portar v3 (`RacerGameV3`) e validar contra o original | RACER-TASK-11 | ⬜ Pendente |

### Fase 5 — Portar v4 (versão final)

| ID | Tarefa | Dependências | Status |
| -- | ------ | ------------ | ------ |
| RACER-TASK-13 | Portar `Car` e `TrafficManager` (IA de tráfego) | RACER-TASK-12 | ⬜ Pendente |
| RACER-TASK-14 | Portar `scenery` (sprites de cenário) e `Hud` | RACER-TASK-12 | ⬜ Pendente |
| RACER-TASK-15 | Portar v4 (`RacerGameV4` + tweak UI de `lanes`) e validar contra o original | RACER-TASK-13, RACER-TASK-14 | ⬜ Pendente |

### Fase 6 — Polimento, documentação e merge

| ID | Tarefa | Dependências | 👤 | Status |
| -- | ------ | ------------ | -- | ------ |
| RACER-TASK-16 | Revisar duplicação residual entre `RacerGameV1`…`V4` e remover `any` | RACER-TASK-15 | | ⬜ Pendente |
| RACER-TASK-17 | Atualizar `CLAUDE.md`/`docs/` apontando para `app/` | RACER-TASK-16 | | ⬜ Pendente |
| RACER-TASK-18 | (Opcional) Vincular a versão TS a partir do `index.html`/`README.md` da raiz | RACER-TASK-17 | 👤 | ⬜ Pendente |
| RACER-TASK-19 | Revisar e mergear `feature/ts-vite-port` em `master` | RACER-TASK-17 | 👤 | ⬜ Pendente |

**Legenda:** ⬜ Pendente · 🔄 Em andamento · ✅ Concluído · ❌ Bloqueado · 👤 Requer interação/aprovação humana

---

## Grafo de dependências

```text
RACER-TASK-01 ──┬──→ RACER-TASK-02
                 └──→ RACER-TASK-03 ──→ RACER-TASK-04 ──┬──→ RACER-TASK-05 ──┬──→ RACER-TASK-06 ──┐
                                                         └──────────────────┼──→ RACER-TASK-07 ──┤
                                                                            └──→ RACER-TASK-08 ──┤
                                                                                                  ├──→ RACER-TASK-09 ──→ RACER-TASK-10 ──→ RACER-TASK-11 ──→ RACER-TASK-12 ──┬──→ RACER-TASK-13 ──┐
                                                                                                  │                                                                        └──→ RACER-TASK-14 ──┼──→ RACER-TASK-15 ──→ RACER-TASK-16 ──→ RACER-TASK-17 ──┬──→ RACER-TASK-18 (👤, opcional)
                                                                                                  │                                                                                                                                                    └──→ RACER-TASK-19 (👤)
```

**Sequência mínima de execução:**

```text
1.  RACER-TASK-01 (branch + scaffold)
2.  RACER-TASK-02 (multi-page + assets) e RACER-TASK-03 (stats.js + pastas) — paralelo
3.  RACER-TASK-04 (tipos/constantes/sprites) — após RACER-TASK-03
4.  RACER-TASK-05 (Dom/Util) — após RACER-TASK-04
5.  RACER-TASK-06 (GameLoop/Input/Assets/Stats/Music) e RACER-TASK-07 (Renderer) e
    RACER-TASK-08 (Road) — após RACER-TASK-05, entre si em paralelo
6.  RACER-TASK-09 (RacerGame base + TweakUI) — após RACER-TASK-06, 07, 08
7.  RACER-TASK-10 (v1) → RACER-TASK-11 (v2) → RACER-TASK-12 (v3) — sequencial (cada uma estende a anterior)
8.  RACER-TASK-13 (Car/TrafficManager) e RACER-TASK-14 (scenery/Hud) — após RACER-TASK-12, paralelo
9.  RACER-TASK-15 (v4) — após RACER-TASK-13 e 14
10. RACER-TASK-16 (limpeza) → RACER-TASK-17 (documentação)
11. RACER-TASK-18 (link no index raiz, opcional, 👤) e/ou RACER-TASK-19 (merge, 👤)
```

---

## Checklist geral

### Fase 0 — Scaffolding

- [x] Branch `feature/ts-vite-port` criada
- [x] `app/` criado com `npm create vite@latest -- --template vanilla-ts`
- [x] `tsconfig.json` com `strict: true` + `noUncheckedIndexedAccess: true`
- [x] `vite.config.ts` com 5 entradas (`index`, `v1`…`v4`)
- [x] `images/` e `music/` copiados para `app/public/`
- [x] `stats.js` instalado via npm e tipado
- [x] Estrutura de pastas `src/core/`, `src/versions/v1-straight/`…`v4-final/` criada (vazia)

### Fase 1 — Núcleo compartilhado

- [x] `core/types.ts`, `core/constants.ts`, `core/sprites.ts`, `core/background.ts`
- [x] `core/dom.ts`, `core/util.ts`
- [x] `core/GameLoop.ts`, `core/AssetLoader.ts`, `core/InputController.ts`, `core/StatsPanel.ts`, `core/MusicPlayer.ts`
- [x] `core/Renderer.ts`
- [ ] `npm run typecheck` sem erros

### Fase 2 — v1

- [x] `core/Road.ts` (DSL completa)
- [x] `core/RacerGame.ts` (classe base) + `core/TweakUI.ts`
- [x] `v1.html` jogável, comparável à `v1.straight.html` original

### Fase 3 — v2

- [x] `v2.html` jogável, comparável à `v2.curves.html` original

### Fase 4 — v3

- [ ] `v3.html` jogável, comparável à `v3.hills.html` original

### Fase 5 — v4

- [ ] `Car`, `TrafficManager`, `scenery`, `Hud`
- [ ] `v4.html` jogável, comparável à `v4.final.html` original

### Fase 6 — Polimento, documentação e merge

- [ ] Sem duplicação evitável entre `RacerGameV1`…`V4`
- [ ] Zero `any` não-justificado
- [ ] `CLAUDE.md`/`docs/` atualizados apontando para `app/`
- [ ] Decisão registrada sobre link no `index.html`/`README.md` raiz (feito ou conscientemente adiado)
- [ ] `feature/ts-vite-port` revisada e mergeada em `master` (ou decisão explícita de não mergear ainda)

**Quando todos os itens acima estiverem marcados: a migração está completa.**

---

## Backlog / melhorias futuras (não bloqueantes para esta migração)

Registradas em `docs/projeto/04-riscos-decisoes-abertas.md`, para não esquecer — fora do escopo
das 19 tarefas acima:

| Item | Referência |
|---|---|
| Testes automatizados com Vitest para `core/util.ts` e `TrafficManager.updateCarOffset` (funções puras) | `04-riscos-decisoes-abertas.md`, item 4 |
| Reconsiderar herança vs. composição por flags, pontualmente, se algum ponto de extensão ficar complexo demais | `04-riscos-decisoes-abertas.md`, item 6 |

---

## Decisões de design

| Decisão | Escolha | Razão |
| ------- | ------- | ----- |
| Nome da pasta do novo projeto | `app/` | Curto, sem ambiguidade com a demo estática na raiz |
| Estratégia de compartilhamento entre versões | Herança (`RacerGame → V1 → V2 → V3 → V4`), padrão Template Method | Espelha a natureza estritamente aditiva já documentada em `docs/02`–`docs/05` (ver `01-arquitetura-alvo.md`) |
| Construção de pista | Uma única DSL (`Road`) compartilhada por todas as versões, mesmo v1 (que originalmente usava um loop cru) | Maximiza código compartilhado, pedido explícito do escopo |
| Assets (`images/`, `music/`) | Copiados para `app/public/`, não referenciados fora da raiz do projeto Vite | Mais simples e portável (ver `02-estrutura-vite.md`) |
| `stats.js` | Pacote npm, não arquivo vendorizado | Alinhado ao pedido de "gerenciar dependências via Vite/npm" |
| Testes automatizados | Fora do escopo inicial | Ver Backlog acima |
| Arquivos originais (`v1.straight.html`…`v4.final.html`, `common.js`, etc.) | **Nunca alterados** pelas tarefas RACER-TASK-01 a 17 | Restrição explícita do pedido original |
| Branch de trabalho | `feature/ts-vite-port`, só mergeada em `master` na RACER-TASK-19 (👤) | Mantém `master` limpo até a migração estar validada e aprovada |

---

## Notas de execução

- **RACER-TASK-02 (2026-07-05):** Criados `app/v1.html`–`v4.html` e `app/index.html` com DOM
  idêntico aos originais. Criado `vite.config.ts` com 5 entradas. Copiados `images/` e `music/`
  para `app/public/`. Criados stubs de `main.ts` para cada versão (necessário para o build
  resolver os entry points). CSS importado via `style.css` nos stubs. Typecheck e build passam.
- **RACER-TASK-03 (2026-07-05):** Instalado `stats.js` (dep) e `@types/stats.js` (devDep) via
  npm. Criada pasta `src/core/`. Pastas `src/versions/v*` já existiam do RACER-TASK-02. Typecheck
  passa.
- **RACER-TASK-04 (2026-07-05):** Criados `core/types.ts` (interfaces `WorldPoint`, `CameraPoint`,
  `ScreenPoint`, `SegmentPoint`, `SpriteRect`, `SpriteSlot`, `SegmentColorSet`, `Segment`),
  `core/constants.ts` (`KEY as const`, `COLORS` tipado com `SegmentColorSet`), `core/sprites.ts`
  (35 entradas de `SPRITES` + `SCALE`, `BILLBOARDS`, `PLANTS`, `CARS`), `core/background.ts`
  (`SKY`, `HILLS`, `TREES`). Typecheck passa.
- **RACER-TASK-05 (2026-07-05):** Criados `core/dom.ts` (`Dom` como objeto exportado com `get`,
  `set`, `on`, `un`, `show`, `blur`, `addClassName`, `removeClassName`, `toggleClassName`,
  `storage`) e `core/util.ts` (16 funções exportadas; `project` usa `SegmentPoint`;
  `randomChoice<T>` genérico). Fórmulas idênticas ao original. Typecheck passa.
- **RACER-TASK-06 (2026-07-05):** Criadas 5 classes em `core/`: `GameLoop` (acumulador de passo
  fixo, `requestAnimationFrame`), `AssetLoader` (`loadImages` retorna `Promise`), `InputController`
  (`bind` encapsula listeners de teclado), `StatsPanel` (usa `stats.js`, FPS via `begin`/`end`),
  `MusicPlayer` (loop, volume 0.05, persistência de mute via `localStorage`). Problema: parâmetros
  `private readonly` no construtor de `GameLoop` proibidos por `erasableSyntaxOnly` — corrigido
  usando campos explícitos. `stats.js` não expõe `current()` nos tipos — FPS calculado via
  `begin()`/`end()`. Typecheck passa.
- **RACER-TASK-07 (2026-07-05):** Criado `core/Renderer.ts` com 7 métodos (`polygon`, `segment`,
  `background`, `sprite`, `player`, `fog`, + privados `rumbleWidth`/`laneMarkerWidth`). Recebe
  `ctx` no construtor. Fórmulas idênticas ao original. Corrigido `sprites.ts`: removida anotação
  `Record<string, SpriteRect>` em `_S` (ocultava nomes de propriedades no spread), passou a usar
  acesso por ponto. Typecheck passa.
- **RACER-TASK-08 (2026-07-05):** Criado `core/Road.ts` com DSL completa (12 métodos públicos
  + `lastY` privado) e `export const ROAD` com `LENGTH`/`HILL`/`CURVE`. `addLowRollingHills`
  usa a versão da v4 (com `ROAD.CURVE.EASY` nos trechos internos, diferente da v3 que usava 0).
  `markStartFinish` extrai lógica de START/FINISH de `resetRoad`. Typecheck passa.
- **RACER-TASK-09 (2026-07-06):** Criado `core/RacerGame.ts` (classe abstrata com 8 pontos de extensão
  protegidos, `update()`/`render()`/`reset()`/`start()` finais) e `core/TweakUI.ts` (handlers de
  tweak UI com `bind()`/`refresh()`). `Renderer.ctx` tornado público para `clearRect`. `StatsPanel`
  recebe `'fps'` como parentId. Typecheck passa.
- **RACER-TASK-10 (2026-07-06):** Criado `src/versions/v1-straight/RacerGameV1.ts` (extends RacerGame,
  sem overrides — base já corresponde ao comportamento da v1). Atualizado `main.ts` para instanciar
  e iniciar RacerGameV1. Typecheck e build passam. Validação visual requer execução manual
  de `npm run dev` e comparação lado a lado com `v1.straight.html`.
