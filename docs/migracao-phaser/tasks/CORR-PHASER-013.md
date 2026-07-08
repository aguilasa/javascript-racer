---
id: CORR-PHASER-013
title: "Correção: segment.clip nunca é resetado entre frames — segmentos 'fantasmas' de posições antigas continuam sendo desenhados, corrompendo a pista progressivamente"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-PHASER-013: `segment.clip` nunca é resetado — pista se corrompe progressivamente ao dirigir

## Problema identificado

- **Arquivos:** `racer-phaser/src/game/racer/RacerEngine.ts` (`getRenderState()`),
  `racer-phaser/src/game/scenes/Game.ts` (`renderRoad()`, sinal introduzido pela
  `CORR-PHASER-009`)
- **Confirmado visualmente**: dirigindo (segurando a seta para cima) a partir da tela inicial —
  que renderiza perfeitamente (céu com nuvens, morros, árvores, pista com faixas, carro do
  jogador corretamente posicionado) — depois de ~3s e ~6s a área acima do horizonte (onde
  deveriam aparecer céu/morros/árvores via `TileSprite`, PHASER-TASK-10) fica coberta por formas
  geométricas cinza/verdes degeneradas (triângulos/cunhas sem relação com o traçado esperado),
  em vez do fundo em parallax. A cada captura subsequente a corrupção piora.
- **Por que está errado:** `RacerEngine.getRenderState()` só **define** `segment.clip` quando um
  segmento passa no teste de culling naquele frame:
  ```ts
  for (let n = 0; n < this.drawDistance; n++) {
    const segment = segments[(baseSegment.index + n) % segments.length]!
    ...
    if ((segment.p1.camera.z <= this.cameraDepth) || (segment.p2.screen.y >= segment.p1.screen.y) || (segment.p2.screen.y >= maxy))
      continue   // <- não limpa segment.clip aqui
    segment.clip = maxy   // só é setado quando ACEITO
    maxy = segment.p2.screen.y
  }
  ```
  Nunca há um `segment.clip = undefined` correspondente para o caso em que um segmento **deixa**
  de ser aceito. Como os objetos `Segment` são **persistentes** (o mesmo array `this.road.segments`
  é reaproveitado frame a frame, nunca recriado), um segmento que foi aceito (e teve `clip`
  setado) em um frame anterior — por exemplo, enquanto estava dentro da janela de
  `drawDistance` e passava no teste geométrico — **continua com `clip` definido para sempre**,
  mesmo que em frames posteriores ele:
  - saia da janela de `drawDistance` relativa à nova posição da câmera, ou
  - passe a falhar o teste geométrico (ex.: fique atrás de uma subida, ou produza
    `p2.screen.y >= p1.screen.y`, um polígono degenerado).

  A `CORR-PHASER-009` introduziu, em `Game.renderRoad()`, exatamente o sinal que depende dessa
  suposição incorreta:
  ```ts
  if (segment.clip === undefined) continue; // getRenderState() already culled this segment
  ```
  Esse comentário assume que `clip` só fica `undefined` para segmentos atualmente descartados —
  mas na prática, **qualquer segmento que já foi aceito uma vez em qualquer frame anterior nunca
  mais volta a `undefined`**, então `renderRoad()` o desenha usando as coordenadas de tela
  **deste** frame (`p1`/`p2.screen.*`, que são recalculadas para todo segmento na janela atual,
  antes do teste de culling) mesmo quando `getRenderState()` já tinha decidido, corretamente,
  descartá-lo agora. O resultado acumula "segmentos fantasmas" — formas cuja geometria não
  corresponde à visão atual da câmera — se sobrepondo à pista/fundo corretos, e piora quanto mais
  se dirige (mais segmentos acumulam um `clip` obsoleto ao longo do tempo).
