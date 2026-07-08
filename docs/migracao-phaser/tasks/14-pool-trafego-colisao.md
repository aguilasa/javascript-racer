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

- [ ] Pool de `Image` para os 200 carros de tráfego, sem criação/destruição por frame
- [ ] Ordenação por `setDepth` unificada (sprites de cenário + carros + jogador), sem sprites
      "atravessados"
- [ ] Colisão jogador↔carro implementada com a fórmula original de penalidade de velocidade
- [ ] Validação visual: IA de desvio, ordem de desenho e colisão equivalentes à v4-final
- [ ] `mise exec -- npm run build` sem erros
- [ ] Commit feito em `feature/phaser-port`

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
