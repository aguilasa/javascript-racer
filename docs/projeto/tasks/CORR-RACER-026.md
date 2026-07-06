---
id: CORR-RACER-026
title: "Correção: RacerGameV4.startPosition nunca é atualizado — cronometragem de volta quebrada"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-RACER-026: `RacerGameV4.startPosition` nunca é atualizado — cronometragem de volta quebrada

## Problema identificado

Em `app/src/versions/v4-final/RacerGameV4.ts`, o campo `protected startPosition = 0;` (linha 15)
é declarado mas **nunca reatribuído** em nenhum lugar do arquivo:

```bash
$ grep -n "startPosition" app/src/versions/v4-final/RacerGameV4.ts
15:  protected startPosition = 0;
94:      if (this.currentLapTime && this.startPosition < this.playerZ) {
107:  protected updateParallax(_dt: number, playerSegment: any, startPosition: number): void {
108:    const delta = (this.position - startPosition) / this.road.segmentLength;
117:    _startPosition: number,
```

O único lugar que lê `this.startPosition` é a linha 94, dentro de `updateExtras()`:

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

Segundo `docs/05-v4-final.md#55` (item 6), essa lógica deveria usar o `startPosition` **local
deste frame** (a posição da câmera antes de avançar, capturada no início de `update(dt)`) para
confirmar que a linha de chegada foi de fato cruzada *neste* frame
(`startPosition < playerZ`), não que a câmera já estava além dela há muito tempo.

Como `this.startPosition` fica permanentemente `0` e `this.playerZ` é sempre positivo (calculado
em `reset()` como `cameraHeight * cameraDepth`), a condição `this.startPosition < this.playerZ`
é **sempre verdadeira**. Isso significa que, assim que `this.currentLapTime` deixa de ser `0`
(o que acontece já no segundo frame em que `position > playerZ`), o bloco de "fechar volta"
executa em **todo frame seguinte**: `lastLapTime` recebe um valor ínfimo (um `dt`, ~0.0167s),
`currentLapTime` é resetado para `0` a cada frame, e `hud.onLapComplete()` é chamado
continuamente com tempos de volta próximos de zero — o cronômetro da volta atual nunca chega a
acumular tempo real, e o HUD de "Last Lap"/recorde fica lotado de valores absurdos.

A tarefa exigia explicitamente, no critério de conclusão: "volta completa registra tempo, recorde
persiste entre reloads" — isso está quebrado.

## Causa raiz

`update(dt)` (`core/RacerGame.ts`) calcula `startPosition` localmente e a repassa para
`updateParallax(dt, playerSegment, startPosition)`, mas **não** repassa esse valor para
`updateExtras(dt)` (chamada sem esse parâmetro). `RacerGameV4.updateExtras` então recorre a um
campo de instância `this.startPosition` que nunca é atualizado, permanecendo no valor inicial.

## Correção

### Arquivo/alvo: `app/src/versions/v4-final/RacerGameV4.ts`

Capturar o `startPosition` do frame atual dentro de `updateParallax` (que já o recebe como
parâmetro e roda antes de `updateExtras` no mesmo tick de `update()`), atribuindo-o ao campo de
instância antes de `updateExtras` precisar dele:

```ts
protected updateParallax(_dt: number, playerSegment: any, startPosition: number): void {
  this.startPosition = startPosition; // captura para uso em updateExtras() no mesmo tick
  const delta = (this.position - startPosition) / this.road.segmentLength;
  this.skyOffset = Util.increase(this.skyOffset, this.skySpeed * playerSegment.curve * delta, 1);
  this.hillOffset = Util.increase(this.hillOffset, this.hillSpeed * playerSegment.curve * delta, 1);
  this.treeOffset = Util.increase(this.treeOffset, this.treeSpeed * playerSegment.curve * delta, 1);
}
```

(Alternativa equivalente: mudar a assinatura de `updateExtras` na base `RacerGame` para receber
`startPosition` diretamente, evitando o campo de instância — mais invasivo, mas também válido.)

## Verificação

- [ ] Ao rodar `v4.html`, o "Time" do HUD incrementa continuamente enquanto a volta está em
      andamento (não fica preso perto de `0`)
- [ ] Ao completar uma volta, "Last Lap" mostra um tempo plausível (dezenas de segundos, não
      frações de segundo)
- [ ] O recorde (`fast_lap_time`) só é atualizado quando uma volta completa realmente bate o
      recorde anterior, e persiste após recarregar a página
- [ ] `npm run typecheck` e `npm run build` continuam sem erros

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
