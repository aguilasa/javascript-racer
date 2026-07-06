---
id: PHASER-TASK-18
title: "Medir e otimizar performance do pool (200 carros + cenário denso)"
type: implementação
category: frontend
phase: 9
depends_on: ["PHASER-TASK-17"]
status: pendente
---

# PHASER-TASK-18: Medir e otimizar performance do pool (200 carros + cenário denso)

## Contexto

- **Plano completo:** `docs/migracao-phaser/04-riscos-decisoes.md`, "Performance do pool de
  sprites/carros" e "Custo de `Graphics` redesenhado por frame".
- Todas as peças visuais (pista via `Graphics`, sprites de cenário + carros via pool de `Image`,
  parallax via `TileSprite`) já estão integradas nas fases anteriores — esta tarefa é sobre medir
  e, se necessário, ajustar, não sobre adicionar funcionalidade nova.

## Objetivo

1. Medir o FPS (`this.game.loop.actualFps`) em um trecho do circuito com 200 carros + cenário
   denso simultaneamente visíveis (dentro de `drawDistance`).
2. Se o FPS estiver visivelmente abaixo do que o port TypeScript (`v4.final.html`/`RacerGameV4`)
   entrega no mesmo hardware, investigar e ajustar: tamanho do pool, frequência de `setCrop`,
   número de segmentos redesenhados por frame (`drawDistance`), ou qualquer outro gargalo
   identificado.
3. Documentar os números medidos (antes/depois de qualquer ajuste) no Log de Execução.

## Passos

1. Rodar `mise exec -- npm run build` (build de produção, não dev server, para medir performance
   realista) e servir o resultado localmente.
2. Medir FPS em pelo menos dois trechos: um trecho leve (retas, poucos sprites) e um trecho
   pesado (curvas/morros com muitos carros e sprites de cenário simultâneos).
3. Comparar informalmente com a sensação de `v4.final.html` no mesmo navegador/máquina.
4. Se necessário, ajustar e remedir.

## Critério de conclusão

- [ ] FPS medido em trecho leve e trecho pesado, registrado no Log de Execução
- [ ] Comparação informal com `v4.final.html`/`RacerGameV4` registrada
- [ ] Se ajustes foram feitos, before/after documentado
- [ ] `mise exec -- npm run build` sem erros
- [ ] Commit feito em `feature/phaser-port` (se houve alteração de código)

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
