---
id: CORR-RACER-012
title: "Correção: MusicPlayer nunca é instanciado — v1.html toca sem música e o botão de mute não funciona"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-RACER-012: MusicPlayer nunca é instanciado — v1.html toca sem música e o botão de mute não funciona

## Problema identificado

- **Arquivo com o problema:** `app/src/core/RacerGame.ts` (método `start()`)
- **Estado atual:** `grep -rn "MusicPlayer" app/src/` só retorna a própria declaração da classe em
  `app/src/core/MusicPlayer.ts` — a classe nunca é importada nem instanciada em nenhum outro
  arquivo (nem `RacerGame.ts`, nem `main.ts` de nenhuma versão). `RacerGame.start()` monta
  `Renderer`, `StatsPanel`, `AssetLoader`, `TweakUI` e `InputController`, mas não menciona
  `MusicPlayer` em nenhum ponto.
- **Por que está errado:** No original, `common.js` (`Game.run`, ver
  `docs/06-arquitetura-common-js.md`, seção 6.4/linha 134) chama `Game.playMusic()`
  **incondicionalmente** logo após iniciar o primeiro `frame()` do loop — isso vale para **todas**
  as quatro versões, inclusive `v1.straight.html`, que já inclui `<audio id="music">` e
  `<span id="mute">` no HTML (confirmado lendo o arquivo original linha 77-81). O mesmo par de
  elementos existe em `app/v1.html` (linhas 76-79), copiado corretamente pela RACER-TASK-02. A
  classe `MusicPlayer` foi implementada corretamente pela RACER-TASK-06 (loop, volume `0.05`,
  leitura/gravação de `Dom.storage['muted']`, toggle de classe `on` no botão) — mas nunca é
  conectada a nada. Resultado real: `v1.html` carrega e joga silenciosamente, e clicar no ícone de
  mute não tem efeito algum, uma divergência de comportamento perceptível em relação ao
  `v1.straight.html` original (que toca música em loop, baixo volume, desde o primeiro frame).
- **Por que isso pertence à revisão da RACER-TASK-10:** `docs/projeto/03-fases-execucao.md` e
  `docs/projeto/tasks/06-portar-gameloop-input-assets-stats-musica.md` colocam `MusicPlayer` junto
  com `GameLoop`/`AssetLoader`/`InputController`/`StatsPanel` como infraestrutura **compartilhada
  desde a v1** (não é um recurso exclusivo de v4) — não há nenhuma nota em `04-riscos-decisoes-abertas.md`
  nem em `01-arquitetura-alvo.md` adiando a música para uma versão posterior. A RACER-TASK-10 é a
  primeira tarefa em que `v1.html` se torna de fato jogável e comparável ao original — é aqui que a
  ausência de som se torna uma divergência de comportamento observável.

## Causa raiz

`RacerGame.start()` (RACER-TASK-09) instancia todos os subsistemas de `core/` exceto `MusicPlayer` — um esquecimento na lista de wiring do método, nunca detectado porque nenhuma tarefa posterior verificou audio/mute manualmente.

## Correção

### Arquivo/alvo: `app/src/core/RacerGame.ts`

Em `start()`, após montar `background`/`sprites` (ou em qualquer ponto após o DOM estar disponível), instanciar `MusicPlayer`, espelhando a chamada incondicional de `Game.playMusic()` do original:

```ts
import { MusicPlayer } from './MusicPlayer'

// dentro de start(), por exemplo logo antes de `const input = new InputController()`:
new MusicPlayer('music', 'mute')
```

Não é necessário guardar a instância em um campo se nada mais precisar dela depois (o construtor já faz todo o trabalho — `play()`, listener de `click` do botão de mute), mas avaliar se a classe deveria expor um método público (`play()`) chamado explicitamente em vez de fazer tudo no construtor, para maior clareza — qualquer uma das duas formas resolve o problema, desde que `v1.html`/`v2.html`/`v3.html`/`v4.html` passem a tocar música ao iniciar.

## Verificação

- [x] `grep -rn "new MusicPlayer" app/src/core/RacerGame.ts` retorna uma ocorrência
- [ ] `mise exec -- npm run dev`, abrir `v1.html`: música toca em loop, volume baixo, ao carregar a página
- [ ] Clicar no ícone de mute alterna o estado (classe `on`) e o áudio muda de mudo/não-mudo
- [ ] Recarregar a página após mutar preserva o estado de mudo (via `localStorage`)
- [x] `mise exec -- npm run typecheck` e `mise exec -- npm run build` sem erros

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:** Importado `MusicPlayer` em `RacerGame.ts`. Em `start()`, após
`this.tweakUI.bind()`, adicionado `new MusicPlayer('music', 'mute')` para instanciar o player de
música incondicionalmente, espelhando a chamada de `Game.playMusic()` do original. Isso faz com
que `v1.html` (e todas as versões) toquem música em loop com volume baixo ao carregar, e o botão
de mute funcione corretamente. Typecheck e build passam. Validação visual (teste de áudio) requer
execução manual de `npm run dev`.

**Problemas encontrados:** Nenhum.

**Arquivos criados/modificados:**
- `app/src/core/RacerGame.ts` (import MusicPlayer, instanciação em start())
