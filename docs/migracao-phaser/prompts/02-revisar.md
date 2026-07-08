# Prompt de Revisão - javascript-racer (migração Phaser)

Você vai trabalhar no projeto **javascript-racer**, localizado em:

- **Projeto:** `/home/ingmar/WebstormProjects/javascript-racer/`
- **Regras do projeto:** `/home/ingmar/WebstormProjects/javascript-racer/CLAUDE.md`
- **Documentos de referência (o plano):** `/home/ingmar/WebstormProjects/javascript-racer/docs/migracao-phaser/00-visao-geral.md` … `04-riscos-decisoes.md`
- **Documentação do jogo original:** `/home/ingmar/WebstormProjects/javascript-racer/docs/01-teoria-pseudo-3d.md` … `06-arquitetura-common-js.md`
- **Fonte de comportamento a portar:** `/home/ingmar/WebstormProjects/javascript-racer/app/src/core/`, `/home/ingmar/WebstormProjects/javascript-racer/app/src/versions/v4-final/`
- **Arquivo de progresso:** `/home/ingmar/WebstormProjects/javascript-racer/docs/migracao-phaser/tasks/progresso.md`

---

## Objetivo

Quero que você:

1. Leia o `progresso.md` e identifique a **última tarefa marcada como concluída** (`✅`)
2. Use a tabela de mapeamento (em `prompts/01-executar.md`) para encontrar o arquivo markdown da
   tarefa e leia-o para entender o que ela requeria
3. **Inspecione o estado real** correspondente à tarefa — arquivos TypeScript criados/
   modificados em `racer-phaser/src/`, resultado de `mise exec -- npm run build`, e (para
   tarefas de comportamento visual/de jogo) o comportamento manual comparado à documentação do
   original em `docs/0N-*.md` e ao código de referência em `app/src/core`/`app/src/versions/
   v4-final`
4. Compare o que foi pedido na tarefa com o que existe de fato
5. Para cada discrepância encontrada, crie um arquivo `CORR-PHASER-XXX.md` e adicione ao
   `correcoes-progresso.md`
6. Se não houver discrepâncias, informe explicitamente que a tarefa está correta

---

## Como identificar a tarefa a revisar

1. Leia o `progresso.md`
2. Localize a **última linha com `✅`** (última tarefa concluída na ordem do arquivo — não a
   última linha do arquivo, a última **concluída**)
3. Use a tabela de mapeamento de `prompts/01-executar.md` para encontrar o arquivo `.md`
   correspondente ao ID

> **Tarefas marcadas com 👤 (`requires_human: true`) nunca devem ser "a última concluída" antes
> de terem sido de fato aprovadas por um humano.**
> Se a última linha `✅` do `progresso.md` for a PHASER-TASK-20, a revisão desta etapa deve
> incluir uma verificação extra: confirmar que o Log de Execução do arquivo da tarefa registra
> explicitamente a aprovação humana (não apenas que os passos técnicos foram executados). Se essa
> confirmação não estiver documentada, isso **é** uma discrepância — crie uma CORR para isso.
> Nunca selecione, para revisão, uma tarefa 👤 que ainda esteja `⬜ Pendente` — não há o que
> revisar em algo que não foi executado.

---

## Como revisar

### Etapa 0 — Ler as regras e documentos de referência

Antes de qualquer coisa, leia:

- `/home/ingmar/WebstormProjects/javascript-racer/CLAUDE.md`
- `docs/migracao-phaser/00-visao-geral.md` (critérios de sucesso)
- `docs/migracao-phaser/01-arquitetura-alvo.md` (a arquitetura que todo o código deve seguir)

### Etapa 1 — Ler o escopo da tarefa

No arquivo da tarefa, leia com atenção:
- **Objetivo** — o que a tarefa devia entregar
- **Requisitos da implementação** / **Passos** — o que exatamente devia ser feito
- **Critério de conclusão** — checklist do que precisa estar verdadeiro
- **Log de Execução** — o que foi dito que foi feito (use como pista, não como verdade)

### Etapa 2 — Inspecionar o estado real

Dependendo do tipo de tarefa:

**Tooling/assets (PHASER-TASK-01, 02):**
- Verifique se a branch `feature/phaser-port` existe e a partir de que commit foi criada
- `mise current node` dentro de `racer-phaser/` reporta a versão fixada
- `mise exec -- npm run build` sem erros
- Para a PHASER-TASK-02: `diff` entre `racer-phaser/public/assets/racer/*` e
  `app/public/images/*`/`app/public/music/*` deve retornar vazio

**Núcleo portável verbatim (PHASER-TASK-03, 04, 05, 11 parte de scenery, 13):**
- Verifique se os arquivos existem em `racer-phaser/src/game/racer/` e leia-os
- Compare função por função com o arquivo de origem em `app/src/core`/`app/src/versions/
  v4-final` — nenhuma fórmula/constante deve ter mudado (diff conceitual, já que os caminhos de
  import mudam)

