---
id: RACER-TASK-12
title: "Portar v3 (RacerGameV3) e validar contra o original"
type: implementação
category: frontend
phase: 4
depends_on: ["RACER-TASK-11"]
status: pendente
---

# RACER-TASK-12: Portar v3 (`RacerGameV3`) e validar contra o original

## Contexto

- **Fonte original:** `v3.hills.html` — ver `docs/04-v3-colinas.md` (capítulo inteiro).
- `RacerGameV3 extends RacerGameV2` — só adiciona altura (`y`); nenhuma mudança de física em
  `update()` (o próprio artigo original é explícito sobre isso, ver
  `docs/04-v3-colinas.md#46-update--sem-mudanças-de-física`).

## Objetivo

1. Criar `app/src/versions/v3-hills/RacerGameV3.ts` (`extends RacerGameV2`).
2. Criar `app/src/versions/v3-hills/main.ts`.
3. Validar `v3.html` contra `v3.hills.html` original.

## Requisitos da implementação

### `RacerGameV3.ts` — pontos de extensão sobrescritos

- `buildRoad()`: receita com `curve` **e** `y` (usa `addHill`/`addLowRollingHills`/
  `addSCurves` com altura/`addDownhillToEnd`, ver
  `docs/04-v3-colinas.md#45-o-traçado-completo-do-circuito`).
- `updateLateralForces`/`updateExtras`: **nenhuma mudança** em relação a `RacerGameV2` — não
  sobrescrever (confirma o que o artigo original documenta).
- `getCameraY(playerY)`: sobrescreve para retornar `playerY + this.cameraHeight` (ver
  `docs/04-v3-colinas.md#47-render--o-que-de-fato-muda`, item 2).
- `updateParallax(...)`: estende o offset horizontal (herdado de v2) com deslocamento
  **vertical** das camadas de fundo, proporcional a `playerY` (ver
  `docs/04-v3-colinas.md#47`, item 3).
- `getPlayerScreenY(...)`: sobrescreve para calcular a posição vertical do carro a partir da
  projeção da altura da câmera (ver `docs/04-v3-colinas.md#47`, item 5).
- `getPlayerUpdown(...)`: sobrescreve para retornar
  `playerSegment.p2.world.y - playerSegment.p1.world.y` (escolhe sprite normal vs. subindo
  ladeira).

### Back-face culling

O laço de projeção em `RacerGame.render()` precisa do critério de descarte extra
`segment.p2.screen.y >= segment.p1.screen.y` (ver
`docs/04-v3-colinas.md#47`, item 4, e a ilustração em
`docs/img/backface-culling-crista.svg`). Como este critério é inofensivo em terrenos planos
(nunca dispara em v1/v2, já que lá `p2.screen.y` é sempre menor que `p1.screen.y`), ele pode
ser adicionado diretamente ao laço comum em `core/RacerGame.ts` (RACER-TASK-09) em vez de
virar mais um ponto de extensão — confirmar esse raciocínio ao implementar, e documentar a
decisão tomada no Log de Execução.

## Passos

1. Reler `docs/04-v3-colinas.md` inteiro.
2. Implementar `RacerGameV3.ts`, ajustando `core/RacerGame.ts` para o critério de back-face
   culling.
3. Criar `main.ts`.
4. `npm run dev`, abrir `v3.html`.
5. **Validação lado a lado** com `v3.hills.html` original: morros com perfil suave (sem
   degraus), câmera acompanhando o terreno, carro subindo/descendo visualmente na tela, sprite
   do carro trocando para "subindo ladeira" no lugar certo.
6. Reconferir rapidamente `v1.html`/`v2.html` (o ajuste de back-face culling é no código
   compartilhado).
7. `npm run build` sem erros.

## Critério de conclusão

- [ ] `RacerGameV3.ts` e `main.ts` criados
- [ ] Back-face culling adicionado ao laço comum de `core/RacerGame.ts`
- [ ] `v1.html`/`v2.html` continuam funcionando idênticos depois do ajuste
- [ ] `v3.html` jogável, comparável a `v3.hills.html` lado a lado
- [ ] `npm run build` e `npm run typecheck` sem erros
- [ ] Nenhum arquivo fora de `app/` foi alterado

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:** Adicionado critério de back-face culling `(segment.p2.screen.y >= segment.p1.screen.y)` ao laço de renderização comum em `core/RacerGame.ts` — seguro para v1/v2 pois nunca dispara em terreno plano. Criado `RacerGameV3.ts` com overrides: `buildRoad()` (receita com colinas usando DSL do `Road`), `getCameraY()` (câmera flutua acima do terreno), `render()` (calcula parallax vertical baseado em `playerY` e passa para `background()`), `getPlayerScreenY()` (posição vertical do carro derivada da projeção da câmera), `getPlayerUpdown()` (diferença de altura para escolher sprite de subida). Não sobrescreve `updateLateralForces`/`updateExtras`/`updateParallax` (física idêntica à v2). Atualizado `main.ts` para instanciar RacerGameV3. Typecheck e build passam. O back-face culling não afeta v1/v2 (terreno plano nunca ativa o critério). Validação visual (morros suaves, câmera acompanhando terreno, carro subindo/descendo visualmente) requer execução manual de `npm run dev`.

**Problemas encontrados:** Erro de import corrigido: `BACKGROUND` estava sendo importado de `constants.ts` mas está em `background.ts`.

**Arquivos criados/modificados:**
- `app/src/core/RacerGame.ts` (back-face culling no laço de renderização)
- `app/src/versions/v3-hills/RacerGameV3.ts` (criado)
- `app/src/versions/v3-hills/main.ts` (atualizado: stub → implementação real)
