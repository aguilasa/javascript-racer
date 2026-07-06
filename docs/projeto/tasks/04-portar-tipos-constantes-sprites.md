---
id: RACER-TASK-04
title: "Portar tipos, constantes e tabelas de sprites/background"
type: implementação
category: frontend
phase: 1
depends_on: ["RACER-TASK-03"]
status: pendente
---

# RACER-TASK-04: Portar tipos, constantes e tabelas de sprites/background

## Contexto

- **Plano completo:** `docs/projeto/01-arquitetura-alvo.md`, seções "Tipos centrais" e mapa de
  `common.js`.
- **Fonte original:**
  - `common.js`, bloco final (`KEY`, `COLORS`, `BACKGROUND`, `SPRITES`) — ver
    `docs/06-arquitetura-common-js.md#66-constantes-de-jogo-key-colors-background-sprites`.
  - `images/sprites.js` (variável `SPRITES`, gerada por `rake resprite`).
  - `images/background.js` (variável `BACKGROUND`, gerada por `rake resprite`).
- Esta tarefa é só dados e tipos — nenhuma lógica de jogo ainda.

## Objetivo

Criar, em `app/src/core/`:

1. `types.ts` — os tipos estruturais usados por todo o resto do motor.
2. `constants.ts` — `KEY` e `COLORS`, tipados.
3. `sprites.ts` — a tabela `SPRITES` (de `images/sprites.js`), tipada.
4. `background.ts` — a tabela `BACKGROUND` (de `images/background.js`), tipada.

## Requisitos da implementação

### `types.ts`

```ts
export interface WorldPoint { x?: number; y: number; z: number }
export interface CameraPoint { x: number; y: number; z: number }
export interface ScreenPoint { x: number; y: number; w: number; scale: number }

export interface SegmentPoint {
  world: WorldPoint
  camera: CameraPoint
  screen: ScreenPoint
}

export interface SpriteRect { x: number; y: number; w: number; h: number }
export interface SpriteSlot { source: SpriteRect; offset: number }

export interface SegmentColorSet {
  road: string
  grass: string
  rumble: string
  lane?: string
}

export interface Segment {
  index: number
  p1: SegmentPoint
  p2: SegmentPoint
  curve: number
  color: SegmentColorSet
  sprites: SpriteSlot[]
  cars: unknown[] // será restrito a Car[] a partir da RACER-TASK-13 (v4); manter genérico até lá
  looped?: boolean
  fog?: number
  clip?: number
}
```

> Ajustar conforme necessário ao implementar `Road`/`Renderer` nas próximas tarefas — este é o
> ponto de partida, não um contrato fechado (ver `docs/projeto/04-riscos-decisoes-abertas.md`,
> item 7).

### `constants.ts`

Portar `KEY` e `COLORS` exatamente como em
`docs/06-arquitetura-common-js.md#66-constantes-de-jogo-key-colors-background-sprites`,
tipados com `SegmentColorSet` para cada entrada de `COLORS` (`LIGHT`, `DARK`, `START`,
`FINISH`) e `as const` para `KEY`.

### `sprites.ts` / `background.ts`

Transcrever os objetos `SPRITES` (de `images/sprites.js`) e `BACKGROUND` (de
`images/background.js`) como `const` tipados (`Record<string, SpriteRect>` para `SPRITES`,
mais os campos derivados `SPRITES.SCALE`, `SPRITES.BILLBOARDS`, `SPRITES.PLANTS`,
`SPRITES.CARS` — ver `docs/05-v4-final.md#51-sprites-a-folha-de-sprites-e-suas-coordenadas`).
**Não** rodar o `Rakefile`/`sprite_factory` — é só transcrição manual dos valores já
existentes nos arquivos `.js` gerados.

## Passos

1. Ler `common.js` (bloco final), `images/sprites.js` e `images/background.js` na raiz do
   repo.
2. Criar os 4 arquivos em `app/src/core/` conforme acima.
3. `npm run typecheck` sem erros.

## Critério de conclusão

- [ ] `core/types.ts` com `WorldPoint`, `CameraPoint`, `ScreenPoint`, `SegmentPoint`,
      `SpriteRect`, `SpriteSlot`, `SegmentColorSet`, `Segment`
- [ ] `core/constants.ts` com `KEY` e `COLORS` tipados, valores idênticos ao original
- [ ] `core/sprites.ts` com todas as entradas de `SPRITES` + `SCALE`/`BILLBOARDS`/`PLANTS`/`CARS`
- [ ] `core/background.ts` com `SKY`/`HILLS`/`TREES`
- [ ] `npm run typecheck` sem erros
- [ ] Nenhum arquivo fora de `app/` foi alterado

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
