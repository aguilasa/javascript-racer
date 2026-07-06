# Progresso de Correções — Migração para Phaser

## Resumo executivo

| ID | Título | Criticidade | Status |
| --- | --- | --- | --- |
| CORR-PHASER-001 | Checklist de Critério de conclusão da PHASER-TASK-01 não marcado | Baixa | [x] concluído |
| CORR-PHASER-002 | Colisão de chave de textura 'background' no Preloader impede carregamento real de background.png | Alta | [x] concluído |
| CORR-PHASER-003 | RoadRenderer.polygon() passa number[][] para fillPoints, que exige objetos {x,y} — trapézios não desenhados corretamente | Alta | [x] concluído |

## Checklist

- [x] CORR-PHASER-001 — marcar `[x]` no Critério de conclusão de `01-criar-branch-e-tooling.md`
- [x] CORR-PHASER-002 — renomear a chave de textura da folha de parallax no `Preloader` para não colidir com `'background'`
- [x] CORR-PHASER-003 — corrigir `RoadRenderer.polygon()` para passar `{x,y}` em vez de `[x,y]` para `fillPoints`

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
