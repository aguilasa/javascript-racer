# Prompt de Execução - javascript-racer (migração Phaser)

Você vai trabalhar no projeto **javascript-racer**, localizado em:

- **Raiz do projeto:** `/home/ingmar/WebstormProjects/javascript-racer/`
- **Arquivo de progresso:** `/home/ingmar/WebstormProjects/javascript-racer/docs/migracao-phaser/tasks/progresso.md`
- **Tarefas detalhadas:** `/home/ingmar/WebstormProjects/javascript-racer/docs/migracao-phaser/tasks/`
- **Documentos de referência (o plano):** `/home/ingmar/WebstormProjects/javascript-racer/docs/migracao-phaser/00-visao-geral.md`, `01-arquitetura-alvo.md`, `02-estrutura-projeto.md`, `03-fases-execucao.md`, `04-riscos-decisoes.md`
- **Documentação do jogo original (contexto de domínio):** `/home/ingmar/WebstormProjects/javascript-racer/docs/01-teoria-pseudo-3d.md` … `06-arquitetura-common-js.md`
- **Fonte de comportamento a portar (port TypeScript já existente):** `/home/ingmar/WebstormProjects/javascript-racer/app/src/core/`, `/home/ingmar/WebstormProjects/javascript-racer/app/src/versions/v4-final/`
- **Regras do projeto:** `/home/ingmar/WebstormProjects/javascript-racer/CLAUDE.md`

---

## Objetivo

Quero que você:

1. Leia o arquivo `docs/migracao-phaser/tasks/progresso.md`
2. Identifique a **próxima tarefa não executada** da lista, respeitando a ordem numérica
   (PHASER-TASK-01, 02, 03, …) e verificando se as dependências declaradas em `depends_on` já
   estão concluídas
3. Abra o markdown detalhado da tarefa correspondente em `docs/migracao-phaser/tasks/` — veja a
   tabela de mapeamento abaixo
4. Leia também `CLAUDE.md` e os documentos do plano (`docs/migracao-phaser/00`–`04`) e, se a
   tarefa for de porte de código de jogo, o(s) arquivo(s) de referência em `app/src/core`/
   `app/src/versions/v4-final` e o(s) capítulo(s) de `docs/0N-*.md` referenciado(s) no arquivo da
   tarefa, para entender o comportamento original que está sendo portado
5. Implemente a tarefa no projeto `racer-phaser/`
6. Ao final, atualize o `progresso.md` marcando o status da tarefa
7. Atualize o campo **Log de Execução** no arquivo da tarefa com: data, resumo do que foi feito,
   arquivos criados/modificados e problemas encontrados

---

## Mapeamento de tarefas — ID → arquivo

| ID no progresso.md | Arquivo em `docs/migracao-phaser/tasks/` |
| ------------------ | ----------------------------------------- |
| PHASER-TASK-01 | `01-criar-branch-e-tooling.md` |
| PHASER-TASK-02 | `02-copiar-assets.md` |
| PHASER-TASK-03 | `03-portar-util-types-constants.md` |
| PHASER-TASK-04 | `04-portar-sprites-background-preloader.md` |
| PHASER-TASK-05 | `05-portar-road.md` |
| PHASER-TASK-06 | `06-criar-roadrenderer.md` |
| PHASER-TASK-07 | `07-integrar-pista-estatica.md` |
| PHASER-TASK-08 | `08-criar-racerengine.md` |
| PHASER-TASK-09 | `09-input-passo-fixo-player.md` |
| PHASER-TASK-10 | `10-parallax-tilesprite.md` |
| PHASER-TASK-11 | `11-portar-scenery-pool.md` |
| PHASER-TASK-12 | `12-colisao-cenario.md` |
| PHASER-TASK-13 | `13-portar-car-trafficmanager.md` |
| PHASER-TASK-14 | `14-pool-trafego-colisao.md` |
| PHASER-TASK-15 | `15-criar-hud.md` |
| PHASER-TASK-16 | `16-audio-phaser-sound.md` |
| PHASER-TASK-17 | `17-menu-gameover-fluxo.md` |
| PHASER-TASK-18 | `18-performance-pool.md` |
| PHASER-TASK-19 | `19-paridade-e-docs.md` |
| PHASER-TASK-20 | `20-mergear-branch-phaser-em-master.md` (👤) |

---

## Regras de seleção da tarefa

1. Procurar a **primeira tarefa com status `⬜ Pendente`** em
   `docs/migracao-phaser/tasks/progresso.md`, na ordem numérica
2. Verificar se todas as tarefas em `depends_on` já estão concluídas — se não, **parar e
   reportar o bloqueio**, não pular a dependência
3. Se existir alguma tarefa com status "🔄 Em andamento", priorizar concluí-la antes de começar
   outra
