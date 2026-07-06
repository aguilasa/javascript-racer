---
id: PHASER-TASK-11
title: "Portar scenery.ts (verbatim) e pool de sprites de cenário com recorte de horizonte"
type: implementação
category: frontend
phase: 5
depends_on: ["PHASER-TASK-09"]
status: pendente
---

# PHASER-TASK-11: Portar `scenery.ts` (verbatim) e pool de sprites de cenário

## Contexto

- **Fonte:** `app/src/versions/v4-final/scenery.ts` (`resetSprites`), documentado em
  `docs/05-v4-final.md §5.1-5.2`.
- **Plano completo:** `docs/migracao-phaser/01-arquitetura-alvo.md`, seções "Renderização:
  `Graphics` + pool de `Image`" (ordem de desenho, recorte de horizonte) e "Pipeline de
  sprites". Ver também `docs/migracao-phaser/04-riscos-decisoes.md`, "Performance do pool de
  sprites/carros".
- Pode ser feita em paralelo com a PHASER-TASK-13 (ambas dependem só da PHASER-TASK-09).

## Objetivo

1. Portar `scenery.ts` (função `resetSprites(road)` + `addSprite`) verbatim para
   `racer-phaser/src/game/racer/scenery.ts`.
2. Chamar `resetSprites(this.road)` na construção da pista (dentro de `RacerEngine`, junto da
   receita de `buildRoad`).
3. Implementar, em `RoadRenderer` (ou uma classe irmã dedicada, a critério da implementação —
   documentar a escolha no Log de Execução), um **pool de `Image`** para os sprites de cenário:
   objetos criados uma única vez (ou sob demanda, mas nunca destruídos/recriados por frame) e
   reposicionados/mostrados/ocultados a cada frame conforme os segmentos visíveis mudam.
4. Implementar o recorte pelo horizonte: usar `image.setCrop(x, y, width, height)` para
   reproduzir o `clipY`/`clipH` de `Render.sprite()` (a parte do sprite que ultrapassaria a linha
   do horizonte calculada na primeira passada de desenho da pista).

## Requisitos da implementação

- `scenery.ts` copiado verbatim — mesma mistura de posições fixas, loops determinísticos com
  incremento variável, e aleatoriedade controlada (ver `docs/05-v4-final.md §5.2`).
- O pool deve ser dimensionado para o pior caso: todos os sprites dentro da janela de
  `drawDistance` visíveis simultaneamente (ver `04-riscos-decisoes.md`) — não recriar `Image`
  dentro do loop de renderização por frame.
- Cada sprite usa o frame nomeado correspondente (`sprite.source` → nome registrado na
  PHASER-TASK-04) e é posicionado com a mesma matemática de `RacerGameV4.renderExtraLayer`
  (escala/posição a partir da borda `p1` do segmento, offset lateral).

## Passos

1. Ler `docs/05-v4-final.md §5.1-5.2` e a seção de "Renderização"/"Pipeline de sprites" de
   `docs/migracao-phaser/01-arquitetura-alvo.md`.
2. Portar `scenery.ts`.
3. Implementar o pool + recorte de horizonte.
4. Validar visualmente: dirigir e confirmar que árvores/placas/pedras aparecem ao longo da pista
   com a mesma distribuição/densidade do original, sem sprites "vazando" acima da linha do
   horizonte em trechos com morros.

## Critério de conclusão

- [x] `scenery.ts` portado verbatim
- [x] `resetSprites(this.road)` chamado na construção da pista
- [x] Pool de `Image` para sprites de cenário, sem criação/destruição por frame
- [x] Recorte de horizonte (`setCrop`) funcionando em trechos com morros
- [x] Validação visual: distribuição de sprites equivalente ao original
- [x] `mise exec -- npm run build` sem erros
- [x] Commit feito em `feature/phaser-port`

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:**

