---
id: CORR-PHASER-022
title: "Correção: PHASER-TASK-21 exige `npm run typecheck`, script que não existe em racer-phaser/package.json"
type: implementação
category: ferramental
status: pendente
depends_on: []
---

# CORR-PHASER-022: script `typecheck` referenciado pela PHASER-TASK-21 não existe

## Problema identificado

O Critério de conclusão da PHASER-TASK-21 (`docs/migracao-phaser/tasks/
21-tweak-ui-controles-basicos.md`) exige:

```markdown
- [ ] `mise exec -- npm run typecheck` e `npm run build` sem erros
```

Mas `racer-phaser/package.json` não tem (e nunca teve) um script `typecheck`:

```bash
grep -n '"scripts"' -A 6 racer-phaser/package.json
```
```
"scripts": {
    "dev": "node log.js dev & vite --config vite/config.dev.mjs",
    "build": "node log.js build & vite build --config vite/config.prod.mjs",
    "dev-nolog": "vite --config vite/config.dev.mjs",
    "build-nolog": "vite build --config vite/config.prod.mjs"
},
```

O Log de Execução da PHASER-TASK-21 documenta ter rodado `npx tsc --noEmit` diretamente (não
`npm run typecheck`) — funcionalmente equivalente, mas não é o comando que o critério da própria
tarefa pede, e `npm run typecheck` teria falhado com "Missing script" se alguém tivesse tentado
rodá-lo ao pé da letra.

Este não é um problema novo: `CORR-PHASER-003` (revisão da PHASER-TASK-06) já observou que
`npm run build` usa esbuild e não faz checagem de tipos, e sugeriu "considerar adicionar um script
`typecheck` a `racer-phaser/package.json`" — sugestão nunca aplicada. `CORR-PHASER-018` e
`CORR-PHASER-019` (revisões das PHASER-TASK-14/16) tiveram que lembrar disso de novo, cada uma
descrevendo `npm run build` como não pegando o erro "pela mesma lacuna". A PHASER-TASK-21 é o
primeiro arquivo de tarefa a efetivamente **exigir** `npm run typecheck` no seu Critério de
conclusão, expondo que o script prometido/sugerido três vezes segue inexistente.

## Causa raiz

A sugestão de `CORR-PHASER-003` (2026, durante a Fase 2) nunca foi convertida numa correção
própria com um item de verificação — ficou só como "considerar" dentro do texto de outra
correção, sem checklist/CORR dedicados, então não foi rastreada até virar trabalho pendente
esquecido.

## Correção

### Arquivo/alvo: `racer-phaser/package.json`

Adicionar um script `typecheck` que rode `tsc --noEmit` (mesmo comando já usado manualmente em
todas as verificações desde `CORR-PHASER-003`):

```json
"scripts": {
    "dev": "node log.js dev & vite --config vite/config.dev.mjs",
    "build": "node log.js build & vite build --config vite/config.prod.mjs",
    "dev-nolog": "vite --config vite/config.dev.mjs",
    "build-nolog": "vite build --config vite/config.prod.mjs",
    "typecheck": "tsc --noEmit"
},
```

## Verificação

- [x] `racer-phaser/package.json` tem um script `typecheck`
- [x] `mise exec -- npm run typecheck` roda `tsc --noEmit` e retorna 0 erros no estado atual do
      código
- [x] `docs/migracao-phaser/tasks/21-tweak-ui-controles-basicos.md` — item 7 do Critério de
      conclusão pode agora ser verificado literalmente com o comando que o próprio texto pede

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-09

**Resumo do que foi feito:** Adicionado `"typecheck": "tsc --noEmit"` aos scripts de
`racer-phaser/package.json` — ver commit `8a904e7`. Reconfirmado nesta sessão que
`mise exec -- npm run typecheck` roda sem erros no estado atual do código.

**Problemas encontrados:** Nenhum.

**Arquivos criados/modificados:**
- Modificado: `racer-phaser/package.json` (script `typecheck` adicionado)
- Modificado: `docs/migracao-phaser/tasks/correcoes-progresso.md` (status CORR-PHASER-022
  marcado como `[x]` concluído)
