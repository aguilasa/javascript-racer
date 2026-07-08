---
id: PHASER-TASK-03
title: "Portar util.ts, types.ts e constants.ts (verbatim)"
type: implementação
category: frontend
phase: 1
depends_on: ["PHASER-TASK-01"]
status: pendente
---

# PHASER-TASK-03: Portar `util.ts`, `types.ts` e `constants.ts` (verbatim)

## Contexto

- **Fonte:** `app/src/core/util.ts`, `app/src/core/types.ts`, `app/src/core/constants.ts`
- **Plano completo:** `docs/migracao-phaser/01-arquitetura-alvo.md`, linhas da tabela de
  mapeamento referentes a `util.ts`/`types.ts`/`constants.ts` — "copiado quase verbatim,
  matemática pura, nenhuma dependência de canvas/DOM".
- Esta é matemática/tipos puros — nenhuma API do Phaser é usada aqui. É seguro copiar o
  conteúdo quase sem alteração.

## Objetivo

Criar em `racer-phaser/src/game/racer/`:
1. `util.ts` — todas as funções de `app/src/core/util.ts` (`project`, `overlap`, `accelerate`,
   `increase`, `interpolate`, `easeIn`/`easeOut`/`easeInOut`, `exponentialFog`,
   `percentRemaining`, `toInt`/`toFloat`, `limit`, `randomInt`/`randomChoice`, `timestamp`).
2. `types.ts` — todas as interfaces/tipos de `app/src/core/types.ts` (`WorldPoint`,
   `CameraPoint`, `ScreenPoint`, `SegmentPoint`, `SpriteRect`, `SpriteSlot`,
   `SegmentColorSet`, `Segment`).
3. `constants.ts` — `KEY` e `COLORS` de `app/src/core/constants.ts`.

## Requisitos da implementação

- Copiar o conteúdo **verbatim** (mesmas fórmulas, mesmos nomes de função/tipo) — só ajustar
  caminhos de import relativos, já que a estrutura de pastas é diferente
  (`racer-phaser/src/game/racer/` em vez de `app/src/core/`).
- `Segment.cars` continua tipado como `unknown[]` (o mesmo genérico usado em `types.ts` hoje) —
  a tipagem concreta (`Car[]`) só é usada dentro de `TrafficManager`/`RacerEngine`, igual ao
  padrão já usado em `app/`.
- Não portar `Dom`/`core/dom.ts` — não existe equivalente necessário aqui; funções de DOM que
  ainda forem necessárias (ex.: `localStorage` para o recorde de volta) são acessadas
  diretamente via `window.localStorage`, sem um wrapper `Dom.storage` (o Phaser já convive bem
  com chamadas diretas ao browser API dentro de uma scene).

## Passos

1. Ler `app/src/core/util.ts`, `types.ts`, `constants.ts` por completo.
2. Criar os três arquivos em `racer-phaser/src/game/racer/`, com o mesmo conteúdo (ajustando só
   imports relativos, ex.: `import type { SegmentColorSet } from './types'` continua igual,
   pois a relação entre os arquivos não muda).
3. `mise exec -- npm run build` (ou o equivalente de typecheck do template, ver
   `racer-phaser/package.json`) sem erros — mesmo que `RacerEngine`/scenes ainda não usem esses
   arquivos, o build/typecheck do TypeScript deve aceitar os módulos isoladamente.

## Critério de conclusão

- [ ] `racer-phaser/src/game/racer/util.ts` com as mesmas 16 funções exportadas de
      `app/src/core/util.ts`, fórmulas idênticas
- [ ] `racer-phaser/src/game/racer/types.ts` com as mesmas interfaces de `app/src/core/types.ts`
- [ ] `racer-phaser/src/game/racer/constants.ts` com `KEY`/`COLORS` idênticos
- [ ] `mise exec -- npm run build` (dentro de `racer-phaser/`) sem erros
- [ ] Nenhum arquivo em `app/` foi alterado (só lido, como referência)
- [ ] Commit feito em `feature/phaser-port`

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