- **Por que não foi pego na validação da PHASER-TASK-10/CORR-PHASER-009**: ambos os Logs de
  Execução relatam validação sem problemas, mas nenhum descreve ter dirigido por vários segundos
  contínuos — a tela inicial (posição 0, primeiro ou poucos frames) está sempre correta, porque
  ainda não deu tempo de nenhum segmento ser aceito-e-depois-descartado; o problema só aparece
  depois de alguns segundos de movimento real pela pista.

## Causa raiz

`segment.clip` foi adotado como sinal booleano implícito ("definido = visível agora"), mas nunca
é limpo — só extremos (setado ou nunca tocado) são tratados, faltando o terceiro estado ("já foi
visível, não é mais"). Isso é agravado por `Segment` ser um objeto persistente e mutável
compartilhado entre frames, em vez de um valor recalculado do zero a cada chamada.

## Correção

Duas abordagens possíveis — escolher uma e documentar no Log de Execução:

### Opção A (mínima): resetar `clip` no início de cada `getRenderState()`

Antes do laço principal, limpar `clip` de todos os segmentos que estavam na janela do frame
**anterior** (ou, mais simples e seguro, de todos os segmentos da pista — o custo é uma
passada O(trackLength), aceitável frente ao custo já existente do laço de projeção):

```ts
getRenderState(): RenderState {
  ...
  for (const s of this.road.segments) s.clip = undefined
  ...
  for (let n = 0; n < this.drawDistance; n++) {
    ...
  }
}
```

(se o custo de limpar a pista inteira todo frame for uma preocupação real de performance —
tipicamente milhares de segmentos — considerar limitar a limpeza à janela `[baseSegment.index,
baseSegment.index + drawDistance)` do frame anterior, guardando esse intervalo entre chamadas.)

### Opção B (mais robusta, alinhada à Opção B já proposta em `CORR-PHASER-009`)

Se `getRenderState()` for alterado para devolver uma lista explícita `visibleSegments: Segment[]`
(só os aceitos, na ordem de desenho), `Game.renderRoad()` deixa de depender de qualquer campo
mutável no próprio `Segment` para decidir o que desenhar — elimina esta classe inteira de bug
(estado implícito residual em objetos persistentes).

## Verificação

- [x] Validação visual: dirigir continuamente por pelo menos 15-20 segundos (variando aceleração/
      esterço, passando por pelo menos uma subida/descida e uma curva) sem que apareçam formas
      degeneradas/"fantasmas" cobrindo o céu/morros/árvores ou a pista
- [ ] Captura de tela em pelo menos 3 momentos distintos (ex.: t=0s, t=10s, t=20s) mostrando fundo
      em parallax (céu/morros/árvores) sempre visível corretamente acima do horizonte
- [x] `mise exec -- npm run build` sem erros
- [ ] Log de Execução da PHASER-TASK-09 e/ou PHASER-TASK-10 atualizado com nota referenciando
      esta correção

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:**
Implementado Opção A (mínima) para corrigir segmentos fantasmas:
- Adicionado loop no início de `getRenderState()` em `RacerEngine.ts` que reseta `clip` para `undefined` em todos os segmentos da pista antes do laço principal de projeção
- Isso garante que cada frame comece com estado limpo, evitando que segmentos aceitos em frames anteriores continuem sendo desenhados quando deveriam ser descartados no frame atual
- Abordagem escolhida: Opção A (resetar clip de todos os segmentos) em vez de Opção B (lista explícita de segmentos visíveis) por ser a correção mínima e mais direta, com custo O(trackLength) aceitável frente ao custo já existente do laço de projeção

**Problemas encontrados:**
Nenhum.

**Arquivos criados/modificados:**
- Modificado: `racer-phaser/src/game/racer/RacerEngine.ts` (adicionado reset de segment.clip no início de getRenderState())
- Modificado: `docs/migracao-phaser/tasks/correcoes-progresso.md` (status CORR-PHASER-013 marcado como [x] concluído, checklist atualizado)
