---
id: CORR-RACER-018
title: "Correção: RacerGame.update() chama updateParallax() após o bloco de aceleração, usando a velocidade já atualizada em vez da anterior ao frame"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-RACER-018: `RacerGame.update()` chama `updateParallax()` após o bloco de aceleração/frenagem, usando a velocidade já atualizada em vez da anterior ao frame

## Problema identificado

- **Arquivo com o problema:** `app/src/core/RacerGame.ts` (`update(dt)`)
- **Estado atual:**

  ```ts
  update(dt: number): void {
    const startPosition  = this.position
    const playerSegment  = this.road.findSegment(this.position + this.playerZ)

    this.position        = Util.increase(this.position, dt * this.speed, this.road.trackLength)

    this.updateLateralForces(dt, playerSegment)

    if (this.keyFaster)
      this.speed = Util.accelerate(this.speed, this.accel, dt)
    else if (this.keySlower)
      this.speed = Util.accelerate(this.speed, this.breaking, dt)
    else
      this.speed = Util.accelerate(this.speed, this.decel, dt)

    if (((this.playerX < -1) || (this.playerX > 1)) && (this.speed > this.offRoadLimit))
      this.speed = Util.accelerate(this.speed, this.offRoadDecel, dt)

    this.playerX = Util.limit(this.playerX, -2, 2)
    this.speed   = Util.limit(this.speed,   0,  this.maxSpeed)

    this.updateParallax(dt, playerSegment, startPosition)   // <-- speed já mudou aqui
    this.updateExtras(dt)
  }
  ```

  E `RacerGameV2.updateParallax()` (`app/src/versions/v2-curves/RacerGameV2.ts:40-45`):

  ```ts
  protected updateParallax(_dt: number, playerSegment: Segment, _startPosition: number): void {
    const speedPercent = this.speed / this.maxSpeed   // usa this.speed JÁ acelerado/freado/clampado
    this.skyOffset = Util.increase(this.skyOffset, this.skySpeed * playerSegment.curve * speedPercent, 1)
    this.hillOffset = Util.increase(this.hillOffset, this.hillSpeed * playerSegment.curve * speedPercent, 1)
    this.treeOffset = Util.increase(this.treeOffset, this.treeSpeed * playerSegment.curve * speedPercent, 1)
  }
  ```

  No original `v2.curves.html` (`docs/03-v2-curvas.md#34-força-centrífuga-em-updatedt`):

  ```javascript
  function update(dt) {
    var playerSegment = findSegment(position+playerZ);
    var speedPercent   = speed/maxSpeed;              // captura speed ANTES de acelerar/frear
    var dx             = dt * 2 * speedPercent;

    position = Util.increase(position, dt * speed, trackLength);

    skyOffset  = Util.increase(skyOffset,  skySpeed  * playerSegment.curve * speedPercent, 1);
    hillOffset = Util.increase(hillOffset, hillSpeed * playerSegment.curve * speedPercent, 1);
    treeOffset = Util.increase(treeOffset, treeSpeed * playerSegment.curve * speedPercent, 1);

    if (keyLeft) playerX = playerX - dx;
    else if (keyRight) playerX = playerX + dx;
    playerX = playerX - (dx * speedPercent * playerSegment.curve * centrifugal);

    if (keyFaster)                                    // acelera/freia SÓ DEPOIS
      speed = Util.accelerate(speed, accel, dt);
    // ...
  }
  ```

  No original, `speedPercent` é capturado **uma única vez**, logo no topo da função, a partir do
  `speed` do frame anterior, e reaproveitado tanto para o deslocamento lateral (`dx`) quanto para
  os três acumuladores de parallax (`skyOffset`/`hillOffset`/`treeOffset`) — tudo isso acontece
  **antes** do bloco `if (keyFaster)/.../offRoadDecel` que efetivamente muda `speed` naquele
  frame. Na versão portada, `updateLateralForces()` (chamada antes do bloco de aceleração) recebe
  corretamente o `speed` "antigo", mas `updateParallax()` foi posicionada **depois** do bloco de
  aceleração/frenagem/fora-de-pista e do `Util.limit`, então o `speedPercent` calculado dentro
  dela já reflete o `speed` **deste** frame (pós-aceleração), não o anterior.

