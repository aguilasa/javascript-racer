# 04 — Riscos e Decisões

## Tweak UI fora do escopo inicial

`core/TweakUI.ts` (painel de `<select>`/`<input>` HTML para resolução, faixas, largura da pista,
altura de câmera, distância de desenho, campo de visão, densidade de neblina — ver
[`docs/05-v4-final.md §5.8`](../05-v4-final.md#58-tweak-ui-faixas-lanes-e-reinicialização-condicional-da-pista))
não tem um equivalente direto no modelo de cenas do Phaser sem trabalho extra: é um overlay HTML
que hoje vive fora do `<canvas>` e chama `reset(options)` diretamente. Portá-lo exigiria decidir
entre um overlay HTML por fora do canvas do Phaser (viável, mas mistura dois mundos de UI) ou uma
cena/plugin de debug dentro do próprio Phaser (`Phaser.GameObjects.DOMElement` ou uma UI desenhada
com `Text`/`Graphics`).

**Decisão**: deixar de fora da primeira leva de migração — é uma ferramenta de ajuste fino para
desenvolvimento, não uma feature de gameplay, e não bloqueia nenhum critério de sucesso de
[00-visao-geral.md](00-visao-geral.md). Pode ser retomada depois que a paridade funcional estiver
estabelecida. Ideias de expansão em geral (não específicas de UI de debug) já estão listadas em
[`docs/projeto/05-ideias-expansao.md`](../projeto/05-ideias-expansao.md) — não duplicadas aqui.

## Performance do pool de sprites/carros

200 carros de tráfego (`TrafficManager`) + centenas de sprites de cenário (`scenery.ts`) exigem
**pooling** de `Phaser.GameObjects.Image` — criar cada objeto uma única vez (no `create()` da
`Game` scene ou lazily conforme necessário) e apenas reposicionar/mostrar/ocultar (`setPosition`,
`setVisible`, `setTexture`) a cada frame, nunca recriar/destruir game objects em `update()`. Isso é
uma diferença importante em relação ao canvas 2D atual, onde `ctx.drawImage()` não tem custo de
alocação de objeto — no Phaser, criar/destruir `Image` repetidamente por frame seria uma regressão
de performance real, não só um detalhe de estilo.

**Ação recomendada**: implementar o pool desde a Fase 5/6 (não como otimização tardia), com um
tamanho de pool generoso o bastante para o pior caso (200 carros + sprites de cenário visíveis
simultaneamente dentro de `drawDistance`).

## Custo de `Graphics` redesenhado por frame

`RoadRenderer` limpa e reconstrói a geometria vetorial da pista (trapézios) a cada frame, para até
`drawDistance` (~300) segmentos — um custo de CPU/GPU proporcional ao do desenho atual em canvas 2D
(que também redesenha tudo a cada frame). Não deve ser uma regressão, mas **vale medir cedo**
(logo na Fase 2, antes de adicionar tráfego/cenário) para confirmar a hipótese antes de prosseguir
com o resto do plano.

## Passo fixo dentro de `Scene.update`

Phaser entrega `delta` (ms) a cada chamada de `update(time, delta)`, mas não impõe um passo fixo de
simulação. É essencial preservar o padrão de acumulador (`gdt`) que `GameLoop`/`Game.run` já usam
hoje (ver [`docs/06-arquitetura-common-js.md §6.4`](../06-arquitetura-common-js.md#gamerun)) —
inclusive o `Math.min(1, dt)` que protege contra deltas enormes quando a aba fica em segundo plano.
Usar `delta` diretamente na física (sem acumulador) reintroduziria exatamente a classe de bug que o
código original já resolveu.

## Sem alterações em `app/`

`app/` (as quatro versões TypeScript, incluindo a `RacerGameV4` usada como referência de
comportamento) e `racer-phaser/` (o novo projeto Phaser) coexistem como implementações irmãs, sem
dependência de import um do outro — a cópia de lógica entre eles é manual/verbatim (copiar
arquivo), não uma dependência de pacote compartilhado. Se no futuro fizer sentido extrair a
matemática pura (`util`, `types`, `Road`, `Car`, `TrafficManager`, `scenery`) para um pacote
compartilhado entre os dois projetos, isso é uma decisão separada, fora do escopo deste plano.

## Licenciamento dos assets

`sprites.png`/`background.png`/as faixas de música em `app/public/` já são usadas sem restrição
adicional pelo port TypeScript existente; copiá-las para `racer-phaser/public/assets/racer/`
não muda a situação de licenciamento (mesmos arquivos, novo destino dentro do mesmo repositório).
