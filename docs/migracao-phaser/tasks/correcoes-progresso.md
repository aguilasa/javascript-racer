# Progresso de Correções — Migração para Phaser

## Resumo executivo

| ID | Título | Criticidade | Status |
| --- | --- | --- | --- |
| CORR-PHASER-001 | Checklist de Critério de conclusão da PHASER-TASK-01 não marcado | Baixa | [x] concluído |
| CORR-PHASER-002 | Colisão de chave de textura 'background' no Preloader impede carregamento real de background.png | Alta | [x] concluído |
| CORR-PHASER-003 | RoadRenderer.polygon() passa number[][] para fillPoints, que exige objetos {x,y} — trapézios não desenhados corretamente | Alta | [x] concluído |
| CORR-PHASER-004 | RoadRenderer/Game usam Phaser.* como global sem importá-lo como valor — ReferenceError em runtime | Alta | [x] concluído |
| CORR-PHASER-005 | RoadRenderer.colorToNumber() não entende nomes CSS ('white'/'black') — linha de largada renderiza preta | Alta | [x] concluído |
| CORR-PHASER-006 | RacerEngine.getPlayerScreenY()/getPlayerUpdown() ficaram no comportamento base (v1) em vez do final v3/v4 | Alta | [x] concluído |
| CORR-PHASER-007 | RacerEngine duplica addBumps() em vez de reaproveitar Road.addBumps() | Alta | [x] concluído |
| CORR-PHASER-008 | RacerEngine tem campos privados mortos (fps, startPosition) que quebram tsc --noEmit | Alta | [x] concluído |
| CORR-PHASER-009 | Game.renderRoad() reindexação errada + reuso de um maxy final estático — pista não desenha nada | Crítica | [x] concluído |
| CORR-PHASER-010 | Game.renderPlayer() passa o objeto SpriteRect para setFrame() em vez do nome do frame | Alta | [x] concluído |
| CORR-PHASER-011 | Game.renderPlayer() inverte cameraDepth/playerZ — escala do jogador ~1000x errada | Alta | [x] concluído |
| CORR-PHASER-012 | Game.update() chama this.input.keyboard.addKeys(...) a cada frame em vez de uma única vez | Baixa | [x] concluído |
| CORR-PHASER-013 | segment.clip nunca é resetado — segmentos fantasmas corrompem a pista progressivamente ao dirigir | Crítica | [x] concluído |
| CORR-PHASER-014 | Checklist de Critério de conclusão da PHASER-TASK-10 não marcado | Baixa | [x] concluído |
| CORR-PHASER-015 | Game.update() chama racerEngine.getRenderState() 4 vezes por frame, recomputando o mesmo resultado | Alta | [x] concluído |
| CORR-PHASER-016 | Colisão jogador↔sprite de cenário usa playerSegment desatualizado e roda antes do clamp final de playerX/speed | Alta | [x] concluído |
| CORR-PHASER-017 | currentLapTime incrementado num ramo `else` externo que não existe no original — cronometragem de volta diverge | Crítica | [x] concluído |
| CORR-PHASER-018 | tsc --noEmit falha (car de Segment.cars tratado como unknown) em RacerEngine.ts/TrafficRenderer.ts — npm run build não detecta | Alta | [x] concluído |
| CORR-PHASER-019 | tsc --noEmit falha — Game.music tipado como Phaser.Sound.BaseSound, que não declara mute/setMute | Alta | [x] concluído |
| CORR-PHASER-020 | Merge da PHASER-TASK-20 trouxe para master 4 commits de ferramenta de upscaling de sprites (scripts/, resources/, docs/sprites/, .gitignore) — confirmado pelo usuário como decisão intencional, não vazamento | Não é discrepância | [x] confirmado (sem ação) |
| CORR-PHASER-021 | Checklist de Critério de conclusão da PHASER-TASK-21 não marcado | Baixa | [x] concluído |
| CORR-PHASER-022 | PHASER-TASK-21 exige `npm run typecheck`, script que não existe em `racer-phaser/package.json` (sugerido desde CORR-PHASER-003, nunca criado) | Baixa | [x] concluído |

## Checklist

