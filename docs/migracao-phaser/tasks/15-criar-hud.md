---
id: PHASER-TASK-15
title: "Criar Hud.ts (Phaser.GameObjects.Text) + cronometragem de volta + recorde persistido"
type: implementação
category: frontend
phase: 7
depends_on: ["PHASER-TASK-14"]
status: pendente
---

# PHASER-TASK-15: Criar `Hud.ts` (`Phaser.GameObjects.Text`) + cronometragem de volta

## Contexto

- **Fonte:** `app/src/versions/v4-final/Hud.ts` (`Dom.set`/`Dom.addClassName` em `<span>`) e o
  trecho de `RacerGameV4.updateExtras` referente a cronometragem de volta — ver
  `docs/05-v4-final.md §5.5` (item 6) e `§5.7`.
- **Plano completo:** `docs/migracao-phaser/01-arquitetura-alvo.md`, linha da tabela referente a
  `Hud.ts` — "reescrito para usar `Phaser.GameObjects.Text` dentro da própria `Game` scene".

## Objetivo

1. Criar `racer-phaser/src/game/racer/Hud.ts`: uma classe que recebe a `Scene` no construtor e
   cria/gerencia `Phaser.GameObjects.Text` para velocímetro, tempo da volta atual, última volta e
   recorde ("fastest lap").
2. Portar a lógica de cronometragem de volta de `RacerGameV4.updateExtras` para `RacerEngine`
   (ou expor os dados necessários para `Hud` calcular — a decisão de onde a lógica de tempo mora
   exatamente fica a critério da implementação, desde que preserve o comportamento).

## Requisitos da implementação

- `updateSpeed(speed)`: mesma fórmula de exibição (`5 * Math.round(speed / 500)`).
- `updateCurrentLapTime(seconds)`/`onLapComplete(lapTime)`: mesmo `formatTime` (`M.SS.T` ou
  `S.T`) e mesma lógica de "só tocar o texto se o valor mudou" (`setIfChanged`, evita reflow
  desnecessário — ainda que o custo relativo seja diferente no Phaser, preservar o padrão por
  consistência e clareza).
- Persistência do recorde: `localStorage['fast_lap_time']`, com valor padrão `'180'` na
  inicialização — mesma chave usada por `app/src/versions/v4-final/Hud.ts`, para permitir (se
  algum dia fizer sentido) que os dois jogos compartilhem o mesmo recorde salvo no navegador
  (mesma origem `http://localhost` em dev, ainda que portas diferentes — documentar essa nuance
  no Log de Execução, não é um requisito rígido).
- Cruzamento da linha de chegada: quando `position` cruza `playerZ`, fechar a volta atual
  (`lastLapTime = currentLapTime`, comparar com o recorde, atualizar classes/estilo de destaque
  se for novo recorde) — mesma condição `startPosition < playerZ` do original para confirmar que
  a linha foi de fato cruzada neste frame.

## Passos

1. Ler `docs/05-v4-final.md §5.5` (item 6) e `§5.7` inteiras.
2. Implementar `Hud.ts`.
3. Ligar a cronometragem de volta em `RacerEngine`/`Game` scene.
4. Validar manualmente: completar uma volta e confirmar que o HUD atualiza velocímetro/tempo em
   tempo real, registra a última volta ao cruzar a linha, e que o recorde persiste entre
   recarregamentos da página (`localStorage`).

## Critério de conclusão

- [ ] `Hud.ts` com `Phaser.GameObjects.Text` para velocímetro/tempo atual/última volta/recorde
- [ ] `formatTime`/`setIfChanged` preservados
- [ ] Recorde persistido em `localStorage['fast_lap_time']`
- [ ] Cronometragem de volta (fechamento ao cruzar a linha) funcionando
- [ ] Validação manual confirmada
- [ ] `mise exec -- npm run build` sem erros
- [ ] Commit feito em `feature/phaser-port`

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
