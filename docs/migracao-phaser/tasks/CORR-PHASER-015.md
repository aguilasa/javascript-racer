---
id: CORR-PHASER-015
title: "Correção: Game.update() chama racerEngine.getRenderState() 4 vezes por frame, recomputando o mesmo resultado"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-PHASER-015: `getRenderState()` chamado 4x por frame — trabalho redundante

## Problema identificado

- **Arquivo:** `racer-phaser/src/game/scenes/Game.ts`
- **Estado atual:** `update()` chama, em sequência, `this.renderParallax()`, `this.renderRoad()`,
  `this.renderScenery()`, `this.renderPlayer()` — e **cada um desses quatro métodos chama
  `this.racerEngine.getRenderState()` de forma independente**:
  ```ts
  private renderParallax(): void { const state = this.racerEngine.getRenderState(); ... }
  private renderRoad(): void     { const state = this.racerEngine.getRenderState(); ... }
  private renderScenery(): void  { const state = this.racerEngine.getRenderState(); ... }
  private renderPlayer(): void   { const state = this.racerEngine.getRenderState(); ... }
  ```
- **Por que está errado:** `RacerEngine.getRenderState()` não é uma leitura barata — a cada
  chamada ela: (1) percorre **todos** os segmentos da pista (`for (const s of segments) s.clip =
  undefined`, ver `CORR-PHASER-013`) e (2) reprojeta os `drawDistance` (300) segmentos visíveis
  (2 chamadas de `Util.project` cada). O estado do jogo (`position`, `playerX`, etc.) não muda
  entre essas quatro chamadas dentro do mesmo frame — são estritamente idênticas em resultado,
  só recalculadas 4 vezes à toa. Como a pista tem vários milhares de segmentos no total (a receita
  completa de `buildRoad()` soma múltiplas chamadas de `addCurve(ROAD.LENGTH.LONG, ...)` e afins),
  o laço de reset de `clip` sozinho já é uma operação O(milhares) repetida 4x por frame, a 60fps —
  exatamente o tipo de custo que `docs/migracao-phaser/04-riscos-decisoes.md` ("Performance do
  pool de sprites/carros" e a nota sobre `Graphics` redesenhado por frame) já sinalizava como
  ponto de atenção. Esta tarefa (PHASER-TASK-11) adicionou a quarta chamada
  (`renderScenery()`), piorando um problema que já existia desde a PHASER-TASK-09/10 (três
  chamadas).

## Causa raiz

Cada método de renderização foi escrito de forma independente, buscando seus próprios dados via
`getRenderState()`, sem que houvesse um ponto único no `update()` que computasse o estado do
frame uma vez e o repassasse.

## Correção

### Arquivo/alvo: `racer-phaser/src/game/scenes/Game.ts`

Chamar `getRenderState()` **uma única vez** em `update()`, repassando o resultado para os quatro
métodos:

```ts
update(_time: number, delta: number) {
  // ... input, passo fixo (inalterado) ...

  const state = this.racerEngine.getRenderState();
  this.renderParallax(state);
  this.renderRoad(state);
  this.renderScenery(state);
  this.renderPlayer(state);
}

private renderParallax(state: RenderState): void { /* usa state em vez de recalcular */ }
private renderRoad(state: RenderState): void { /* idem */ }
private renderScenery(state: RenderState): void { /* idem */ }
private renderPlayer(state: RenderState): void { /* idem */ }
```

(importar o tipo `RenderState` de `../racer/RacerEngine`, já exportado).

## Verificação

- [x] `getRenderState()` chamado exatamente uma vez por frame em `Game.update()`
- [x] Os quatro métodos de renderização recebem `state` como parâmetro, sem recalcular
- [x] Validação visual: comportamento idêntico ao estado atual (pista, parallax, cenário,
      jogador) — esta é uma otimização, não deve mudar nada visualmente
- [x] `mise exec -- npm run build` sem erros

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-07

**Resumo do que foi feito:**
Modificado `Game.ts` para chamar `getRenderState()` uma única vez por frame:
- Adicionado import de `RenderState` de `../racer/RacerEngine`
- Modificado `update()` para chamar `getRenderState()` uma vez e passar o resultado para os quatro métodos de renderização
- Modificado `renderParallax()`, `renderRoad()`, `renderScenery()` e `renderPlayer()` para receber `state` como parâmetro em vez de chamar `getRenderState()` internamente
- Isso elimina o trabalho redundante de 4 chamadas por frame (reset de clip de milhares de segmentos + reprojeção de 300 segmentos visíveis)

**Problemas encontrados:**
Nenhum.

**Arquivos criados/modificados:**
- Modificado: `racer-phaser/src/game/scenes/Game.ts` (getRenderState() chamado uma vez por frame, render methods recebem state como parâmetro)
- Modificado: `docs/migracao-phaser/tasks/correcoes-progresso.md` (status CORR-PHASER-015 marcado como [x] concluído, checklist atualizado)
