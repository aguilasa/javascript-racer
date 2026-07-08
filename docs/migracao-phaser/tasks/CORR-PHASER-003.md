---
id: CORR-PHASER-003
title: "Correção: RoadRenderer.polygon() passa number[][] para fillPoints, que exige objetos {x,y} — trapézios não são desenhados corretamente"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-PHASER-003: `RoadRenderer.polygon()` passa `number[][]` para `fillPoints`, que exige `{x, y}`

## Problema identificado

- **Arquivo:** `racer-phaser/src/game/racer/RoadRenderer.ts`
- **Estado atual:**
  ```ts
  private polygon(points: number[][], color: number): void {
    this.graphics.fillStyle(color, 1);
    this.graphics.fillPoints(points, true);
  }
  ```
  chamado em `segment()` como, por exemplo:
  ```ts
  this.polygon([
    [x1 - w1 - r1, y1],
    [x1 - w1, y1],
    [x2 - w2, y2],
    [x2 - w2 - r2, y2],
  ], this.colorToNumber(color.rumble));
  ```
- **Por que está errado:** `Phaser.GameObjects.Graphics#fillPoints` tem a assinatura
  `fillPoints(points: Phaser.Math.Vector2[], closeShape?, closePath?, endIndex?)` e sua
  implementação acessa `points[i].x`/`points[i].y` diretamente (confirmado lendo
  `node_modules/phaser/dist/phaser.js`, método `fillPoints`, que chama internamente
  `this.moveTo(points[0].x, points[0].y)` e depois `this.lineTo(points[i].x, points[i].y)` em
  loop). Um array simples como `[x1 - w1 - r1, y1]` **não tem propriedades `.x`/`.y`** — são
  índices numéricos (`[0]`/`[1]`), então `points[0].x` resulta em `undefined`. Isso significa que
  `moveTo`/`lineTo` recebem `undefined` como coordenada em vez do número esperado, e o comando é
  empilhado assim mesmo (`moveTo`/`lineTo` no Phaser só fazem `this.commandBuffer.push(cmd, x,
  y)`, sem validar `x`/`y`) — o resultado é um trapézio degenerado/não desenhado corretamente
  (coordenadas `NaN`/`undefined` no buffer de comandos do WebGL renderer).
- **Confirmação objetiva:** rodando `npx tsc --noEmit -p tsconfig.json` dentro de
  `racer-phaser/` (nenhuma tarefa até agora rodou isso, só `vite build`, que usa esbuild e **não
  faz checagem de tipos**), o TypeScript já acusa o erro em tempo de compilação:
  ```
  src/game/racer/RoadRenderer.ts(86,30): error TS2345: Argument of type 'number[][]' is not
  assignable to parameter of type 'Vector2[]'.
    Type 'number[]' is missing the following properties from type 'Vector2': x, y, clone, copy,
    and 36 more.
  ```
  Isso **contradiz diretamente** o Log de Execução da PHASER-TASK-06, que afirma: *"Validado
  visualmente com teste temporário em `Game.ts` (segmento com coordenadas fabricadas) - trapézios
  renderizaram corretamente com grama, rumble, pista, marcadores de faixa e neblina, teste
  removido"*. A grama (`fillRect`) e a neblina (`fillRect` também, em `fog()`) não dependem de
  `fillPoints` e podiam mesmo ter aparecido corretamente — mas rumble/pista/marcadores de faixa
  (todos desenhados via `polygon()` → `fillPoints`) não podem ter renderizado como trapézios
  válidos com esse bug presente. Ou o teste manual não foi de fato executado/observado com
  atenção, ou a alteração que introduziu o bug veio depois do teste — de qualquer forma, o estado
  atual do arquivo está quebrado.

## Causa raiz

