---
id: CORR-RACER-024
title: "Correção: Hud não inicializa o recorde persistido de volta mais rápida (default 180s + exibição inicial)"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-RACER-024: `Hud` não inicializa o recorde persistido de volta mais rápida (default `180` + exibição inicial)

## Problema identificado

- **Arquivo:** `app/src/versions/v4-final/Hud.ts`

No original, a inicialização do recorde de volta mais rápida acontece uma única vez, no callback
`ready` de `Game.run` (`v4.final.html`, linhas 621-627):

```javascript
ready: function(images) {
  background = images[0];
  sprites    = images[1];
  reset();
  Dom.storage.fast_lap_time = Dom.storage.fast_lap_time || 180;
  updateHud('fast_lap_time', formatTime(Util.toFloat(Dom.storage.fast_lap_time)));
}
```

Isso garante que: (1) na primeira execução (sem recorde salvo em `localStorage`), o recorde é
inicializado com um valor plausível de `180` segundos, e (2) o HUD já exibe esse valor formatado
(`"3.00.0"`) assim que o jogo carrega — não a string estática `"0.0"` do HTML.

`Hud.ts` portado não tem nenhum código equivalente — seu construtor só busca as referências DOM,
sem tocar `Dom.storage.fast_lap_time` nem atualizar `fast_lap_time_value` na inicialização:

```ts
constructor() {
  this.speedDom = Dom.get('speed_value');
  this.currentLapTimeDom = Dom.get('current_lap_time_value');
  this.lastLapTimeDom = Dom.get('last_lap_time_value');
  this.fastLapTimeDom = Dom.get('fast_lap_time_value');
}
```

Isso é uma peça do "recorde persistido" — entrega explícita do critério de conclusão da
RACER-TASK-14 ("`Hud.ts` com velocímetro, tempo de volta atual, última volta, **recorde
persistido**") — que ficou de fora.

Há precedente direto neste mesmo código-base para essa forma de portar: `MusicPlayer`
(RACER-TASK-06, `app/src/core/MusicPlayer.ts`) replica exatamente essa mesma classe de
inicialização (`Dom.storage['muted']`, aplicada uma vez no próprio construtor) — a lógica
equivalente de `Game.playMusic()`, que também rodava incondicionalmente ao final de `Game.run`
no original.

## Causa raiz

O construtor de `Hud` não replica a inicialização de `Dom.storage.fast_lap_time` (default `180`)
nem a atualização inicial do HUD que, no original, roda uma vez ao carregar o jogo — parte do
comportamento de "recorde persistido" ficou implicitamente assumida como escopo da RACER-TASK-15
(integração), mas nada nos documentos do plano atribui essa responsabilidade a ela
especificamente, e o padrão já estabelecido por `MusicPlayer` é o componente se auto-inicializar
a partir de `Dom.storage` no próprio construtor.

## Correção

### Arquivo/alvo: `app/src/versions/v4-final/Hud.ts`

Adicionar ao final do construtor:

```ts
constructor() {
  this.speedDom = Dom.get('speed_value');
  this.currentLapTimeDom = Dom.get('current_lap_time_value');
  this.lastLapTimeDom = Dom.get('last_lap_time_value');
  this.fastLapTimeDom = Dom.get('fast_lap_time_value');

  Dom.storage.fast_lap_time = Dom.storage.fast_lap_time || '180';
  this.setIfChanged('fast_lap_time', this.fastLapTimeDom, this.formatTime(parseFloat(Dom.storage.fast_lap_time)));
}
```

(Ajustar tipos conforme o helper de `Dom.storage` já usado em `onLapComplete`.)

## Verificação

- [x] Ao instanciar `Hud` sem recorde salvo em `localStorage`, `Dom.storage.fast_lap_time` fica
      seedado com `180` e `fast_lap_time_value` exibe `"3.00.0"` imediatamente
- [x] Ao instanciar `Hud` com um recorde já salvo, o valor salvo é exibido (não sobrescrito por
      `180`)
- [x] `mise exec -- npm run typecheck` sem erros
- [x] Nenhum arquivo fora de `app/` foi alterado

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:** Adicionadas duas linhas ao final do construtor de `Hud.ts`: (1) `Dom.storage.fast_lap_time = Dom.storage.fast_lap_time || '180'` (seeda o recorde com 180 segundos se ainda não existir em `localStorage`), (2) `this.setIfChanged('fast_lap_time', this.fastLapTimeDom, this.formatTime(parseFloat(Dom.storage.fast_lap_time)))` (exibe o valor formatado imediatamente, seja o default `"3.00.0"` ou um recorde salvo anteriormente). Replica o comportamento do original (`v4.final.html` linhas 624-625) e segue o padrão já estabelecido por `MusicPlayer` (RACER-TASK-06), que também se auto-inicializa a partir de `Dom.storage` no próprio construtor. Typecheck passa.

**Problemas encontrados:** Nenhum. A correção foi direta: adicionar as duas linhas de inicialização no construtor.

**Arquivos criados/modificados:**
- `app/src/versions/v4-final/Hud.ts` (linhas 16-17 adicionadas no construtor)
