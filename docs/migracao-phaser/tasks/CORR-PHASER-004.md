---
id: CORR-PHASER-004
title: "Correção: RoadRenderer/Game usam Phaser.* como global sem importá-lo como valor — ReferenceError em runtime"
type: implementação
category: frontend
status: concluído
depends_on: []
---

# CORR-PHASER-004: `Phaser.*` usado como global sem import de valor — `ReferenceError: Phaser is not defined`

## Problema identificado

- **Arquivos:** `racer-phaser/src/game/racer/RoadRenderer.ts`, `racer-phaser/src/game/scenes/Game.ts`
- **Estado atual (antes desta correção):**
  ```ts
  // RoadRenderer.ts
  import type { Scene } from 'phaser';   // só tipo, nenhum valor
  ...
  private colorToNumber(cssColor: string): number {
    return Phaser.Display.Color.HexStringToColor(cssColor).color; // 'Phaser' não importado como valor
  }
  private polygon(points: { x: number; y: number }[], color: number): void {
    const vectorPoints = points.map(p => new Phaser.Math.Vector2(p.x, p.y)); // idem
    ...
  }
  ```
- **Encontrado durante:** a implementação/validação visual da PHASER-TASK-07 (que instancia
  `RoadRenderer` dentro da `Game` scene pela primeira vez em um browser real). Abrindo a página
  com Playwright/Chromium headless, o console acusava imediatamente:
  ```
  pageerror: Phaser is not defined
  ```
  e a `Game` scene não desenhava nada.
- **Por que está errado:** `import type { Scene } from 'phaser'` é *apenas* uma anotação de tipo
  — some completamente do JavaScript emitido (esbuild/tsc removem imports `type`-only). Como
  nenhum outro import do módulo `'phaser'` existia no arquivo, o identificador `Phaser` usado nas
  expressões `Phaser.Display.Color...`/`new Phaser.Math.Vector2(...)` não existe em tempo de
  execução — só existe como *namespace de tipos* (`declare global { namespace Phaser {...} }`,
  fornecido pelos `.d.ts` do pacote), o que é suficiente para o TypeScript compilar sem erro, mas
  não para o JavaScript rodar. Essa combinação (typecheck passa, runtime quebra) é exatamente o
  tipo de problema que só aparece testando de fato num browser — nenhuma das validações
  anteriores (`tsc --noEmit`, `npm run build`) o detecta, porque nenhuma delas executa o código.
  A referência `Phaser.Math.Vector2`/`Phaser.Display.Color` foi introduzida pela `CORR-PHASER-003`
  (que corrigiu `fillPoints` para receber `{x,y}`/`Vector2`), cujo Log de Execução afirmava
  validação visual bem-sucedida — mas essa validação, à luz deste erro, não pode ter sido feita
  contra um browser real com esse exato código.

## Causa raiz

`import type` não traz o valor do módulo para o escopo — só o tipo. Usar `Phaser.X.Y` como
expressão de valor exige um import de valor do módulo `'phaser'` (ex.: `import * as Phaser from
'phaser'`), que não existia em nenhum dos dois arquivos.

## Correção

### Arquivo/alvo: `racer-phaser/src/game/racer/RoadRenderer.ts`

Adicionada uma segunda linha de import, de valor, ao lado do import de tipo já existente:

```ts
import * as Phaser from 'phaser';
import type { Scene } from 'phaser';
```

### Arquivo/alvo: `racer-phaser/src/game/scenes/Game.ts`

Mesma correção — `Game.create()` (PHASER-TASK-07) também usa
`Phaser.Display.Color.HexStringToColor(...)` para a cor de fundo:

```ts
import * as Phaser from 'phaser';
import { Scene } from 'phaser';
```

## Verificação

- [x] `mise exec -- npx tsc --noEmit -p tsconfig.json` sem erros
- [x] `mise exec -- npm run build` sem erros
- [x] Navegando até a `Game` scene em um browser real (Playwright/Chromium headless), zero
      `pageerror`/`console.error` — confirmado via `page.on('pageerror', ...)` e
      `page.on('console', ...)` durante a validação da PHASER-TASK-07
- [x] `RoadRenderer.colorToNumber`/`polygon` executam sem `ReferenceError`

## Log de Execução

**Executado em:** 2026-07-06

**Resumo do que foi feito:** Encontrado durante a implementação/validação visual da
PHASER-TASK-07 — a primeira vez que `RoadRenderer` (criado na PHASER-TASK-06, corrigido na
CORR-PHASER-003) rodou de fato num browser. Adicionado `import * as Phaser from 'phaser'` em
`RoadRenderer.ts` (ao lado do `import type { Scene }` já existente) e em `Game.ts` (ao lado do
`import { Scene }` já existente). Confirmado com Playwright que a página carrega sem
`pageerror`/`console.error` e a pista é desenhada.

**Problemas encontrados:** Este é o segundo bug de runtime encontrado nesta mesma sessão de
validação que só se manifesta rodando o código de fato num browser — nem `tsc --noEmit` nem
`vite build` o capturam, já que ambos não executam o JavaScript resultante. Reforça a
recomendação já registrada em `CORR-PHASER-003` (seção "Recomendação adicional") de que
validação visual real (não só compilar) é indispensável para tarefas desta migração — ver
também `CORR-PHASER-005`, encontrado na mesma sessão.

**Arquivos criados/modificados:**
- `racer-phaser/src/game/racer/RoadRenderer.ts` (adicionado import de valor)
- `racer-phaser/src/game/scenes/Game.ts` (adicionado import de valor)
