---
id: RACER-TASK-16
title: "Revisar duplicação residual entre RacerGameV1...V4 e remover any"
type: refatoração
category: frontend
phase: 6
depends_on: ["RACER-TASK-15"]
status: pendente
---

# RACER-TASK-16: Revisar duplicação residual e remover `any`

## Contexto

- **Plano completo:** `docs/projeto/00-visao-geral.md`, critérios de sucesso — "o código
  compartilhado (motor) não tem nenhuma ramificação tipo `if (version === 'v3')`".
- Com as 4 versões portadas (RACER-TASK-10, 11, 12, 15), este é o momento de olhar para trás e
  limpar qualquer duplicação que tenha sobrado por pressa durante o port incremental.

## Objetivo

1. Revisar `RacerGameV1`, `RacerGameV2`, `RacerGameV3`, `RacerGameV4` procurando trechos
   copiados/colados em vez de reaproveitados via herança — qualquer coisa assim é candidata a
   subir para `RacerGame` (ou um dos módulos de `core/`).
2. Eliminar todo `any` que não seja explicitamente justificado por um comentário.
3. Conferir `noUncheckedIndexedAccess` sem supressões desnecessárias (`!` non-null assertion
   usado com moderação, só onde a invariante é clara — ver
   `docs/projeto/04-riscos-decisoes-abertas.md`, "Riscos técnicos").

## Passos

1. Ler `RacerGameV1.ts` … `RacerGameV4.ts` lado a lado.
2. Para cada método sobrescrito que só chama `super.metodo()` e adiciona 1-2 linhas: confirmar
   que não dá para simplificar mais a assinatura do ponto de extensão em `RacerGame` para
   eliminar até essas 1-2 linhas (sem forçar — só quando genuinamente simples).
3. `grep -rn ": any" app/src/` e `grep -rn "as any" app/src/` — revisar cada ocorrência.
4. `grep -rn "!\." app/src/` (non-null assertions) — revisar cada ocorrência, substituindo por
   uma checagem real onde for barato fazer isso.
5. Rodar `npm run typecheck` e `npm run build` após os ajustes.
6. Revalidar rapidamente as 4 páginas (`v1.html`…`v4.html`) para confirmar que a refatoração
   não mudou comportamento.

## Critério de conclusão

- [ ] Nenhuma duplicação óbvia entre `RacerGameV1`…`V4` (cada uma só contém o que realmente
      diverge da anterior)
- [ ] Zero `any` sem comentário justificando
- [ ] Non-null assertions (`!`) revisadas, usadas só onde a invariante é clara
- [ ] `npm run typecheck` e `npm run build` sem erros
- [ ] As 4 versões continuam jogáveis e idênticas ao comportamento validado nas tarefas
      anteriores
- [ ] Nenhum arquivo fora de `app/` foi alterado

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:**
1. Tipado todos os parâmetros `any` em `RacerGame.ts` e `RacerGameV4.ts`:
   - `updateTraffic(_playerSegment: Segment)` em ambos
   - `onReset(_options: ResetOptions)` em RacerGameV4
   - `updateParallax(playerSegment: Segment)` em RacerGameV4
   - `renderExtraLayer(baseSegment: Segment, _playerSegment: Segment)` em RacerGameV4
   - Arrays de sprites/cars tipados com `Segment`, `SpriteSlot` e `Car`
2. Removido todos os `car as any` em RacerGameV4.ts usando type assertion para `Car`
3. Revisado non-null assertions (`!`): todos justificados (índices válidos no contexto)
4. Revisado duplicação entre RacerGameV1-V4: nenhuma duplicação óbvia encontrada, cada versão só sobrescreve o que realmente diverge da anterior (padrão Template Method)
5. Typecheck e build passaram sem erros

**Problemas encontrados:**
- Erro de `verbatimModuleSyntax` ao importar tipos junto com valores — corrigido usando `import type` para tipos

**Arquivos criados/modificados:**
- `app/src/core/RacerGame.ts` (tipado `updateTraffic` com `Segment`)
- `app/src/core/types.ts` (atualizado comentário de `cars` para esclarecer uso em v1-v3 vs v4)
- `app/src/versions/v4-final/RacerGameV4.ts` (tipado todos os parâmetros `any`, removido `car as any`, corrigido imports type-only)
