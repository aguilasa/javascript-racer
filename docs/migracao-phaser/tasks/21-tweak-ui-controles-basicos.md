---
id: PHASER-TASK-21
title: "Tweak UI (racer-phaser): controles básicos ao vivo (lanes, roadWidth, cameraHeight, drawDistance, fieldOfView, fogDensity)"
type: implementação
category: frontend
phase: 10
depends_on: ["PHASER-TASK-20"]
status: concluído
---

# PHASER-TASK-21: Tweak UI — controles básicos ao vivo

## Contexto

- **Origem:** item de backlog registrado em
  [`04-riscos-decisoes.md`](../04-riscos-decisoes.md), "Tweak UI fora do escopo inicial", e em
  [`progresso.md`](progresso.md), seção "Backlog / melhorias futuras". A migração para Phaser
  (PHASER-TASK-01 a 20) está completa e mergeada em `master`; esta é a retomada planejada daquele
  item, a pedido do usuário.
- **Referência de comportamento original:** `v4.final.html`, linhas 12-64 (markup HTML do painel,
  `<table id="controls">`) e linhas 630-681 (`reset(options)` + handlers `Dom.on(...)` +
  `refreshTweakUI()`). Também documentado em
  [`docs/05-v4-final.md §5.8`](../../05-v4-final.md#58-tweak-ui-faixas-lanes-e-reinicialização-condicional-da-pista).
  A **apresentação** é diferente por pedido explícito do usuário — ver "Decisões técnicas" abaixo
  — só o *comportamento* (quais controles, ranges, efeito de cada um) segue o original.
- **Por que em duas tarefas:** dos 7 controles do painel original, 6 (`lanes`, `roadWidth`,
  `cameraHeight`, `drawDistance`, `fieldOfView`, `fogDensity`) são simples atribuições de campo
  lidas ao vivo a cada frame por `RacerEngine.getRenderState()` — não exigem redimensionar o
  `<canvas>` do Phaser nem recriar nenhum game object. O 7º (`resolution`, que troca
  `width`/`height`) exige lidar com o `Phaser.Scale.ScaleManager` e redimensionar `TileSprite`s/
  reposicionar outros elementos ancorados nas bordas — mais arriscado e maior. Ver
  [`22-tweak-ui-resolucao.md`](22-tweak-ui-resolucao.md) para essa parte.
- **Confirmação importante (lida em `v4.final.html:630-649`):** nenhum dos 7 controles do painel
  chama `resetRoad()` — só `options.segmentLength`/`options.rumbleLength` fariam isso, e nenhum
  dos dois tem controle na UI. Ou seja, **todos os controles desta tarefa são só troca de campo,
  sem nunca reconstruir a geometria da pista.**

## Objetivo

1. Criar um painel de **elementos nativos do Phaser** (não HTML), ancorado no **canto superior
   direito da tela do jogo**, dentro do `<canvas>`, com os 6 controles básicos.
2. Adicionar `RacerEngine.applyOptions(options)`, equivalente ao `reset(options)` original mas sem
   a parte de `resolution`/rebuild de pista (fica para a PHASER-TASK-22 e é sempre não-aplicável
   aqui, respectivamente).
3. Ligar os controles diretamente ao `RacerEngine` da cena `Game`.

## Decisões técnicas

| Decisão | Escolha | Razão |
| ------- | ------- | ----- |
| Onde vive o painel | **Dentro do canvas**, como elementos Phaser (`Text`/`Rectangle`/`Graphics`), não HTML/DOM — decisão explícita do usuário, substitui a opção HTML cotada anteriormente | Pedido direto do usuário: "quero que o Tweak seja elementos do Phaser, exibido no canto superior direito da tela do jogo". |
| Estrutura do código | Nova classe `TweakUi` em `racer-phaser/src/game/racer/TweakUi.ts`, seguindo o mesmo padrão de `Hud.ts` (construtor recebe a `Scene`, guarda `Phaser.GameObjects.*` como campos, métodos `create()`/atualização chamados pela `Game` scene) | Reaproveita um padrão já validado no projeto (`Hud`) em vez de inventar um novo; nenhuma ponte HTML↔Phaser é necessária (ver próxima linha). |
| Ciclo de vida / ponte com `RacerEngine` | `TweakUi` só existe dentro da cena `Game` (criado em `Game.create()` junto com `Hud`, recebendo `this.racerEngine` direto no construtor), igual ao `Hud` | Elimina de vez o problema de "painel vivo fora da cena `Game`" da versão anterior deste plano (que exigia `setEngine(null)`/bridging) — como o painel é um game object da própria cena, ele simplesmente não existe em `MainMenu`/`GameOver`, sem estado a sincronizar. |
| Posição/ancoragem | Canto superior direito, com uma margem fixa (ex.: 10px) a partir de `state.width` — mesma lógica de ancoragem já usada pelo botão de mute (`this.scale.width - 80, 10`, `Game.ts:101`) | Consistente com o único outro elemento hoje ancorado à direita. |
| Conflito de layout com o botão de mute | O botão de mute (hoje em `width-80, 10`) passa a ficar **dentro do cabeçalho do próprio painel do Tweak UI** (uma linha a mais no topo do painel), não mais solto no canto | Evita dois elementos competindo pelo mesmo canto; um único bloco visual no canto superior direito fica mais organizado. Reavaliar layout exato na implementação. |
| Painel expansível/recolhível | **Sim** — um pequeno botão/ícone (`Text` clicável, ex. `⚙`/`▸`) sempre visível no canto, que abre/fecha o painel completo; **inicia recolhido** | Diferente do original (painel HTML sempre visível, fora da área de jogo), aqui o painel ocupa espaço *dentro* da viewport de jogo — recolhido por padrão evita cobrir a pista/cenário durante o jogo normal. Ajustável depois se o usuário preferir sempre aberto. |
| Controles deslizantes (`roadWidth`, `cameraHeight`, `drawDistance`, `fieldOfView`, `fogDensity`) | Trilho = `Phaser.GameObjects.Rectangle` fino e fixo; alça = `Rectangle`/`Image` menor, `setInteractive()` + `this.input.setDraggable(handle)`, evento `'drag'` recalcula o valor a partir de `handle.x` (clampado aos limites do trilho) e chama `racerEngine.applyOptions({...})` **a cada `'drag'`** (feedback contínuo, mais natural para um ajuste "ao vivo" do que esperar o solto do mouse) | Phaser não tem um widget de slider pronto; esse é o padrão idiomático mínimo (`setInteractive`+`input.setDraggable`) para construir um, sem dependências externas. |
| Controles discretos (`lanes`: 1-4) | Componente "anterior/próximo": `Text` mostrando o valor atual + dois `Text` pequenos clicáveis (`◀`/`▶`) ao lado, cada clique avança/recua um índice num array de opções e chama `applyOptions` imediatamente | Mais simples de construir com `Text`+`setInteractive` do que reimplementar um `<select>`; mesmo padrão será reaproveitado pelo `resolution` na PHASER-TASK-22 (4 opções discretas). |
| Refletir valores atuais no painel | Cada controle guarda o valor atual (handle na posição correspondente / texto do índice atual) já nos valores default do `RacerEngine` na criação do `TweakUi`; não precisa de um `refresh()` separado desde que `TweakUi` seja criado **depois** de `racerEngine.reset()` | Diferente da versão HTML (que precisava sincronizar um DOM separado), aqui o estado inicial nasce correto porque os elementos são criados lendo os campos do `racerEngine` diretamente. |
| Persistência | Nenhuma (valores voltam ao padrão a cada corrida nova) | Igual ao original — só `muted` e `fast_lap_time` persistem em `localStorage`, nunca os valores da tweak UI. |

## Passos

1. **`RacerEngine.applyOptions(options)`** em `racer-phaser/src/game/racer/RacerEngine.ts`:
   - Assinatura sugerida: `applyOptions(options: Partial<{ lanes: number; roadWidth: number; cameraHeight: number; drawDistance: number; fieldOfView: number; fogDensity: number }>): void`.
   - Corpo: atualizar cada campo presente em `options` (mesmo padrão condicional do
     `Util.toInt(options.x, x)` original — só sobrescreve o que veio em `options`), depois sempre
     recomputar `this.cameraDepth` e `this.playerZ` (iguais às duas linhas de `reset()` já
     existentes, linhas 93-94), já que `fieldOfView`/`cameraHeight` afetam os dois. Não chamar
     `buildRoad()` — ver "Confirmação importante" acima.
   - Reaproveitar os campos já existentes na classe (todos já são propriedades públicas mutáveis,
     ver `RacerEngine.ts:43-65`) — não precisa adicionar campos novos, só o método.
2. **`racer-phaser/src/game/racer/TweakUi.ts`** (nova classe, padrão `Hud.ts`):
   - Construtor `(scene: Phaser.Scene, engine: RacerEngine)`, guarda `engine` e cria os game
     objects (container recolhido por padrão + botão de abrir/fechar + os 6 controles + o botão de
     mute realocado — ver decisões acima).
   - Um método privado por tipo de controle (`createSlider(...)`, `createStepper(...)`) para não
     repetir a lógica de `setInteractive`/`drag`/`applyOptions` seis vezes.
   - Cada controle já nasce com o valor lido de `engine.roadWidth`/`.cameraHeight`/etc.
   - Considerar `Phaser.GameObjects.Container` para agrupar painel + controles como uma unidade só
     (facilita mostrar/esconder ao abrir/fechar, e reposicionar tudo de uma vez na PHASER-TASK-22).
3. **`Game.ts`**: importar `TweakUi`, instanciar depois de `this.racerEngine.reset()` em
   `create()` (`this.tweakUi = new TweakUi(this, this.racerEngine)`); remover a criação solta do
   `muteText` (linhas 101-113 atuais) e mover essa responsabilidade para dentro de `TweakUi`.
4. Testar manualmente cada um dos 6 controles com `mise exec -- npm run dev`, dirigindo enquanto
   ajusta cada um (abrindo o painel), confirmando efeito visível ao vivo (sem precisar recarregar
   a página), e confirmando que o botão de mute continua funcionando dentro do novo layout.

## Critério de conclusão

- [ ] `RacerEngine.applyOptions(options)` implementado, sem chamar `buildRoad()`
- [ ] `TweakUi` criado como game objects Phaser (não HTML), ancorado no canto superior direito,
      recolhido por padrão
- [ ] Os 6 controles básicos funcionando (5 deslizantes + `lanes` como anterior/próximo), cada um
      ligado a `racerEngine.applyOptions(...)`
- [ ] Botão de mute realocado para dentro do painel, sem perder funcionalidade
- [ ] Painel nasce refletindo os valores atuais do `RacerEngine` (sem passo de sincronização
      manual)
- [ ] Cada um dos 6 controles testado manualmente, efeito visível ao vivo, sem erros no console
- [ ] `mise exec -- npm run typecheck` e `npm run build` sem erros
- [ ] Commit em `master` (ou branch de trabalho, a critério do usuário — migração já está em
      `master`, sem branch `feature/*` ativa no momento desta tarefa)

## Log de Execução *(preenchido após execução)*

**Data:** 2026-07-08

**Status:** ✅ Concluído — validação manual confirmada pelo usuário.

**Resumo do que foi feito:**

1. `RacerEngine.applyOptions(options)` adicionado em `RacerEngine.ts` (método público): aplica cada campo
   presente em `options` e recomputa `cameraDepth`/`playerZ` — sem chamar `buildRoad()`.
2. `TweakUi.ts` criado (novo arquivo): painel nativo Phaser, `Container` ancorado no canto superior
   direito (`scale.width - PANEL_WIDTH - 10, 10`), iniciando **recolhido**. Inclui:
   - Cabeçalho com botão ⚙ (abre/fecha) e botão 🔊/🔇 (mute), sempre visível.
   - 1 linha de stepper (◀/▶) para `lanes` (1-4).
   - 5 sliders (`roadWidth` 500-3000, `cameraHeight` 500-5000, `drawDistance` 100-500,
     `fieldOfView` 80-140, `fogDensity` 0-50) — trilho `Rectangle` + alça `Rectangle` draggable.
   - Cada controle nasce com o valor atual do `engine` (sem passo de sincronização extra).
   - `setMusic(music)` para receber a referência de `Phaser.Sound.BaseSound` após construção.
3. `Game.ts` atualizado:
   - `import { TweakUi }` adicionado.
   - Campo `tweakUi` adicionado; `muteText` standalone removido.
   - `this.tweakUi = new TweakUi(this, this.racerEngine)` instanciado em `create()` após
     `racerEngine.reset()`.
   - `this.tweakUi.setMusic(this.music)` chamado após configurar a música.

**Arquivos criados:**
- `racer-phaser/src/game/racer/TweakUi.ts`

**Arquivos modificados:**
- `racer-phaser/src/game/racer/RacerEngine.ts` (método `applyOptions`)
- `racer-phaser/src/game/scenes/Game.ts` (integração TweakUi, remoção muteText standalone)

**Verificação automatizada:**
- `npx tsc --noEmit` → 0 erros
- `npm run build-nolog` → build limpo (vite, sem erros)

**Validação manual:** confirmada pelo usuário (2026-07-09).
