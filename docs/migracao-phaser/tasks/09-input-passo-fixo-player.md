---
id: PHASER-TASK-09
title: "Ligar input de teclado e passo fixo em Game.update; sprite do jogador via pool"
type: implementação
category: frontend
phase: 3
depends_on: ["PHASER-TASK-08"]
status: pendente
---

# PHASER-TASK-09: Ligar input de teclado e passo fixo em `Game.update`; sprite do jogador via pool

## Contexto

- **Fonte:** `app/src/core/GameLoop.ts` (acumulador de passo fixo), `app/src/core/InputController.ts`
  (bindings de teclado), `app/src/core/Renderer.ts#player` (escolha de sprite por
  esterço/subida + bounce).
- **Plano completo:** `docs/migracao-phaser/01-arquitetura-alvo.md`, seções "Passo fixo dentro
  do `Scene.update`" e a linha da tabela referente a `InputController.ts`.
- Depende da PHASER-TASK-08 (`RacerEngine` já precisa existir e ter `update(dt)` funcionando).

## Objetivo

1. Na `Game` scene, ligar `this.input.keyboard.addKeys(...)` para setas + WASD, atualizando as
   flags `keyLeft`/`keyRight`/`keyFaster`/`keySlower` de `RacerEngine` a cada frame (via
   `.isDown`).
2. Implementar o acumulador de passo fixo dentro de `Game.update(time, delta)`: manter um `gdt`
   (tempo de "dívida" acumulado) somando `delta / 1000` a cada chamada, e rodar
   `racerEngine.update(step)` (`step = 1/60`) quantas vezes forem necessárias para consumir essa
   dívida — mesmo padrão de `GameLoop.start()`, incluindo o `Math.min(1, dt)` de proteção contra
   deltas enormes (aba em segundo plano).
3. Criar o pool de `Image` do jogador: uma única `Phaser.GameObjects.Image` reaproveitada,
   trocando de frame (`PLAYER_STRAIGHT`/`PLAYER_LEFT`/`PLAYER_RIGHT`/`PLAYER_UPHILL_*`) conforme
   esterço/subida, com o mesmo "bounce" vertical aleatório proporcional à velocidade (ver
   `Renderer.player()`).

## Requisitos da implementação

- As quatro flags (`keyLeft`, `keyRight`, `keyFaster`, `keySlower`) continuam existindo em
  `RacerEngine` exatamente como campos públicos/settáveis — a `Game` scene só as atualiza a
  partir do estado do teclado do Phaser, sem duplicar a lógica de `update()` (que continua
  100% dentro de `RacerEngine`).
- Mapeamento de teclas: setas (`LEFT`/`RIGHT`/`UP`/`DOWN`) e WASD (`A`/`D`/`W`/`S`) — os mesmos
  `KEY` já portados em `constants.ts` (PHASER-TASK-03), ou os códigos nomeados equivalentes do
  Phaser (`Phaser.Input.Keyboard.KeyCodes`).
- Escolha de sprite do jogador (`PLAYER_STRAIGHT`/`PLAYER_LEFT`/`PLAYER_RIGHT`/
  `PLAYER_UPHILL_*`): reproduzir a mesma lógica condicional de `Renderer.player()` (esterço via
  `speed * (keyLeft ? -1 : keyRight ? 1 : 0)`, subida via diferença de altura do segmento do
  jogador).
- Posição de tela do jogador: `width/2` horizontalmente, `getPlayerScreenY()` verticalmente
  (calculado por `RacerEngine.getRenderState()`, ver PHASER-TASK-08).

## Passos

1. Ler `app/src/core/GameLoop.ts` e `app/src/core/InputController.ts` por completo.
2. Implementar o input e o passo fixo na `Game` scene.
3. Implementar o pool/`Image` do jogador.
4. Rodar `mise exec -- npm run dev` e dirigir manualmente: confirmar que setas/WASD aceleram/
   freiam/esterçam, e que a pista rola sob a câmera de forma suave (sem soluços de framerate).

## Critério de conclusão

- [ ] Input de teclado (setas + WASD) atualiza as flags de `RacerEngine`
- [ ] Acumulador de passo fixo implementado em `Game.update`, com proteção `Math.min(1, dt)`
- [ ] Sprite do jogador troca de frame conforme esterço/subida, com bounce proporcional à
      velocidade
- [ ] Validação manual: dirigível, pista rola sob a câmera de forma suave
- [ ] `mise exec -- npm run build` sem erros
- [ ] Commit feito em `feature/phaser-port`

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:**
Implementado input de teclado, passo fixo e sprite do jogador na `Game` scene:
- Adicionado `RacerEngine` à scene, inicializado com `reset()` no `create()`
- Input de teclado via `this.input.keyboard.addKeys()` para setas (LEFT/RIGHT/UP/DOWN) e WASD (A/D/W/S), atualizando as flags `keyLeft`/`keyRight`/`keyFaster`/`keySlower` do `RacerEngine` a cada frame
- Acumulador de passo fixo em `Game.update(time, delta)`: mantém `gdt` (tempo acumulado) somando `delta / 1000` com proteção `Math.min(1, dt)`, e roda `racerEngine.update(step)` quantas vezes necessário para consumir a dívida (mesmo padrão de `GameLoop.start`)
- Pool de `Image` do jogador: única `Phaser.GameObjects.Image` reaproveitada, trocando de frame (`PLAYER_STRAIGHT`/`PLAYER_LEFT`/`PLAYER_RIGHT`/`PLAYER_UPHILL_*`) conforme esterço/subida com a mesma lógica de `Renderer.player()`
- Bounce vertical aleatório proporcional à velocidade (fórmula `1.5 * Math.random() * speedPercent * resolution * randomChoice([-1, 1])`)
- Posição de tela do jogador: `width/2` horizontalmente, `getPlayerScreenY()` verticalmente (calculado por `RacerEngine.getRenderState()`)
- `renderRoad()` simplificado para usar `RacerEngine.getRenderState()` em vez de duplicar a lógica de projeção

**Problemas encontrados:**
Após a implementação, foi identificado que `renderRoad()` tinha bugs de reindexação e culling que impediam a pista de ser desenhada (tela ficava só com o céu). Isso foi corrigido pela CORR-PHASER-009.

**Arquivos criados/modificados:**
- Modificado: `racer-phaser/src/game/scenes/Game.ts` (adicionado RacerEngine, input, passo fixo, sprite do jogador, renderPlayer())
- Modificado: `docs/migracao-phaser/tasks/progresso.md` (status PHASER-TASK-09 marcado como ✅ Concluído, checklist atualizado)
