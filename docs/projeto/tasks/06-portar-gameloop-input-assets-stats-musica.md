---
id: RACER-TASK-06
title: "Portar GameLoop, AssetLoader, InputController, StatsPanel, MusicPlayer"
type: implementação
category: frontend
phase: 1
depends_on: ["RACER-TASK-05"]
status: pendente
---

# RACER-TASK-06: Portar `GameLoop`, `AssetLoader`, `InputController`, `StatsPanel`, `MusicPlayer`

## Contexto

- **Fonte original:** `common.js`, namespace `Game` — ver
  `docs/06-arquitetura-common-js.md#64-game--o-motor-do-loop-carregamento-de-imagens-teclado-stats-e-música`.
- Diferente de `Dom`/`Util` (RACER-TASK-05), estas peças têm **estado e ciclo de vida** — por
  isso viram **classes** (ver `docs/projeto/01-arquitetura-alvo.md`, "Princípio geral").
- As cinco classes são independentes entre si (podem ser implementadas em qualquer ordem
  dentro desta tarefa).

## Objetivo

Criar, em `app/src/core/`:

1. `GameLoop.ts` — substitui `Game.run` (o acumulador de passo fixo).
2. `AssetLoader.ts` — substitui `Game.loadImages`.
3. `InputController.ts` — substitui `Game.setKeyListener` + as flags globais
   (`keyLeft`/`keyRight`/`keyFaster`/`keySlower`).
4. `StatsPanel.ts` — substitui `Game.stats` (usa o `stats.js` instalado na RACER-TASK-03).
5. `MusicPlayer.ts` — substitui `Game.playMusic` + o botão de mute.

## Requisitos da implementação

### `GameLoop.ts`

```ts
export class GameLoop {
  constructor(
    private readonly step: number,
    private readonly update: (dt: number) => void,
    private readonly render: () => void,
    private readonly onFrame?: () => void, // ex.: stats.update()
  ) {}

  start(): void {
    // acumulador de passo fixo, idêntico à lógica de Game.run
    // (docs/06-arquitetura-common-js.md#gamerun) — dt limitado a 1s,
    // while (gdt > step) { gdt -= step; update(step) }, depois render() uma vez
  }
}
```

Preservar exatamente a lógica documentada — inclusive o limite de `dt` a 1 segundo (proteção
contra abas em segundo plano) e o uso de `requestAnimationFrame`.

### `AssetLoader.ts`

```ts
export class AssetLoader {
  loadImages(names: string[]): Promise<HTMLImageElement[]> {
    // substitui o callback de Game.loadImages por uma Promise
    // (Promise.all sobre uma lista de <img>.onload)
  }
}
```

### `InputController.ts`

Encapsula as flags de teclado como campos de instância (não globais), com um método `bind`
equivalente a `Game.setKeyListener`:

```ts
export interface KeyBinding {
  keys: number[]
  mode: 'down' | 'up'
  action: () => void
}

export class InputController {
  bind(bindings: KeyBinding[]): void {
    // document.addEventListener('keydown'/'keyup', ...) — mesma lógica de Game.setKeyListener
  }
}
```

> Ver `docs/projeto/04-riscos-decisoes-abertas.md`, item 7 (padrão de estado do teclado) — o
> plano recomenda manter o padrão original (flags), só que encapsuladas na classe em vez de
> globais no escopo do módulo.

### `StatsPanel.ts`

Substitui `Game.stats(parentId, id)` — recebe o elemento pai (via `core/dom.ts`), cria o
`Stats` (do pacote `stats.js` instalado na RACER-TASK-03) e a mensagem "Your canvas
performance is good/ok/bad" com o mesmo intervalo de 5 segundos.

### `MusicPlayer.ts`

Substitui `Game.playMusic` — recebe o elemento `<audio>` e o elemento do botão de mute (via
`core/dom.ts`), com `play()`, `toggleMute()`, e persistência via `Dom.storage`
(`localStorage`), exatamente como o original.

## Passos

1. Ler `common.js`, namespace `Game` inteiro, e
   `docs/06-arquitetura-common-js.md` §6.4.
2. Implementar as 5 classes em `app/src/core/`.
3. `npm run typecheck` sem erros.

## Critério de conclusão

- [ ] `core/GameLoop.ts` com o acumulador de passo fixo idêntico ao original (incluindo o
      limite de `dt` a 1s)
- [ ] `core/AssetLoader.ts` com `loadImages` retornando `Promise<HTMLImageElement[]>`
- [ ] `core/InputController.ts` com flags encapsuladas em instância, não globais
- [ ] `core/StatsPanel.ts` usando o pacote `stats.js` instalado
- [ ] `core/MusicPlayer.ts` com persistência de mute via `localStorage`
- [ ] `npm run typecheck` sem erros
- [ ] Nenhum arquivo fora de `app/` foi alterado

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
