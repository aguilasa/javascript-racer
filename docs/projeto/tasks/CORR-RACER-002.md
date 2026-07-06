---
id: CORR-RACER-002
title: "Correção: assets de exemplo do template Vite não removidos em app/src/assets/"
type: implementação
category: ferramental
status: pendente
depends_on: []
---

# CORR-RACER-002: assets de exemplo do template Vite não removidos em `app/src/assets/`

## Problema identificado

O passo 6 de `docs/projeto/tasks/01-criar-scaffold-vite.md` ("Limpar o boilerplate padrão do
template") pede a remoção do conteúdo de exemplo gerado por
`npm create vite@latest -- --template vanilla-ts`, e o critério de conclusão da tarefa lista
explicitamente "Boilerplate de exemplo do template removido".

O Log de Execução da tarefa registra a remoção de `src/counter.ts`, `src/style.css`,
`src/main.ts` (substituído por stub), `public/favicon.svg` e `public/icons.svg` — mas os
seguintes arquivos de exemplo do template, também parte do mesmo boilerplate, continuam
presentes no repositório:

```bash
$ find app/src -type f
app/src/main.ts
app/src/assets/typescript.svg
app/src/assets/vite.svg
app/src/assets/hero.png
```

Nenhum dos três é referenciado em qualquer lugar do projeto:

```bash
$ grep -rn "typescript.svg\|vite.svg\|hero.png" app/src app/index.html
# (nenhum resultado)
```

São arquivos mortos, remanescentes do boilerplate de exemplo que a própria tarefa pediu para
remover.

## Causa raiz

A limpeza de boilerplate executada cobriu a raiz de `src/` e `public/`, mas não a subpasta
`src/assets/`, que também veio populada pelo scaffold do template.

## Correção

### Arquivo/alvo: `app/src/assets/`

Remover os arquivos `typescript.svg`, `vite.svg` e `hero.png` (e a pasta `assets/`, se ficar
vazia após a remoção), já que nenhum é referenciado pelo código atual.

## Verificação

- [x] `app/src/assets/` não contém mais `typescript.svg`, `vite.svg` nem `hero.png`
- [x] `cd app && mise exec -- npm run typecheck && mise exec -- npm run build` continuam
      passando sem erro após a remoção

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-05

**Resumo do que foi feito:** Removidos `app/src/assets/typescript.svg`, `app/src/assets/vite.svg`
e `app/src/assets/hero.png`. A pasta `app/src/assets/` ficou vazia e também foi removida.
Confirmado que nenhum dos arquivos era referenciado no código do projeto. Typecheck e build
passaram sem erros.

**Problemas encontrados:** Nenhum.

**Arquivos criados/modificados:**
- `app/src/assets/typescript.svg` (removido)
- `app/src/assets/vite.svg` (removido)
- `app/src/assets/hero.png` (removido)
- `app/src/assets/` (diretório removido, ficou vazio)
