---
id: CORR-PHASER-017
title: "Correção: cronometragem de volta incrementa currentLapTime mesmo antes de cruzar playerZ, divergindo do original"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-PHASER-017: `currentLapTime` incrementado num ramo que não existe no original

## Problema identificado

- **Arquivo:** `racer-phaser/src/game/racer/RacerEngine.ts`, método `update(dt)`
- **Estado atual (linhas 193-203):**
  ```ts
  // Lap timing (PHASER-TASK-15) — quando position cruza playerZ, fecha a volta atual
  if (this.position > this.playerZ) {
    if (this.currentLapTime && (startPosition < this.playerZ)) {
      this.lastLapTime = this.currentLapTime
      this.currentLapTime = 0
    } else {
      this.currentLapTime += dt
    }
  } else {
    this.currentLapTime += dt
  }
  ```
- **Original (`app/src/versions/v4-final/RacerGameV4.ts#updateExtras`, linhas 101-109):**
  ```ts
  if (this.position > this.playerZ) {
    if (this.currentLapTime && this.startPosition < this.playerZ) {
      this.lastLapTime = this.currentLapTime;
      this.currentLapTime = 0;
      this.hud.onLapComplete(this.lastLapTime);
    } else {
      this.currentLapTime += dt;
    }
  }
  ```
- **Por que está errado:** o original **não tem** um `else` no nível externo. Quando
  `this.position <= this.playerZ`, `currentLapTime` simplesmente não é incrementado naquele
  frame — o cronômetro "congela" durante a janela em que a posição do jogador está entre o
  início da pista (`0`) e `playerZ` (a distância de câmera até o jogador, usada para marcar a
  linha de chegada/largada via `road.markStartFinish(playerZ)`).

  O `racer-phaser` adicionou um `else { this.currentLapTime += dt }` no nível externo que não
  existe no original — fazendo o cronômetro continuar somando `dt` durante essa janela.

  Essa janela não é hipotética: com os valores padrão da v4 (`cameraHeight=1000`,
  `fieldOfView=100` → `cameraDepth≈0.839` → `playerZ≈839`) e `maxSpeed=segmentLength/step=12000`
  (unid./s), em velocidade máxima o jogador percorre `playerZ` em ~4 frames (~0,067s a 60fps) —
  tempo suficiente para alterar o dígito de décimos exibido por `formatTime` (resolução de
  0.1s), já que `Hud.formatTime` trunca (`Math.floor`), então a diferença é sempre para mais
  no `racer-phaser`, nunca para menos.
- **Efeito observável:** a cada volta, o `lastLapTime` registrado (e portanto o recorde salvo em
  `localStorage['fast_lap_time']`) tende a ficar consistentemente um pouco maior no
  `racer-phaser` do que produziria o mesmo percurso no original — o jogador vê tempos de volta
  (e recordes) piores do que deveria pela lógica original.

## Causa raiz

Ao portar o bloco de `updateExtras`, foi adicionado um `else` de fallback (provavelmente para
"nunca deixar o cronômetro parado"), sem perceber que o comportamento de congelar
`currentLapTime` enquanto `position <= playerZ` é intencional no original — é exatamente essa
condição que serve de "trava" para permitir que `startPosition < this.playerZ` seja usado como
prova de que a linha foi cruzada **neste** frame.

## Correção

### Arquivo/alvo: `racer-phaser/src/game/racer/RacerEngine.ts`

Remover o `else` externo, replicando exatamente a estrutura do original:

```ts
// Lap timing (PHASER-TASK-15) — quando position cruza playerZ, fecha a volta atual
if (this.position > this.playerZ) {
  if (this.currentLapTime && (startPosition < this.playerZ)) {
    this.lastLapTime = this.currentLapTime
    this.currentLapTime = 0
  } else {
    this.currentLapTime += dt
  }
}
```

## Verificação

- [x] `currentLapTime` só é incrementado quando `this.position > this.playerZ` (sem `else`
      externo) — idêntico à estrutura de `RacerGameV4.updateExtras`
- [x] `mise exec -- npm run build` sem erros
- [x] Validação manual: dirigir várias voltas seguidas e confirmar que o tempo exibido não
      diverge de forma perceptível de uma contagem manual com cronômetro (janela de ~0.067s por
      volta deixa de ser somada)

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-07

**Resumo do que foi feito:**
Removido o `else` externo do bloco de cronometragem de volta em `RacerEngine.update()`. O código original em `RacerGameV4.updateExtras` não incrementa `currentLapTime` quando `position <= playerZ` — o cronômetro congela durante a janela logo após cruzar a linha de largada/chegada (~4 frames em velocidade máxima). A implementação do PHASER-TASK-15 adicionou incorretamente um `else { this.currentLapTime += dt }` no nível externo, o que inflava o `lastLapTime` registrado a cada volta. A correção remove esse `else`, replicando exatamente a estrutura do original.

**Problemas encontrados:**
Nenhum.

**Arquivos criados/modificados:**
- Modificado: `racer-phaser/src/game/racer/RacerEngine.ts` (removido `else` externo do bloco de cronometragem de volta)
- Modificado: `docs/migracao-phaser/tasks/correcoes-progresso.md` (status CORR-PHASER-017 marcado como [x] concluído, checklist atualizado)
