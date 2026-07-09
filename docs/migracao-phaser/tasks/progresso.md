# Progresso — Migração para Phaser

**Documentos de referência (contexto completo, não repetido aqui):**
- `docs/migracao-phaser/README.md` — índice do plano
- `docs/migracao-phaser/00-visao-geral.md` — objetivos, não-objetivos, critérios de sucesso
- `docs/migracao-phaser/01-arquitetura-alvo.md` — mapa `app/src/core`+`v4-final` → `racer-phaser/`, decisões técnicas (Graphics + pool de Image, pipeline de sprites, TileSprite)
- `docs/migracao-phaser/02-estrutura-projeto.md` — layout de pastas dentro de `racer-phaser/`, assets
- `docs/migracao-phaser/03-fases-execucao.md` — as fases das quais as tarefas abaixo derivam
- `docs/migracao-phaser/04-riscos-decisoes.md` — decisões padrão assumidas pelas tarefas abaixo

**Branch de trabalho:** todas as tarefas PHASER-TASK-01 a 19 são commitadas em
`feature/phaser-port` (criada na PHASER-TASK-01, a partir do estado atual de
`feature/ts-vite-port` — a única branch que hoje contém o scaffold `racer-phaser/` e os docs de
migração; `master` ainda não tem esse conteúdo). **Não fazer merge para `master`** até a
PHASER-TASK-20 (a única tarefa de merge, 👤).

---

## Resumo

### Fase 0 — Tooling e assets

| ID | Tarefa | Dependências | Status |
| -- | ------ | ------------ | ------ |
| PHASER-TASK-01 | Criar branch de trabalho e preparar tooling (`mise`, `npm install`) | — | ✅ Concluído |
| PHASER-TASK-02 | Copiar assets (imagens/música) para `racer-phaser/public/assets/racer/` | PHASER-TASK-01 | ✅ Concluído |

### Fase 1 — Núcleo portável (`src/game/racer/`)

| ID | Tarefa | Dependências | Status |
| -- | ------ | ------------ | ------ |
| PHASER-TASK-03 | Portar `util.ts`, `types.ts`, `constants.ts` (verbatim) | PHASER-TASK-01 | ✅ Concluído |
| PHASER-TASK-04 | Portar `sprites.ts`/`background.ts` e registrar frames nomeados no `Preloader` | PHASER-TASK-02, PHASER-TASK-03 | ✅ Concluído |
| PHASER-TASK-05 | Portar `Road.ts` (DSL de construção de pista) | PHASER-TASK-03 | ✅ Concluído |

### Fase 2 — Pista estática (`RoadRenderer`)

| ID | Tarefa | Dependências | Status |
| -- | ------ | ------------ | ------ |
| PHASER-TASK-06 | Criar `RoadRenderer` (`Graphics`) — desenho estático de um segmento | PHASER-TASK-04, PHASER-TASK-05 | ✅ Concluído |
| PHASER-TASK-07 | Integrar `Road`+`RoadRenderer` na `Game` scene (pista fixa, câmera parada) | PHASER-TASK-06 | ✅ Concluído |

### Fase 3 — Motor do jogo e player

| ID | Tarefa | Dependências | Status |
| -- | ------ | ------------ | ------ |
| PHASER-TASK-08 | Criar `RacerEngine` (física/regras fundidas de `RacerGame`+`RacerGameV4`) | PHASER-TASK-07 | ✅ Concluído |
| PHASER-TASK-09 | Ligar input de teclado + passo fixo em `Game.update`; sprite do jogador via pool | PHASER-TASK-08 | ✅ Concluído |

### Fase 4 — Parallax

| ID | Tarefa | Dependências | Status |
| -- | ------ | ------------ | ------ |
| PHASER-TASK-10 | Camadas de fundo (céu/morros/árvores) via `TileSprite` | PHASER-TASK-09 | ✅ Concluído |

### Fase 5 — Cenário e colisão fora-de-pista

| ID | Tarefa | Dependências | Status |
| -- | ------ | ------------ | ------ |
| PHASER-TASK-11 | Portar `scenery.ts` (verbatim) e pool de sprites de cenário com recorte de horizonte | PHASER-TASK-09 | ✅ Concluído |
| PHASER-TASK-12 | Colisão jogador↔sprite de cenário fora da pista | PHASER-TASK-11 | ✅ Concluído |

### Fase 6 — Tráfego