4. **Antes de selecionar definitivamente a tarefa, verificar se ela está marcada com
   `requires_human: true`** no frontmatter (ou com o marcador 👤 na tabela de `progresso.md`). Se
   estiver:
   - **Não executá-la.** Não fazer merge nem push relacionado a ela.
   - Reportar explicitamente que essa tarefa está aguardando interação humana e qual
     decisão/confirmação falta (ver a seção "⚠️ Requer interação humana" no início do arquivo da
     tarefa).
   - Se for a única tarefa elegível restante (normalmente é o caso, já que PHASER-TASK-20 é a
     última da lista), parar por completo e reportar que está aguardando decisão humana.

---

> **EXCLUSÃO OBRIGATÓRIA 1 — uma tarefa por execução:**
> Este prompt executa **exatamente uma tarefa** por invocação.
> Nunca execute duas tarefas em paralelo nem em sequência na mesma invocação.
> Após concluir e commitar a tarefa selecionada, **pare imediatamente**.
> Não avance para a próxima tarefa pendente — aguarde uma nova invocação do prompt.
>
> **EXCLUSÃO OBRIGATÓRIA 2 — branch de trabalho:**
> Todo o código das PHASER-TASK-01 a 19 deve ser commitado na branch `feature/phaser-port`
> (criada na PHASER-TASK-01, a partir do estado atual — normalmente `feature/ts-vite-port`, a
> única branch que hoje contém `racer-phaser/` e `docs/migracao-phaser/`) — **nunca diretamente
> em `master`**. A única exceção é a PHASER-TASK-20 (merge para `master`), que é 👤. Se a branch
> atual não for `feature/phaser-port` e a tarefa selecionada não for a 20, **pare e reporte**
> antes de fazer qualquer alteração.
>
> **EXCLUSÃO OBRIGATÓRIA 3 — nunca tocar em `app/`:**
> Nenhum arquivo dentro de `app/` (o port TypeScript existente) é alterado por nenhuma tarefa
> PHASER-TASK-01 a 20. `app/` é lido apenas como referência de comportamento a portar.
> `racer-phaser/` é um projeto irmão, independente.
>
> **EXCLUSÃO OBRIGATÓRIA 4 — paridade de comportamento:**
> Toda tarefa que porta comportamento visual/de jogo (PHASER-TASK-06 a 19) exige validação
> manual (visual, jogando) antes de ser marcada como concluída. Não marcar como concluída só
> porque compilou — o critério de conclusão de cada uma dessas tarefas pede explicitamente essa
> validação.
>
> **EXCLUSÃO OBRIGATÓRIA 5 — sem tweak UI:**
> A tweak UI (painel de ajuste fino de resolução/faixas/etc.) está **fora do escopo** desta
> migração (ver `docs/migracao-phaser/04-riscos-decisoes.md`). Nenhuma tarefa deve introduzi-la
> "de brinde" — se algo parecer exigir esse painel, parar e reportar em vez de implementá-lo por
> conta própria.

---

## Arquitetura do projeto (contexto relevante para esta migração)

**Plano completo:** `docs/migracao-phaser/01-arquitetura-alvo.md` (arquitetura e mapa de
migração), `02-estrutura-projeto.md` (estrutura de pastas)

### Stack

- **Runtime:** navegador, framework **Phaser 4** (WebGL/Canvas via `Phaser.AUTO`)
- **Linguagem:** TypeScript
- **Build:** Vite (template `phaserjs/template-vite-ts`)
- **Projeto:** `racer-phaser/`, na raiz do repositório, ao lado de `app/` (port TypeScript sem
  framework, intocado) e dos arquivos HTML/JS originais (também intocados)
