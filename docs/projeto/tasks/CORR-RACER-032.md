---
id: CORR-RACER-032
title: "Correção: RacerGameV4.buildRoad() nunca instancia this.road — v4.html quebra ao carregar"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-RACER-032: `RacerGameV4.buildRoad()` nunca instancia `this.road` — `v4.html` quebra ao carregar

## Problema identificado

Confirmado em runtime (console do navegador ao abrir `v4.html`):

```
RacerGameV4.ts:28 Uncaught TypeError: Cannot read properties of undefined (reading 'addStraight')
    at RacerGameV4.buildRoad (RacerGameV4.ts:28:15)
    at RacerGameV4.reset (RacerGame.ts:267:12)
    at RacerGameV4.start (RacerGame.ts:294:10)
    at async main.ts:8:1
```

`app/src/versions/v4-final/RacerGameV4.ts` (`buildRoad()`):

```ts
protected buildRoad(): void {
  this.road.addStraight(ROAD.LENGTH.SHORT);   // <-- this.road é undefined aqui
  this.road.addLowRollingHills();
  ...
```

Todas as outras versões criam a instância de `Road` como a **primeira linha** do respectivo
`buildRoad()`:

```bash
$ grep -n "this.road = new Road" app/src/core/RacerGame.ts app/src/versions/v2-curves/RacerGameV2.ts app/src/versions/v3-hills/RacerGameV3.ts app/src/versions/v4-final/RacerGameV4.ts
core/RacerGame.ts:81:    this.road = new Road(this.segmentLength, this.rumbleLength)
v2-curves/RacerGameV2.ts:10:    this.road = new Road(this.segmentLength, this.rumbleLength)
v3-hills/RacerGameV3.ts:10:    this.road = new Road(this.segmentLength, this.rumbleLength)
# v4-final/RacerGameV4.ts: nenhuma ocorrência
```

Como `RacerGameV4.buildRoad()` **sobrescreve** por completo o método de `RacerGameV3` (sem chamar
`super.buildRoad()`), e nunca cria a própria instância de `Road`, `this.road` permanece
`undefined` (apesar da asserção de atribuição definitiva `protected road!: Road` em
`core/RacerGame.ts`, que só engana o compilador — em runtime o campo nunca é atribuído). O
resultado é que `v4.html` quebra imediatamente na primeira chamada de `reset()`/`start()`, antes
de qualquer frame ser desenhado.

Este bug já estava presente na implementação original da RACER-TASK-15 (confirmado comparando com
o conteúdo do commit `f2aa392`) — passou despercebido na revisão estática porque o typecheck não
acusa nada (a asserção `!` suprime o erro de tipo) e nenhuma validação visual real de `v4.html`
havia sido feita até agora (ver `CORR-RACER-031`).

## Causa raiz

Ao portar a receita de `resetRoad()` da v4 (`docs/05-v4-final.md#510`), a linha de criação da
instância de `Road` — presente em todas as outras versões — foi omitida.

## Correção

### Arquivo/alvo: `app/src/versions/v4-final/RacerGameV4.ts`

Adicionar `this.road = new Road(this.segmentLength, this.rumbleLength);` como primeira instrução
de `buildRoad()`, e importar `Road` (hoje só `ROAD` é importado de `../../core/Road`):

```ts
import { Road, ROAD } from '../../core/Road';
...

protected buildRoad(): void {
  this.road = new Road(this.segmentLength, this.rumbleLength);

  this.road.addStraight(ROAD.LENGTH.SHORT);
  ...
```

## Verificação

- [ ] `v4.html` carrega sem erros no console do navegador
- [ ] A pista é desenhada normalmente (retas, curvas, morros, bumps)
- [ ] `npm run typecheck` e `npm run build` continuam sem erros

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
