---
id: PHASER-TASK-13
title: "Portar Car.ts/TrafficManager.ts (verbatim)"
type: implementação
category: frontend
phase: 6
depends_on: ["PHASER-TASK-09"]
status: pendente
---

# PHASER-TASK-13: Portar `Car.ts`/`TrafficManager.ts` (verbatim)

## Contexto

- **Fonte:** `app/src/versions/v4-final/Car.ts`, `app/src/versions/v4-final/TrafficManager.ts`,
  documentados em `docs/05-v4-final.md §5.3-5.4` (dados/criação dos carros, IA de desvio com
  lookahead de 20 segmentos).
- **Plano completo:** `docs/migracao-phaser/01-arquitetura-alvo.md`, linha da tabela referente a
  `Car.ts`/`TrafficManager.ts` — "verbatim, a IA reativa não depende de como os carros são
  desenhados".
- Pode ser feita em paralelo com a PHASER-TASK-11 (ambas dependem só da PHASER-TASK-09). Esta
  tarefa **não** integra o tráfego visualmente — isso é a PHASER-TASK-14.

## Objetivo

Portar `Car.ts` e `TrafficManager.ts` verbatim para `racer-phaser/src/game/racer/`.

## Requisitos da implementação

- `Car.ts`: mesma classe de dados (`offset`, `z`, `sprite`, `speed`, `percent`).
- `TrafficManager.ts`: `resetCars()`, `updateCars()`, `updateCarOffset()` (privado) — preservar
  exatamente: otimização de distância (`drawDistance`), lookahead fixo de 20 segmentos, checagem
  contra o jogador e contra outros carros no mesmo segmento sob análise, fórmula de magnitude
  `dir * (1/i) * (car.speed - obstáculo.speed) / maxSpeed`, fallback de autocorreção fora da
  pista (`±0.1`), índice espacial duplo (`cars[]` + `segment.cars`) mantido em sincronia ao
  cruzar de segmento.
- Chamar `trafficManager.resetCars()` na construção da pista (dentro de `RacerEngine`, junto de
  `resetSprites`, PHASER-TASK-11), instanciando `TrafficManager` com `totalCars = 200`.

## Passos

1. Ler `docs/05-v4-final.md §5.3-5.4` inteiras.
2. Copiar `Car.ts`/`TrafficManager.ts` verbatim.
3. Ligar `trafficManager.resetCars()` na construção da pista dentro de `RacerEngine`.
4. `mise exec -- npm run build` sem erros. Validação visual do tráfego real acontece na
   PHASER-TASK-14 (quando os carros passam a ser desenhados).

## Critério de conclusão

- [ ] `Car.ts` portado verbatim
- [ ] `TrafficManager.ts` portado verbatim (`resetCars`/`updateCars`/`updateCarOffset`)
- [ ] Índice espacial duplo mantido em sincronia ao trocar de segmento
- [ ] Fórmula de esterço idêntica à original (lookahead 20, `1/i`, diferença de velocidade)
- [ ] `trafficManager.resetCars()` chamado na construção da pista
- [ ] `mise exec -- npm run build` sem erros
- [ ] Commit feito em `feature/phaser-port`

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
