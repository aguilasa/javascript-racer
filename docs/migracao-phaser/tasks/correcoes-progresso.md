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