- [x] CORR-PHASER-001 — marcar `[x]` no Critério de conclusão de `01-criar-branch-e-tooling.md`
- [x] CORR-PHASER-002 — renomear a chave de textura da folha de parallax no `Preloader` para não colidir com `'background'`
- [x] CORR-PHASER-003 — corrigir `RoadRenderer.polygon()` para passar `{x,y}` em vez de `[x,y]` para `fillPoints`
- [x] CORR-PHASER-004 — adicionar `import * as Phaser from 'phaser'` em `RoadRenderer.ts`/`Game.ts`
- [x] CORR-PHASER-005 — tratar `'white'`/`'black'` explicitamente em `colorToNumber()`
- [x] CORR-PHASER-006 — fundir `getPlayerScreenY`/`getPlayerUpdown` com o comportamento final v3/v4
- [x] CORR-PHASER-007 — remover `addBumps()` duplicado de `RacerEngine`, usar `road.addBumps()`
- [x] CORR-PHASER-008 — remover campos mortos `fps`/`startPosition` de `RacerEngine`
- [x] CORR-PHASER-009 — corrigir reindexação e culling de `Game.renderRoad()`
- [x] CORR-PHASER-010 — usar o nome do frame (string) em `setFrame()`, não o objeto `SpriteRect`
- [x] CORR-PHASER-011 — corrigir razão `cameraDepth/playerZ` (não invertida) em `renderPlayer()`
- [x] CORR-PHASER-012 — mover `addKeys(...)` de `update()` para `create()`
- [x] CORR-PHASER-013 — resetar `segment.clip` entre frames em `getRenderState()`
- [x] CORR-PHASER-014 — marcar checklist da PHASER-TASK-10 (após CORR-PHASER-013 resolvida)
- [x] CORR-PHASER-015 — chamar `getRenderState()` uma única vez por frame em `Game.update()`
- [x] CORR-PHASER-016 — recalcular `playerSegment` pós-movimento e mover colisão de cenário para depois do clamp final
- [x] CORR-PHASER-017 — remover o `else` externo do bloco de cronometragem de volta em `RacerEngine.update()`
- [x] CORR-PHASER-018 — tipar explicitamente `car` (cast para `Car`) em `RacerEngine.ts`/`TrafficRenderer.ts`
- [x] CORR-PHASER-019 — trocar tipo de `Game.music` de `Phaser.Sound.BaseSound` para a união de subtipos concretos
- [x] CORR-PHASER-020 — usuário confirmou que a mistura de commits de upscaling de sprites no
      merge de `master` foi decisão intencional dele; nenhuma ação de código necessária
- [x] CORR-PHASER-021 — marcar `[x]` os 8 itens do Critério de conclusão de
      `21-tweak-ui-controles-basicos.md`
- [x] CORR-PHASER-022 — adicionar script `typecheck` (`tsc --noEmit`) a
      `racer-phaser/package.json`

## Detalhes por correção

### CORR-PHASER-001

- **Alvo com problema:** `docs/migracao-phaser/tasks/01-criar-branch-e-tooling.md`
- **Sintoma:** tarefa `✅ Concluído` em `progresso.md`, com Log de Execução preenchido, mas os 6
  itens de `## Critério de conclusão` continuam todos `[ ]` (não marcados)
- **Fix:** marcar os 6 itens como `[x]` — todos foram verificados verdadeiros nesta revisão
  (branch criada corretamente, `mise current node` resolve, `npm run build`/`npm run dev`
  funcionam, `app/` intocado, nada pendente de commit)

### CORR-PHASER-003

- **Alvo com problema:** `racer-phaser/src/game/racer/RoadRenderer.ts`
- **Sintoma:** `polygon()` passa `number[][]` para `Graphics.fillPoints`, que exige objetos
  `{x, y}` (confirmado com `npx tsc --noEmit`, erro `TS2345`) — rumble/pista/marcadores de faixa
  não são desenhados corretamente, contradizendo o Log de Execução da PHASER-TASK-06
- **Fix:** trocar `[a, b]` por `{ x: a, y: b }` em `polygon()` e em todos os call sites dentro de
  `segment()`; considerar adicionar um script `typecheck` a `racer-phaser/package.json` para
  pegar esse tipo de erro no futuro

### CORR-PHASER-004

- **Alvo com problema:** `racer-phaser/src/game/racer/RoadRenderer.ts`,
  `racer-phaser/src/game/scenes/Game.ts`
