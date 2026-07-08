---
id: PHASER-TASK-20
title: "Revisar e mergear feature/phaser-port em master"
type: infraestrutura
category: git
phase: 9
depends_on: ["PHASER-TASK-19"]
status: pendente
requires_human: true
---

# PHASER-TASK-20: Revisar e mergear `feature/phaser-port` em `master`

## ⚠️ Requer interação humana

Esta tarefa integra todo o novo projeto `racer-phaser/` jogável na branch principal do
repositório. Antes do merge, um humano precisa **revisar e aprovar explicitamente** o estado
final da migração — não basta todas as tarefas técnicas estarem `✅` em `progresso.md`.

**Se um agente/prompt chegar nesta tarefa:** não fazer merge, nem push para `master`/remoto, sem
confirmação humana explícita. Reportar que esta tarefa está aguardando aprovação e parar.

## Contexto

- Ver `docs/migracao-phaser/tasks/progresso.md`, seção "Branch de trabalho".
- Todas as PHASER-TASK-01 a 19 foram commitadas em `feature/phaser-port`. `master` nunca foi
  tocado por nenhuma delas.
- Nota: `feature/phaser-port` foi criada a partir de `feature/ts-vite-port` (que também não está
  mergeada em `master` ainda, ver `docs/projeto/tasks/progresso.md`, RACER-TASK-19). Confirmar,
  antes do merge desta tarefa, qual é a ordem/relação desejada entre os dois merges pendentes
  (`feature/ts-vite-port` e `feature/phaser-port`) — isso é uma decisão humana, não assumir.

## Objetivo

1. Confirmar que os critérios de sucesso do plano
   (`docs/migracao-phaser/00-visao-geral.md`, "Critérios de sucesso") estão todos satisfeitos.
2. Esclarecer com o humano a relação entre `feature/ts-vite-port` e `feature/phaser-port` antes
   do merge (qual entra em `master` primeiro, ou se ambas entram juntas).
3. Obter aprovação humana explícita para o merge.
4. Mergear `feature/phaser-port` em `master`.

## Passos

### 1) Checklist pré-merge

Confirmar, revisitando `docs/migracao-phaser/tasks/progresso.md`:
- [ ] PHASER-TASK-01 a 19 todas `✅ Concluído`
- [ ] `mise exec -- npm run build` sem erros em `racer-phaser/`, na branch
- [ ] Critérios de sucesso de `00-visao-geral.md` confirmados (ver Log de Execução da
      PHASER-TASK-19)
- [ ] Nenhum arquivo em `app/` foi alterado em nenhuma das tarefas:
      ```bash
      git diff master...feature/phaser-port --stat -- app/
      ```
      (deve retornar vazio)

### 2) Esclarecer relação com `feature/ts-vite-port`

Apresentar ao humano o estado de ambas as branches pendentes de merge e perguntar explicitamente
a ordem/estratégia desejada antes de prosseguir.

### 3) Aprovação humana

Apresentar o checklist acima e **aguardar confirmação explícita** antes de prosseguir.

### 4) Merge (só após aprovação)

```bash
cd /home/ingmar/WebstormProjects/javascript-racer
git checkout master
git merge --no-ff feature/phaser-port -m "feat(racer-phaser): adiciona port Phaser do jogo (v4-final)"
```

(ajustar caso a estratégia combinada com o humano no passo 2 seja diferente, ex.: mergear
`feature/ts-vite-port` primeiro).

### 5) Validar pós-merge

```bash
cd racer-phaser
mise exec -- npm install
mise exec -- npm run build
```

## Critério de conclusão

- [ ] Checklist pré-merge conferido
- [ ] Relação com `feature/ts-vite-port` esclarecida com o humano
- [ ] Aprovação humana obtida e registrada no Log de Execução
- [ ] Merge feito em `master` (`--no-ff`, preservando o histórico da branch)
- [ ] `mise exec -- npm run build` sem erros em `racer-phaser/` pós-merge
- [ ] `feature/phaser-port` mantida (não deletar a branch nesta tarefa, a menos que aprovado
      explicitamente também)

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
