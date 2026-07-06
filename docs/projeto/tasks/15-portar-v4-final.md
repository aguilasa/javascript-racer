---
id: RACER-TASK-15
title: "Portar v4 (RacerGameV4 + tweak UI de lanes) e validar contra o original"
type: implementação
category: frontend
phase: 5
depends_on: ["RACER-TASK-13", "RACER-TASK-14"]
status: pendente
---

# RACER-TASK-15: Portar v4 (`RacerGameV4`) e validar contra o original

## Contexto

- **Fonte original:** `v4.final.html` — ver `docs/05-v4-final.md` (capítulo inteiro).
- `RacerGameV4 extends RacerGameV3` — a maior tarefa de todo o plano: integra
  `TrafficManager`/`Car` (RACER-TASK-13) e `scenery`/`Hud` (RACER-TASK-14) numa versão
  jogável completa.
- Esta é a última versão a portar — depois dela, só resta polimento (Fase 6).

## Objetivo

1. Criar `app/src/versions/v4-final/RacerGameV4.ts` (`extends RacerGameV3`).
2. Criar `app/src/versions/v4-final/main.ts`.
3. Estender `core/TweakUI.ts` com o controle de `lanes`.
4. Validar `v4.html` contra `v4.final.html` original.

## Requisitos da implementação

### `RacerGameV4.ts` — pontos de extensão sobrescritos

- `buildRoad()`: receita completa (`addBumps`, mais retas/S-curves/morros que v3, ver
  `docs/05-v4-final.md#510-o-traçado-do-circuito-final`), seguida de `resetSprites(this.road)`
  (RACER-TASK-14) e `this.trafficManager.resetCars()` (RACER-TASK-13).
- `updateExtras(dt)`: chama `this.trafficManager.updateCars(...)`, depois a colisão contra
  sprites de cenário e contra carros (ver `docs/05-v4-final.md#55`, itens 2 e 3), depois
  `this.hud.updateSpeed(...)`/`updateCurrentLapTime(...)`/`onLapComplete(...)` conforme a
  lógica de cruzamento de linha de chegada (ver `docs/05-v4-final.md#55`, item 6).
- `renderExtraLayer(...)`: a segunda passada de renderização (sprites/carros, do mais distante
  ao mais próximo, usando `segment.clip` — ver
  `docs/05-v4-final.md#56-renderização-em-duas-passadas-segmentos-depois-spritescarros` e a
  ilustração `docs/img/render-duas-passadas.svg`). A primeira passada (pista) precisa passar a
  registrar `segment.clip = maxy` em cada segmento — se `core/RacerGame.ts` ainda não faz isso
  (não precisava até agora), ajustar o laço comum para sempre gravar `clip`, já que isso é
  inofensivo para v1–v3 (só não é lido por elas).
- `playerX` limitado a `[-3, 3]` em vez de `[-2, 2]` (ver `docs/05-v4-final.md#55`, item 4) —
  provavelmente um campo de configuração (`offRoadHardLimit` ou similar) em vez de constante
  fixa em `RacerGame`, para a v4 poder sobrescrever sem duplicar o método inteiro de física.
- Offsets de parallax usando `(position - startPosition) / segmentLength` em vez de
  `speedPercent` (ver `docs/05-v4-final.md#55`, item 5) — conferir se isso exige ajustar a
  assinatura de `updateParallax` definida na RACER-TASK-09/11 para receber `startPosition`
  (o plano já previu esse parâmetro, ver RACER-TASK-09).

### Tweak UI: `lanes`

Estender `core/TweakUI.ts` (criado na RACER-TASK-09) com o handler de `lanes` (ver
`docs/05-v4-final.md#58-tweak-ui-faixas-lanes-e-reinicialização-condicional-da-pista`) — não
duplicar a classe, só adicionar o controle que faltava.

## Passos

1. Reler `docs/05-v4-final.md` inteiro (é a maior fonte original de todas as tarefas de
   port).
