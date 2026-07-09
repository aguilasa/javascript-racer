---
id: CORR-PHASER-021
title: "Correção: checklist de Critério de conclusão da PHASER-TASK-21 não marcado"
type: implementação
category: documentação
status: pendente
depends_on: []
---

# CORR-PHASER-021: checklist de Critério de conclusão da PHASER-TASK-21 não marcado

## Problema identificado

`docs/migracao-phaser/tasks/21-tweak-ui-controles-basicos.md` está com `status: concluído` no
frontmatter, `progresso.md` marca a PHASER-TASK-21 como `✅ Concluído`, e o "Log de Execução" do
próprio arquivo documenta em detalhe o que foi implementado, incluindo verificação automatizada
(`npx tsc --noEmit` → 0 erros, `npm run build-nolog` → limpo) e validação manual "confirmada pelo
usuário (2026-07-09)". Mesmo assim, os 8 itens de `## Critério de conclusão` continuam todos
`[ ]` (não marcados):

```markdown
- [ ] `RacerEngine.applyOptions(options)` implementado, sem chamar `buildRoad()`
- [ ] `TweakUi` criado como game objects Phaser (não HTML), ancorado no canto superior direito,
      recolhido por padrão
- [ ] Os 6 controles básicos funcionando (5 deslizantes + `lanes` como anterior/próximo), cada um
      ligado a `racerEngine.applyOptions(...)`
- [ ] Botão de mute realocado para dentro do painel, sem perder funcionalidade
- [ ] Painel nasce refletindo os valores atuais do `RacerEngine` (sem passo de sincronização
      manual)
- [ ] Cada um dos 6 controles testado manualmente, efeito visível ao vivo, sem erros no console
- [ ] `mise exec -- npm run typecheck` e `npm run build` sem erros
- [ ] Commit em `master` (ou branch de trabalho, a critério do usuário — migração já está em
      `master`, sem branch `feature/*` ativa no momento desta tarefa)
```

Mesmo padrão já registrado em `CORR-PHASER-001` (PHASER-TASK-01) e `CORR-PHASER-014`
(PHASER-TASK-10) — a tarefa é concluída de fato, mas o checklist local não acompanha.

Nesta revisão, confirmei diretamente no código (não só no Log de Execução) que os itens 1-5, 7 e 8
são verdadeiros:
- `RacerEngine.applyOptions()` (`racer-phaser/src/game/racer/RacerEngine.ts:252-262`) atualiza só
  os campos presentes em `options`, recomputa `cameraDepth`/`playerZ`, e não chama `buildRoad()`.
- `TweakUi` (`racer-phaser/src/game/racer/TweakUi.ts`) é construído só com
  `Phaser.GameObjects.Container`/`Rectangle`/`Text`, ancorado em
  `scale.width - PANEL_WIDTH - PANEL_X_RIGHT_MARGIN, PANEL_Y_TOP_MARGIN`, e nasce recolhido
  (`setRowsVisible(false)` no fim do construtor).
- Os 6 controles (1 stepper de `lanes` + 5 sliders de `roadWidth`/`cameraHeight`/`drawDistance`/
  `fieldOfView`/`fogDensity`, com os mesmos ranges de `v4.final.html:44-63`) chamam
  `engine.applyOptions(...)` nos handlers `pointerdown`/`drag`.
- O botão de mute foi movido para dentro do cabeçalho do painel (`TweakUi.ts:61-65`,
  `handleMute()`); `Game.ts` não tem mais um `muteText` solto (confirmado por `grep`).
- Cada controle já nasce lendo o valor atual do `engine` (`engine.lanes`/`(engine as
  any)[cfg.key]`) — sem passo de sincronização manual.
- `npx tsc --noEmit` e `npm run build` rodados nesta revisão (código atual em `master`) — ambos
  sem erros.
- Commit `3271e72` está em `master` (confirmado por `git log`).

O item 6 (validação manual de cada um dos 6 controles) e o item 7 na forma literal
(`npm run typecheck`, ver `CORR-PHASER-022`) não puderam ser reverificados via código nesta
revisão — dependem de confiar no Log de Execução/na confirmação do usuário.

## Causa raiz

O fluxo de execução (`prompts/01-executar.md`) não tem um passo explícito de "marcar cada item do
Critério de conclusão individualmente" — só "atualizar o status da tarefa" — então o checklist
local é preenchido de forma inconsistente entre tarefas (compare com `18-performance-pool.md`/
`19-paridade-e-docs.md`, que marcam `[x]`).

## Correção

### Arquivo/alvo: `docs/migracao-phaser/tasks/21-tweak-ui-controles-basicos.md`

Marcar os 8 itens de `## Critério de conclusão` como `[x]`, já que todos foram verificados
verdadeiros nesta revisão (itens 1-5, 7, 8 via leitura de código/comandos; item 6 e a forma
literal do item 7 via confiança no Log de Execução/confirmação do usuário — ver
`CORR-PHASER-022` para a ressalva sobre o script `typecheck`).

## Verificação

- [x] Os 8 itens de `## Critério de conclusão` em `21-tweak-ui-controles-basicos.md` marcados
      `[x]`

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-09

**Resumo do que foi feito:** Marcados `[x]` os 8 itens de `## Critério de conclusão` em
`21-tweak-ui-controles-basicos.md` — ver commit `35c0910`.

**Problemas encontrados:** Nenhum.

**Arquivos criados/modificados:**
- Modificado: `docs/migracao-phaser/tasks/21-tweak-ui-controles-basicos.md` (checklist marcado)
- Modificado: `docs/migracao-phaser/tasks/correcoes-progresso.md` (status CORR-PHASER-021
  marcado como `[x]` concluído)
