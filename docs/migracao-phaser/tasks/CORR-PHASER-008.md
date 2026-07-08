---
id: CORR-PHASER-008
title: "Correção: RacerEngine tem campos privados mortos (fps, startPosition) que quebram tsc --noEmit"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-PHASER-008: campos privados mortos em `RacerEngine` quebram `tsc --noEmit`

## Problema identificado

- **Arquivo:** `racer-phaser/src/game/racer/RacerEngine.ts`
- **Estado atual:** rodando `npx tsc --noEmit -p tsconfig.json` dentro de `racer-phaser/`
  (checagem que nenhuma tarefa/correção anterior rodou para *este* arquivo, mas que já provou
  pegar bugs reais em `CORR-PHASER-003`):
  ```
  src/game/racer/RacerEngine.ts(35,11): error TS6133: 'fps' is declared but its value is never read.
  src/game/racer/RacerEngine.ts(80,11): error TS6133: 'startPosition' is declared but its value is never read.
  ```
- **Por que está errado:**
  - `private fps = 60` (linha 35) é copiado do campo `protected fps` de `app/src/core/
    RacerGame.ts`, mas nunca é lido em nenhum método de `RacerEngine` — não há `StatsPanel`/
    `GameLoop` na classe (isso fica na `Game` scene, PHASER-TASK-09). Em `RacerGame.ts` o campo é
    `protected` (não `private`), então o checador de "membro não usado" do TypeScript não o
    reporta ali — mas em `RacerEngine`, copiado como `private`, o mesmo campo morto vira um erro
    real de compilação estrita.
  - `private startPosition = 0` (linha 80) é escrito em `updateParallax()`
    (`this.startPosition = startPosition`) mas nunca lido — `getRenderState()` calcula seu
    próprio `startPosition` local a partir de `this.position` (linha 202), sem usar o campo. O
    campo é puramente morto.
- **Por que isso importa:** `mise exec -- npm run build` (só `vite build`, baseado em esbuild)
  **não** detecta isso — é o mesmo ponto cego já registrado em `CORR-PHASER-003`/
  `CORR-PHASER-004` (o projeto ainda não tem um script `typecheck` dedicado). Como o Critério de
  conclusão da PHASER-TASK-08 pede só `mise exec -- npm run build` sem erros, o campo morto
  passou pela validação da tarefa sem ser notado.

## Causa raiz

Os campos foram copiados diretamente da lista de campos de `RacerGame.ts` (que os declara
`protected`, permitindo uso futuro por subclasses) sem verificar se cada um tem, de fato, um
leitor dentro da nova classe fundida — que, sendo única (sem subclasses), precisa que todo campo
`private` seja genuinamente usado.

## Correção

### Arquivo/alvo: `racer-phaser/src/game/racer/RacerEngine.ts`

Remover os dois campos mortos:
- `private fps = 60` — remover (não usado; se um contador de FPS for necessário no futuro, ele
  pertence à `Game` scene via `this.game.loop.actualFps`, não a `RacerEngine`, ver
  `docs/migracao-phaser/01-arquitetura-alvo.md`, linha da tabela referente a `StatsPanel.ts`).
- `private startPosition = 0` (e a linha `this.startPosition = startPosition` em
  `updateParallax()`) — remover; `getRenderState()` já calcula o valor que precisa localmente,
  sem depender desse campo.

## Verificação

- [ ] `mise exec -- npx tsc --noEmit -p tsconfig.json` sem erros `TS6133` em `RacerEngine.ts`
- [ ] `mise exec -- npm run build` continua sem erros
- [ ] Nenhum outro método passa a depender do campo removido (conferir `updateParallax`/
      `getRenderState` após a remoção)

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:**
Removidos os campos privados mortos `fps` e `startPosition` de `RacerEngine.ts`. O campo `fps` (linha 35) nunca era lido e foi removido completamente. O campo `startPosition` (linha 80) e sua atribuição em `updateParallax()` (linha 166) foram removidos, pois `getRenderState()` já calcula o valor necessário localmente sem depender desse campo. Isso corrige os erros TS6133 reportados por `npx tsc --noEmit`.

**Problemas encontrados:**
Nenhum.

**Arquivos criados/modificados:**
- Modificado: `racer-phaser/src/game/racer/RacerEngine.ts` (removido campo `fps` linha 35, removido campo `startPosition` linha 80 e comentário associado, removida atribuição `this.startPosition = startPosition` em `updateParallax`)
- Modificado: `docs/migracao-phaser/tasks/correcoes-progresso.md` (status CORR-PHASER-008 marcado como [x] concluído, checklist atualizado)
