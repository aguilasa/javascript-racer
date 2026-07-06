---
id: RACER-TASK-19
title: "Revisar e mergear feature/ts-vite-port em master"
type: infraestrutura
category: git
phase: 6
depends_on: ["RACER-TASK-17"]
status: pendente
requires_human: true
---

# RACER-TASK-19: Revisar e mergear `feature/ts-vite-port` em `master`

## ⚠️ Requer interação humana

Esta tarefa integra semanas de trabalho novo (todo o projeto `app/`) na branch principal do
repositório. Antes do merge, um humano precisa **revisar e aprovar explicitamente** o estado
final da migração — não basta todas as tarefas técnicas estarem `✅` em `progresso.md`.

**Se um agente/prompt chegar nesta tarefa:** não fazer merge, nem push para `master`/remoto,
sem confirmação humana explícita. Reportar que esta tarefa está aguardando aprovação e parar
(é, em geral, a última tarefa da lista — não há para onde "pular" depois dela, exceto a
RACER-TASK-18 se ainda estiver pendente e não depender desta).

## Contexto

- Ver `docs/projeto/tasks/progresso.md`, seção "Branch de trabalho".
- Todas as RACER-TASK-01 a 17 foram commitadas em `feature/ts-vite-port`. `master` nunca foi
  tocado por nenhuma delas.

## Objetivo

1. Confirmar que os critérios de sucesso do plano (`docs/projeto/00-visao-geral.md`,
   "Critérios de sucesso") estão todos satisfeitos.
2. Obter aprovação humana explícita para o merge.
3. Mergear `feature/ts-vite-port` em `master`.

## Passos

### 1) Checklist pré-merge

Confirmar, revisitando `docs/projeto/tasks/progresso.md`:
- [ ] RACER-TASK-01 a 17 todas `✅ Concluído`
- [ ] `npm run build` e `npm run typecheck` sem erros na branch
- [ ] As 4 versões (`v1.html`…`v4.html`) validadas contra os originais em algum momento da
      migração (ver Logs de Execução das RACER-TASK-10, 11, 12, 15)
- [ ] Nenhum arquivo fora de `app/` (e `docs/projeto/`) foi alterado em nenhuma das tarefas —
      conferir com:
      ```bash
      git diff master...feature/ts-vite-port --stat -- . ':!app' ':!docs/projeto'
      ```
      (deve retornar vazio, ou só as mudanças da RACER-TASK-17 em `CLAUDE.md`/`docs/README.md`)

### 2) Aprovação humana

Apresentar o resumo acima e **aguardar confirmação explícita** antes de prosseguir.

### 3) Merge (só após aprovação)

```bash
cd /home/ingmar/WebstormProjects/javascript-racer
git checkout master
git merge --no-ff feature/ts-vite-port -m "feat(app): adiciona port TypeScript/Vite do jogo (v1-v4)"
```

### 4) Validar pós-merge

```bash
cd app
npm install
npm run build
npm run typecheck
```

## Critério de conclusão

- [ ] Checklist pré-merge conferido
- [ ] Aprovação humana obtida e registrada no Log de Execução
- [ ] Merge feito em `master` (`--no-ff`, preservando o histórico da branch)
- [ ] `npm run build`/`typecheck` sem erros em `master` pós-merge
- [ ] `feature/ts-vite-port` mantida (não deletar a branch nesta tarefa, a menos que aprovado
      explicitamente também)

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
