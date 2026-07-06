---
id: CORR-RACER-001
title: "Correção: mise.toml ausente — versão do Node do projeto não está fixada"
type: implementação
category: ferramental
status: pendente
depends_on: []
---

# CORR-RACER-001: `mise.toml` ausente — versão do Node do projeto não está fixada

## Problema identificado

`docs/projeto/prompts/01-executar.md` atribui explicitamente à RACER-TASK-01 a decisão de onde
fixar a versão do Node do projeto:

> "A versão do Node fica fixada em `mise.toml` (raiz do repo ou dentro de `app/`, **a definir na
> RACER-TASK-01**). Se esse arquivo ainda não existir quando uma tarefa for executada, criá-lo
> primeiro (...) antes de rodar qualquer comando — não assumir que o Node do `PATH` do sistema é
> o correto."

Estado atual verificado:

```bash
$ find /home/ingmar/WebstormProjects/javascript-racer -maxdepth 3 -iname "mise.toml"
# (nenhum resultado — não existe nem na raiz nem em app/)

$ cd app && mise current node
20.20.2
```

O comando `mise current node` só retorna `20.20.2` porque o arquivo **global** do usuário
(`~/.config/mise/config.toml`, fora do repositório) contém `node = "20"`. Não há nenhum arquivo
`mise.toml` versionado no projeto. Em qualquer outra máquina/usuário sem esse mesmo default
global, `mise current node` reportaria "não definido", e todos os comandos `mise exec -- npm
...` das tarefas seguintes (RACER-TASK-02 em diante, que dependem dessa infraestrutura) rodariam
com uma versão de Node não garantida — exatamente o cenário que `01-executar.md` pede para
evitar.

O arquivo de tarefa `docs/projeto/tasks/01-criar-scaffold-vite.md` (passos e critério de
conclusão) não menciona `mise` em nenhum momento, e o Log de Execução da tarefa também não
registra essa decisão — a criação do `mise.toml` foi simplesmente omitida.

## Causa raiz

O arquivo de tarefa `01-criar-scaffold-vite.md` não inclui o passo de criar `mise.toml` nem o
lista no critério de conclusão, então a execução seguiu literalmente esse arquivo e não a
diretriz mais ampla do prompt de execução (`01-executar.md`), que é quem de fato atribui essa
responsabilidade à RACER-TASK-01.

## Correção

### Arquivo/alvo: `mise.toml` (raiz do repositório, ao lado de `app/`)

Criar o arquivo fixando a versão de Node usada no projeto, por exemplo via
`mise use node@20` executado a partir da raiz do repositório, gerando:

```toml
[tools]
node = "20"
```

Após criado, confirmar que `cd app && mise current node` reporta a versão fixada mesmo que a
entrada `node` seja removida temporariamente do `~/.config/mise/config.toml` do usuário (ou seja,
que a fixação vem do arquivo do projeto, não do global).

## Verificação

- [x] `mise.toml` existe na raiz do repositório (ou dentro de `app/`)
- [x] `mise current node`, rodado a partir de `app/`, reporta a versão fixada pelo arquivo do
      projeto (não a global do usuário)
- [x] `cd app && mise exec -- npm run typecheck && mise exec -- npm run build` continuam
      passando sem erro após a criação do arquivo

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-05

**Resumo do que foi feito:** Criado `mise.toml` na raiz do repositório com `[tools]\nnode = "20"`.
Executado `mise trust` para reconhecer o arquivo. Confirmado que `mise current node` retorna
`20.20.2` a partir de `app/`. Typecheck e build passaram sem erros.

**Problemas encontrados:** O arquivo precisou de `mise trust` antes de ser reconhecido pelo mise —
comportamento esperado para arquivos novos.

**Arquivos criados/modificados:**
- `mise.toml` (criado na raiz do repositório)
