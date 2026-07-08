---
id: PHASER-TASK-06
title: "Criar RoadRenderer (Graphics) — desenho estático de um segmento"
type: implementação
category: frontend
phase: 2
depends_on: ["PHASER-TASK-04", "PHASER-TASK-05"]
status: pendente
---

# PHASER-TASK-06: Criar `RoadRenderer` (`Graphics`) — desenho estático de um segmento

## Contexto

- **Fonte de comportamento:** `app/src/core/Renderer.ts` (`polygon`, `segment`, `fog`),
  documentado função a função em `docs/06-arquitetura-common-js.md §6.5`.
- **Plano completo:** `docs/migracao-phaser/01-arquitetura-alvo.md`, seção "Renderização:
  `Graphics` + pool de `Image`" — **ler antes de começar**, define exatamente a técnica.
- Esta tarefa cria só a peça de desenho da pista (trapézios) — ainda **sem** mover câmera, sem
  sprites/carros, sem fundo. A integração numa cena jogável é a PHASER-TASK-07.

## Objetivo

Criar `racer-phaser/src/game/racer/RoadRenderer.ts`, uma classe que recebe a `Scene` do Phaser no
construtor e expõe um método `segment(...)` equivalente a `Renderer.segment()`, desenhando via
`Phaser.GameObjects.Graphics` em vez de `CanvasRenderingContext2D`.

## Requisitos da implementação

- Construtor recebe a `Scene`; cria (e guarda) uma única instância de
  `this.scene.add.graphics()` reaproveitada entre frames — não criar um novo `Graphics` por
  chamada.
- Método `clear()`: chama `graphics.clear()` (equivalente ao `ctx.clearRect` do início de
  `RacerGame.render()`).
- Método `segment(width, lanes, x1, y1, w1, x2, y2, w2, fog, color)`: reproduz exatamente a
  lógica de `Renderer.segment()` — grama (retângulo cobrindo a largura, `graphics.fillRect`),
  rumble strips (dois trapézios via `graphics.fillPoints([...], true)`), superfície da pista (um
  trapézio), marcadores de faixa (`lanes - 1` trapézios finos, só se `color.lane` existir), e a
  neblina por cima (ver abaixo). Preservar as fórmulas `rumbleWidth`/`laneMarkerWidth`
  (`projectedRoadWidth / Math.max(6, 2*lanes)` e `/ Math.max(32, 8*lanes)`) idênticas.
- Método `fog(x, y, width, height, fogValue)`: reproduz `Renderer.fog()` — um retângulo
  semi-transparente (`graphics.fillStyle(colorNumero, 1 - fogValue)`) só quando `fogValue < 1`.
  Nota: `Graphics.fillStyle` do Phaser recebe cor como número hexadecimal, não string CSS — as
  cores de `COLORS` (`'#6B6B6B'`, `'#10AA10'`, etc.) precisam ser convertidas para
  `Phaser.Display.Color.HexStringToColor(str).color` (ou equivalente) antes de passar para
  `fillStyle`.
- Método privado `polygon(points: number[][], color: number)`: equivalente a
  `Renderer.polygon()`, usando `graphics.fillStyle(color).fillPoints(points, true)`.

## Passos

1. Ler `docs/migracao-phaser/01-arquitetura-alvo.md`, seção "Renderização".
2. Reler `app/src/core/Renderer.ts` (`polygon`/`segment`/`fog`) e
   `docs/06-arquitetura-common-js.md §6.5` para confirmar a lógica exata a reproduzir.
3. Implementar `RoadRenderer.ts`.
4. Criar um teste manual temporário (ex.: dentro do `create()` de uma scene de teste, ou
   reaproveitando `Game.ts` provisoriamente) que desenha 1-2 segmentos fixos com coordenadas
   fabricadas à mão, só para confirmar visualmente que os trapézios aparecem corretos (cores de
   pista/grama/rumble/faixa, neblina). Este teste é descartável — a integração real com `Road`
   vem na PHASER-TASK-07.

## Critério de conclusão

- [ ] `RoadRenderer.ts` com `clear()`, `segment(...)`, `fog(...)`, `polygon(...)` (privado)
- [ ] Fórmulas de `rumbleWidth`/`laneMarkerWidth` idênticas ao original
- [ ] Conversão de cor `string` (CSS) → número (Phaser) documentada e funcionando
- [ ] Teste manual confirma visualmente um segmento desenhado corretamente (grama, rumble,
      pista, marcadores de faixa, neblina)
- [ ] `mise exec -- npm run build` sem erros
- [ ] Commit feito em `feature/phaser-port`

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
