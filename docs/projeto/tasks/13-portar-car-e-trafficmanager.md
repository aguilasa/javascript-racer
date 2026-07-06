---
id: RACER-TASK-13
title: "Portar Car e TrafficManager (IA de tráfego)"
type: implementação
category: frontend
phase: 5
depends_on: ["RACER-TASK-12"]
status: pendente
---

# RACER-TASK-13: Portar `Car` e `TrafficManager` (IA de tráfego)

## Contexto

- **Fonte original:** `resetCars`, `updateCars`, `updateCarOffset` em `v4.final.html` — ver
  `docs/05-v4-final.md#53-carros-de-tráfego-dados-e-criação` e
  `#54-movimentação-e-ia-simples-dos-carros-updatecarsupdatecaroffset`.
- Pode ser implementada em paralelo com a RACER-TASK-14 (ambas dependem só da RACER-TASK-12).
- Esta tarefa **não** integra tráfego em nenhuma versão jogável ainda — isso é escopo da
  RACER-TASK-15.

## Objetivo

Criar, em `app/src/versions/v4-final/`:

1. `Car.ts` — classe de dados de um carro de tráfego.
2. `TrafficManager.ts` — a IA de desvio e o índice espacial duplo (`cars[]` + `segment.cars`).

## Requisitos da implementação

### `Car.ts`

```ts
import type { SpriteRect } from '../../core/types'

export class Car {
  constructor(
    public offset: number,
    public z: number,
    public sprite: SpriteRect,
    public speed: number,
    public percent = 0,
  ) {}
}
```

### `TrafficManager.ts`

Portar `resetCars`, `updateCars`, `updateCarOffset` (ver
`docs/05-v4-final.md` §5.3–5.4 e as ilustrações
`docs/img/indice-duplo-carros.svg` e `docs/img/ia-carros-lookahead-esterco.svg`):

```ts
import type { Road } from '../../core/Road'
import type { Segment } from '../../core/types'
import { Car } from './Car'

export class TrafficManager {
  cars: Car[] = []

  constructor(
    private road: Road,
    private totalCars: number,
    private maxSpeed: number,
  ) {}

  resetCars(): void {
    // sorteia offset/z/sprite/speed para this.totalCars carros,
    // preenchendo tanto this.cars quanto segment.cars (índice espacial duplo)
  }

  updateCars(dt: number, playerSegment: Segment, playerX: number, playerW: number, speed: number): void {
    // avança cada carro em z, chama updateCarOffset, realoca entre buckets de segmento
    // ao cruzar de segmento (splice no antigo + push no novo)
  }

  private updateCarOffset(car: Car, carSegment: Segment, playerSegment: Segment, playerX: number, playerW: number, speed: number, drawDistance: number): number {
    // lookahead de 20 segmentos, comparação de offset lateral contra o jogador e
    // outros carros, retorna o incremento de esterço (dir * 1/i * diferença de velocidade)
  }
}
```

Preservar exatamente a lógica documentada:
- otimização de distância (`drawDistance`) antes de calcular esterço
- lookahead fixo de 20 segmentos
- checagem contra o jogador **e** contra outros carros no mesmo segmento sob análise
- fórmula de magnitude `dir * (1/i) * (speed_carro - speed_obstáculo) / maxSpeed`
- fallback de autocorreção quando fora da pista sem obstáculo à frente (`±0.1`)

## Passos

1. Ler `docs/05-v4-final.md` §5.3–5.4 inteiras, e as duas ilustrações mencionadas acima.
2. Implementar `Car.ts` e `TrafficManager.ts`.
3. `npm run typecheck` sem erros. Validação de comportamento real acontece na RACER-TASK-15
   (quando o tráfego é integrado a uma versão jogável).

## Critério de conclusão

- [ ] `Car.ts` criado
- [ ] `TrafficManager.ts` com `resetCars`/`updateCars`/`updateCarOffset` portados
- [ ] Índice espacial duplo (`cars[]` + `segment.cars`) mantido em sincronia ao trocar de
      segmento
- [ ] Fórmula de esterço idêntica à original (lookahead 20, `1/i`, diferença de velocidade)
- [ ] `npm run typecheck` sem erros
- [ ] Nenhum arquivo fora de `app/` foi alterado

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
