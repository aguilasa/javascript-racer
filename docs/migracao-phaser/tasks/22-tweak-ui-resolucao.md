---
id: PHASER-TASK-22
title: "Tweak UI (racer-phaser): controle de resolução (redimensionar Scale Manager/TileSprites)"
type: implementação
category: frontend
phase: 10
depends_on: ["PHASER-TASK-21"]
status: pendente
---

# PHASER-TASK-22: Tweak UI — controle de resolução

## Contexto

- Continuação de [`21-tweak-ui-controles-basicos.md`](21-tweak-ui-controles-basicos.md) — ver
  aquele arquivo para a decisão geral do painel (elementos nativos do Phaser dentro do canvas,
  ancorados no canto superior direito, classe `TweakUi` criada pela cena `Game`). Esta tarefa cobre
  só o 7º controle (`resolution`), isolado numa tarefa separada porque troca `width`/`height` do
  jogo, algo que no `<canvas>` 2D original é uma atribuição direta (`canvas.width = width`) mas no
  Phaser exige mexer no `ScaleManager` e em todo game object com tamanho fixo criado em `create()`
  — **incluindo o próprio painel `TweakUi`**, que agora vive dentro do canvas e precisa se
  realocar quando o canto superior direito muda de lugar.
- **Referência original:** `v4.final.html:23-32` (markup `<select id="resolution">`) e
  `v4.final.html:655-665` (handler — resolve o `<option>` escolhido para um par `width`/`height`
  e chama `reset({ width, height })`).
- As 4 resoluções do original: `fine` (1280x960), `high` (1024x768, atual default fixo do
  `racer-phaser`), `medium` (640x480), `low` (480x360). Todas mantêm proporção 4:3.

## Objetivo

Reproduzir o controle de `resolution` (mesmas 4 opções, como um "anterior/próximo" — mesmo
componente discreto já usado por `lanes` na PHASER-TASK-21) redimensionando de fato o jogo Phaser
(canvas + todos os game objects com tamanho fixo, incluindo o próprio painel) ao vivo, sem
precisar recarregar a página.

## O que precisa mudar por causa do resize (levantamento, feito lendo o código atual)

