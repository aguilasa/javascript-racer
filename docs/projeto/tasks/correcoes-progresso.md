# Progresso de Correções — Migração para TypeScript + Vite

## Resumo executivo

| ID | Título | Criticidade | Status |
|---|---|---|---|
| CORR-RACER-001 | `mise.toml` ausente — versão do Node do projeto não está fixada | Alta | [x] concluída |
| CORR-RACER-002 | Assets de exemplo do template Vite não removidos em `app/src/assets/` | Baixa | [x] concluída |
| CORR-RACER-003 | Ícone do botão de mute quebra no build de produção (`url()` relativo em CSS bundlado) | Alta | [x] concluída |
| CORR-RACER-004 | `app/src/main.ts` órfão — não referenciado e fora da estrutura documentada | Baixa | [x] concluída |
| CORR-RACER-005 | Desvios de comportamento não documentados em `dom.ts`/`util.ts` (`resolve()` e `overlap()`) | Baixa | [x] concluída |
| CORR-RACER-006 | `StatsPanel.update()` conta frames em dobro e mede ~0ms (begin/end/update redundantes) | Alta | [x] concluída |
| CORR-RACER-007 | `Renderer.fog()` duplica `COLORS.FOG` como literal em vez de importar de `core/constants.ts` | Baixa | [x] concluída |
| CORR-RACER-008 | `Road.addLowRollingHills()` só implementa a variante v4 — sem como recuperar o traçado original da v3 | Alta | [x] concluída |
| CORR-RACER-009 | `TweakUI` nunca é instanciada/conectada — controles da UI não fazem nada | Crítica | [x] concluída |
| CORR-RACER-010 | `buildRoad()` base produz 501 segmentos em vez dos 500 exatos do v1 original | Baixa | [x] concluída |

## Checklist

- [x] CORR-RACER-001 — criar `mise.toml` fixando a versão do Node
- [x] CORR-RACER-002 — remover `typescript.svg`/`vite.svg`/`hero.png` de `app/src/assets/`
- [x] CORR-RACER-003 — trocar `url(images/mute.png)` por `url(/images/mute.png)` em `app/src/style.css`
- [x] CORR-RACER-004 — remover `app/src/main.ts` (stub órfão do scaffold original)
- [x] CORR-RACER-005 — corrigir `overlap()` (`??`→`||`) e `resolve()` (retornar `document`, não `documentElement`)
- [x] CORR-RACER-006 — simplificar `StatsPanel.update()` para uma única chamada de medição por frame
- [x] CORR-RACER-007 — `Renderer.fog()` usar `COLORS.FOG` importado em vez do literal `'#005108'`
- [x] CORR-RACER-008 — parametrizar a curva em `addLowRollingHills` (default v4, `0` para v3)
- [x] CORR-RACER-009 — instanciar/conectar `TweakUI` em `RacerGame.start()`/`reset()`
- [x] CORR-RACER-010 — trocar `addStraight(500/3)` por `addRoad(500, 0, 0, 0, 0)` em `buildRoad()`

## Detalhes por correção

### CORR-RACER-001

- **Alvo com problema:** `mise.toml` (deveria existir na raiz do repositório ou em `app/`)
- **Sintoma:** Não existe nenhum `mise.toml` no projeto. `mise current node` só reporta uma
  versão (`20.20.2`) porque o `~/.config/mise/config.toml` **global** do usuário já fixa
  `node = "20"` — em outra máquina/usuário isso reportaria "não definido". `01-executar.md`
  atribui explicitamente à RACER-TASK-01 a responsabilidade de criar esse arquivo, e isso não
  foi feito.
- **Fix:** Criar `mise.toml` na raiz do repositório com `[tools]\nnode = "20"` (ex.: via
  `mise use node@20`) e confirmar que `mise current node` rodado em `app/` reflete o arquivo do
  projeto, não o global.

### CORR-RACER-002

- **Alvo com problema:** `app/src/assets/typescript.svg`, `app/src/assets/vite.svg`,
  `app/src/assets/hero.png`
