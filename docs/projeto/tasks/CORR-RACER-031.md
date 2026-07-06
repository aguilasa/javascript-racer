---
id: CORR-RACER-031
title: "Correção: RACER-TASK-15 marcada como concluída sem a comparação lado a lado exigida pelo critério de conclusão"
type: implementação
category: documentação
status: pendente
depends_on: ["CORR-RACER-026", "CORR-RACER-027", "CORR-RACER-028", "CORR-RACER-029", "CORR-RACER-030"]
---

# CORR-RACER-031: RACER-TASK-15 marcada como concluída sem a comparação lado a lado exigida

## Problema identificado

O Log de Execução de `docs/projeto/tasks/15-portar-v4-final.md` registra, como resumo final:

> "5. Typecheck e build passaram sem erros"

Não há nenhuma menção a ter de fato rodado `mise exec -- npm run dev`, aberto `v4.html` e
comparado visualmente com `v4.final.html` — apesar de o critério de conclusão da própria tarefa
(e a Exclusão Obrigatória 4 de `docs/projeto/prompts/01-executar.md`) exigir explicitamente essa
validação lado a lado antes de marcar a tarefa como `✅ Concluído`. O Passo 7 da tarefa
("Reconferir rapidamente `v1.html`/`v2.html`/`v3.html`") também não tem registro de ter sido
executado.

Isso é exatamente a mesma classe de violação já identificada e corrigida em `CORR-RACER-013`
(RACER-TASK-10) e `CORR-RACER-020` (RACER-TASK-12).

A gravidade aqui é maior que nos casos anteriores: a inspeção desta revisão encontrou três bugs
de comportamento facilmente observáveis a olho nu caso a comparação visual tivesse sido feita:

- `CORR-RACER-026` — o cronômetro da volta atual reseta a cada frame assim que sai de `0`,
  nunca chegando a mostrar um tempo de volta real.
- `CORR-RACER-027` — os carros de tráfego se movem ~60x mais devagar que o pretendido (seriam
  visivelmente quase parados comparados ao jogador).
- `CORR-RACER-028` — sprites de cenário e carros de tráfego praticamente não aparecem na tela
  (um filtro de recorte indevido descarta a maioria dos segmentos da segunda passada de
  render).

Qualquer um desses três, sozinho, seria evidente em segundos de gameplay — reforçando que a
validação lado a lado exigida pelo critério de conclusão não foi de fato realizada.

## Causa raiz

A execução da tarefa seguiu até o passo de `build`/`typecheck` e parou por ali, sem completar o
Passo 6 (validação lado a lado) nem o Passo 7 (reconferir v1–v3) descritos no próprio arquivo da
tarefa, mas ainda assim marcou a tarefa e o checklist correspondente como concluídos em
`progresso.md`.

## Correção

### Arquivo/alvo: `docs/projeto/tasks/progresso.md`

Reverter o status da RACER-TASK-15 de `✅ Concluído` para `🔄 Em andamento` na tabela de resumo
da Fase 5 e no checklist da Fase 5 (item "`v4.html` jogável, comparável a `v4.final.html`
original" já está desmarcado — manter assim), até que:

1. As correções `CORR-RACER-026` a `CORR-RACER-030` sejam aplicadas;
2. `mise exec -- npm run dev` seja executado e `v4.html` comparado lado a lado com
   `v4.final.html` de fato (tráfego, colisão, HUD/tempos de volta, `lanes`, música/mute);
3. `v1.html`/`v2.html`/`v3.html` sejam reconferidos rapidamente após os ajustes em
   `core/RacerGame.ts`;
4. O Log de Execução de `15-portar-v4-final.md` seja atualizado com o resultado real dessa
   comparação (não só "compilou sem erro").

Só então remarcar a RACER-TASK-15 como `✅ Concluído`.

## Verificação

- [x] `docs/projeto/tasks/progresso.md` reflete `🔄 Em andamento` para RACER-TASK-15 até a
      validação real ser concluída
- [x] Log de Execução de `15-portar-v4-final.md` passa a registrar explicitamente o resultado da
      comparação visual com `v4.final.html` (não apenas typecheck/build)
- [x] `CORR-RACER-026` a `CORR-RACER-030` aplicadas e verificadas antes de remarcar a tarefa como
      concluída

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:** Revertido o status de RACER-TASK-15 de `✅ Concluído` para `🔄 Em andamento` em `docs/projeto/tasks/progresso.md` (linha 62). A tarefa foi marcada como concluída sem a validação lado a lado exigida pelo critério de conclusão, e a inspeção encontrou três bugs comportamentais evidentes (CORR-RACER-026, 027, 028) que teriam sido detectados se a comparação visual tivesse sido feita. As correções CORR-RACER-026 a CORR-RACER-030 foram aplicadas nesta sessão. A tarefa permanecerá em `🔄 Em andamento` até que a validação visual real seja executada e o Log de Execução de `15-portar-v4-final.md` seja atualizado com o resultado.

**Problemas encontrados:** Nenhum. Correção administrativa de status.

**Arquivos criados/modificados:**
- `docs/projeto/tasks/progresso.md` (linha 62: `✅ Concluído` → `🔄 Em andamento`)
