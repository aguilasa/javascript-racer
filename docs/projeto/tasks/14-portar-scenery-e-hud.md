---
id: RACER-TASK-14
title: "Portar scenery (sprites de cenário) e Hud"
type: implementação
category: frontend
phase: 5
depends_on: ["RACER-TASK-12"]
status: pendente
---

# RACER-TASK-14: Portar `scenery` (sprites de cenário) e `Hud`

## Contexto

- **Fonte original:** `resetSprites` e o bloco de HUD/tempos de volta em `v4.final.html` — ver
  `docs/05-v4-final.md#52-sprites-de-cenário-resetsprites` e
  `#57-hud-velocímetro-e-tempos-de-volta`.
- Pode ser implementada em paralelo com a RACER-TASK-13 (ambas dependem só da RACER-TASK-12).
- Esta tarefa **não** integra cenário/HUD em nenhuma versão jogável ainda — isso é escopo da
  RACER-TASK-15.

## Objetivo

Criar, em `app/src/versions/v4-final/`:

1. `scenery.ts` — função que popula `road.segments[i].sprites` (árvores, placas, pedras,
   arbustos).
2. `Hud.ts` — velocímetro, tempos de volta, recorde persistido.

## Requisitos da implementação

### `scenery.ts`

```ts
import type { Road } from '../../core/Road'
import { SPRITES } from '../../core/sprites'
import * as Util from '../../core/util'

export function resetSprites(road: Road): void {
  // porta as 5 seções de resetSprites: billboards fixas do início,
  // palmeiras com espaçamento incremental, colunas/árvores 250-1000,
  // plantas aleatórias 200-fim, billboards+plantas aleatórias 1000-fim
  // (ver docs/05-v4-final.md §5.2 para a lógica exata de cada loop)
}
```

Preservar exatamente os parâmetros originais (índices de início/fim de cada loop, incrementos,
offsets) — são "mágicos" mas propositais (calibrados para a neblina/distância de desenho
originais), não simplificar nem arredondar.

### `Hud.ts`

```ts
export class Hud {
  private lastValues = new Map<string, string | number>()

  constructor(/* referências aos elementos DOM via core/dom.ts */) {}

  updateSpeed(speed: number, maxSpeed: number): void { /* ... */ }
  updateCurrentLapTime(seconds: number): void { /* ... */ }
  onLapComplete(lapTime: number): void {
    // compara com o recorde em localStorage (Dom.storage.fast_lap_time),
    // atualiza classes CSS 'fastest', persiste novo recorde se aplicável
  }

  private formatTime(dt: number): string { /* M.SS.T ou S.T, ver original */ }
  private setIfChanged(key: string, dom: HTMLElement, value: string | number): void {
    // só toca innerHTML se o valor mudou (otimização do original)
  }
}
```

Preservar a otimização de "só tocar o DOM se o valor mudou" (ver
`docs/05-v4-final.md#57`) e a lógica exata de `formatTime`.

## Passos

1. Ler `docs/05-v4-final.md` §5.2 e §5.7 inteiras.
2. Implementar `scenery.ts` e `Hud.ts`.
3. `npm run typecheck` sem erros. Validação visual/comportamental real acontece na
   RACER-TASK-15.

## Critério de conclusão

- [ ] `scenery.ts` com as 5 seções de povoamento de sprites, parâmetros idênticos ao original
- [ ] `Hud.ts` com velocímetro, tempo de volta atual, última volta, recorde persistido
- [ ] Otimização "só atualiza DOM se valor mudou" preservada
- [ ] `formatTime` idêntico ao original (`M.SS.T` / `S.T`)
- [ ] `npm run typecheck` sem erros
- [ ] Nenhum arquivo fora de `app/` foi alterado

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
