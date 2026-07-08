---
id: CORR-RACER-014
title: "Correção: painel de FPS (stats.js) fica fixo sobre os links de navegação em vez de fluir dentro da tabela de controles"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-RACER-014: painel de FPS (stats.js) fica fixo sobre os links de navegação em vez de fluir dentro da tabela de controles

## Problema identificado

- **Arquivo com o problema:** `app/src/core/StatsPanel.ts`
- **Estado atual:** No original, `stats.js` é o arquivo **vendorizado** na raiz do repositório
  (`stats.js:14`), cujo painel é criado com
  `container.style.cssText = 'width:80px;opacity:0.9;cursor:pointer'` — sem `position`, então o
  elemento flui normalmente dentro do `<td id="fps">` da tabela `#controls` onde é anexado
  (`Game.stats('fps')` → `Dom.get('fps').appendChild(result.domElement)`), aparecendo na linha
  logo abaixo dos links `straight | curves | hills | final`.
  `StatsPanel.ts` (RACER-TASK-06) usa em vez disso o pacote **npm** `stats.js`
  (`app/node_modules/stats.js/src/Stats.js:10`), uma versão mais nova da biblioteca cujo painel é
  criado com `container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000'`.
  Como `StatsPanel` também anexa esse elemento dentro de `Dom.get('fps')`
  (`app/src/core/StatsPanel.ts:12`), o `position: fixed` inline ignora completamente a célula da
  tabela e ancora o painel no canto superior-esquerdo **da viewport inteira** — sobrepondo
  visualmente a linha dos links de navegação, que também fica perto desse canto (`#controls` tem
  `float: left`). Confirmado visualmente pelo usuário comparando `v1.html` (TS) com
  `v1.straight.html` (original) lado a lado.
- **Por que está errado:** o objetivo do port (`docs/projeto/00-visao-geral.md`, "Paridade de
  comportamento") é que a versão TypeScript jogue e se pareça **identicamente** à original — isso
  inclui o layout do HUD/controles, não só a física do jogo. A troca do arquivo vendorizado pelo
  pacote npm (decisão registrada e aceita nas Decisões de Design de `progresso.md`, "`stats.js`:
  Pacote npm, não arquivo vendorizado") trouxe, como efeito colateral não previsto, uma mudança de
  posicionamento inline que nenhuma tarefa detectou até agora (só é visível rodando `npm run dev`
  e olhando a página, não pega em `typecheck`/`build`).

## Causa raiz

A versão do `stats.js` publicada no npm (usada por `StatsPanel`) define o painel com `position: fixed` inline por padrão (pensada para uso como overlay solto no `<body>`), enquanto o arquivo vendorizado usado pelo jogo original não define `position` — e `StatsPanel.ts` nunca neutraliza esse estilo antes de anexar o elemento dentro da célula da tabela `#fps`.

## Correção

### Arquivo/alvo: `app/src/core/StatsPanel.ts`

Logo após `new Stats()`, sobrescrever o `cssText` do `dom` do painel para remover o
posicionamento fixo, replicando o estilo do original, antes de anexá-lo ao DOM:

```ts
constructor(parentId: string, id?: string) {
  this.stats = new Stats()
  this.stats.dom.id = id ?? 'stats'
  this.stats.dom.style.cssText = 'width:80px;opacity:0.9;cursor:pointer'
  Dom.get(parentId).appendChild(this.stats.dom)
  // ...resto inalterado
}
```

## Verificação

- [ ] `mise exec -- npm run dev`, abrir `v1.html`: o painel de FPS aparece **dentro** da tabela de
      controles, na linha abaixo dos links `straight | curves | hills | final`, sem sobrepor nada
- [ ] Comparação visual com `v1.straight.html` original: painel de FPS na mesma posição relativa
- [x] `mise exec -- npm run typecheck` e `mise exec -- npm run build` sem erros

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:** Adicionada a linha
`this.stats.dom.style.cssText = 'width:80px;opacity:0.9;cursor:pointer'` em
`StatsPanel.ts`, logo após `new Stats()` e antes do `appendChild`, neutralizando o
`position:fixed;top:0;left:0;z-index:10000` que o pacote npm `stats.js` define por padrão no
elemento raiz do painel. Isso faz o painel de FPS voltar a fluir dentro do `<td id="fps">` da
tabela de controles, igual ao comportamento do `stats.js` vendorizado usado pelo original.
Typecheck e build passam. Checagem visual no navegador (comparação lado a lado com
`v1.straight.html`) ainda requer execução manual do usuário.

**Problemas encontrados:** Nenhum.

**Arquivos criados/modificados:**
- `app/src/core/StatsPanel.ts` (sobrescrita do `cssText` do painel de stats)