| ID | Tarefa | Dependências | Status |
| -- | ------ | ------------ | ------ |
| PHASER-TASK-13 | Portar `Car.ts`/`TrafficManager.ts` (verbatim) | PHASER-TASK-09 | ✅ Concluído |
| PHASER-TASK-14 | Pool de carros + ordenação por profundidade (`setDepth`) + colisão jogador↔carro | PHASER-TASK-11, PHASER-TASK-13 | ✅ Concluído |

### Fase 7 — HUD e tempos de volta

| ID | Tarefa | Dependências | Status |
| -- | ------ | ------------ | ------ |
| PHASER-TASK-15 | Criar `Hud.ts` (`Phaser.GameObjects.Text`) + cronometragem de volta + recorde persistido | PHASER-TASK-14 | ✅ Concluído |

### Fase 8 — Áudio e fluxo de cenas

| ID | Tarefa | Dependências | Status |
| -- | ------ | ------------ | ------ |
| PHASER-TASK-16 | Música em loop + mute persistido via Phaser Sound Manager | PHASER-TASK-15 | ✅ Concluído |
| PHASER-TASK-17 | Adaptar `MainMenu`/`GameOver` ao tema do racer e validar fluxo completo de cenas | PHASER-TASK-16 | ✅ Concluído |

### Fase 9 — Polimento, paridade e merge

| ID | Tarefa | Dependências | 👤 | Status |
| -- | ------ | ------------ | -- | ------ |
| PHASER-TASK-18 | Medir e otimizar performance do pool (200 carros + cenário denso) | PHASER-TASK-17 | | ✅ Concluído |
| PHASER-TASK-19 | Validar paridade visual/funcional com `v4.final.html`/`RacerGameV4` e atualizar `docs/migracao-phaser` | PHASER-TASK-18 | | ✅ Concluído |
| PHASER-TASK-20 | Revisar e mergear `feature/phaser-port` em `master` | PHASER-TASK-19 | 👤 | ✅ Concluído |

### Fase 10 — Tweak UI (pós-migração, retomada do item de backlog)

| ID | Tarefa | Dependências | Status |
| -- | ------ | ------------ | ------ |
| PHASER-TASK-21 | Tweak UI: controles básicos ao vivo (lanes, roadWidth, cameraHeight, drawDistance, fieldOfView, fogDensity) | PHASER-TASK-20 | ✅ Concluído |
| PHASER-TASK-22 | Tweak UI: controle de resolução (redimensionar Scale Manager/TileSprites) | PHASER-TASK-21 | ⬜ Pendente |

**Legenda:** ⬜ Pendente · 🔄 Em andamento · ✅ Concluído · ❌ Bloqueado · 👤 Requer interação/aprovação humana

---

## Grafo de dependências

```text
PHASER-TASK-01 ──┬──→ PHASER-TASK-02 ──┐
                  └──→ PHASER-TASK-03 ──┼──→ PHASER-TASK-04 ──┐
                                        └──→ PHASER-TASK-05 ──┼──→ PHASER-TASK-06 ──→ PHASER-TASK-07 ──→ PHASER-TASK-08 ──→ PHASER-TASK-09 ──┬──→ PHASER-TASK-10
                                                                                                                                              ├──→ PHASER-TASK-11 ──┬──→ PHASER-TASK-12
                                                                                                                                              │                     └──→ PHASER-TASK-14
                                                                                                                                              └──→ PHASER-TASK-13 ──────────────┘
                                                                                                                                                                                 │
                                                                                                                                                                                 ▼
                                                                                                                                                                     PHASER-TASK-15 ──→ PHASER-TASK-16 ──→ PHASER-TASK-17 ──→ PHASER-TASK-18 ──→ PHASER-TASK-19 ──→ PHASER-TASK-20 (👤)
```

**Sequência mínima de execução:**

