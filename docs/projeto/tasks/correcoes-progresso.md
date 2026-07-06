# Progresso de Correções — Migração para TypeScript + Vite

## Resumo executivo

| ID | Título | Criticidade | Status |
|---|---|---|---|
| CORR-RACER-001 | `mise.toml` ausente — versão do Node do projeto não está fixada | Alta | [x] concluída |
| CORR-RACER-002 | Assets de exemplo do template Vite não removidos em `app/src/assets/` | Baixa | [x] concluída |
| CORR-RACER-003 | Ícone do botão de mute quebra no build de produção (`url()` relativo em CSS bundlado) | Alta | [x] concluída |
| CORR-RACER-004 | `app/src/main.ts` órfão — não referenciado e fora da estrutura documentada | Baixa | [x] concluída |
| CORR-RACER-005 | Desvios de comportamento não documentados em `dom.ts`/`util.ts` (`resolve()` e `overlap()`) | Baixa | [x] concluída |
| CORR-RACER-006 | `StatsPanel.update()` conta frames em dobro e mede ~0ms (begin/end/update redundantes) | Alta | [x] concluída |
| CORR-RACER-007 | `Renderer.fog()` duplica `COLORS.FOG` como literal em vez de importar de `core/constants.ts` | Baixa | [x] concluída |
| CORR-RACER-008 | `Road.addLowRollingHills()` só implementa a variante v4 — sem como recuperar o traçado original da v3 | Alta | [x] concluída |
| CORR-RACER-009 | `TweakUI` nunca é instanciada/conectada — controles da UI não fazem nada | Crítica | [x] concluída |
| CORR-RACER-010 | `buildRoad()` base produz 501 segmentos em vez dos 500 exatos do v1 original | Baixa | [x] concluída |
| CORR-RACER-011 | `RacerGame.start()` chamava `reset()` antes de `tweakUI` existir, quebrando com `TypeError` | Crítica | [x] concluída |
| CORR-RACER-012 | `MusicPlayer` nunca é instanciado — `v1.html` toca sem música e o botão de mute não funciona | Crítica | [x] concluída |
| CORR-RACER-013 | RACER-TASK-10 marcada como concluída sem a comparação lado a lado exigida pelo critério de conclusão | Alta | [x] concluída |
| CORR-RACER-014 | Painel de FPS (`stats.js` do npm) fica fixo sobre os links de navegação em vez de fluir na tabela de controles | Alta | [x] concluída |
| CORR-RACER-015 | `Road.addSCurves()` embute alturas de colina (v3/v4) — v2 exibe hills onde deveria ser só curva plana | Crítica | [x] concluída |
| CORR-RACER-016 | `RacerGame.update()` calcula `playerSegment` após avançar `position`, um frame fora de fase com o original | Baixa | [x] concluída |
| CORR-RACER-018 | `RacerGame.update()` chama `updateParallax()` após o bloco de aceleração, usando a velocidade já atualizada em vez da anterior ao frame | Baixa | [x] concluída |
| CORR-RACER-019 | `RacerGameV3` duplica o `render()` inteiro em vez de usar pontos de extensão (ponto de extensão da arquitetura não seguido) | Alta | [x] concluída |
| CORR-RACER-020 | RACER-TASK-12 marcada como concluída sem a comparação lado a lado exigida pelo critério de conclusão | Alta | [x] concluída |
| CORR-RACER-021 | `TrafficManager` duplica `findSegment`/`segmentLength` de `Road` e depende de `trackLength` já calculado | Alta | [x] concluída |
| CORR-RACER-022 | `scenery.ts` omite 7 das 9 billboards fixas do início de `resetSprites()` | Crítica | [x] concluída |
| CORR-RACER-023 | `Hud.updateSpeed()` normaliza por `maxSpeed` em vez de usar a fórmula fixa `5 * Math.round(speed/500)` | Crítica | [x] concluída |
| CORR-RACER-024 | `Hud` não inicializa o recorde persistido de volta mais rápida (default `180s` + exibição inicial) | Alta | [x] concluída |
| CORR-RACER-025 | `Hud.onLapComplete()` usa `<` em vez de `<=` ao comparar com o recorde salvo (empate não vira novo recorde) | Baixa | [x] concluída |
| CORR-RACER-026 | `RacerGameV4.startPosition` nunca é atualizado — cronometragem de volta reinicia a cada frame | Crítica | [x] concluída |
| CORR-RACER-027 | `TrafficManager` instanciado com `segmentLength` no lugar de `maxSpeed` — velocidade do tráfego ~60x errada | Crítica | [x] concluída |
| CORR-RACER-028 | `renderExtraLayer` descarta quase todos os sprites/carros por um filtro de `clip` inexistente no original | Crítica | [x] concluída |
| CORR-RACER-029 | Segunda passada de render inclui o segmento mais próximo (`n=0`), que o original exclui | Baixa | [x] concluída |
| CORR-RACER-030 | `updateCars`/colisão rodam no fim de `update()`, usando `playerX`/`speed` já mutados neste frame | Baixa | [x] concluída |
| CORR-RACER-031 | RACER-TASK-15 marcada como concluída sem a comparação lado a lado exigida pelo critério de conclusão | Alta | [x] concluída |
| CORR-RACER-032 | `RacerGameV4.buildRoad()` nunca instancia `this.road` — `v4.html` quebra ao carregar | Crítica | [x] concluída |
| CORR-RACER-033 | `RacerGameV4.buildRoad()` nunca chama `markStartFinish()` — pista sem faixa de largada/chegada | Alta | [x] concluída |

