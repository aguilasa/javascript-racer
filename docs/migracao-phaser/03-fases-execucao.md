# 03 — Fases de Execução

Cada fase é pequena o bastante para virar uma tarefa isolada depois, e (com exceção da Fase 1)
produz um jogo executável, mesmo que incompleto — permitindo validar visualmente cada incremento
em `npm run dev` antes de seguir para a próxima fase.

## Fase 1 — Assets e boot

- Copiar `sprites.png`/`background.png`/música para `racer-phaser/public/assets/racer/`
  (ver [02-estrutura-projeto.md](02-estrutura-projeto.md#assets)).
- Portar `constants.ts`/`sprites.ts`/`background.ts`/`types.ts`/`util.ts` verbatim para
  `racer-phaser/src/game/racer/`.
- Adaptar `Preloader` para carregar os três assets e registrar os frames nomeados de `sprites`
  a partir da tabela `SPRITES` (ver [01-arquitetura-alvo.md](01-arquitetura-alvo.md#pipeline-de-sprites-uma-textura-uma-folha-frames-nomeados)).
- **Critério de saída**: `Preloader` completa sem erro, `MainMenu` aparece.

## Fase 2 — Pista estática

- Portar `Road.ts` verbatim.
- Implementar `RoadRenderer` com o método que desenha os trapézios de um segmento via `Graphics`
  (equivalente a `Renderer.segment()`), sem ainda mover a câmera.
- Na `Game` scene, montar uma `Road` fixa (a mesma receita de `RacerGameV4.buildRoad`, ver
  [01-arquitetura-alvo.md](01-arquitetura-alvo.md)) e desenhar os primeiros N segmentos parados.
- **Critério de saída**: a pista aparece na tela, com a perspectiva correta, parada (sem input
  ainda). Bom momento para medir o custo de redesenhar `Graphics` a cada frame (ver
  [04-riscos-decisoes.md](04-riscos-decisoes.md)).

## Fase 3 — Câmera e player

- Implementar `RacerEngine` com o `update()`/`render()` fundidos de `RacerGame`+`RacerGameV4`
  (posição, velocidade, `playerX`, projeção por segmento).
- Ligar `this.input.keyboard.addKeys(...)` na `Game` scene (setas + WASD, mesmo mapeamento de
  `KEY`).
- Sprite do jogador como uma `Image` do pool, trocando de frame conforme esterço/subida (mesma
  lógica de `Renderer.player()`).
- **Critério de saída**: dirigível — acelera, freia, esterça, a pista rola sob a câmera.

## Fase 4 — Parallax e fundo

- Camadas de céu/morros/árvores como `TileSprite` (ver
  [01-arquitetura-alvo.md](01-arquitetura-alvo.md#parallax-de-fundo-tilesprite)), atualizadas a
  partir de `skyOffset`/`hillOffset`/`treeOffset`.
- **Critério de saída**: fundo com parallax reagindo a curvas, igual à v4-final.

## Fase 5 — Cenário e colisão fora-de-pista

- Portar `scenery.ts` verbatim; popular `road.segments[n].sprites` na construção da pista.
- Pool de `Image` para sprites de cenário, com recorte pelo horizonte (`setCrop`, ver
  [01-arquitetura-alvo.md](01-arquitetura-alvo.md#recorte-pelo-horizonte-clipy)).
- Colisão jogador↔sprite quando fora da pista (`|playerX| > 1`), portada de
  `RacerGameV4.updateExtras`.
- **Critério de saída**: árvores/placas/pedras aparecem ao longo da pista; sair da pista e bater
  numa delas reduz a velocidade e reposiciona o jogador, como hoje.

## Fase 6 — Tráfego

- Portar `Car.ts`/`TrafficManager.ts` verbatim; `resetCars()` na construção da pista.
- Pool de `Image` para os 200 carros; reordenação por `setDepth` a cada frame (algoritmo do
  pintor, ver [01-arquitetura-alvo.md](01-arquitetura-alvo.md#ordem-de-desenho-algoritmo-do-pintor)).
- Colisão jogador↔carro, portada de `RacerGameV4.updateExtras`.
- **Critério de saída**: 200 carros com a mesma IA de desvio da v4-final, colisão funcionando.

## Fase 7 — HUD e tempos de volta

- `Hud.ts` novo, com `Phaser.GameObjects.Text` para velocímetro/tempo atual/última volta/recorde,
  preservando `formatTime`/`setIfChanged`/persistência em `localStorage` (`fast_lap_time`).
- Lógica de cruzamento de linha de chegada portada de `RacerGameV4.updateExtras`.
- **Critério de saída**: HUD atualiza em tempo real; recorde persiste entre recarregamentos.

## Fase 8 — Áudio e fluxo de cenas

- Música em loop + mute via `this.sound`, com preferência persistida em `localStorage` (mesma
  chave `muted` usada hoje).
- Conferir a transição `MainMenu` → `Game` (e, se fizer sentido, `Game` → `GameOver` em algum
  evento do jogo — decisão de baixo risco, ver [02-estrutura-projeto.md](02-estrutura-projeto.md)).
- **Critério de saída**: fluxo completo jogável do menu à corrida, com música.

## Fase 9 — Polimento

- Medir e ajustar performance do pool de sprites/carros com cenário denso + 200 carros
  simultaneamente visíveis.
- Comparação lado a lado com `v4.final.html`/`RacerGameV4` para paridade visual (cores, timing de
  neblina, proporção de sprites).
- **Critério de saída**: critérios de sucesso de [00-visao-geral.md](00-visao-geral.md) atendidos.

## Próximo passo

[04 — Riscos e Decisões](04-riscos-decisoes.md) reúne os pontos que ainda precisam de validação
ou decisão do usuário antes/durante essas fases.
