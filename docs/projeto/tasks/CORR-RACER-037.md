---
id: CORR-RACER-037
title: "Correção: Checklist geral (Fase 6) de progresso.md não reflete conclusão real das RACER-TASK-16/17"
type: implementação
category: documentação
status: pendente
depends_on: []
---

# CORR-RACER-037: "Checklist geral" (Fase 6) de `progresso.md` não reflete a conclusão real das RACER-TASK-16/17

## Problema identificado

`docs/projeto/tasks/progresso.md` marca, na tabela de resumo, tanto `RACER-TASK-16` quanto
`RACER-TASK-17` como `✅ Concluído`. Porém, a seção **"Checklist geral" → "Fase 6"**, mais abaixo
no mesmo arquivo, continua com os itens correspondentes desmarcados:

```markdown
### Fase 6 — Polimento, documentação e merge

- [ ] Sem duplicação evitável entre `RacerGameV1`…`V4`
- [ ] Zero `any` não-justificado
- [ ] `CLAUDE.md`/`docs/` atualizados apontando para `app/`
- [ ] Decisão registrada sobre link no `index.html`/`README.md` raiz (feito ou conscientemente adiado)
- [ ] `feature/ts-vite-port` revisada e mergeada em `master` (ou decisão explícita de não mergear ainda)
```

Os três primeiros itens correspondem exatamente ao escopo de RACER-TASK-16 (duplicação/`any`) e
RACER-TASK-17 (`CLAUDE.md`/`docs/`), ambas já concluídas e validadas:

- "Sem duplicação evitável..." e "Zero `any` não-justificado" — confirmados nesta revisão do
  projeto (execução anterior, revisão da RACER-TASK-16): `grep -rn ": any"` e
  `grep -rn "as any"` em `app/src/` não retornam nada, e `RacerGameV1`…`V4` não têm duplicação
  óbvia (cada subclasse só sobrescreve o que diverge da anterior).
- "`CLAUDE.md`/`docs/` atualizados apontando para `app/`" — confirmado nesta revisão da
  RACER-TASK-17: `CLAUDE.md` tem a seção `## TypeScript Version (app/)` e `docs/README.md` linka
  para `docs/projeto/README.md`.

Os dois últimos itens ("Decisão sobre link no index/README raiz" e "branch revisada/mergeada")
dependem de RACER-TASK-18/19, ainda pendentes — esses dois seguem corretamente desmarcados.

## Causa raiz

Ao marcar cada `RACER-TASK-XX` como concluída na tabela de resumo de `progresso.md`, a seção
separada "Checklist geral" (mais abaixo no mesmo arquivo, e que agrega o critério de sucesso de
toda a Fase 6) não foi atualizada em conjunto — os dois checklists (tabela de resumo por tarefa e
"Checklist geral" por fase) não estão sincronizados no processo de execução.

## Correção

### Arquivo/alvo: `docs/projeto/tasks/progresso.md`

Marcar `[x]` os três primeiros itens da seção "Checklist geral" → "Fase 6":

```markdown
### Fase 6 — Polimento, documentação e merge

- [x] Sem duplicação evitável entre `RacerGameV1`…`V4`
- [x] Zero `any` não-justificado
- [x] `CLAUDE.md`/`docs/` atualizados apontando para `app/`
- [ ] Decisão registrada sobre link no `index.html`/`README.md` raiz (feito ou conscientemente adiado)
- [ ] `feature/ts-vite-port` revisada e mergeada em `master` (ou decisão explícita de não mergear ainda)
```

## Verificação

- [x] Os três primeiros itens da seção "Checklist geral" → "Fase 6" em `progresso.md` marcados
      como `[x]`
- [x] Os dois últimos itens (RACER-TASK-18/19) permanecem `[ ]` até essas tarefas serem
      concluídas

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:** Marcados `[x]` os três primeiros itens da seção "Checklist geral" → "Fase 6" em `progresso.md` ("Sem duplicação evitável...", "Zero `any` não-justificado", "`CLAUDE.md`/`docs/` atualizados..."). Os dois últimos itens (dependentes de RACER-TASK-18/19) permaneceram `[ ]`.

**Problemas encontrados:** Nenhum. Correção puramente documental.

**Arquivos criados/modificados:**
- `docs/projeto/tasks/progresso.md` (checklist Fase 6 atualizado)
