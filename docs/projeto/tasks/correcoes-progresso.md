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

## Checklist

- [x] CORR-RACER-001 — criar `mise.toml` fixando a versão do Node
- [x] CORR-RACER-002 — remover `typescript.svg`/`vite.svg`/`hero.png` de `app/src/assets/`
- [x] CORR-RACER-003 — trocar `url(images/mute.png)` por `url(/images/mute.png)` em `app/src/style.css`
- [x] CORR-RACER-004 — remover `app/src/main.ts` (stub órfão do scaffold original)
- [x] CORR-RACER-005 — corrigir `overlap()` (`??`→`||`) e `resolve()` (retornar `document`, não `documentElement`)
- [x] CORR-RACER-006 — simplificar `StatsPanel.update()` para uma única chamada de medição por frame

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
