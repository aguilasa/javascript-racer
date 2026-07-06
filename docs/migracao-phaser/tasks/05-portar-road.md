---
id: PHASER-TASK-05
title: "Portar Road.ts (DSL de construção de pista)"
type: implementação
category: frontend
phase: 1
depends_on: ["PHASER-TASK-03"]
status: pendente
---

# PHASER-TASK-05: Portar `Road.ts` (DSL de construção de pista)

## Contexto

- **Fonte:** `app/src/core/Road.ts`
- **Plano completo:** `docs/migracao-phaser/01-arquitetura-alvo.md`, linha da tabela referente a
  `Road.ts` — "verbatim, não tem estado de canvas".
- Pode ser feita em paralelo com a PHASER-TASK-04 (ambas dependem só da PHASER-TASK-03).

## Objetivo

Portar `Road.ts` (classe `Road` + `export const ROAD`) verbatim para
`racer-phaser/src/game/racer/Road.ts`.

## Requisitos da implementação

- Copiar a classe inteira: `addSegment`, `addRoad`, `addStraight`, `addHill`, `addCurve`,
  `addLowRollingHills`, `addSCurves`, `addBumps`, `addDownhillToEnd`, `findSegment`,
  `markStartFinish`, `finalize`, `lastY` (privado), e o getter `segmentLength`.
- `export const ROAD = { LENGTH: {...}, HILL: {...}, CURVE: {...} }` idêntico.
- Nenhuma dependência do Phaser — só `types.ts`/`constants.ts`/`util.ts` (já portados nas
  PHASER-TASK-03/04).

## Passos

1. Ler `app/src/core/Road.ts` por completo.
2. Copiar para `racer-phaser/src/game/racer/Road.ts`, ajustando só os caminhos de import
   relativos (`./types`, `./constants`, `./util`).
3. `mise exec -- npm run build` sem erros.

## Critério de conclusão

- [x] `racer-phaser/src/game/racer/Road.ts` com a DSL completa (12 métodos públicos + `lastY`
      privado) e `export const ROAD`
- [x] Fórmulas de `addRoad`/`addLowRollingHills`/`addSCurves`/`addBumps`/`addDownhillToEnd`
      idênticas a `app/src/core/Road.ts`
- [x] `mise exec -- npm run build` sem erros
- [x] Commit feito em `feature/phaser-port`

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:**
- Copiou `Road.ts` de `app/src/core/` para `racer-phaser/src/game/racer/` (classe `Road` com 12 métodos públicos + `lastY` privado)
- Ajustou imports relativos para `./types`, `./constants`, `./util`
- Copiou `export const ROAD` com LENGTH/HILL/CURVE idênticos
- Validado `mise exec -- npm run build` - build concluído sem erros

**Problemas encontrados:**
- Nenhum

**Arquivos criados/modificados:**
- `racer-phaser/src/game/racer/Road.ts` (criado)
