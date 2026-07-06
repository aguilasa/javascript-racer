---
id: CORR-RACER-007
title: "Correção: Renderer.fog() duplica COLORS.FOG como literal em vez de importar de core/constants.ts"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-RACER-007: `Renderer.fog()` duplica `COLORS.FOG` como literal

## Problema identificado

Original (`common.js`):

```js
fog: function(ctx, x, y, width, height, fog) {
  if (fog < 1) {
    ctx.globalAlpha = (1-fog)
    ctx.fillStyle = COLORS.FOG;
    ctx.fillRect(x, y, width, height);
    ctx.globalAlpha = 1;
  }
}
```

A cor de neblina vem da constante `COLORS.FOG` (`'#005108'`, definida em `core/constants.ts`
desde a RACER-TASK-04). Em `app/src/core/Renderer.ts`:

```ts
fog(x: number, y: number, width: number, height: number, fog: number): void {
  if (fog < 1) {
    const ctx = this.ctx
    ctx.globalAlpha = (1 - fog)
    ctx.fillStyle   = '#005108'
    ctx.fillRect(x, y, width, height)
    ctx.globalAlpha = 1
  }
}
```

`Renderer.ts` **não importa `COLORS`** de `core/constants.ts` em nenhum lugar — o valor
`'#005108'` foi transcrito como literal solto. O valor está correto hoje (idêntico a
`COLORS.FOG`), então não há divergência visual observável neste momento — mas a constante
deixou de ter uma única fonte de verdade: se `COLORS.FOG` for alterado no futuro (ex.: ajuste de
paleta), `Renderer.fog()` continuaria usando o valor antigo silenciosamente, já que não há
nenhuma referência entre os dois arquivos.

## Causa raiz

Ao portar `Render.fog`, o valor de `COLORS.FOG` foi copiado como string literal em vez de
importado de `core/constants.ts` (que já existe desde a RACER-TASK-04 exatamente para ser essa
fonte única de verdade das cores de jogo).

## Correção

### Arquivo/alvo: `app/src/core/Renderer.ts`

Importar `COLORS` de `./constants` e usar `COLORS.FOG` em vez do literal:

```diff
 import type { SegmentColorSet, SpriteRect } from './types'
+import { COLORS } from './constants'
 import { SPRITES } from './sprites'
 import { randomChoice } from './util'
 ...
   fog(x: number, y: number, width: number, height: number, fog: number): void {
     if (fog < 1) {
       const ctx = this.ctx
       ctx.globalAlpha = (1 - fog)
-      ctx.fillStyle   = '#005108'
+      ctx.fillStyle   = COLORS.FOG
       ctx.fillRect(x, y, width, height)
       ctx.globalAlpha = 1
     }
   }
```

## Verificação

- [x] `Renderer.ts` importa `COLORS` de `./constants` e usa `COLORS.FOG` em `fog()` (nenhum
      literal de cor duplicado)
- [x] `cd app && mise exec -- npm run typecheck && mise exec -- npm run build` continuam
      passando sem erro

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-05

**Resumo do que foi feito:** Adicionado `import { COLORS } from './constants'` em `Renderer.ts`
e substituído `ctx.fillStyle = '#005108'` por `ctx.fillStyle = COLORS.FOG` em `fog()`. Typecheck
passa sem erros.

**Problemas encontrados:** Nenhum.

**Arquivos criados/modificados:**
- `app/src/core/Renderer.ts` (import adicionado; literal `'#005108'` → `COLORS.FOG`)
