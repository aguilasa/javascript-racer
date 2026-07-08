---
id: CORR-RACER-022
title: "Correção: scenery.ts omite 7 das 9 billboards fixas do início de resetSprites()"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-RACER-022: `scenery.ts` omite 7 das 9 billboards fixas do início de `resetSprites()`

## Problema identificado

- **Arquivo:** `app/src/versions/v4-final/scenery.ts`

O `resetSprites()` original (`v4.final.html`, linhas 545-553) começa com **nove** chamadas fixas
de billboard, uma a cada 20 segmentos, cada uma com um sprite diferente:

```javascript
addSprite(20,  SPRITES.BILLBOARD07, -1);
addSprite(40,  SPRITES.BILLBOARD06, -1);
addSprite(60,  SPRITES.BILLBOARD08, -1);
addSprite(80,  SPRITES.BILLBOARD09, -1);
addSprite(100, SPRITES.BILLBOARD01, -1);
addSprite(120, SPRITES.BILLBOARD02, -1);
addSprite(140, SPRITES.BILLBOARD03, -1);
addSprite(160, SPRITES.BILLBOARD04, -1);
addSprite(180, SPRITES.BILLBOARD05, -1);
```

O `scenery.ts` portado só tem as duas primeiras:

```ts
addSprite(road, 20, SPRITES.BILLBOARD07, -1);
addSprite(road, 40, SPRITES.BILLBOARD06, -1);
```

Faltam as sete chamadas dos segmentos 60, 80, 100, 120, 140, 160 e 180 (`BILLBOARD08`,
`BILLBOARD09`, `BILLBOARD01`, `BILLBOARD02`, `BILLBOARD03`, `BILLBOARD04`, `BILLBOARD05`).

O Log de Execução da RACER-TASK-14 afirma "Todos os parâmetros preservados exatamente como no
original" — o que não é verdade para este trecho. A causa provável é que
`docs/05-v4-final.md#52-sprites-de-cenário-resetsprites` **abrevia** este bloco no capítulo
("`// ... mais placas fixas próximas ao início`"), e a implementação copiou só o que o capítulo
mostra literalmente, sem consultar `v4.final.html` (a fonte primária, citada explicitamente no
próprio arquivo da tarefa) para recuperar as sete linhas omitidas pela abreviação da doc.

## Causa raiz

A implementação seguiu o trecho abreviado de `docs/05-v4-final.md` em vez do código-fonte
completo de `v4.final.html`, perdendo as sete chamadas de `addSprite` elididas pelo comentário
`// ... mais placas fixas próximas ao início` na documentação.

## Correção

### Arquivo/alvo: `app/src/versions/v4-final/scenery.ts`

Adicionar as sete chamadas faltantes entre as linhas 7 e 9 atuais (logo após `addSprite(road, 40,
SPRITES.BILLBOARD06, -1)` e antes do bloco de segmento 240):

```ts
addSprite(road, 60,  SPRITES.BILLBOARD08, -1);
addSprite(road, 80,  SPRITES.BILLBOARD09, -1);
addSprite(road, 100, SPRITES.BILLBOARD01, -1);
addSprite(road, 120, SPRITES.BILLBOARD02, -1);
addSprite(road, 140, SPRITES.BILLBOARD03, -1);
addSprite(road, 160, SPRITES.BILLBOARD04, -1);
addSprite(road, 180, SPRITES.BILLBOARD05, -1);
```

## Verificação

- [x] `resetSprites()` tem as nove chamadas fixas de billboard (segmentos 20 a 180, incremento
      20), na mesma ordem e com os mesmos sprites do original
- [x] `mise exec -- npm run typecheck` sem erros
- [x] Nenhum arquivo fora de `app/` foi alterado

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:** Adicionadas as 7 chamadas de `addSprite` faltantes em `scenery.ts` (segmentos 60, 80, 100, 120, 140, 160, 180 com sprites `BILLBOARD08`, `BILLBOARD09`, `BILLBOARD01`, `BILLBOARD02`, `BILLBOARD03`, `BILLBOARD04`, `BILLBOARD05`, todos com offset `-1`). Agora `resetSprites()` tem as 9 billboards fixas do início, idênticas ao original `v4.final.html` linhas 545-553. Typecheck passa.

**Problemas encontrados:** Nenhum. A correção foi direta: inserir as 7 linhas omitidas entre as linhas 7 e 9 do arquivo.

**Arquivos criados/modificados:**
- `app/src/versions/v4-final/scenery.ts` (adicionadas 7 linhas)
