# 01 — Arquitetura Alvo

## Princípio geral: classe onde há estado e comportamento, módulo de funções onde há só matemática/utilidade

O pedido é para "ter classes e códigos comuns onde for possível" — isso **não** significa forçar
tudo em classes. O próprio código original já distingue dois tipos de coisa dentro de
`common.js` (ver [`docs/06-arquitetura-common-js.md`](../06-arquitetura-common-js.md)):

- **Coleções de funções puras/estáticas**, sem estado próprio: `Dom`, `Util`, os métodos de
  desenho de `Render`. Em TypeScript idiomático, isso vira **módulos com funções exportadas**
  (`dom.ts`, `util.ts`, `render.ts`), não classes com métodos estáticos — é mais simples de
  importar seletivamente e testar.
- **Coisas com estado e ciclo de vida**: o loop do jogo, a pista (array de segmentos + geometria
  acumulada), o teclado, os carros de tráfego, o HUD, o player de música. Isso vira **classes**.

## Mapa: de `common.js`/`v*.html` para módulos/classes TypeScript

| Hoje (`common.js` / `v*.html`) | Vira (projeto Vite) | Tipo |
|---|---|---|
| `Dom.*` | `core/dom.ts` | funções |
| `Util.*` (math/easing/`project`/`overlap`) | `core/util.ts` | funções puras |
| `KEY`, `COLORS` | `core/constants.ts` | `const`/`enum` tipados |
| `images/sprites.js` (`SPRITES`) | `core/sprites.ts` | `const` tipado (`Record<string, SpriteRect>`) |
| `images/background.js` (`BACKGROUND`) | `core/background.ts` | `const` tipado |
| `Game.run` (loop de passo fixo) | `core/GameLoop.ts` | **classe** `GameLoop` |
| `Game.loadImages` | `core/AssetLoader.ts` | **classe** `AssetLoader` |
| `Game.setKeyListener` + flags `keyLeft/keyRight/...` | `core/InputController.ts` | **classe** `InputController` |
| `Game.stats` (wrapper do mr.doob `Stats`) | `core/StatsPanel.ts` | **classe** fina em torno do pacote `stats.js` |
| `Game.playMusic` + botão de mute | `core/MusicPlayer.ts` | **classe** `MusicPlayer` |
| `Render.*` (segment/background/sprite/player/fog) | `core/Renderer.ts` | **classe** `Renderer` (recebe o `ctx` uma vez, expõe métodos) |
| `segments[]`, `addSegment`, `addRoad`, `addStraight`, `addCurve`, `addHill`, `addSCurves`, `addLowRollingHills`, `addBumps`, `addDownhillToEnd`, `findSegment`, `lastY` | `core/Road.ts` | **classe** `Road` |
| `cars[]`, `resetCars`, `updateCars`, `updateCarOffset` (só v4) | `versions/v4-final/TrafficManager.ts` + `Car.ts` | **classes** |
| `resetSprites` (só v4) | `versions/v4-final/scenery.ts` | função (gera dados, sem estado próprio) |
| HUD (`hud`, `updateHud`, `formatTime`, lap timing) (só v4) | `versions/v4-final/Hud.ts` | **classe** `Hud` |
| tweak UI (`reset(options)`, `refreshTweakUI`, listeners de `<select>`/`<input>`) | `core/TweakUI.ts` | **classe** `TweakUI` |
| variáveis de configuração/estado de cada `v*.html` (`fps`, `roadWidth`, `speed`, `playerX`, …) | campos de instância de `RacerGame` (ver abaixo) | — |
| `update()`/`render()`/`reset()` de cada `v*.html` | métodos de `RacerGame` e suas subclasses | **classes** |

## O motor compartilhado: uma cadeia de herança que espelha v1→v2→v3→v4

Os capítulos [02](../02-v1-estrada-reta.md)–[05](../05-v4-final.md) já documentam, linha a linha,
que cada versão é um **superconjunto estrito** da anterior — v2 nunca remove algo de v1, só
adiciona `curve`; v3 só adiciona `y`; v4 só adiciona tráfego/sprites/HUD/colisão. Essa é
literalmente a definição de uma cadeia de herança bem comportada, então a arquitetura recomendada
é:

