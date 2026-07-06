---
id: CORR-RACER-025
title: "Correção: Hud.onLapComplete() usa < em vez de <= ao comparar com o recorde (empate não vira novo recorde)"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-RACER-025: `Hud.onLapComplete()` usa `<` em vez de `<=` ao comparar com o recorde salvo

## Problema identificado

- **Arquivo:** `app/src/versions/v4-final/Hud.ts` (`onLapComplete`)

Original (`v4.final.html` linha 220):

```javascript
if (lastLapTime <= Util.toFloat(Dom.storage.fast_lap_time)) {
```

Nota o `<=` (menor **ou igual**) — uma volta com tempo exatamente igual ao recorde salvo ainda é
tratada como novo recorde (persiste de novo, atualiza o HUD, aplica a classe `fastest`).

Portado:

```ts
const fastLapTime = parseFloat(Dom.storage.fast_lap_time || '0');
if (!fastLapTime || lapTime < fastLapTime) {
```

Usa `<` estrito — uma volta com tempo exatamente igual ao recorde cai no `else`, removendo a
classe `fastest` em vez de reafirmá-la. Divergência de baixo impacto prático (empate exato de
tempo de volta, com `dt` de ponto flutuante, é raro), mas é uma mudança não documentada de uma
fórmula/condição do original.

## Causa raiz

Reimplementação da condição sem preservar o operador exato (`<=`) do original.

## Correção

### Arquivo/alvo: `app/src/versions/v4-final/Hud.ts`

Trocar `lapTime < fastLapTime` por `lapTime <= fastLapTime` em `onLapComplete`:

```ts
if (!fastLapTime || lapTime <= fastLapTime) {
```

## Verificação

- [x] `onLapComplete` trata um `lapTime` exatamente igual ao recorde salvo como novo recorde
      (mesmo comportamento do `<=` original)
- [x] `mise exec -- npm run typecheck` sem erros
- [x] Nenhum arquivo fora de `app/` foi alterado

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:** Trocado o operador de comparação em `Hud.onLapComplete` de `lapTime < fastLapTime` para `lapTime <= fastLapTime` (linha 35). Agora uma volta com tempo exatamente igual ao recorde salvo é tratada como novo recorde (persiste de novo, atualiza o HUD, aplica a classe `fastest`), idêntico ao comportamento do original (`v4.final.html` linha 220: `lastLapTime <= Util.toFloat(Dom.storage.fast_lap_time)`). Divergência de baixo impacto prático (empate exato de tempo de volta com `dt` de ponto flutuante é raro), mas agora preserva o operador exato do original. Typecheck passa.

**Problemas encontrados:** Nenhum. A correção foi direta: trocar `<` por `<=` em uma única linha.

**Arquivos criados/modificados:**
- `app/src/versions/v4-final/Hud.ts` (linha 35: operador de comparação)