## Checklist

- [x] CORR-RACER-001 — criar `mise.toml` fixando a versão do Node
- [x] CORR-RACER-002 — remover `typescript.svg`/`vite.svg`/`hero.png` de `app/src/assets/`
- [x] CORR-RACER-003 — trocar `url(images/mute.png)` por `url(/images/mute.png)` em `app/src/style.css`
- [x] CORR-RACER-004 — remover `app/src/main.ts` (stub órfão do scaffold original)
- [x] CORR-RACER-005 — corrigir `overlap()` (`??`→`||`) e `resolve()` (retornar `document`, não `documentElement`)
- [x] CORR-RACER-006 — simplificar `StatsPanel.update()` para uma única chamada de medição por frame
- [x] CORR-RACER-007 — `Renderer.fog()` usar `COLORS.FOG` importado em vez do literal `'#005108'`
- [x] CORR-RACER-008 — parametrizar a curva em `addLowRollingHills` (default v4, `0` para v3)
- [x] CORR-RACER-009 — instanciar/conectar `TweakUI` em `RacerGame.start()`/`reset()`
- [x] CORR-RACER-010 — trocar `addStraight(500/3)` por `addRoad(500, 0, 0, 0, 0)` em `buildRoad()`
- [x] CORR-RACER-011 — reordenar `start()`: montar/vincular `TweakUI` antes do primeiro `reset()`
- [x] CORR-RACER-012 — instanciar `MusicPlayer('music', 'mute')` em `RacerGame.start()`
- [x] CORR-RACER-013 — reverter status da RACER-TASK-10 até a comparação lado a lado ser feita de verdade
- [x] CORR-RACER-014 — neutralizar `position:fixed` do `stats.js` npm em `StatsPanel.ts`
- [x] CORR-RACER-015 — parametrizar altura em `addSCurves` (default v3/v4, `false` para v2)
- [x] CORR-RACER-016 — calcular `playerSegment` antes de avançar `position` em `update()`
- [x] CORR-RACER-018 — mover `updateParallax()` para antes do bloco de aceleração em `update()`
- [x] CORR-RACER-019 — remover `render()` de `RacerGameV3`, adicionar `getBackgroundOffsetY` ao `render()` compartilhado e corrigir a fração de `playerY`
- [x] CORR-RACER-020 — executar a validação lado a lado real da RACER-TASK-12 antes de mantê-la como concluída
- [x] CORR-RACER-021 — `TrafficManager` usar `road.findSegment()`/`road.segmentLength` em vez de derivar de `trackLength`
- [x] CORR-RACER-022 — adicionar as 7 chamadas de billboard faltantes (segmentos 60-180) em `scenery.ts`
- [x] CORR-RACER-023 — corrigir `Hud.updateSpeed()` para `5 * Math.round(speed/500)`, sem `maxSpeed`
- [x] CORR-RACER-024 — `Hud` seedar `Dom.storage.fast_lap_time` (default `180`) e exibir o valor inicial no construtor
- [x] CORR-RACER-025 — `Hud.onLapComplete()` usar `<=` em vez de `<` na comparação com o recorde
- [x] CORR-RACER-026 — capturar `startPosition` do frame em `updateParallax` para uso em `updateExtras`
- [x] CORR-RACER-027 — instanciar `TrafficManager` com `this.maxSpeed` em vez de `this.segmentLength`
- [x] CORR-RACER-028 — remover o filtro `if ((segment.clip ?? maxy) >= maxy) continue;` de `renderExtraLayer`
- [x] CORR-RACER-029 — iniciar o laço de `renderExtraLayer` em `n = 1`, não `n = 0`
- [x] CORR-RACER-030 — mover `updateCars` para um novo ponto de extensão chamado antes de `updateLateralForces`
- [x] CORR-RACER-031 — reverter status da RACER-TASK-15 até a comparação lado a lado ser feita de verdade
- [x] CORR-RACER-032 — instanciar `this.road = new Road(...)` no início de `RacerGameV4.buildRoad()`
- [x] CORR-RACER-033 — chamar `this.road.markStartFinish(this.playerZ)` em `RacerGameV4.buildRoad()`

