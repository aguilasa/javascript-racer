---
id: RACER-TASK-18
title: "(Opcional) Vincular a versão TS a partir do index.html/README.md da raiz"
type: documentação
category: documentação
phase: 6
depends_on: ["RACER-TASK-17"]
status: pendente
requires_human: true
---

# RACER-TASK-18: (Opcional) Vincular a versão TS a partir do `index.html`/`README.md` da raiz

## ⚠️ Requer interação humana

O pedido original que originou esta migração foi explícito: **não remover nem modificar**
nenhum dos arquivos originais (`index.html`, `v1.straight.html` … `v4.final.html`,
`common.js`, etc.). Um link novo no `index.html`/`README.md` raiz seria uma **adição**, não
uma remoção — mas ainda assim é uma mudança num arquivo que até aqui permaneceu intocado por
toda a migração.

**Se um agente/prompt chegar nesta tarefa:** não editar `index.html`/`README.md` da raiz sem
confirmação humana explícita sobre:
1. Se o link deve ser adicionado ou não.
2. Em qual arquivo (`index.html`, `README.md`, ou ambos).
3. Qual o texto/rótulo do link.

Reportar que esta tarefa está aguardando decisão e seguir para a próxima tarefa pendente que
não dependa dela (normalmente a RACER-TASK-19, que não depende desta).

## Contexto

Ver `docs/projeto/04-riscos-decisoes-abertas.md`, item 5.

## Objetivo (se aprovado)

Adicionar um link discreto para a versão TypeScript (`app/`) a partir do `index.html` e/ou
`README.md` da raiz do repositório, sem alterar mais nada nesses arquivos.

## Passos (só depois de aprovação explícita)

1. Confirmar com o humano responsável: arquivo(s) alvo e texto do link.
2. Editar **só** o trecho necessário para adicionar o link — nenhuma outra mudança de
   conteúdo, formatação ou estrutura desses arquivos.
3. Conferir que `index.html`/`README.md` continuam funcionando exatamente como antes, com o
   link a mais.

## Critério de conclusão

- [ ] Aprovação humana explícita obtida e registrada no Log de Execução (o quê foi aprovado,
      por quem)
- [ ] Link adicionado exatamente onde/como aprovado, sem nenhuma outra alteração
- [ ] Nenhum outro conteúdo de `index.html`/`README.md` foi tocado

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
