---
id: CORR-RACER-021
title: "Correção: TrafficManager duplica findSegment/segmentLength e depende de trackLength já calculado"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-RACER-021: `TrafficManager` duplica `Road.findSegment`/`segmentLength` e quebra se `resetCars()` rodar antes de `road.finalize()`

## Problema identificado

- **Arquivo:** `app/src/versions/v4-final/TrafficManager.ts`

`Road` (`app/src/core/Road.ts`) já expõe um método público `findSegment(z: number): Segment`
(linha 102-104) que usa o campo **privado** `this.segmentLength` — o valor fixo passado no
construtor de `Road`, sempre correto independentemente de `trackLength` já ter sido calculado.

`TrafficManager` não usa esse método. Em vez disso, reimplementa a mesma lógica de forma
**privada e duplicada**, derivando o comprimento do segmento a partir de `trackLength`:

```ts
// TrafficManager.ts, resetCars()
const z = Math.floor(Math.random() * this.road.segments.length)
        * (this.road.trackLength / this.road.segments.length);
...
const segment = this.findSegment(car.z);   // findSegment PRIVADO, não o de Road

// TrafficManager.ts, findSegment() privado
private findSegment(z: number): Segment {
  const segmentLength = this.road.trackLength / this.road.segments.length;
  return this.road.segments[Math.floor(z / segmentLength) % this.road.segments.length]!;
}
```

Isso só é equivalente ao `segmentLength` real quando `road.trackLength` já foi calculado —
e `trackLength` só é preenchido por `Road.finalize()` (`this.trackLength = this.segments.length
* this.segmentLength`), que **ainda não é chamado por nenhum código do projeto** (será
adicionado only quando `RacerGameV4.buildRoad()` for escrito na RACER-TASK-15).

Por que isso importa agora: a documentação que a própria RACER-TASK-13 manda seguir
(`docs/05-v4-final.md` §5.10, `resetRoad()`) mostra a ordem original —

```javascript
resetSprites();
resetCars();                                      // <-- roda ANTES
...
trackLength = segments.length * segmentLength;    // <-- calculado DEPOIS
```

— ou seja, no original, `resetCars()`/`updateCarOffset()` sempre tiveram acesso a um
`segmentLength` **fixo e independente** de `trackLength` (era uma variável global própria). A
migração para `Road` tornou `segmentLength` privado e, para contornar isso, `TrafficManager`
passou a derivá-lo de `trackLength / segments.length` — uma dependência de ordem que não existia
no original e que a própria documentação seguida contradiz.

Se a RACER-TASK-15 seguir a ordem natural documentada (montar a pista, depois `resetSprites()`/
`resetCars()`, só então computar o equivalente a `trackLength` via `road.finalize()` — que é
exatamente o que `RacerGameV3`/`RacerGameV2`/`RacerGame` já fazem hoje, chamando `finalize()` só
ao final de `buildRoad()`), `road.trackLength` ainda será `0` quando `resetCars()` rodar:
`segmentLength` computado vira `0`, todo `z` sorteado vira `0` (todos os 200 carros nascem no
mesmo ponto do circuito), e `findSegment` privado calcula `Math.floor(z / 0)` → `Infinity`/`NaN`
→ índice inválido → `this.road.segments[NaN]!` engana o TypeScript e falha em runtime
(`segment.cars.push` sobre `undefined`).

## Causa raiz

`TrafficManager` duplica, de forma frágil, uma computação que `Road.findSegment` já expõe
publicamente e resolve sem depender de `trackLength`.

## Correção

### Arquivo/alvo: `app/src/versions/v4-final/TrafficManager.ts`

1. Remover o método privado `findSegment` e usar `this.road.findSegment(z)` (já público, já
   correto, independente de `trackLength`) nos dois pontos onde `TrafficManager` hoje calcula o
   segmento de um carro (`resetCars()` e `updateCars()`).
2. Para o sorteio de `z` em `resetCars()` (que precisa do valor numérico de `segmentLength`, não
   só do segmento) e para `car.percent = percentRemaining(car.z, ...)` em `updateCars()`,
   expor o comprimento do segmento a partir de `Road` em vez de derivá-lo de `trackLength`. Por
   exemplo, adicionar um getter público em `Road`:

   ```ts
   // Road.ts
   get segmentLength(): number {
     return this._segmentLength // renomear o campo privado atual para evitar colisão com o getter
   }
   ```

   e usar `this.road.segmentLength` nos dois lugares de `TrafficManager` que hoje calculam
   `this.road.trackLength / this.road.segments.length`.

Com isso, `TrafficManager` deixa de depender da ordem `finalize()` → `resetCars()` (que diverge
da ordem documentada em `docs/05-v4-final.md` §5.10) e para de duplicar a lógica de
`Road.findSegment`.

## Verificação

- [x] `TrafficManager` não define mais um método `findSegment` próprio — usa
      `this.road.findSegment(z)`
- [x] `Road` expõe `segmentLength` publicamente (getter ou equivalente), sem quebrar os usos
      internos existentes (`addSegment`, `addRoad`, `addDownhillToEnd`, `findSegment`)
- [x] Um teste manual (script Node ou teste unitário pontual) confirma que `TrafficManager.resetCars()`
      chamado **antes** de `road.finalize()` distribui os carros em `z` aleatório por todo o
      circuito (não todos em `z = 0`)
- [x] `mise exec -- npm run typecheck` e `mise exec -- npm run build` sem erros

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:** Renomeado campo privado `segmentLength` para `_segmentLength` em `Road.ts` e adicionado getter público `get segmentLength()` que retorna `this._segmentLength`. Atualizadas todas as referências internas em `Road.ts` (5 ocorrências em `addSegment`, `addRoad`, `addDownhillToEnd`, `findSegment`, `finalize`) para usar `this._segmentLength`. Removido método privado `findSegment` de `TrafficManager.ts` (3 linhas). Substituídas todas as chamadas em `TrafficManager` para usar `this.road.findSegment(z)` (3 ocorrências em `resetCars` e `updateCars`) e `this.road.segmentLength` (2 ocorrências no sorteio de `z` e no cálculo de `car.percent`). Com isso, `TrafficManager` deixa de depender de `trackLength` já calculado e pode rodar `resetCars()` antes de `road.finalize()`, seguindo a ordem documentada em `docs/05-v4-final.md` §5.10.

**Problemas encontrados:** Nenhum. A correção foi direta: expor `segmentLength` via getter e eliminar a duplicação de `findSegment`.

**Arquivos criados/modificados:**
- `app/src/core/Road.ts` (renomeado campo privado, adicionado getter, atualizadas 5 referências internas)
- `app/src/versions/v4-final/TrafficManager.ts` (removido método privado, atualizadas 5 referências)
