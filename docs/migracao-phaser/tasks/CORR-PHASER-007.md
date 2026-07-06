---
id: CORR-PHASER-007
title: "Correção: RacerEngine duplica addBumps() em vez de reaproveitar Road.addBumps()"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-PHASER-007: `RacerEngine.addBumps()` duplica `Road.addBumps()`

## Problema identificado

- **Arquivo:** `racer-phaser/src/game/racer/RacerEngine.ts`
- **Estado atual:**
  ```ts
  private buildRoad(): void {
    this.road = new Road(this.segmentLength, this.rumbleLength)
    ...
    this.addBumps()   // <- método privado local de RacerEngine
    ...
  }

  private addBumps(): void {
    this.road.addRoad(10, 10, 10, 0, 5)
    this.road.addRoad(10, 10, 10, 0, -2)
    this.road.addRoad(10, 10, 10, 0, -5)
    this.road.addRoad(10, 10, 10, 0, 8)
    this.road.addRoad(10, 10, 10, 0, 5)
    this.road.addRoad(10, 10, 10, 0, -7)
    this.road.addRoad(10, 10, 10, 0, 5)
    this.road.addRoad(10, 10, 10, 0, -2)
  }
  ```
- **Por que está errado:** `racer-phaser/src/game/racer/Road.ts` (portado verbatim na
  PHASER-TASK-05, a partir de `app/src/core/Road.ts`) **já** expõe `addBumps()` como método
  público da própria DSL — com o corpo idêntico ao que foi duplicado aqui. Isso já havia sido
  identificado e documentado explicitamente no Log de Execução da PHASER-TASK-07 (a tarefa
  imediatamente anterior, mesma sessão de trabalho):
  > "não foi necessário copiar um `addBumps()` local separado, como o texto original da tarefa
  > cogitava, porque `Road.ts` (portado na PHASER-TASK-05) já inclui `addBumps()` como método
  > público" — `docs/migracao-phaser/tasks/07-integrar-pista-estatica.md`
  `Game.ts` (PHASER-TASK-07) já segue esse padrão corretamente (`this.road.addBumps()`). A
  PHASER-TASK-08 reintroduziu a duplicação que a PHASER-TASK-07 evitou, na função equivalente.

## Causa raiz

`buildRoad()` foi implementado em `RacerEngine` sem reaproveitar a decisão/precedente já
registrado na tarefa anterior — provável cópia direta da receita de `RacerGameV4.buildRoad()`
(`app/`), que também duplica essa lógica como método privado (por razões históricas daquele
projeto, onde `Road.addBumps()` foi adicionado depois e `RacerGameV4` nunca foi atualizado para
usá-lo — ver nota em `docs/migracao-phaser/tasks/07-integrar-pista-estatica.md`), sem notar que
`racer-phaser`'s `Road.ts` já tem o método pronto.

## Correção

### Arquivo/alvo: `racer-phaser/src/game/racer/RacerEngine.ts`

Remover o método privado `addBumps()` e trocar as duas chamadas `this.addBumps()` dentro de
`buildRoad()` por `this.road.addBumps()`:

```ts
private buildRoad(): void {
  this.road = new Road(this.segmentLength, this.rumbleLength)

  this.road.addStraight(ROAD.LENGTH.SHORT)
  this.road.addLowRollingHills()
  this.road.addSCurves()
  this.road.addCurve(ROAD.LENGTH.MEDIUM, ROAD.CURVE.MEDIUM, ROAD.HILL.LOW)
  this.road.addBumps()
  this.road.addLowRollingHills()
  this.road.addCurve(ROAD.LENGTH.LONG * 2, ROAD.CURVE.MEDIUM, ROAD.HILL.MEDIUM)
  this.road.addStraight()
  this.road.addHill(ROAD.LENGTH.MEDIUM, ROAD.HILL.HIGH)
  this.road.addSCurves()
  this.road.addCurve(ROAD.LENGTH.LONG, -ROAD.CURVE.MEDIUM, ROAD.HILL.NONE)
  this.road.addHill(ROAD.LENGTH.LONG, ROAD.HILL.HIGH)
  this.road.addCurve(ROAD.LENGTH.LONG, ROAD.CURVE.MEDIUM, -ROAD.HILL.LOW)
  this.road.addBumps()
  this.road.addHill(ROAD.LENGTH.LONG, -ROAD.HILL.MEDIUM)
  this.road.addStraight()
  this.road.addSCurves()
  this.road.addDownhillToEnd()

  this.road.markStartFinish(this.playerZ)
  this.road.finalize()
}
```

(sem o método `private addBumps()` separado)

## Verificação

- [ ] `RacerEngine` não tem mais um método `addBumps()` próprio
- [ ] `buildRoad()` chama `this.road.addBumps()` (2 ocorrências, mesmos pontos da receita)
- [ ] A pista resultante é idêntica (mesma sequência de segmentos/curvas/morros) — a fórmula
      dentro de `Road.addBumps()` é byte-a-byte igual à removida
- [ ] `mise exec -- npm run build` sem erros

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:**
Removido o método privado `addBumps()` duplicado de `RacerEngine.ts` e substituído as duas chamadas `this.addBumps()` por `this.road.addBumps()` em `buildRoad()`. Isso elimina a duplicação de código e segue o padrão já estabelecido na PHASER-TASK-07, onde `Game.ts` usa `this.road.addBumps()` em vez de duplicar a lógica. A fórmula dentro de `Road.addBumps()` é byte-a-byte igual à removida, então a pista resultante é idêntica.

**Problemas encontrados:**
Nenhum.

**Arquivos criados/modificados:**
- Modificado: `racer-phaser/src/game/racer/RacerEngine.ts` (removido método privado `addBumps()` linhas 123-132, substituídas chamadas em linhas 104 e 113)
- Modificado: `docs/migracao-phaser/tasks/correcoes-progresso.md` (status CORR-PHASER-007 marcado como [x] concluído, checklist atualizado)
