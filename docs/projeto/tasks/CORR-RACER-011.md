---
id: CORR-RACER-011
title: "Correção: RacerGame.start() chamava reset() antes de tweakUI existir, quebrando com TypeError"
type: implementação
category: frontend
status: concluída
depends_on: ["CORR-RACER-009"]
---

# CORR-RACER-011: `RacerGame.start()` chamava `reset()` antes de `tweakUI` existir

## Problema identificado

Ao validar a aplicação do CORR-RACER-009 (instanciar/conectar `TweakUI`), a ordem das chamadas
em `RacerGame.start()` ficou:

```ts
async start(canvas: HTMLCanvasElement, assetNames: string[]): Promise<void> {
  ...
  this.reset()                                                   // (1)

  this.tweakUI = new TweakUI((options) => this.reset(options))  // (2)
  this.tweakUI.bind()
  ...
}
```

E `reset()` chama incondicionalmente, desde a correção do CORR-RACER-009:

```ts
reset(options: ResetOptions = {}): void {
  ...
  this.tweakUI.refresh({ ... })
  ...
}
```

Como `this.reset()` (1) executa **antes** de `this.tweakUI` ser atribuído (2), a primeira
chamada de `reset()` — feita pelo próprio `start()` durante a inicialização — tentava acessar
`this.tweakUI.refresh(...)` com `this.tweakUI` ainda `undefined` (o campo `tweakUI!: TweakUI`
usa asserção de atribuição definitiva, que suprime a checagem do compilador mas não inicializa
nada em runtime). Isso lançaria `TypeError: Cannot read properties of undefined (reading
'refresh')`, quebrando `start()` assim que qualquer versão concreta (`RacerGameV1`, RACER-TASK-10)
chamasse esse método.

O `typecheck`/`build` não detectam o problema (é um erro de ordem em runtime, não de tipos), e o
próprio checklist de verificação do CORR-RACER-009 deixou sem marcar justamente o item que teria
pego isso — checagem manual rodando o jogo no navegador.

## Causa raiz

Ao aplicar o CORR-RACER-009, a instanciação de `TweakUI` foi inserida **depois** da primeira
chamada a `reset()` em vez de antes — a ordem correta é montar/vincular o `TweakUI` primeiro, já
que `reset()` depende dele desde a primeira execução.

## Correção

### Arquivo/alvo: `app/src/core/RacerGame.ts` (`start()`)

```diff
-    this.reset()
-
-    this.tweakUI = new TweakUI((options) => this.reset(options))
-    this.tweakUI.bind()
+    this.tweakUI = new TweakUI((options) => this.reset(options))
+    this.tweakUI.bind()
+
+    this.reset()
```

## Verificação

- [x] `this.tweakUI` é construído e vinculado (`bind()`) antes da primeira chamada a
      `this.reset()` em `start()`
- [x] `cd app && mise exec -- npm run typecheck && mise exec -- npm run build` continuam
      passando sem erro
- [x] Leitura estática confirma que `reset()` não acessa mais `this.tweakUI` antes de ele ser
      atribuído (não há mais nenhuma chamada a `reset()` precedendo a construção de `tweakUI`)

## Log de Execução

**Executado em:** 2026-07-06

**Resumo do que foi feito:** Reordenadas as três instruções em `RacerGame.start()`: a construção
e `bind()` de `TweakUI` passaram a ocorrer antes da primeira chamada a `this.reset()` (antes
vinha depois, causando acesso a `this.tweakUI` ainda `undefined` dentro de `reset()`). Typecheck
e build confirmados sem erro após a mudança.

**Problemas encontrados:** Nenhum além do já descrito (regressão introduzida pela aplicação do
CORR-RACER-009, capturada durante validação solicitada pelo usuário antes de qualquer versão
concreta chamar `start()`).

**Arquivos criados/modificados:**
- `app/src/core/RacerGame.ts` (reordenadas as linhas de `start()`)
