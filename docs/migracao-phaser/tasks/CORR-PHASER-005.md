---
id: CORR-PHASER-005
title: "Correção: RoadRenderer.colorToNumber() não entende nomes CSS ('white'/'black'), usados por COLORS.START/FINISH — linha de largada renderiza preta em vez de branca"
type: implementação
category: frontend
status: concluído
depends_on: []
---

# CORR-PHASER-005: `colorToNumber()` não entende `'white'`/`'black'` — linha de largada some

## Problema identificado

- **Arquivo:** `racer-phaser/src/game/racer/RoadRenderer.ts`
- **Estado atual (antes desta correção):**
  ```ts
  private colorToNumber(cssColor: string): number {
    return Phaser.Display.Color.HexStringToColor(cssColor).color;
  }
  ```
- **Encontrado durante:** a validação visual da PHASER-TASK-07. Com a pista renderizando (depois
  da `CORR-PHASER-004`), apareciam duas faixas horizontais sólidas e sem trapézio visível perto
  da câmera: uma **preta** e, logo abaixo, uma cinza-escura — nada nas cores esperadas
  (grama verde, pista cinza com faixas brancas). Instrumentando temporariamente o loop de
  `Game.renderRoad()` para logar `segment.color` de cada segmento não descartado, ficou claro
  que a faixa preta correspondia exatamente aos segmentos 6 e 7 — os dois segmentos que
  `road.markStartFinish()` pinta com `COLORS.START = { road: 'white', grass: 'white', rumble:
  'white' }` (a linha de largada, ver `docs/06-arquitetura-common-js.md §6.6`). A faixa cinza
  logo abaixo era, na verdade, o asfalto normal dos segmentos 4-5 — correto, só *parecendo* uma
  faixa lisa porque, tão perto da câmera, a largura projetada (`w`) é muito maior que a tela
  (>1000px contra 1024px de canvas), então nenhuma borda de grama fica visível.
- **Por que está errado:** `Phaser.Display.Color.HexStringToColor` (lida em
  `node_modules/phaser/dist/phaser.js`) só reconhece **hex** (`'#rrggbb'`/`'0xrrggbb'`/forma
  curta `'#rgb'`) via uma regex — para qualquer entrada que não bata com essa regex (como a
  palavra `'white'`), a função **não lança erro nem loga aviso**: simplesmente devolve o `Color`
  default (`r=0,g=0,b=0` — preto) sem modificá-lo. Como `constants.ts` porta `COLORS` verbatim do
  original (`app/src/core/constants.ts`, que por sua vez espelha `common.js`), `COLORS.START`/
  `COLORS.FINISH` legitimamente usam os nomes CSS `'white'`/`'black'` (não hex) — um dado de
  entrada válido que `colorToNumber` precisa suportar, não um erro de porte.

## Causa raiz

`RoadRenderer.colorToNumber()` (criado na PHASER-TASK-06) assumiu que toda entrada de cor seria
hex, sem considerar que `COLORS.START`/`COLORS.FINISH` (portados verbatim, corretamente) usam
nomes CSS. Como nenhuma tarefa/correção anterior desenhou de fato os segmentos de largada/chegada
(a PHASER-TASK-06 validou só um segmento comum, `LIGHT`/`DARK`, com coordenadas fabricadas à
mão), o bug ficou invisível até a PHASER-TASK-07 desenhar a pista inteira, incluindo a linha de
largada perto da câmera.

## Correção

### Arquivo/alvo: `racer-phaser/src/game/racer/RoadRenderer.ts`

Tratar os dois nomes CSS usados por `COLORS` explicitamente antes de delegar para
`HexStringToColor`:

```ts
private colorToNumber(cssColor: string): number {
  if (cssColor === 'white') return 0xffffff;
  if (cssColor === 'black') return 0x000000;
  return Phaser.Display.Color.HexStringToColor(cssColor).color;
}
```

Não foi necessário generalizar para todos os nomes CSS possíveis — `constants.ts` só usa hex,
`'white'` e `'black'` em toda a tabela `COLORS`.

## Verificação

- [x] `colorToNumber('white')` retorna `0xffffff`; `colorToNumber('black')` retorna `0x000000`
- [x] Validação visual (Playwright/Chromium headless): a faixa antes preta perto da câmera passa
      a aparecer **branca** (linha de largada correta)
- [x] Demais cores (`COLORS.LIGHT`/`DARK`/`FOG`/`SKY`, todas hex) continuam corretas — sem
      regressão no caminho `HexStringToColor`
- [x] `mise exec -- npm run build` sem erros

## Log de Execução

**Executado em:** 2026-07-06

**Resumo do que foi feito:** Encontrado durante a validação visual da PHASER-TASK-07, via
instrumentação temporária (`console.log`/`window._debugSegments`) do loop de renderização para
inspecionar `segment.color`/coordenadas projetadas dos primeiros segmentos não descartados —
confirmou que os segmentos 6-7 (`COLORS.START`, `'white'`) apareciam com a cor `color: 0` (preto)
depois de passar por `colorToNumber`. Corrigido `colorToNumber` para tratar `'white'`/`'black'`
explicitamente. Instrumentação de debug removida de `Game.ts` após a confirmação. Recapturado
screenshot via Playwright: a faixa antes preta agora é branca, como esperado para a linha de
largada.

**Problemas encontrados:** Nenhum além do bug relatado — a correção é um `if` de duas linhas,
sem efeitos colaterais nas demais cores (todas hex).

**Arquivos criados/modificados:**
- `racer-phaser/src/game/racer/RoadRenderer.ts` (modificado — `colorToNumber` trata nomes CSS)