- **Sintoma:** `Phaser.Display.Color`/`Phaser.Math.Vector2` usados como valor, mas só existia
  `import type { Scene } from 'phaser'` (some do JS emitido) — `ReferenceError: Phaser is not
  defined` em runtime, confirmado abrindo a `Game` scene num browser real (Playwright)
- **Fix:** adicionar `import * as Phaser from 'phaser'` (import de valor) nos dois arquivos

### CORR-PHASER-005

- **Alvo com problema:** `racer-phaser/src/game/racer/RoadRenderer.ts`
- **Sintoma:** `colorToNumber()` delega para `Phaser.Display.Color.HexStringToColor`, que só
  entende hex — para `'white'`/`'black'` (usados por `COLORS.START`/`FINISH`), retorna
  silenciosamente preto; a linha de largada aparecia preta em vez de branca
- **Fix:** tratar `'white'`/`'black'` explicitamente em `colorToNumber()` antes de delegar

### CORR-PHASER-006

- **Alvo com problema:** `racer-phaser/src/game/racer/RacerEngine.ts`
- **Sintoma:** `getPlayerScreenY()`/`getPlayerUpdown()` retornam `this.height`/`0` (o comportamento
  *base* de `RacerGame`, v1), em vez do override de `RacerGameV3.ts` (herdado por v4) que calcula
  a posição de tela do jogador a partir da altura real do segmento — quebra a câmera relativa ao
  terreno que é central em v3/v4
- **Fix:** substituir os dois métodos pelas fórmulas de `app/src/versions/v3-hills/RacerGameV3.ts:44-55`

### CORR-PHASER-007

- **Alvo com problema:** `racer-phaser/src/game/racer/RacerEngine.ts`
- **Sintoma:** `buildRoad()` chama um `addBumps()` privado duplicado, em vez de
  `this.road.addBumps()` — que `Road.ts` já expõe (mesmo padrão já usado em `Game.ts` na
  PHASER-TASK-07, documentado no Log de Execução daquela tarefa)
- **Fix:** remover o método privado `addBumps()`, chamar `this.road.addBumps()` nos dois pontos

### CORR-PHASER-008

- **Alvo com problema:** `racer-phaser/src/game/racer/RacerEngine.ts`
- **Sintoma:** `npx tsc --noEmit` falha com `TS6133` — campos `private fps`/`private
  startPosition` declarados mas nunca lidos (mascarado por `npm run build`, que não checa tipos)
- **Fix:** remover os dois campos mortos (e a atribuição a `startPosition` em `updateParallax`)

### CORR-PHASER-009

- **Alvo com problema:** `racer-phaser/src/game/scenes/Game.ts`
- **Sintoma:** `renderRoad()` itera `segments[n]` (índice cru) em vez de
  `segments[(baseSegment.index+n)%length]`, e reusa um `state.maxy` **final/estático** (o valor
  depois de `getRenderState()` terminar seu próprio laço interno) para testar o culling de
  **todos** os segmentos — quase tudo é descartado. Confirmado visualmente: a `Game` scene mostra
  só a cor de fundo (céu), nenhuma pista/grama, mesmo segurando a seta para cima por vários
  segundos
- **Fix:** reconstruir o culling incremental em `Game.ts` (usando o mesmo offset de índice e um
  `maxy` que decresce por segmento, ou os dados já filtrados de `getRenderState()`/`segment.clip`)
  — ver as duas opções detalhadas no arquivo da correção

### CORR-PHASER-010

- **Alvo com problema:** `racer-phaser/src/game/scenes/Game.ts`
- **Sintoma:** `setFrame(spriteRect)` recebe o objeto `{x,y,w,h}` em vez do nome do frame
  registrado no Preloader (ex.: `'PLAYER_STRAIGHT'`) — confirmado pelo warning de console
  `Texture "sprites" has no frame "[object Object]"`; o sprite do jogador cai no frame base (a
  folha de sprites inteira)
- **Fix:** guardar o nome do frame (string) separadamente do objeto de coordenadas, passar a
  string para `setFrame()`

### CORR-PHASER-011

- **Alvo com problema:** `racer-phaser/src/game/scenes/Game.ts`
- **Sintoma:** `renderPlayer()` usa `playerZ/cameraDepth` em vez de `cameraDepth/playerZ` (a
  razão do original em `app/src/core/RacerGame.ts`/`Renderer.ts`) — escala do sprite do jogador
  ~1000x maior que o correto
- **Fix:** inverter a razão para `cameraDepth / playerZ`

