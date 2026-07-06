---
id: CORR-RACER-005
title: "Correção: desvios de comportamento não documentados em dom.ts/util.ts (resolve() e overlap())"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-RACER-005: desvios de comportamento não documentados em `dom.ts`/`util.ts`

## Problema identificado

O critério de conclusão da RACER-TASK-05 exige explicitamente "Nenhuma fórmula/constante
numérica alterada em relação ao original", e o passo de implementação reforça: "Preservar
exatamente as fórmulas matemáticas — nenhuma mudança de comportamento é permitida aqui". O Log
de Execução da tarefa documenta **uma** substituição intencional (`??` no lugar de `|| 0` em
`project`, justificada como equivalente para números) — mas há **duas outras** substituições do
mesmo tipo que não foram mencionadas, e uma delas **não é equivalente**.

### 1) `app/src/core/util.ts` — `overlap()`: `??` no lugar de `||` altera o fallback quando `percent === 0`

Original (`common.js`):

```js
overlap: function(x1, w1, x2, w2, percent) {
  var half = (percent || 1)/2;
  ...
```

Portado:

```ts
export function overlap(x1: number, w1: number, x2: number, w2: number, percent?: number): boolean {
  const half = (percent ?? 1) / 2
  ...
```

Diferente do caso de `project` (onde o fallback é `0` e `0 || 0 === 0 ?? 0`, logo equivalente),
aqui o fallback é `1`. Se `percent` for `0`:
- Original: `0 || 1` → `1` (usa o fallback, pois `0` é falsy)
- Portado: `0 ?? 1` → `0` (mantém `0`, pois `0` não é `null`/`undefined`)

Isso **é** uma mudança de comportamento real para qualquer chamada futura com `percent = 0`
(hoje nenhum call site em `v4.final.html` passa `0` explicitamente — só `undefined`, `0.8` ou
`1.2` — então o jogo atual não é afetado, mas a função deixou de ser uma transcrição fiel, e o
Log de Execução não menciona essa mudança).

### 2) `app/src/core/dom.ts` — `resolve()`: caso `document` não retorna o `document` original

Original (`common.js`):

```js
get: function(id) { return ((id instanceof HTMLElement) || (id === document)) ? id : document.getElementById(id); },
```

Quando `id === document`, o original retorna o próprio `document` inalterado. `Dom.on`/`Dom.un`
chamam `Dom.get(ele)` internamente, então `Dom.on(document, 'keydown', fn)` (usado por
`Game.setKeyListener`, a ser portado na RACER-TASK-06) registra o listener diretamente em
`document`.

Portado, em `dom.ts`, `on`/`un` usam um helper interno separado (`resolve`), não `Dom.get`:

```ts
function resolve(id: ElementRef): HTMLElement {
  if (id instanceof HTMLElement) return id
  if (id === document) return document.documentElement
  ...
```

`resolve(document)` retorna `document.documentElement` (o elemento `<html>`), não `document`.
Na prática, eventos de teclado que se propagam (bubbling) por toda a árvore do DOM chegam a
`document.documentElement` antes de chegar a `document`, então o efeito observável em
`keydown`/`keyup` tende a ser o mesmo — mas é, ainda assim, uma divergência silenciosa e não
documentada do alvo original (`document`), sem necessidade técnica que a justifique.

## Causa raiz

Ao generalizar `x || fallback` para `x ?? fallback` (mais idiomático em TS), a mudança foi
aplicada de forma ampla em `dom.ts`/`util.ts` sem verificar, caso a caso, se o fallback usado é
o mesmo valor que o operando substitui quando falsy (só é seguro quando `fallback === 0` e o
valor "vazio" esperado também é `0`/`undefined`, como em `project`). Em `overlap`, o fallback é
`1`, não `0`, então a substituição não é neutra. O caso do `document` em `resolve()` parece ter
sido introduzido por engano ao extrair a lógica de `Dom.get` para um helper separado, trocando
"retornar o próprio identificador" por "retornar `documentElement`" sem motivo aparente.

## Correção

### Arquivo/alvo: `app/src/core/util.ts`

Reverter `overlap` para usar `||`, preservando o fallback original quando `percent` é `0`:

```diff
 export function overlap(x1: number, w1: number, x2: number, w2: number, percent?: number): boolean {
-  const half = (percent ?? 1) / 2
+  const half = (percent || 1) / 2
```

### Arquivo/alvo: `app/src/core/dom.ts`

Fazer `resolve()` retornar o próprio `document` (não `documentElement`) quando `id === document`,
igual ao original:

```diff
 function resolve(id: ElementRef): HTMLElement {
   if (id instanceof HTMLElement) return id
-  if (id === document) return document.documentElement
+  if (id === document) return document as unknown as HTMLElement
   ...
```

(o cast é necessário porque `document` não é estruturalmente um `HTMLElement`; alternativa mais
limpa é tipar o retorno de `resolve` como `HTMLElement | Document` e ajustar os chamadores
`on`/`un`, que só usam `addEventListener`/`removeEventListener` — presentes em ambos os tipos).

## Verificação

- [x] `overlap(x1, w1, x2, w2, 0)` retorna o mesmo resultado que a fórmula original com
      `percent || 1` (equivalente a chamar com `percent = 1`)
- [x] `resolve(document)` (ou o caminho equivalente exercitado por `Dom.on(document, ...)`)
      retorna/opera sobre o próprio `document`, não `document.documentElement`
- [x] `cd app && mise exec -- npm run typecheck && mise exec -- npm run build` continuam
      passando sem erro

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-05

**Resumo do que foi feito:** Dois problemas corrigidos:
1. `app/src/core/util.ts` — `overlap()`: revertido `(percent ?? 1)` para `(percent || 1)`,
   restaurando o fallback original. Com `??`, `percent = 0` mantinha `0` (resultado diferente do
   original); com `||`, `0` é tratado como falsy e o fallback `1` é usado, idêntico ao `common.js`.
2. `app/src/core/dom.ts` — `resolve()`: alterado retorno de `document.documentElement` para o
   próprio `document`, tipando o retorno da função como `HTMLElement | Document` (sem cast
   inseguro). `Dom.on`/`Dom.un` apenas chamam `addEventListener`/`removeEventListener`, ambos
   presentes em `Document`, então a mudança de tipo não requer ajuste nos chamadores. Typecheck
   passa sem erros.

**Problemas encontrados:** Nenhum.

**Arquivos criados/modificados:**
- `app/src/core/util.ts` (linha de `overlap`: `??` → `||`)
- `app/src/core/dom.ts` (retorno de `resolve`: `document.documentElement` → `document`,
  tipo de retorno `HTMLElement` → `HTMLElement | Document`)
