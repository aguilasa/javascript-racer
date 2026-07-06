---
id: CORR-RACER-019
title: "Correção: RacerGameV3 duplica o render() inteiro em vez de usar pontos de extensão"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-RACER-019: RacerGameV3 duplica o render() inteiro em vez de usar pontos de extensão

## Problema identificado

- `app/src/versions/v3-hills/RacerGameV3.ts:40-106` declara `render(): void { ... }` reimplementando
  do zero o laço inteiro de renderização (background, projeção dos segmentos, back-face culling,
  clipping por `maxy`, chamada a `renderExtraLayer`, cálculo de `steer`/`updown`/`screenY`, chamada
  a `renderer.player`) — cerca de 60 linhas praticamente idênticas às de
  `app/src/core/RacerGame.ts:152-212`.
- Isso contradiz diretamente:
  - `docs/projeto/01-arquitetura-alvo.md:81-85`: *"O método `update(dt)` e `render()` **em si** (o
    esqueleto do algoritmo) vivem só em `RacerGame` e **não são reescritos pelas subclasses** — só
    os pontos [de extensão] acima. Isso é o padrão Template Method aplicado de forma direta, e evita
    duplicar o corpo inteiro de `update`/`render` quatro vezes."`
  - O próprio `core/RacerGame.ts:151` rotula o método como `// Core render — final (not overridden)`.
  - `docs/projeto/tasks/12-portar-v3-colinas.md` (seção "pontos de extensão sobrescritos") lista
    exatamente `buildRoad`, `getCameraY`, `updateParallax`, `getPlayerScreenY`, `getPlayerUpdown` —
    **não** lista `render()` como ponto a sobrescrever. Pelo contrário, item 4 da mesma seção pede
    explicitamente: *"`updateParallax(...)`: estende o offset horizontal (herdado de v2) com
    deslocamento **vertical** das camadas de fundo, proporcional a `playerY`"* — ou seja, a intenção
    documentada era resolver o parallax vertical através de `updateParallax`/um novo ponto de
    extensão, não duplicando `render()`.
- O próprio Log de Execução da tarefa admite o desvio: *"Criado `RacerGameV3.ts` com overrides: ...
  `render()` (calcula parallax vertical baseado em `playerY` e passa para `background()`)..."* — sem
  registrar isso como uma decisão intencional documentada (diferente do que foi feito para o critério
  de back-face culling, que a própria tarefa já previa como decisão a confirmar e documentar).
- Consequência prática: `Renderer.background()` (`app/src/core/Renderer.ts:64-89`) já aceita um
  6º parâmetro `offset` (usado como `destY`, ou seja, já suporta deslocamento vertical) — a via
  correta seria adicionar um novo ponto de extensão em `core/RacerGame.ts` (ex.:
  `protected getBackgroundOffsetY(playerY: number): number { return 0 }`) chamado dentro do
  `render()` compartilhado, e sobrescrevê-lo em `RacerGameV3` — exatamente o mesmo padrão já usado
  por `getCameraY`. Em vez disso, a tarefa duplicou o método inteiro. Isso vai se agravar na
  RACER-TASK-15 (`RacerGameV4`), que precisará da segunda passada de sprites/carros dentro do mesmo
  laço — se seguir o mesmo caminho, o laço de renderização existirá em **três** cópias divergentes.
- Efeito colateral do bug mascarado: `core/RacerGame.ts:155` calcula
  `Util.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, 0.5)` — fração fixa `0.5`,
  em vez de `Util.percentRemaining(this.position + this.playerZ, this.segmentLength)` como o
  original (`docs/04-v3-colinas.md:200-202`, `playerPercent`/`playerY`). Isso é inofensivo hoje só
  porque nenhuma subclasse usa mais o `render()` da base sem sobrescrevê-lo por completo (v1/v2
  sempre têm `world.y = 0`, e `RacerGameV3` recalcula `playerY` corretamente dentro da sua cópia
  duplicada). Ao remover a duplicação e voltar a usar o `render()` compartilhado, esse cálculo
  também precisa ser corrigido, ou `RacerGameV3`/`V4` herdariam um `playerY` errado.

