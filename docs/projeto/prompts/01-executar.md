Você vai trabalhar no projeto **javascript-racer**, localizado em:

- **Raiz do projeto:** `/home/ingmar/WebstormProjects/javascript-racer/`
- **Arquivo de progresso:** `/home/ingmar/WebstormProjects/javascript-racer/docs/projeto/tasks/progresso.md`
- **Tarefas detalhadas:** `/home/ingmar/WebstormProjects/javascript-racer/docs/projeto/tasks/`
- **Documentos de referência (o plano):** `/home/ingmar/WebstormProjects/javascript-racer/docs/projeto/00-visao-geral.md`, `01-arquitetura-alvo.md`, `02-estrutura-vite.md`, `03-fases-execucao.md`, `04-riscos-decisoes-abertas.md`
- **Documentação do jogo original (contexto de domínio):** `/home/ingmar/WebstormProjects/javascript-racer/docs/01-teoria-pseudo-3d.md` … `06-arquitetura-common-js.md`
- **Regras do projeto:** `/home/ingmar/WebstormProjects/javascript-racer/CLAUDE.md`

---

## Objetivo

Quero que você:

1. Leia o arquivo `docs/projeto/tasks/progresso.md`
2. Identifique a **próxima tarefa não executada** da lista, respeitando a ordem numérica
   (RACER-TASK-01, 02, 03, …) e verificando se as dependências declaradas em `depends_on` já
   estão concluídas
3. Abra o markdown detalhado da tarefa correspondente em `docs/projeto/tasks/` — veja a tabela
   de mapeamento abaixo
4. Leia também `CLAUDE.md` e os documentos do plano (`docs/projeto/00`–`04`) e, se a tarefa for
   de porte de código de jogo, o(s) capítulo(s) de `docs/0N-*.md` referenciado(s) no arquivo da
   tarefa, para entender o comportamento original que está sendo portado
5. Implemente a tarefa no projeto
6. Ao final, atualize o `progresso.md` marcando o status da tarefa
7. Atualize o campo **Log de Execução** no arquivo da tarefa com: data, resumo do que foi
   feito, arquivos criados/modificados e problemas encontrados

---

## Mapeamento de tarefas — ID → arquivo

| ID no progresso.md | Arquivo em `docs/projeto/tasks/` |
| ------------------ | --------------------------------- |
| RACER-TASK-01 | `01-criar-scaffold-vite.md` |
| RACER-TASK-02 | `02-configurar-multipagina-e-assets.md` |
| RACER-TASK-03 | `03-preparar-stats-js-e-estrutura-pastas.md` |
| RACER-TASK-04 | `04-portar-tipos-constantes-sprites.md` |
| RACER-TASK-05 | `05-portar-dom-e-util.md` |
| RACER-TASK-06 | `06-portar-gameloop-input-assets-stats-musica.md` |
| RACER-TASK-07 | `07-portar-renderer.md` |
| RACER-TASK-08 | `08-criar-classe-road.md` |
| RACER-TASK-09 | `09-criar-racergame-base-e-tweakui.md` |
| RACER-TASK-10 | `10-portar-v1-estrada-reta.md` |
| RACER-TASK-11 | `11-portar-v2-curvas.md` |
| RACER-TASK-12 | `12-portar-v3-colinas.md` |
| RACER-TASK-13 | `13-portar-car-e-trafficmanager.md` |
| RACER-TASK-14 | `14-portar-scenery-e-hud.md` |
| RACER-TASK-15 | `15-portar-v4-final.md` |
| RACER-TASK-16 | `16-revisar-duplicacao-e-tipos.md` |
| RACER-TASK-17 | `17-atualizar-documentacao-projeto.md` |
| RACER-TASK-18 | `18-vincular-versao-ts-index-raiz.md` (👤 opcional) |
| RACER-TASK-19 | `19-mergear-branch-ts-em-master.md` (👤) |

---

## Regras de seleção da tarefa

1. Procurar a **primeira tarefa com status `⬜ Pendente`** em `docs/projeto/tasks/progresso.md`, na ordem numérica
2. Verificar se todas as tarefas em `depends_on` já estão concluídas — se não, **parar e
   reportar o bloqueio**, não pular a dependência
3. Se existir alguma tarefa com status "🔄 Em andamento", priorizar concluí-la antes de
   começar outra
4. **Antes de selecionar definitivamente a tarefa, verificar se ela está marcada com
   `requires_human: true`** no frontmatter (ou com o marcador 👤 na tabela de
   `progresso.md`). Se estiver:
   - **Não executá-la.** Não editar `index.html`/`README.md` da raiz, não fazer merge nem
     push relacionado a ela.
   - Reportar explicitamente que essa tarefa está aguardando interação humana e qual
     decisão/confirmação falta (ver a seção "⚠️ Requer interação humana" no início do arquivo
     da tarefa).
   - **Pular para a próxima tarefa pendente na ordem** cujas dependências já estejam
     satisfeitas e que **não** seja ela própria `requires_human: true`.
   - Se **todas** as tarefas elegíveis restantes forem `requires_human: true` (ou dependerem
     transitivamente de uma que seja), parar por completo e reportar que está aguardando
     decisão humana — não há mais nada automatizável a fazer nesta invocação.
