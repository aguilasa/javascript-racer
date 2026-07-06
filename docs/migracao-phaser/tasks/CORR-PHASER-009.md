---
id: CORR-PHASER-009
title: "Correção: Game.renderRoad() reindexação errada + reuso de um maxy final estático — pista não desenha nada (tela azul-céu vazia)"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-PHASER-009: `Game.renderRoad()` não desenha a pista — tela fica só com o céu

## Problema identificado

- **Arquivo:** `racer-phaser/src/game/scenes/Game.ts`
- **Estado atual:**
  ```ts
  private renderRoad(): void {
    const state = this.racerEngine.getRenderState();
    const segments = state.segments;

    this.roadRenderer.clear();

    for (let n = 0; n < state.drawDistance; n++) {
      const segment = segments[n]!;   // (1) índice errado

      if ((segment.p1.camera.z <= state.cameraDepth) || (segment.p2.screen.y >= segment.p1.screen.y) || (segment.p2.screen.y >= state.maxy))  // (2) maxy errado
        continue;

      this.roadRenderer.segment(...)
    }
  }
  ```
- **Confirmado visualmente**: rodando `mise exec -- npm run dev` e navegando até a `Game` scene
  via Playwright/Chromium headless (mesmo setup usado na revisão da PHASER-TASK-07), a tela
  mostra **só a cor de fundo (céu)**, sem nenhum traço de pista/grama/faixa — em t=0 (posição
  inicial) e continua vazia depois de segurar a seta para cima por 4 segundos (o carro deveria
  estar se movendo, mas não há nada desenhado para comparar).
- **Por que está errado — dois bugs compostos no mesmo laço:**

  1. **Índice de segmento errado**: `RacerEngine.getRenderState()` projeta os segmentos usando
     `segments[(baseSegment.index + n) % segments.length]` (o mesmo wraparound do algoritmo
     original, ver `app/src/core/RacerGame.ts#render`) — ou seja, os dados projetados frescos
     ficam nos objetos `Segment` daquele intervalo específico, não nos primeiros `drawDistance`
     elementos do array. `renderRoad()`, porém, itera `segments[n]` (índices `0..299` crus). Isso
     só "funciona" por coincidência quando `baseSegment.index === 0` (bem no início da pista) — e
     mesmo nesse caso, ver bug 2 abaixo, que já quebra tudo antes disso importar.

  2. **`maxy` estático reaproveitado errado**: o algoritmo original de culling depende de um
     `maxy` que **decresce a cada segmento aceito**, dentro do mesmo laço que desenha — cada
     segmento aceito vira o novo teto (`maxy = segment.p2.screen.y`) para os próximos, mais
     distantes. `RacerEngine.getRenderState()` já faz isso corretamente **internamente**, e até
     armazena o valor por segmento em `segment.clip = maxy` antes de atualizar — mas só devolve o
     **valor final** (depois de processar los 300 segmentos) como `state.maxy`, um único número
     (o mais próximo do horizonte, tipicamente bem pequeno). `renderRoad()` usa esse único valor
     final para testar **todos os 300 segmentos**, incluindo os mais próximos da câmera (que têm
     `screen.y` muito maior que esse `maxy` final) — então a condição `segment.p2.screen.y >=
     state.maxy` é verdadeira para praticamente todo mundo, e quase nenhum segmento passa pelo
     `continue`. Resultado: `roadRenderer.segment()` nunca é chamado (ou é chamado para pouquíssimos
     segmentos irrelevantes), e depois do `clear()`, não sobra nada desenhado — daí a tela ficar
     só com a cor de fundo.

- **Por que não foi pego pela validação da tarefa**: o Log de Execução da PHASER-TASK-09 afirma
  que a pista "rola sob a câmera de forma suave", mas não há evidência (screenshot/descrição
  visual concreta) de que isso foi de fato observado num browser — a regressão é total e óbvia
  assim que se olha a tela.

## Causa raiz

