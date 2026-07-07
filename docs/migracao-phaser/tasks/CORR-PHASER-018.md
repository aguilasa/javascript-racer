---
id: CORR-PHASER-018
title: "Correção: tsc --noEmit falha (car de Segment.cars tratado como unknown) em RacerEngine.ts/TrafficRenderer.ts — mise exec -- npm run build não detecta por não type-checar"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-PHASER-018: erros de tipo não detectados por `npm run build` (esbuild não type-checa)

## Problema identificado

- **Comando de verificação:** `mise exec -- npx tsc --noEmit -p tsconfig.json` (dentro de
  `racer-phaser/`)
- **Resultado atual:**
  ```
  src/game/racer/RacerEngine.ts(183,20): error TS18046: 'car' is of type 'unknown'.
  src/game/racer/RacerEngine.ts(184,24): error TS18046: 'car' is of type 'unknown'.
  src/game/racer/RacerEngine.ts(185,49): error TS18046: 'car' is of type 'unknown'.
  src/game/racer/RacerEngine.ts(186,24): error TS18046: 'car' is of type 'unknown'.
  src/game/racer/RacerEngine.ts(186,37): error TS18046: 'car' is of type 'unknown'.
  src/game/racer/RacerEngine.ts(187,41): error TS18046: 'car' is of type 'unknown'.
  src/game/racer/TrafficRenderer.ts(45,91): error TS18046: 'car' is of type 'unknown'.
  src/game/racer/TrafficRenderer.ts(46,79): error TS18046: 'car' is of type 'unknown'.
  src/game/racer/TrafficRenderer.ts(46,108): error TS18046: 'car' is of type 'unknown'.
  src/game/racer/TrafficRenderer.ts(47,79): error TS18046: 'car' is of type 'unknown'.
  src/game/racer/TrafficRenderer.ts(48,31): error TS2322: Type 'unknown' is not assignable to type 'Car'.
  src/game/racer/TrafficRenderer.ts(67,5): error TS6133: 'offsetX' is declared but its value is never read.
  ```
  Porém `mise exec -- npm run build` (vite/esbuild, sem type-checking) termina com sucesso —
  o mesmo tipo de lacuna já registrada em CORR-PHASER-003, que segue sem correção (nenhum
  script `typecheck` dedicado existe em `racer-phaser/package.json`).
- **Causa imediata:** `Segment.cars` é tipado como `unknown[]` (`types.ts`, comentário: "v1-v3:
  genérico; v4: Car[] (TrafficManager só é usado na v4)"). Em `TrafficManager.ts` todo acesso a
  elementos de `segment.cars` já usa `as Car` (`segment.cars[j] as Car`). Mas o código novo
  introduzido na PHASER-TASK-14 itera `segment.cars`/`collisionSegment.cars` com
  `for (const car of ...)` **sem** o cast, em dois lugares:
  - `racer-phaser/src/game/racer/RacerEngine.ts`, bloco de colisão jogador↔carro (linhas
    182-191):
    ```ts
    for (const car of collisionSegment.cars) {
      const carW = car.sprite.w * SPRITES.SCALE   // car: unknown
      ...
    }
    ```
  - `racer-phaser/src/game/racer/TrafficRenderer.ts`, método `draw()` (linhas 43-49):
    ```ts
    for (const car of segment.cars) {              // car: unknown
      const spriteScale = interpolate(..., car.percent)
      ...
      items.push({ segment, car, ... })             // TrafficItem.car espera Car, não unknown
    }
    ```
  - Adicionalmente, `TrafficRenderer.ts#drawOne`, parâmetro `offsetX` é declarado mas nunca lido
    (`TS6133`) — o comentário na linha 57 do `draw()` documenta que "offsetX é sempre -0.5 para
    carros", mas o valor passado nunca chega a ser usado dentro de `drawOne` (compare com
    `SceneryRenderer`, que de fato usa seu equivalente).
