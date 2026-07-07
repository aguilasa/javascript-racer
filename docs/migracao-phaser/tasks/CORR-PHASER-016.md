---
id: CORR-PHASER-016
title: "Correção: colisão jogador↔sprite de cenário usa playerSegment desatualizado e roda antes do clamp final de playerX/speed"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-PHASER-016: colisão contra cenário — `playerSegment` desatualizado + ordem errada

## Problema identificado

- **Arquivo:** `racer-phaser/src/game/racer/RacerEngine.ts`, método `update(dt)`
- **Estado atual:**
  ```ts
  update(dt: number): void {
    const startPosition  = this.position
    const playerSegment  = this.road.findSegment(this.position + this.playerZ)  // (A) "antigo"

    this.position = Util.increase(this.position, dt * this.speed, this.road.trackLength)

    this.updateLateralForces(dt, playerSegment)
    this.updateParallax(dt, playerSegment, startPosition)

    if (this.keyFaster) ...
    ...
    if (((this.playerX < -1) || (this.playerX > 1)) && (this.speed > this.offRoadLimit))
      this.speed = Util.accelerate(this.speed, this.offRoadDecel, dt)

    // Collision against scenery sprites (PHASER-TASK-12)
    if ((this.playerX < -1) || (this.playerX > 1)) {
      const playerW = SPRITES.PLAYER_STRAIGHT.w * SPRITES.SCALE
      for (const sprite of playerSegment.sprites) {   // <- (B) reusa o playerSegment "antigo" (A)
        ...
        if (Util.overlap(this.playerX, playerW, spriteOffset, spriteW)) {
          this.speed = this.maxSpeed / 5
          this.position = Util.increase(playerSegment.p1.world.z, -this.playerZ, this.road.trackLength)
          break
        }
      }
    }

    this.playerX = Util.limit(this.playerX, -this.offRoadHardLimit, this.offRoadHardLimit)  // <- (C) clamp final, DEPOIS da colisão
    this.speed   = Util.limit(this.speed,   0,  this.maxSpeed)
  }
  ```
- **Por que está errado — dois problemas no mesmo bloco:**

  1. **`playerSegment` desatualizado (o mais sério):** no original
     (`app/src/core/RacerGame.ts#update` + `app/src/versions/v4-final/RacerGameV4.ts#updateExtras`),
     existem **dois** `playerSegment` conceitualmente distintos por frame:
     - o computado no topo de `RacerGame.update()`, a partir da posição **antes** de avançar —
       usado só por `updateLateralForces`/`updateParallax` (precisam do segmento em que o
       jogador **estava** no início do frame, para curva/centrífuga/parallax daquele instante);
     - um **recomputado do zero** dentro de `RacerGameV4.updateExtras()`, a partir de
       `this.position + this.playerZ` **depois** de `this.position` já ter avançado:
       ```ts
       // RacerGameV4.updateExtras (original)
       protected updateExtras(dt: number): void {
         const playerSegment = this.road.findSegment(this.position + this.playerZ); // posição NOVA
         ...
       }
       ```
     O `racer-phaser` só tem **uma** variável `playerSegment`, calculada uma vez no topo (a
     versão "antiga"), e o bloco de colisão a reaproveita — nunca recalcula com a posição já
     avançada. Em qualquer frame onde o jogador cruza de um segmento para o seguinte (comum em
     velocidade alta, já que cada segmento tem só 200 unidades), a colisão é checada contra os
     sprites do segmento **errado** (onde o jogador estava, não onde está agora, depois do
     movimento deste frame) — podendo perder colisões reais ou nunca detectar algumas.
  2. **Ordem em relação ao clamp final:** no original, a chamada a `updateExtras()` (que contém a
     colisão) só acontece **depois** de `this.playerX = Util.limit(...)`/`this.speed =
     Util.limit(...)` (ver corpo de `RacerGame.update()`, a última linha antes de `updateExtras`
     é o clamp). No `racer-phaser`, o bloco de colisão foi inserido **antes** desse clamp —
     rodando com um `playerX` potencialmente ainda fora de `[-offRoadHardLimit,
     offRoadHardLimit]` (`[-3,3]` na v4), divergindo do original em frames de força centrífuga
     muito forte.

