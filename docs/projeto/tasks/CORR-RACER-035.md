---
id: CORR-RACER-035
title: "Correção: sprites de cenário usam âncora horizontal de carro (-0.5) em vez da âncora por lado do original"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-RACER-035: sprites de cenário usam âncora horizontal de carro (`-0.5`) em vez da âncora por lado do original

## Problema identificado

Relatado pelo usuário: árvores, palmeiras, pilares e billboards aparecem ocupando parte da área
da pista — objetos do lado direito aparecem deslocados, objetos do lado esquerdo também.

`docs/05-v4-final.md#56` mostra que o original usa **âncoras horizontais diferentes** para carros
e para sprites de cenário na chamada de `Render.sprite`:

```javascript
// carros — offsetX = -0.5 (sprite centralizado no X calculado a partir do offset de faixa)
Render.sprite(ctx, width, height, resolution, roadWidth, sprites, car.sprite, spriteScale, spriteX, spriteY, -0.5, -1, segment.clip);

// sprites de cenário — offsetX depende do lado do sprite
Render.sprite(ctx, width, height, resolution, roadWidth, sprites, sprite.source, spriteScale, spriteX, spriteY, (sprite.offset < 0 ? -1 : 0), -1, segment.clip);
```

Em `Renderer.sprite`, `offsetX` desloca a imagem por `destW * offsetX` antes de desenhar — ou
seja, ele define **qual borda do sprite fica ancorada** no `destX` calculado
(`p1.screen.x + scale*offset*roadWidth*width/2`, a posição de tela do offset lateral):

- Sprites à esquerda da pista (`offset < 0`): `offsetX = -1` → a imagem inteira é desenhada **à
  esquerda** de `destX` (a borda **direita** do sprite fica ancorada em `destX`, próxima da
  pista, e o sprite se estende para fora, mais para a esquerda).
- Sprites à direita da pista (`offset >= 0`): `offsetX = 0` → a imagem é desenhada **a partir**
  de `destX` (a borda **esquerda** fica ancorada em `destX`, próxima da pista, e o sprite se
  estende para fora, mais para a direita).

Ou seja: `destX` sempre representa a borda do sprite **mais próxima da pista**, e o sprite inteiro
se estende para fora (longe da pista) a partir dali.

Já `RacerGameV4.renderExtraLayer()` (`app/src/versions/v4-final/RacerGameV4.ts`) usava
`offsetX = -0.5` (centralizado) tanto para carros **quanto para sprites de cenário**:

```ts
if ('sprite' in obj) {
  this.renderer.sprite(
    ..., obj.scale, obj.x, obj.y,
    -0.5,   // <-- deveria ser (obj.sprite.offset < 0 ? -1 : 0)
    -1,
    obj.segment.clip ?? maxy
  );
}
```

Com `offsetX = -0.5`, o sprite fica **centralizado** em `destX` em vez de ancorado pela borda
interna — metade da largura do sprite passa a se estender **para o lado da pista** (invadindo a
área da estrada), independentemente do lado em que o sprite está.

## Causa raiz

Ao portar a segunda passada de render (`docs/05-v4-final.md#56`), o valor de `offsetX` usado para
carros (`-0.5`, um valor fixo e simples) foi reaproveitado também para os sprites de cenário, sem
notar que o original usa uma fórmula condicional diferente (`sprite.offset < 0 ? -1 : 0`)
especificamente para eles.

## Correção

### Arquivo/alvo: `app/src/versions/v4-final/RacerGameV4.ts`

No ramo de sprites de cenário de `renderExtraLayer` (branch `if ('sprite' in obj)`), calcular
`offsetX` a partir do lado do sprite em vez de usar o literal `-0.5`:

```ts
if ('sprite' in obj) {
  const offsetX = obj.sprite.offset < 0 ? -1 : 0;
  this.renderer.sprite(
    ..., obj.scale, obj.x, obj.y,
    offsetX,
    -1,
    obj.segment.clip ?? maxy
  );
}
```

O ramo de carros continua usando `-0.5` (correto, sem alteração).

## Verificação

- [x] Em `v4.html`, árvores/palmeiras/pilares/billboards ficam totalmente fora da faixa de
      rodagem (não sobrepõem a pista)
- [x] Objetos à esquerda da pista se estendem para a esquerda; objetos à direita se estendem
      para a direita (a partir da borda mais próxima da pista)
- [x] Carros de tráfego continuam centralizados corretamente na própria posição lateral
- [x] `npm run typecheck` e `npm run build` continuam sem erros

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:** No ramo de sprites de cenário de `renderExtraLayer`
(`RacerGameV4.ts`), substituído o literal `-0.5` por `const offsetX = obj.sprite.offset < 0 ? -1 : 0;`
passado como argumento de `offsetX` para `this.renderer.sprite(...)`, replicando a fórmula do
original (`docs/05-v4-final.md#56`). O ramo de carros manteve `-0.5`, inalterado. Typecheck e
build passaram.

**Problemas encontrados:** Nenhum. Correção pontual de uma linha.

**Arquivos criados/modificados:**
- `app/src/versions/v4-final/RacerGameV4.ts` (ramo de sprites de `renderExtraLayer`: `offsetX`
  calculado por lado em vez do literal `-0.5`)