## Causa raiz

Para adicionar deslocamento vertical de parallax, o caminho mais rápido foi copiar o método inteiro
em vez de estender o `render()` compartilhado com mais um ponto de extensão, quebrando o padrão
Template Method que toda a arquitetura do projeto (e a própria tarefa) exige.

## Correção

### Arquivo/alvo: `app/src/core/RacerGame.ts`

- Adicionar um ponto de extensão `protected getBackgroundOffsetY(_playerY: number): number { return 0 }`
  (no-op em `RacerGame`/v1/v2).
- Corrigir a fração usada para `playerY` em `render()`: calcular
  `playerPercent = Util.percentRemaining(this.position + this.playerZ, this.segmentLength)` e usar
  `Util.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent)` no lugar do
  `0.5` fixo.
- Nas três chamadas a `this.renderer.background(...)`, passar
  `this.skySpeed/hillSpeed/treeSpeed * this.getBackgroundOffsetY(playerY)` (ou equivalente) como 6º
  argumento (`offset`), no lugar do valor implícito `0` atual.

### Arquivo/alvo: `app/src/versions/v3-hills/RacerGameV3.ts`

- Remover o método `render()` inteiro.
- Sobrescrever apenas `protected getBackgroundOffsetY(playerY: number): number { return this.resolution * playerY }`
  (ajustando a fórmula exata para reproduzir `resolution * <speed-da-camada> * playerY` do original,
  já multiplicado pela velocidade de cada camada dentro do `render()` da base).
- Manter `buildRoad()`, `getCameraY()`, `getPlayerScreenY()`, `getPlayerUpdown()` como já implementados.

## Verificação

- [ ] `RacerGameV3.ts` não declara mais `render()` — usa apenas `buildRoad`, `getCameraY`,
      `getBackgroundOffsetY`, `getPlayerScreenY`, `getPlayerUpdown`
- [ ] `core/RacerGame.ts` ganha `getBackgroundOffsetY` e usa `playerPercent` (não `0.5` fixo) para
      calcular `playerY`
- [ ] `v1.html`/`v2.html`/`v3.html` continuam renderizando idêntico ao comportamento atual após a
      mudança (comparação lado a lado antes/depois)
- [ ] `mise exec -- npm run typecheck` e `mise exec -- npm run build` sem erros

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:** Adicionado ponto de extensão `getBackgroundOffsetY(playerY)` ao `render()` compartilhado em `core/RacerGame.ts` (no-op na base, retorna 0). Corrigido cálculo de `playerY` para usar `playerPercent = Util.percentRemaining(this.position + this.playerZ, this.segmentLength)` em vez da fração fixa `0.5`, replicando o comportamento do original `v3.hills.html`. Atualizado as três chamadas a `renderer.background()` para passar `this.skySpeed/hillSpeed/treeSpeed * this.getBackgroundOffsetY(playerY)` como 6º argumento (offset vertical). Removido o método `render()` duplicado de `RacerGameV3.ts` (aprox. 60 linhas). Sobrescrito apenas `getBackgroundOffsetY(playerY)` em `RacerGameV3` para retornar `this.resolution * playerY`, implementando o parallax vertical via o novo ponto de extensão. Removido import não utilizado `BACKGROUND` de `RacerGameV3.ts`. Typecheck e build passam. A correção restaura o padrão Template Method: `render()` permanece final na base, subclasses usam apenas pontos de extensão específicos.

**Problemas encontrados:** Erro de tipo corrigido: `BACKGROUND` import não utilizado em `RacerGameV3.ts` após remoção do método `render()` duplicado.

**Arquivos criados/modificados:**
- `app/src/core/RacerGame.ts` (adicionado getBackgroundOffsetY, corrigido playerY com playerPercent, atualizado background() calls)
- `app/src/versions/v3-hills/RacerGameV3.ts` (removido render(), adicionado getBackgroundOffsetY override, removido import BACKGROUND)