## Causa raiz

Ao portar o trecho de `RacerGameV4.updateExtras`, foi copiada só a lógica interna da colisão, sem
notar que o método original recomputa seu próprio `playerSegment` (usando a posição já avançada)
e é chamado **depois** do clamp final — não durante o corpo de `RacerGame.update()` onde o
`playerSegment` "antigo" ainda está em escopo.

## Correção

### Arquivo/alvo: `racer-phaser/src/game/racer/RacerEngine.ts`

Mover o bloco de colisão para depois do clamp final **e** recomputar `playerSegment` a partir da
posição já atualizada nesse ponto (mesmo padrão de `this.road.findSegment(this.position +
this.playerZ)` usado no topo de `update()`, mas chamado de novo, depois que `this.position` já
mudou):

```ts
this.playerX = Util.limit(this.playerX, -this.offRoadHardLimit, this.offRoadHardLimit)
this.speed   = Util.limit(this.speed,   0,  this.maxSpeed)

// Collision against scenery sprites (PHASER-TASK-12) — roda depois do clamp final e recalcula
// playerSegment com a posição já atualizada neste frame, igual à ordem de RacerGame.update()
// → RacerGameV4.updateExtras() no original (que recomputa playerSegment, não reaproveita o
// calculado no topo de update()).
const collisionSegment = this.road.findSegment(this.position + this.playerZ)
if ((this.playerX < -1) || (this.playerX > 1)) {
  const playerW = SPRITES.PLAYER_STRAIGHT.w * SPRITES.SCALE
  for (const sprite of collisionSegment.sprites) {
    const spriteW = sprite.source.w * SPRITES.SCALE
    const spriteOffset = sprite.offset + spriteW / 2 * (sprite.offset > 0 ? 1 : -1)
    if (Util.overlap(this.playerX, playerW, spriteOffset, spriteW)) {
      this.speed = this.maxSpeed / 5
      this.position = Util.increase(collisionSegment.p1.world.z, -this.playerZ, this.road.trackLength)
      break
    }
  }
}
```

(nome `collisionSegment` só para deixar explícito que é um recálculo distinto do `playerSegment`
usado mais acima em `updateLateralForces`/`updateParallax` — pode ser renomeado livremente na
execução da correção, desde que o recálculo aconteça).

## Verificação

- [x] `playerSegment` usado na colisão é recalculado a partir de `this.position` **já
      atualizado** neste frame, não reaproveitado do topo de `update()`
- [x] Bloco de colisão executa **depois** de `this.playerX = Util.limit(...)` e `this.speed =
      Util.limit(...)`
- [x] `mise exec -- npm run build` sem erros
- [x] Validação manual: colisão contra sprites continua funcionando, especialmente em alta
      velocidade (cruzando de segmento dentro do mesmo frame) — sem regressão

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-07

**Resumo do que foi feito:**
Corrigido dois problemas no bloco de colisão jogador↔sprite de cenário em `RacerEngine.update()`:
- Movido o bloco de colisão para depois do clamp final de `playerX`/`speed` (igual à ordem do original `RacerGame.update()` → `RacerGameV4.updateExtras()`)
- Adicionado recálculo de `playerSegment` (nomeado `collisionSegment`) a partir de `this.position` já atualizado neste frame, em vez de reaproveitar o `playerSegment` calculado no topo de `update()` (posição antes de avançar)
- Isso garante que a colisão seja checada contra os sprites do segmento correto (onde o jogador está, não onde estava) e com valores já clampados, evitando perder colisões em alta velocidade ou divergir do original em curvas fortes

**Problemas encontrados:**
Nenhum.

**Arquivos criados/modificados:**
- Modificado: `racer-phaser/src/game/racer/RacerEngine.ts` (bloco de colisão movido para depois do clamp, adicionado recálculo de collisionSegment)
- Modificado: `docs/migracao-phaser/tasks/correcoes-progresso.md` (status CORR-PHASER-016 marcado como [x] concluído, checklist atualizado)