5. RACER-TASK-18 é **opcional** — se todas as demais tarefas (exceto a 19) já estiverem
   concluídas e a 18 seguir pendente por falta de aprovação humana, isso não impede a
   RACER-TASK-19 de ser considerada (ela depende só da RACER-TASK-17, não da 18).

---

> **EXCLUSÃO OBRIGATÓRIA 1 — uma tarefa por execução:**
> Este prompt executa **exatamente uma tarefa** por invocação.
> Nunca execute duas tarefas em paralelo nem em sequência na mesma invocação.
> Após concluir e commitar a tarefa selecionada, **pare imediatamente**.
> Não avance para a próxima tarefa pendente — aguarde uma nova invocação do prompt.
>
> **EXCLUSÃO OBRIGATÓRIA 2 — branch de trabalho:**
> Todo o código das RACER-TASK-01 a 17 deve ser commitado na branch `feature/ts-vite-port`
> (criada na RACER-TASK-01) — **nunca diretamente em `master`**. A única exceção é a
> RACER-TASK-19 (merge para `master`), que é 👤. Se a branch atual não for
> `feature/ts-vite-port` e a tarefa selecionada não for a 19, **pare e reporte** antes de
> fazer qualquer alteração.
>
> **EXCLUSÃO OBRIGATÓRIA 3 — nunca tocar nos arquivos originais:**
> `index.html`, `v1.straight.html`, `v2.curves.html`, `v3.hills.html`, `v4.final.html`,
> `common.js`, `stats.js`, `common.css`, `Rakefile`, `images/`, `music/` na raiz do repositório
> **nunca são alterados** por nenhuma tarefa RACER-TASK-01 a 17. A RACER-TASK-02 **copia**
> `images/`/`music/` para dentro de `app/public/` — isso não é uma alteração do original, é uma
> cópia. A única tarefa que pode tocar `index.html`/`README.md` da raiz é a RACER-TASK-18, e
> mesmo essa só com aprovação humana explícita (é 👤).
>
> **EXCLUSÃO OBRIGATÓRIA 4 — paridade de comportamento:**
> Toda tarefa de porte de versão (RACER-TASK-10, 11, 12, 15) exige validação lado a lado com o
> HTML original correspondente antes de ser marcada como concluída. Não marcar como concluída
> só porque compilou — o critério de conclusão de cada uma dessas tarefas pede explicitamente
> a comparação visual/de sensação com o original.

---

## Arquitetura do projeto (contexto relevante para esta migração)

**Plano completo:** `docs/projeto/01-arquitetura-alvo.md` (arquitetura), `02-estrutura-vite.md`
(estrutura de pastas e configuração do Vite)

### Stack

- **Runtime:** navegador, sem framework de UI — Canvas 2D direto, igual ao original
- **Linguagem:** TypeScript, `strict: true` + `noUncheckedIndexedAccess: true`
- **Build:** Vite, template `vanilla-ts`, aplicação multi-página (`index.html`, `v1.html`…`v4.html`)
- **Projeto novo:** `app/`, na raiz do repositório, ao lado dos arquivos originais (intocados)

### Onde as coisas ficam

```
docs/projeto/
├── 00-visao-geral.md … 04-riscos-decisoes-abertas.md   ← o plano
├── tasks/                                               ← esta lista de tarefas
│   └── progresso.md
└── prompts/                                             ← este prompt e os demais

docs/0N-*.md            ← documentação do jogo ORIGINAL (o que está sendo portado)

app/                     ← o projeto Vite/TypeScript novo
├── src/core/            ← Dom, Util, GameLoop, Renderer, Road, RacerGame, TweakUI, …
└── src/versions/
    ├── v1-straight/      RacerGameV1
    ├── v2-curves/         RacerGameV2 extends RacerGameV1
    ├── v3-hills/           RacerGameV3 extends RacerGameV2
    └── v4-final/            RacerGameV4 extends RacerGameV3 (+ Car, TrafficManager, scenery, Hud)

v1.straight.html … v4.final.html, common.js, stats.js, images/, music/   ← originais, intocados
```

### Padrões obrigatórios

- Cadeia de herança `RacerGame → RacerGameV1 → V2 → V3 → V4` (padrão Template Method) — ver
  `docs/projeto/01-arquitetura-alvo.md`. Não recriar a lógica de `update()`/`render()` em cada
  subclasse; sobrescrever só os pontos de extensão.
- Classes só onde há estado/comportamento; módulos de funções para utilitários puros
  (`Dom`, `Util`) — ver o mesmo documento, "Princípio geral".
- Nenhuma mudança de comportamento/física em relação ao original — isto é um port de
  estrutura/tipagem, não uma redesign (ver `docs/projeto/00-visao-geral.md`, não-objetivos).
