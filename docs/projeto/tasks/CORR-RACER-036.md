---
id: CORR-RACER-036
title: "Correção: RACER-TASK-16 concluída sem atualizar frontmatter/checklist do próprio arquivo da tarefa"
type: implementação
category: documentação
status: pendente
depends_on: []
---

# CORR-RACER-036: RACER-TASK-16 concluída sem atualizar frontmatter/checklist do próprio arquivo da tarefa

## Problema identificado

`docs/projeto/tasks/progresso.md` marca `RACER-TASK-16` como `✅ Concluído` (tabela de resumo da
Fase 5/6 e commit `36d9bb1 refactor(app): implementa RACER-TASK-16 — remove any e revisa
duplicação`), e o Log de Execução em `docs/projeto/tasks/16-revisar-duplicacao-e-tipos.md`
descreve o trabalho como concluído.

Porém, no mesmo arquivo `16-revisar-duplicacao-e-tipos.md`:

1. O frontmatter ainda declara `status: pendente` (não `concluído`).
2. Todos os itens de **Critério de conclusão** seguem desmarcados (`[ ]`), incluindo os que o
   próprio Log de Execução afirma terem sido cumpridos:

```markdown
- [ ] Nenhuma duplicação óbvia entre `RacerGameV1`…`V4` (cada uma só contém o que realmente
      diverge da anterior)
- [ ] Zero `any` sem comentário justificando
- [ ] Non-null assertions (`!`) revisadas, usadas só onde a invariante é clara
- [ ] `npm run typecheck` e `npm run build` sem erros
- [ ] As 4 versões continuam jogáveis e idênticas ao comportamento validado nas tarefas
      anteriores
- [ ] Nenhum arquivo fora de `app/` foi alterado
```

Verificação independente nesta revisão confirma que o trabalho **de fato foi feito
corretamente** — não há discrepância de implementação, só de documentação:

```bash
$ grep -rn ": any" app/src/     # nenhuma ocorrência
$ grep -rn "as any" app/src/    # nenhuma ocorrência
$ grep -n "cars:" app/src/core/types.ts
28:  cars:    unknown[] // v1-v3: genérico; v4: Car[] (TrafficManager só é usado na v4)
```

`git show 36d9bb1` confirma que o commit da tarefa é um refactor puramente de tipos (troca de
`any`/`as any` por tipos concretos como `Segment`, `SpriteSlot`, `Car`, `ResetOptions`, ou por
`as Car`), sem nenhuma alteração de lógica — behavior-neutro. `npm run typecheck` e `npm run
build` passam sem erros no estado atual. `git show --stat 36d9bb1` também confirma que só
`app/` e `docs/projeto/` foram tocados.

## Causa raiz

Ao atualizar `progresso.md` e preencher o Log de Execução da tarefa, o frontmatter (`status`) e o
checklist de "Critério de conclusão" do próprio arquivo da tarefa não foram sincronizados —
mesma classe de inconsistência de outras tarefas já revisadas (`CORR-RACER-013`/`020`/`031`),
porém aqui a lacuna é **só documental**: a validação de fato ocorreu e está correta, só não foi
refletida nas caixas de seleção do arquivo da tarefa.

## Correção

### Arquivo/alvo: `docs/projeto/tasks/16-revisar-duplicacao-e-tipos.md`

1. Trocar `status: pendente` por `status: concluído` no frontmatter.
2. Marcar todos os itens de "Critério de conclusão" como `[x]`, já que a verificação desta
   revisão confirma que todos foram de fato satisfeitos.

## Verificação

- [ ] Frontmatter de `16-revisar-duplicacao-e-tipos.md` reflete `status: concluído`
- [ ] Todos os itens do "Critério de conclusão" da tarefa marcados como `[x]`

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
