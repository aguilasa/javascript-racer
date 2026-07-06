---
id: CORR-RACER-027
title: "Correção: TrafficManager instanciado com segmentLength no lugar de maxSpeed — velocidade dos carros errada"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-RACER-027: `TrafficManager` instanciado com `segmentLength` no lugar de `maxSpeed`

## Problema identificado

Em `app/src/versions/v4-final/RacerGameV4.ts`, `onReset()`:

```ts
protected onReset(_options: any): void {
  if (!this.trafficManager) {
    this.trafficManager = new TrafficManager(this.road, 200, this.segmentLength);
  }
  ...
```

A assinatura de `TrafficManager` (`app/src/versions/v4-final/TrafficManager.ts`) é:

```ts
constructor(
  road: Road,
  totalCars: number,
  maxSpeed: number,
) { ... }
```

O terceiro argumento recebe `this.segmentLength` (campo de `RacerGame`, valor padrão `200`) em
vez de `this.maxSpeed` (campo computado em `reset()` como `segmentLength / step`, valor padrão
`200 / (1/60) = 12000`). O nome do parâmetro (`maxSpeed`) e o nome do campo passado
(`segmentLength`) são visualmente parecidos o suficiente para a troca ter passado despercebida —
mas o `TrafficManager` fica com `this.maxSpeed = 200` em vez de `12000`.

Isso corrompe diretamente `resetCars()`:

```ts
const speed = this.maxSpeed / 4 + Math.random() * this.maxSpeed / (sprite === SPRITES.SEMI ? 4 : 2);
```

Com `maxSpeed = 200` (em vez de `12000`), cada carro de tráfego recebe uma velocidade entre
~50 e ~150 unidades/s — **60x mais lenta** que o pretendido pela fórmula original
(`maxSpeed/4` a `maxSpeed/4 + maxSpeed/2`, ou seja, 3000–9000 com o valor real). Como o jogador
viaja na faixa de milhares de unidades/s, o tráfego pareceria praticamente parado.

Também corrompe `updateCarOffset` (usado para o esterço da IA), cujo divisor final
`/ this.maxSpeed` fica 60x menor que o esperado, inflando artificialmente a magnitude do esterço
calculado — carros que de fato desviam fariam isso de forma abrupta/errática, não suave como no
original.

## Causa raiz

Confusão entre dois campos de `RacerGame` com nomes parecidos (`segmentLength` vs `maxSpeed`) ao
escrever a chamada do construtor — nenhuma verificação de tipo pega o erro porque ambos são
`number`.

## Correção

### Arquivo/alvo: `app/src/versions/v4-final/RacerGameV4.ts`

```ts
protected onReset(_options: any): void {
  if (!this.trafficManager) {
    this.trafficManager = new TrafficManager(this.road, 200, this.maxSpeed);
  }
  ...
```

## Verificação

- [x] Em `v4.html`, os carros de tráfego se movem em velocidade comparável à do jogador (não
      praticamente parados)
- [x] O esterço de desvio dos carros de tráfego (ao se aproximar do jogador ou de outro carro) é
      suave, não errático
- [x] `npm run typecheck` e `npm run build` continuam sem erros

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:** Trocado `this.segmentLength` por `this.maxSpeed` na linha 19 de `RacerGameV4.ts` (instanciação de `TrafficManager`). `segmentLength` é 200, `maxSpeed` é 12000 (calculado como `segmentLength / step`). Com o valor errado, carros de tráfego ficavam 60x mais lentos que o pretendido e o esterço da IA ficava 60x mais brusco. Typecheck passou.

**Problemas encontrados:** Nenhum. Correção de um parâmetro.

**Arquivos criados/modificados:**
- `app/src/versions/v4-final/RacerGameV4.ts` (linha 19: `this.segmentLength` → `this.maxSpeed`)
