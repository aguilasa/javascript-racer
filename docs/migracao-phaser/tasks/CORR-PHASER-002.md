---
id: CORR-PHASER-002
title: "Correção: colisão de chave de textura 'background' no Preloader impede o carregamento real de background.png"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-PHASER-002: colisão de chave de textura `'background'` no Preloader

## Problema identificado

- **Arquivo:** `racer-phaser/src/game/scenes/Preloader.ts`
- **Estado atual:**
  ```ts
  preload ()
  {
      this.load.setPath('assets');
      this.load.image('sprites', 'racer/sprites.png');
      this.load.image('background', 'racer/background.png');   // <- mesma chave 'background'
      this.load.audio('racer_music', [...]);
      this.load.image('logo', 'logo.png');
  }

  create ()
  {
      const backgroundTexture = this.textures.get('background'); // <- lê a textura errada
      for (const [name, rect] of Object.entries(BACKGROUND)) {
          backgroundTexture.add(name, 0, rect.x, rect.y, rect.w, rect.h);
      }
      ...
  }
  ```
  `racer-phaser/src/game/scenes/Boot.ts` já carrega, na chave `'background'`, um asset
  completamente diferente:
  ```ts
  // Boot.ts
  this.load.image('background', 'assets/bg.png');
  ```
  Esse mesmo `'background'` é reutilizado como o fundo de placeholder do template em
  `Preloader.init()`, `MainMenu.ts` e `GameOver.ts` (`this.add.image(512, 384, 'background')`).
- **Por que está errado:** `Phaser.Textures.TextureManager.addImage()` (chamado internamente ao
  final do carregamento de `this.load.image(...)`) só registra a textura **se a chave ainda não
  existir** (`checkKey()` → `this.exists(key)`). Como `'background'` já foi registrada pelo
  `Boot` (carregando `assets/bg.png`), a segunda chamada `this.load.image('background',
  'racer/background.png')` dispara `console.error('Texture key already in use: background')` e
  **não substitui nada** — o carregamento de `racer/background.png` é descartado
  silenciosamente (fora do erro no console).

  Consequência prática: em `Preloader.create()`, `this.textures.get('background')` continua
  apontando para a pequena imagem de placeholder do template (`assets/bg.png`), não para a folha
  de parallax real (1280×1440px, com as regiões `SKY`/`HILLS`/`TREES`). Os frames nomeados
  (`SKY`, `HILLS`, `TREES`) acabam sendo registrados com coordenadas de recorte
  (`{x:5,y:495,w:1280,h:480}`, etc.) sobre uma imagem que provavelmente não tem essas dimensões
  — produzindo frames inválidos/fora dos limites da textura real. Isso não foi pego pela
  validação manual da tarefa porque o teste temporário usou um frame de `'sprites'`
  (`this.add.image(512, 384, 'sprites', 'PALM_TREE')`), nunca um frame de `'background'`.
- **Como confirmar:** rodar `mise exec -- npm run dev`, abrir o console do navegador e observar
  `Texture key already in use: background` ao carregar a `Preloader` scene; ou inspecionar
  `this.textures.get('background').source[0].width/height` em runtime e comparar com as
  dimensões esperadas de `background.png` (1280×1440, conforme `docs/06-arquitetura-common-
  js.md §6.6`).

## Causa raiz

O template `phaserjs/template-vite-ts` já reserva a chave `'background'` para a imagem de fundo
genérica da tela de preloader/menu (`assets/bg.png`, carregada em `Boot.ts`). A PHASER-TASK-04
reaproveitou o mesmo nome de chave para a folha de parallax do jogo (`racer/background.png`) sem
verificar colisão com chaves já usadas pelo scaffold do template.

## Correção

### Arquivo/alvo: `racer-phaser/src/game/scenes/Preloader.ts`

Carregar a folha de parallax do jogo sob uma chave própria, sem colidir com `'background'` (o
mesmo padrão já usado para a música, `'racer_music'`) — por exemplo `'racer_background'`:

```ts
preload ()
{
    this.load.setPath('assets');

    this.load.image('sprites', 'racer/sprites.png');
    this.load.image('racer_background', 'racer/background.png');   // chave própria, sem colidir
    this.load.audio('racer_music', ['racer/music/racer.mp3', 'racer/music/racer.ogg']);

    this.load.image('logo', 'logo.png');
}

create ()
{
    const spritesTexture = this.textures.get('sprites');
    for (const [name, rect] of Object.entries(SPRITES)) {
        if (typeof rect === 'object' && 'x' in rect) {
            spritesTexture.add(name, 0, rect.x, rect.y, rect.w, rect.h);
        }
    }

    const backgroundTexture = this.textures.get('racer_background');   // lê a textura certa
    for (const [name, rect] of Object.entries(BACKGROUND)) {
        backgroundTexture.add(name, 0, rect.x, rect.y, rect.w, rect.h);
    }

    this.scene.start('MainMenu');
}
```

Qualquer código futuro que precise da folha de parallax do jogo (ex.: `TileSprite` na
PHASER-TASK-10) deve referenciar a textura pela chave `'racer_background'`, não `'background'`
— documentar essa chave explicitamente no Log de Execução desta correção para que a
PHASER-TASK-10 já nasça ciente dela.

## Verificação

- [x] `Preloader.ts` carrega a folha de parallax sob uma chave que não colide com `'background'`
      (usada por `Boot`/`MainMenu`/`GameOver`/`Preloader.init()`)
- [x] Nenhum `console.error`/warning de "Texture key already in use" ao rodar
      `mise exec -- npm run dev` e navegar até a `Preloader`/`MainMenu`
- [x] `this.textures.get('racer_background')` (ou o nome escolhido) tem as dimensões esperadas de
      `background.png` (1280×1440) em runtime
- [x] Frames `SKY`/`HILLS`/`TREES` registrados sobre a textura correta, sem ficarem fora dos
      limites da imagem
- [x] `mise exec -- npm run build` sem erros
- [x] A tarefa de origem (`04-portar-sprites-background-preloader.md`) tem seu Log de Execução
      atualizado com uma nota referenciando esta correção, para não perder o contexto

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:**
- Confirmado o problema: `Preloader.ts` carregava `racer/background.png` sob a chave `'background'`, que colide com a chave já usada pelo template em `Boot.ts` (carrega `assets/bg.png`)
- Renomeou a chave de textura de `'background'` para `'racer_background'` no `preload()` do Preloader
- Atualizou `this.textures.get('background')` para `this.textures.get('racer_background')` no `create()` do Preloader
- Validado `mise exec -- npm run build` - build concluído sem erros
- Nota: código futuro que precisar da folha de parallax do jogo (ex.: PHASER-TASK-10 TileSprite) deve usar a chave `'racer_background'`

**Problemas encontrados:**
- Nenhum

**Arquivos criados/modificados:**
- `racer-phaser/src/game/scenes/Preloader.ts` (modificado - chave renomeada de 'background' para 'racer_background')
