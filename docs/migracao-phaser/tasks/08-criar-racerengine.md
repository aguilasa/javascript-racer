---
id: PHASER-TASK-08
title: "Criar RacerEngine (física/regras fundidas de RacerGame+RacerGameV4)"
type: implementação
category: frontend
phase: 3
depends_on: ["PHASER-TASK-07"]
status: pendente
---

# PHASER-TASK-08: Criar `RacerEngine` (física/regras fundidas de `RacerGame`+`RacerGameV4`)

## Contexto

- **Fonte:** `app/src/core/RacerGame.ts` (template method: campos, `update()`, `render()`,
  `reset()`) + `app/src/versions/v4-final/RacerGameV4.ts` (única subclasse folha usada).
- **Plano completo:** `docs/migracao-phaser/01-arquitetura-alvo.md`, seção "Por que uma única
  `RacerEngine`" — **ler antes de começar**, explica por que não recriar a cadeia de herança
  V1-V4 aqui.
- Esta tarefa cria a classe de física/regras, **sem** ainda ligar tráfego/cenário/HUD/áudio —
  isso entra nas fases seguintes. O objetivo aqui é ter `update(dt)` funcionando (posição,
  velocidade, `playerX`, força centrífuga, parallax, fora-de-pista) de forma equivalente à fusão
  de `RacerGame.update()` + os pontos de extensão que `RacerGameV1`→`RacerGameV4` sobrescrevem.

## Objetivo

Criar `racer-phaser/src/game/racer/RacerEngine.ts`: uma classe **sem import de `phaser`**, que
expõe:
- Campos de configuração/estado (mesmos de `RacerGame`: `width`, `height`, `roadWidth`,
  `segmentLength`, `rumbleLength`, `lanes`, `fieldOfView`, `cameraHeight`, `cameraDepth`,
  `drawDistance`, `playerX`, `playerZ`, `fogDensity`, `position`, `speed`, `maxSpeed`, `accel`,
  `breaking`, `decel`, `offRoadDecel`, `offRoadLimit`, `offRoadHardLimit = 3` — usar direto o
  valor final da v4, sem os pontos de extensão intermediários de v1-v3, ver
  `RacerGame.offRoadHardLimit` comentário "v1-v3 use 2, v4 uses 3").
- Flags de input (`keyLeft`, `keyRight`, `keyFaster`, `keySlower`) — setadas de fora (pela scene,
  a partir do teclado do Phaser, na PHASER-TASK-09).
- `road: Road` (instância criada via `reset()`/`buildRoad()`, mesma receita de
  `RacerGameV4.buildRoad()`, **sem** `resetSprites()`/`TrafficManager` ainda — isso entra nas
  PHASER-TASK-11/13).
- Método `reset(options?)`: funde `RacerGame.reset()` (cálculo de `cameraDepth`/`playerZ`/
  `resolution`/`maxSpeed`/`accel`/`breaking`/`decel`/`offRoadDecel`/`offRoadLimit`) — a tweak UI
  (parâmetro `options`) está fora do escopo desta migração (ver
  `docs/migracao-phaser/04-riscos-decisoes.md`), então `reset()` pode não receber `options`
  nenhuma nesta tarefa, só os valores fixos de `RacerGame`.
- Método `update(dt: number): void`: funde o corpo de `RacerGame.update()` com o comportamento
  final de v2→v4 já aplicado diretamente (sem pontos de extensão separados): força centrífuga em
  curvas (`playerX -= dx * speedPercent * curve * centrifugal`), offsets de parallax
  (`skyOffset`/`hillOffset`/`treeOffset`, usando `(position - startPosition) / segmentLength`,
  a fórmula da v4 — ver `RacerGameV4.updateParallax`), câmera relativa ao terreno
  (`getCameraY` retornando `playerY + cameraHeight`).
- Método `getRenderState()` (ou equivalente): calcula e retorna os dados necessários para
  desenhar o frame atual — lista de segmentos visíveis já projetados (via `Util.project`),
  posição/escala do jogador — **sem** desenhar nada (quem desenha é `RoadRenderer`, chamado pela
  `Game` scene). Este método substitui o corpo de `RacerGame.render()` que hoje chama
  `this.renderer.*` diretamente — aqui só devolve os números já calculados.

