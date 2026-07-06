---
id: RACER-TASK-03
title: "Instalar/tipar stats.js via npm e criar a estrutura de pastas core/ e versions/*"
type: infraestrutura
category: ferramental
phase: 0
depends_on: ["RACER-TASK-01"]
status: pendente
---

# RACER-TASK-03: Instalar/tipar `stats.js` via npm e criar a estrutura de pastas

## Contexto

- **Plano completo:** `docs/projeto/02-estrutura-vite.md`, seção "`stats.js` (contador de
  FPS)"; `docs/projeto/04-riscos-decisoes-abertas.md`, item 3.
- O projeto original vendoriza `stats.js` (mr.doob's FPS counter) como arquivo local. A
  decisão registrada no plano é usar o pacote npm oficial em vez de copiar o arquivo.
- Pode rodar em paralelo com a RACER-TASK-02 (não há dependência entre elas, só de
  RACER-TASK-01).

## Objetivo

1. Instalar `stats.js` via npm dentro de `app/`.
2. Garantir que há tipos TypeScript disponíveis (via `@types/stats.js` se existir no registro
   npm, ou uma declaração `.d.ts` local caso não exista).
3. Criar a estrutura de pastas vazia que as próximas fases vão preencher.

## Passos

### 1) Instalar o pacote

```bash
cd /home/ingmar/WebstormProjects/javascript-racer/app
npm install stats.js
npm install -D @types/stats.js
```

Se `@types/stats.js` não existir no npm (verificar com `npm view @types/stats.js` antes),
criar `app/src/types/stats.js.d.ts` com uma declaração mínima cobrindo a API usada pelo
projeto original (`new Stats()`, `.dom` ou `.domElement`, `.update()`, `.showPanel()`/
equivalente — conferir a API exata da versão instalada, que pode diferir levemente da
`stats.js` vendorizada original documentada em
`docs/06-arquitetura-common-js.md#gamestats`).

### 2) Criar a estrutura de pastas

```bash
cd /home/ingmar/WebstormProjects/javascript-racer/app/src
mkdir -p core
mkdir -p versions/v1-straight versions/v2-curves versions/v3-hills versions/v4-final
```

Cada pasta de `versions/*` recebe um `.gitkeep` temporário (removido nas tarefas que
preenchem cada versão), só para o commit desta tarefa não ficar vazio nessas pastas.

### 3) Validar

```bash
cd /home/ingmar/WebstormProjects/javascript-racer/app
npm run typecheck
```

## Critério de conclusão

- [x] `stats.js` instalado como dependência em `app/package.json`
- [x] Tipos disponíveis (via `@types/stats.js` — versão 0.17.4 existe no npm)
- [x] `src/core/` criado (vazio, com `.gitkeep`)
- [x] `src/versions/v1-straight/`, `v2-curves/`, `v3-hills/`, `v4-final/` criados (já existiam do RACER-TASK-02)
- [x] `npm run typecheck` sem erros
- [x] Nenhum arquivo fora de `app/` foi alterado

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-05

**Resumo do que foi feito:** Verificado que `@types/stats.js` existe no npm (v0.17.4). Instalado
`stats.js` como dependência de runtime e `@types/stats.js` como devDependency. Criada pasta
`app/src/core/` com `.gitkeep`. As pastas `src/versions/v*` já existiam do RACER-TASK-02.
Typecheck passou sem erros.

**Problemas encontrados:** Nenhum.

**Arquivos criados/modificados:**
- `app/package.json` (adicionados `stats.js` e `@types/stats.js`)
- `app/package-lock.json` (atualizado pelo npm install)
- `app/src/core/.gitkeep` (criado)
