# Prompt de Revisão - javascript-racer

Você vai trabalhar no projeto **javascript-racer**, localizado em:

- **Projeto:** `/home/ingmar/WebstormProjects/javascript-racer/`
- **Regras do projeto:** `/home/ingmar/WebstormProjects/javascript-racer/CLAUDE.md`
- **Documentos de referência (o plano):** `/home/ingmar/WebstormProjects/javascript-racer/docs/projeto/00-visao-geral.md` … `04-riscos-decisoes-abertas.md`
- **Documentação do jogo original:** `/home/ingmar/WebstormProjects/javascript-racer/docs/01-teoria-pseudo-3d.md` … `06-arquitetura-common-js.md`
- **Arquivo de progresso:** `/home/ingmar/WebstormProjects/javascript-racer/docs/projeto/tasks/progresso.md`

---

## Objetivo

Quero que você:

1. Leia o `progresso.md` e identifique a **última tarefa marcada como concluída** (`✅`)
2. Use a tabela de mapeamento (em `prompts/01-executar.md`) para encontrar o arquivo markdown
   da tarefa e leia-o para entender o que ela requeria
3. **Inspecione o estado real** correspondente à tarefa — arquivos TypeScript criados/
   modificados em `app/src/`, resultado de `mise exec -- npm run typecheck`/
   `mise exec -- npm run build`, e (para tarefas de porte de versão) o comportamento da página
   `vN.html` comparado à documentação do original em `docs/0N-*.md`
4. Compare o que foi pedido na tarefa com o que existe de fato
5. Para cada discrepância encontrada, crie um arquivo `CORR-RACER-XXX.md` e adicione ao
   `correcoes-progresso.md`
6. Se não houver discrepâncias, informe explicitamente que a tarefa está correta

---

## Como identificar a tarefa a revisar

1. Leia o `progresso.md`
2. Localize a **última linha com `✅`** (última tarefa concluída na ordem do arquivo — não a
   última linha do arquivo, a última **concluída**)
3. Use a tabela de mapeamento de `prompts/01-executar.md` para encontrar o arquivo `.md`
   correspondente ao ID

> **Tarefas marcadas com 👤 (`requires_human: true`) nunca devem ser "a última concluída"
> antes de terem sido de fato aprovadas por um humano.**
> Se a última linha `✅` do `progresso.md` for a RACER-TASK-18 ou RACER-TASK-19, a revisão
> desta etapa deve incluir uma verificação extra: confirmar que o Log de Execução do arquivo
> da tarefa registra explicitamente a aprovação humana (não apenas que os passos técnicos
> foram executados). Se essa confirmação não estiver documentada, isso **é** uma discrepância
> — crie uma CORR para isso.
> Nunca selecione, para revisão, uma tarefa 👤 que ainda esteja `⬜ Pendente` — não há o que
> revisar em algo que não foi executado.

---

## Como revisar

### Etapa 0 — Ler as regras e documentos de referência

Antes de qualquer coisa, leia:

- `/home/ingmar/WebstormProjects/javascript-racer/CLAUDE.md`
- `docs/projeto/00-visao-geral.md` (critérios de sucesso)
- `docs/projeto/01-arquitetura-alvo.md` (a arquitetura que todo o código deve seguir)

### Etapa 1 — Ler o escopo da tarefa

No arquivo da tarefa, leia com atenção:
- **Objetivo** — o que a tarefa devia entregar
- **Requisitos da implementação** / **Passos** — o que exatamente devia ser feito
- **Critério de conclusão** — checklist do que precisa estar verdadeiro
- **Log de Execução** — o que foi dito que foi feito (use como pista, não como verdade)

### Etapa 2 — Inspecionar o estado real

Dependendo do tipo de tarefa:

**Tarefas de scaffolding/infraestrutura (RACER-TASK-01, 02, 03):**
- Verifique se `app/` existe com a estrutura esperada (`tsconfig.json`, `vite.config.ts`,
  `package.json` com os scripts certos)
