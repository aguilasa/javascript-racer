---
id: RACER-TASK-07
title: "Portar Renderer"
type: implementação
category: frontend
phase: 1
depends_on: ["RACER-TASK-04", "RACER-TASK-05"]
status: pendente
---

# RACER-TASK-07: Portar `Renderer`

## Contexto

- **Fonte original:** `common.js`, namespace `Render` — ver
  `docs/06-arquitetura-common-js.md#65-render--desenho-no-canvas`.
- É a última peça do núcleo compartilhado antes de começar a portar as versões do jogo
  (Fase 2).

## Objetivo

Criar `app/src/core/Renderer.ts`: uma classe fina que recebe o `CanvasRenderingContext2D` uma
vez (no construtor) e expõe os métodos de desenho como métodos de instância, evitando passar
`ctx` como primeiro parâmetro em toda chamada (diferença deliberada em relação ao original,
que passa `ctx` explicitamente em toda função de `Render.*` — ver
`docs/projeto/01-arquitetura-alvo.md`, tabela de mapeamento).

## Requisitos da implementação

Portar, como métodos de `Renderer`:

- `polygon(x1, y1, x2, y2, x3, y3, x4, y4, color)`
- `segment(width, lanes, x1, y1, w1, x2, y2, w2, fog, color)` (usa `rumbleWidth`/
  `laneMarkerWidth` internamente)
- `background(background: HTMLImageElement, width, height, layer: SpriteRect, rotation?, offset?)`
- `sprite(width, height, resolution, roadWidth, sprites: HTMLImageElement, sprite: SpriteRect, scale, destX, destY, offsetX?, offsetY?, clipY?)`
- `player(width, height, resolution, roadWidth, sprites: HTMLImageElement, speedPercent, scale, destX, destY, steer, updown)` — precisa de acesso à tabela `SPRITES` (`core/sprites.ts`, RACER-TASK-04) para escolher entre os 6 sprites do carro do jogador
- `fog(x, y, width, height, fog)`
- `rumbleWidth(projectedRoadWidth, lanes)` / `laneMarkerWidth(projectedRoadWidth, lanes)` (privados)

Preservar exatamente as fórmulas geométricas documentadas em
`docs/06-arquitetura-common-js.md` §6.5 — em particular:
- a técnica de "faixa dupla" em `background` (a textura tem o dobro da largura da tela, ver
  `#renderbackground`)
- o recorte por `clipY` em `sprite` (usado a partir da v3/v4 para back-face culling e cortes
  de horizonte)
- o "bounce" aleatório em `player`

## Passos

1. Ler `common.js`, namespace `Render` inteiro, e `docs/06-arquitetura-common-js.md` §6.5.
2. Implementar `core/Renderer.ts`, usando os tipos de `core/types.ts` e as tabelas de
   `core/sprites.ts`/`core/background.ts` (RACER-TASK-04).
3. `npm run typecheck` sem erros.

## Critério de conclusão

- [x] `core/Renderer.ts` com todos os métodos de `Render.*` portados como métodos de
      instância (recebendo `ctx` uma vez no construtor)
- [x] `player` escolhe o sprite correto (reto/esquerda/direita × plano/subindo) idêntico ao
      original
- [x] `background` reproduz a técnica de textura "dobro da largura" sem costura
- [x] `sprite` recorta corretamente por `clipY` quando fornecido
- [x] `npm run typecheck` sem erros
- [x] Nenhum arquivo fora de `app/` foi alterado

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-05

**Resumo do que foi feito:** Criado `app/src/core/Renderer.ts` com os métodos `polygon`,
`segment`, `background`, `sprite`, `player`, `fog` (públicos) e `rumbleWidth`/`laneMarkerWidth`
(privados). Recebe `CanvasRenderingContext2D` no construtor; elimina o parâmetro `ctx` em toda
chamada. Fórmulas idênticas ao original incluindo técnica de textura dupla em `background`,
recorte por `clipY` em `sprite`, e bounce aleatório em `player`. `player` acessa `SPRITES.*`
diretamente de `core/sprites.ts`.
Efeito colateral necessário: corrigido `core/sprites.ts` — removida anotação explícita
`Record<string, SpriteRect>` de `_S`, pois ocultava os nomes de propriedade no spread de
`SPRITES`, tornando `SPRITES.PLAYER_STRAIGHT` etc. inacessíveis pelo compilador. Acesso
migrado para dot notation sem `!`.

**Problemas encontrados:**
1. `SPRITES.PLAYER_*` inacessíveis — causado pela anotação `Record<string,SpriteRect>` em `_S`
   que apagava informação de tipo no spread; corrigido removendo a anotação.
2. Parâmetros `height`/`resolution` sem uso em `sprite()`/`player()` (exigidos pela assinatura
   para compatibilidade com os call sites futuros) — prefixados com `_` para suprimir TS6133.

**Arquivos criados/modificados:**
- `app/src/core/Renderer.ts` (criado)
- `app/src/core/sprites.ts` (anotação `Record<string,SpriteRect>` removida; bracket access → dot access)
