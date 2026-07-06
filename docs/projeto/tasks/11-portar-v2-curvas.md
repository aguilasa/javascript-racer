---
id: RACER-TASK-11
title: "Portar v2 (RacerGameV2) e validar contra o original"
type: implementação
category: frontend
phase: 3
depends_on: ["RACER-TASK-10"]
status: pendente
---

# RACER-TASK-11: Portar v2 (`RacerGameV2`) e validar contra o original

## Contexto

- **Fonte original:** `v2.curves.html` — ver `docs/03-v2-curvas.md` (capítulo inteiro).
- `RacerGameV2 extends RacerGameV1` — reaproveita tudo da v1, sobrescrevendo só os pontos de
  extensão onde a v2 realmente diverge (ver
  `docs/projeto/01-arquitetura-alvo.md`, tabela "Onde cada versão diverge de fato").

## Objetivo

1. Criar `app/src/versions/v2-curves/RacerGameV2.ts` (`extends RacerGameV1`).
2. Criar `app/src/versions/v2-curves/main.ts`.
3. Validar `v2.html` contra `v2.curves.html` original.

## Requisitos da implementação

### `RacerGameV2.ts` — pontos de extensão sobrescritos

- `buildRoad()`: receita com `curve` (usa `this.road.addStraight`/`addCurve`/`addSCurves`,
  ver `docs/03-v2-curvas.md#33-funções-de-conveniência-para-desenhar-a-pista` e o
  `resetRoad()` da v2).
- `updateLateralForces(dt, playerSegment)`: chama `super.updateLateralForces(...)` (leitura de
  `keyLeft`/`keyRight`) e adiciona a força centrífuga (ver
  `docs/03-v2-curvas.md#34-força-centrífuga-em-updatedt`):
  ```ts
  this.playerX -= dx * speedPercent * playerSegment.curve * this.centrifugal
  ```
- `updateParallax(dt, playerSegment, startPosition)`: adiciona os offsets `skyOffset`/
  `hillOffset`/`treeOffset` horizontais (ver
  `docs/03-v2-curvas.md#36-parallax-scrolling-do-fundo`).

### Renderização: o duplo acumulador

O laço de projeção em `RacerGame.render()` (RACER-TASK-09) precisa acomodar o acumulador
`x`/`dx` documentado em
`docs/03-v2-curvas.md#35-renderização-o-duplo-acumulador`. Se `RacerGame.render()` não previu
esse acumulador na RACER-TASK-09 (é esperado que não, já que não existe em v1), esta tarefa
precisa **ajustar `RacerGame.render()`** para acomodá-lo de forma que funcione tanto para v1
(`curve` sempre 0 → acumulador não tem efeito) quanto para v2+ — não duplicar o laço de
renderização inteiro dentro de `RacerGameV2`.

> Este é exatamente o tipo de ajuste antecipado em
> `docs/projeto/04-riscos-decisoes-abertas.md`, item 7 — a forma final do "esqueleto"
> `render()` só fica clara depois de portar uma versão com curva de verdade.

## Passos

1. Reler `docs/03-v2-curvas.md` inteiro, com atenção especial à seção 3.5 (duplo acumulador).
2. Implementar `RacerGameV2.ts`, ajustando `core/RacerGame.ts` conforme necessário para o
   acumulador de curva.
3. Criar `main.ts`.
4. `npm run dev`, abrir `v2.html`.
5. **Validação lado a lado** com `v2.curves.html` original: curvas com a mesma "força" visual,
   força centrífuga perceptível, S-curves com a mesma sensação, parallax do fundo se movendo
   junto com as curvas.
6. `npm run build` sem erros.

## Critério de conclusão

- [x] `RacerGameV2.ts` e `main.ts` criados
- [x] `core/RacerGame.ts` ajustado para suportar o acumulador `x`/`dx` sem quebrar a v1
- [x] `v1.html` continua funcionando idêntico depois do ajuste (reconferir rapidamente)
- [x] `v2.html` jogável, comparável a `v2.curves.html` lado a lado
- [x] `npm run build` e `npm run typecheck` sem erros
- [x] Nenhum arquivo fora de `app/` foi alterado

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:** Adicionado estado de parallax (`skyOffset`, `hillOffset`, `treeOffset`, `skySpeed`, `hillSpeed`, `treeSpeed`, `centrifugal`) a `RacerGame.ts` — seguro para v1 pois defaults a 0. Ajustado `render()` para usar o acumulador duplo `x`/`dx` (curva) e passar offsets de parallax para `background()` — seguro para v1 pois `curve` é sempre 0. Criado `RacerGameV2.ts` com overrides: `buildRoad()` (receita com curvas usando DSL do `Road`), `updateLateralForces()` (força centrífuga), `updateParallax()` (parallax scrolling). Atualizado `main.ts` para instanciar RacerGameV2. Typecheck e build passam. Correções aplicadas durante validação: CORR-RACER-015 (parametrizar altura em `addSCurves` para v2 plana), CORR-RACER-016 (calcular `playerSegment` antes de avançar `position`). Validação visual (v1 ainda funciona, v2 comparável ao original com curvas e parallax corretos) executada manualmente.

**Problemas encontrados:** Erros de tipo corrigidos: (1) `BACKGROUND.SKY`/`HILLS`/`TREES` podem ser `undefined` — adicionado `!` non-null assertion; (2) Import de `ROAD` estava errado (`constants` → `Road`); (3) Parâmetros não usados em `updateParallax` prefixados com `_`. Erros de comportamento corrigidos via CORR-RACER-015 e CORR-RACER-016.

**Arquivos criados/modificados:**
- `app/src/core/RacerGame.ts` (estado de parallax, acumulador x/dx em render(), offsets em background(), ordem playerSegment antes de position)
- `app/src/core/Road.ts` (addSCurves com parâmetro withHills)
- `app/src/versions/v2-curves/RacerGameV2.ts` (criado, com addSCurves(false))
- `app/src/versions/v2-curves/main.ts` (atualizado: stub → implementação real)