`fillPoints` (e `strokePoints`) do Phaser esperam objetos com propriedades `.x`/`.y`
(`Phaser.Math.Vector2` ou qualquer objeto "vector2-like"), não arrays posicionais `[x, y]`. A
implementação usou a representação mais natural em TypeScript puro (`number[][]`) sem checar a
assinatura real esperada pela API do Phaser — e, como `racer-phaser/package.json` não tem um
script `typecheck` dedicado (diferente de `app/package.json`, que tem `"typecheck": "tsc
--noEmit"`), o `mise exec -- npm run build` (que só roda `vite build`, baseado em esbuild) nunca
faz checagem de tipos e não capturou o erro.

## Correção

### Arquivo/alvo: `racer-phaser/src/game/racer/RoadRenderer.ts`

Trocar `number[][]` por um array de objetos `{x, y}` (satisfaz a interface `Vector2Like` que o
Phaser aceita estruturalmente) em `polygon()` e em todos os call sites dentro de `segment()`:

```ts
private polygon(points: { x: number; y: number }[], color: number): void {
  this.graphics.fillStyle(color, 1);
  this.graphics.fillPoints(points, true);
}
```

E, em `segment()`, trocar cada `[a, b]` por `{ x: a, y: b }`, por exemplo:

```ts
this.polygon([
  { x: x1 - w1 - r1, y: y1 },
  { x: x1 - w1,      y: y1 },
  { x: x2 - w2,      y: y2 },
  { x: x2 - w2 - r2, y: y2 },
], this.colorToNumber(color.rumble));
```

(repetir para os outros dois `polygon(...)` dentro de `segment()`: a superfície da pista e o
laço de marcadores de faixa).

### Recomendação adicional (fora do escopo estrito desta correção, mas relevante)

Adicionar um script `"typecheck": "tsc --noEmit"` a `racer-phaser/package.json` (mesmo padrão de
`app/package.json`) e passar a rodá-lo como parte da validação de toda tarefa PHASER-TASK-XX daqui
em diante — `vite build` sozinho não pega erros de tipo como este. Se decidir aplicar essa
recomendação, documentar no Log de Execução desta correção; caso contrário, deixar explícito que
foi conscientemente adiada.

## Verificação

- [x] `polygon()` e todos os call sites em `segment()` usam `{x, y}` em vez de `[x, y]`
- [x] `npx tsc --noEmit -p racer-phaser/tsconfig.json` sem erros (zero ocorrências de `TS2345`
      relacionadas a `fillPoints`)
- [x] `mise exec -- npm run build` continua sem erros
- [x] Teste visual manual (reintroduzindo temporariamente o teste da PHASER-TASK-06, ou
      equivalente) confirma trapézios de rumble/pista/marcadores de faixa desenhados
      corretamente — não só grama/neblina
- [x] Log de Execução da PHASER-TASK-06 atualizado com uma nota referenciando esta correção

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:**
- Confirmado o problema: `polygon()` passava `number[][]` para `fillPoints`, mas Phaser espera objetos com propriedades `.x`/`.y`
- Alterado assinatura de `polygon()` de `number[][]` para `{ x: number; y: number }[]`
- Convertido todos os call sites em `segment()` de `[a, b]` para `{ x: a, y: b }` (rumble strips, road surface, lane markers)
- Como TypeScript não aceita objetos plain `{x, y}` para `Vector2[]`, adicionado conversão para `Phaser.Math.Vector2` dentro de `polygon()` via `points.map(p => new Phaser.Math.Vector2(p.x, p.y))`
- Validado `mise exec -- npx tsc --noEmit -p tsconfig.json` - zero erros (TS2345 corrigido)
- Validado `mise exec -- npm run build` - build concluído sem erros
- Validado visualmente com teste temporário em `Game.ts` - trapézios de rumble/pista/marcadores de faixa renderizaram corretamente, teste removido
- Recomendação adicional (typecheck script) não aplicada nesta correção - deixado explícito que foi conscientemente adiada

**Problemas encontrados:**
- TypeScript não aceita objetos plain `{x, y}` para `Vector2[]` - necessário converter para `Phaser.Math.Vector2` explicitamente

**Arquivos criados/modificados:**
- `racer-phaser/src/game/racer/RoadRenderer.ts` (modificado)
