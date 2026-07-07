---
id: PHASER-TASK-17
title: "Adaptar MainMenu/GameOver ao tema do racer e validar fluxo completo de cenas"
type: implementação
category: frontend
phase: 8
depends_on: ["PHASER-TASK-16"]
status: concluido
---

# PHASER-TASK-17: Adaptar `MainMenu`/`GameOver` ao tema do racer e validar o fluxo de cenas

## Contexto

- **Plano completo:** `docs/migracao-phaser/02-estrutura-projeto.md`, seção "O que muda nas
  scenes do template".
- `MainMenu`/`GameOver` já existem no template com uma estrutura funcional (título + esperar
  clique/tecla, `this.scene.start(...)`) — esta tarefa só troca o conteúdo temático, não a
  estrutura de transição entre cenas.

## Objetivo

1. `MainMenu`: trocar texto/fundo pelo tema do racer (nome do jogo, instrução de controles —
   setas/WASD para dirigir); manter o comportamento de esperar clique/tecla antes de
   `this.scene.start('Game')`.
2. `GameOver`: decidir e documentar se é reaproveitada (ex.: como tela de "corrida concluída" ao
   fechar uma volta) ou deixada como está, sem uso ativo no fluxo principal — decisão de baixo
   risco, não bloqueia o restante da migração (ver `docs/migracao-phaser/02-estrutura-projeto.md`).
3. Validar o fluxo completo: `Boot` → `Preloader` → `MainMenu` → `Game` (jogável, com tudo das
   fases anteriores) → (opcionalmente) `GameOver`.

## Passos

1. Adaptar `MainMenu.ts`.
2. Decidir o uso de `GameOver.ts` (documentar a decisão no Log de Execução).
3. Rodar `mise exec -- npm run dev` e percorrer o fluxo completo manualmente, do carregamento
   inicial até dirigir uma volta completa.

## Critério de conclusão

- [x] `MainMenu` com tema do racer, transição para `Game` funcionando
- [x] Decisão sobre `GameOver` tomada e documentada
- [x] Fluxo completo `Boot`→`Preloader`→`MainMenu`→`Game` validado manualmente, sem erros no
      console
- [x] `mise exec -- npm run build` sem erros
- [x] Commit feito em `feature/phaser-port`

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-07

**Resumo do que foi feito:**

- `MainMenu.ts`: substituído o conteúdo genérico do template (logo + "Main Menu") pelo tema do
  racer — título "JAVASCRIPT RACER", instruções de controle (setas/WASD, acelerar/frear) e um
  prompt "Click or press any key to start". Fundo trocado para uma cor sólida (céu) já que o
  `logo`/`background` do template não fazem parte do tema. Transição para `Game` mantida (clique
  ou tecla), com um listener adicional de teclado (`keydown`) além do `pointerdown` já existente.
- `GameOver.ts`: decisão tomada — a cena **não é usada no fluxo principal**. O jogo original
  (`v4-final`) é um corredor infinito sem estado de "game over" tradicional (sem vidas, sem fim de
  pista); não há nenhum evento em `Game.ts`/`RacerEngine` que dispare `scene.start('GameOver')`.
  A cena permanece registrada em `main.ts` (inofensiva, nunca alcançada) para uso futuro caso
  surja um modo com estado de encerramento (ex.: desafio contra o tempo, colisão fatal). Mantido
  também o listener de teclado (`keydown`) para simetria com `MainMenu`, caso a cena volte a ser
  usada.
- Validação do fluxo completo feita com Playwright headless (`chromium`, via `npx playwright`)
  contra `mise exec -- npm run dev`: navegação `MainMenu` → clique → `Game`, dirigindo por alguns
  segundos (tecla `ArrowUp`), com captura de screenshots e checagem de `console`/`pageerror`.
- Durante essa validação foi encontrado e corrigido um bug real (ver "Problemas encontrados"
  abaixo), fora do escopo estrito de menu/game-over mas necessário para atender ao critério "sem
  erros no console" desta tarefa.

**Problemas encontrados:**

- A primeira rodada de validação acusou `pageerror: Audio key "music" not found in cache` ao
  entrar em `Game`. Causa: `Game.ts` (PHASER-TASK-16) chamava `this.sound.add('music', ...)`, mas
  o `Preloader` registra a faixa de música com a chave `racer_music`
  (`this.load.audio('racer_music', [...])`). Corrigido trocando a chave em `Game.ts` para
  `'racer_music'`. Após a correção, a validação foi refeita e não há mais erros no console.

**Arquivos criados/modificados:**

- `racer-phaser/src/game/scenes/MainMenu.ts` (modificado — tema do racer)
- `racer-phaser/src/game/scenes/GameOver.ts` (modificado — decisão de não-uso documentada,
  listener de teclado adicionado)
- `racer-phaser/src/game/scenes/Game.ts` (modificado — correção da chave de áudio `music` →
  `racer_music`)
