# 01 — Arquitetura Alvo

## Princípio geral: preservar a matemática, trocar a camada de I/O

A v4-final em TypeScript (`app/src/core` + `app/src/versions/v4-final`) já separa bem duas coisas
(ver [`docs/projeto/01-arquitetura-alvo.md`](../projeto/01-arquitetura-alvo.md) para o raciocínio
original dessa separação):

- **Matemática/regras de jogo, sem estado de canvas/DOM**: `util.ts` (projeção, easing, colisão),
  `types.ts`, `constants.ts`, `Road.ts` (a DSL de construção de pista), `Car.ts`, `TrafficManager.ts`
  (IA de tráfego), `scenery.ts` (povoamento de sprites). Nada disso depende de
  `CanvasRenderingContext2D`, `HTMLImageElement` ou do DOM — são apenas dados e funções puras.
- **Camada de I/O**: `Renderer.ts` (desenha em canvas), `GameLoop.ts` (acumulador de passo fixo +
  `requestAnimationFrame`), `AssetLoader.ts` (`<img>` manual), `InputController.ts` (`keydown`/
  `keyup` globais), `MusicPlayer.ts` (`<audio>`), `StatsPanel.ts` (wrapper de `stats.js`),
  `TweakUI.ts` (`<select>`/`<input>` HTML), `Hud.ts` (manipula `innerHTML` de `<span>`).

A migração para Phaser **copia a primeira categoria quase verbatim** e **reescreve a segunda**
para usar as APIs nativas do framework. Isso é o mesmo princípio que já guiou a primeira migração
(JS embutido → TypeScript) — só que agora a "camada de I/O" de destino é o Phaser, não o
`common.js` original.

## Tabela de mapeamento completa

