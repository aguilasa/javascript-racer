---
id: PHASER-TASK-16
title: "Música em loop + mute persistido via Phaser Sound Manager"
type: implementação
category: frontend
phase: 8
depends_on: ["PHASER-TASK-15"]
status: pendente
---

# PHASER-TASK-16: Música em loop + mute persistido via Phaser Sound Manager

## Contexto

- **Fonte:** `app/src/core/MusicPlayer.ts` (`<audio>` + `Dom.storage`), documentado em
  `docs/05-v4-final.md §5.9` e `docs/06-arquitetura-common-js.md#gameplaymusic`.
- **Plano completo:** `docs/migracao-phaser/01-arquitetura-alvo.md`, linha da tabela referente a
  `MusicPlayer.ts` — "`localStorage` para a preferência de mudo continua igual".
- A faixa de música já foi carregada no `Preloader` na PHASER-TASK-04.

## Objetivo

Na `Game` scene, tocar a música em loop via `this.sound.add(...)`/`.play({ loop: true, volume:
0.05 })`, com um botão/tecla de mute cujo estado é persistido em `localStorage['muted']` — mesmo
volume baixo (`0.05`) e mesma chave de persistência do original.

## Requisitos da implementação

- Volume `0.05` (mesmo valor do original — "shhhh! música meio incômoda!", ver comentário em
  `docs/05-v4-final.md §5.9`).
- Ao iniciar, ler `localStorage['muted'] === 'true'` e aplicar via `sound.setMute(true)` (ou
  equivalente) antes de tocar.
- Um controle de mute (pode ser um `Phaser.GameObjects.Text`/ícone clicável na própria `Game`
  scene, já que não há mais um botão HTML fora do canvas) alterna `sound.mute` e persiste o novo
  valor em `localStorage['muted']`.

## Passos

1. Ler `docs/05-v4-final.md §5.9`.
2. Implementar a reprodução em loop + persistência de mute na `Game` scene.
3. Validar manualmente: música toca em loop, botão/tecla de mute funciona, preferência persiste
   entre recarregamentos.

## Critério de conclusão

- [x] Música toca em loop, volume `0.05`
- [x] Preferência de mute lida de `localStorage['muted']` na inicialização
- [x] Controle de mute funcional, persistindo o novo valor
- [x] Validação manual confirmada
- [x] `mise exec -- npm run build` sem erros
- [x] Commit feito em `feature/phaser-port`

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-07

**Resumo do que foi feito:**
Implementado música em loop e controle de mute na `Game` scene usando Phaser Sound Manager. Adicionados campos `music` (Phaser.Sound.BaseSound) e `muteText` (Phaser.GameObjects.Text) à classe. No `create()`: música carregada com `this.sound.add('music', { loop: true, volume: 0.05 })`, estado de mute lido de `localStorage['muted']`, aplicado via `setMute()`, e música iniciada. Botão de mute criado como texto clicável (🔇/🔊) no canto superior direito, com `setInteractive({ useHandCursor: true })` e handler de `pointerdown` que alterna `music.mute`, persiste em `localStorage` e atualiza o ícone. Volume e chave de persistência idênticos ao original (`0.05` e `'muted'`).

**Problemas encontrados:**
Nenhum.

**Arquivos criados/modificados:**
- Modificado: `racer-phaser/src/game/scenes/Game.ts` (adição de música em loop, controle de mute com persistência)
- Modificado: `docs/migracao-phaser/tasks/progresso.md` (status PHASER-TASK-16 marcado como ✅ Concluído)
