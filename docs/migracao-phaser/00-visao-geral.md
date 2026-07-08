# 00 — Visão Geral

## Objetivo

Ter a v4-final do jogo — hoje `app/src/versions/v4-final` + `app/src/core` (TypeScript puro,
Canvas 2D, sem framework) — rodando dentro do scaffold Phaser 4 + Vite já clonado em
[`racer-phaser/`](../../racer-phaser), usando os sistemas nativos do Phaser (loader de assets,
input de teclado, gerenciador de áudio, cenas, game objects) no lugar dos equivalentes caseiros de
`common.js`/`core/` (`AssetLoader`, `InputController`, `MusicPlayer`, `GameLoop`, `Renderer`).

A matemática e as regras de jogo (projeção pseudo-3D, geometria da pista, física do jogador, IA de
tráfego, colisão, cronometragem de volta) **não mudam** — só a camada que hoje fala diretamente
com `<canvas>`/DOM/`<audio>` é substituída pelas APIs do Phaser.

## Não-objetivos

- **Não** portar v1, v2 ou v3 — só a v4-final (jogo único e completo). `app/` continua com as
  quatro versões incrementais, intocado.
- **Não** introduzir um motor de física (`Phaser.Physics.Arcade`/`Matter`) — as regras de
  movimento e colisão do jogo (aceleração escalar, sobreposição 1D via `Util.overlap`, "esterço"
  de tráfego) são simulação manual, não corpos rígidos, e continuam sendo calculadas à mão como
  hoje em `RacerGameV4.update`.
- **Não** é objetivo desta fase: multiplayer, controles touch/mobile, editor de pistas, novos
  modos de jogo. Essas ideias já estão listadas, sem detalhamento técnico, em
  [`docs/projeto/05-ideias-expansao.md`](../projeto/05-ideias-expansao.md) — podem ser retomadas
  depois que a paridade funcional com a v4-final estiver estabelecida.
- **Não** remover ou modificar nada em `app/` — o port TypeScript sem framework continua existindo
  como implementação irmã e referência de comportamento correto durante a migração.

## Critérios de sucesso

A migração é considerada completa quando `racer-phaser/` reproduz, com paridade funcional em
relação a `RacerGameV4`/`v4.final.html`:

- Pista pseudo-3D com curvas, morros, neblina e o mesmo traçado de circuito (retas, S-curves,
  ondulações — ver [`docs/05-v4-final.md §5.10`](../05-v4-final.md#510-o-traçado-do-circuito-final)).
- Parallax de fundo (céu/morros/árvores) reagindo à curvatura da pista.
- Física do jogador: aceleração/frenagem, força centrífuga em curvas, penalidade por sair da pista.
- 200 carros de tráfego com a mesma IA reativa de desvio (lookahead de 20 segmentos,
  ver [`docs/05-v4-final.md §5.4`](../05-v4-final.md#54-movimentação-e-ia-simples-dos-carros-updatecarsupdatecaroffset)).
- Sprites de cenário (árvores, placas, pedras) povoando a pista com a mesma distribuição.
- Colisão jogador↔carro e jogador↔sprite-de-cenário-fora-da-pista.
- HUD com velocímetro, tempo da volta atual, última volta, e recorde persistido entre sessões.
- Música em loop com botão de mute persistido.
- Roda com desempenho estável (fps) com os 200 carros + cenário denso visíveis simultaneamente.

A **tweak UI** (painel de ajuste fino de resolução/faixas/largura da pista/altura de câmera/
distância de desenho/campo de visão/neblina) fica fora do critério de sucesso inicial — ver
[`04-riscos-decisoes.md`](04-riscos-decisoes.md) para o motivo e o plano de retomada futura.

## Próximo passo

[01 — Arquitetura Alvo](01-arquitetura-alvo.md) detalha, arquivo por arquivo, o que cada peça de
`app/src/core`/`app/src/versions/v4-final` vira dentro de `racer-phaser/`.
