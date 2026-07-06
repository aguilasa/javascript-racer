---
id: RACER-TASK-05
title: "Portar Dom e Util"
type: implementação
category: frontend
phase: 1
depends_on: ["RACER-TASK-04"]
status: pendente
---

# RACER-TASK-05: Portar `Dom` e `Util`

## Contexto

- **Fonte original:** `common.js`, blocos `Dom` e `Util` — ver
  `docs/06-arquitetura-common-js.md#61-dom--auxiliares-mínimos-de-dom` e
  `#62-util--matemática-e-helpers-gerais`.
- Estas são coleções de funções puras/utilitárias — por isso viram **módulos de funções
  exportadas**, não classes (ver `docs/projeto/01-arquitetura-alvo.md`, "Princípio geral").

## Objetivo

Criar `app/src/core/dom.ts` e `app/src/core/util.ts`, portando toda a API de `Dom.*` e
`Util.*`.

## Requisitos da implementação

### `dom.ts`

Portar: `get`, `set`, `on`, `un`, `show`, `blur`, `addClassName`, `removeClassName`,
`toggleClassName`, `storage` — como funções exportadas (não um objeto `Dom` namespace, para
ficar idiomático em TS: `export function get(...)`, etc., ou um `export const Dom = { get,
set, ... }` se a preferência for manter a sintaxe de chamada `Dom.get(...)` idêntica ao
original — **escolher esta segunda opção** para minimizar diffs conceituais entre o código
original e o portado, facilitando comparação linha a linha nas próximas fases).

Tipar `get` para aceitar `string | HTMLElement` e retornar `HTMLElement` (lançar erro em vez
de retornar `null`/`undefined` quando o elemento não existe — mais seguro em TypeScript que o
comportamento original, que deixava `null` passar adiante).

### `util.ts`

Portar todas as funções: `timestamp`, `toInt`, `toFloat`, `limit`, `randomInt`,
`randomChoice`, `percentRemaining`, `accelerate`, `interpolate`, `easeIn`, `easeOut`,
`easeInOut`, `exponentialFog`, `increase`, `project`, `overlap`.

- `project` deve usar os tipos `SegmentPoint`/`WorldPoint`/`CameraPoint`/`ScreenPoint` de
  `core/types.ts` (RACER-TASK-04) na assinatura.
- `randomChoice<T>(options: T[]): T` deve ser genérico (o original não tem tipos; a versão TS
  ganha essa segurança extra).
- Preservar exatamente as fórmulas matemáticas — nenhuma mudança de comportamento é permitida
  aqui (comparar com `docs/06-arquitetura-common-js.md#62-util--matemática-e-helpers-gerais`
  função por função).

## Passos

1. Ler `common.js`, blocos `Dom` e `Util`, e a explicação em
   `docs/06-arquitetura-common-js.md` §6.1–6.2.
2. Implementar `core/dom.ts` e `core/util.ts` com os tipos de `core/types.ts`.
3. `npm run typecheck` sem erros.
4. (Opcional, mas recomendado) Se a decisão do backlog (`docs/projeto/04-riscos-decisoes-abertas.md`,
   item 4) for antecipar testes: adicionar casos simples para `interpolate`, `easeIn`,
   `easeInOut`, `project`, `overlap` comparando com valores calculados manualmente a partir da
   documentação em `docs/01-teoria-pseudo-3d.md`. **Não obrigatório para concluir esta
   tarefa.**

## Critério de conclusão

- [ ] `core/dom.ts` com toda a API de `Dom` portada e tipada
- [ ] `core/util.ts` com toda a API de `Util` portada e tipada
- [ ] `project` usa os tipos de `core/types.ts`
- [ ] Nenhuma fórmula/constante numérica alterada em relação ao original
- [ ] `npm run typecheck` sem erros
- [ ] Nenhum arquivo fora de `app/` foi alterado

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