```
RacerGame                 (abstrata: loop, projeção, física longitudinal, tweak UI comuns)
└── RacerGameV1            (pista reta e plana — v1.straight.html)
    └── RacerGameV2         (+ curve, força centrífuga, parallax horizontal — v2.curves.html)
        └── RacerGameV3      (+ altura y, câmera relativa ao terreno, parallax vertical — v3.hills.html)
            └── RacerGameV4   (+ tráfego, sprites de cenário, colisão, HUD — v4.final.html)
```

Cada subclasse só sobrescreve os **pontos de extensão** (métodos protegidos) onde a versão
correspondente realmente diverge, chamando `super.metodo()` para reaproveitar o que já existe.
Pontos de extensão previstos (a granularidade exata é refinada durante as Fases 2–3, ver
[03](03-fases-execucao.md), mas a intenção é):

- `protected buildRoad(): void` — monta `this.road` chamando a "receita" daquela versão
  (`addStraight`/`addCurve`/`addHill`/`addSCurves`/`addBumps`/…, ver
  [`Road`](#a-classe-road-a-dsl-de-construção-de-pista-compartilhada) abaixo). v1 usa a receita
  mais simples; v4 usa a mais longa e variada (já documentada em
  [05 §5.10](../05-v4-final.md#510-o-traçado-do-circuito-final)).
- `protected updateLateralForces(dt, playerSegment): void` — em `RacerGame`/v1 é só a leitura de
  `keyLeft`/`keyRight`; `RacerGameV2` sobrescreve para adicionar a força centrífuga (ver
  [03-v2-curvas §3.4](../03-v2-curvas.md#34-força-centrífuga-em-update)).
- `protected updateParallax(dt, playerSegment, startPosition): void` — no-op em v1; v2 adiciona
  deslocamento horizontal; v3 adiciona também o vertical (`playerY`).
- `protected updateExtras(dt): void` — no-op até v3; v4 sobrescreve para chamar
  `TrafficManager.updateCars(...)` e a lógica de colisão contra carros/sprites.
- `protected getCameraY(playerY: number): number` — v1/v2 retornam `this.cameraHeight` fixo; v3/v4
  retornam `playerY + this.cameraHeight` (ver
  [04-v3-colinas §4.7](../04-v3-colinas.md#47-render--o-que-de-fato-muda)).
- `protected renderExtraLayer(baseSegment, playerSegment, ...): void` — no-op até v4; `RacerGameV4`
  sobrescreve para desenhar a segunda passada (sprites/carros, ver
  [05-v4-final §5.6](../05-v4-final.md#56-renderização-em-duas-passadas-segmentos-depois-spritescarros)).
- `protected getPlayerScreenY(...)`, `protected getPlayerUpdown(...)` — v1/v2 fixam
  `height`/`0`; v3/v4 calculam a partir da altura do segmento do jogador.

O método `update(dt)` e `render()` **em si** (o "esqueleto" do algoritmo) vivem só em `RacerGame` e
não são reescritos pelas subclasses — só os pontos acima. Isso é o padrão **Template Method**
aplicado de forma direta, e evita duplicar o corpo inteiro de `update`/`render` quatro vezes (que é
exatamente o que aconteceria se cada versão fosse portada como um arquivo TS isolado e
copiado/colado).

> Alternativa considerada e descartada por ora: um único `RacerGame` não-abstrato configurado por
> *flags* (`{ hasCurves: true, hasHills: true, hasTraffic: false }`) em vez de herança. Foi
> descartada porque o próprio código-fonte já é incremental por natureza (nunca há um recurso que
> algumas versões têm e versões *posteriores* não têm), então a herança modela o domínio real sem
> esforço extra — mas é uma decisão revisável, registrada em
> [04](04-riscos-decisoes-abertas.md).

## A classe `Road`: a DSL de construção de pista, compartilhada

`Road` concentra tudo que hoje está espalhado em cada `v*.html` como funções soltas
(`addSegment`, `addRoad`, `addStraight`, `addCurve`, `addHill`, `addSCurves`,
`addLowRollingHills`, `addBumps`, `addDownhillToEnd`, `findSegment`, `lastY`) — ver
[03-v2-curvas](../03-v2-curvas.md) e [04-v3-colinas](../04-v3-colinas.md) para a implementação
original de cada uma. Como essas funções já formam uma DSL genérica (a v4 usa exatamente a mesma
DSL que a v2/v3, só com uma "receita" — a sequência de chamadas em `resetRoad()` — mais longa), a
classe `Road` implementa a DSL **completa** desde o início, e cada versão só fornece sua receita:

```ts
class Road {
  segments: Segment[] = [];
  trackLength = 0;

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
  private lastY(): number { /* ... */ }
}
```

**Decisão intencional**: mesmo a v1 (cuja versão original constrói a pista com um `for` cru de 500
segmentos, sem usar `addRoad`) vai construir sua pista através dessa mesma DSL compartilhada (por
exemplo, `road.addStraight(250)` repetido, ou uma única chamada equivalente) — isso diverge
levemente do código-fonte v1 linha-a-linha, mas maximiza o código compartilhado, que é
explicitamente o pedido. Isso é seguro porque `addStraight` com `curve=0`/`y=0` produz uma pista
reta e plana idêntica à da v1 original.

## Tipos centrais (`core/types.ts`)

```ts
export interface Vector3 { x: number; y: number; z: number }

export interface SegmentPoint {
  world:  { x?: number; y: number; z: number };
  camera: { x: number; y: number; z: number };
  screen: { x: number; y: number; w: number; scale: number };
}

export type SegmentColor = typeof COLORS[keyof typeof COLORS];

export interface SpriteRect { x: number; y: number; w: number; h: number }
export interface SpriteSlot  { source: SpriteRect; offset: number }

export interface Segment {
  index: number;
  p1: SegmentPoint;
  p2: SegmentPoint;
  curve: number;
  color: SegmentColor;
  sprites: SpriteSlot[];
  cars: Car[];
  looped?: boolean;
  fog?: number;
  clip?: number;
}
```

`Car` (só relevante a partir da v4) vira sua própria classe em
`versions/v4-final/Car.ts`, com `offset`, `z`, `sprite`, `speed`, `percent` como campos, e nenhum
método complexo (a lógica de IA fica na classe `TrafficManager`, que opera sobre uma lista de
`Car`, para casar com a estrutura de dados dupla já documentada em
[05-v4-final §5.3](../05-v4-final.md#53-carros-de-tráfego-dados-e-criação)).

## Onde cada versão diverge de fato (resumo, já detalhado nos docs de arquitetura)

| Aspecto | v1 | v2 | v3 | v4 |
|---|---|---|---|---|
| `curve` nos segmentos | não | sim | sim | sim |
| `y` (altura) nos segmentos | não | não | sim | sim |
| Força centrífuga | não | sim | sim | sim |
| Parallax do fundo | não | horizontal | horizontal + vertical | horizontal + vertical |
| Câmera relativa ao terreno | não (`cameraHeight` fixo) | não | sim (`playerY + cameraHeight`) | sim |
| Back-face culling | não | não | sim | sim |
| Sprites de cenário / tráfego | não | não | não | sim |
| Colisão | fora-de-pista só desacelera | idem | idem | + sprites + carros |
| HUD / tempos de volta | não | não | não | sim |
| Faixas (`lanes`) configuráveis na tweak UI | sim (visual) | sim | sim | sim |

Esta tabela é a mesma já usada implicitamente nos capítulos 02–05 de `docs/`; ela guia exatamente
o que cada subclasse de `RacerGame` precisa sobrescrever.

## Próximo passo

[02 — Estrutura do Projeto Vite](02-estrutura-vite.md) descreve onde esses módulos/classes moram
fisicamente no novo projeto, e como as 4 páginas HTML (uma por versão) são configuradas no Vite.