## Detalhes por correção

### CORR-RACER-001

- **Alvo com problema:** `mise.toml` (deveria existir na raiz do repositório ou em `app/`)
- **Sintoma:** Não existe nenhum `mise.toml` no projeto. `mise current node` só reporta uma
  versão (`20.20.2`) porque o `~/.config/mise/config.toml` **global** do usuário já fixa
  `node = "20"` — em outra máquina/usuário isso reportaria "não definido". `01-executar.md`
  atribui explicitamente à RACER-TASK-01 a responsabilidade de criar esse arquivo, e isso não
  foi feito.
- **Fix:** Criar `mise.toml` na raiz do repositório com `[tools]\nnode = "20"` (ex.: via
  `mise use node@20`) e confirmar que `mise current node` rodado em `app/` reflete o arquivo do
  projeto, não o global.

### CORR-RACER-002

- **Alvo com problema:** `app/src/assets/typescript.svg`, `app/src/assets/vite.svg`,
  `app/src/assets/hero.png`
- **Sintoma:** Arquivos de exemplo do template `vanilla-ts`, não referenciados em nenhum lugar
  do código, remanescentes apesar do passo de limpeza de boilerplate da RACER-TASK-01 e do
  critério de conclusão "Boilerplate de exemplo do template removido".
- **Fix:** Remover os três arquivos (e a pasta `assets/` se ficar vazia).

### CORR-RACER-003

- **Alvo com problema:** `app/src/style.css` (regra `#mute`)
- **Sintoma:** `url(images/mute.png)` é um caminho relativo ao próprio arquivo CSS. Como
  `style.css` agora é importado via `main.ts` (não referenciado por `<link>` a partir da raiz,
  como no original), o Vite extrai o CSS para `dist/assets/style-<hash>.css` no build de
  produção, e o `url()` relativo passa a apontar para `dist/assets/images/mute.png` (inexistente)
  em vez de `dist/images/mute.png` (onde o asset realmente está). Em dev funciona por
  coincidência (CSS injetado inline resolve relativo à página); no build, o ícone do mute quebra.
  Confirmado via `mise exec -- npm run build`, que emite o aviso "images/mute.png referenced in
  images/mute.png didn't resolve at build time".
- **Fix:** Trocar para `url(/images/mute.png)` (caminho absoluto a partir da raiz do site), que
  resolve corretamente tanto em dev quanto em build, independente de onde o Vite emite o CSS.

### CORR-RACER-004

- **Alvo com problema:** `app/src/main.ts`
- **Sintoma:** Stub deixado pela RACER-TASK-01 ("será preenchido nas próximas tarefas"), mas as
  RACER-TASK-02/03 criaram os entry points reais em `src/versions/*/main.ts` sem remover o stub.
  Não é referenciado por nenhuma página HTML nem pelo `vite.config.ts`, e não faz parte da árvore
  documentada em `02-estrutura-vite.md`.
- **Fix:** Remover `app/src/main.ts`.

### CORR-RACER-005

- **Alvo com problema:** `app/src/core/util.ts` (`overlap`) e `app/src/core/dom.ts` (`resolve`)
- **Sintoma:** Duas substituições não documentadas de `||` por `??` (ou equivalente) que
  divergem do original: (1) `overlap` usa `(percent ?? 1)/2` em vez de `(percent || 1)/2` —
  diferente do caso de `project` (fallback `0`, equivalente), aqui o fallback é `1`, então
  `percent = 0` produz resultados diferentes (`0 ?? 1 = 0` vs `0 || 1 = 1`); (2) o helper interno
  `resolve()` de `dom.ts` retorna `document.documentElement` para `id === document`, em vez do
  próprio `document` como no original — usado por `Dom.on(document, ...)`, que a RACER-TASK-06
  (`InputController`) vai depender para o teclado global. Nenhuma das duas mudanças foi
  mencionada no Log de Execução da RACER-TASK-05, que só disclosed a substituição em `project`.
- **Fix:** Reverter `overlap` para `(percent || 1)/2`; fazer `resolve()` retornar o próprio
  `document` (não `documentElement`) para `id === document`.

### CORR-RACER-006

