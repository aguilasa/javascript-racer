---
id: CORR-RACER-016
title: "Correção: RacerGame.update() calcula playerSegment após avançar position, um frame fora de fase com o original"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-RACER-016: `RacerGame.update()` calcula `playerSegment` após avançar `position`, um frame fora de fase com o original

## Problema identificado

- **Arquivo com o problema:** `app/src/core/RacerGame.ts` (`update(dt)`)
- **Estado atual:**

  ```ts
  update(dt: number): void {
    const startPosition  = this.position
    this.position        = Util.increase(this.position, dt * this.speed, this.road.trackLength)

    const playerSegment  = this.road.findSegment(this.position + this.playerZ)   // usa position JÁ avançada

    this.updateLateralForces(dt, playerSegment)
    // ...
    this.updateParallax(dt, playerSegment, startPosition)
    // ...
  }
  ```

  No original `v2.curves.html` (`docs/03-v2-curvas.md#34-força-centrífuga-em-updatedt`):

  ```javascript
  function update(dt) {
    var playerSegment = findSegment(position+playerZ);   // usa position ANTES de avançar
    var speedPercent   = speed/maxSpeed;
    var dx             = dt * 2 * speedPercent;

    position = Util.increase(position, dt * speed, trackLength);   // avança DEPOIS

    skyOffset  = Util.increase(skyOffset,  skySpeed  * playerSegment.curve * speedPercent, 1);
    // ...
    playerX = playerX - (dx * speedPercent * playerSegment.curve * centrifugal);
    // ...
  }
  ```

  A ordem está invertida: o original calcula `playerSegment` a partir da posição **anterior** a
  este tick (antes de `position` avançar), enquanto a versão portada avança `position` primeiro e
  só depois calcula `playerSegment` — ou seja, usa o segmento correspondente a **onde o jogador
  vai estar depois deste tick**, não onde estava ao entrar nele. Isso desloca em exatamente um
  frame (1/60s) o momento em que a curvatura de um novo segmento passa a influenciar a força
  centrífuga e o parallax do fundo.
- **Por que está errado:** diverge do algoritmo documentado em `docs/03-v2-curvas.md`
  linha a linha. Na prática o efeito é pequeno (o deslocamento de posição por tick é limitado a,
  no máximo, um segmento inteiro — ver `docs/02-v1-estrada-reta.md`, nota sobre `maxSpeed` — e só
  na velocidade máxima), mas é uma divergência real de comportamento, não apenas de estilo.

## Causa raiz

O "esqueleto" de `update()` em `RacerGame.ts` foi definido na RACER-TASK-09, antes de existir qualquer versão que usasse `playerSegment` (a v1 não usa essa variável) — a ordem `avança position → calcula playerSegment` foi escolhida sem uma versão real para validar contra, e a RACER-TASK-11 reaproveitou esse esqueleto sem ajustar a ordem ao introduzir o primeiro uso real de `playerSegment`.

## Correção

### Arquivo/alvo: `app/src/core/RacerGame.ts`

Calcular `playerSegment` **antes** de avançar `this.position`, replicando a ordem do original:

```ts
update(dt: number): void {
  const startPosition  = this.position
  const playerSegment  = this.road.findSegment(this.position + this.playerZ)

  this.position = Util.increase(this.position, dt * this.speed, this.road.trackLength)

  this.updateLateralForces(dt, playerSegment)
  // ...restante inalterado, usando o mesmo playerSegment já calculado
}
```

## Verificação

- [ ] `playerSegment` em `update()` é calculado a partir de `this.position` **antes** da linha
      `this.position = Util.increase(...)`
- [ ] `v1.html` continua funcionando (não usa `playerSegment` diretamente na v1, mas a ordem não
      pode quebrar `render()`, que recalcula seu próprio `playerSegment` separadamente)
- [ ] `mise exec -- npm run typecheck` e `mise exec -- npm run build` sem erros

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:** Movido o cálculo de `playerSegment` em `RacerGame.update()` para antes da linha que avança `this.position`, replicando a ordem do original `v2.curves.html`. Isso garante que a curvatura usada para força centrífuga e parallax corresponda ao segmento onde o jogador estava ao entrar no tick, não onde estará depois dele. Typecheck e build passam. A v1 não é afetada (não usa `playerSegment` diretamente).

**Problemas encontrados:** Nenhum.

**Arquivos criados/modificados:**
- `app/src/core/RacerGame.ts` (ordem: playerSegment antes de position advancement)
