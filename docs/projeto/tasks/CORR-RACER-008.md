---
id: CORR-RACER-008
title: "Correção: Road.addLowRollingHills() só implementa a variante v4 — não há como recuperar o comportamento original da v3"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-RACER-008: `Road.addLowRollingHills()` só implementa a variante v4

## Problema identificado

`docs/projeto/tasks/08-criar-classe-road.md` instrui a implementar a DSL "usando a versão de
`v4.final.html` (superconjunto das versões anteriores)", partindo da premissa de que as funções
de construção de pista são idênticas entre `v2`/`v3`/`v4` (documentada em
`docs/projeto/01-arquitetura-alvo.md`: "a v4 usa exatamente a mesma DSL que a v2/v3, só com uma
receita mais longa").

Comparando `v3.hills.html` e `v4.final.html` função por função (`addSegment`, `addRoad`,
`addStraight`, `addHill`, `addCurve`, `addSCurves`, `addBumps`, `addDownhillToEnd`), todas são
byte-idênticas entre as duas versões — **exceto `addLowRollingHills`**:

```js
// v3.hills.html — todas as curvas são 0
function addLowRollingHills(num, height) {
  num    = num    || ROAD.LENGTH.SHORT;
  height = height || ROAD.HILL.LOW;
  addRoad(num, num, num,  0,  height/2);
  addRoad(num, num, num,  0, -height);
  addRoad(num, num, num,  0,  height);   // <- v3: curva 0
  addRoad(num, num, num,  0,  0);
  addRoad(num, num, num,  0,  height/2); // <- v3: curva 0
  addRoad(num, num, num,  0,  0);
}

// v4.final.html — duas chamadas do meio usam ROAD.CURVE.EASY
function addLowRollingHills(num, height) {
  num    = num    || ROAD.LENGTH.SHORT;
  height = height || ROAD.HILL.LOW;
  addRoad(num, num, num,  0,                height/2);
  addRoad(num, num, num,  0,               -height);
  addRoad(num, num, num,  ROAD.CURVE.EASY,  height);   // <- v4: curva
  addRoad(num, num, num,  0,                0);
  addRoad(num, num, num, -ROAD.CURVE.EASY,  height/2); // <- v4: curva
  addRoad(num, num, num,  0,                0);
}
```

`app/src/core/Road.ts` implementou apenas a variante v4 (hardcoded `ROAD.CURVE.EASY`/
`-ROAD.CURVE.EASY`), sem expor a curva como parâmetro:

```ts
addLowRollingHills(num?: number, height?: number): void {
  const n = num    || ROAD.LENGTH.SHORT
  const h = height || ROAD.HILL.LOW
  this.addRoad(n, n, n,  0,                h / 2)
  this.addRoad(n, n, n,  0,               -h)
  this.addRoad(n, n, n,  ROAD.CURVE.EASY,  h)
  this.addRoad(n, n, n,  0,                0)
  this.addRoad(n, n, n, -ROAD.CURVE.EASY,  h / 2)
  this.addRoad(n, n, n,  0,                0)
}
```

Diferente de `addStraight` (onde a arquitetura já justifica explicitamente que `curve=0`
recupera o comportamento da v1 — ver `01-arquitetura-alvo.md`, "Decisão intencional"), aqui **não
existe** forma de a futura `RacerGameV3.buildRoad()` (RACER-TASK-12) recuperar o trecho de morros
sem curva do `v3.hills.html` original — o valor está fixo dentro do método compartilhado. Se
RACER-TASK-12 simplesmente chamar `road.addLowRollingHills()` (como as demais versões fariam),
o traçado da v3 portada terá curvas onde o original não tinha — uma divergência real de
"paridade de comportamento" (objetivo explícito do projeto em `00-visao-geral.md`, item 3), não
percebida agora porque nenhuma versão ainda consome este método (RACER-TASK-10/11/12 ainda estão
pendentes).

## Causa raiz

A tarefa tratou a DSL de construção de pista como um superconjunto uniforme entre v2/v3/v4 (o
que é verdade para 7 das 8 funções), mas `addLowRollingHills` é a única exceção — a diferença de
curva entre v3 e v4 não foi percebida durante a transcrição, e o método foi implementado com o
valor da v4 fixo em vez de parametrizado.

## Correção

### Arquivo/alvo: `app/src/core/Road.ts`

Expor a curva como parâmetro opcional, com o valor da v4 como default (preservando o
comportamento atual sem exigir mudança nos futuros call sites de v4), permitindo que a v3 passe
`0` explicitamente:

```diff
-  addLowRollingHills(num?: number, height?: number): void {
+  addLowRollingHills(num?: number, height?: number, curve: number = ROAD.CURVE.EASY): void {
     const n = num    || ROAD.LENGTH.SHORT
     const h = height || ROAD.HILL.LOW
     this.addRoad(n, n, n,  0,                h / 2)
     this.addRoad(n, n, n,  0,               -h)
-    this.addRoad(n, n, n,  ROAD.CURVE.EASY,  h)
+    this.addRoad(n, n, n,  curve,            h)
     this.addRoad(n, n, n,  0,                0)
-    this.addRoad(n, n, n, -ROAD.CURVE.EASY,  h / 2)
+    this.addRoad(n, n, n, -curve,            h / 2)
     this.addRoad(n, n, n,  0,                0)
   }
```

A futura `RacerGameV3.buildRoad()` (RACER-TASK-12) deve chamar
`this.road.addLowRollingHills(num, height, 0)` para reproduzir o traçado original da v3; a
`RacerGameV4.buildRoad()` (RACER-TASK-15) continua chamando `addLowRollingHills()` sem o
terceiro argumento, preservando o comportamento atual.

## Verificação

- [x] `Road.addLowRollingHills` aceita um terceiro parâmetro `curve`, com default
      `ROAD.CURVE.EASY` (comportamento de v4 inalterado quando chamado sem esse argumento)
- [x] Chamar `addLowRollingHills(num, height, 0)` produz uma sequência de segmentos com
      `curve === 0` em todos os 6 trechos, reproduzindo `v3.hills.html`
- [x] `cd app && mise exec -- npm run typecheck && mise exec -- npm run build` continuam
      passando sem erro
- [x] Nota adicionada ao contexto da RACER-TASK-12 (ou ao próprio `Road.ts`) lembrando de passar
      `curve: 0` ao portar o `buildRoad()` da v3

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:** Assinatura de `addLowRollingHills` alterada de
`(num?, height?)` para `(num?, height?, curve: number = ROAD.CURVE.EASY)`. As duas chamadas
internas `ROAD.CURVE.EASY`/`-ROAD.CURVE.EASY` substituídas por `curve`/`-curve`.
Comportamento de v4 preservado (call sites sem o terceiro argumento continuam idênticos).
`RacerGameV3.buildRoad()` (RACER-TASK-12) deve passar `0` explicitamente. Typecheck passa.

**Problemas encontrados:** Nenhum.

**Arquivos criados/modificados:**
- `app/src/core/Road.ts` (assinatura e corpo de `addLowRollingHills` atualizados)
