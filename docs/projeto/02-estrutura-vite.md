# 02 — Estrutura do Projeto Vite

## Onde o projeto mora

Um novo diretório **`app/`** na raiz do repositório, ao lado dos arquivos originais:

```
javascript-racer/
├── index.html                 ← original, intocado
├── v1.straight.html            ← original, intocado
├── v2.curves.html               ← original, intocado
├── v3.hills.html                 ← original, intocado
├── v4.final.html                  ← original, intocado
├── common.js / stats.js / common.css / images/ / music/ / Rakefile   ← originais, intocados
├── docs/                       ← esta documentação
└── app/                        ← NOVO: projeto Vite + TypeScript
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── index.html               (menu, equivalente ao index.html raiz)
    ├── v1.html
    ├── v2.html
    ├── v3.html
    ├── v4.html
    ├── public/
    │   ├── images/              (cópia de ../images)
    │   └── music/               (cópia de ../music)
    └── src/
        ├── core/
        │   ├── types.ts
        │   ├── dom.ts
        │   ├── util.ts
        │   ├── constants.ts
        │   ├── sprites.ts
        │   ├── background.ts
        │   ├── GameLoop.ts
        │   ├── AssetLoader.ts
        │   ├── InputController.ts
        │   ├── StatsPanel.ts
        │   ├── MusicPlayer.ts
        │   ├── Renderer.ts
        │   ├── Road.ts
        │   ├── TweakUI.ts
        │   └── RacerGame.ts
        └── versions/
            ├── v1-straight/
            │   ├── main.ts
            │   └── RacerGameV1.ts
            ├── v2-curves/
            │   ├── main.ts
            │   └── RacerGameV2.ts
            ├── v3-hills/
            │   ├── main.ts
            │   └── RacerGameV3.ts
            └── v4-final/
                ├── main.ts
                ├── RacerGameV4.ts
                ├── Car.ts
                ├── TrafficManager.ts
                ├── scenery.ts
                └── Hud.ts
```

O nome `app/` é a sugestão padrão deste plano — é curto e deixa claro que é "a aplicação nova", em
oposição à demo estática na raiz. Trocar o nome é só encontrar-substituir; está registrado como
decisão aberta em [04](04-riscos-decisoes-abertas.md#1-nome-da-pasta-do-novo-projeto) caso haja
preferência por outro (`ts/`, `vite-app/`, etc.).

## Bootstrap do projeto (Fase 0)

```bash
npm create vite@latest app -- --template vanilla-ts
cd app
npm install
```

Isso já entrega `package.json`, `tsconfig.json` e `vite.config.ts` mínimos, que serão ajustados:

- `tsconfig.json`: manter/reforçar `"strict": true`, e adicionar `"noUncheckedIndexedAccess": true`
  (os arrays de segmentos são indexados o tempo todo — vale a checagem extra) e
  `"noUnusedLocals"/"noUnusedParameters"` para manter o código enxuto durante o port.
- `package.json` scripts:
  ```json
  {
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "preview": "vite preview",
      "typecheck": "tsc --noEmit"
    }
  }
  ```
  (`test` entra depois, se/quando a decisão em
  [04](04-riscos-decisoes-abertas.md#4-testes-automatizados) for por incluir Vitest.)

## Aplicação multi-página (uma HTML por versão)

O Vite suporta múltiplos pontos de entrada HTML nativamente através de
`build.rollupOptions.input`, sem precisar de plugins extra — é exatamente o padrão "multi-page app"
da própria documentação do Vite. Cada versão continua sendo **uma página HTML de verdade**
(igual ao projeto original), cada uma importando seu próprio `main.ts`:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        v1:   resolve(__dirname, 'v1.html'),
        v2:   resolve(__dirname, 'v2.html'),
        v3:   resolve(__dirname, 'v3.html'),
        v4:   resolve(__dirname, 'v4.html'),
      },
    },
  },
})
```

Cada `vN.html` mantém a mesma estrutura de DOM que a versão original correspondente (canvas, HUD,
tweak UI, tag de áudio, botão de mute — ver o HTML de cada `v*.html` atual), só trocando o
`<script>` inline por `<script type="module" src="/src/versions/vN-.../main.ts">`. Isso preserva os
`id`s usados por `Dom.get(...)`, então a classe `TweakUI`/`Hud` portada pode reutilizar os mesmos
seletores documentados em [05-v4-final §5.7](../05-v4-final.md#57-hud-velocímetro-e-tempos-de-volta).

`app/index.html` replica o papel do `index.html` raiz: uma lista de links para as 4 versões (agora
apontando para `v1.html`…`v4.html` dentro do próprio `app/`).

## Assets (`images/`, `music/`)

**Decisão recomendada**: copiar `images/` e `music/` para dentro de `app/public/` uma única vez,
na Fase 0, em vez de configurar o Vite para servir arquivos de fora da raiz do projeto
(`server.fs.allow`). Motivos:

- É o padrão mais simples e portável em qualquer ambiente/SO.
- Os assets são poucos (algumas dezenas de PNGs pequenos + 2 arquivos de áudio) — duplicar o
  espaço em disco é desprezível.
- Evita qualquer necessidade de mexer na configuração de segurança do dev server do Vite.
- Os assets são **estáticos e congelados** (o próprio README original já os trata como
  "placeholder graphics" definitivos, sem plano de atualização) — o risco de desincronia entre a
  cópia e o original é baixo.

Arquivos referenciados por caminho relativo (`images/sprites.png`, `music/racer.mp3`, etc., como já
é hoje em `common.js`/`Game.loadImages`) continuam funcionando sem mudança de código, só que
servidos a partir de `app/public/` em vez da raiz do repo. Essa cópia é um passo manual (ou um
script `cp -r` de uma linha) documentado na Fase 0 — ver [03](03-fases-execucao.md).

A alternativa (apontar para os arquivos originais fora de `app/`) fica registrada em
[04](04-riscos-decisoes-abertas.md#2-cópia-de-assets-vs-referência-direta) para o caso de o
usuário preferir uma única fonte de verdade para as imagens.

## `stats.js` (contador de FPS)

O arquivo `stats.js` hoje é vendorizado localmente (mr.doob's Stats). Recomenda-se instalar o
pacote npm oficial (`npm install stats.js`) e escrever uma pequena `.d.ts` local se não houver
tipos publicados, em vez de copiar o arquivo `.js` para dentro de `app/`. Ver
[04](04-riscos-decisoes-abertas.md#3-statsjs-via-npm-vs-arquivo-vendorizado) para a alternativa.

## Próximo passo

[03 — Fases de Execução](03-fases-execucao.md) quebra a implementação (scaffolding + 4 versões +
polimento) em tarefas sequenciais, cada uma pequena o bastante para ser um pedido isolado.
