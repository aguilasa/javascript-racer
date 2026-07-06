---
id: RACER-TASK-08
title: "Criar a classe Road (DSL de construção de pista)"
type: implementação
category: frontend
phase: 2
depends_on: ["RACER-TASK-04", "RACER-TASK-05"]
status: pendente
---

# RACER-TASK-08: Criar a classe `Road` (DSL de construção de pista)

## Contexto

- **Plano completo:** `docs/projeto/01-arquitetura-alvo.md`, seção "A classe `Road`: a DSL de
  construção de pista, compartilhada".
- **Fonte original:** as funções `addSegment`, `addRoad`, `addStraight`, `addCurve`,
  `addHill`, `addSCurves`, `addLowRollingHills`, `addBumps`, `addDownhillToEnd`,
  `findSegment`, `lastY`, hoje duplicadas/variando entre `v2.curves.html`, `v3.hills.html` e
  `v4.final.html` — ver `docs/03-v2-curvas.md`, `docs/04-v3-colinas.md` e
  `docs/05-v4-final.md#510`.
- **Decisão importante desta tarefa:** mesmo a v1 (que originalmente usa um `for` cru de 500
  segmentos sem DSL) vai usar esta mesma classe `Road` — ver
  `docs/projeto/01-arquitetura-alvo.md`, "Decisão intencional".

## Objetivo

Criar `app/src/core/Road.ts`, implementando a DSL **completa** (o superconjunto de tudo que
`v2`/`v3`/`v4` usam), parametrizada por `segmentLength` e `rumbleLength`.

## Requisitos da implementação

```ts
import type { Segment } from './types'

export class Road {
  segments: Segment[] = []
  trackLength = 0

  constructor(
    private segmentLength: number,
    private rumbleLength: number,
  ) {}

  addSegment(curve = 0, y = 0): void { /* ... */ }
  addRoad(enter: number, hold: number, leave: number, curve = 0, y = 0): void { /* ... */ }
  addStraight(num?: number): void { /* ... */ }
  addHill(num?: number, height?: number): void { /* ... */ }
  addCurve(num?: number, curve?: number, height?: number): void { /* ... */ }
  addLowRollingHills(num?: number, height?: number): void { /* ... */ }
  addSCurves(): void { /* ... */ }
  addBumps(): void { /* ... */ }
  addDownhillToEnd(num?: number): void { /* ... */ }
  findSegment(z: number): Segment { /* ... */ }
  markStartFinish(playerZ: number): void { /* ... */ } // marca COLORS.START/FINISH — ver abaixo
  finalize(): void { this.trackLength = this.segments.length * this.segmentLength }

  private lastY(): number { /* ... */ }
}
```

Notas de implementação:

- `ROAD.LENGTH`/`ROAD.HILL`/`ROAD.CURVE` (as constantes nomeadas `SHORT`/`MEDIUM`/`LONG` etc.,
  ver `docs/04-v3-colinas.md#43-constantes-de-intensidade-de-morro`) viram um `export const
  ROAD = { LENGTH: {...}, HILL: {...}, CURVE: {...} } as const` no mesmo arquivo ou em
  `core/types.ts`.
- `markStartFinish(playerZ)` extrai a lógica hoje duplicada no fim de cada `resetRoad()`
  original (marcar `COLORS.START` nos 2 segmentos após `findSegment(playerZ)`, e `COLORS.FINISH`
  nos últimos `rumbleLength` segmentos) — ver, por exemplo,
  `docs/02-v1-estrada-reta.md#24-construção-da-geometria-da-pista`. Extrair isso para a classe
  `Road` evita repetir essa lógica em cada `RacerGameVN.buildRoad()`.
- `addSegment` já preenche `color` alternando `COLORS.LIGHT`/`COLORS.DARK` a cada
  `rumbleLength` segmentos, e inicializa `sprites: []`, `cars: []` no segmento.
- Cada segmento novo preenche `p1.world.y = lastY()` (continuidade garantida desde o início —
  ver `docs/04-v3-colinas.md#41-continuidade-de-altura-entre-segmentos-lasty`), mesmo em v1/v2
  onde `y` é sempre 0 (não custa nada manter o mesmo mecanismo para todas as versões).

## Passos

1. Ler `docs/03-v2-curvas.md` (`addSegment`/`addRoad`/`addStraight`/`addCurve`/`addSCurves`) e
   `docs/04-v3-colinas.md` (`lastY`/`addHill`/`addLowRollingHills`/`addDownhillToEnd`) e
   `docs/05-v4-final.md#510` (`addBumps`).
2. Implementar `core/Road.ts` com a API acima.
3. Escrever um pequeno smoke test manual (script temporário ou `console.log`, descartável) que
   crie uma `Road` com uma receita simples e confira `segments.length`/`trackLength` — não é
   um teste automatizado formal (fora de escopo, ver backlog), só uma checagem rápida.
4. `npm run typecheck` sem erros.

## Critério de conclusão

- [ ] `core/Road.ts` com toda a DSL (`addSegment`, `addRoad`, `addStraight`, `addHill`,
      `addCurve`, `addLowRollingHills`, `addSCurves`, `addBumps`, `addDownhillToEnd`,
      `findSegment`, `markStartFinish`, `finalize`)
- [ ] `ROAD` (constantes `LENGTH`/`HILL`/`CURVE`) portado
- [ ] Continuidade de altura (`lastY()`) preservada mesmo quando `y` é sempre 0
- [ ] `npm run typecheck` sem erros
- [ ] Nenhum arquivo fora de `app/` foi alterado

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
