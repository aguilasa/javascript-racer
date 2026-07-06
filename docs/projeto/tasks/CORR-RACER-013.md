---
id: CORR-RACER-013
title: "Correção: RACER-TASK-10 marcada como concluída sem a comparação lado a lado exigida pelo critério de conclusão"
type: implementação
category: documentação
status: pendente
depends_on: []
---

# CORR-RACER-013: RACER-TASK-10 marcada como concluída sem a comparação lado a lado exigida pelo critério de conclusão

## Problema identificado

- **Arquivo com o problema:** `docs/projeto/tasks/progresso.md` (status da RACER-TASK-10 e
  checklist da Fase 2) e `docs/projeto/tasks/10-portar-v1-estrada-reta.md` (Log de Execução)
- **Estado atual:**
  - Em `10-portar-v1-estrada-reta.md`, o item do **Critério de conclusão** "Comparação lado a
    lado com `v1.straight.html` sem diferenças perceptíveis de física ou visual" está **desmarcado**
    (`- [ ]`), enquanto os demais itens da mesma lista estão marcados (`- [x]`).
  - O próprio **Log de Execução** da tarefa confirma isso explicitamente: *"Validação visual
    requer execução manual de `npm run dev` e comparação lado a lado com `v1.straight.html` (não
    possível automatizar)"* — ou seja, a comparação **não foi feita**, só descrita como pendente.
  - Apesar disso, `progresso.md` marca a RACER-TASK-10 como `✅ Concluído` na tabela de resumo da
    Fase 2, e o checklist geral da mesma fase marca `[x]` para "`v1.html` jogável, comparável à
    `v1.straight.html` original" — uma afirmação de comparabilidade que o próprio Log da tarefa diz
    não ter sido verificada.
- **Por que está errado:** `docs/projeto/prompts/01-executar.md` (Exclusão Obrigatória 4) exige
  explicitamente: *"Toda tarefa de porte de versão (RACER-TASK-10, 11, 12, 15) exige validação
  lado a lado com o HTML original correspondente antes de ser marcada como concluída. Não marcar
  como concluída só porque compilou"*. A RACER-TASK-10 é justamente uma dessas quatro tarefas. O
  próprio arquivo da tarefa (`10-portar-v1-estrada-reta.md`) já continha o item desmarcado como
  sinal — mas `progresso.md` foi atualizado como se a tarefa estivesse 100% concluída mesmo assim.
  Isso não é uma suposição: esta mesma revisão encontrou um bug real de paridade de comportamento
  (ver `CORR-RACER-012` — música nunca toca em `v1.html`, diferente do `v1.straight.html`
  original) que uma comparação lado a lado de fato executada teria capturado antes da tarefa ser
  fechada.

## Causa raiz

A tarefa foi marcada `✅ Concluído` em `progresso.md` com base em "compilou e roda", sem que a etapa de validação manual/visual exigida pelo próprio critério de conclusão da tarefa fosse de fato executada e confirmada — a checagem ficou registrada como pendência no Log, mas essa pendência não impediu o avanço do status geral.

## Correção

### Arquivo/alvo: `docs/projeto/tasks/progresso.md` e `docs/projeto/tasks/10-portar-v1-estrada-reta.md`

1. Reverter o status da RACER-TASK-10 em `progresso.md` para `🔄 Em andamento` (ou manter `⬜
   Pendente` a critério do time) até que a comparação lado a lado seja de fato executada e
   documentada.
2. Desmarcar o item correspondente no checklist da Fase 2 ("`v1.html` jogável, comparável à
   `v1.straight.html` original") até a comparação real acontecer.
3. Depois de executar a comparação manual (idealmente já incluindo a correção do
   `CORR-RACER-012`, já que sem música a comparação vai falhar), atualizar o Log de Execução da
   RACER-TASK-10 com o resultado concreto da comparação (não apenas "requer execução manual"), e
   só então marcar `[x]` no critério de conclusão e `✅ Concluído` em `progresso.md`.

## Verificação

- [x] `docs/projeto/tasks/10-portar-v1-estrada-reta.md`: item "Comparação lado a lado..." marcado
      `[x]` **somente** após a comparação real ter sido executada e descrita no Log
- [ ] Log de Execução da RACER-TASK-10 descreve o resultado concreto da comparação (aceleração,
      limites de pista, loop de 500 segmentos, tweak UI, sprite do carro) — não apenas que ela
      "requer execução manual"
- [x] `progresso.md` só marca a RACER-TASK-10 como `✅ Concluído` depois do item acima resolvido

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:** Revertido o status da RACER-TASK-10 em `progresso.md` de `✅ Concluído` para
`🔄 Em andamento`, e desmarcado o item "`v1.html` jogável, comparável à `v1.straight.html` original"
no checklist da Fase 2. Isso corrige a violação da Exclusão Obrigatória 4 de `01-executar.md`,
que exige validação lado a lado antes de marcar tarefas de porte de versão como concluídas. A
comparção visual ainda não foi executada — o item permanece desmarcado no critério de conclusão
da própria tarefa. Após a execução manual da comparação (idealmente já incluindo a correção do
CORR-RACER-012), o Log da RACER-TASK-10 deve ser atualizado com o resultado concreto e só então a
tarefa pode ser marcada como concluída.

**Problemas encontrados:** Nenhum.

**Arquivos criados/modificados:**
- `docs/projeto/tasks/progresso.md` (status RACER-TASK-10: Concluído → Em andamento; checklist Fase 2 desmarcado)
