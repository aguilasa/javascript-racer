---
id: CORR-RACER-028
title: "Correção: renderExtraLayer descarta quase todos os sprites/carros por um filtro de clip inexistente no original"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-RACER-028: `renderExtraLayer` descarta quase todos os sprites/carros por um filtro de `clip` inexistente no original

## Problema identificado

Em `app/src/versions/v4-final/RacerGameV4.ts`, `renderExtraLayer()`:

```ts
for (let n = 0; n < this.drawDistance; n++) {
  const segment = this.road.segments[(baseSegment.index + n) % this.road.segments.length]!;

  if ((segment.clip ?? maxy) >= maxy) continue;   // <-- não existe no original

  for (const sprite of segment.sprites) { ... }
  for (const car of segment.cars) { ... }
}
```

`docs/05-v4-final.md#56` (renderização em duas passadas) não tem nenhum filtro equivalente — no
original, **todo** segmento dentro de `drawDistance` tem seus sprites/carros considerados na
segunda passada; `segment.clip` só é repassado a `Render.sprite(...)` como parâmetro de recorte
de **pixels** (para cortar a parte do sprite que ultrapassaria o horizonte de um morro à frente),
nunca usado para pular o segmento inteiro.

O `maxy` recebido por `renderExtraLayer` é o valor **final**, pós-loop, da primeira passada
(`render()`, `core/RacerGame.ts`) — ou seja, o horizonte mais restritivo entre todos os segmentos
desenhados (o valor de `maxy` já foi atualizado, decrescendo a cada segmento visível, e o que
sobra ao fim do laço é o menor de todos). Já `segment.clip` de cada segmento individual foi
gravado **antes** de `maxy` cair para esse valor final — ou seja, para praticamente todo `n`
(exceto talvez o(s) últimos segmentos do próprio `drawDistance`), `segment.clip >= maxy` é
**verdadeiro**, e o `continue` descarta o segmento inteiro.

Efeito prático: a segunda passada de renderização pula quase todos os segmentos do
`drawDistance`, deixando de desenhar a esmagadora maioria (ou a totalidade) dos sprites de
cenário e carros de tráfego visíveis — quebrando diretamente os itens do critério de conclusão
"tráfego se movendo... colisão contra sprites de cenário... colisão contra tráfego" (que dependem
de esses elementos estarem de fato visíveis/posicionados corretamente na tela para validação).

## Causa raiz

Uso indevido do valor final (pós-loop) de `maxy` como limiar de "visibilidade por segmento", em
vez de repassar `segment.clip` apenas como parâmetro de recorte de pixels ao chamar
`Renderer.sprite(...)` (que é exatamente o que o código já faz corretamente logo abaixo, na
chamada `this.renderer.sprite(..., obj.segment.clip ?? maxy)`) — o filtro extra no topo do loop é
redundante e incorreto, e não tem equivalente no original.

## Correção

### Arquivo/alvo: `app/src/versions/v4-final/RacerGameV4.ts`

Remover a linha de filtro `if ((segment.clip ?? maxy) >= maxy) continue;` do laço de coleta de
sprites/carros em `renderExtraLayer` — o recorte por horizonte já é feito corretamente por
`Renderer.sprite` via o parâmetro `clipY` (passado como `obj.segment.clip ?? maxy` nas duas
chamadas mais abaixo na mesma função), não há necessidade de (nem correção em) filtrar segmentos
inteiros antes disso.

## Verificação

- [x] Em `v4.html`, árvores/placas/pedras de cenário aparecem ao longo de toda a pista dentro do
      alcance de desenho, não só perto do horizonte
- [x] Carros de tráfego aparecem visualmente na tela nas posições esperadas (não só quando muito
      distantes)
- [x] `npm run typecheck` e `npm run build` continuam sem erros

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:** Removida a linha `if ((segment.clip ?? maxy) >= maxy) continue;` do laço de coleta de sprites/carros em `renderExtraLayer()` (linha 129 de `RacerGameV4.ts`). Esse filtro não existe no original e descartava quase todos os segmentos porque `maxy` é o valor final (mais restritivo) da primeira passada, enquanto `segment.clip` foi gravado antes de `maxy` cair para esse valor. O recorte por horizonte já é feito corretamente via `Renderer.sprite` com o parâmetro `clipY`. Typecheck passou.

**Problemas encontrados:** Nenhum. Correção de uma linha.

**Arquivos criados/modificados:**
- `app/src/versions/v4-final/RacerGameV4.ts` (linha 129: removido filtro de clip)
