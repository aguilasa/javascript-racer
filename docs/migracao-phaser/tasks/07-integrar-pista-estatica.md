---
id: PHASER-TASK-07
title: "Integrar Road+RoadRenderer na Game scene (pista fixa, câmera parada)"
type: implementação
category: frontend
phase: 2
depends_on: ["PHASER-TASK-06"]
status: pendente
---

# PHASER-TASK-07: Integrar `Road`+`RoadRenderer` na `Game` scene (pista fixa, câmera parada)

## Contexto

- **Plano completo:** `docs/migracao-phaser/03-fases-execucao.md`, "Fase 2 — Pista estática".
- Esta é a primeira vez que o jogo aparece de fato dentro da cena `Game` do template — mas ainda
  sem física de jogador (isso é a PHASER-TASK-08/09). O objetivo aqui é só validar a projeção
  pseudo-3D (a matemática de `Util.project`) desenhando a pista parada.

## Objetivo

1. Na `Game` scene (`racer-phaser/src/game/scenes/Game.ts`), remover o placeholder atual
   (`msg_text` + fundo verde) e:
   - Construir uma `Road` fixa, com a mesma receita de `RacerGameV4.buildRoad()` (ver
     `app/src/versions/v4-final/RacerGameV4.ts`): `addStraight`, `addLowRollingHills`,
     `addSCurves`, `addCurve`, `addBumps` (o método local `addBumps`, copiado também),
     `addHill`, `addDownhillToEnd`, `markStartFinish`, `finalize` — **sem** `resetSprites()`/
     `TrafficManager.resetCars()` ainda (isso entra nas Fases 5/6).
   - Instanciar `RoadRenderer` passando a própria scene.
   - No `update()` da scene, com uma posição de câmera **fixa** (constante, sem mover ainda),
     projetar e desenhar os primeiros `drawDistance` segmentos a partir de uma posição fixa,
     reproduzindo o loop de `RacerGame.render()` (projeção via `Util.project`, descarte por
     `cameraDepth`/`maxy`, chamada a `RoadRenderer.segment(...)` por segmento visível).

## Requisitos da implementação

- Os valores de configuração (`width`, `height`, `roadWidth`, `cameraHeight`, `drawDistance`,
  `fieldOfView`, `fogDensity`, `segmentLength`, `rumbleLength`, `lanes`) usam os mesmos padrões
  de `RacerGame` (`app/src/core/RacerGame.ts`, campos no topo da classe) — não inventar novos
  valores.
- `cameraDepth = 1 / Math.tan((fieldOfView / 2) * Math.PI / 180)` — mesma fórmula de
  `RacerGame.reset()`.
- Ainda **não** é necessário criar `RacerEngine` nesta tarefa — pode ser um bloco de código
  provisório dentro da própria `Game.create()`/`update()`, que será substituído/refatorado para
  dentro de `RacerEngine` na PHASER-TASK-08. Documentar essa provisoriedade no Log de Execução.

## Passos

1. Ler `RacerGame.render()` (`app/src/core/RacerGame.ts`) e `RacerGameV4.buildRoad()`
   (`app/src/versions/v4-final/RacerGameV4.ts`) para relembrar a lógica exata.
2. Implementar a construção da `Road` fixa e o loop de projeção/desenho na `Game` scene.
3. Rodar `mise exec -- npm run dev` e conferir visualmente: a pista deve aparecer com
   perspectiva correta (estreitando ao fundo, curvas e morros visíveis), parada.

## Critério de conclusão

- [x] `Game` scene constrói a `Road` com a receita da v4-final (sem sprites/carros ainda)
- [x] Loop de projeção/desenho reproduz `RacerGame.render()` (sem física de jogador ainda)
- [x] Validação visual: pista aparece com a perspectiva/curvas/morros corretos, parada
- [x] `mise exec -- npm run build` sem erros
- [x] Commit feito em `feature/phaser-port`

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:**

- Removido o placeholder padrão do template (`msg_text`, fundo verde, `background` de
  0.5 alpha, transição por clique para `GameOver`) de `Game.ts`.
- Implementado `buildRoad()` com a receita exata de `RacerGameV4.buildRoad()`
  (`app/src/versions/v4-final/RacerGameV4.ts`), usando `road.addBumps()` diretamente — não foi
  necessário copiar um `addBumps()` local separado, como o texto original da tarefa cogitava,
  porque `Road.ts` (portado na PHASER-TASK-05) **já** inclui `addBumps()` como método público
  (verbatim de `app/src/core/Road.ts`, que já tinha esse método na tabela DSL compartilhada, não
  só como método privado de `RacerGameV4`). Desvio documentado aqui conforme pedido pela tarefa.
