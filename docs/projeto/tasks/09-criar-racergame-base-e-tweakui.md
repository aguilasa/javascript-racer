---
id: RACER-TASK-09
title: "Criar a classe base RacerGame e TweakUI"
type: implementação
category: frontend
phase: 2
depends_on: ["RACER-TASK-06", "RACER-TASK-07", "RACER-TASK-08"]
status: pendente
---

# RACER-TASK-09: Criar a classe base `RacerGame` e `TweakUI`

## Contexto

- **Plano completo:** `docs/projeto/01-arquitetura-alvo.md`, seção "O motor compartilhado: uma
  cadeia de herança que espelha v1→v2→v3→v4" — **ler esta seção inteira antes de começar**,
  ela é o contrato desta tarefa.
- Esta é a tarefa mais importante para validar a arquitetura proposta: `RacerGame` é a classe
  base abstrata da qual `RacerGameV1`…`V4` (RACER-TASK-10, 11, 12, 15) vão herdar.
- **Nenhuma versão concreta é criada aqui** — só o esqueleto e os pontos de extensão. A
  primeira subclasse real (`RacerGameV1`) é a RACER-TASK-10, que vai validar/ajustar os
  limites exatos desses pontos de extensão contra código de verdade.

## Objetivo

1. Criar `app/src/core/RacerGame.ts`: classe abstrata com o "esqueleto" de `update()`/
   `render()` (padrão Template Method) e os campos de configuração/estado comuns a todas as
   versões.
2. Criar `app/src/core/TweakUI.ts`: a UI de ajuste (resolução, largura da pista, altura da
   câmera, distância de desenho, campo de visão, densidade de neblina — os controles já
   presentes desde a v1 original).

## Requisitos da implementação

### Campos de configuração/estado (vira campos protegidos/privados de `RacerGame`)

Portar as variáveis hoje declaradas soltas no `<script>` de cada `v*.html` (ver
`docs/02-v1-estrada-reta.md#21-variáveis-de-configuração-e-estado`): `fps`, `step`, `width`,
`height`, `roadWidth`, `segmentLength`, `rumbleLength`, `lanes`, `fieldOfView`,
`cameraHeight`, `cameraDepth`, `drawDistance`, `playerX`, `playerZ`, `fogDensity`,
`position`, `speed`, `maxSpeed`, `accel`, `breaking`, `decel`, `offRoadDecel`,
`offRoadLimit`, `resolution`.

### Pontos de extensão (métodos `protected`, sobrescritos pelas subclasses)

Implementar como métodos protegidos **com uma implementação-base sensata para v1** (não
métodos abstratos vazios — a v1 é o caso mais simples, então sua versão "default" vive na
própria `RacerGame` ou em `RacerGameV1`, a decidir durante a implementação):

- `protected buildRoad(): void` — monta `this.road` (instância de `Road`, RACER-TASK-08)
  chamando a receita daquela versão.
- `protected updateLateralForces(dt: number, playerSegment: Segment): void` — leitura de
  `keyLeft`/`keyRight` (base) + força centrífuga (v2+, ver
  `docs/03-v2-curvas.md#34-força-centrífuga-em-update`).
- `protected updateParallax(dt: number, playerSegment: Segment, startPosition: number): void`
  — no-op na base; offsets horizontais (v2+)/verticais (v3+, ver
  `docs/04-v3-colinas.md#47-render--o-que-de-fato-muda`).
- `protected updateExtras(dt: number): void` — no-op até v3; tráfego/colisão em v4
  (RACER-TASK-15).
- `protected getCameraY(playerY: number): number` — retorna `this.cameraHeight` na base; v3+
  retorna `playerY + this.cameraHeight`.
- `protected renderExtraLayer(...): void` — no-op até v4; segunda passada de sprites/carros
  em v4 (RACER-TASK-15, ver
  `docs/05-v4-final.md#56-renderização-em-duas-passadas-segmentos-depois-spritescarros`).
- `protected getPlayerScreenY(...): number` — retorna `this.height` na base; v3+ calcula a
  partir da altura do segmento do jogador (ver
  `docs/04-v3-colinas.md#47-render--o-que-de-fato-muda`, item 5).
- `protected getPlayerUpdown(...): number` — retorna `0` na base; v3+ retorna
  `playerSegment.p2.world.y - playerSegment.p1.world.y`.

> Estes nomes/assinaturas são um ponto de partida do plano (`docs/projeto/01-arquitetura-alvo.md`),
> não um contrato fechado — ajustar durante esta tarefa e a RACER-TASK-10 conforme necessário
> para o código real fazer sentido (ver `docs/projeto/04-riscos-decisoes-abertas.md`, item 7).
> Documentar qualquer desvio relevante no Log de Execução desta tarefa.

### Método `update(dt)` (final, não sobrescrito pelas subclasses)

Reproduz o corpo de `update()` documentado em
`docs/02-v1-estrada-reta.md#23-updatedt--a-lógica-do-carro`, delegando aos pontos de extensão
acima nos lugares certos: posição, `updateLateralForces`, aceleração/frenagem/fora-de-pista
(física comum, nunca sobrescrita), `updateParallax`, `updateExtras`.

### Método `render()` (final, não sobrescrito pelas subclasses)