| Onde | O que tem hoje | O que precisa acontecer no resize |
| ---- | --------------- | ---------------------------------- |
| `Phaser.Game` / `ScaleManager` | `width`/`height` fixos em `main.ts:12-13` (1024x768), sem `scale:` no config (modo `NONE`) | Chamar `this.scale.resize(width, height)` a partir da cena `Game` (`this.scale` é a instância compartilhada do `ScaleManager`, acessível de qualquer cena) |
| `RacerEngine.width`/`.height`/`.resolution` | Campos mutáveis já existentes (`RacerEngine.ts:43-44`, `.65`) | `applyOptions()` (da PHASER-TASK-21) ganha um caso a mais: `width`/`height` atualizam os campos e recomputam `this.resolution = this.height / 480` (mesma fórmula do `reset()` original, linha 644) |
| `skyTileSprite`/`hillsTileSprite`/`treesTileSprite` | Criados com tamanho fixo `this.scale.width, this.scale.height` em `Game.create()` (`Game.ts:82-92`) | Chamar `.setSize(width, height)` nos 3 em resize |
| `TweakUi` (painel inteiro, PHASER-TASK-21) | Ancorado no canto superior direito a partir de `state.width` (posição calculada uma vez, na criação) | Precisa de um método `reposition(width)` que recalcula a posição-x do painel/container (e do botão de abrir/fechar) — se `TweakUi` usar `Phaser.GameObjects.Container` (recomendado na PHASER-TASK-21), basta um `container.setX(width - panelWidth - margin)` |
| `RoadRenderer`/`SceneryRenderer`/`TrafficRenderer` | Redesenham do zero a cada frame, lendo `state.width` do `RenderState` a cada chamada | Nada a fazer — já leem o valor atualizado a cada frame, sem estado próprio de tamanho |
| `playerSprite` (posição/escala) | Calculado em `renderPlayer()` a partir de `state.width`/`state.screenY` a cada frame | Nada a fazer, mesmo motivo acima |
| `Hud` (`speedText` etc.) | Posições fixas em pixels (`10,10` / `10,40` / ...), no canto **superior esquerdo** | Nada a fazer — igual ao original (HUD sempre ancorado no canto, independente de resolução); só o canto direito (`TweakUi`) depende de `width` |
| Câmera principal (`this.cameras.main`) | Tamanho default = tamanho do jogo | Conferir se `scale.resize()` já ajusta a câmera automaticamente (documentação do Phaser sugere que sim, mas **validar manualmente** — se não ajustar, chamar `this.cameras.main.setSize(width, height)` também |

## Decisões técnicas

| Decisão | Escolha | Razão |
| ------- | ------- | ----- |
| Onde centralizar o resize | Um método novo `Game.applyResolution(width, height)` (privado, chamado pelo próprio `TweakUi` — já é um game object da cena `Game`, não precisa de bridge externo), que faz todos os passos da tabela acima em sequência, incluindo `this.tweakUi.reposition(width)` por último | Mantém a cena `Game` dona de tudo que é `Phaser.GameObjects`/`ScaleManager`; separa "resolver `fine/high/medium/low` → par `width/height`" (fica no `TweakUi`, mesmo componente anterior/próximo de `lanes`) de "efetivamente redimensionar tudo" (fica na `Game`). |
| Controle de resolução na UI | Mesmo componente "anterior/próximo" (`◀`/`▶` + `Text`) já usado para `lanes` na PHASER-TASK-21, com as 4 opções `fine/high/medium/low` | Reaproveita o componente já construído em vez de criar um tipo de controle novo só para este caso — `resolution` é discreto igual a `lanes`, só com mais opções. |
| Reconstruir sprites de cenário/tráfego no resize | **Não** — só redimensiona canvas/parallax/painel; pools de `Image` de cenário/tráfego continuam do tamanho que já estavam (crescem sob demanda, ver `SceneryRenderer.next()`/`TrafficRenderer.next()`) | Mudar `width`/`height` não muda a quantidade de sprites/carros visíveis por segmento, só a escala de projeção — nada no pool depende do tamanho do canvas |

## Passos

1. Estender `RacerEngine.applyOptions()` (da PHASER-TASK-21) para aceitar `width`/`height`
   opcionais, recomputando `this.resolution`.
2. Implementar `Game.applyResolution(width, height)` fazendo os passos da tabela acima, nesta
   ordem: `this.scale.resize(...)` → `racerEngine.applyOptions({ width, height })` →
   redimensionar os 3 `TileSprite` → `this.tweakUi.reposition(width)` → validar câmera (ajustar
   manualmente se necessário).
3. Adicionar o controle de `resolution` ao `TweakUi` (PHASER-TASK-21), reaproveitando o componente
   "anterior/próximo", com as mesmas 4 opções/pares de `v4.final.html:26-29`. O handler chama
   `(this.scene as Game).applyResolution(w, h)` (ou um callback passado no construtor do
   `TweakUi`, para não acoplar `TweakUi` ao tipo concreto `Game` — decidir na implementação).
4. Testar manualmente as 4 resoluções, dirigindo em cada uma, conferindo:
   - Canvas muda de tamanho de fato (não só o conteúdo interno).
   - Parallax (céu/morros/árvores) cobre a tela inteira em todas as resoluções, sem sobra/gap.
   - HUD (canto esquerdo) continua legível/no lugar certo.
   - `TweakUi` (canto direito, incluindo o botão de mute) se realoca corretamente, continua
     clicável/arrastável em todas as resoluções.
   - Nenhum erro no console ao trocar de resolução repetidamente (inclusive ida e volta
     fine→low→fine).

## Critério de conclusão

- [ ] `RacerEngine.applyOptions()` aceita `width`/`height`
- [ ] `Game.applyResolution()` implementado cobrindo todos os itens da tabela de levantamento
- [ ] Controle de `resolution` (anterior/próximo, 4 opções) adicionado ao `TweakUi`
- [ ] `TweakUi.reposition()` mantém o painel ancorado ao canto superior direito em qualquer
      resolução
- [ ] As 4 resoluções testadas manualmente (canvas, parallax, HUD, painel/mute — sem gaps/erros)
- [ ] Troca repetida entre resoluções não deixa estado inconsistente (testar pelo menos 5 trocas
      seguidas)
- [ ] `mise exec -- npm run typecheck` e `npm run build` sem erros
- [ ] Commit em `master` (ou branch de trabalho, a critério do usuário)

## Log de Execução *(preenchido após execução)*

**Data:** 2026-07-09

**Status:** 🔄 Em andamento — implementação completa, aguardando validação manual das 4 resoluções.

**Resumo do que foi feito:**

1. `RacerEngine.applyOptions()` estendido para aceitar `width`/`height` opcionais, recomputando
   `this.resolution = this.height / 480` (mesma fórmula do `reset()` original).
2. `Game.applyResolution(width, height)` implementado:
   - Chama `this.scale.resize(width, height)` para redimensionar o canvas.
   - Chama `racerEngine.applyOptions({ width, height })` para atualizar campos.
   - Redimensiona os 3 `TileSprite` de parallax (`skyTileSprite`, `hillsTileSprite`,
     `treesTileSprite`) via `.setSize(width, height)`.
   - Chama `this.tweakUi.reposition(width)` para realocar o painel.
3. `TweakUi.reposition(width)` implementado: recalcule a posição-x do container como
   `width - PANEL_WIDTH - PANEL_X_RIGHT_MARGIN`.
4. Controle de resolução adicionado ao `TweakUi`:
   - Constante `RESOLUTION_OPTIONS` com as 4 opções (fine/high/medium/low) e pares
     `width`/`height` correspondentes.
   - Método `createResolutionRow()` reaproveitando o padrão stepper ◀/▶ (similar a `lanes`).
   - Callback `onResolutionChange` adicionado ao construtor, chamado pelos botões.
   - Linha de resolução inserida após o stepper de `lanes`.
5. `Game.ts` atualizado: `TweakUi` instanciado com callback `(w, h) => this.applyResolution(w, h)`.

**Arquivos modificados:**
- `racer-phaser/src/game/racer/RacerEngine.ts` (applyOptions estendido)
- `racer-phaser/src/game/scenes/Game.ts` (applyResolution + callback para TweakUi)
- `racer-phaser/src/game/racer/TweakUi.ts` (reposition + createResolutionRow + callback)

**Verificação automatizada:**
- `mise exec -- npm run typecheck` → 0 erros
- `mise exec -- npm run build-nolog` → build limpo (vite, sem erros)

**Pendente (requer ação do usuário):**
- Validação manual: abrir `npm run dev`, clicar em ⚙, testar as 4 resoluções (fine/high/medium/low)
  dirigindo em cada uma, conferindo canvas, parallax, HUD, painel/mute sem gaps/erros, e troca
  repetida (5 trocas seguidas) sem estado inconsistente. Após confirmação, marcar como ✅ e
  commitar.