- Implementado `renderRoad()` reproduzindo `RacerGame.render()`: fundo de câmera na cor
  `COLORS.SKY`, `cameraY = playerY + CAMERA_HEIGHT` (câmera relativa ao terreno, comportamento de
  v3/v4 — decisão deliberada, ver texto da tarefa), loop de `drawDistance` segmentos com
  `Util.project`, mesma condição de descarte (`p1.camera.z <= cameraDepth` /
  `p2.screen.y >= p1.screen.y` / `p2.screen.y >= maxy`), e chamada a `RoadRenderer.segment(...)`.
  Câmera fixa (`position = 0`, `playerX = 0`) — sem física de jogador, como pedido; chamado a
  cada `update()` da scene (redesenha o mesmo frame repetidamente, provisório até a
  PHASER-TASK-08 mover a câmera de verdade).
- Configuração (`WIDTH`/`HEIGHT`/`ROAD_WIDTH`/`SEGMENT_LENGTH`/`RUMBLE_LENGTH`/`LANES`/
  `FIELD_OF_VIEW`/`CAMERA_HEIGHT`/`DRAW_DISTANCE`/`FOG_DENSITY`) usando os mesmos valores padrão
  de `RacerGame` (`app/src/core/RacerGame.ts`).
- **Validação visual real** feita instalando Playwright + Chromium headless (nenhuma ferramenta
  de browser estava disponível no ambiente) e navegando `Boot → Preloader → MainMenu → Game`
  via um script Node, capturando screenshots recortadas exatamente na área do `<canvas>`.
- Durante essa validação, dois bugs de runtime pré-existentes (introduzidos em tarefas/correções
  anteriores, nunca antes testados de fato num browser) bloquearam a renderização e foram
  corrigidos, com CORRs próprias abertas e já resolvidas para rastreabilidade:
  - **`CORR-PHASER-004`**: `RoadRenderer.ts`/`Game.ts` usavam `Phaser.Display.Color`/
    `Phaser.Math.Vector2` como valor global, mas só havia `import type { Scene } from 'phaser'`
    — `ReferenceError: Phaser is not defined` em runtime. Corrigido adicionando
    `import * as Phaser from 'phaser'` (import de valor) nos dois arquivos.
  - **`CORR-PHASER-005`**: `RoadRenderer.colorToNumber()` delegava para
    `Phaser.Display.Color.HexStringToColor`, que só entende hex — `COLORS.START`/`FINISH` usam
    os nomes CSS `'white'`/`'black'` (portados verbatim, corretamente, de `constants.ts`), que
    essa função falha em parsear silenciosamente, devolvendo preto. Isso fazia a linha de
    largada (2 segmentos bem perto da câmera) renderizar preta em vez de branca. Corrigido
    tratando os dois nomes explicitamente antes de delegar.
- Após as duas correções, nova captura confirmou: pista com perspectiva correta (estreitando ao
  horizonte), leve curvatura visível (início do traçado usa `addLowRollingHills`/`addSCurves`),
  grama verde, pista cinza com marcadores de faixa brancos tracejados, céu na cor `COLORS.SKY`, e
  a linha de largada (branca) visível corretamente perto da câmera. Zero erros de console/página
  na captura final.

**Problemas encontrados:** Os dois bugs de runtime acima (`CORR-PHASER-004`, `CORR-PHASER-005`)
— nenhum dos dois havia sido detectado por `tsc --noEmit`/`npm run build` (ambos passam mesmo com
os bugs presentes), só por execução real num browser. Nenhuma ferramenta de captura de tela/
browser estava pré-instalada no ambiente; foi necessário instalar Playwright + Chromium
headless (`npm install --no-save playwright` + `npx playwright install chromium`) no diretório de
scratchpad para viabilizar a validação visual desta tarefa.

**Arquivos criados/modificados:**

- `racer-phaser/src/game/scenes/Game.ts` (reescrito — placeholder removido, pista estática
  integrada)
- `racer-phaser/src/game/racer/RoadRenderer.ts` (corrigido via CORR-PHASER-004/005, ver esses
  arquivos para detalhe)
