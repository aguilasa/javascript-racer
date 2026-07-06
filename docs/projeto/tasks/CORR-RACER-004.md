---
id: CORR-RACER-004
title: "Correção: app/src/main.ts órfão — não referenciado e fora da estrutura documentada"
type: implementação
category: ferramental
status: pendente
depends_on: []
---

# CORR-RACER-004: `app/src/main.ts` órfão — não referenciado e fora da estrutura documentada

## Problema identificado

Com a RACER-TASK-02 (páginas multi-page + `main.ts` por versão) e a RACER-TASK-03 (estrutura de
pastas `src/core/`, `src/versions/*`) concluídas, a árvore de `app/src/` deveria corresponder à
documentada em `docs/projeto/02-estrutura-vite.md` — que só lista `src/core/` e
`src/versions/v1-straight/`…`v4-final/`, sem nenhum arquivo solto diretamente em `src/`.

Estado atual:

```bash
$ find app/src -maxdepth 1 -type f
app/src/main.ts
app/src/style.css
```

`app/src/main.ts` é o stub deixado pela RACER-TASK-01 ("Entry point — será preenchido nas
próximas tarefas (RACER-TASK-02 em diante)"). As RACER-TASK-02/03, porém, criaram os entry
points reais em `src/versions/v1-straight/main.ts`…`v4-final/main.ts` (um por página), e
`app/index.html` não tem `<script>` nenhum (é só um menu estático). Ou seja, `app/src/main.ts`
não é referenciado por nenhuma página nem por `vite.config.ts`:

```bash
$ grep -rn "src/main" app --include="*.html" --include="*.ts" --include="*.json"
# (nenhum resultado)
```

É um arquivo morto, remanescente do scaffold original, que nunca foi removido quando os entry
points reais foram criados.

## Causa raiz

O comentário do próprio stub ("será preenchido nas próximas tarefas") presumia que
`app/src/main.ts` seria o entry point único, mas a decisão de arquitetura (multi-page, um
`main.ts` por versão em `src/versions/*/`) tornou esse arquivo desnecessário — e nenhuma das
tarefas que criaram os `main.ts` reais removeu o stub original.

## Correção

### Arquivo/alvo: `app/src/main.ts`

Remover o arquivo (não é usado por nenhuma página nem pelo `vite.config.ts`; os entry points
reais vivem em `app/src/versions/*/main.ts`).

## Verificação

- [x] `app/src/main.ts` não existe mais
- [x] `app/src/` contém apenas `core/`, `versions/` e `style.css` (nenhum arquivo solto de
      entry point)
- [x] `cd app && mise exec -- npm run typecheck && mise exec -- npm run build` continuam
      passando sem erro após a remoção

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-05

**Resumo do que foi feito:** Confirmado que `app/src/main.ts` existia e não era referenciado por
nenhuma página HTML nem por `vite.config.ts`. Arquivo removido. Typecheck e build continuaram
passando sem erros. `app/src/` agora contém apenas `core/`, `versions/` e `style.css`.

**Problemas encontrados:** Nenhum.

**Arquivos criados/modificados:**
- `app/src/main.ts` (removido)