```text
1.  PHASER-TASK-01 (branch + tooling)
2.  PHASER-TASK-02 (assets) e PHASER-TASK-03 (util/types/constants) — após 01, entre si em paralelo
3.  PHASER-TASK-04 (sprites/background + Preloader) — após 02 e 03
4.  PHASER-TASK-05 (Road) — após 03
5.  PHASER-TASK-06 (RoadRenderer) — após 04 e 05
6.  PHASER-TASK-07 (integração pista estática) — após 06
7.  PHASER-TASK-08 (RacerEngine) — após 07
8.  PHASER-TASK-09 (input + passo fixo + player) — após 08
9.  PHASER-TASK-10 (parallax) — após 09
10. PHASER-TASK-11 (scenery) — após 09
11. PHASER-TASK-12 (colisão cenário) — após 11
12. PHASER-TASK-13 (Car/TrafficManager) — após 09, pode rodar em paralelo com 10/11
13. PHASER-TASK-14 (pool de tráfego + depth + colisão) — após 11 e 13
14. PHASER-TASK-15 (Hud) — após 14
15. PHASER-TASK-16 (áudio) — após 15
16. PHASER-TASK-17 (menu/game over/fluxo) — após 16
17. PHASER-TASK-18 (performance) — após 17
18. PHASER-TASK-19 (paridade + docs) — após 18
19. PHASER-TASK-20 (merge, 👤) — após 19
```

---

## Checklist geral

### Fase 0 — Tooling e assets

- [ ] Branch `feature/phaser-port` criada a partir do estado atual (inclui `racer-phaser/` +
      `docs/migracao-phaser/`)
- [ ] `mise current node` reporta a versão fixada em `mise.toml` da raiz também dentro de
      `racer-phaser/`
- [ ] `sprites.png`/`background.png`/faixas de música copiadas para
      `racer-phaser/public/assets/racer/`

### Fase 1 — Núcleo portável

- [ ] `src/game/racer/util.ts`, `types.ts`, `constants.ts`
- [ ] `src/game/racer/sprites.ts`, `background.ts` + frames nomeados registrados no `Preloader`
- [ ] `src/game/racer/Road.ts`

### Fase 2 — Pista estática

- [x] `src/game/racer/RoadRenderer.ts` desenha um segmento via `Graphics`
- [x] `Game` scene mostra a pista fixa (sem input) com a perspectiva correta

### Fase 3 — Motor e player

- [x] `src/game/racer/RacerEngine.ts` com `update()`/`render()` fundidos
- [x] Input de teclado (setas + WASD) via `this.input.keyboard`
- [x] Sprite do jogador via pool de `Image`, dirigível

### Fase 4 — Parallax

- [x] Céu/morros/árvores como `TileSprite`, reagindo à curvatura da pista

### Fase 5 — Cenário

- [x] `src/game/racer/scenery.ts` portado
- [x] Pool de sprites de cenário com recorte de horizonte (`setCrop`)
- [x] Colisão jogador↔sprite de cenário fora da pista

### Fase 6 — Tráfego

- [x] `src/game/racer/Car.ts`, `TrafficManager.ts` portados
- [x] Pool de carros + `setDepth` (algoritmo do pintor)
- [x] Colisão jogador↔carro

### Fase 7 — HUD

- [x] `src/game/racer/Hud.ts` com velocímetro/tempo atual/última volta/recorde
- [x] Recorde persistido em `localStorage` (`fast_lap_time`)

### Fase 8 — Áudio e fluxo

- [x] Música em loop + mute persistido (`localStorage.muted`)
- [x] `MainMenu` → `Game` (e, se aplicável, `Game` → `GameOver`) funcionando

### Fase 9 — Polimento, paridade e merge

- [x] Performance validada com 200 carros + cenário denso simultâneos
- [x] Paridade visual/funcional confirmada contra `v4.final.html`/`RacerGameV4` (validação manual
      do usuário, confirmada explicitamente antes do merge — ver Log de Execução da
      PHASER-TASK-19)
- [x] `feature/phaser-port` revisada e mergeada em `master` (merge duplo `--no-ff`:
      `feature/ts-vite-port` primeiro, depois `feature/phaser-port`; push feito para
      `origin/master`)

**A migração está completa.** (O item "`docs/migracao-phaser` atualizado refletindo o estado
final" não se aplicou como pendência separada — nenhuma divergência deliberada foi reportada que
exigisse atualizar `00-visao-geral.md`/`README.md`; ver PHASER-TASK-19.)

---

## Backlog / melhorias futuras (não bloqueantes para esta migração)

Registradas em `docs/migracao-phaser/04-riscos-decisoes.md`, para não esquecer — fora do escopo
das 20 tarefas acima:

