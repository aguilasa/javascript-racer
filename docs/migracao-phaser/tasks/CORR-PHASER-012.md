---
id: CORR-PHASER-012
title: "Correção: Game.update() chama this.input.keyboard.addKeys(...) a cada frame em vez de uma única vez"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-PHASER-012: `addKeys(...)` chamado a cada frame dentro de `update()`

## Problema identificado

- **Arquivo:** `racer-phaser/src/game/scenes/Game.ts`
- **Estado atual:**
  ```ts
  update (time: number, delta: number)
  {
      const keys = this.input.keyboard!.addKeys({ ... });   // <- dentro de update(), roda a cada frame
      this.racerEngine.keyLeft = (keys as any).left.isDown || (keys as any).a.isDown;
      ...
  }
  ```
- **Por que é um problema (menor, não bloqueante):** `addKeys` é pensado para ser chamado uma vez
  (tipicamente em `create()`), guardando a referência retornada. Chamá-lo a cada frame recria o
  objeto de mapeamento (e possivelmente os `Key` internos, dependendo da implementação do
  `KeyboardPlugin`) sem necessidade, gerando trabalho e alocação de objeto redundante 60x/segundo
  — não é um bug de comportamento (a leitura de `.isDown` continua correta), mas é desperdício
  evitável e diverge do padrão idiomático do Phaser.
- **Uso de `as any`**: o objeto retornado por `addKeys({left: ..., right: ...})` não fica
  tipado com essas chaves nomeadas automaticamente, forçando `(keys as any).left` em vez de
  `keys.left` — sinal de que o tipo de retorno não foi anotado corretamente.

## Causa raiz

`addKeys` foi colocado dentro de `update()` em vez de `create()`, provavelmente por não ter sido
notado que a chamada não precisa (nem deve) ser repetida a cada frame.

## Correção

### Arquivo/alvo: `racer-phaser/src/game/scenes/Game.ts`

Mover a chamada para `create()`, guardando o resultado tipado como campo da classe:

```ts
private keys!: { left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key; up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; a: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key; w: Phaser.Input.Keyboard.Key; s: Phaser.Input.Keyboard.Key };

create() {
  ...
  this.keys = this.input.keyboard!.addKeys({
    left: Phaser.Input.Keyboard.KeyCodes.LEFT,
    right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    up: Phaser.Input.Keyboard.KeyCodes.UP,
    down: Phaser.Input.Keyboard.KeyCodes.DOWN,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    d: Phaser.Input.Keyboard.KeyCodes.D,
    w: Phaser.Input.Keyboard.KeyCodes.W,
    s: Phaser.Input.Keyboard.KeyCodes.S,
  }) as typeof this.keys;
}

update(time: number, delta: number) {
  this.racerEngine.keyLeft = this.keys.left.isDown || this.keys.a.isDown;
  this.racerEngine.keyRight = this.keys.right.isDown || this.keys.d.isDown;
  this.racerEngine.keyFaster = this.keys.up.isDown || this.keys.w.isDown;
  this.racerEngine.keySlower = this.keys.down.isDown || this.keys.s.isDown;
  ...
}
```

## Verificação

- [ ] `addKeys` chamado uma única vez, em `create()`
- [ ] Nenhum `as any` restante para acessar as teclas
- [ ] Validação manual: input continua funcionando (setas + WASD) sem regressão
- [ ] `mise exec -- npm run build` sem erros

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:**
Corrigido `addKeys()` sendo chamado a cada frame em `update()` para ser chamado uma única vez em `create()`:
- Adicionado campo `keys` tipado como `{ left: Phaser.Input.Keyboard.Key; right: ...; a: ...; d: ...; w: ...; s: ... }` à classe
- Movido a chamada `this.input.keyboard!.addKeys({...})` de `update()` para `create()`
- Guardado o resultado em `this.keys` com cast `as typeof this.keys` para tipagem correta
- Removido o uso de `as any` em `update()`, agora acessando diretamente `this.keys.left.isDown`, etc.
- Isso elimina a alocação redundante de objeto 60x/segundo e segue o padrão idiomático do Phaser

**Problemas encontrados:**
Nenhum.

**Arquivos criados/modificados:**
- Modificado: `racer-phaser/src/game/scenes/Game.ts` (campo keys adicionado, addKeys() movido para create(), update() simplificado)
- Modificado: `docs/migracao-phaser/tasks/correcoes-progresso.md` (status CORR-PHASER-012 marcado como [x] concluído, checklist atualizado)