Reproduz o corpo de `render()` documentado em
`docs/02-v1-estrada-reta.md#25-renderização-da-pista`: fundo (3 camadas), loop de segmentos
(projeção via `Util.project`, descarte por `cameraDepth`/`maxy`, chamando `getCameraY` para o
`cameraY` de cada projeção), `Renderer.player` (usando `getPlayerScreenY`/`getPlayerUpdown`),
e por fim `renderExtraLayer`.

### `reset(options)` e ciclo de vida

Portar `reset(options)` (ver
`docs/02-v1-estrada-reta.md#26-resetoptions-e-a-tweak-ui`) como método de `RacerGame`,
incluindo o cálculo de `cameraDepth`/`playerZ`/`resolution` e a chamada condicional a
`buildRoad()` (só quando necessário, mesma condição do original).

Adicionar um método público `async start(canvas: HTMLCanvasElement, assetNames: string[]):
Promise<void>` que: carrega assets (`AssetLoader`), chama `reset()`, monta `InputController`
com os bindings padrão (setas + WASD, ver
`docs/02-v1-estrada-reta.md#27-entrada-de-teclado`), e inicia o `GameLoop`.

### `TweakUI.ts`

Portar os handlers de `Dom.on('resolution'/'lanes'/'roadWidth'/'cameraHeight'/
'drawDistance'/'fieldOfView'/'fogDensity', 'change', ...)` e `refreshTweakUI()` (ver
`docs/02-v1-estrada-reta.md#26-resetoptions-e-a-tweak-ui`), recebendo uma referência ao
`RacerGame` (ou a um callback `reset(options)`) para acionar.

## Passos

1. Ler `docs/projeto/01-arquitetura-alvo.md` inteiro (é o contrato desta tarefa).
2. Reler `docs/02-v1-estrada-reta.md` (a versão mais simples, base do que vai virar
   `RacerGame`).
3. Implementar `core/RacerGame.ts` e `core/TweakUI.ts`.
4. `npm run typecheck` sem erros. **Nesta tarefa `RacerGame` ainda não é instanciável de forma
   útil sozinha** (não há receita de pista real nem página HTML ligada a ela) — a validação de
   ponta a ponta acontece na RACER-TASK-10.

## Critério de conclusão

- [x] `core/RacerGame.ts` com os campos de configuração/estado, os pontos de extensão
      listados, e `update()`/`render()`/`reset()`/`start()` finais (não sobrescritos)
- [x] `core/TweakUI.ts` com todos os controles da tweak UI original (exceto `lanes` avançado
      de v4, que é só um `<select>` a mais — pode já ser suportado aqui, já que existe desde
      v1 visualmente)
- [x] `npm run typecheck` sem erros
- [x] Nenhum arquivo fora de `app/` foi alterado
- [x] Qualquer desvio da lista de pontos de extensão proposta no plano está documentado no Log
      de Execução

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:** Criado `core/RacerGame.ts` (classe abstrata) com:
- 20 campos de configuração/estado (fps, step, width, height, roadWidth, segmentLength, rumbleLength,
  lanes, fieldOfView, cameraHeight, cameraDepth, drawDistance, playerX, playerZ, fogDensity,
  position, speed, maxSpeed, accel, breaking, decel, offRoadDecel, offRoadLimit, resolution).
- 4 flags de teclado (keyLeft, keyRight, keyFaster, keySlower).
- 8 pontos de extensão protegidos: `buildRoad`, `updateLateralForces`, `updateParallax`,
  `updateExtras`, `getCameraY`, `renderExtraLayer`, `getPlayerScreenY`, `getPlayerUpdown`.
- `update()` final reproduzindo lógica de v1 (posição, lateral, aceleração/frenagem, off-road).
- `render()` final reproduzindo loop de segmentos, projeção, descarte, fundo 3 camadas, player.
- `reset()` com cálculo de cameraDepth/playerZ/resolution/maxSpeed/accel/breaking/decel/offRoadDecel/
  offRoadLimit e chamada condicional a `buildRoad()`.
- `start()` async carrega assets, inicializa Renderer/StatsPanel, monta InputController com
  bindings padrão (setas + WASD), inicia GameLoop.
- `onReset()` hook para subclasses reagirem a reset (ex: parallax em v2+).

Criado `core/TweakUI.ts` com:
- Construtor recebe callback `resetFn`.
- `bind()` registra listeners para resolution, lanes, roadWidth, cameraHeight, drawDistance,
  fieldOfView, fogDensity (idênticos ao v1.straight.html).
- `refresh()` atualiza valores nos controles DOM (lanes selectedIndex, range inputs e spans).
- Métodos privados `bindRange` e `setRange` para evitar duplicação.

**Desvios do plano:**
- `Renderer.ctx` era privado; tornado público para `RacerGame.render()` poder chamar
  `clearRect` (necessário para limpar o canvas antes de desenhar cada frame).
- `StatsPanel` recebe `'fps'` como parentId em vez de nenhum argumento (conforme original v1).

**Problemas encontrados:** Nenhum.

**Arquivos criados/modificados:**
- `app/src/core/RacerGame.ts` (criado)
- `app/src/core/TweakUI.ts` (criado)
- `app/src/core/Renderer.ts` (ctx tornado público)
