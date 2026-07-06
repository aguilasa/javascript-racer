---
id: CORR-RACER-015
title: "Correção: Road.addSCurves() embute alturas de colina (v3/v4) — v2 exibe hills onde deveria ser só curva plana"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-RACER-015: `Road.addSCurves()` embute alturas de colina (v3/v4) — v2 exibe hills onde deveria ser só curva plana

## Problema identificado

- **Arquivo com o problema:** `app/src/core/Road.ts` (método `addSCurves`)
- **Estado atual:**

  ```ts
  addSCurves(): void {
    this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY,    ROAD.HILL.NONE)
    this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.MEDIUM,  ROAD.HILL.MEDIUM)
    this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.EASY,   -ROAD.HILL.LOW)
    this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY,    ROAD.HILL.MEDIUM)
    this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.MEDIUM, -ROAD.HILL.MEDIUM)
  }
  ```

  Esses valores de altura (`ROAD.HILL.NONE`/`MEDIUM`/`-LOW`/`MEDIUM`/`-MEDIUM`) foram copiados
  **literalmente da `addSCurves()` de `v3.hills.html`/`v4.final.html`**
  (confirmado: `grep -n "function addSCurves" -A 6 v3.hills.html` e `v4.final.html` mostram os
  mesmos 5 valores de altura, byte-idênticos entre v3 e v4). A `addSCurves()` de
  **`v2.curves.html`** (`docs/03-v2-curvas.md#33`, e confirmado lendo o `v2.curves.html`
  original) é uma função diferente, com apenas 4 argumentos por chamada — **sem nenhum
  parâmetro de altura**:

  ```javascript
  function addSCurves() {
    addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY);
    addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.MEDIUM);
    addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.EASY);
    addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY);
    addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.MEDIUM);
  }
  ```

  Isso porque, na v2, segmentos **nunca têm `y`** — a coordenada de altura só é introduzida na
  v3 (`docs/04-v3-colinas.md`). `RacerGameV2.buildRoad()`
  (`app/src/versions/v2-curves/RacerGameV2.ts:14,19,23`) chama `this.road.addSCurves()` (a
  variante compartilhada, com hills) três vezes, replicando exatamente a receita do
  `resetRoad()` original de `v2.curves.html` — mas como o método compartilhado embute alturas
  de v3/v4, os segmentos criados por essas três chamadas acabam com `p2.world.y` não-nulo.

  `Util.project()` (`app/src/core/util.ts:81`) usa `p.world.y` diretamente
  (`p.camera.y = (p.world.y ?? 0) - cameraY`) independentemente de qual versão está rodando —
  não há nenhuma guarda que zere o efeito da altura para v1/v2. Como `RacerGameV1`/`RacerGameV2`
  não sobrescrevem `getCameraY()` (câmera fixa em `cameraHeight`, correto para v1/v2 per
  `docs/projeto/01-arquitetura-alvo.md`, tabela "Onde cada versão diverge de fato"), o resultado
  visual é: nos trechos de S-curve, a pista sobe e desce (colinas) mesmo a câmera sendo fixa —
  exatamente o sintoma relatado pelo usuário comparando `v2.html` com `v2.curves.html`.

- **Por que está errado:** a v2 original é **estritamente plana** — nenhum segmento tem `y`
  diferente de outro (`docs/03-v2-curvas.md`, "3.7 O que permanece igual" nem sequer menciona
  altura, porque ela simplesmente não existe até a v3). Reaproveitar a `addSCurves()` de v3/v4
  sem neutralizar a altura viola a paridade de comportamento (`docs/projeto/00-visao-geral.md`,
  critério de sucesso "a versão TypeScript deve jogar identicamente à original").

## Causa raiz

`Road.addSCurves()` foi implementado copiando a versão de `v3.hills.html`/`v4.final.html` (a única encontrada com um `grep` rápido pelo nome da função nos quatro arquivos originais, já que v3/v4 v têm exatamente a mesma versão), sem notar que `v2.curves.html` tem uma `addSCurves()` própria e mais simples, sem parâmetro de altura — o mesmo tipo de armadilha já documentado no CORR-RACER-008 (que resolveu o caso análogo em `addLowRollingHills`, v3 vs v4).

## Correção

### Arquivo/alvo: `app/src/core/Road.ts`

Adicionar um parâmetro opcional que permite zerar a altura, preservando o comportamento atual (v3/v4) como padrão — mesmo padrão usado pelo CORR-RACER-008:

```ts
addSCurves(withHills: boolean = true): void {
  const h = withHills ? 1 : 0
  this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY,    ROAD.HILL.NONE   * h)
  this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.MEDIUM,  ROAD.HILL.MEDIUM * h)
  this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.EASY,   -ROAD.HILL.LOW    * h)
  this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY,    ROAD.HILL.MEDIUM * h)
  this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.MEDIUM, -ROAD.HILL.MEDIUM * h)
}
```

### Arquivo/alvo: `app/src/versions/v2-curves/RacerGameV2.ts`

Nas 3 chamadas de `addSCurves()` dentro de `buildRoad()`, passar `false` explicitamente:

```ts
this.road.addSCurves(false)
```

(as 3 ocorrências, linhas 14/19/23 do arquivo atual)

`RacerGameV3`/`RacerGameV4` (RACER-TASK-12/15, ainda não implementadas) devem continuar chamando `this.road.addSCurves()` sem argumento, preservando o comportamento atual (default `true`).

## Verificação

- [ ] `mise exec -- npm run dev`, abrir `v2.html`: os trechos de S-curve não apresentam nenhuma
      variação de altura — pista permanece visualmente plana durante toda a curva
- [ ] Comparação visual com `v2.curves.html` original: sensação de curva idêntica, sem hills
- [ ] `Road.addSCurves()` chamada sem argumento continua produzindo o mesmo traçado de hoje
      (para não quebrar a futura RACER-TASK-12/15, que dependem do comportamento atual)
- [ ] `mise exec -- npm run typecheck` e `mise exec -- npm run build` sem erros

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:** Adicionado parâmetro opcional `withHills: boolean = true` a `Road.addSCurves()` que multiplica todas as alturas por `h = withHills ? 1 : 0`. Atualizado `RacerGameV2.buildRoad()` para passar `false` nas 3 chamadas de `addSCurves()`, garantindo que a v2 permaneça plana (sem `world.y` nos segmentos de S-curve), igual ao `v2.curves.html` original. Typecheck e build passam. Validação visual (S-curves sem hills) requer execução manual de `npm run dev`.

**Problemas encontrados:** Nenhum.

**Arquivos criados/modificados:**
- `app/src/core/Road.ts` (addSCurves com parâmetro withHills)
- `app/src/versions/v2-curves/RacerGameV2.ts` (3 chamadas addSCurves(false))
