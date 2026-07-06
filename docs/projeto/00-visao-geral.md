# 00 — Visão Geral

## Objetivo

Portar o jogo (v1–v4) de JavaScript embutido em HTML para **TypeScript com classes**, organizado
em um **novo projeto Vite** dentro deste repositório, **sem alterar ou remover** os arquivos
originais.

Ao final da migração completa (todas as fases do [03](03-fases-execucao.md)), o repositório terá
duas implementações independentes e funcionais lado a lado:

- a original (`index.html`, `v1.straight.html` … `v4.final.html`, `common.js`) — inalterada;
- a nova, em TypeScript, dentro da pasta do projeto Vite (ver [02](02-estrutura-vite.md)).

## Por que isso é viável sem reescrever o jogo do zero

Como documentado em [`docs/06-arquitetura-common-js.md`](../06-arquitetura-common-js.md) e nos
capítulos de cada versão, o jogo já é, na prática, **um único motor com 4 configurações**:

- `common.js` (`Dom`, `Util`, `Game`, `Render` + constantes) é **idêntico** nas quatro versões.
- `v1 → v2 → v3 → v4` adicionam capacidades de forma **estritamente aditiva**: v2 soma `curve` e o
  acumulador de renderização; v3 soma `y`/altura; v4 soma tráfego, sprites de cenário, colisão e
  HUD. Nenhuma versão posterior *remove* algo da anterior.
- As únicas diferenças reais de comportamento entre versões estão em: (a) quais dados a função de
  construção de pista (`resetRoad`/`addRoad`/…) gera, e (b) quais efeitos extra `update()`/
  `render()` aplicam sobre esses dados.

Isso significa que a versão TypeScript pode ser **um único motor compartilhado** (classes/módulos)
parametrizado por "quais recursos estão ligados", em vez de quatro bases de código paralelas. O
[01 — Arquitetura Alvo](01-arquitetura-alvo.md) detalha como isso se traduz em classes.

## Objetivos concretos

1. Todo o código hoje em `common.js` vira módulos/classes TypeScript tipados, reaproveitados por
   todas as 4 versões (sem duplicação).
2. Cada versão (v1–v4) continua existindo como uma **página independente e jogável** dentro do
   projeto Vite (mesma divisão em 4 demos do projeto original), mas montada a partir do motor
   compartilhado + a configuração específica daquela versão.
3. Paridade de comportamento: a versão TypeScript deve jogar **identicamente** à original
   (mesma física, mesma sensação, mesmos controles, mesma tweak UI) — este é um port de
   *estrutura/tipagem*, não uma redesign de gameplay.
4. Uso idiomático de TypeScript: tipos para `Segment`, `Point3D`, `Sprite`, `Car`, etc., evitando
   `any`; classes onde há estado e comportamento (ex.: `Road`, `TrafficManager`, `GameLoop`,
   `InputController`); tipos/funções puras onde fizer mais sentido (ex.: o equivalente a `Util`).

## Não-objetivos (explicitamente fora de escopo)

- **Não** remover, mover ou modificar `v1.straight.html`, `v2.curves.html`, `v3.hills.html`,
  `v4.final.html`, `common.js`, `stats.js`, `common.css`, `index.html`, `Rakefile`, `images/`,
  `music/`. Tudo isso permanece como está, funcionando como hoje.
- **Não** é objetivo desta fase adicionar gameplay novo (nenhuma das ideias de expansão listadas em
  [`docs/05-v4-final.md#511`](../05-v4-final.md#511-ideias-de-expansão-listadas-pelo-próprio-autor)
  entra em escopo aqui).
- **Não** é objetivo migrar para um framework de UI (React/Vue/etc.) — o projeto Vite usa o
  template `vanilla-ts`, mantendo o mesmo estilo "Canvas 2D direto" do original.
- **Não** é objetivo (por enquanto) configurar CI/CD, deploy, ou testes automatizados abrangentes —
  pode ser proposto depois, mas não bloqueia a migração (ver [04](04-riscos-decisoes-abertas.md)).

## Critérios de sucesso (como saberemos que terminou)

- [ ] `npm run dev` no novo projeto sobe um servidor com 4 páginas navegáveis (uma por versão),
      cada uma jogável com teclado, refletindo o comportamento da respectiva versão original.
- [ ] `npm run build` gera um bundle estático sem erros de TypeScript (`strict: true`, zero `any`
      não-justificado).
- [ ] Nenhum arquivo do projeto original foi alterado (`git diff` fora da nova pasta do projeto
      Vite fica vazio, exceto talvez o `README.md` raiz linkando a nova versão — ver
      [04](04-riscos-decisoes-abertas.md)).
- [ ] O código compartilhado (motor) não tem nenhuma ramificação tipo `if (version === 'v3')`
      espalhada pelo motor — a diferença entre versões vive na *configuração/composição*, não em
      condicionais internas ao motor (ver [01](01-arquitetura-alvo.md)).

## Como este plano será usado a partir daqui

Cada seção do [03 — Fases de Execução](03-fases-execucao.md) é desenhada para virar uma tarefa
autocontida (uma conversa/PR por fase, aproximadamente). A ordem das fases importa: cada uma só
começa depois que a anterior estiver validada e jogável.
