---
id: CORR-PHASER-006
title: "Correção: RacerEngine.getPlayerScreenY()/getPlayerUpdown() ficaram no comportamento base (v1) em vez do final da v3/v4"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-PHASER-006: `getPlayerScreenY()`/`getPlayerUpdown()` não foram fundidos com o comportamento final v3/v4

## Problema identificado

- **Arquivo:** `racer-phaser/src/game/racer/RacerEngine.ts`
- **Estado atual:**
  ```ts
  private getPlayerScreenY(_playerSegment: Segment): number {
    return this.height
  }

  private getPlayerUpdown(_playerSegment: Segment): number {
    return 0
  }
  ```
- **Por que está errado:** o objetivo central da PHASER-TASK-08 (ver `docs/migracao-phaser/
  01-arquitetura-alvo.md`, seção "Por que uma única `RacerEngine`") é que os pontos de extensão
  de `RacerGame` "já vêm com o comportamento final aplicado diretamente" — ou seja, `RacerEngine`
  deve conter a **última sobrescrita** de cada ponto de extensão (a da v4/v3, não a da v1 base),
  já que não existe mais cadeia de herança V1→V4. `getCameraY` foi corretamente fundido
  (`return playerY + this.cameraHeight`, o override de v3 — confirmado em
  `app/src/versions/v3-hills/RacerGameV3.ts:34-37`), mas `getPlayerScreenY`/`getPlayerUpdown`
  ficaram com o corpo **base de v1** (`app/src/core/RacerGame.ts`, que retorna `this.height`/`0`
  como *default* antes de qualquer sobrescrita), em vez do override real de v3 (herdado por v4
  sem mudança, confirmado em `app/src/versions/v3-hills/RacerGameV3.ts:44-55`):
  ```ts
  // RacerGameV3.ts — o comportamento correto a fundir em RacerEngine
  protected getPlayerScreenY(playerSegment: Segment): number {
    const playerPercent = Util.percentRemaining(this.position + this.playerZ, this.segmentLength)
    const cameraY = Util.interpolate(playerSegment.p1.camera.y, playerSegment.p2.camera.y, playerPercent)
    return (this.height / 2) - (this.cameraDepth / this.playerZ * cameraY * this.height / 2)
  }

  protected getPlayerUpdown(playerSegment: Segment): number {
    return playerSegment.p2.world.y - playerSegment.p1.world.y
  }
  ```
  Sem essa correção, o carro do jogador (quando ligado ao render na PHASER-TASK-09) ficaria
  sempre cravado no fundo do canvas (`screenY = height` fixo, ignorando a altura real do terreno)
  e nunca escolheria os sprites `PLAYER_UPHILL_*` (já que `updown` seria sempre `0`) — quebrando
  exatamente o comportamento "câmera relativa ao terreno" que é a característica central de v3/v4
  (ver `docs/04-v3-colinas.md §4.7`).
- **Por que não foi pego antes:** a PHASER-TASK-08 não integra `RacerEngine` a nenhuma cena
  ainda (isso é a PHASER-TASK-09), então o bug não tem sintoma visual hoje — só apareceria depois,
  tornando o diagnóstico mais difícil se não for corrigido agora, na origem.

## Causa raiz

Ao fundir os pontos de extensão de `RacerGame`+`RacerGameV1`...`V4` em uma única classe, os
métodos `getCameraY` foram corretamente atualizados para a versão final (v3/v4), mas
`getPlayerScreenY`/`getPlayerUpdown` foram deixados com o corpo-base de `RacerGame` (v1),
aparentemente por terem sido copiados antes de conferir os overrides em
`RacerGameV3.ts`/`RacerGameV2.ts`.

## Correção

### Arquivo/alvo: `racer-phaser/src/game/racer/RacerEngine.ts`

Substituir os dois métodos pelo comportamento final de `RacerGameV3.ts` (herdado, sem mudança,
por v4):

```ts
private getPlayerScreenY(playerSegment: Segment): number {
  const playerPercent = Util.percentRemaining(this.position + this.playerZ, this.segmentLength)
  const cameraY = Util.interpolate(playerSegment.p1.camera.y, playerSegment.p2.camera.y, playerPercent)
  return (this.height / 2) - (this.cameraDepth / this.playerZ * cameraY * this.height / 2)
}

private getPlayerUpdown(playerSegment: Segment): number {
  return playerSegment.p2.world.y - playerSegment.p1.world.y
}
```

(remover o prefixo `_` de `playerSegment` nas assinaturas, já que o parâmetro passa a ser usado).

## Verificação

- [ ] `getPlayerScreenY`/`getPlayerUpdown` reproduzem exatamente as fórmulas de
      `RacerGameV3.ts:44-55`
- [ ] `mise exec -- npx tsc --noEmit -p tsconfig.json` sem novos erros
- [ ] `mise exec -- npm run build` sem erros
- [ ] Log de Execução da PHASER-TASK-08 atualizado com uma nota referenciando esta correção

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:**
Substituído `getPlayerScreenY()` e `getPlayerUpdown()` em `RacerEngine.ts` pelas fórmulas de `RacerGameV3.ts` (comportamento final v3/v4). Os métodos agora calculam corretamente a posição de tela do jogador relativa ao terreno em vez de usar valores fixos (v1 base). Isso garante que a câmera relativa ao terreno funcione corretamente quando o jogador for integrado na PHASER-TASK-09.

**Problemas encontrados:**
Durante a verificação com `npx tsc --noEmit`, foram detectados campos não utilizados (`fps` e `startPosition`) que causam erro TS6133. Estes são preexistentes e serão tratados pela CORR-PHASER-008, não fazem parte desta correção. O `npm run build` (que não checa tipos) passou sem erros.

**Arquivos criados/modificados:**
- Modificado: `racer-phaser/src/game/racer/RacerEngine.ts` (linhas 188-196, substituídos `getPlayerScreenY` e `getPlayerUpdown`)
- Modificado: `docs/migracao-phaser/tasks/correcoes-progresso.md` (status CORR-PHASER-006 marcado como [x] concluído, checklist atualizado)