- **Sintoma:** Arquivos de exemplo do template `vanilla-ts`, não referenciados em nenhum lugar
  do código, remanescentes apesar do passo de limpeza de boilerplate da RACER-TASK-01 e do
  critério de conclusão "Boilerplate de exemplo do template removido".
- **Fix:** Remover os três arquivos (e a pasta `assets/` se ficar vazia).

### CORR-RACER-003

- **Alvo com problema:** `app/src/style.css` (regra `#mute`)
- **Sintoma:** `url(images/mute.png)` é um caminho relativo ao próprio arquivo CSS. Como
  `style.css` agora é importado via `main.ts` (não referenciado por `<link>` a partir da raiz,
  como no original), o Vite extrai o CSS para `dist/assets/style-<hash>.css` no build de
  produção, e o `url()` relativo passa a apontar para `dist/assets/images/mute.png` (inexistente)
  em vez de `dist/images/mute.png` (onde o asset realmente está). Em dev funciona por
  coincidência (CSS injetado inline resolve relativo à página); no build, o ícone do mute quebra.
  Confirmado via `mise exec -- npm run build`, que emite o aviso "images/mute.png referenced in
  images/mute.png didn't resolve at build time".
- **Fix:** Trocar para `url(/images/mute.png)` (caminho absoluto a partir da raiz do site), que
  resolve corretamente tanto em dev quanto em build, independente de onde o Vite emite o CSS.

### CORR-RACER-004

- **Alvo com problema:** `app/src/main.ts`
- **Sintoma:** Stub deixado pela RACER-TASK-01 ("será preenchido nas próximas tarefas"), mas as
  RACER-TASK-02/03 criaram os entry points reais em `src/versions/*/main.ts` sem remover o stub.
  Não é referenciado por nenhuma página HTML nem pelo `vite.config.ts`, e não faz parte da árvore
  documentada em `02-estrutura-vite.md`.
- **Fix:** Remover `app/src/main.ts`.

### CORR-RACER-005

- **Alvo com problema:** `app/src/core/util.ts` (`overlap`) e `app/src/core/dom.ts` (`resolve`)
- **Sintoma:** Duas substituições não documentadas de `||` por `??` (ou equivalente) que
  divergem do original: (1) `overlap` usa `(percent ?? 1)/2` em vez de `(percent || 1)/2` —
  diferente do caso de `project` (fallback `0`, equivalente), aqui o fallback é `1`, então
  `percent = 0` produz resultados diferentes (`0 ?? 1 = 0` vs `0 || 1 = 1`); (2) o helper interno
  `resolve()` de `dom.ts` retorna `document.documentElement` para `id === document`, em vez do
  próprio `document` como no original — usado por `Dom.on(document, ...)`, que a RACER-TASK-06
  (`InputController`) vai depender para o teclado global. Nenhuma das duas mudanças foi
  mencionada no Log de Execução da RACER-TASK-05, que só disclosed a substituição em `project`.
- **Fix:** Reverter `overlap` para `(percent || 1)/2`; fazer `resolve()` retornar o próprio
  `document` (não `documentElement`) para `id === document`.

### CORR-RACER-006

