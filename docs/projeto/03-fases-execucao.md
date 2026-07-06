# 03 — Fases de Execução

Cada fase abaixo é desenhada para ser **uma tarefa isolada** (uma conversa/PR por fase). A ordem
importa — cada fase só começa depois que a anterior está jogável e validada por comparação com o
original. Nenhuma fase avança sem que a anterior passe no seu "critério de pronto".

Tamanho é uma estimativa qualitativa (P = pequeno, M = médio, G = grande) para ajudar a priorizar,
não uma estimativa de tempo.

---

## Fase 0 — Scaffolding do projeto Vite

**Tamanho:** P

- Rodar `npm create vite@latest app -- --template vanilla-ts` na raiz do repo.
- Ajustar `tsconfig.json` (`strict`, `noUncheckedIndexedAccess`, etc. — ver
  [02](02-estrutura-vite.md)).
- Configurar `vite.config.ts` para multi-page (`index.html`, `v1.html`…`v4.html`), mesmo que as
  páginas ainda estejam vazias/placeholder.
- Copiar `images/` e `music/` para `app/public/`.
- Instalar `stats.js` via npm (ver [04](04-riscos-decisoes-abertas.md#3-statsjs-via-npm-vs-arquivo-vendorizado)).
- Criar a estrutura de pastas vazia (`src/core/`, `src/versions/v1-straight/` … `v4-final/`).

**Critério de pronto:** `npm run dev` sobe, `npm run build` conclui sem erros, e as 5 páginas
(`index.html` + v1–v4) abrem no navegador (mesmo que só com um "hello world" por enquanto). Nenhum
arquivo fora de `app/` foi tocado.

---

## Fase 1 — Núcleo compartilhado (`core/`)

**Tamanho:** M

Portar, com tipos, os módulos que **não dependem de nenhuma versão específica**:

- `core/types.ts` — `Segment`, `SegmentPoint`, `SpriteRect`, `SpriteSlot`, etc.
- `core/dom.ts` — port de `Dom.*` (ver
  [06-arquitetura-common-js §6.1](../06-arquitetura-common-js.md#61-dom--auxiliares-mínimos-de-dom)).
- `core/util.ts` — port de `Util.*` (ver
  [06 §6.2](../06-arquitetura-common-js.md#62-util--matemática-e-helpers-gerais)), incluindo
  `project`, `overlap`, `easeIn/Out/InOut`, `exponentialFog`, `increase`.
- `core/constants.ts` — `KEY`, `COLORS` tipados.
- `core/sprites.ts` / `core/background.ts` — as tabelas geradas (`images/sprites.js`,
  `images/background.js`), transcritas para TypeScript tipado (`Record<string, SpriteRect>`).
  Nenhuma lógica nova, só os dados.
- `core/GameLoop.ts` — a classe que substitui `Game.run` (acumulador de passo fixo, ver
  [06 §6.4](../06-arquitetura-common-js.md#gamerun)).
- `core/AssetLoader.ts` — substitui `Game.loadImages`.
- `core/InputController.ts` — substitui `Game.setKeyListener` + as flags globais.
- `core/StatsPanel.ts` — substitui `Game.stats`.
- `core/MusicPlayer.ts` — substitui `Game.playMusic` + botão de mute.
- `core/Renderer.ts` — substitui o namespace `Render` inteiro.

**Critério de pronto:** tudo compila (`npm run typecheck`), zero `any` não-justificado. Ainda não
existe nenhuma versão jogável — esta fase só entrega os blocos de construção. Se a decisão em
[04](04-riscos-decisoes-abertas.md#4-testes-automatizados) for por incluir testes já aqui,
`core/util.ts` é o candidato natural (funções puras, fáceis de testar).

---

## Fase 2 — Portar v1 (estrada reta)

**Tamanho:** M

- `core/Road.ts` — a DSL completa de construção de pista (mesmo v1 só usando o subset simples,
  ver [01 — Arquitetura Alvo](01-arquitetura-alvo.md#a-classe-road-a-dsl-de-construção-de-pista-compartilhada)).
- `core/RacerGame.ts` — a classe base abstrata com o `update()`/`render()` "esqueleto" e os pontos
  de extensão descritos em [01](01-arquitetura-alvo.md#o-motor-compartilhado-uma-cadeia-de-herança-que-espelha-v1v2v3v4).
- `core/TweakUI.ts` — resolução, largura da pista, altura da câmera, distância de desenho, campo
  de visão, densidade de neblina (os controles já presentes desde a v1 original).
- `versions/v1-straight/RacerGameV1.ts` + `main.ts` — a implementação concreta mínima.
- `v1.html` com a mesma estrutura de DOM da `v1.straight.html` original.

**Critério de pronto:** `v1.html` jogável, com física e visual comparáveis à `v1.straight.html`
original lado a lado (mesma aceleração, mesmo limite de pista, mesma pista de 500 segmentos em
loop).

> Esta é a fase mais importante para validar a arquitetura: é aqui que os limites exatos dos
> métodos protegidos de `RacerGame` (`buildRoad`, `updateLateralForces`, etc.) são testados pela
> primeira vez contra código real. Ajustes na "forma" da classe base descrita no
> [01](01-arquitetura-alvo.md) são esperados e aceitáveis nesta fase.

---

## Fase 3 — Portar v2 (curvas)

**Tamanho:** P/M

- `versions/v2-curves/RacerGameV2.ts` (`extends RacerGameV1`): sobrescreve `buildRoad` (receita
  com `addCurve`/`addSCurves`), `updateLateralForces` (força centrífuga), `updateParallax`
  (offsets horizontais).
- `v2.html`.

**Critério de pronto:** `v2.html` jogável e comparável à `v2.curves.html` original — em particular,
o "duplo acumulador" da renderização (`x`/`dx`, ver
[03-v2-curvas §3.5](../03-v2-curvas.md#35-renderização-o-duplo-acumulador)) precisa produzir
curvas visualmente idênticas às originais.

---

## Fase 4 — Portar v3 (colinas)

**Tamanho:** P/M

- `versions/v3-hills/RacerGameV3.ts` (`extends RacerGameV2`): sobrescreve `buildRoad` (receita com
  `addHill`/`addLowRollingHills`/`addDownhillToEnd`), `getCameraY` (`playerY + cameraHeight`),
  adiciona back-face culling no laço de renderização, `getPlayerScreenY`/`getPlayerUpdown`.
- `v3.html`.

**Critério de pronto:** `v3.html` jogável e comparável à `v3.hills.html` original — morros com o
mesmo perfil de altura (`easeInOut` contínuo, ver
[04-v3-colinas §4.2](../04-v3-colinas.md#42-addroad-com-easing-também-na-altura)) e a câmera
acompanhando o terreno.

---

## Fase 5 — Portar v4 (versão final)

**Tamanho:** G (a maior fase — carros, sprites, colisão, HUD, tweak UI completa)

- `versions/v4-final/Car.ts` — classe de dados do carro de tráfego.
- `versions/v4-final/TrafficManager.ts` — port de `resetCars`/`updateCars`/`updateCarOffset` (a
  IA de desvio, ver [05-v4-final §5.4](../05-v4-final.md#54-movimentação-e-ia-simples-dos-carros-updatecarsupdatecaroffset)).
- `versions/v4-final/scenery.ts` — port de `resetSprites` (posicionamento de árvores/placas/etc.).
- `versions/v4-final/Hud.ts` — velocímetro, tempos de volta, recorde persistido (`localStorage`).
- `versions/v4-final/RacerGameV4.ts` (`extends RacerGameV3`): sobrescreve `buildRoad` (receita
  completa + `resetSprites`/`resetCars`), `updateExtras` (movimento dos carros + colisão contra
  sprites/carros), `renderExtraLayer` (a segunda passada de renderização, ver
  [05 §5.6](../05-v4-final.md#56-renderização-em-duas-passadas-segmentos-depois-spritescarros)).
- Extensão de `TweakUI` com o controle de `lanes`.
- `v4.html`.

**Critério de pronto:** `v4.html` jogável e comparável à `v4.final.html` original — tráfego se
comportando de forma equivalente, colisões, HUD atualizando, tempos de volta persistindo.

---

## Fase 6 — Polimento e documentação

**Tamanho:** P/M

- Revisão de duplicação residual entre as classes `RacerGameV1`…`V4` (qualquer coisa copiada em
  vez de compartilhada via herança/composição é candidata a subir para `RacerGame` ou para um
  módulo de `core/`).
- Remover qualquer `any` remanescente; conferir `noUncheckedIndexedAccess` sem supressões
  desnecessárias.
- Atualizar `CLAUDE.md` e `docs/06-arquitetura-common-js.md` (ou um novo capítulo) apontando para
  o projeto `app/` como a versão TypeScript de referência.
- Se aprovado (ver [04](04-riscos-decisoes-abertas.md#5-vincular-a-nova-versão-a-partir-do-index-html-raiz)),
  adicionar um link no `index.html`/`README.md` da raiz para `app/`.
- Decidir e, se aprovado, aplicar testes automatizados (Vitest) para `core/util.ts` e para a IA de
  `TrafficManager` (funções puras, fáceis de testar isoladamente).

**Critério de pronto:** os critérios de sucesso listados em
[00 — Visão Geral](00-visao-geral.md#critérios-de-sucesso-como-saberemos-que-terminou) estão todos
marcados.