| Hoje (`app/src/core`, `app/src/versions/v4-final`) | Vira em `racer-phaser/src/game/racer/` | Tratamento |
|---|---|---|
| `core/util.ts` (`project`, `overlap`, `accelerate`, `increase`, `interpolate`, `easeIn/Out/InOut`, `exponentialFog`, `percentRemaining`, `toInt`/`toFloat`, `randomInt`/`randomChoice`) | `util.ts` | **Copiado quase verbatim** — matemática pura, nenhuma dependência de canvas/DOM. |
| `core/types.ts` (`Segment`, `SegmentPoint`, `SpriteRect`, `SpriteSlot`, ...) | `types.ts` | **Verbatim.** |
| `core/constants.ts` (`KEY`, `COLORS`) | `constants.ts` | **Verbatim** — `KEY` (códigos de tecla) só é referenciado indiretamente agora (ver `InputController` na tabela abaixo), mas os nomes continuam úteis para legibilidade. |
| `core/sprites.ts` (`SPRITES`, coordenadas de recorte + `SCALE`) | `sprites.ts` | **Verbatim nos números** — as coordenadas `{x, y, w, h}` viram frames nomeados de uma textura Phaser (ver [Pipeline de sprites](#pipeline-de-sprites-uma-textura-uma-folha-frames-nomeados) abaixo), sem reempacotar os PNGs de origem. |
| `core/background.ts` (`BACKGROUND.SKY/HILLS/TREES`) | `background.ts` | **Verbatim nos números** — mesma observação; usado para registrar os frames das camadas de parallax. |
| `core/Road.ts` (`Road`, DSL `addSegment`/`addRoad`/`addStraight`/`addCurve`/`addHill`/`addSCurves`/`addLowRollingHills`/`addBumps`/`addDownhillToEnd`/`findSegment`/`markStartFinish`) | `Road.ts` | **Verbatim** — não tem estado de canvas, só constrói o array `segments`. |
| `versions/v4-final/Car.ts` | `Car.ts` | **Verbatim.** |
| `versions/v4-final/TrafficManager.ts` (`resetCars`, `updateCars`, `updateCarOffset` — a IA de desvio) | `TrafficManager.ts` | **Verbatim** — a IA reativa (lookahead de 20 segmentos, ver [`docs/05-v4-final.md §5.4`](../05-v4-final.md#54-movimentação-e-ia-simples-dos-carros-updatecarsupdatecaroffset)) não depende de como os carros são desenhados. |
| `versions/v4-final/scenery.ts` (`resetSprites`) | `scenery.ts` | **Verbatim** — só popula `segment.sprites`, não desenha nada. |
| `core/Renderer.ts` (`polygon`/`segment`/`background`/`sprite`/`player`/`fog`, tudo via `ctx.fillRect`/`drawImage`) | `RoadRenderer.ts` (**nova classe**) | **Reescrito.** Ver [Renderização](#renderização-graphics--pool-de-image) abaixo — a matemática de projeção que alimenta essas chamadas (em `RacerGame.render()`) não muda, só o destino final das coordenadas calculadas. |
| `core/GameLoop.ts` (acumulador `gdt` + `requestAnimationFrame`) | método `update(time, delta)` da `Game` scene | **Preservado como padrão, movido de lugar** — ver [Passo fixo dentro do Scene.update](#passo-fixo-dentro-do-scene-update). |
| `core/AssetLoader.ts` (`<img>` + contador manual) | `Preloader` scene (`this.load.image`/`this.load.spritesheet`/`this.load.audio`) | **Substituído** pelo loader nativo do Phaser (já tem barra de progresso pronta no template, ver `racer-phaser/src/game/scenes/Preloader.ts`). |
| `core/InputController.ts` (`keydown`/`keyup` globais + flags `keyLeft`/`keyRight`/`keyFaster`/`keySlower`) | `this.input.keyboard.addKeys(...)` na `Game` scene | **Substituído** — Phaser já expõe `.isDown` por tecla; as mesmas quatro flags podem continuar existindo como getters finos sobre os objetos `Key` do Phaser, para manter `RacerEngine.update()` inalterado. |
| `core/MusicPlayer.ts` (`<audio>` + `Dom.storage`) | `this.sound` (Phaser Sound Manager) na `Game` scene | **Substituído** — `localStorage` para a preferência de mudo continua igual (não é algo que o Phaser substitui). |
| `core/StatsPanel.ts` (wrapper de `stats.js`) | `this.game.loop.actualFps` (+ `Phaser.GameObjects.Text` opcional de debug) | **Substituído** — remove a dependência externa `stats.js`; o próprio `Phaser.Game` já mede FPS internamente. |
| `core/TweakUI.ts` (`<select>`/`<input>` HTML + `reset(options)`) | — | **Fora do escopo inicial**, ver [`04-riscos-decisoes.md`](04-riscos-decisoes.md). |
| `versions/v4-final/Hud.ts` (`Dom.set`/`Dom.addClassName` em `<span>`) | `Hud.ts` (**nova classe**) | **Reescrito** para usar `Phaser.GameObjects.Text` dentro da própria `Game` scene, preservando a mesma lógica de "só tocar o valor se mudou" (`setIfChanged`) e o mesmo formato de tempo (`formatTime`) e persistência (`localStorage.fast_lap_time`). |
| `core/RacerGame.ts` (template method: `update`/`render`/`reset` finais + pontos de extensão) + `versions/v4-final/RacerGameV4.ts` (única subclasse folha usada) | `RacerEngine.ts` (**nova classe, não-Phaser**) | **Fundidos em uma única classe** — ver [Por que uma única `RacerEngine`](#por-que-uma-única-racerengine-em-vez-de-manter-a-cadeia-de-herança) abaixo. |

## Por que uma única `RacerEngine` (em vez de manter a cadeia de herança)

A migração TypeScript modelou v1→v2→v3→v4 como uma cadeia de herança (`RacerGame` abstrata →
`RacerGameV1` → ... → `RacerGameV4`) porque cada versão é um superconjunto estrito da anterior —
isso faz sentido quando as quatro versões coexistem como páginas separadas. Como esta migração só
recria a v4-final, não há motivo para preservar a cadeia inteira: `RacerEngine` funde
`RacerGame` + `RacerGameV4` em uma única classe concreta, com os métodos que hoje são pontos de
extensão (`buildRoad`, `updateLateralForces`, `updateParallax`, `updateExtras`, `getCameraY`,
`renderExtraLayer`, `getPlayerScreenY`, `getPlayerUpdown`, `updateTraffic`) simplesmente
implementados diretamente (equivalente a "já aplicar a última sobrescrita de cada um").

`RacerEngine` continua **sem depender do Phaser** — recebe/expõe dados (posição, velocidade,
lista de segmentos visíveis, lista de sprites/carros a desenhar com suas coordenadas de tela já
projetadas) e é chamada pelos hooks de ciclo de vida da `Game` scene (`create()` chama o
equivalente de `reset()`; `update(time, delta)` chama o `update()`/`render()` do engine). Isso
espelha a separação que `RacerGame` já tem hoje entre física/estado e desenho — só que agora quem
desenha de fato é `RoadRenderer` (Phaser), não `Renderer` (canvas 2D).

## Renderização: `Graphics` + pool de `Image`

`Renderer.segment()` hoje desenha cada segmento da pista como três/quatro polígonos preenchidos
(`ctx.fillRect` para a grama, `ctx.fill()` de um `Path2D` para acostamento/pista/faixas — ver
[`docs/06-arquitetura-common-js.md §6.5`](../06-arquitetura-common-js.md#65-render--desenho-no-canvas)).
O equivalente Phaser idiomático é `Phaser.GameObjects.Graphics`: a cada frame, `RoadRenderer.clear()`
e redesenha os mesmos trapézios com `fillPoints()`/`fillRect()` — a matemática de projeção que
calcula `x1,y1,w1,x2,y2,w2` (em `RacerEngine.render()`, portada de `RacerGame.render()`) não muda
em nada; só troca `ctx.fill()` por `graphics.fillPoints(...)`.

Sprites de cenário, carros de tráfego e o carro do jogador **não** são desenhados como parte do
`Graphics` — viram um **pool de `Phaser.GameObjects.Image`** (objetos criados uma única vez e
reaproveitados, nunca recriados por frame — ver a nota de performance em
[`04-riscos-decisoes.md`](04-riscos-decisoes.md)). A cada frame, `RoadRenderer` percorre os
segmentos visíveis (mesma janela de `drawDistance` que hoje), calcula a posição de tela de cada
sprite/carro (mesma matemática de `RacerGameV4.renderExtraLayer`) e:
1. pega uma `Image` livre do pool (ou reaproveita a que já representava aquele carro/sprite),
2. define `setPosition(x, y)`, `setScale(...)` (a partir do `scale` de projeção) e `setTexture(...,
   frame)` (o frame nomeado correspondente ao `sprite.source`/`car.sprite`),
3. define `setDepth(...)` para reproduzir o algoritmo do pintor (objetos mais distantes ficam
   atrás — ver abaixo),
4. devolve ao pool (`setVisible(false)`) os objetos que não são mais necessários neste frame.

### Ordem de desenho (algoritmo do pintor)

Hoje, `RacerGameV4.renderExtraLayer` já ordena sprites+carros por profundidade
(`sort((a, b) => b.segment.p1.camera.z - a.segment.p1.camera.z)`) antes de desenhar. No Phaser,
como os game objects não são redesenhados em ordem de inserção quando a profundidade muda
dinamicamente quadro a quadro, `RoadRenderer` precisa chamar `setDepth(camera.z invertido)` em
cada `Image` reposicionada — o Phaser cuida de renderizar na ordem de `depth` automaticamente, sem
precisar reordenar um array manualmente a cada frame.

### Recorte pelo horizonte (`clipY`)

`Render.sprite()` hoje recorta a parte do sprite que ultrapassaria a linha do horizonte
(`segment.clip`, ver [`docs/05-v4-final.md §5.6`](../05-v4-final.md#56-renderização-em-duas-passadas-segmentos-depois-spritescarros)),
usando um segundo `drawImage` com região de origem/destino reduzidas. `Phaser.GameObjects.Image`
não tem um "recorte por Y" direto — a forma equivalente é usar `setCrop(x, y, width, height)` no
game object antes de exibi-lo, recalculando a altura visível da mesma forma que `clipH` é
calculado hoje.

## Pipeline de sprites: uma textura, uma folha, frames nomeados

`sprites.png`/`background.png` continuam sendo usadas como estão — **não é necessário rodar
`rake resprite` de novo nem tocar nos PNGs de origem**. No `Preloader`, depois de
`this.load.image('sprites', '.../sprites.png')`, cada entrada de `SPRITES`/`BACKGROUND` (já
portada verbatim, ver tabela acima) vira um frame nomeado da mesma textura:

```ts
const texture = this.textures.get('sprites')
for (const [name, rect] of Object.entries(SPRITES)) {
  if (typeof rect === 'object') // pula SPRITES.SCALE, SPRITES.CARS, etc.
    texture.add(name, 0, rect.x, rect.y, rect.w, rect.h)
}
```

Isso permite `this.add.image(x, y, 'sprites', 'PALM_TREE')` em vez de recortar manualmente com
`drawImage` — o Phaser já sabe onde cada sprite está dentro da folha única, usando exatamente as
mesmas coordenadas que `Render.sprite()` usa hoje.

## Parallax de fundo: `TileSprite`

`Renderer.background()` hoje faz um blit manual com wraparound (a imagem de fundo tem o dobro da
largura da tela, e a função escolhe qual fatia recortar com base no offset de rotação — ver
[`docs/06-arquitetura-common-js.md`](../06-arquitetura-common-js.md#renderbackground)). O
equivalente idiomático no Phaser é `Phaser.GameObjects.TileSprite`, uma camada por parallax
(céu/morros/árvores): em vez de recalcular a fatia de origem a cada frame, basta atualizar
`tileSprite.tilePositionX`/`tilePositionY` proporcionalmente a `skyOffset`/`hillOffset`/
`treeOffset` (os mesmos três acumuladores que `RacerEngine.updateParallax` já calcula, portados
verbatim) — o `TileSprite` cuida do scroll contínuo/sem costura internamente, sem a lógica de
"duas chamadas de `drawImage`" que o blit manual precisa hoje.

## Passo fixo dentro do `Scene.update`

O coração de `GameLoop.start()` — o acumulador `gdt` que garante que `update(step)` rode em
incrementos fixos de `1/60s` independentemente da taxa real de frames (ver
[`docs/06-arquitetura-common-js.md §6.4`](../06-arquitetura-common-js.md#gamerun)) — **continua
necessário** dentro do Phaser: `Scene.update(time, delta)` é chamado uma vez por `requestAnimationFrame`,
mas `delta` (em ms, desde o frame anterior) não é um passo fixo. `RacerEngine` mantém seu próprio
acumulador interno, alimentado por `delta/1000` a cada chamada de `update()` da scene — a mesma
proteção contra "tabs em background" (`Math.min(1, dt)`) se aplica.

## Próximo passo

[02 — Estrutura do Projeto](02-estrutura-projeto.md) mostra onde esses módulos/classes moram
fisicamente dentro de `racer-phaser/src/`, e como os assets são organizados.
