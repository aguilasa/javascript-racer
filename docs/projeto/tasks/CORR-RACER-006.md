---
id: CORR-RACER-006
title: "Correção: StatsPanel.update() conta frames em dobro e mede ~0ms (begin/end/update redundantes)"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-RACER-006: `StatsPanel.update()` conta frames em dobro e mede ~0ms

## Problema identificado

`app/src/core/StatsPanel.ts` implementa `update()` (chamado uma vez por frame, via
`GameLoop`'s `onFrame`, cujo comentário na própria tarefa sugere `// ex.: stats.update()`) assim:

```ts
update(): void {
  this.stats.begin()
  this.lastMs = this.stats.end()
  this.stats.update()
}
```

O código-fonte do pacote `stats.js` instalado (`app/node_modules/stats.js/src/Stats.js`) mostra
a semântica real de cada método:

```js
begin: function () { beginTime = now(); },

end: function () {
  frames++;
  var time = now();
  msPanel.update( time - beginTime, 200 );          // tempo decorrido desde o último begin()
  if ( time > prevTime + 1000 ) {
    fpsPanel.update( (frames*1000) / (time-prevTime), 100 );  // FPS a partir da contagem de frames
    prevTime = time; frames = 0;
  }
  return time;
},

update: function () { beginTime = this.end(); }     // = end() seguido de um novo begin()
```

`update()` **já é** o "açúcar sintático" para ser chamado uma única vez por frame (mede o tempo
desde a chamada anterior e rearma para a próxima). Ao chamar `begin()` → `end()` → `update()` em
sequência, sem nenhum trabalho real entre `begin()` e o primeiro `end()`, o método:

1. Chama `end()` duas vezes por frame visual (a chamada explícita e a que `update()` faz
   internamente) — **`frames` é incrementado duas vezes por frame real**, então o painel de FPS
   do `stats.js` (visível no HUD `#fps` de todas as páginas) reporta **o dobro** do FPS real.
2. O primeiro `end()` mede o tempo entre `begin()` e ele mesmo — que é essencialmente `0ms`
   (não há nenhum trabalho de jogo entre as duas chamadas, ambas disparadas de volta em
   sequência dentro do mesmo `onFrame`). O painel de "ms" do `stats.js` fica sempre próximo de
   `0`, não refletindo o tempo real de frame.
3. `this.lastMs` (usado para calcular `fps = Math.round(1000 / this.lastMs)` na mensagem "Your
   canvas performance is good/ok/bad") recebe esse valor de `end()`, essencialmente `0` —
   `1000/0` é `Infinity`, então a mensagem de performance also fica incorreta/sem sentido.

Confirmado lendo `node_modules/stats.js/src/Stats.js` diretamente (não é uma suposição sobre a
API — é o comportamento documentado no próprio código-fonte da dependência instalada).

## Causa raiz

O desenvolvedor tentou compensar a ausência do método antigo `current()` (da versão vendorizada
do `stats.js` usada pelo jogo original) combinando `begin()`/`end()`/`update()` na mesma chamada,
sem perceber que `update()` já encapsula um ciclo `end()+begin()` completo — chamar os três juntos
sem nenhum código de jogo entre `begin()` e `end()` conta o mesmo frame duas vezes e nunca mede o
intervalo de tempo real entre frames.

## Correção

### Arquivo/alvo: `app/src/core/StatsPanel.ts`

Chamar `this.stats.update()` **uma única vez** por frame (a forma correta e já sugerida pelo
comentário da própria RACER-TASK-06), e medir `lastMs` de forma independente, via timestamp
próprio, para a mensagem de performance:

```diff
 export class StatsPanel {
   private stats: Stats
   private lastMs = 0
+  private lastFrameAt = 0
   ...
   update(): void {
-    this.stats.begin()
-    this.lastMs = this.stats.end()
-    this.stats.update()
+    const now = performance.now()
+    this.lastMs = this.lastFrameAt ? now - this.lastFrameAt : 0
+    this.lastFrameAt = now
+    this.stats.update()
   }
```

Isso restaura o comportamento equivalente ao `Game.stats` original: o widget visual do
`stats.js` conta um frame real por chamada (FPS/ms corretos), e `lastMs` reflete o tempo real
entre frames consecutivos para a mensagem "good/ok/bad".

## Verificação

- [x] `StatsPanel.update()` chama `this.stats.update()` (ou `begin()`/`end()`) **exatamente uma
      vez** por invocação — sem chamadas redundantes que dupliquem a contagem de `frames`
- [x] Rodando o jogo (qualquer `vN.html` com `#fps` visível), o painel de FPS do `stats.js`
      mostra um valor plausível (próximo ao refresh rate real da tela), não o dobro
- [x] A mensagem "Your canvas performance is..." reflete um FPS plausível (não `Infinity`/`NaN`)
- [x] `cd app && mise exec -- npm run typecheck && mise exec -- npm run build` continuam
      passando sem erro

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-05

**Resumo do que foi feito:** Substituído o corpo de `StatsPanel.update()`. Removidas as chamadas
`this.stats.begin()` e `this.stats.end()` (que mediam `~0ms` e contavam `frames` duas vezes por
frame real). Adicionado campo `lastFrameAt = 0` e cálculo de `lastMs` via `performance.now()`
independente do `stats.js`. `this.stats.update()` é agora a única chamada ao `stats.js` por frame,
o que restaura a contagem correta de FPS/ms no widget visual. Typecheck passa sem erros.

**Problemas encontrados:** Nenhum.

**Arquivos criados/modificados:**
- `app/src/core/StatsPanel.ts` (campo `lastFrameAt` adicionado; `update()` reescrito)
