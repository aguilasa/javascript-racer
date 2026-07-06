---
id: RACER-TASK-02
title: "Configurar multi-page (index + v1-v4) e copiar assets para app/public/"
type: infraestrutura
category: ferramental
phase: 0
depends_on: ["RACER-TASK-01"]
status: pendente
---

# RACER-TASK-02: Configurar multi-page (index + v1–v4) e copiar assets para `app/public/`

## Contexto

- **Plano completo:** `docs/projeto/02-estrutura-vite.md`, seções "Aplicação multi-página" e
  "Assets (`images/`, `music/`)".
- O Vite suporta múltiplos pontos de entrada HTML nativamente via
  `build.rollupOptions.input` — cada versão do jogo continua sendo uma página HTML de
  verdade, igual ao projeto original.
- Esta tarefa só cria a "casca" das 5 páginas (`index.html`, `v1.html`…`v4.html`) e os
  assets — nenhum `main.ts` real ainda (isso começa na RACER-TASK-10).

## Objetivo

1. Criar `app/index.html`, `app/v1.html`, `app/v2.html`, `app/v3.html`, `app/v4.html`,
   cada um reaproveitando a estrutura de DOM do HTML original correspondente (mesmos `id`s de
   canvas, HUD, tweak UI, áudio, botão de mute), com o `<script>` inline trocado por
   `<script type="module" src="/src/versions/.../main.ts">` (arquivo que ainda não existe —
   tudo bem, será criado depois).
2. Configurar `vite.config.ts` com as 5 entradas.
3. Copiar `images/` e `music/` (da raiz do repo) para `app/public/`.

## Passos

### 1) Ler os HTMLs originais para não perder nenhum elemento de DOM

```bash
cd /home/ingmar/WebstormProjects/javascript-racer
```

Ler `index.html`, `v1.straight.html`, `v2.curves.html`, `v3.hills.html`, `v4.final.html` —
copiar a estrutura de `<body>` (tabela de controles/tweak UI, `<div id="racer">`,
`<canvas id="canvas">`, HUD — só existe na v4 —, `<audio id="music">`, `<span id="mute">`)
para o HTML correspondente em `app/`, mantendo os mesmos `id`s (essencial: o código portado
vai usar `Dom.get('canvas')`, `Dom.get('speed_value')`, etc., exatamente como o original).

### 2) Criar as 5 páginas em `app/`

- `app/index.html` — menu com links para `v1.html`…`v4.html` (equivalente ao `index.html`
  raiz).
- `app/v1.html` — baseado em `v1.straight.html`; script final:
  `<script type="module" src="/src/versions/v1-straight/main.ts"></script>`
- `app/v2.html` — baseado em `v2.curves.html`; aponta para
  `/src/versions/v2-curves/main.ts`
- `app/v3.html` — baseado em `v3.hills.html`; aponta para `/src/versions/v3-hills/main.ts`
- `app/v4.html` — baseado em `v4.final.html`; aponta para `/src/versions/v4-final/main.ts`

Cada página também deve importar o `common.css` original (copiar para `app/src/style.css` ou
similar e referenciar via `<link>`, ou importar do `main.ts` — escolher o padrão comum ao
Vite: import de CSS a partir do `.ts` de entrada é o caminho mais idiomático).

### 3) Configurar `vite.config.ts`

```ts
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

### 4) Copiar assets

```bash
mkdir -p app/public/images app/public/music
cp -r images/* app/public/images/
cp -r music/*  app/public/music/
```

Conferir que os caminhos relativos usados pelo código original (`images/sprites.png`,
`images/background.png`, `images/mute.png`, `music/racer.mp3`, `music/racer.ogg`) continuam
válidos a partir de `app/public/` (arquivos estáticos do Vite são servidos a partir da raiz,
então `images/sprites.png` funciona sem mudança de caminho).

### 5) Validar

```bash
cd app
npm run dev
```

Abrir `http://localhost:5173/index.html`, `v1.html`…`v4.html` — todas devem carregar sem erro
404 de asset (o jogo em si ainda não funciona, só a página/CSS/imagens de fundo da tweak UI,
já que `main.ts` ainda não existe nesta tarefa — é esperado ver um erro de módulo não
encontrado no console, ou a página em branco; **não** é esperado 404 de imagem/CSS).

```bash
npm run build
```

## Critério de conclusão

- [ ] `app/index.html`, `app/v1.html`, `app/v2.html`, `app/v3.html`, `app/v4.html` criados,
      preservando os `id`s de DOM dos originais
- [ ] `vite.config.ts` com as 5 entradas configuradas
- [ ] `app/public/images/` e `app/public/music/` com os mesmos arquivos da raiz do repo
- [ ] `npm run dev` serve as 5 páginas sem 404 de asset/CSS
- [ ] `npm run build` conclui sem erro
- [ ] Nenhum arquivo fora de `app/` foi alterado

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
