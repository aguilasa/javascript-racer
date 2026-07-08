---
id: CORR-PHASER-019
title: "Correção: tsc --noEmit falha — Game.music tipado como Phaser.Sound.BaseSound, que não declara mute/setMute"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-PHASER-019: `Game.music` tipado com a classe abstrata errada (`BaseSound`)

## Problema identificado

- **Comando de verificação:** `mise exec -- npx tsc --noEmit -p tsconfig.json` (dentro de
  `racer-phaser/`)
- **Resultado atual:**
  ```
  src/game/scenes/Game.ts(83,20): error TS2339: Property 'setMute' does not exist on type 'BaseSound'.
  src/game/scenes/Game.ts(95,42): error TS2339: Property 'mute' does not exist on type 'BaseSound'.
  src/game/scenes/Game.ts(96,24): error TS2339: Property 'setMute' does not exist on type 'BaseSound'.
  ```
  `mise exec -- npm run build` (esbuild, sem type-checking) termina com sucesso — mesma classe de
  lacuna já registrada em `CORR-PHASER-003`/`CORR-PHASER-018`.
- **Arquivo:** `racer-phaser/src/game/scenes/Game.ts`
  ```ts
  private music!: Phaser.Sound.BaseSound;   // linha 24 — tipo declarado errado
  ...
  this.music = this.sound.add('music', { loop: true, volume: 0.05 }); // linha 81
  const isMuted = localStorage.getItem('muted') === 'true';
  this.music.setMute(isMuted);              // linha 83 — erro
  this.music.play();
  ...
  this.muteText.on('pointerdown', () => {
    const newMuted = !this.music.mute;      // linha 95 — erro
    this.music.setMute(newMuted);           // linha 96 — erro
    ...
  });
  ```
- **Por que está errado:** `Phaser.Sound.BaseSound` é a classe abstrata da qual `HTML5AudioSound`/
  `WebAudioSound`/`NoAudioSound` herdam — ela **não** declara `mute`/`setMute` (esses membros só
  existem nas subclasses concretas). `this.sound` (a `SoundManager` de uma `Scene`) é tipado por
  Phaser como `Phaser.Sound.NoAudioSoundManager | Phaser.Sound.HTML5AudioSoundManager |
  Phaser.Sound.WebAudioSoundManager`, e `.add(...)` nessa união já retorna o tipo concreto
  correto (união de `NoAudioSound | HTML5AudioSound | WebAudioSound`, todos com `mute`/
  `setMute`). Ao anotar explicitamente `private music!: Phaser.Sound.BaseSound`, o campo foi
  forçado para o supertipo mais genérico, que não expõe esses membros — puramente um erro de
  anotação de tipo, não de lógica (em runtime o objeto real sempre tem `mute`/`setMute`, então o
  jogo funciona no browser; o problema é só a checagem estática).

## Causa raiz

Ao declarar o campo `music`, foi usado o tipo abstrato mais genérico (`BaseSound`) em vez de
deixar o TypeScript inferir o tipo de retorno de `this.sound.add(...)` (ou anotar explicitamente
com a união de subclasses concretas) — o mesmo padrão de erro já visto em `CORR-PHASER-018`
(tipo genérico demais sem cast/anotação específica).

## Correção

### Arquivo/alvo: `racer-phaser/src/game/scenes/Game.ts`

Trocar a anotação do campo para a união de subtipos concretos que `SoundManager.add()`
realmente retorna:

```ts
private music!: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
```

(ou, alternativamente, remover a anotação de tipo do campo e declará-lo só como propriedade de
classe sem tipo explícito, deixando `this.music = this.sound.add(...)` inferir o tipo na
atribuição — qualquer uma das duas resolve os três erros).

## Verificação

- [x] `mise exec -- npx tsc --noEmit -p tsconfig.json` sem erros
- [x] `mise exec -- npm run build` sem erros
- [x] Validação manual: música ainda toca em loop e o botão de mute ainda funciona após a
      mudança de tipo (mudança é só de anotação estática, não deve alterar comportamento)

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-07

**Resumo do que foi feito:**
Alterado o tipo do campo `music` em `Game.ts` de `Phaser.Sound.BaseSound` para a união de subtipos concretos `Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound`. Isso resolve os 3 erros de tipo (TS2339) reportados por `tsc --noEmit` relacionados ao acesso a `mute` e `setMute`, que não existem na classe abstrata `BaseSound` mas estão presentes nas subclasses concretas retornadas por `SoundManager.add()`.

**Problemas encontrados:**
Nenhum.

**Arquivos criados/modificados:**
- Modificado: `racer-phaser/src/game/scenes/Game.ts` (tipo de music alterado para união de subtipos concretos)
- Modificado: `docs/migracao-phaser/tasks/correcoes-progresso.md` (status CORR-PHASER-019 marcado como [x] concluído, checklist atualizado)