| Item | Referência |
|---|---|
| Tweak UI (painel de ajuste fino de resolução/faixas/largura da pista/etc.) | `04-riscos-decisoes.md`, "Tweak UI fora do escopo inicial" |
| Extrair matemática pura (`util`, `Road`, `Car`, `TrafficManager`, `scenery`) para um pacote compartilhado entre `app/` e `racer-phaser/` | `04-riscos-decisoes.md`, "Sem alterações em app/" |
| Ideias de expansão gerais (multiplayer, mobile/touch, novos modos) | `docs/projeto/05-ideias-expansao.md` |

---

## Decisões de design

| Decisão | Escolha | Razão |
| ------- | ------- | ----- |
| Escopo | Só v4-final (jogo único) | Decisão confirmada com o usuário — ver `01-arquitetura-alvo.md` |
| Renderização da pista | `Phaser.GameObjects.Graphics` (trapézios redesenhados por frame) | Decisão confirmada com o usuário — idiomático Phaser, aproveita o pipeline WebGL |
| Sprites/carros/player | Pool de `Phaser.GameObjects.Image`, nunca recriados por frame | Evita custo de alocação por frame — ver `04-riscos-decisoes.md` |
| Parallax de fundo | `Phaser.GameObjects.TileSprite` por camada | Scroll contínuo nativo, sem reimplementar o blit manual com wraparound |
| Estratégia de compartilhamento entre `app/` e `racer-phaser/` | Cópia manual/verbatim de arquivo, não pacote compartilhado | Mantém os dois projetos independentes; extração para pacote comum é item de backlog |
| Motor de física (`Phaser.Physics`) | Não usado | As regras do jogo são simulação escalar manual, não corpos rígidos — ver `00-visao-geral.md`, não-objetivos |
| Tweak UI | Fora do escopo inicial | Ferramenta de debug, não bloqueia critérios de sucesso — ver `04-riscos-decisoes.md` |
| Branch de trabalho | `feature/phaser-port`, só mergeada em `master` na PHASER-TASK-20 (👤) | Mantém `master` limpo até a migração estar validada e aprovada |
| Arquivos de `app/` | **Nunca alterados** pelas tarefas PHASER-TASK-01 a 19 | `racer-phaser/` é implementação irmã, não substitui o port TypeScript existente |

---

## Notas de execução

*(preenchido conforme as tarefas forem executadas — um item por tarefa concluída, com data,
resumo e arquivos afetados, espelhando o Log de Execução de cada arquivo `PHASER-TASK-XX.md`)*

- **PHASER-TASK-11 (2026-07-06):** Executada **fora de ordem** (antes da PHASER-TASK-12/13/14),
  a pedido do usuário, como correção de um artefato visual real reportado durante testes manuais
  (uma "cunha" verde-escura sobre a pista, causada por um salto de opacidade de neblina em um
  trecho de `addLowRollingHills()` que o cenário do jogo original sempre cobriu). Ver Log de
  Execução completo em `docs/migracao-phaser/tasks/11-portar-scenery-pool.md`. Nenhuma tarefa
  entre 09 e 11 precisou ser refeita — PHASER-TASK-11 dependia só da PHASER-TASK-09.
- **PHASER-TASK-17 (2026-07-07):** Durante a validação manual do fluxo completo (`Boot`→
  `Preloader`→`MainMenu`→`Game`), a checagem de console (`chromium`/Playwright headless) acusou
  `pageerror: Audio key "music" not found in cache` ao entrar em `Game`. Causa: `Game.ts` chamava
  `this.sound.add('music', ...)`, mas o `Preloader` registra a música com a chave `racer_music`
  (`this.load.audio('racer_music', ...)`, da PHASER-TASK-16). Corrigido trocando a chave em
  `Game.ts`. Ver Log de Execução completo em
  `docs/migracao-phaser/tasks/17-menu-gameover-fluxo.md`.
- **PHASER-TASK-19/20 (2026-07-08):** Usuário pediu diretamente o merge das branches `feature/*`
  em `master`. Paridade visual/funcional confirmada pelo usuário (validação feita ao longo do
  desenvolvimento, fora do fluxo formal dos prompts). Merge duplo `--no-ff`:
  `feature/ts-vite-port` (commit `cfb5b0c`) seguido de `feature/phaser-port` (commit `1d155b2`),
  ambos sem conflitos, `typecheck`/`build` limpos em `app/` e `racer-phaser/` pós-merge, push
  feito para `origin/master`. Migração para Phaser completa e mergeada. Detalhes completos nos
  Logs de Execução de `19-paridade-e-docs.md` e `20-mergear-branch-phaser-em-master.md`.
