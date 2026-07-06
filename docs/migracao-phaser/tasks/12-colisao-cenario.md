---
id: PHASER-TASK-12
title: "Colisão jogador↔sprite de cenário fora da pista"
type: implementação
category: frontend
phase: 5
depends_on: ["PHASER-TASK-11"]
status: pendente
---

# PHASER-TASK-12: Colisão jogador↔sprite de cenário fora da pista

## Contexto

- **Fonte:** trecho de `RacerGameV4.updateExtras` referente a sprites (`app/src/versions/
  v4-final/RacerGameV4.ts`), documentado em `docs/05-v4-final.md §5.5`, item 2.
- Depende da PHASER-TASK-11 (sprites de cenário já precisam estar populados em
  `road.segments[n].sprites`).

## Objetivo

Adicionar a `RacerEngine.update()` (ou a um método interno equivalente ao `updateExtras` de
`RacerGameV4`) a checagem de colisão contra sprites de cenário quando o jogador está fora da
pista.

## Requisitos da implementação

- Checar só quando `playerX < -1 || playerX > 1` (fora da faixa de rodagem) — sprites de
  cenário ficam todos fora da pista, então não há necessidade de checar enquanto dirigindo
  normalmente (mesma otimização do original).
- Usar `Util.overlap(playerX, playerW, spriteOffset, spriteW)` — mesma fórmula e mesmo ajuste de
  `spriteOffset` (`sprite.offset + spriteW/2 * (sprite.offset > 0 ? 1 : -1)`) do original.
- Ao colidir: `speed = maxSpeed / 5` e reposicionar `position` para o início do segmento atual
  (`Util.increase(playerSegment.p1.world.z, -playerZ, road.trackLength)`) — mesma lógica de
  "parar na frente do obstáculo".

## Passos

1. Ler `docs/05-v4-final.md §5.5`, item 2, e o trecho correspondente de
   `RacerGameV4.updateExtras`.
2. Implementar a checagem dentro de `RacerEngine.update()`.
3. Validar manualmente: sair da pista deliberadamente em um trecho com árvore/placa próxima e
   confirmar que a colisão reduz a velocidade e reposiciona o jogador como esperado.

## Critério de conclusão

- [ ] Colisão jogador↔sprite de cenário implementada, só ativa fora da pista
- [ ] Fórmula de `overlap`/reposicionamento idêntica ao original
- [ ] Validação manual: colisão reproduz o comportamento da v4-final
- [ ] `mise exec -- npm run build` sem erros
- [ ] Commit feito em `feature/phaser-port`

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
