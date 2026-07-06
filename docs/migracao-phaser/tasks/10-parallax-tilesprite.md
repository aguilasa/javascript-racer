---
id: PHASER-TASK-10
title: "Camadas de fundo (céu/morros/árvores) via TileSprite"
type: implementação
category: frontend
phase: 4
depends_on: ["PHASER-TASK-09"]
status: pendente
---

# PHASER-TASK-10: Camadas de fundo (céu/morros/árvores) via `TileSprite`

## Contexto

- **Fonte:** `app/src/core/Renderer.ts#background` (blit manual com wraparound), documentado em
  `docs/06-arquitetura-common-js.md#renderbackground`.
- **Plano completo:** `docs/migracao-phaser/01-arquitetura-alvo.md`, seção "Parallax de fundo:
  `TileSprite`" — **ler antes de começar**.

## Objetivo

Substituir o blit manual de `Renderer.background()` por três `Phaser.GameObjects.TileSprite`
(céu, morros, árvores), atualizados a partir dos acumuladores `skyOffset`/`hillOffset`/
`treeOffset` que `RacerEngine.update()` já calcula (portados na PHASER-TASK-08).

## Requisitos da implementação

- Criar as três camadas na `Game` scene (`this.add.tileSprite(...)`), usando os frames
  `SKY`/`HILLS`/`TREES` da textura `'background'` (registrados na PHASER-TASK-04), com
  profundidade (`setDepth`) abaixo da pista/sprites/carros/jogador.
- A cada frame, atualizar `tileSprite.tilePositionX = skyOffset * <largura da camada na
  textura>` (mesma relação de proporção que `Renderer.background()` usa para escolher a fatia de
  origem, mas sem a lógica de "duas chamadas de `drawImage`" — o `TileSprite` já resolve o
  scroll contínuo internamente).
- Se aplicável, `tilePositionY` para o deslocamento vertical usado a partir da v3 (subida/descida
  em morros, `getBackgroundOffsetY`) — conferir se esse efeito é visualmente relevante o
  suficiente para portar nesta tarefa ou se pode ficar para o polimento (PHASER-TASK-18);
  documentar a decisão no Log de Execução.

## Passos

1. Ler a seção "Parallax de fundo" de `docs/migracao-phaser/01-arquitetura-alvo.md`.
2. Reler `Renderer.background()` e `RacerGame.render()` (as três chamadas de fundo, antes do
   loop de segmentos) para confirmar ordem de camadas (céu atrás, depois morros, depois
   árvores) e os fatores `skySpeed`/`hillSpeed`/`treeSpeed`.
3. Implementar as três `TileSprite` na `Game` scene.
4. Validar visualmente: dirigir em curvas e confirmar que o fundo se desloca horizontalmente de
   forma proporcional e suave, sem "pulos" ou costuras visíveis.

## Critério de conclusão

- [ ] Três `TileSprite` (céu/morros/árvores) com profundidade correta (atrás da pista)
- [ ] `tilePositionX` atualizado a partir de `skyOffset`/`hillOffset`/`treeOffset`
- [ ] Validação visual: parallax suave e proporcional em curvas, sem costuras
- [ ] `mise exec -- npm run build` sem erros
- [ ] Commit feito em `feature/phaser-port`

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