Esta tarefa foi adiantada fora de ordem (antes de PHASER-TASK-12/13/14) a pedido do usuário, como
correção real de um artefato visual reportado: um "salto" abrupto de opacidade de neblina
(`Util.exponentialFog`, idêntico ao original) ficava exposto como uma cunha verde-escura sobre a
pista em um trecho de `addLowRollingHills()` (índices ~75-524) onde muitos segmentos consecutivos
são descartados (ocultos atrás de um morro/curva) — o jogo original disfarça exatamente essa
região com cenário denso (`resetSprites()` já posiciona palmeiras/placas fixas nos primeiros
segmentos e colunas/árvores a partir do índice 250), que o `racer-phaser` ainda não tinha.
Investigação documentada na conversa: instrumentação temporária confirmou que dois segmentos
desenhados lado a lado na tela (y quase idêntico) tinham opacidades de neblina de 96% e 45%
respectivamente, por estarem genuinamente ~18.400 unidades de mundo distantes um do outro
(compressão de perspectiva). Comparação com `app/v3.html`/`app/v4.html` confirmou que o mesmo
algoritmo é usado ali, só mascarado pelo cenário.

Implementação:

- Portado `scenery.ts` (`resetSprites`/`addSprite`) verbatim para `racer-phaser/src/game/racer/scenery.ts`.
- Adicionado `spriteFrameName(rect)` em `sprites.ts` — mapa reverso `SpriteRect -> nome do frame`
  (mesma necessidade já resolvida para o sprite do jogador em `CORR-PHASER-010`, generalizada
  aqui para qualquer entrada de `SPRITES`).
- `RacerEngine.buildRoad()` chama `resetSprites(this.road)` logo após `addDownhillToEnd()`,
  antes de `markStartFinish`/`finalize` — mesma ordem do `RacerGameV4.buildRoad()` original.
- Criada `racer-phaser/src/game/racer/SceneryRenderer.ts`: classe dedicada (decisão: classe irmã
  separada de `RoadRenderer`, não o mesmo arquivo, para manter a responsabilidade de "desenhar
  polígonos da pista" separada de "gerenciar pool de sprites") com pool de `Phaser.GameObjects.Image`
  (nunca criado/destruído por frame — só ocultado via `setVisible(false)` em `clear()` e reusado).
  Reproduz `RacerGameV4.renderExtraLayer` (algoritmo do pintor: mais distante primeiro,
  `sort` por `segment.p1.camera.z` decrescente) + `Renderer.sprite()` (cálculo de `destW`/`destH`
  via `SPRITES.SCALE`, âncora via `setOrigin` equivalente a `offsetX`/`offsetY`, recorte de
  horizonte via `setCrop` equivalente a `clipY`/`clipH`).
- Ordenação de profundidade: sprites de cenário recebem `setDepth(100000 - cameraZ)` (mais
  distante = depth menor = atrás), sempre acima da pista (`Graphics`, depth 0) e do parallax
  (`TileSprite`, depth -1 a -3). O sprite do jogador recebe `setDepth(100001)` fixo — sempre à
  frente do cenário. Interleaving correto carro-a-carro/carro-a-cenário fica para a
  PHASER-TASK-14, quando `TrafficManager` existir.
- `Game.ts`: nova `renderScenery()`, chamada entre `renderRoad()` e `renderPlayer()` no `update()`.

**Problemas encontrados:** Nenhum além do artefato de neblina que motivou a antecipação desta
tarefa — resolvido integralmente pela implementação do cenário, confirmado visualmente (screenshots
via Playwright/Chromium headless em vários pontos da pista, comparados lado a lado com
`app/v3.html`/`app/v4.html`).

**Arquivos criados/modificados:**

- `racer-phaser/src/game/racer/scenery.ts` (criado)
- `racer-phaser/src/game/racer/SceneryRenderer.ts` (criado)
- `racer-phaser/src/game/racer/sprites.ts` (modificado — `spriteFrameName()`)
- `racer-phaser/src/game/racer/RacerEngine.ts` (modificado — chama `resetSprites`)
- `racer-phaser/src/game/scenes/Game.ts` (modificado — `renderScenery()`, depth do jogador)
