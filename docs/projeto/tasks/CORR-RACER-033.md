---
id: CORR-RACER-033
title: "Correção: RacerGameV4.buildRoad() nunca chama markStartFinish() — pista sem largada/chegada"
type: implementação
category: frontend
status: pendente
depends_on: ["CORR-RACER-032"]
---

# CORR-RACER-033: `RacerGameV4.buildRoad()` nunca chama `markStartFinish()` — pista sem largada/chegada

## Problema identificado

Comparando `buildRoad()` nas quatro versões:

```bash
$ grep -n "markStartFinish" app/src/core/RacerGame.ts app/src/versions/v2-curves/RacerGameV2.ts app/src/versions/v3-hills/RacerGameV3.ts app/src/versions/v4-final/RacerGameV4.ts
core/RacerGame.ts:83:      this.road.markStartFinish(this.playerZ)
v2-curves/RacerGameV2.ts:26:    this.road.markStartFinish(this.playerZ)
v3-hills/RacerGameV3.ts:27:    this.road.markStartFinish(this.playerZ)
# v4-final/RacerGameV4.ts: nenhuma ocorrência
```

`RacerGameV4.buildRoad()` termina com `resetSprites(this.road)`, `this.trafficManager.resetCars()`
e `this.road.finalize()`, mas **nunca chama** `this.road.markStartFinish(this.playerZ)` — o
método que pinta os segmentos de largada (`COLORS.START`) e chegada (`COLORS.FINISH`).

`docs/05-v4-final.md#510` mostra explicitamente que o `resetRoad()` original da v4 faz isso:

```javascript
function resetRoad() {
  segments = [];
  addStraight(...);
  ...
  resetSprites();
  resetCars();
  // START/FINISH e trackLength, como nas versões anteriores
}
```

O comentário "START/FINISH e trackLength, como nas versões anteriores" deixa claro que a v4
original preserva essa marcação — só foi elidido no trecho de código citado no capítulo por
brevidade. Sem essa chamada, a pista da v4 portada nunca exibe a faixa quadriculada de
largada/chegada, uma diferença visual perceptível em qualquer comparação lado a lado com
`v4.final.html`.

## Causa raiz

Mesma classe de omissão do `CORR-RACER-032`: ao portar a receita de `resetRoad()` da v4, a
chamada final de "marcar largada/chegada", presente em todas as outras versões, foi omitida.

## Correção

### Arquivo/alvo: `app/src/versions/v4-final/RacerGameV4.ts`

Adicionar a chamada antes de `this.road.finalize()`, na mesma posição relativa usada por
`RacerGameV2`/`RacerGameV3` (depois da geometria e sprites/carros, antes de finalizar):

```ts
protected buildRoad(): void {
  this.road = new Road(this.segmentLength, this.rumbleLength); // CORR-RACER-032

  this.road.addStraight(ROAD.LENGTH.SHORT);
  ...
  this.road.addDownhillToEnd();

  resetSprites(this.road);
  this.trafficManager.resetCars();

  this.road.markStartFinish(this.playerZ);
  this.road.finalize();
}
```

## Verificação

- [ ] Em `v4.html`, a faixa quadriculada de largada/chegada aparece na pista (comparável a
      `v4.final.html`)
- [ ] `npm run typecheck` e `npm run build` continuam sem erros

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
