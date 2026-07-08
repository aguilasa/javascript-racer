---
id: CORR-PHASER-011
title: "Correção: Game.renderPlayer() inverte a razão cameraDepth/playerZ, escala o sprite do jogador ~1000x maior que o correto"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-PHASER-011: `renderPlayer()` inverte `cameraDepth/playerZ` — escala do jogador errada por ~3 ordens de grandeza

## Problema identificado

- **Arquivo:** `racer-phaser/src/game/scenes/Game.ts`
- **Estado atual:**
  ```ts
  const scale = (spriteRect.w * state.playerZ / state.cameraDepth * state.width / 2) * (SPRITES.SCALE * roadWidth);
  const destH = (spriteRect.h * state.playerZ / state.cameraDepth * state.width / 2) * (SPRITES.SCALE * roadWidth);
  this.playerSprite.setScale(scale / spriteRect.w, destH / spriteRect.h);
  ```
- **Por que está errado:** no algoritmo original, `RacerGame.render()` chama
  (`app/src/core/RacerGame.ts`):
  ```ts
  this.renderer.player(
    this.width, this.height, this.resolution, this.roadWidth,
    this.sprites, this.speed / this.maxSpeed,
    this.cameraDepth / this.playerZ,     // <- "scale": cameraDepth/playerZ, não o inverso
    this.width / 2, screenY,
    steer, updown,
  )
  ```
  e `Renderer.sprite()` (`app/src/core/Renderer.ts`) usa esse `scale` diretamente:
  ```ts
  let destW = (sprite.w * scale * width/2) * (SPRITES.SCALE * roadWidth)
  ```
  ou seja, o fator de escala correto é **`cameraDepth / playerZ`** (um número pequeno, já que
  `cameraDepth` ≈ 0.84 e `playerZ` ≈ 839 com os valores padrão — proporção ≈ 0.001). O código
  atual usa `state.playerZ / state.cameraDepth` (≈ 1000) — a **razão invertida**, ~10⁶ vezes maior
  que o valor correto (não só ~1000x — o erro se aplica tanto ao numerador quanto reforça o efeito
  já que a fórmula usa a razão diretamente como multiplicador). Isso faz `destW`/`destH` ficarem
  absurdamente grandes, e o sprite resultante (depois de `Image.setScale(scale/w, destH/h)`)
  fica com uma escala visual gigantesca em vez do tamanho correto de um carrinho na tela.
- **Sintoma observado:** combinado com a `CORR-PHASER-010` (frame errado, textura inteira usada
  como fallback) e a escala ~1000x maior, a região visível do canvas acaba caindo inteiramente
  dentro de uma pequena fatia (provavelmente transparente) dessa textura enorme — por isso a tela
  captura na validação desta revisão não mostra nem um pedaço reconhecível de sprite, só a cor de
  fundo. As duas correções (010 e 011) devem ser aplicadas juntas antes de tentar validar
  visualmente de novo.

## Causa raiz

Transcrição da fórmula original com a razão invertida — possivelmente por confundir "playerZ
sobre cameraDepth" com "cameraDepth sobre playerZ" ao adaptar a chamada posicional de
`Renderer.player(..., this.cameraDepth / this.playerZ, ...)` para o código novo.

## Correção

### Arquivo/alvo: `racer-phaser/src/game/scenes/Game.ts`

Inverter a razão para `cameraDepth / playerZ`, igual ao original:

```ts
const scale = (spriteRect.w * state.cameraDepth / state.playerZ * state.width / 2) * (SPRITES.SCALE * roadWidth);
const destH = (spriteRect.h * state.cameraDepth / state.playerZ * state.width / 2) * (SPRITES.SCALE * roadWidth);
this.playerSprite.setScale(scale / spriteRect.w, destH / spriteRect.h);
```

## Verificação

- [ ] Fórmula usa `cameraDepth / playerZ` (não o inverso), igual a
      `app/src/core/RacerGame.ts#render` + `app/src/core/Renderer.ts#sprite`
- [ ] Validação visual (junto com `CORR-PHASER-010`): o carrinho do jogador aparece com tamanho
      plausível na tela (comparável a `v4.final.html`/`app/v4.html`), não gigantesco nem
      microscópico
- [ ] `mise exec -- npm run build` sem erros
- [ ] Log de Execução da PHASER-TASK-09 atualizado com nota referenciando esta correção

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:**
Corrigido `renderPlayer()` para inverter a razão de escala de `playerZ/cameraDepth` para `cameraDepth/playerZ`:
- Alterado `state.playerZ / state.cameraDepth` para `state.cameraDepth / state.playerZ` nas linhas 120-121
- Isso corrige a escala do sprite do jogador, que estava ~1000x maior que o correto devido à razão invertida
- A fórmula agora corresponde ao original em `app/src/core/RacerGame.ts#render` + `app/src/core/Renderer.ts#sprite`

**Problemas encontrados:**
Nenhum.

**Arquivos criados/modificados:**
- Modificado: `racer-phaser/src/game/scenes/Game.ts` (renderPlayer() corrigido para usar cameraDepth/playerZ)
- Modificado: `docs/migracao-phaser/tasks/correcoes-progresso.md` (status CORR-PHASER-011 marcado como [x] concluído, checklist atualizado)