- **Por que está errado:** viola a paridade de comportamento exigida pelo plano
  (`docs/projeto/00-visao-geral.md`, critério de sucesso 3: *"a versão TypeScript deve jogar
  identicamente à original... mesma física, mesma sensação"*) e a instrução explícita de
  `docs/projeto/prompts/01-executar.md` de "preservar fórmulas/constantes numéricas do original
  byte-a-byte". O efeito prático é sutil (o `speed` só muda por `accel*dt` ≈ `maxSpeed/300` por
  frame a 60 fps), mas é uma divergência real e sistemática do algoritmo documentado em
  `docs/03-v2-curvas.md#34`, análoga em natureza ao já corrigido `CORR-RACER-016` (mesma classe
  de bug: um ponto de extensão do "esqueleto" `update()` lendo estado já mutado por um passo
  posterior do próprio `update()`, em vez do estado congelado no início do frame). Como
  `updateParallax()` é o mesmo ponto de extensão que será reaproveitado por `RacerGameV3`/
  `RacerGameV4` (RACER-TASK-12/15, ainda não implementadas — v3 adiciona o parallax vertical
  sobre a mesma base), o bug se propagaria automaticamente para as próximas versões se não for
  corrigido agora no "esqueleto" compartilhado.

## Causa raiz

O "esqueleto" de `update()` em `RacerGame.ts` posiciona a chamada a `updateParallax()` depois do
bloco de aceleração/frenagem/fora-de-pista — a mesma classe de problema do `CORR-RACER-016`
(ordem de um ponto de extensão em relação a uma mutação de estado dentro do próprio `update()`),
desta vez entre `updateParallax()` e o bloco de `speed`, em vez de entre `playerSegment` e
`position`.

## Correção

### Arquivo/alvo: `app/src/core/RacerGame.ts`

Mover a chamada a `this.updateParallax(dt, playerSegment, startPosition)` para **antes** do bloco
`if (this.keyFaster) / else if (this.keySlower) / else`, logo após `this.updateLateralForces(...)`
— replicando a ordem do original, em que os acumuladores de parallax são atualizados com o mesmo
`speed` "congelado" usado pela força centrífuga/deslocamento lateral, antes de `speed` mudar neste
frame:

```ts
this.updateLateralForces(dt, playerSegment)
this.updateParallax(dt, playerSegment, startPosition)

if (this.keyFaster)
  this.speed = Util.accelerate(this.speed, this.accel, dt)
// ...
```

## Verificação

- [ ] `updateParallax()` é chamada antes do bloco de aceleração/frenagem/fora-de-pista em
      `RacerGame.update()`, usando o `this.speed` do início do frame (mesmo valor usado por
      `updateLateralForces()`)
- [ ] `v1.html` continua funcionando (não sobrescreve `updateParallax`, é no-op)
- [ ] `v2.html` continua jogável, sem mudança perceptível de sensação (o efeito é sutil por
      natureza — validar que nada quebrou, não uma diferença visual esperada)
- [ ] `mise exec -- npm run typecheck` e `mise exec -- npm run build` sem erros

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:** Movido a chamada `this.updateParallax(dt, playerSegment, startPosition)` em `RacerGame.update()` para antes do bloco de aceleração/frenagem/fora-de-pista, logo após `this.updateLateralForces()`. Isso garante que `RacerGameV2.updateParallax()` calcule `speedPercent` a partir do `this.speed` do início do frame (mesmo valor usado pela força centrífuga), replicando a ordem do original `v2.curves.html`. Typecheck e build passam. A v1 não é afetada (não sobrescreve `updateParallax`, é no-op).

**Problemas encontrados:** Nenhum.

**Arquivos criados/modificados:**
- `app/src/core/RacerGame.ts` (ordem: updateParallax antes do bloco de aceleração)