**Renderer/engine/integração (PHASER-TASK-06, 07, 08, 09, 10):**
- Confirme que `RoadRenderer`/`RacerEngine` seguem a separação descrita em
  `01-arquitetura-alvo.md` (`RacerEngine` sem import de `'phaser'`)
- Rodar `mise exec -- npm run dev` e conferir visualmente o que a tarefa promete (pista estática
  projetada corretamente, depois dirigível, depois parallax)
- Confirmar que a tarefa registrou, no Log de Execução, a validação visual — se não há menção,
  **isso é uma discrepância**

**Cenário e tráfego (PHASER-TASK-11 a 14):**
- Conferir que os parâmetros "mágicos" do original foram preservados (índices de loop de
  `resetSprites`, lookahead 20 de `updateCarOffset`, fórmula de esterço) — ver `docs/
  05-v4-final.md`
- Confirmar uso de pool (sem criação/destruição de `Image` por frame) — procurar por padrões
  suspeitos como `this.add.image(...)` dentro de um método de update/render chamado a cada frame

**HUD/áudio/menu (PHASER-TASK-15, 16, 17):**
- Conferir `formatTime`/persistência em `localStorage` idênticos ao original
- Validar manualmente cronometragem de volta, mute, fluxo de cenas

**Performance/paridade (PHASER-TASK-18, 19):**
- Conferir que números de FPS foram de fato registrados no Log de Execução, não só "parece
  rápido o suficiente"
- Para a PHASER-TASK-19: conferir que a comparação com `v4.final.html`/`RacerGameV4` está
  documentada critério a critério (não uma linha genérica "está tudo igual")

**Merge (PHASER-TASK-20):**
- Confirmar aprovação humana registrada (ver nota no topo desta seção)

### Etapa 3 — Confirmar que nada fora de `racer-phaser/`/`docs/migracao-phaser/` foi alterado

Para **qualquer** tarefa PHASER-TASK-01 a 19:

```bash
git diff master...feature/phaser-port --stat -- . ':!racer-phaser' ':!docs/migracao-phaser'
```

Deve retornar vazio (ou só o que já estava em `feature/ts-vite-port` antes da criação da branch
`feature/phaser-port`, que não é responsabilidade desta revisão). Qualquer alteração nova fora
desses caminhos é uma discrepância crítica.

### Etapa 4 — Classificar discrepâncias

| Tipo | Descrição | Ação |
|---|---|---|
| **Crítica** | Alteração de arquivo em `app/`, ou comportamento de jogo divergente do original | Criar CORR |
| **Alta** | Ponto de extensão da arquitetura não seguido (ex.: `RacerEngine` importando `phaser`), pool recriando game objects por frame, `mise exec -- npm run build` falhando | Criar CORR |
| **Baixa** | Inconsistência menor (Log de Execução incompleto, nome de arquivo diferente do sugerido) | Criar CORR |
| **Não é discrepância** | Diferença intencional documentada no Log de Execução (ex.: decisão sobre `GameOver` não reaproveitada) | Ignorar, mas registrar no relatório |

---

## Como criar arquivos de correção

### Determinar o próximo ID

1. Leia os arquivos `CORR-PHASER-*.md` existentes em `docs/migracao-phaser/tasks/`
2. O maior número existente define a base; o próximo ID é esse número + 1
3. Se não existem ainda, começar em `CORR-PHASER-001`

### Formato de cada `CORR-PHASER-XXX.md`

```markdown
---
id: CORR-PHASER-XXX
title: "Correção: <descrição curta do problema>"
type: implementação
category: frontend|documentação|ferramental
status: pendente
depends_on: []
---

# CORR-PHASER-XXX: <título>

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

Arquivo em: `/home/ingmar/WebstormProjects/javascript-racer/docs/migracao-phaser/tasks/correcoes-progresso.md`

Se ainda não existir, criar com esta estrutura:

```markdown
# Progresso de Correções — Migração para Phaser

## Resumo executivo

| ID | Título | Criticidade | Status |
|---|---|---|---|
| CORR-PHASER-001 | <título> | Crítica/Alta/Baixa | [ ] pendente |

## Checklist

- [ ] CORR-PHASER-001 — <título curto>

## Detalhes por correção

### CORR-PHASER-001

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
> Esta revisão só lê `racer-phaser/src/` (e `app/src/` como referência) — nunca edita código de
> implementação. As únicas escritas permitidas são `CORR-PHASER-XXX.md` e
> `correcoes-progresso.md`.

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

Este prompt **não termina com um commit** — a criação de CORRs é propositalmente uma etapa
separada da execução delas (ver `prompts/03-corrigir.md`). Deixar `CORR-PHASER-XXX.md`/
`correcoes-progresso.md` só em disco; o commit acontece quando a correção for de fato executada.

---

## Regra final

Não me entregue um plano e não implemente nada.
Revise o estado real, compare com **somente a última tarefa concluída**, crie os arquivos de
correção necessários em disco e **pare**.
Uma revisão por invocação — nunca agrupe múltiplas tarefas.
