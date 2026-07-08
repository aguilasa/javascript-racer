---
id: CORR-RACER-029
title: "Correção: segunda passada de render inclui o segmento mais próximo (n=0), que o original exclui"
type: implementação
category: frontend
status: pendente
depends_on: ["CORR-RACER-028"]
---

# CORR-RACER-029: segunda passada de render inclui o segmento `n=0`, que o original exclui

## Problema identificado

`docs/05-v4-final.md#56` mostra que a segunda passada do `render()` original percorre os
segmentos em ordem inversa, **excluindo explicitamente** o segmento mais próximo da câmera:

```javascript
for(n = (drawDistance-1) ; n > 0 ; n--) { // nota: n > 0, nunca inclui n == 0
  ...
}
```

Já `RacerGameV4.renderExtraLayer` (`app/src/versions/v4-final/RacerGameV4.ts`) percorre:

```ts
for (let n = 0; n < this.drawDistance; n++) {
  ...
}
```

incluindo `n = 0` (o segmento onde está `baseSegment`, o mais próximo da câmera). Como os objetos
são coletados em uma lista e ordenados por profundidade ao final (`allObjects.sort(...)`), a
direção da iteração em si é inofensiva — mas a **inclusão do índice `n=0`** não tem equivalente no
original, que deliberadamente nunca considera sprites/carros desse segmento específico na segunda
passada.

Impacto prático é pequeno (é só um segmento, o mais próximo da câmera, tipicamente já teria seus
sprites com o carro do jogador na frente), mas é uma divergência real de comportamento em relação
ao algoritmo documentado.

## Causa raiz

Ao reescrever o laço de `n = drawDistance-1 downto 1` (decrescente) como um laço ascendente com
ordenação posterior (mudança estrutural razoável, já que a ordem de desenho passou a depender de
um sort explícito), o limite inferior `n > 0` do original não foi preservado — o laço ascendente
começa em `0` em vez de `1`.

## Correção

### Arquivo/alvo: `app/src/versions/v4-final/RacerGameV4.ts`

Em `renderExtraLayer`, iniciar o laço em `n = 1` (não `n = 0`), preservando a exclusão do
segmento mais próximo da câmera:

```ts
for (let n = 1; n < this.drawDistance; n++) {
  ...
}
```

## Verificação

- [x] `grep -n "for (let n = 1; n < this.drawDistance" app/src/versions/v4-final/RacerGameV4.ts`
      confirma o limite inferior corrigido
- [x] `npm run typecheck` e `npm run build` continuam sem erros

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:** Mudado o limite inferior do laço em `renderExtraLayer()` de `n = 0` para `n = 1` (linha 126 de `RacerGameV4.ts`). O original (`docs/05-v4-final.md#56`) usa `for(n = drawDistance-1; n > 0; n--)`, excluindo explicitamente o segmento mais próximo da câmera (`n=0`). Typecheck passou.

**Problemas encontrados:** Nenhum. Correção de um caractere.

**Arquivos criados/modificados:**
- `app/src/versions/v4-final/RacerGameV4.ts` (linha 126: `n = 0` → `n = 1`)