- **Alvo com problema:** `app/src/core/StatsPanel.ts` (`update()`)
- **Sintoma:** `update()` chama `this.stats.begin()` → `this.stats.end()` → `this.stats.update()`
  em sequência, uma vez por frame. Pelo código-fonte de `stats.js` instalado, `update()` já
  equivale a `end()` seguido de um novo `begin()` — chamar os três juntos sem nenhum trabalho
  real entre `begin()` e o primeiro `end()` conta `frames` duas vezes por frame visual (o widget
  de FPS do `stats.js`, visível no `#fps` de todas as páginas, reporta o dobro do FPS real) e
  mede `~0ms` de frame time (o painel de "ms" e `this.lastMs`, usado na mensagem "Your canvas
  performance is good/ok/bad", ficam incorretos).
- **Fix:** Chamar `this.stats.update()` uma única vez por frame; medir `lastMs` via timestamp
  próprio (`performance.now()`) independente do `stats.js`, para a mensagem de performance.

### CORR-RACER-007

- **Alvo com problema:** `app/src/core/Renderer.ts` (`fog()`)
- **Sintoma:** `fog()` usa `ctx.fillStyle = '#005108'` como literal, em vez de importar e usar
  `COLORS.FOG` de `core/constants.ts` (criado na RACER-TASK-04 exatamente para ser a fonte única
  de verdade das cores de jogo). O valor está correto hoje (idêntico), mas duplica a constante —
  se `COLORS.FOG` mudar no futuro, `Renderer.fog()` continuaria usando o valor antigo
  silenciosamente.
- **Fix:** Importar `COLORS` de `./constants` em `Renderer.ts` e usar `COLORS.FOG` no lugar do
  literal.

### CORR-RACER-008

- **Alvo com problema:** `app/src/core/Road.ts` (`addLowRollingHills`)
- **Sintoma:** Comparando `v3.hills.html` e `v4.final.html` função por função, todas as 8
  funções da DSL de pista são byte-idênticas entre as duas versões — **exceto
  `addLowRollingHills`**: v3 usa `curve = 0` nas 6 chamadas internas, v4 usa
  `ROAD.CURVE.EASY`/`-ROAD.CURVE.EASY` nas duas do meio. `Road.ts` implementou só a variante v4,
  com o valor da curva hardcoded (não exposto como parâmetro) — não há como a futura
  `RacerGameV3.buildRoad()` (RACER-TASK-12) recuperar o traçado sem curva do `v3.hills.html`
  original a partir deste método compartilhado. Se RACER-TASK-12 simplesmente chamar
  `road.addLowRollingHills()`, o traçado da v3 portada terá curvas onde o original não tinha —
  uma violação de "paridade de comportamento" (objetivo explícito do projeto).
- **Fix:** Adicionar um terceiro parâmetro opcional `curve: number = ROAD.CURVE.EASY` a
  `addLowRollingHills`, usado nas duas chamadas centrais (`curve`/`-curve`) em vez do literal —
  preserva o comportamento atual da v4 (chamada sem o argumento) e permite que a v3 passe `0`
  explicitamente.

### CORR-RACER-009

- **Alvo com problema:** `app/src/core/RacerGame.ts` (`start()`/`reset()`)
- **Sintoma:** `TweakUI` foi implementada corretamente na RACER-TASK-09, mas `grep -rn
  "TweakUI" app/src/` só retorna a própria declaração da classe — nunca é importada, instanciada
  nem usada. Consequência dupla: (1) `TweakUI.bind()` nunca é chamado, então os listeners de
  `change` dos controles (`resolution`, `lanes`, `roadWidth`, `cameraHeight`, `drawDistance`,
  `fieldOfView`, `fogDensity`) nunca são registrados — mover qualquer slider ou trocar qualquer
  `<select>` não faz nada; (2) `TweakUI.refresh()` nunca é chamado a partir de `reset()` (o
  original sempre chama `refreshTweakUI()` no fim de `reset()`, inclusive na primeira vez), então
  os controles nunca refletiriam a configuração real. Toda a tweak UI — um recurso central e
  visível desde a v1 — fica completamente não-funcional.
- **Fix:** Instanciar `new TweakUI((options) => this.reset(options))` em `RacerGame.start()` e
  chamar `.bind()` uma vez; chamar `this.tweakUI.refresh({...})` incondicionalmente ao final de
  `reset()`.

### CORR-RACER-010

- **Alvo com problema:** `app/src/core/RacerGame.ts` (`buildRoad()`)
- **Sintoma:** A implementação-base de `buildRoad()` chama `this.road.addStraight(500 / 3)`.
  Como `500/3 = 166.667`, cada uma das 3 fases internas de `addStraight` (`enter`/`hold`/`leave`)
  roda 167 iterações (não 166.67 arredondado), totalizando 501 segmentos — não os 500 exatos do
  `for` cru original de `v1.straight.html`. `trackLength` fica `100200` em vez de `100000`
  (0,2% mais longo). Confirmado rodando o loop equivalente em Node.
- **Fix:** Trocar por `this.road.addRoad(500, 0, 0, 0, 0)` — uma única fase de exatamente 500
  segmentos, sem a divisão fracionária em três partes.

### CORR-RACER-011

- **Alvo com problema:** `app/src/core/RacerGame.ts` (`start()`)
- **Sintoma:** Regressão introduzida pela própria aplicação do CORR-RACER-009: `start()` chamava
  `this.reset()` **antes** de `this.tweakUI = new TweakUI(...)`. Como `reset()` (desde o
  CORR-RACER-009) chama incondicionalmente `this.tweakUI.refresh(...)`, a primeira chamada de
  `reset()` disparava `TypeError: Cannot read properties of undefined (reading 'refresh')` —
  `start()` quebraria assim que qualquer versão concreta (RACER-TASK-10) o chamasse. Não pego
  por typecheck (é ordem de execução, não erro de tipo) nem pelo Log do CORR-RACER-009 (o item
  de checagem manual no navegador tinha ficado sem marcar).
- **Fix:** Reordenar `start()` — construir e vincular `TweakUI` antes da primeira chamada a
  `this.reset()`.

### CORR-RACER-012

- **Alvo com problema:** `app/src/core/RacerGame.ts` (`start()`)
- **Sintoma:** `MusicPlayer` (criado corretamente na RACER-TASK-06) nunca é importado nem
  instanciado em lugar nenhum do código (`grep -rn "MusicPlayer" app/src/` só retorna a própria
  classe). O original (`common.js`, `Game.run`) chama `Game.playMusic()` incondicionalmente para
  as 4 versões, inclusive `v1.straight.html` (que já tem `<audio id="music">`/`<span id="mute">`
  no HTML, replicado em `app/v1.html`). Resultado: `v1.html` joga em silêncio e o botão de mute
  não faz nada — divergência de comportamento perceptível encontrada ao validar a RACER-TASK-10.
- **Fix:** Instanciar `new MusicPlayer('music', 'mute')` em `RacerGame.start()`, espelhando a
  chamada incondicional de `Game.playMusic()` do original.

### CORR-RACER-013

- **Alvo com problema:** `docs/projeto/tasks/progresso.md` (status da RACER-TASK-10) e
  `docs/projeto/tasks/10-portar-v1-estrada-reta.md` (critério de conclusão / Log de Execução)
- **Sintoma:** O item "Comparação lado a lado com `v1.straight.html`..." está desmarcado no
  critério de conclusão da própria tarefa, e o Log de Execução admite que a validação manual não
  foi feita — mas `progresso.md` marca a RACER-TASK-10 como `✅ Concluído` mesmo assim, violando a
  Exclusão Obrigatória 4 de `01-executar.md` ("não marcar como concluída só porque compilou"). O
  bug real encontrado em `CORR-RACER-012` é evidência de que essa comparação, se tivesse sido
  feita, teria pego o problema antes do fechamento da tarefa.
- **Fix:** Reverter o status da RACER-TASK-10 em `progresso.md` (e o item correspondente no
  checklist da Fase 2) até que a comparação lado a lado seja de fato executada e documentada no
  Log, só então remarcar como concluída.

### CORR-RACER-014

- **Alvo com problema:** `app/src/core/StatsPanel.ts`
- **Sintoma:** O `stats.js` vendorizado usado pelo original cria o painel de FPS sem `position`
  (`width:80px;opacity:0.9;cursor:pointer`), fluindo dentro do `<td id="fps">` da tabela de
  controles. O pacote **npm** `stats.js` usado por `StatsPanel` (decisão aceita do projeto) define
  o painel com `position:fixed;top:0;left:0;...` por padrão — como `StatsPanel` também o anexa
  dentro de `Dom.get('fps')`, o `fixed` inline ignora a célula da tabela e ancora o painel no
  canto superior-esquerdo da viewport, sobrepondo a linha dos links de navegação
  (`straight | curves | hills | final`). Encontrado pelo usuário comparando `v1.html` com
  `v1.straight.html` lado a lado.
- **Fix:** Sobrescrever `this.stats.dom.style.cssText = 'width:80px;opacity:0.9;cursor:pointer'`
  logo após `new Stats()`, antes de anexar ao DOM, replicando o estilo do original.

### CORR-RACER-015

- **Alvo com problema:** `app/src/core/Road.ts` (`addSCurves()`)
- **Sintoma:** `addSCurves()` foi implementada copiando a versão de `v3.hills.html`/
  `v4.final.html` (com alturas `ROAD.HILL.NONE`/`MEDIUM`/`-LOW`/`MEDIUM`/`-MEDIUM` embutidas),
  não a de `v2.curves.html` (que não tem parâmetro de altura — v2 nunca tem `y`).
  `RacerGameV2.buildRoad()` chama essa `addSCurves()` compartilhada 3x, então os segmentos de S-
  curve da v2 ganham `world.y` não-nulo, e `Util.project()` usa esse valor incondicionalmente —
  resultado: `v2.html` mostra hills nos trechos de S-curve, onde o original é perfeitamente
  plano. Encontrado pelo usuário comparando `v2.html` com `v2.curves.html`.
- **Fix:** Adicionar parâmetro opcional `withHills: boolean = true` a `addSCurves`, multiplicando
  as alturas por `0` quando `false`; `RacerGameV2.buildRoad()` passa `addSCurves(false)` nas 3
  chamadas.

### CORR-RACER-016

- **Alvo com problema:** `app/src/core/RacerGame.ts` (`update()`)
- **Sintoma:** `playerSegment` é calculado a partir de `this.position` **depois** de
  `this.position` já ter avançado neste tick — o original (`v2.curves.html`) calcula
  `playerSegment` **antes** de avançar `position`. Desloca em 1 frame (1/60s) o momento em que a
  curvatura de um novo segmento passa a afetar a força centrífuga/parallax. Impacto prático
  pequeno, mas é uma divergência real do algoritmo documentado.
- **Fix:** Mover o cálculo de `playerSegment` para antes da linha
  `this.position = Util.increase(...)` em `update()`.

### CORR-RACER-018

- **Alvo com problema:** `app/src/core/RacerGame.ts` (`update()`)
- **Sintoma:** `updateParallax()` é chamada depois do bloco `if (keyFaster)/.../offRoadDecel`,
  então `RacerGameV2.updateParallax()` calcula `speedPercent` a partir do `this.speed` **já
  acelerado/freado/clampado** neste frame — no original, os acumuladores `skyOffset`/
  `hillOffset`/`treeOffset` usam o `speedPercent` capturado **antes** desse bloco, o mesmo usado
  pela força centrífuga. Mesma classe de bug do CORR-RACER-016 (ponto de extensão lendo estado já
  mutado por um passo posterior do próprio `update()`).
- **Fix:** Mover a chamada `this.updateParallax(dt, playerSegment, startPosition)` para logo após
  `this.updateLateralForces(...)`, antes do bloco de aceleração/frenagem/fora-de-pista.

### CORR-RACER-019

- **Alvo com problema:** `app/src/versions/v3-hills/RacerGameV3.ts` (método `render()`) e
  `app/src/core/RacerGame.ts` (`render()` compartilhado)
- **Sintoma:** `RacerGameV3` sobrescreve `render()` por completo, duplicando ~60 linhas do laço de
  renderização já existente em `core/RacerGame.ts`, em vez de usar só os pontos de extensão
  previstos pela tarefa (`buildRoad`, `getCameraY`, `updateParallax`, `getPlayerScreenY`,
  `getPlayerUpdown`). Contradiz `01-arquitetura-alvo.md` ("`render()` ... não é reescrito pelas
  subclasses") e o comentário `// Core render — final (not overridden)` no próprio código-base.
  Mascara também um bug na base: `playerY` é calculado com fração fixa `0.5` em vez de
  `percentRemaining`.
- **Fix:** Adicionar `getBackgroundOffsetY(playerY)` como novo ponto de extensão no `render()`
  compartilhado, corrigir a fração de `playerY` para usar `percentRemaining`, e remover o `render()`
  duplicado de `RacerGameV3` (ver `CORR-RACER-019.md` para o detalhamento completo).

### CORR-RACER-020

- **Alvo com problema:** `docs/projeto/tasks/progresso.md` (status da RACER-TASK-12) e
  `docs/projeto/tasks/12-portar-v3-colinas.md` (critério de conclusão / Log de Execução)
- **Sintoma:** Todos os itens do critério de conclusão da tarefa seguem desmarcados e o próprio Log
  de Execução admite que a validação visual lado a lado "requer execução manual de `npm run dev`" —
  ou seja, não foi feita — mas `progresso.md` já marca a RACER-TASK-12 como `✅ Concluído`. Mesma
  classe de violação já corrigida em `CORR-RACER-013` para a RACER-TASK-10.
- **Fix:** Reverter o status da RACER-TASK-12 até a comparação lado a lado com `v3.hills.html` ser
  de fato executada e documentada no Log, só então remarcar como concluída.

### CORR-RACER-021

- **Alvo com problema:** `app/src/versions/v4-final/TrafficManager.ts`
- **Sintoma:** `TrafficManager` reimplementa `findSegment` de forma privada e duplicada em vez de
  usar `Road.findSegment()` (já público), derivando `segmentLength` de
  `road.trackLength / road.segments.length`. Isso só é correto depois de `Road.finalize()` já ter
  rodado — mas `docs/05-v4-final.md` §5.10 mostra que, no original, `resetCars()` sempre roda
  **antes** de `trackLength` ser calculado. Se a RACER-TASK-15 seguir essa mesma ordem (natural,
  já usada por `RacerGame`/`V2`/`V3` ao chamar `finalize()` só ao fim de `buildRoad()`),
  `resetCars()` sorteia `z = 0` para todos os carros e `findSegment` privado quebra em runtime
  (`Math.floor(z/0)` → índice inválido).
- **Fix:** Remover o `findSegment` privado de `TrafficManager` e usar `road.findSegment(z)`;
  expor `segmentLength` publicamente em `Road` (getter) para os dois cálculos restantes que
  precisam do valor numérico (`resetCars()`, `car.percent`).

### CORR-RACER-022

- **Alvo com problema:** `app/src/versions/v4-final/scenery.ts` (`resetSprites`)
- **Sintoma:** O original (`v4.final.html`, linhas 545-553) tem nove chamadas fixas de billboard
  no início (segmentos 20-180, incremento 20: `BILLBOARD07,06,08,09,01,02,03,04,05`). O
  `scenery.ts` portado só tem as duas primeiras (segmentos 20 e 40) — faltam as sete de 60 a 180.
  O Log de Execução da RACER-TASK-14 afirma preservação exata dos parâmetros, o que não é
  verdade aqui. Causa provável: `docs/05-v4-final.md` abrevia esse bloco com um comentário
  (`// ... mais placas fixas próximas ao início`), e a implementação não consultou
  `v4.final.html` diretamente para recuperar as linhas elididas.
- **Fix:** Adicionar as sete chamadas `addSprite(road, N, SPRITES.BILLBOARDxx, -1)` faltantes
  (segmentos 60/80/100/120/140/160/180, sprites `BILLBOARD08/09/01/02/03/04/05`).

### CORR-RACER-023

- **Alvo com problema:** `app/src/versions/v4-final/Hud.ts` (`updateSpeed`)
- **Sintoma:** Original: `updateHud('speed', 5 * Math.round(speed/500))` — não depende de
  `maxSpeed`. Portado: `Math.round(speed / maxSpeed * 500 / 5) * 5` — normaliza por `maxSpeed`
  antes de escalar, uma fórmula diferente. Com `maxSpeed = 12000` (valor real do projeto), a
  velocidade máxima exibiria `500` no lugar de `120` do original.
- **Fix:** Trocar por `5 * Math.round(speed/500)`, removendo `maxSpeed` do cálculo.

### CORR-RACER-024

- **Alvo com problema:** `app/src/versions/v4-final/Hud.ts` (construtor)
- **Sintoma:** O original inicializa `Dom.storage.fast_lap_time = Dom.storage.fast_lap_time ||
  180` e atualiza o HUD com esse valor uma vez, no callback `ready` de `Game.run`
  (`v4.final.html`, linhas 625-626). `Hud.ts` portado não faz nada equivalente no construtor —
  falta parte do "recorde persistido" explicitamente listado no critério de conclusão da
  RACER-TASK-14. Há precedente direto: `MusicPlayer` (RACER-TASK-06) já se auto-inicializa a
  partir de `Dom.storage` no próprio construtor, replicando o que era `Game.playMusic()` no
  original.
- **Fix:** No construtor de `Hud`, seedar `Dom.storage.fast_lap_time` com `'180'` se ainda não
  existir, e chamar `setIfChanged('fast_lap_time', ...)` com o valor formatado.

### CORR-RACER-025

- **Alvo com problema:** `app/src/versions/v4-final/Hud.ts` (`onLapComplete`)
- **Sintoma:** Original usa `<=` (`lastLapTime <= Util.toFloat(Dom.storage.fast_lap_time)`) —
  uma volta empatada com o recorde ainda conta como novo recorde. Portado usa `<` estrito
  (`lapTime < fastLapTime`) — um empate exato cai no `else`, removendo a classe `fastest` em vez
  de reafirmá-la. Divergência de baixo impacto prático, mas real.
- **Fix:** Trocar `lapTime < fastLapTime` por `lapTime <= fastLapTime`.

### CORR-RACER-026

- **Alvo com problema:** `app/src/versions/v4-final/RacerGameV4.ts` (`startPosition`)
- **Sintoma:** `this.startPosition` é declarado (`= 0`) e nunca reatribuído. `updateExtras()` usa
  esse campo sempre-zero para checar `startPosition < playerZ`, condição que fica sempre
  verdadeira — o cronômetro da volta atual reseta a cada frame assim que `currentLapTime` deixa
  de ser `0`, nunca acumulando um tempo de volta real.
- **Fix:** Capturar o `startPosition` do frame dentro de `updateParallax` (que já o recebe como
  parâmetro e roda antes de `updateExtras` no mesmo tick), atribuindo a `this.startPosition`.

### CORR-RACER-027

- **Alvo com problema:** `app/src/versions/v4-final/RacerGameV4.ts` (`onReset`)
- **Sintoma:** `new TrafficManager(this.road, 200, this.segmentLength)` passa `segmentLength`
  (200) no lugar de `maxSpeed` (12000) como terceiro argumento — carros de tráfego calculados com
  velocidade ~60x menor que o pretendido, e esterço da IA com magnitude inflada na mesma
  proporção.
- **Fix:** Trocar para `new TrafficManager(this.road, 200, this.maxSpeed)`.

### CORR-RACER-028

- **Alvo com problema:** `app/src/versions/v4-final/RacerGameV4.ts` (`renderExtraLayer`)
- **Sintoma:** Filtro `if ((segment.clip ?? maxy) >= maxy) continue;` sem equivalente no
  original — como `maxy` recebido é o valor final (mais restritivo) da primeira passada e
  `segment.clip` de cada segmento foi gravado antes disso, a condição é verdadeira para quase
  todo segmento, descartando a maioria dos sprites/carros da segunda passada de renderização.
- **Fix:** Remover essa linha de filtro; o recorte por horizonte já é feito corretamente via o
  parâmetro `clipY` de `Renderer.sprite`.

### CORR-RACER-029

- **Alvo com problema:** `app/src/versions/v4-final/RacerGameV4.ts` (`renderExtraLayer`)
- **Sintoma:** Laço `for (let n = 0; ...)` inclui o segmento mais próximo da câmera (`n=0`); o
  original (`for(n = drawDistance-1; n > 0; n--)`) nunca o inclui na segunda passada.
- **Fix:** Iniciar o laço em `n = 1`.

### CORR-RACER-030

- **Alvo com problema:** `app/src/core/RacerGame.ts` / `app/src/versions/v4-final/RacerGameV4.ts`
- **Sintoma:** `updateCars` roda dentro de `updateExtras`, chamada ao final de `update()` — a IA
  de tráfego reage a `playerX`/`speed` já atualizados neste frame, não aos valores commitados no
  frame anterior como no original (`docs/05-v4-final.md#55`, item 1).
- **Fix:** Adicionar um ponto de extensão chamado no início de `update()` (antes de
  `updateLateralForces`) para `updateCars`, mantendo o restante de `updateExtras` como está.

### CORR-RACER-031

- **Alvo com problema:** `docs/projeto/tasks/progresso.md` (status da RACER-TASK-15) e
  `docs/projeto/tasks/15-portar-v4-final.md` (Log de Execução)
- **Sintoma:** Log de Execução só menciona typecheck/build, sem registrar a comparação lado a
  lado com `v4.final.html` exigida pelo critério de conclusão — e três bugs facilmente visíveis
  (`CORR-RACER-026`/`027`/`028`) confirmam que essa comparação não foi de fato feita.
- **Fix:** Reverter o status da RACER-TASK-15 até `CORR-RACER-026` a `030` serem aplicadas e a
  validação lado a lado ser executada e documentada de verdade.

### CORR-RACER-032

- **Alvo com problema:** `app/src/versions/v4-final/RacerGameV4.ts` (`buildRoad`)
- **Sintoma:** `buildRoad()` nunca faz `this.road = new Road(...)` (diferente de
  `RacerGame`/`RacerGameV2`/`RacerGameV3`, que sempre criam a instância na primeira linha do
  próprio `buildRoad()`) — `this.road` fica `undefined` e `v4.html` quebra imediatamente com
  `TypeError: Cannot read properties of undefined (reading 'addStraight')`, confirmado no console
  do navegador. Bug pré-existente da implementação original da RACER-TASK-15, só descoberto agora
  ao efetivamente abrir `v4.html` no navegador (a validação que faltava, ver `CORR-RACER-031`).
- **Fix:** Adicionar `this.road = new Road(this.segmentLength, this.rumbleLength);` como primeira
  instrução de `buildRoad()`.

### CORR-RACER-033

- **Alvo com problema:** `app/src/versions/v4-final/RacerGameV4.ts` (`buildRoad`)
- **Sintoma:** `buildRoad()` nunca chama `this.road.markStartFinish(this.playerZ)` (presente em
  todas as outras versões) — a pista da v4 portada nunca exibe a faixa quadriculada de
  largada/chegada, apesar de `docs/05-v4-final.md#510` indicar que o original preserva essa
  marcação ("START/FINISH e trackLength, como nas versões anteriores").
- **Fix:** Adicionar `this.road.markStartFinish(this.playerZ);` antes de `this.road.finalize()`
  em `buildRoad()`.
