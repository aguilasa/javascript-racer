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

- [ ] `Game` scene constrói a `Road` com a receita da v4-final (sem sprites/carros ainda)
- [ ] Loop de projeção/desenho reproduz `RacerGame.render()` (sem física de jogador ainda)
- [ ] Validação visual: pista aparece com a perspectiva/curvas/morros corretos, parada
- [ ] `mise exec -- npm run build` sem erros
- [ ] Commit feito em `feature/phaser-port`

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
