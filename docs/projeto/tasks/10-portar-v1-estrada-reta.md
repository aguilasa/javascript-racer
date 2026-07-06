---
id: RACER-TASK-10
title: "Portar v1 (RacerGameV1) e validar contra o original"
type: implementação
category: frontend
phase: 2
depends_on: ["RACER-TASK-09"]
status: pendente
---

# RACER-TASK-10: Portar v1 (`RacerGameV1`) e validar contra o original

## Contexto

- **Fonte original:** `v1.straight.html` — ver `docs/02-v1-estrada-reta.md` (capítulo inteiro).
- Esta é a **primeira validação real** da arquitetura criada nas RACER-TASK-08/09. É esperado
  (e aceitável) precisar ajustar a forma exata dos pontos de extensão de `RacerGame` aqui —
  registrar qualquer ajuste no Log de Execução desta tarefa **e** mencionar se
  `docs/projeto/01-arquitetura-alvo.md` deveria ser atualizado para refletir a forma final
  (atualização do plano é opcional, mas o desvio precisa ficar registrado em algum lugar).

## Objetivo

1. Criar `app/src/versions/v1-straight/RacerGameV1.ts` (`extends RacerGame`).
2. Criar `app/src/versions/v1-straight/main.ts` (ponto de entrada, ligado a `v1.html` da
   RACER-TASK-02).
3. Validar que `v1.html` jogado no navegador tem a mesma sensação da `v1.straight.html`
   original.

## Requisitos da implementação

### `RacerGameV1.ts`

Para a v1, os pontos de extensão de `RacerGame` usam (ou herdam) as implementações mais
simples:

- `buildRoad()`: usa `Road` (RACER-TASK-08) para gerar os 500 segmentos retos e planos — por
  exemplo `this.road.addStraight(500)` com os parâmetros de curva/altura zerados (ver decisão
  registrada em `docs/projeto/01-arquitetura-alvo.md`, "Decisão intencional"), seguido de
  `this.road.markStartFinish(this.playerZ)` e `this.road.finalize()`.
- Os demais pontos de extensão (`updateLateralForces`, `updateParallax`, `updateExtras`,
  `getCameraY`, `renderExtraLayer`, `getPlayerScreenY`, `getPlayerUpdown`) podem ficar
  **sem override nenhum** em `RacerGameV1` se as implementações-base de `RacerGame`
  (RACER-TASK-09) já corresponderem ao comportamento da v1 original — confirmar isso
  comparando com `docs/02-v1-estrada-reta.md` função por função, em vez de assumir.

### `main.ts`

```ts
import { RacerGameV1 } from './RacerGameV1'

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const game = new RacerGameV1(canvas)
await game.start(canvas, ['background', 'sprites'])
```

(ajustar à assinatura real definida em `RacerGame.start()` na RACER-TASK-09.)

## Passos

1. Reler `docs/02-v1-estrada-reta.md` inteiro.
2. Implementar `RacerGameV1.ts` e `main.ts`.
3. `npm run dev`, abrir `v1.html`.
4. **Validação lado a lado:** abrir também `v1.straight.html` original (servido estaticamente,
   ex.: outra aba apontando para o arquivo local ou um servidor estático simples na raiz do
   repo) e comparar:
   - aceleração/frenagem/velocidade máxima têm a mesma sensação
   - limites de saída de pista (`playerX` fora de `[-1,1]` desacelera; trava em `±2`)
   - a pista loopa (500 segmentos) sem hitch perceptível
   - tweak UI (resolução, largura da pista, altura da câmera, distância de desenho, campo de
     visão, densidade de neblina) responde igual
   - o carro do jogador aparece na base da tela, centralizado, trocando de sprite conforme
     esterço
5. `npm run build` sem erros.

## Critério de conclusão

- [ ] `RacerGameV1.ts` e `main.ts` criados
- [ ] `v1.html` jogável via `npm run dev`
- [ ] Comparação lado a lado com `v1.straight.html` sem diferenças perceptíveis de física ou
      visual
- [ ] `npm run build` e `npm run typecheck` sem erros
- [ ] Qualquer ajuste feito em `core/RacerGame.ts`/`core/Road.ts` durante esta tarefa está
      registrado no Log de Execução (desta tarefa e, se relevante, também nas tarefas 08/09)
- [ ] Nenhum arquivo fora de `app/` foi alterado

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
