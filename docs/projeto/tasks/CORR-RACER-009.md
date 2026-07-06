---
id: CORR-RACER-009
title: "Correção: TweakUI nunca é instanciada/conectada — controles da UI não fazem nada"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-RACER-009: `TweakUI` nunca é instanciada/conectada a `RacerGame`

## Problema identificado

A RACER-TASK-09 criou `app/src/core/TweakUI.ts` com toda a lógica de `bind()` (listeners de
`change` para `resolution`/`lanes`/`roadWidth`/`cameraHeight`/`drawDistance`/`fieldOfView`/
`fogDensity`) e `refresh()` (sincroniza os controles DOM com a configuração atual) — mas **em
nenhum lugar do código `TweakUI` é importado, instanciado ou usado**:

```bash
$ grep -rn "TweakUI" app/src/
app/src/core/TweakUI.ts:5:export class TweakUI {
```

A única ocorrência do símbolo `TweakUI` no projeto é a própria declaração da classe. Isso
significa, concretamente:

1. **`TweakUI.bind()` nunca é chamado.** No original (`v1.straight.html` e todas as versões),
   `Dom.on('resolution'/'lanes'/'roadWidth'/'cameraHeight'/'drawDistance'/'fieldOfView'/
   'fogDensity', 'change', ...)` são registrados uma vez, na inicialização do script. Em
   `RacerGame.start()` (`app/src/core/RacerGame.ts`), nenhuma instância de `TweakUI` é criada,
   então **nenhum listener é registrado** — mover qualquer slider ou trocar qualquer `<select>`
   da tweak UI não faz absolutamente nada.
2. **`TweakUI.refresh()` nunca é chamado a partir de `reset()`.** No original,
   `reset(options)` termina sempre chamando `refreshTweakUI()` — inclusive na primeira chamada,
   na inicialização — para que os controles (`lanes`, os `<input type=range>` e os `<span>` de
   valor atual) reflitam a configuração de fato em uso. `RacerGame.reset()` (linha ~196-224 do
   arquivo atual) termina em `this.onReset(options)` + `buildRoad()` condicional — não há
   nenhuma chamada equivalente a `refresh()`. Os controles da tweak UI ficariam com os valores
   padrão de HTML (ou em branco), nunca refletindo `roadWidth`/`cameraHeight`/etc. reais.

O critério de conclusão da tarefa lista "`core/TweakUI.ts` com todos os controles da tweak UI
original" como atendido — a classe em si está correta e completa (comparada com
`docs/02-v1-estrada-reta.md#26`), mas fica **inteiramente órfã**: uma funcionalidade central e
visível desde a v1 (todo o painel de controles à esquerda do jogo) simplesmente não funciona na
versão portada.

## Causa raiz

`RacerGame.start()` e `RacerGame.reset()` foram implementados sem instanciar/chamar `TweakUI` —
provavelmente um passo de integração esquecido depois de a classe `TweakUI` ter sido escrita de
forma isolada.

## Correção

### Arquivo/alvo: `app/src/core/RacerGame.ts`

1. Adicionar um campo `protected tweakUI!: TweakUI` (ou similar) e importar `TweakUI` de
   `./TweakUI`.
2. Em `start()`, após montar o `InputController` (ou em qualquer ponto antes do primeiro
   `reset()` render real), instanciar `new TweakUI((options) => this.reset(options))` e chamar
   `.bind()` uma única vez.
3. Em `reset(options)`, antes ou depois de `onReset`/`buildRoad`, chamar
   `this.tweakUI.refresh({ lanes: this.lanes, roadWidth: this.roadWidth, cameraHeight:
   this.cameraHeight, drawDistance: this.drawDistance, fieldOfView: this.fieldOfView,
   fogDensity: this.fogDensity })` — reproduzindo a chamada incondicional a `refreshTweakUI()`
   do original.

Atenção à ordem: `bind()` precisa acontecer antes do primeiro `reset()` disparado por um evento
de UI, mas depois de `reset()` já ter sido chamado ao menos uma vez não é estritamente exigido
(o binding só precisa existir antes do primeiro `change` do usuário) — o mais simples e fiel ao
original é montar o `TweakUI` em `start()`, uma única vez, antes ou logo após o primeiro
`reset()`.

## Verificação

- [ ] `grep -rn "new TweakUI" app/src/` retorna pelo menos uma ocorrência dentro de
      `RacerGame.start()`
- [ ] `RacerGame.reset()` chama `this.tweakUI.refresh(...)` de forma incondicional (mesma
      posição/frequência do `refreshTweakUI()` original)
- [ ] Manualmente (ou via `mise exec -- npm run dev`), mover o slider `roadWidth`/`cameraHeight`/
      etc. de fato altera o comportamento do jogo (reconstrução da pista/render), e o `<span>`
      de valor atual reflete o número correto
- [ ] `cd app && mise exec -- npm run typecheck && mise exec -- npm run build` continuam
      passando sem erro

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
