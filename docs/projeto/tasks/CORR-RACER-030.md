---
id: CORR-RACER-030
title: "Correção: updateCars/colisão rodam no fim de update() usando playerX/speed já mutados neste frame"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-RACER-030: `updateCars`/colisão chamados no fim de `update()`, usando `playerX`/`speed` já mutados neste frame

## Problema identificado

`docs/05-v4-final.md#55` (item 1) documenta explicitamente a ordem do `update(dt)` original:

> "`updateCars(dt, ...)` é chamado primeiro, antes de mover o próprio jogador — os carros de
> tráfego se movem de forma independente do jogador."

No original, `updateCars(dt, playerSegment, playerW)` é a **primeira** chamada de `update()`,
antes de `position`/`playerX`/`speed` serem alterados neste frame — internamente,
`updateCarOffset` lê `playerX`/`speed` **globais**, que nesse ponto ainda contêm os valores
**finais do frame anterior** (commitados na última chamada de `update()`).

Na versão portada, `core/RacerGame.ts` (`update()`, método final/não sobrescrito) chama
`this.updateExtras(dt)` **por último**, depois de:
1. `updateLateralForces` (já altera `playerX`)
2. `updateParallax`
3. bloco de aceleração/frenagem (já altera `speed`)
4. decel fora-de-pista
5. clamp de `playerX`/`speed`

`RacerGameV4.updateExtras()` é onde `this.trafficManager.updateCars(...)` é de fato chamado — ou
seja, a IA de tráfego reage ao `playerX`/`speed` **já atualizados neste mesmo frame** (incluindo
o resultado do clamp a `[-3, 3]`), não aos valores commitados no frame anterior como no original.
Isso desloca em um frame o instante em que a IA de tráfego reage aos movimentos do jogador —
mesma classe de divergência já registrada e corrigida em `CORR-RACER-016`/`CORR-RACER-018` para
`playerSegment`/`updateParallax` em versões anteriores.

## Causa raiz

`updateExtras` é o único ponto de extensão disponível para "lógica extra" no `update()` do motor
compartilhado, e ele roda por último — mas a tarefa não previu que a v4 precisaria rodar parte de
sua lógica (`updateCars`) **antes** da atualização de `playerX`/`speed`, então tudo foi colocado
dentro do único hook disponível, na ordem em que ele é chamado.

## Correção

### Arquivo/alvo: `app/src/core/RacerGame.ts` e `app/src/versions/v4-final/RacerGameV4.ts`

Duas abordagens possíveis (escolher uma, registrar a escolha no Log de Execução):

1. Adicionar um novo ponto de extensão `protected updateTraffic(dt, playerSegment): void`
   (no-op na base), chamado logo no início de `update()` — antes de `updateLateralForces` — e
   mover a chamada a `this.trafficManager.updateCars(...)` de `updateExtras` para esse novo
   método em `RacerGameV4`.
2. Alternativamente, dividir `updateExtras` em duas chamadas na base (`updateExtras` já existe;
   adicionar `updateExtrasBefore`/`updateExtrasAfter`, ou nome equivalente) — mais invasivo.

A opção 1 é mais simples e seguem o padrão Template Method já estabelecido pelo restante da
arquitetura (`01-arquitetura-alvo.md`).

## Verificação

- [ ] `updateCars` é chamado antes de `playerX`/`speed` serem alterados neste frame (confirmar
      lendo a ordem de chamadas em `RacerGame.update()`)
- [ ] Comparação lado a lado com `v4.final.html`: comportamento de desvio do tráfego permanece
      equivalente (sem regressão perceptível)
- [ ] `npm run typecheck` e `npm run build` continuam sem erros

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
