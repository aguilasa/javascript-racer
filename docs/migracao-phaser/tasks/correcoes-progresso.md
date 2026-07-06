# Progresso de Correções — Migração para Phaser

## Resumo executivo

| ID | Título | Criticidade | Status |
| --- | --- | --- | --- |
| CORR-PHASER-001 | Checklist de Critério de conclusão da PHASER-TASK-01 não marcado | Baixa | [x] concluído |
| CORR-PHASER-002 | Colisão de chave de textura 'background' no Preloader impede carregamento real de background.png | Alta | [x] concluído |
| CORR-PHASER-003 | RoadRenderer.polygon() passa number[][] para fillPoints, que exige objetos {x,y} — trapézios não desenhados corretamente | Alta | [x] concluído |
| CORR-PHASER-004 | RoadRenderer/Game usam Phaser.* como global sem importá-lo como valor — ReferenceError em runtime | Alta | [x] concluído |
| CORR-PHASER-005 | RoadRenderer.colorToNumber() não entende nomes CSS ('white'/'black') — linha de largada renderiza preta | Alta | [x] concluído |

## Checklist

- [x] CORR-PHASER-001 — marcar `[x]` no Critério de conclusão de `01-criar-branch-e-tooling.md`
- [x] CORR-PHASER-002 — renomear a chave de textura da folha de parallax no `Preloader` para não colidir com `'background'`
- [x] CORR-PHASER-003 — corrigir `RoadRenderer.polygon()` para passar `{x,y}` em vez de `[x,y]` para `fillPoints`
- [x] CORR-PHASER-004 — adicionar `import * as Phaser from 'phaser'` em `RoadRenderer.ts`/`Game.ts`
- [x] CORR-PHASER-005 — tratar `'white'`/`'black'` explicitamente em `colorToNumber()`

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