- **Por que é uma discrepância válida para esta revisão:** ambos os arquivos com erro
  (`RacerEngine.ts`, modificado diretamente pela PHASER-TASK-15; `TrafficRenderer.ts`, a mesma
  área de código de tráfego inspecionada ao verificar a integração de `Hud`/cronometragem) fazem
  parte do estado atual inspecionado nesta revisão. Como o critério de conclusão das tarefas só
  exige `npm run build` (que não type-checa), o defeito passou despercebido nas duas tarefas
  anteriores.

## Causa raiz

`Segment.cars: unknown[]` exige cast explícito em todo ponto de consumo (como já feito em
`TrafficManager.ts`), mas os dois novos consumidores adicionados na PHASER-TASK-14
(`RacerEngine.update()` e `TrafficRenderer.draw()`) não aplicaram o cast — e como
`npm run build` usa esbuild (transpila sem checar tipos), o erro não bloqueia o build.

## Correção

### Arquivo/alvo: `racer-phaser/src/game/racer/RacerEngine.ts`

No bloco de colisão jogador↔carro, tipar `car` explicitamente (mesmo padrão de
`TrafficManager.ts`):

```ts
for (const carUnknown of collisionSegment.cars) {
  const car = carUnknown as Car
  const carW = car.sprite.w * SPRITES.SCALE
  ...
}
```
(requer `import { Car } from './Car'`)

### Arquivo/alvo: `racer-phaser/src/game/racer/TrafficRenderer.ts`

Mesmo tratamento em `draw()`:

```ts
for (const carUnknown of segment.cars) {
  const car = carUnknown as Car
  const spriteScale = interpolate(segment.p1.screen.scale, segment.p2.screen.scale, car.percent)
  ...
  items.push({ segment, car, scale: spriteScale, x: spriteX, y: spriteY })
}
```

E em `drawOne`: usar `offsetX` no cálculo de `x`/posição (a exemplo de como `SceneryRenderer`
usa seu parâmetro equivalente) ou remover o parâmetro se de fato for sempre redundante com
`setOrigin(0.5, 1)` — decidir olhando `RacerGameV4.renderExtraLayer`/`Render.sprite` original
para confirmar se `offsetX=-0.5` já é coberto inteiramente por `setOrigin(0.5, ...)` (nesse caso
documentar a decisão no Log de Execução em vez de manter um parâmetro morto).

## Verificação

- [x] `mise exec -- npx tsc --noEmit -p tsconfig.json` sem erros
- [x] `mise exec -- npm run build` sem erros
- [x] Considerar (fora do escopo desta CORR, já registrado em CORR-PHASER-003) adicionar um
      script `typecheck` em `racer-phaser/package.json` para que este tipo de regressão pare de
      passar despercebido por `npm run build`

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-07

**Resumo do que foi feito:**
Aplicado cast explícito `as Car` em `RacerEngine.ts` e `TrafficRenderer.ts` para corrigir erros de tipo detectados por `tsc --noEmit`. Em `RacerEngine.ts`, adicionado `import { Car } from './Car'` e alterado o loop de colisão jogador↔carro para usar `for (const carUnknown of collisionSegment.cars)` seguido de `const car = carUnknown as Car`. Em `TrafficRenderer.ts`, aplicado o mesmo padrão no loop de `draw()`. Além disso, removido o parâmetro `offsetX` de `drawOne()` e sua chamada, pois era declarado mas nunca usado — em Phaser, o offset horizontal de -0.5 é coberto por `setOrigin(0.5, 1)`, tornando o parâmetro redundante.

**Problemas encontrados:**
Nenhum.

**Arquivos criados/modificados:**
- Modificado: `racer-phaser/src/game/racer/RacerEngine.ts` (import Car, cast as Car no loop de colisão)
- Modificado: `racer-phaser/src/game/racer/TrafficRenderer.ts` (cast as Car no loop draw, remoção de parâmetro offsetX)
- Modificado: `docs/migracao-phaser/tasks/correcoes-progresso.md` (status CORR-PHASER-018 marcado como [x] concluído, checklist atualizado)