## Requisitos da implementação

- **Sem import de `phaser`** — `RacerEngine` só depende de `util.ts`/`types.ts`/`constants.ts`/
  `Road.ts` (já portados). Isso preserva a separação entre física/regras e desenho, a mesma que
  `RacerGame` já tem hoje entre estado e `Renderer`.
- Não incluir ainda: tráfego (`updateTraffic`, `TrafficManager`), colisão contra sprites/carros
  (`updateExtras`), HUD/cronometragem de volta — esses entram nas PHASER-TASK-11 a 15. Nesta
  tarefa, `RacerEngine` já deve aceitar chamadas de `update(dt)` repetidas sem erro, mesmo sem
  tráfego/HUD ligados (o jogador acelera, freia, esterça, mas não colide com nada ainda).

## Passos

1. Reler `docs/migracao-phaser/01-arquitetura-alvo.md`, seção "Por que uma única `RacerEngine`".
2. Reler `app/src/core/RacerGame.ts` (`update`/`render`/`reset`) e
   `app/src/versions/v4-final/RacerGameV4.ts` (`updateParallax`, `getCameraY` — herdado de V3,
   conferir em `app/src/versions/v3-hills/RacerGameV3.ts` se necessário).
3. Implementar `RacerEngine.ts`.
4. Validar chamando `update(1/60)` repetidamente num teste manual (fora da UI, ex.: um pequeno
   script ou só observando via `console.log` temporário) e confirmando que `position`/`speed`/
   `playerX` evoluem de forma plausível.

## Critério de conclusão

- [ ] `RacerEngine.ts` sem nenhum `import` de `'phaser'`
- [ ] `reset()` calcula `cameraDepth`/`playerZ`/`resolution`/`maxSpeed`/`accel`/`breaking`/
      `decel`/`offRoadDecel`/`offRoadLimit` com as mesmas fórmulas de `RacerGame.reset()`
- [ ] `update(dt)` reproduz posição/velocidade/`playerX`/força centrífuga/parallax/fora-de-pista
      com o comportamento final da v4 (sem pontos de extensão separados por versão)
- [ ] `getRenderState()` (ou método equivalente) devolve os dados projetados sem desenhar nada
- [ ] `mise exec -- npm run build` sem erros
- [ ] Commit feito em `feature/phaser-port`

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:**
Criado `racer-phaser/src/game/racer/RacerEngine.ts` fundindo `RacerGame` e `RacerGameV4` em uma única classe sem dependência do Phaser. A classe implementa:
- Campos de configuração/estado (mesmos de `RacerGame`, com `offRoadHardLimit = 3` da v4)
- Flags de input (`keyLeft`, `keyRight`, `keyFaster`, `keySlower`)
- `road: Road` instância criada via `reset()`/`buildRoad()` (mesma receita de `RacerGameV4.buildRoad()`, sem `resetSprites()`/`TrafficManager` ainda)
- Método `reset()`: calcula `cameraDepth`/`playerZ`/`resolution`/`maxSpeed`/`accel`/`breaking`/`decel`/`offRoadDecel`/`offRoadLimit` com as mesmas fórmulas de `RacerGame.reset()`
- Método `update(dt)`: funde o corpo de `RacerGame.update()` com o comportamento final de v2→v4 já aplicado diretamente (força centrífuga em curvas, offsets de parallax, câmera relativa ao terreno)
- Método `getRenderState()`: calcula e retorna os dados necessários para desenhar o frame atual (lista de segmentos visíveis já projetados via `Util.project`, posição/escala do jogador) sem desenhar nada
- `updateLateralForces()`: movimento lateral + força centrífuga
- `updateParallax()`: offsets de parallax (sky/hill/tree) usando a fórmula da v4
- `getCameraY()`: retorna `playerY + cameraHeight` (herdado de V3)
- `getPlayerScreenY()`: retorna `this.height`
- `getPlayerUpdown()`: retorna 0 (sem hills no player ainda)

**Problemas encontrados:**
Nenhum.

**Arquivos criados/modificados:**
- Criado: `racer-phaser/src/game/racer/RacerEngine.ts`
- Modificado: `docs/migracao-phaser/tasks/progresso.md` (status PHASER-TASK-08 marcado como ✅ Concluído, checklist atualizado)
