---
id: CORR-RACER-010
title: "Correção: buildRoad() base produz 501 segmentos em vez dos 500 exatos do v1 original"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-RACER-010: `buildRoad()` base produz 501 segmentos em vez de 500

## Problema identificado

O original `v1.straight.html` constrói a pista com um `for` cru de exatamente 500 segmentos:

```js
function resetRoad() {
  segments = [];
  for(var n = 0 ; n < 500 ; n++) { segments.push({ ... }); }
  ...
  trackLength = segments.length * segmentLength; // 500 * 200 = 100000
}
```

`docs/projeto/01-arquitetura-alvo.md` justifica explicitamente usar `Road.addStraight()` (a DSL
compartilhada) no lugar desse loop cru: "isso é seguro porque `addStraight` com `curve=0`/`y=0`
produz uma pista reta e plana **idêntica** à da v1 original."

A implementação-base de `buildRoad()` em `app/src/core/RacerGame.ts` chama:

```ts
protected buildRoad(): void {
  this.road = new Road(this.segmentLength, this.rumbleLength)
  this.road.addStraight(500 / 3)
  ...
}
```

`addStraight(num)` divide o comprimento em três fases iguais (`enter`/`hold`/`leave` =
`num`/`num`/`num`) via `addRoad`. Como `500/3 = 166.666...`, cada fase (um `for (n=0; n<166.667;
n++)`) roda **167** iterações, não 166 — resultando em `167 * 3 = 501` segmentos, não 500:

```bash
$ node -e "
let n=0,c=0; for(;n<500/3;n++) c++;
console.log(c);  // 167, não 166.67 arredondado para baixo
"
167
```

O trecho é de fato reto e plano (curva/altura são sempre 0, então a divisão em 3 fases não
afeta a forma) — a garantia de "pista reta idêntica" citada em `01-arquitetura-alvo.md` se
confirma nesse sentido —, mas o **comprimento total da pista diverge**: `trackLength` fica
`501 * 200 = 100200` em vez dos `100000` originais (0,2% mais longo). É uma diferença pequena e
dificilmente perceptível jogando, mas é uma divergência numérica real e evitável em relação ao
documentado "produz uma pista... idêntica".

## Causa raiz

`addStraight(num)` foi pensado para receitas de pista com números "redondos" (múltiplos de 3,
como as constantes `ROAD.LENGTH.*`), não para reproduzir um total exato de segmentos como "500".
Dividir 500 por 3 introduz uma fração que, por causa do arredondamentopara cima implícito de
`for (n=0; n<X; n++)` com `X` fracionário, produz 1 segmento a mais que o esperado.

## Correção

### Arquivo/alvo: `app/src/core/RacerGame.ts`

Substituir a chamada por `addRoad` diretamente, com `enter=500, hold=0, leave=0` — isso produz
exatamente 500 segmentos (já que `curve`/`y` são 0 em ambos os casos, a divisão em fases não
teria efeito visual mesmo se usada, mas usar uma única fase de 500 elimina o problema de
arredondamento):

```diff
   protected buildRoad(): void {
     this.road = new Road(this.segmentLength, this.rumbleLength)
-    this.road.addStraight(500 / 3)
+    this.road.addRoad(500, 0, 0, 0, 0)
     this.road.markStartFinish(this.playerZ)
     this.road.finalize()
   }
```

## Verificação

- [x] `RacerGame`'s `buildRoad()` base produz exatamente `this.road.segments.length === 500`
- [x] `this.road.trackLength` calculado por `finalize()` é `500 * segmentLength` (100000 com o
      `segmentLength` padrão de 200)
- [x] `cd app && mise exec -- npm run typecheck && mise exec -- npm run build` continuam
      passando sem erro

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:** Substituído `this.road.addStraight(500 / 3)` por
`this.road.addRoad(500, 0, 0, 0, 0)` em `buildRoad()`. Isso elimina o problema de arredondamento
(500/3 = 166.667 → 167 iterações por fase × 3 fases = 501 segmentos) e produz exatamente 500
segmentos, como o `for` cru original de `v1.straight.html`. `trackLength` agora é 100000 (500 × 200)
em vez de 100200. Typecheck passa.

**Problemas encontrados:** Nenhum.

**Arquivos criados/modificados:**
- `app/src/core/RacerGame.ts` (buildRoad: addStraight → addRoad)
