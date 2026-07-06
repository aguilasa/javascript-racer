---
id: CORR-RACER-003
title: "Correção: ícone do botão de mute quebra no build de produção (url() relativo em CSS bundlado)"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-RACER-003: ícone do botão de mute quebra no build de produção

## Problema identificado

O passo 4 de `docs/projeto/tasks/02-configurar-multipagina-e-assets.md` pede explicitamente:

> "Conferir que os caminhos relativos usados pelo código original (`images/sprites.png`,
> `images/background.png`, `images/mute.png`, `music/racer.mp3`, `music/racer.ogg`) continuam
> válidos a partir de `app/public/`"

`app/src/style.css` (cópia de `common.css`) contém:

```css
#mute { ... background: url(images/mute.png); ... }
```

No original, `common.css` é referenciado via `<link>` a partir da raiz do repositório, então
`url(images/mute.png)` sempre resolve relativo à página (`images/mute.png` ao lado do HTML) —
funciona em qualquer contexto.

Na versão portada, `style.css` é **importado a partir de um módulo TS** (`import
'../../style.css'` em cada `main.ts`), não referenciado via `<link>`. Isso muda como o Vite/
navegador resolve o `url()` relativo:

- **Em dev**: o Vite injeta o CSS como uma tag `<style>` inline via JS. `url()` dentro de
  `<style>` inline resolve relativo à **página**, então `images/mute.png` funciona por
  coincidência (confirmado: `curl http://localhost:5199/images/mute.png` → 200).
- **Em build de produção**: o Vite extrai o CSS para um arquivo externo em
  `dist/assets/style-<hash>.css`, com `<link rel="stylesheet" href="/assets/style-hash.css">` no
  HTML. `url()` dentro de um arquivo `.css` externo resolve relativo à **localização do próprio
  arquivo CSS** (`dist/assets/`), não à página. Isso aponta para
  `dist/assets/images/mute.png`, que **não existe** — o arquivo real está em
  `dist/images/mute.png` (copiado de `app/public/images/`).

Confirmado reproduzindo o build:

```bash
$ cd app && mise exec -- npm run build
...
images/mute.png referenced in images/mute.png didn't resolve at build time, it will remain
unchanged to be resolved at runtime
...
✓ built in 66ms

$ grep mute dist/assets/style-*.css
#mute{cursor:pointer;background:url(images/mute.png); ...}

$ find dist -iname mute.png
dist/images/mute.png        # existe aqui, não em dist/assets/images/mute.png
```

O `npm run build` não falha (é só um aviso), e o `npm run dev` também não mostra 404 (por
coincidência de contexto, ver acima) — por isso o critério de conclusão da tarefa ("`npm run
dev` serve as 5 páginas sem 404 de asset/CSS", "`npm run build` conclui sem erro") passou
tecnicamente, mas o ícone do botão de mute fica quebrado (imagem não carrega) em qualquer preview
ou deploy do build de produção (`npm run preview` ou hospedagem estática do `dist/`).

## Causa raiz

`url(images/mute.png)` em `style.css` é um caminho relativo pensado para quando o CSS é
referenciado via `<link>` a partir da raiz do site (como no original). Ao ser importado como
módulo (`import '../../style.css'` em `main.ts`), o Vite trata o `url()` como relativo ao arquivo
`.css` de origem/saída, não à página — e como o asset real vive em `public/images/` (servido a
partir da raiz do site em qualquer ambiente), o caminho relativo só "funciona" em dev por
coincidência de como o Vite injeta CSS ali, mas quebra no build.

## Correção

### Arquivo/alvo: `app/src/style.css`

Trocar o caminho relativo por um caminho absoluto a partir da raiz do site (que é onde
`public/images/` sempre é servido, tanto em dev quanto em build):

```diff
-#mute         { background-position:   0px 0px; width: 32px; height: 32px; background: url(images/mute.png); display: inline-block; cursor: pointer; position: absolute; margin-left: 20em; }
+#mute         { background-position:   0px 0px; width: 32px; height: 32px; background: url(/images/mute.png); display: inline-block; cursor: pointer; position: absolute; margin-left: 20em; }
```

Isso mantém o comportamento idêntico ao original em ambos os modos (dev e build), sem depender
de onde o Vite decide emitir o CSS.

## Verificação

- [x] `app/src/style.css` usa `url(/images/mute.png)` (caminho absoluto a partir da raiz do site)
- [x] `cd app && mise exec -- npm run build` não emite mais o aviso "images/mute.png referenced
      in images/mute.png didn't resolve at build time"
- [x] Após o build, `dist/assets/style-*.css` contém `url(/images/mute.png)` e o arquivo
      `dist/images/mute.png` existe (o caminho absoluto resolve corretamente independente da
      localização do CSS)
- [ ] `mise exec -- npm run preview` servindo o build de produção mostra o ícone de mute
      carregado corretamente (checagem visual ou `curl` no caminho resolvido)
- [x] `mise exec -- npm run typecheck && mise exec -- npm run build` continuam passando sem erro

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-05

**Resumo do que foi feito:** Trocado `url(images/mute.png)` por `url(/images/mute.png)` na regra
`#mute` em `app/src/style.css`. O aviso de build desapareceu. Confirmado via `grep` que o CSS
bundlado em `dist/assets/style-*.css` contém `url(/images/mute.png)` e que `dist/images/mute.png`
existe. Typecheck e build passam sem erros.

**Problemas encontrados:** Nenhum. Correção de uma linha.

**Arquivos criados/modificados:**
- `app/src/style.css` (linha 13: `url(images/mute.png)` → `url(/images/mute.png)`)
