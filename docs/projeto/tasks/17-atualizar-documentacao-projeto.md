---
id: RACER-TASK-17
title: "Atualizar CLAUDE.md e docs apontando para app/"
type: documentação
category: documentação
phase: 6
depends_on: ["RACER-TASK-16"]
status: pendente
---

# RACER-TASK-17: Atualizar `CLAUDE.md`/`docs/` apontando para `app/`

## Contexto

- Com a migração completa e validada (RACER-TASK-01 a 16), o `CLAUDE.md` do repositório
  (criado antes desta migração) e `docs/06-arquitetura-common-js.md` ainda descrevem só a
  versão JavaScript original — precisam passar a mencionar a versão TypeScript também.
- Esta tarefa **não** inclui o link no `index.html`/`README.md` da raiz — isso é a
  RACER-TASK-18 (opcional, 👤), separada porque mexe em arquivos historicamente "congelados".

## Objetivo

1. Atualizar `CLAUDE.md` (raiz do repo) com uma seção descrevendo o projeto `app/`: como
   rodar (`cd app && npm install && npm run dev`), onde fica cada versão, e a existência da
   documentação em `docs/projeto/`.
2. Adicionar uma nota no topo de `docs/06-arquitetura-common-js.md` (ou em
   `docs/README.md`) apontando para `docs/projeto/01-arquitetura-alvo.md` como a versão
   TypeScript equivalente.

## Passos

1. Ler `CLAUDE.md` atual (raiz do repo) para entender a estrutura/tom já estabelecidos.
2. Adicionar uma seção nova (ex.: "Versão TypeScript (`app/`)") descrevendo:
   - comandos (`dev`, `build`, `preview`, `typecheck`)
   - que é um port fiel, mantendo a versão JS original intocada como referência
   - onde está a documentação da arquitetura (`docs/projeto/`)
3. Adicionar uma nota curta em `docs/README.md` (índice de `docs/`) linkando para
   `docs/projeto/README.md`.
4. Não duplicar conteúdo já existente em `docs/projeto/` — só referenciar.

## Critério de conclusão

- [ ] `CLAUDE.md` com uma seção sobre o projeto `app/`
- [ ] `docs/README.md` linkando para `docs/projeto/README.md`
- [ ] Nenhum conteúdo duplicado entre `CLAUDE.md` e `docs/projeto/`
- [ ] Nenhuma alteração em `index.html`/`README.md` da raiz nesta tarefa (isso é a
      RACER-TASK-18)

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