- Comentários e nomes de identificadores em português seguem o mesmo estilo já usado em
  `docs/` (a documentação do jogo é em PT-BR) — mas identificadores de código (classes,
  métodos, variáveis) podem seguir convenção em inglês, espelhando o código-fonte original
  (`common.js`/`v*.html` usam inglês) — manter consistência com o que já existe, não inventar
  um padrão novo.

### Comandos

```bash
cd app

# Dev server
npm run dev

# Build
npm run build

# Typecheck isolado
npm run typecheck

# Preview do build
npm run preview
```

---

## Como executar

### 1) Ler contexto
- Ler `CLAUDE.md` e os documentos do plano (`docs/projeto/00`–`04`)
- Ler `docs/projeto/tasks/progresso.md`
- Ler o arquivo markdown detalhado da tarefa selecionada
- Se a tarefa portar comportamento de jogo, ler também o(s) capítulo(s) de `docs/0N-*.md`
  referenciado(s) nela
- Confirmar a branch atual do git antes de qualquer alteração (ver Exclusão Obrigatória 2)

### 2) Implementar
- Implementar exatamente o escopo definido na tarefa
- Não alterar escopo nem adicionar funcionalidades extras não descritas (nenhuma ideia de
  expansão de `docs/05-v4-final.md#511` entra em escopo aqui)
- Preservar fórmulas/constantes numéricas do original byte-a-byte, exceto onde a própria
  tarefa descreve uma mudança estrutural deliberada (ex.: `Renderer` recebendo `ctx` uma vez
  no construtor em vez de em cada chamada)

### 3) Validar

Antes de marcar como concluída, verificar os **critérios de conclusão** listados no final do
markdown da tarefa.

Checklist geral:
- `npm run typecheck` sem erros
- `npm run build` sem erros
- Para tarefas de porte de versão (10, 11, 12, 15): validação lado a lado com o HTML original
  correspondente

Se a tarefa ficar parcialmente pronta:
- Não marcar como concluída no `progresso.md`
- Registrar no Log de Execução da tarefa o que ficou pendente

### 4) Atualizar progresso

Se a tarefa foi concluída:
- Atualizar o status na tabela de resumo do `progresso.md` (⬜ → ✅) e no checklist da fase
  correspondente
- Preencher o **Log de Execução** no arquivo da tarefa (data, resumo, arquivos, problemas)

Se a tarefa não foi concluída:
- Manter status `⬜ Pendente` (ou `❌ Bloqueado` se houver impedimento real)
- Adicionar nota no Log de Execução explicando o bloqueio

### 5) Commit

```bash
cd /home/ingmar/WebstormProjects/javascript-racer
git add app/ docs/projeto/tasks/progresso.md docs/projeto/tasks/<arquivo-da-tarefa>.md
git commit -m "feat(app): implementa RACER-TASK-XX — <título da tarefa>"
```

- Formato: `<tipo>(<escopo>): <descrição imperativa>` — tipo `feat`/`refactor`/`docs`/`chore`
  conforme a natureza da tarefa (ver `type` no frontmatter do arquivo da tarefa)
- Escopo sugerido: `app`
- Nunca usar `git add -A` nem `git add .` — sempre listar os arquivos explicitamente
- Diferente do projeto de referência (Phoenix), **aqui `docs/` é commitado normalmente** —
  não há hook bloqueando `docs/` neste repositório. `progresso.md` e o Log de Execução entram
  no mesmo commit da implementação.
- Confirmar que o commit está na branch `feature/ts-vite-port` (exceto RACER-TASK-19)

---

## Formato de saída esperado

Ao concluir, informe:

1. Qual tarefa foi selecionada e por quê (próxima pendente)
2. Resumo do que foi implementado
3. Quais arquivos foram criados ou modificados
4. Confirmação de que o critério de conclusão da tarefa foi atendido
5. Para tarefas de porte de versão: resultado da comparação lado a lado com o original
6. Confirmação de que o `progresso.md` foi atualizado
7. Se houver bloqueios ou pendências, liste objetivamente

---

## Regras importantes

- Nunca escolha uma tarefa aleatória; sempre pegue a próxima pendente na ordem numérica
- Faça apenas **uma tarefa por vez**
- Não marque tarefa como concluída sem implementação real e validação dos critérios
- Nunca altere `index.html`/`v1.straight.html`/`v2.curves.html`/`v3.hills.html`/
  `v4.final.html`/`common.js`/`stats.js`/`common.css`/`Rakefile`/`images/`/`music/` da raiz
- Nunca faça merge/push para `master` fora da RACER-TASK-19 (e mesmo essa, só com aprovação)

---

## Regra final

Não me entregue um plano.
Execute **exatamente uma** tarefa pendente — a próxima na ordem — atualize o progresso ao
final e **pare**.
Nunca execute mais de uma tarefa por invocação, mesmo que a primeira termine rapidamente.