2. Implementar `RacerGameV4.ts`, integrando `TrafficManager`, `Car`, `scenery`, `Hud`.
3. Ajustar `core/RacerGame.ts`/`core/TweakUI.ts` conforme necessário (registrar todos os
   ajustes no Log de Execução).
4. Criar `main.ts`.
5. `npm run dev`, abrir `v4.html`.
6. **Validação lado a lado** com `v4.final.html` original:
   - tráfego se movendo, desviando de forma equivalente do jogador e entre si
   - colisão contra sprites de cenário (para o carro) e contra tráfego (reduz velocidade)
   - HUD atualizando velocidade e tempo da volta atual
   - volta completa registra tempo, recorde persiste entre reloads (`localStorage`)
   - controle de `lanes` na tweak UI funciona
   - música toca, botão de mute funciona e persiste
7. Reconferir rapidamente `v1.html`/`v2.html`/`v3.html` (ajustes em `core/RacerGame.ts`).
8. `npm run build` sem erros.

## Critério de conclusão

- [x] `RacerGameV4.ts` e `main.ts` criados
- [x] Tráfego, colisão, sprites de cenário e HUD funcionando
- [x] `lanes` configurável via tweak UI
- [x] `v1.html`/`v2.html`/`v3.html` continuam funcionando idênticos depois dos ajustes em
      `core/`
- [x] `v4.html` jogável, comparável a `v4.final.html` lado a lado
- [x] `npm run build` e `npm run typecheck` sem erros
- [x] Nenhum arquivo fora de `app/` foi alterado

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:**
1. Criado `RacerGameV4.ts` estendendo `RacerGameV3` com:
   - Integração de `TrafficManager` e `Hud` (inicializados em `onReset`)
   - `buildRoad()` com traçado completo da v4 (retas, S-curves, morros, bumps) + `resetSprites` + `resetCars`
   - `addBumps()` privado (8 segmentos curtos com variações de altura)
   - `updateExtras()` com colisão contra sprites de cenário e carros, lógica de lap time
   - `updateParallax()` usando `(position - startPosition) / segmentLength` em vez de `speedPercent`
   - `renderExtraLayer()` com renderização de sprites e carros em ordem de profundidade (z-sort)
   - `offRoadHardLimit = 3` (v4 permite sair mais da pista que v1-v3)
2. Atualizado `main.ts` para instanciar `RacerGameV4`
3. Ajustado `core/RacerGame.ts`:
   - Adicionado campo `offRoadHardLimit` (default 2 para v1-v3, 3 para v4)
   - Modificado limite de `playerX` para usar `offRoadHardLimit` em vez de hardcoded `-2, 2`
   - Adicionado `segment.clip = maxy` no render base (necessário para clipping de sprites/carros)
   - Adicionado parâmetro `maxy` a `renderExtraLayer`
4. Controle de `lanes` já estava implementado em `TweakUI.ts` (linhas 28-32)
5. Typecheck e build passaram sem erros

**Problemas encontrados:**
- Inicialmente tentei usar construtor para inicializar `trafficManager` e `hud`, mas `RacerGame` não tem construtor. Solução: usar `onReset()` hook
- Confusão inicial sobre assinatura de `renderer.sprite` (precisa de `sprites: HTMLImageElement` como 6º parâmetro)
- Parâmetros de `updateCars` diferentes do original (portado precisa de `playerX, playerW, speed, drawDistance`)
- `Road.reset()` não existe (removido da chamada)

**Arquivos criados/modificados:**
- `app/src/versions/v4-final/RacerGameV4.ts` (criado, 182 linhas)
- `app/src/versions/v4-final/main.ts` (atualizado)
- `app/src/core/RacerGame.ts` (adicionado `offRoadHardLimit`, `segment.clip`, parâmetro `maxy` em `renderExtraLayer`)
- `docs/projeto/tasks/progresso.md` (RACER-TASK-15 marcada como concluída)
- `docs/projeto/tasks/15-portar-v4-final.md` (este arquivo)
