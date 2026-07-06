# 02 — Estrutura do Projeto

## Onde o projeto mora

`racer-phaser/` já existe na raiz do repositório, clonado a partir do template oficial
[`phaserjs/template-vite-ts`](https://github.com/phaserjs/template-vite-ts) (Phaser 4.0.0 + Vite 6
+ TypeScript 5.7, sem o histórico git do template — ver commit `chore(racer-phaser): adiciona
scaffold do template phaser + vite + ts`). É um projeto Node/Vite independente de `app/`, com seu
próprio `package.json`/`node_modules`/scripts (`npm run dev`, `npm run build`).

O template já traz:
```
racer-phaser/
├── index.html
├── package.json
├── tsconfig.json
├── vite/config.dev.mjs, config.prod.mjs
├── public/
│   ├── favicon.png
│   ├── style.css
│   └── assets/{bg.png, logo.png}
└── src/
    ├── main.ts                    (bootstrap: StartGame('game-container'))
    └── game/
        ├── main.ts                (Phaser.Game config + lista de scenes)
        └── scenes/
            ├── Boot.ts            (carrega o mínimo para mostrar o Preloader)
            ├── Preloader.ts       (carrega os assets do jogo + barra de progresso)
            ├── MainMenu.ts        (tela de título, clique para começar)
            ├── Game.ts            (a cena principal — hoje só um placeholder)
            └── GameOver.ts        (tela de fim de jogo)
```

## Layout proposto

```
racer-phaser/src/
├── main.ts                        (inalterado)
└── game/
    ├── main.ts                    (inalterado — já registra as 5 scenes)
    ├── scenes/
    │   ├── Boot.ts                (inalterado)
    │   ├── Preloader.ts           (adaptado — ver abaixo)
    │   ├── MainMenu.ts            (adaptado — vira a tela de título do racer)
    │   ├── Game.ts                (adaptado — hospeda RacerEngine + RoadRenderer + Hud)
    │   └── GameOver.ts            (adaptado, opcional — "corrida concluída")
    └── racer/                     (novo — o "motor" do jogo, sem import de `phaser`)
        ├── util.ts
        ├── types.ts
        ├── constants.ts
        ├── sprites.ts
        ├── background.ts
        ├── Road.ts
        ├── Car.ts
        ├── TrafficManager.ts
        ├── scenery.ts
        ├── RacerEngine.ts         (novo)
        ├── RoadRenderer.ts        (novo — depende de Phaser, fica fora de racer/ ou recebe scene injetada)
        └── Hud.ts                 (novo — idem)
```

> Nota sobre `RoadRenderer.ts`/`Hud.ts`: apesar de "novos", eles **dependem do Phaser**
> (`Phaser.GameObjects.Graphics`, `Image`, `Text`), então não são tão "puros" quanto o resto de
> `racer/`. Uma opção é deixá-los em `racer/` mesmo assim (já que representam a versão Phaser dos
> antigos `Renderer`/`Hud`) e só `RacerEngine` permanece 100% livre de import de `phaser` — essa
> distinção fina é um detalhe de organização a confirmar na Fase 3 (ver
> [03-fases-execucao.md](03-fases-execucao.md)), não bloqueia o restante do plano.

## Assets

Copiar (não mover — `app/public/` continua servindo o projeto TS existente):
- `app/public/images/sprites.png` → `racer-phaser/public/assets/racer/sprites.png`
- `app/public/images/background.png` → `racer-phaser/public/assets/racer/background.png`
- `app/public/music/*` → `racer-phaser/public/assets/racer/music/`

O template já usa `public/assets/` como convenção para os PNGs de exemplo (`bg.png`, `logo.png`) —
o subdiretório `racer/` só evita misturar os assets do racer com os do template original (que
podem ser removidos quando não forem mais necessários, ex.: `logo.png` da tela de menu padrão).

Os arquivos `images/sprites.js`/`images/background.js` da raiz do repositório (as tabelas de
coordenadas geradas por `rake resprite`, usadas pelas versões HTML originais) **não precisam ser
regenerados** — os números já foram portados manualmente para `app/src/core/sprites.ts`/
`background.ts`, e são esses arquivos TypeScript que servem de fonte para `racer-phaser/src/game/
racer/sprites.ts`/`background.ts` (cópia verbatim, ver [01-arquitetura-alvo.md](01-arquitetura-alvo.md)).

## O que muda nas scenes do template

- **`Preloader`**: hoje só carrega os placeholders do template. Passa a carregar
  `assets/racer/sprites.png`, `assets/racer/background.png` e a(s) faixa(s) de música, e a
  registrar os frames nomeados a partir de `SPRITES`/`BACKGROUND` (ver
  [01-arquitetura-alvo.md — Pipeline de sprites](01-arquitetura-alvo.md#pipeline-de-sprites-uma-textura-uma-folha-frames-nomeados)).
- **`MainMenu`**: mantém a estrutura (título + esperar clique/tecla), mas troca o texto/fundo pelo
  tema do racer; ao confirmar, chama `this.scene.start('Game')` como já faz hoje.
- **`Game`**: deixa de ser o placeholder (`msg_text` + fundo verde) e passa a:
  1. instanciar `RacerEngine` (equivalente a `new RacerGameV4()` + `reset()`),
  2. instanciar `RoadRenderer` (recebe a própria scene, para criar `Graphics`/pool de `Image`),
  3. instanciar `Hud` (recebe a própria scene, para criar os `Text`),
  4. no `update(time, delta)`, chamar o passo fixo de `RacerEngine` e depois pedir a
     `RoadRenderer`/`Hud` para refletir o novo estado na tela.
- **`GameOver`**: opcionalmente reaproveitada para uma tela de "corrida concluída" (ex.: ao
  fechar uma volta, ou permanece como está, sem uso — decisão de baixo risco, não bloqueia o
  restante da migração).

## O que não muda

- `app/` inteiro — nenhuma alteração.
- `racer-phaser/vite/`, `tsconfig.json`, `package.json` do template — a menos que surja
  necessidade concreta durante a implementação (ex.: um alias de import para `racer/`).

## Próximo passo

[03 — Fases de Execução](03-fases-execucao.md) quebra a implementação em marcos sequenciais.
