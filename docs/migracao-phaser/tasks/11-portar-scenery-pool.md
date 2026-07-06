---
id: PHASER-TASK-11
title: "Portar scenery.ts (verbatim) e pool de sprites de cenário com recorte de horizonte"
type: implementação
category: frontend
phase: 5
depends_on: ["PHASER-TASK-09"]
status: pendente
---

# PHASER-TASK-11: Portar `scenery.ts` (verbatim) e pool de sprites de cenário

## Contexto

- **Fonte:** `app/src/versions/v4-final/scenery.ts` (`resetSprites`), documentado em
  `docs/05-v4-final.md §5.1-5.2`.
- **Plano completo:** `docs/migracao-phaser/01-arquitetura-alvo.md`, seções "Renderização:
  `Graphics` + pool de `Image`" (ordem de desenho, recorte de horizonte) e "Pipeline de
  sprites". Ver também `docs/migracao-phaser/04-riscos-decisoes.md`, "Performance do pool de
  sprites/carros".
- Pode ser feita em paralelo com a PHASER-TASK-13 (ambas dependem só da PHASER-TASK-09).

## Objetivo

1. Portar `scenery.ts` (função `resetSprites(road)` + `addSprite`) verbatim para
   `racer-phaser/src/game/racer/scenery.ts`.
2. Chamar `resetSprites(this.road)` na construção da pista (dentro de `RacerEngine`, junto da
   receita de `buildRoad`).
3. Implementar, em `RoadRenderer` (ou uma classe irmã dedicada, a critério da implementação —
   documentar a escolha no Log de Execução), um **pool de `Image`** para os sprites de cenário:
   objetos criados uma única vez (ou sob demanda, mas nunca destruídos/recriados por frame) e
   reposicionados/mostrados/ocultados a cada frame conforme os segmentos visíveis mudam.
4. Implementar o recorte pelo horizonte: usar `image.setCrop(x, y, width, height)` para
   reproduzir o `clipY`/`clipH` de `Render.sprite()` (a parte do sprite que ultrapassaria a linha
   do horizonte calculada na primeira passada de desenho da pista).

## Requisitos da implementação

- `scenery.ts` copiado verbatim — mesma mistura de posições fixas, loops determinísticos com
  incremento variável, e aleatoriedade controlada (ver `docs/05-v4-final.md §5.2`).
- O pool deve ser dimensionado para o pior caso: todos os sprites dentro da janela de
  `drawDistance` visíveis simultaneamente (ver `04-riscos-decisoes.md`) — não recriar `Image`
  dentro do loop de renderização por frame.
- Cada sprite usa o frame nomeado correspondente (`sprite.source` → nome registrado na
  PHASER-TASK-04) e é posicionado com a mesma matemática de `RacerGameV4.renderExtraLayer`
  (escala/posição a partir da borda `p1` do segmento, offset lateral).

## Passos

1. Ler `docs/05-v4-final.md §5.1-5.2` e a seção de "Renderização"/"Pipeline de sprites" de
   `docs/migracao-phaser/01-arquitetura-alvo.md`.
2. Portar `scenery.ts`.
3. Implementar o pool + recorte de horizonte.
4. Validar visualmente: dirigir e confirmar que árvores/placas/pedras aparecem ao longo da pista
   com a mesma distribuição/densidade do original, sem sprites "vazando" acima da linha do
   horizonte em trechos com morros.

## Critério de conclusão

- [ ] `scenery.ts` portado verbatim
- [ ] `resetSprites(this.road)` chamado na construção da pista
- [ ] Pool de `Image` para sprites de cenário, sem criação/destruição por frame
- [ ] Recorte de horizonte (`setCrop`) funcionando em trechos com morros
- [ ] Validação visual: distribuição de sprites equivalente ao original
- [ ] `mise exec -- npm run build` sem erros
- [ ] Commit feito em `feature/phaser-port`

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