### CORR-PHASER-012

- **Alvo com problema:** `racer-phaser/src/game/scenes/Game.ts`
- **Sintoma:** `this.input.keyboard.addKeys(...)` chamado dentro de `update()`, recriado a cada
  frame (60x/s) em vez de uma única vez em `create()`; força `as any` para acessar as teclas
- **Fix:** mover `addKeys(...)` para `create()`, guardar o resultado tipado como campo da classe

### CORR-PHASER-013

- **Alvo com problema:** `racer-phaser/src/game/racer/RacerEngine.ts` (`getRenderState()`),
  `racer-phaser/src/game/scenes/Game.ts` (`renderRoad()`)
- **Sintoma:** `segment.clip` só é definido quando um segmento é aceito, nunca limpo quando deixa
  de ser — como os objetos `Segment` são persistentes entre frames, segmentos aceitos uma vez
  continuam "visíveis" para sempre no sinal usado por `renderRoad()`
  (`if (segment.clip === undefined) continue`, introduzido pela `CORR-PHASER-009`). Confirmado
  visualmente: a tela inicial (t=0) renderiza perfeitamente (céu, morros, árvores, pista, carro),
  mas depois de alguns segundos dirigindo a área do céu/fundo fica coberta por formas geométricas
  degeneradas, piorando progressivamente
- **Fix:** resetar `clip` (de toda a pista ou da janela do frame anterior) no início de cada
  `getRenderState()`, ou mudar para uma lista explícita de segmentos visíveis (não depender de
  estado mutável residual em objetos persistentes)

### CORR-PHASER-014

- **Alvo com problema:** `docs/migracao-phaser/tasks/10-parallax-tilesprite.md`
- **Sintoma:** tarefa `✅ Concluído`, mas os 5 itens de `## Critério de conclusão` continuam
  todos `[ ]` (mesmo padrão da `CORR-PHASER-001`)
- **Fix:** marcar os itens — mas só depois de `CORR-PHASER-013` resolvida e revalidada
  visualmente, já que o item de validação visual não pode ser marcado como verdadeiro hoje

### CORR-PHASER-015

- **Alvo com problema:** `racer-phaser/src/game/scenes/Game.ts`
- **Sintoma:** `renderParallax()`, `renderRoad()`, `renderScenery()` e `renderPlayer()` cada um
  chama `this.racerEngine.getRenderState()` de forma independente — 4 chamadas por frame que
  recomputam o mesmo resultado (o estado do jogo não muda entre elas), incluindo o reset de
  `clip` de toda a pista (milhares de segmentos) 4x
- **Fix:** chamar `getRenderState()` uma vez em `update()`, passar o resultado como parâmetro
  para os quatro métodos

### CORR-PHASER-016

- **Alvo com problema:** `racer-phaser/src/game/racer/RacerEngine.ts` (`update()`)
- **Sintoma:** dois problemas no bloco de colisão jogador↔sprite de cenário (PHASER-TASK-12):
  (1) reaproveita o `playerSegment` calculado no topo de `update()` (posição **antes** de
  avançar), em vez de recalculá-lo com a posição já atualizada, como o `updateExtras()` original
  faz; (2) roda **antes** do clamp final de `playerX`/`speed`, não depois, como no original
- **Fix:** recalcular `playerSegment` a partir de `this.position` já atualizado, e mover o bloco
  de colisão para depois de `Util.limit(playerX, ...)`/`Util.limit(speed, ...)`

### CORR-PHASER-017

- **Alvo com problema:** `racer-phaser/src/game/racer/RacerEngine.ts` (`update()`, bloco de
  cronometragem de volta, PHASER-TASK-15)
- **Sintoma:** o bloco de lap-timing adicionou um `else { this.currentLapTime += dt }` no nível
  externo do `if (this.position > this.playerZ)` que não existe em
  `RacerGameV4.updateExtras()` — o original deixa `currentLapTime` congelado enquanto
  `position <= playerZ` (a janela logo após cruzar a linha de largada/chegada, ~4 frames em
  velocidade máxima). O `racer-phaser` soma `dt` nessa janela também, inflando o `lastLapTime`
  registrado (e o recorde salvo) a cada volta
- **Fix:** remover o `else` externo, mantendo só a estrutura `if (position > playerZ) { if
  (currentLapTime && startPosition < playerZ) {...} else { currentLapTime += dt } }` idêntica
  ao original

