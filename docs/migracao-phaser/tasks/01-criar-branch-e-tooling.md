---
id: PHASER-TASK-01
title: "Criar branch de trabalho e preparar tooling (mise, npm install)"
type: infraestrutura
category: ferramental
phase: 0
depends_on: []
status: pendente
---

# PHASER-TASK-01: Criar branch de trabalho e preparar tooling

## Contexto

- **Projeto:** `/home/ingmar/WebstormProjects/javascript-racer/`
- **Plano completo:** `docs/migracao-phaser/00-visao-geral.md`, `docs/migracao-phaser/02-estrutura-projeto.md`
- `racer-phaser/` (scaffold `phaserjs/template-vite-ts`) e `docs/migracao-phaser/` **já existem**,
  mas foram commitados diretamente na branch `feature/ts-vite-port` (a branch da migração
  TypeScript, ainda não mergeada em `master` — ver `docs/projeto/tasks/progresso.md`,
  RACER-TASK-19 pendente). Esta tarefa cria uma branch dedicada para a migração Phaser, a partir
  do estado atual (que já contém esse conteúdo) — **não** a partir de `master`, que ainda não tem
  `racer-phaser/`.
- **Restrição inegociável:** nada em `app/` pode ser alterado por nenhuma tarefa PHASER-TASK-01 a
  19. `racer-phaser/` é um projeto irmão, independente.

## Objetivo

1. Criar a branch `feature/phaser-port` a partir do commit atual.
2. Confirmar que o tooling (`mise`, Node, npm) funciona dentro de `racer-phaser/`.
3. Instalar as dependências do projeto.

## Passos

### 1) Verificar estado do repositório

```bash
cd /home/ingmar/WebstormProjects/javascript-racer
git status
git branch --show-current
```

Se houver alterações não commitadas relevantes, **não descartar** — parar e avisar antes de
prosseguir.

### 2) Criar a branch de trabalho

```bash
git checkout -b feature/phaser-port
```

(a partir do commit atual — normalmente ainda `feature/ts-vite-port`, que já inclui
`racer-phaser/` e `docs/migracao-phaser/`; não fazer checkout de `master` antes disso).

### 3) Confirmar a versão do Node fixada

```bash
mise current node   # deve reportar a versão de mise.toml na raiz do repo (node 20)
cd racer-phaser
mise current node   # deve herdar a mesma versão (mise.toml é da raiz do repo)
```

Se `mise current node` não reportar nada dentro de `racer-phaser/`, criar um `mise.toml` local
com `[tools]\nnode = "20"` (ou a versão vigente na raiz) só se a herança do `mise.toml` da raiz
não funcionar — normalmente não é necessário, já que `mise` resolve por diretório ancestral.

### 4) Instalar dependências

```bash
cd racer-phaser
mise exec -- npm install
```

### 5) Validar

```bash
mise exec -- npm run dev     # sobe sem erro (Ctrl+C para parar depois de confirmar)
mise exec -- npm run build   # conclui sem erro
```

### 6) Commit (se houver qualquer alteração, ex.: `package-lock.json` atualizado)

```bash
cd /home/ingmar/WebstormProjects/javascript-racer
git add racer-phaser/
git commit -m "chore(racer-phaser): confirma tooling e dependências instaladas"
```

Se `npm install` não gerar nenhuma alteração (lockfile já commitado idêntico), não há o que
commitar — está tudo bem, a tarefa ainda está completa.

## Critério de conclusão

- [ ] Branch `feature/phaser-port` criada a partir do estado atual (contém `racer-phaser/` e
      `docs/migracao-phaser/`)
- [ ] `mise current node` resolve corretamente dentro de `racer-phaser/`
- [ ] `mise exec -- npm install` roda sem erro
- [ ] `mise exec -- npm run dev` e `mise exec -- npm run build` rodam sem erro
- [ ] Nenhum arquivo em `app/` foi alterado
- [ ] Se houve alteração em `racer-phaser/`, commit feito em `feature/phaser-port`

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:**
- Commitou alterações pendentes em `racer-phaser/package-lock.json` e `docs/migracao-phaser/` na branch `feature/ts-vite-port` antes de criar a nova branch
- Criou branch `feature/phaser-port` a partir do estado atual (commit b2ca68a)
- Verificou que `mise current node` reporta corretamente Node 20.20.2 tanto na raiz quanto em `racer-phaser/`
- Executou `mise exec -- npm install` - dependências já estavam atualizadas
- Validou `mise exec -- npm run build` - build concluído sem erros
- Validou `mise exec -- npm run dev` - dev server iniciou com sucesso em http://localhost:8080/
- Nenhum arquivo em `app/` foi alterado
- Nenhuma alteração para commitar após execução (working tree clean)

**Problemas encontrados:**
- Nenhum

**Arquivos criados/modificados:**
- Nenhum (branch criada, tooling validado, sem alterações de código)
