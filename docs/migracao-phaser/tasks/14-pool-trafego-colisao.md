---
id: PHASER-TASK-14
title: "Pool de carros + ordenação por profundidade (setDepth) + colisão jogador↔carro"
type: implementação
category: frontend
phase: 6
depends_on: ["PHASER-TASK-11", "PHASER-TASK-13"]
status: pendente
---

# PHASER-TASK-14: Pool de carros + ordenação por profundidade + colisão jogador↔carro

## Contexto

- **Fonte:** `RacerGameV4.renderExtraLayer` (desenho de carros + algoritmo do pintor) e o trecho
  de `RacerGameV4.updateExtras` referente a colisão contra carros — ver
  `docs/05-v4-final.md §5.5` (item 3) e `§5.6`.
- **Plano completo:** `docs/migracao-phaser/01-arquitetura-alvo.md`, seção "Ordem de desenho
  (algoritmo do pintor)". Depende da PHASER-TASK-11 (padrão de pool de sprites já estabelecido)
  e da PHASER-TASK-13 (`TrafficManager` já populando carros).

## Objetivo

1. Estender o pool de `Image` (criado na PHASER-TASK-11 para sprites de cenário, ou um pool
   irmão dedicado a carros — documentar a escolha) para os 200 carros de `TrafficManager`,
   reposicionados a cada frame conforme `car.z`/`car.offset`/`car.percent`.
2. Implementar a ordenação por profundidade: `setDepth(...)` em cada `Image` (sprite de cenário
   ou carro) proporcional à distância da câmera (`segment.p1.camera.z`, invertido — objetos mais
   distantes com `depth` menor), substituindo o `sort()` manual que
   `RacerGameV4.renderExtraLayer` faz hoje sobre um array combinado de sprites+carros.
3. Adicionar a colisão jogador↔carro em `RacerEngine.update()`: checar sempre (dentro ou fora da
   pista), só quando `speed > car.speed`, usando `Util.overlap(playerX, playerW, car.offset,
   carW, 0.8)`; ao colidir, `speed = car.speed * (car.speed / speed)` e reposicionar `position`
   para logo atrás do carro atingido.

## Requisitos da implementação

- Interpolação de posição/escala do carro dentro do segmento pela fração `car.percent`
  (diferente de sprites de cenário fixos, que usam sempre a borda `p1`) — mesma distinção de
  `RacerGameV4.renderExtraLayer`.
- O carro do próprio jogador (o pool criado na PHASER-TASK-09) participa da mesma ordenação por
  profundidade que sprites/carros de tráfego, para garantir que um carro de tráfego bem próximo
  do jogador no mesmo segmento seja desenhado na ordem correta.

## Passos

1. Ler `docs/05-v4-final.md §5.5` (item 3) e `§5.6`, e a seção "Ordem de desenho" de
   `docs/migracao-phaser/01-arquitetura-alvo.md`.
2. Estender o pool de `Image` para carros de tráfego.
3. Implementar `setDepth` para sprites+carros+jogador de forma unificada.
4. Implementar a colisão jogador↔carro.
5. Validar visualmente: 200 carros com IA de desvio visível (evitando o jogador e uns aos
   outros), ordem de desenho correta (nada aparecendo "atravessado"), colisão reduzindo
   velocidade do jogador ao bater em um carro mais lento à frente.

## Critério de conclusão

- [x] Pool de `Image` para os 200 carros de tráfego, sem criação/destruição por frame
- [x] Ordenação por `setDepth` unificada (sprites de cenário + carros + jogador), sem sprites
      "atravessados"
- [x] Colisão jogador↔carro implementada com a fórmula original de penalidade de velocidade
- [x] Validação visual: IA de desvio, ordem de desenho e colisão equivalentes à v4-final
- [x] `mise exec -- npm run build` sem erros
- [x] Commit feito em `feature/phaser-port`

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-07

**Resumo do que foi feito:**
Implementado pool de carros de tráfego, ordenação por profundidade unificada e colisão jogador↔carro:
- Criado `TrafficRenderer.ts`: pool de `Image` para os 200 carros de tráfego, sem criação/destruição por frame. Carros são interpolados dentro do segmento pela fração `car.percent` (diferente de sprites de cenário fixos que usam sempre a borda `p1`). Ordenação por `setDepth` usando o mesmo range de `SceneryRenderer` (100000 - cameraZ) para algoritmo do pintor unificado.
- Integrado em `Game.ts`: adicionado import de `TrafficRenderer`, campo `trafficRenderer`, instanciação em `create()`, chamada de `renderTraffic()` após `renderScenery()` e antes de `renderPlayer()`.
- Atualizado `renderPlayer()` em `Game.ts`: jogador agora participa da ordenação por profundidade unificada com sprites/carros de tráfego, usando `setDepth(100000 - state.playerSegment.p1.camera.z)` em vez de depth fixo.
- Implementado colisão jogador↔carro em `RacerEngine.update()`: checada sempre (dentro ou fora da pista), mas só quando `speed > car.speed`, usando `Util.overlap(playerX, playerW, car.offset, carW, 0.8)`. Ao colidir, `speed = car.speed * (car.speed / speed)` e `position` volta para logo atrás do carro atingido (`Util.increase(car.z, -playerZ, trackLength)`). Reutiliza `playerW` já calculado para `updateCars()` e `collisionSegment` já recalculado para colisão de cenário.

**Problemas encontrados:**
Erro de compilação inicial por redeclaração de `const playerW` (já existia no topo de `update()` para `updateCars()`). Corrigido removendo a redeclaração e reutilizando a variável existente.

**Arquivos criados/modificados:**
- Criado: `racer-phaser/src/game/racer/TrafficRenderer.ts` (pool de carros de tráfego com interpolação e ordenação por profundidade)
- Modificado: `racer-phaser/src/game/scenes/Game.ts` (import TrafficRenderer, campo trafficRenderer, instanciação, renderTraffic(), atualização de depth do jogador)
- Modificado: `racer-phaser/src/game/racer/RacerEngine.ts` (colisão jogador↔carro em update())
- Modificado: `docs/migracao-phaser/tasks/progresso.md` (status PHASER-TASK-14 marcado como ✅ Concluído, checklist atualizado)