### CORR-PHASER-018

- **Alvo com problema:** `racer-phaser/src/game/racer/RacerEngine.ts` (bloco de colisão
  jogador↔carro, PHASER-TASK-14), `racer-phaser/src/game/racer/TrafficRenderer.ts` (`draw()`,
  PHASER-TASK-14)
- **Sintoma:** `npx tsc --noEmit` falha com `TS18046`/`TS2322`/`TS6133` — `segment.cars`/
  `collisionSegment.cars` é `unknown[]`, e o código itera `for (const car of ...)` sem o cast
  `as Car` (padrão já usado em `TrafficManager.ts`), acessando `.sprite`/`.speed`/`.offset`/`.z`
  em um valor `unknown`. `npm run build` não pega o erro por usar esbuild (sem type-check) —
  mesma lacuna já registrada em `CORR-PHASER-003`
- **Fix:** aplicar `const car = (elemento) as Car` nos dois pontos; revisar o parâmetro `offsetX`
  não lido em `TrafficRenderer.drawOne`

### CORR-PHASER-019

- **Alvo com problema:** `racer-phaser/src/game/scenes/Game.ts` (PHASER-TASK-16)
- **Sintoma:** `npx tsc --noEmit` falha com `TS2339` (3 ocorrências) — campo `private music!:
  Phaser.Sound.BaseSound` é anotado com a classe abstrata, que não declara `mute`/`setMute`
  (só as subclasses concretas `HTML5AudioSound`/`WebAudioSound`/`NoAudioSound` declaram esses
  membros, e é exatamente o que `this.sound.add(...)` retorna). `npm run build` não pega o erro
  por usar esbuild (sem type-check) — mesma lacuna de `CORR-PHASER-003`/`CORR-PHASER-018`
- **Fix:** trocar a anotação do campo para `Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound
  | Phaser.Sound.WebAudioSound` (ou remover a anotação e deixar inferir da atribuição)

### CORR-PHASER-020

- **Alvo com problema (achado inicial da revisão):** `master`, commit de merge `1d155b2` (feito
  pela PHASER-TASK-20) — trouxe junto 4 commits sem relação com a migração Phaser (`3728efc`,
  `af20973`, `4f768ae`, `70a65bd` — ferramental de upscaling de sprites em `scripts/`,
  `resources/`, `docs/sprites/`, mais uma entrada no `.gitignore` raiz)
- **Sintoma reportado:** o checklist pré-merge da PHASER-TASK-20 só verifica `git diff ... --
  app/`, não pegaria esse tipo de mistura de qualquer forma
- **Resolução:** usuário confirmou explicitamente que decidiu mergear esse conteúdo junto —
  **não é um vazamento acidental**. Reclassificado de Crítica para Não é discrepância. Nenhum fix
  de código aplicado; ver `CORR-PHASER-020.md` para o registro completo

### CORR-PHASER-021

- **Alvo com problema:** `docs/migracao-phaser/tasks/21-tweak-ui-controles-basicos.md`
- **Sintoma:** tarefa `✅ Concluído` em `progresso.md`, com Log de Execução detalhado, mas os 8
  itens de `## Critério de conclusão` continuam todos `[ ]` (mesmo padrão de
  `CORR-PHASER-001`/`CORR-PHASER-014`)
- **Fix:** marcar os 8 itens como `[x]` — 6 deles reverificados nesta revisão lendo
  `RacerEngine.applyOptions`/`TweakUi.ts`/`Game.ts` diretamente e rodando `tsc --noEmit`/
  `npm run build`; os outros 2 (validação manual item-a-item, e a forma literal do comando
  `npm run typecheck`) dependem do Log de Execução/confirmação do usuário e de
  `CORR-PHASER-022`

### CORR-PHASER-022

- **Alvo com problema:** `racer-phaser/package.json`
- **Sintoma:** a PHASER-TASK-21 exige `mise exec -- npm run typecheck` no Critério de conclusão,
  mas esse script não existe (só `dev`/`build`/`dev-nolog`/`build-nolog`) — a sugestão de
  adicioná-lo já apareceu em `CORR-PHASER-003`, `CORR-PHASER-018` e `CORR-PHASER-019`, sem nunca
  ser aplicada
- **Fix:** adicionar `"typecheck": "tsc --noEmit"` aos scripts de `racer-phaser/package.json`