- Verifique se existe `mise.toml` (raiz do repo ou dentro de `app/`) fixando a versão do Node
  — `mise current node` rodado a partir do diretório correspondente deve reportar a versão
  fixada, não "não definido"
- `cd app && mise exec -- npm run typecheck && mise exec -- npm run build` sem erros
- Para a RACER-TASK-02: conferir que `app/public/images/`/`app/public/music/` têm os mesmos
  arquivos que `images/`/`music/` na raiz (`diff -rq` entre os dois)

**Tarefas de porte do núcleo (RACER-TASK-04 a 09):**
- Verifique se os arquivos existem em `app/src/core/` e leia-os
- Compare função por função com a documentação em `docs/06-arquitetura-common-js.md` — nenhuma
  fórmula/constante deve ter mudado
- Para a RACER-TASK-09: confirmar que `RacerGame` tem os pontos de extensão como métodos
  `protected`, não lógica condicional por versão

**Tarefas de porte de versão (RACER-TASK-10, 11, 12, 15):**
- Ler `RacerGameVN.ts` e conferir contra o capítulo `docs/0N-*.md` correspondente
- Confirmar que a tarefa registrou, no Log de Execução, uma comparação real com o HTML
  original (não só "compilou sem erro") — se não há menção a essa comparação, **isso é uma
  discrepância**
- Se possível, rodar `mise exec -- npm run dev` e abrir a página para uma checagem visual
  rápida

**Tarefas de v4/tráfego (RACER-TASK-13, 14):**
- Conferir que `TrafficManager`/`Car`/`scenery`/`Hud` preservam os parâmetros "mágicos" do
  original (lookahead 20, índices de loop de `resetSprites`, formato de `formatTime`) — ver
  `docs/05-v4-final.md`

**Tarefa de limpeza (RACER-TASK-16):**
- `grep -rn ": any\|as any" app/src/` — cada ocorrência remanescente deveria ter um comentário
  justificando

**Tarefas de documentação/merge (RACER-TASK-17, 18, 19):**
- RACER-TASK-17: confirmar que `CLAUDE.md`/`docs/README.md` foram de fato atualizados
- RACER-TASK-18/19: confirmar aprovação humana registrada (ver nota no topo desta seção)

### Etapa 3 — Confirmar que nada fora de `app/`/`docs/projeto/` foi alterado

Para **qualquer** tarefa RACER-TASK-01 a 17:

```bash
git diff master...feature/ts-vite-port --stat -- . ':!app' ':!docs/projeto'
```

Deve retornar vazio (ou só a mudança pontual da RACER-TASK-17 em `CLAUDE.md`/
`docs/README.md`). Qualquer outra coisa fora desses caminhos é uma discrepância crítica.

### Etapa 4 — Classificar discrepâncias

| Tipo | Descrição | Ação |
|---|---|---|
| **Crítica** | Alteração de arquivo original (fora de `app/`/`docs/projeto/`), ou comportamento de jogo divergente do original | Criar CORR |
| **Alta** | Duplicação evitável entre versões, ponto de extensão da arquitetura não seguido, `npm run typecheck`/`build` falhando | Criar CORR |
| **Baixa** | Inconsistência menor (Log de Execução incompleto, nome de arquivo diferente do sugerido) | Criar CORR |
| **Não é discrepância** | Diferença intencional documentada no Log de Execução (ex.: ajuste nos pontos de extensão da RACER-TASK-09, esperado e registrado) | Ignorar, mas registrar no relatório |

---

## Como criar arquivos de correção

### Determinar o próximo ID

1. Leia os arquivos `CORR-RACER-*.md` existentes em `docs/projeto/tasks/`
2. O maior número existente define a base; o próximo ID é esse número + 1
3. Se não existem ainda, começar em `CORR-RACER-001`