- **Gerenciamento de versão do Node:** [`mise`](https://mise.jdx.dev/), herdado do `mise.toml`
  da raiz do repositório (`node = "20"`) — todo comando roda via `mise exec --`

### Onde as coisas ficam

```
docs/migracao-phaser/
├── 00-visao-geral.md … 04-riscos-decisoes.md   ← o plano
├── tasks/                                       ← esta lista de tarefas
│   └── progresso.md
└── prompts/                                     ← este prompt e os demais

docs/0N-*.md            ← documentação do jogo ORIGINAL (o que está sendo portado)

app/src/core/, app/src/versions/v4-final/   ← port TypeScript já existente (fonte de
                                                comportamento a portar, NUNCA alterado aqui)

racer-phaser/            ← o projeto Phaser novo
├── src/game/scenes/      Boot, Preloader, MainMenu, Game, GameOver
└── src/game/racer/        util, types, constants, sprites, background, Road, Car,
                            TrafficManager, scenery, RacerEngine, RoadRenderer, Hud
```

### Padrões obrigatórios

- **Matemática/regras de jogo são portadas verbatim** de `app/src/core`/`app/src/versions/
  v4-final` (`util.ts`, `types.ts`, `constants.ts`, `sprites.ts`, `background.ts`, `Road.ts`,
  `Car.ts`, `TrafficManager.ts`, `scenery.ts`) — nenhuma fórmula/constante muda, só o caminho de
  import. Ver `docs/migracao-phaser/01-arquitetura-alvo.md`, tabela de mapeamento.
- **Camada de I/O é reescrita** para usar APIs nativas do Phaser (loader, input, áudio, scenes,
  `Graphics`, pool de `Image`, `TileSprite`) — não recriar `AssetLoader`/`InputController`/
  `MusicPlayer`/`GameLoop`/`Renderer` (canvas 2D) dentro de `racer-phaser/`.
- **`RacerEngine`** (a fusão de `RacerGame`+`RacerGameV4`) não importa `phaser` — mantém a física/
  regras testável e desacoplada do framework, espelhando a separação que já existe hoje entre
  `RacerGame` e `Renderer`.
- **Pool de `Image`** para sprites de cenário/carros/jogador — nunca criar/destruir game objects
  dentro do loop de renderização por frame (ver `04-riscos-decisoes.md`).
- Sem cadeia de herança V1-V4 — só existe uma versão (v4-final), então os pontos de extensão de
  `RacerGame` já vêm com o comportamento final aplicado diretamente em `RacerEngine`.

### Comandos

Todos via `mise exec --`, dentro de `racer-phaser/`:

```bash
cd racer-phaser

# Instalar dependências
mise exec -- npm install

# Dev server
mise exec -- npm run dev

# Build
mise exec -- npm run build
```

---

## Como executar

### 1) Ler contexto
- Ler `CLAUDE.md` e os documentos do plano (`docs/migracao-phaser/00`–`04`)
- Ler `docs/migracao-phaser/tasks/progresso.md`
- Ler o arquivo markdown detalhado da tarefa selecionada
- Se a tarefa portar comportamento de jogo, ler também o(s) arquivo(s) correspondente(s) em
  `app/src/core`/`app/src/versions/v4-final` e o(s) capítulo(s) de `docs/0N-*.md` referenciado(s)
- Confirmar a branch atual do git antes de qualquer alteração (ver Exclusão Obrigatória 2)

### 2) Implementar
- Implementar exatamente o escopo definido na tarefa
- Não alterar escopo nem adicionar funcionalidades extras não descritas (nenhuma ideia de
  expansão de `docs/05-v4-final.md#511` ou `docs/projeto/05-ideias-expansao.md` entra em escopo)
- Preservar fórmulas/constantes numéricas do original byte-a-byte, exceto onde a própria tarefa
  descreve uma mudança estrutural deliberada (ex.: `RoadRenderer` usando `Graphics` em vez de
  `CanvasRenderingContext2D`)

### 3) Validar

Antes de marcar como concluída, verificar os **critérios de conclusão** listados no final do
markdown da tarefa.

Checklist geral:

- `mise exec -- npm run build` sem erros
- Para tarefas de comportamento visual/de jogo (PHASER-TASK-06 a 19): validação manual jogando
  (`mise exec -- npm run dev`)

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
git add racer-phaser/ docs/migracao-phaser/tasks/progresso.md docs/migracao-phaser/tasks/<arquivo-da-tarefa>.md
git commit -m "feat(racer-phaser): implementa PHASER-TASK-XX — <título da tarefa>"
```

- Formato: `<tipo>(<escopo>): <descrição imperativa>` — tipo `feat`/`chore`/`docs` conforme a
  natureza da tarefa (ver `type` no frontmatter do arquivo da tarefa)
- Escopo sugerido: `racer-phaser`
- Nunca usar `git add -A` nem `git add .` — sempre listar os arquivos explicitamente
- `docs/` é commitado normalmente neste repositório — `progresso.md` e o Log de Execução entram
  no mesmo commit da implementação
- Confirmar que o commit está na branch `feature/phaser-port` (exceto PHASER-TASK-20)

---

## Formato de saída esperado

Ao concluir, informe:

1. Qual tarefa foi selecionada e por quê (próxima pendente)
2. Resumo do que foi implementado
3. Quais arquivos foram criados ou modificados
4. Confirmação de que o critério de conclusão da tarefa foi atendido
5. Para tarefas de comportamento visual/de jogo: resultado da validação manual
6. Confirmação de que o `progresso.md` foi atualizado
7. Se houver bloqueios ou pendências, liste objetivamente

---

## Regras importantes

- Nunca escolha uma tarefa aleatória; sempre pegue a próxima pendente na ordem numérica
- Faça apenas **uma tarefa por vez**
- Não marque tarefa como concluída sem implementação real e validação dos critérios
- Nunca altere nada dentro de `app/`
- Nunca faça merge/push para `master` fora da PHASER-TASK-20 (e mesmo essa, só com aprovação)

---

## Regra final

Não me entregue um plano.
Execute **exatamente uma** tarefa pendente — a próxima na ordem — atualize o progresso ao final
e **pare**.
Nunca execute mais de uma tarefa por invocação, mesmo que a primeira termine rapidamente.
