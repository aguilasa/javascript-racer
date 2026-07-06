---
id: RACER-TASK-01
title: "Criar branch e o scaffold do projeto Vite (vanilla-ts) em app/"
type: infraestrutura
category: ferramental
phase: 0
depends_on: []
status: pendente
---

# RACER-TASK-01: Criar branch e o scaffold do projeto Vite (vanilla-ts) em `app/`

## Contexto

- **Projeto:** `/home/ingmar/WebstormProjects/javascript-racer/`
- **Plano completo:** `docs/projeto/00-visao-geral.md`, `docs/projeto/02-estrutura-vite.md`
- Esta é a primeira tarefa da migração para TypeScript. Nenhum código de jogo é portado aqui —
  só a infraestrutura do projeto novo.
- **Restrição inegociável:** nada fora de `app/` pode ser alterado. `v1.straight.html` …
  `v4.final.html`, `common.js`, `stats.js`, `common.css`, `index.html`, `Rakefile`, `images/`,
  `music/` continuam exatamente como estão.

## Objetivo

1. Criar uma branch dedicada para toda a migração.
2. Rodar o scaffold oficial do Vite com o template `vanilla-ts` dentro de `app/`.
3. Ajustar `tsconfig.json` para ser mais estrito que o padrão do template.

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
git checkout master
git pull --ff-only origin master   # se houver remoto configurado; se não, pular
git checkout -b feature/ts-vite-port
```

### 3) Rodar o scaffold do Vite

```bash
npm create vite@latest app -- --template vanilla-ts
cd app
npm install
```

### 4) Ajustar `tsconfig.json`

Abrir `app/tsconfig.json` e garantir, além do que o template já gera:

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

(mesclar com o que já existir no arquivo gerado pelo Vite, não sobrescrever chaves não
relacionadas como `target`/`module`/`lib`).

### 5) Ajustar `package.json`

Confirmar que existem os scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  }
}
```

### 6) Limpar o boilerplate padrão do template

O template `vanilla-ts` vem com um contador de cliques de exemplo (`src/main.ts`,
`src/counter.ts`, `src/style.css`, `public/vite.svg`, `src/typescript.svg`). Remover esse
conteúdo de exemplo — as próximas tarefas (RACER-TASK-02 em diante) começam a preencher
`app/src/` com a estrutura real do projeto. Manter só o `index.html` gerado (será editado na
RACER-TASK-02).

### 7) Validar

```bash
npm run dev     # sobe sem erro (Ctrl+C para parar depois de confirmar)
npm run build   # conclui sem erro
npm run typecheck
```

### 8) Commit

```bash
cd /home/ingmar/WebstormProjects/javascript-racer
git add app/
git commit -m "chore(app): cria scaffold do projeto Vite (vanilla-ts)"
```

## Critério de conclusão

- [ ] Branch `feature/ts-vite-port` criada a partir de `master` atualizado
- [ ] `app/` criado via `npm create vite@latest -- --template vanilla-ts`
- [ ] `tsconfig.json` com `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`,
      `noUnusedParameters`
- [ ] `package.json` com os scripts `dev`, `build`, `preview`, `typecheck`
- [ ] Boilerplate de exemplo do template removido
- [ ] `npm run dev`, `npm run build` e `npm run typecheck` rodam sem erro
- [ ] Nenhum arquivo fora de `app/` foi alterado
- [ ] Commit feito em `feature/ts-vite-port`

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