### Formato de cada `CORR-RACER-XXX.md`

```markdown
---
id: CORR-RACER-XXX
title: "Correção: <descrição curta do problema>"
type: implementação
category: frontend|documentação|ferramental
status: pendente
depends_on: []
---

# CORR-RACER-XXX: <título>

## Problema identificado

<Descreva o problema encontrado. Inclua:>
- Qual arquivo tem o problema
- O estado atual (com trecho de código/comando de verificação)
- Por que está errado (o que a tarefa de origem pedia vs. o que existe)

## Causa raiz

<Uma frase explicando por que o problema existe>

## Correção

### Arquivo/alvo: `<caminho>`

<Descreva o que deve ser alterado, com exemplo mostrando o estado correto>

## Verificação

- [ ] <item verificável e objetivo>
- [ ] <item verificável e objetivo>

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
```

### Criar/atualizar `correcoes-progresso.md`

Arquivo em: `/home/ingmar/WebstormProjects/javascript-racer/docs/projeto/tasks/correcoes-progresso.md`

Se ainda não existir, criar com esta estrutura:

```markdown
# Progresso de Correções — Migração para TypeScript + Vite

## Resumo executivo

| ID | Título | Criticidade | Status |
|---|---|---|---|
| CORR-RACER-001 | <título> | Crítica/Alta/Baixa | [ ] pendente |

## Checklist

- [ ] CORR-RACER-001 — <título curto>

## Detalhes por correção

### CORR-RACER-001

- **Alvo com problema:** <arquivo>
- **Sintoma:** <o que está errado>
- **Fix:** <o que deve ser feito>
```

Se já existir, adicionar as novas CORRs sem alterar as entradas existentes.

---

## Restrições

> **EXCLUSÃO OBRIGATÓRIA 1 — sem implementações:**
> Este prompt é exclusivo para **revisão e criação de CORRs**.
> **Nunca** execute implementações de tasks nem de CORRs existentes por aqui.
> Não marque tarefas como concluídas no `progresso.md`.
>
> **EXCLUSÃO OBRIGATÓRIA 2 — uma revisão por execução:**
> Revise **somente a última tarefa concluída** — não agrupe revisões de múltiplas tarefas numa
> única invocação.
> Após criar os arquivos de correção em disco, **pare imediatamente**.
>
> **EXCLUSÃO OBRIGATÓRIA 3 — leitura, não escrita, no código do jogo:**
> Esta revisão só lê `app/src/` e as páginas `vN.html` — nunca edita código de implementação.
> As únicas escritas permitidas são `CORR-RACER-XXX.md` e `correcoes-progresso.md`.

---

## Formato de saída esperado

Ao concluir, informe:

1. **Tarefa revisada:** ID e título
2. **O que foi inspecionado:** lista dos arquivos/comandos usados para verificar
3. **Discrepâncias encontradas:** lista resumida (ID + descrição de uma linha)
4. **Não-discrepâncias notadas:** diferenças intencionais que foram ignoradas (e por quê)
5. **CORRs criadas:** lista dos arquivos criados
6. **`correcoes-progresso.md` atualizado:** sim/não
7. Se nenhuma discrepância: declaração explícita de que a tarefa está correta

---

## Commit

Diferente do projeto de referência (Phoenix), este repositório **não** bloqueia `docs/` de
commit. Ainda assim, este prompt **não termina com um commit** — a criação de CORRs é
propositalmente uma etapa separada da execução delas (ver `prompts/03-corrigir.md`). Deixar
`CORR-RACER-XXX.md`/`correcoes-progresso.md` só em disco; o commit acontece quando a correção
for de fato executada.

---

## Regra final

Não me entregue um plano e não implemente nada.
Revise o estado real, compare com **somente a última tarefa concluída**, crie os arquivos de
correção necessários em disco e **pare**.
Uma revisão por invocação — nunca agrupe múltiplas tarefas.
