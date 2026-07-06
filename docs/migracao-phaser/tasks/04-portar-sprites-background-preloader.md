---
id: PHASER-TASK-04
title: "Portar sprites.ts/background.ts e registrar frames nomeados no Preloader"
type: implementação
category: frontend
phase: 1
depends_on: ["PHASER-TASK-02", "PHASER-TASK-03"]
status: pendente
---

# PHASER-TASK-04: Portar `sprites.ts`/`background.ts` e registrar frames nomeados no `Preloader`

## Contexto

- **Fonte:** `app/src/core/sprites.ts` (`SPRITES`), `app/src/core/background.ts` (`BACKGROUND`)
- **Plano completo:** `docs/migracao-phaser/01-arquitetura-alvo.md`, seção "Pipeline de
  sprites: uma textura, uma folha, frames nomeados" — **ler esta seção inteira antes de
  começar**, ela é o contrato desta tarefa.
- Depende de PHASER-TASK-02 (os PNGs já precisam estar em
  `racer-phaser/public/assets/racer/`) e PHASER-TASK-03 (`types.ts` para o tipo `SpriteRect`).

## Objetivo

1. Portar `sprites.ts` (`SPRITES`, todas as ~35 entradas + `SCALE`/`BILLBOARDS`/`PLANTS`/`CARS`)
   e `background.ts` (`BACKGROUND.SKY`/`HILLS`/`TREES`) verbatim para
   `racer-phaser/src/game/racer/`.
2. Adaptar `Preloader` (`racer-phaser/src/game/scenes/Preloader.ts`) para:
   - Carregar `assets/racer/sprites.png` e `assets/racer/background.png` via
     `this.load.image(...)`.
   - Carregar a(s) faixa(s) de música via `this.load.audio(...)`.
   - Depois do carregamento, registrar um frame nomeado por entrada de `SPRITES` na textura
     `'sprites'` (`this.textures.get('sprites').add(name, 0, rect.x, rect.y, rect.w, rect.h)`),
     e o mesmo para as três entradas de `BACKGROUND` na textura `'background'`.

## Requisitos da implementação

- As coordenadas `{x, y, w, h}` de `SPRITES`/`BACKGROUND` **não mudam** — são as mesmas usadas
  hoje em `app/src/core/sprites.ts`/`background.ts` (que por sua vez vêm de
  `images/sprites.js`/`images/background.js`, gerados por `rake resprite` a partir dos PNGs
  originais).
- Ao iterar `SPRITES` para registrar frames, pular entradas que não são retângulos (`SCALE` é um
  número, `BILLBOARDS`/`PLANTS`/`CARS` são arrays de referências) — só registrar frame para
  entradas com formato `{x, y, w, h}`.
- Não é necessário (nem correto) rodar `rake resprite` de novo — os PNGs de origem não mudam.

## Passos

1. Ler a seção "Pipeline de sprites" de `docs/migracao-phaser/01-arquitetura-alvo.md`.
2. Copiar `sprites.ts`/`background.ts` verbatim para `racer-phaser/src/game/racer/`.
3. Adaptar `Preloader.ts` conforme descrito acima.
4. Validar visualmente: rodar `mise exec -- npm run dev`, confirmar (via um teste manual
   temporário, ex.: `this.add.image(x, y, 'sprites', 'PALM_TREE')` dentro do `create()` do
   `Preloader` ou `MainMenu`) que ao menos um frame nomeado (`PALM_TREE`, por exemplo) renderiza
   corretamente a imagem certa — remover esse teste manual antes de finalizar, ou deixá-lo se
   for útil como fixture de depuração documentada no Log de Execução.

## Critério de conclusão

- [x] `racer-phaser/src/game/racer/sprites.ts`/`background.ts` com as mesmas coordenadas de
      `app/src/core/sprites.ts`/`background.ts`
- [x] `Preloader` carrega `sprites.png`/`background.png`/música e registra frames nomeados para
      todas as entradas de `SPRITES` e `BACKGROUND`
- [x] Validação visual: ao menos um frame nomeado renderiza a imagem correta
- [x] `mise exec -- npm run build` sem erros
- [x] Commit feito em `feature/phaser-port`

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:**
- Copiou `sprites.ts` de `app/src/core/` para `racer-phaser/src/game/racer/` (SPRITES com ~35 entradas + SCALE/BILLBOARDS/PLANTS/CARS)
- Copiou `background.ts` de `app/src/core/` para `racer-phaser/src/game/racer/` (BACKGROUND com SKY/HILLS/TREES)
- Adaptou `Preloader.ts` para carregar `sprites.png`, `background.png` e faixas de música via `this.load.image()`/`this.load.audio()`
- Implementou registro de frames nomeados no `create()` do Preloader para todas as entradas de SPRITES e BACKGROUND
- Iterou sobre SPRITES pulando entradas não-rect (SCALE, BILLBOARDS, PLANTS, CARS) usando verificação `typeof rect === 'object' && 'x' in rect`
- Validado `mise exec -- npm run build` - build concluído sem erros
- Validado visualmente com teste temporário (`this.add.image(512, 384, 'sprites', 'PALM_TREE')`) - frame renderizou corretamente, teste removido

**Problemas encontrados:**
- Nenhum

**Arquivos criados/modificados:**
- `racer-phaser/src/game/racer/sprites.ts` (criado)
- `racer-phaser/src/game/racer/background.ts` (criado)
- `racer-phaser/src/game/scenes/Preloader.ts` (modificado - load de assets e registro de frames)
