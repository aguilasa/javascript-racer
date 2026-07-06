---
id: CORR-RACER-034
title: "Correção: TrafficManager construído em onReset() com this.road ainda undefined — v4.html quebra ao carregar"
type: implementação
category: frontend
status: pendente
depends_on: ["CORR-RACER-032"]
---

# CORR-RACER-034: `TrafficManager` construído em `onReset()` com `this.road` ainda `undefined`

## Problema identificado

Confirmado em runtime (console do navegador ao abrir `v4.html`, mesmo depois de aplicado o
`CORR-RACER-032`):

```
TrafficManager.ts:27 Uncaught TypeError: Cannot read properties of undefined (reading 'segments')
    at TrafficManager.resetCars (TrafficManager.ts:27:54)
    at RacerGameV4.buildRoad (RacerGameV4.ts:50:25)
    at RacerGameV4.reset (RacerGame.ts:267:12)
    at RacerGameV4.start (RacerGame.ts:294:10)
    at async main.ts:8:1
```

`core/RacerGame.ts` (`reset()`) chama, nesta ordem:

```ts
this.onReset(options)     // linha 255

this.tweakUI.refresh({...})

if (!this.road || this.road.segments.length === 0 || options.segmentLength || options.rumbleLength)
  this.buildRoad()        // linha 267
```

`RacerGameV4.onReset()` constrói o `TrafficManager` referenciando `this.road`:

```ts
protected onReset(_options: any): void {
  if (!this.trafficManager) {
    this.trafficManager = new TrafficManager(this.road, 200, this.maxSpeed);
  }
  ...
```

Na **primeira** chamada de `reset()` (dentro de `start()`), `onReset()` roda **antes** de
`buildRoad()` ter criado `this.road` (mesmo já com o `CORR-RACER-032` aplicado, que só adicionou
`this.road = new Road(...)` dentro de `buildRoad()`, chamado depois). Ou seja,
`new TrafficManager(this.road, ...)` recebe `this.road === undefined` e **guarda essa referência
internamente**, de forma permanente — o construtor de `TrafficManager` não relê `this.road` mais
tarde, só armazena o valor recebido no momento da chamada.

Quando, na sequência do mesmo `reset()`, `buildRoad()` roda e chama
`this.trafficManager.resetCars()`, o `TrafficManager` ainda enxerga sua própria cópia de `road`
como `undefined` — mesmo que `RacerGameV4.road` já tenha sido reatribuído a uma instância real
dois passos antes, dentro do próprio `buildRoad()`. `resetCars()` então quebra em
`this.road.segments.length` (linha 27 de `TrafficManager.ts`).

## Causa raiz

Ordem de construção incompatível entre dois pontos de extensão diferentes: `onReset()` (chamado
**antes** de `buildRoad()` em `RacerGame.reset()`) tenta capturar uma referência a `this.road`,
mas `this.road` só passa a existir de fato **dentro** de `buildRoad()`, que roda depois. O guard
`if (!this.trafficManager)` em `onReset()` foi pensado para não recriar o `TrafficManager` a cada
`reset()` (ex.: ao trocar resolução via tweak UI, que não reconstrói a pista), mas o local errado
(`onReset()`, e não `buildRoad()`) para essa criação única expõe a referência ainda não
inicializada de `this.road`.

## Correção

### Arquivo/alvo: `app/src/versions/v4-final/RacerGameV4.ts`

Mover a construção do `TrafficManager` de `onReset()` para `buildRoad()`, logo após
`this.road = new Road(...)` — ponto em que `this.road` já existe de verdade. Como `buildRoad()`
só roda quando a pista precisa ser (re)construída (controlado pelo `if` em `RacerGame.reset()`),
não é necessário o guard `if (!this.trafficManager)`: recriar o `TrafficManager` junto com a
pista replica o comportamento do original, onde `resetCars()` sempre roda dentro de
`resetRoad()`.

```ts
protected onReset(_options: any): void {
  if (!this.hud) {
    this.hud = new Hud();
  }
  super.onReset(_options);
}

protected buildRoad(): void {
  this.road = new Road(this.segmentLength, this.rumbleLength);
  this.trafficManager = new TrafficManager(this.road, 200, this.maxSpeed);

  this.road.addStraight(ROAD.LENGTH.SHORT);
  ...
  resetSprites(this.road);
  this.trafficManager.resetCars();

  this.road.markStartFinish(this.playerZ);
  this.road.finalize();
}
```

## Verificação

- [ ] `v4.html` carrega sem erros no console do navegador
- [ ] Tráfego é sorteado e se move normalmente
- [ ] Trocar resolução/lanes na tweak UI (que não reconstrói a pista) não quebra nem duplica o
      tráfego
- [ ] `npm run typecheck` e `npm run build` continuam sem erros

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:** Removida a criação de `TrafficManager` de `onReset()` em
`RacerGameV4.ts`; adicionada em `buildRoad()`, logo após `this.road = new Road(...)`, onde
`this.road` já é uma instância válida. Removido o guard `if (!this.trafficManager)` (não é mais
necessário, já que `buildRoad()` só roda quando a pista de fato precisa ser reconstruída).
`onReset()` ficou só com a criação de `Hud`. Typecheck passou.

**Problemas encontrados:** Nenhum além do já descrito — a causa raiz era puramente a ordem de
construção entre `onReset()`/`buildRoad()`.

**Arquivos criados/modificados:**
- `app/src/versions/v4-final/RacerGameV4.ts` (`onReset`: removida criação de `TrafficManager`;
  `buildRoad`: adicionada criação de `TrafficManager` logo após `this.road = new Road(...)`)
