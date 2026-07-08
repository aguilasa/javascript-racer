---
id: CORR-PHASER-010
title: "Correção: Game.renderPlayer() passa o objeto SpriteRect para setFrame() em vez do nome do frame registrado"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-PHASER-010: `renderPlayer()` passa o `SpriteRect` inteiro para `setFrame()`, não o nome do frame

## Problema identificado

- **Arquivo:** `racer-phaser/src/game/scenes/Game.ts`
- **Estado atual:**
  ```ts
  let spriteRect;
  if (steer < 0)
    spriteRect = (updown > 0) ? SPRITES.PLAYER_UPHILL_LEFT : SPRITES.PLAYER_LEFT;
  else if (steer > 0)
    spriteRect = (updown > 0) ? SPRITES.PLAYER_UPHILL_RIGHT : SPRITES.PLAYER_RIGHT;
  else
    spriteRect = (updown > 0) ? SPRITES.PLAYER_UPHILL_STRAIGHT : SPRITES.PLAYER_STRAIGHT;

  this.playerSprite.setFrame(spriteRect);   // <- spriteRect é {x,y,w,h}, não um nome de frame
  ```
- **Confirmado em runtime**: capturando **todas** as mensagens de console (não só erros) ao abrir
  a `Game` scene via Playwright, aparece repetidamente:
  ```
  warning: Texture "%s" has no frame "%s" sprites [object Object]
  ```
  — exatamente o aviso que `Phaser.Textures.Texture.get()` emite quando o argumento passado não
  corresponde a nenhuma chave registrada (`this.frames[name]` é `undefined` porque `name` aqui é
  o objeto `SpriteRect`, coagido para a string `"[object Object]"`).
- **Por que está errado:** os frames da textura `'sprites'` foram registrados por **nome**
  (string) na PHASER-TASK-04 (`spritesTexture.add(name, 0, rect.x, rect.y, rect.w, rect.h)`, onde
  `name` é a chave do objeto `SPRITES`, ex.: `'PLAYER_STRAIGHT'`). `Phaser.GameObjects.Image#setFrame`
  espera essa mesma **string** (ou um índice numérico, ou uma instância de `Phaser.Textures.Frame`)
  — nunca o objeto de coordenadas `{x, y, w, h}` em si. Como o lookup falha, `Texture.get()` cai
  no fallback `this.frames[this.firstFrame]` — o frame base da textura inteira (`sprites.png`
  como uma única imagem) — então o sprite do jogador nunca mostra o carrinho correto; mostra a
  folha de sprites inteira (drasticamente errada em conteúdo e proporção).

## Causa raiz

`SPRITES.PLAYER_STRAIGHT` (e as demais variantes) são objetos de **coordenadas de recorte**
(`SpriteRect`), usados para *registrar* os frames na textura (PHASER-TASK-04) — não são, em si,
identificadores de frame. `renderPlayer()` reaproveitou a mesma variável para as duas finalidades
(escolher o frame certo e calcular `w`/`h` para a escala), sem manter também o **nome** da chave
associada a cada objeto.

## Correção

### Arquivo/alvo: `racer-phaser/src/game/scenes/Game.ts`

Escolher o **nome do frame** (string) para `setFrame()`, mantendo o objeto de coordenadas
(`SPRITES[frameName]`) só para o cálculo de escala que já existe:

```ts
let frameName: string;
if (steer < 0)
  frameName = (updown > 0) ? 'PLAYER_UPHILL_LEFT' : 'PLAYER_LEFT';
else if (steer > 0)
  frameName = (updown > 0) ? 'PLAYER_UPHILL_RIGHT' : 'PLAYER_RIGHT';
else
  frameName = (updown > 0) ? 'PLAYER_UPHILL_STRAIGHT' : 'PLAYER_STRAIGHT';

const spriteRect = SPRITES[frameName];
this.playerSprite.setFrame(frameName);
```

(o restante do método — cálculo de `bounce`, `setPosition`, `setScale` — continua usando
`spriteRect.w`/`spriteRect.h` como já faz hoje, já que essas dimensões vêm do mesmo objeto).

## Verificação

- [ ] Nenhuma mensagem `"Texture \"%s\" has no frame \"%s\""` no console ao rodar
      `mise exec -- npm run dev` e abrir a `Game` scene
- [ ] Validação visual: o sprite do jogador mostra o carrinho correto (não a folha de sprites
      inteira), trocando entre reto/esquerda/direita/subida conforme esterço e altura do terreno
- [ ] `mise exec -- npm run build` sem erros
- [ ] Log de Execução da PHASER-TASK-09 atualizado com nota referenciando esta correção

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:**
Corrigido `renderPlayer()` para passar o nome do frame (string) para `setFrame()` em vez do objeto `SpriteRect`:
- Alterado `let spriteRect` para `let frameName: string` para guardar o nome do frame
- Atribuído os nomes literais das strings (`'PLAYER_UPHILL_LEFT'`, `'PLAYER_LEFT'`, etc.) em vez dos objetos `SPRITES.PLAYER_*`
- Adicionado `const spriteRect = SPRITES[frameName]` para obter o objeto de coordenadas após escolher o nome
- Passado `frameName` para `this.playerSprite.setFrame(frameName)` em vez de `spriteRect`
- O cálculo de escala continua usando `spriteRect.w`/`spriteRect.h` como antes

**Problemas encontrados:**
Nenhum.

**Arquivos criados/modificados:**
- Modificado: `racer-phaser/src/game/scenes/Game.ts` (renderPlayer() corrigido para usar nome do frame string)
- Modificado: `docs/migracao-phaser/tasks/correcoes-progresso.md` (status CORR-PHASER-010 marcado como [x] concluído, checklist atualizado)
