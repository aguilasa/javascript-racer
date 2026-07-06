---
id: PHASER-TASK-17
title: "Adaptar MainMenu/GameOver ao tema do racer e validar fluxo completo de cenas"
type: implementação
category: frontend
phase: 8
depends_on: ["PHASER-TASK-16"]
status: pendente
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

- [ ] `MainMenu` com tema do racer, transição para `Game` funcionando
- [ ] Decisão sobre `GameOver` tomada e documentada
- [ ] Fluxo completo `Boot`→`Preloader`→`MainMenu`→`Game` validado manualmente, sem erros no
      console
- [ ] `mise exec -- npm run build` sem erros
- [ ] Commit feito em `feature/phaser-port`

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