- **Alvo com problema:** `app/src/core/StatsPanel.ts` (`update()`)
- **Sintoma:** `update()` chama `this.stats.begin()` → `this.stats.end()` → `this.stats.update()`
  em sequência, uma vez por frame. Pelo código-fonte de `stats.js` instalado, `update()` já
  equivale a `end()` seguido de um novo `begin()` — chamar os três juntos sem nenhum trabalho
  real entre `begin()` e o primeiro `end()` conta `frames` duas vezes por frame visual (o widget
  de FPS do `stats.js`, visível no `#fps` de todas as páginas, reporta o dobro do FPS real) e
  mede `~0ms` de frame time (o painel de "ms" e `this.lastMs`, usado na mensagem "Your canvas
  performance is good/ok/bad", ficam incorretos).
- **Fix:** Chamar `this.stats.update()` uma única vez por frame; medir `lastMs` via timestamp
  próprio (`performance.now()`) independente do `stats.js`, para a mensagem de performance.

### CORR-RACER-007

- **Alvo com problema:** `app/src/core/Renderer.ts` (`fog()`)
- **Sintoma:** `fog()` usa `ctx.fillStyle = '#005108'` como literal, em vez de importar e usar
  `COLORS.FOG` de `core/constants.ts` (criado na RACER-TASK-04 exatamente para ser a fonte única
  de verdade das cores de jogo). O valor está correto hoje (idêntico), mas duplica a constante —
  se `COLORS.FOG` mudar no futuro, `Renderer.fog()` continuaria usando o valor antigo
  silenciosamente.
- **Fix:** Importar `COLORS` de `./constants` em `Renderer.ts` e usar `COLORS.FOG` no lugar do
  literal.

### CORR-RACER-008

- **Alvo com problema:** `app/src/core/Road.ts` (`addLowRollingHills`)
- **Sintoma:** Comparando `v3.hills.html` e `v4.final.html` função por função, todas as 8
  funções da DSL de pista são byte-idênticas entre as duas versões — **exceto
  `addLowRollingHills`**: v3 usa `curve = 0` nas 6 chamadas internas, v4 usa
  `ROAD.CURVE.EASY`/`-ROAD.CURVE.EASY` nas duas do meio. `Road.ts` implementou só a variante v4,
  com o valor da curva hardcoded (não exposto como parâmetro) — não há como a futura
  `RacerGameV3.buildRoad()` (RACER-TASK-12) recuperar o traçado sem curva do `v3.hills.html`
  original a partir deste método compartilhado. Se RACER-TASK-12 simplesmente chamar
  `road.addLowRollingHills()`, o traçado da v3 portada terá curvas onde o original não tinha —
  uma violação de "paridade de comportamento" (objetivo explícito do projeto).
- **Fix:** Adicionar um terceiro parâmetro opcional `curve: number = ROAD.CURVE.EASY` a
  `addLowRollingHills`, usado nas duas chamadas centrais (`curve`/`-curve`) em vez do literal —
  preserva o comportamento atual da v4 (chamada sem o argumento) e permite que a v3 passe `0`
  explicitamente.

### CORR-RACER-009

- **Alvo com problema:** `app/src/core/RacerGame.ts` (`start()`/`reset()`)
- **Sintoma:** `TweakUI` foi implementada corretamente na RACER-TASK-09, mas `grep -rn
  "TweakUI" app/src/` só retorna a própria declaração da classe — nunca é importada, instanciada
  nem usada. Consequência dupla: (1) `TweakUI.bind()` nunca é chamado, então os listeners de
  `change` dos controles (`resolution`, `lanes`, `roadWidth`, `cameraHeight`, `drawDistance`,
  `fieldOfView`, `fogDensity`) nunca são registrados — mover qualquer slider ou trocar qualquer
  `<select>` não faz nada; (2) `TweakUI.refresh()` nunca é chamado a partir de `reset()` (o
  original sempre chama `refreshTweakUI()` no fim de `reset()`, inclusive na primeira vez), então
  os controles nunca refletiriam a configuração real. Toda a tweak UI — um recurso central e
  visível desde a v1 — fica completamente não-funcional.
- **Fix:** Instanciar `new TweakUI((options) => this.reset(options))` em `RacerGame.start()` e
  chamar `.bind()` uma vez; chamar `this.tweakUI.refresh({...})` incondicionalmente ao final de
  `reset()`.

### CORR-RACER-010

- **Alvo com problema:** `app/src/core/RacerGame.ts` (`buildRoad()`)
- **Sintoma:** A implementação-base de `buildRoad()` chama `this.road.addStraight(500 / 3)`.
  Como `500/3 = 166.667`, cada uma das 3 fases internas de `addStraight` (`enter`/`hold`/`leave`)
  roda 167 iterações (não 166.67 arredondado), totalizando 501 segmentos — não os 500 exatos do
  `for` cru original de `v1.straight.html`. `trackLength` fica `100200` em vez de `100000`
  (0,2% mais longo). Confirmado rodando o loop equivalente em Node.
- **Fix:** Trocar por `this.road.addRoad(500, 0, 0, 0, 0)` — uma única fase de exatamente 500
  segmentos, sem a divisão fracionária em três partes.