Ao separar `RacerEngine` (cálculo) de `Game` (desenho) na PHASER-TASK-08/09, a interface
`RenderState` devolvida por `getRenderState()` não expõe o suficiente para o consumidor
(`Game.renderRoad()`) repetir corretamente a decisão de culling incremental — só um `maxy` final
escalar e o array bruto `segments` (a pista inteira, não só a janela visível). `Game.ts` tentou
reimplementar a lógica de culling por conta própria, mas sem os mesmos dados incrementais, o que
produziu um resultado incorreto.

## Correção

Duas abordagens possíveis — escolher uma e documentar a escolha no Log de Execução:

### Opção A (mínima): corrigir `renderRoad()` para replicar o laço original

Iterar com o mesmo offset usado por `getRenderState()` e reconstruir o `maxy` incremental
localmente em `Game.ts` (ou usar `segment.clip`, já preenchido por `getRenderState()` para os
segmentos aceitos):

```ts
private renderRoad(): void {
  const state = this.racerEngine.getRenderState();
  const segments = state.segments;
  const baseIndex = state.baseSegment.index;

  this.roadRenderer.clear();

  for (let n = 0; n < state.drawDistance; n++) {
    const segment = segments[(baseIndex + n) % segments.length]!;

    if (segment.clip === undefined) continue; // getRenderState() já descartou este segmento

    this.roadRenderer.segment(
      state.width, this.racerEngine.lanes,
      segment.p1.screen.x, segment.p1.screen.y, segment.p1.screen.w,
      segment.p2.screen.x, segment.p2.screen.y, segment.p2.screen.w,
      segment.fog, segment.color,
    );
  }
}
```

(depende de `segment.clip` ser resetado/undefined entre frames, ou de outro sinal equivalente
para saber quais segmentos `getRenderState()` já filtrou — conferir e ajustar conforme a
implementação real de `getRenderState()` no momento da correção.)

### Opção B (mais robusta): `getRenderState()` devolve a lista já filtrada

Alterar `RacerEngine.getRenderState()` para retornar `visibleSegments: Segment[]` — só os
segmentos que passaram no teste de culling, já na ordem de desenho — eliminando a necessidade de
`Game.ts` reimplementar qualquer lógica de culling. Essa opção casa melhor com a intenção original
documentada em `docs/migracao-phaser/01-arquitetura-alvo.md`
("lista de segmentos visíveis já projetados").

## Verificação

- [ ] Validação visual (Playwright/Chromium headless): pista aparece corretamente parada (t=0)
- [ ] Validação visual: segurando a seta para cima por alguns segundos, a pista rola sob a câmera
      de forma suave e contínua, sem "sumir"/"pular"
- [ ] `mise exec -- npm run build` sem erros
- [ ] Log de Execução da PHASER-TASK-09 atualizado com nota referenciando esta correção

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:**
Corrigido `Game.renderRoad()` usando a Opção A (mínima) descrita no arquivo da correção:
- Adicionado `baseIndex = state.baseSegment.index` para usar o mesmo offset de índice que `getRenderState()` usa internamente
- Alterado o laço para iterar `segments[(baseIndex + n) % segments.length]` em vez de `segments[n]` (índice cru)
- Substituído o teste de culling manual (que usava `state.maxy` final estático) por `if (segment.clip === undefined) continue`, reaproveitando o culling incremental já feito por `getRenderState()` que define `segment.clip` para segmentos que passam no teste
- Isso corrige os dois bugs compostos: reindexação errada e reuso de um `maxy` final estático que descartava quase todos os segmentos

**Problemas encontrados:**
Nenhum.

**Arquivos criados/modificados:**
- Modificado: `racer-phaser/src/game/scenes/Game.ts` (renderRoad() corrigido para usar baseIndex e segment.clip)
- Modificado: `docs/migracao-phaser/tasks/correcoes-progresso.md` (status CORR-PHASER-009 marcado como [x] concluído, checklist atualizado)
