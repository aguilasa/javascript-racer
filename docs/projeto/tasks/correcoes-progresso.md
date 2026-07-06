# Progresso de Correções — Migração para TypeScript + Vite

## Resumo executivo

| ID | Título | Criticidade | Status |
|---|---|---|---|
| CORR-RACER-001 | `mise.toml` ausente — versão do Node do projeto não está fixada | Alta | [x] concluída |
| CORR-RACER-002 | Assets de exemplo do template Vite não removidos em `app/src/assets/` | Baixa | [ ] pendente |

## Checklist

- [x] CORR-RACER-001 — criar `mise.toml` fixando a versão do Node
- [ ] CORR-RACER-002 — remover `typescript.svg`/`vite.svg`/`hero.png` de `app/src/assets/`

## Detalhes por correção

### CORR-RACER-001

- **Alvo com problema:** `mise.toml` (deveria existir na raiz do repositório ou em `app/`)
- **Sintoma:** Não existe nenhum `mise.toml` no projeto. `mise current node` só reporta uma
  versão (`20.20.2`) porque o `~/.config/mise/config.toml` **global** do usuário já fixa
  `node = "20"` — em outra máquina/usuário isso reportaria "não definido". `01-executar.md`
  atribui explicitamente à RACER-TASK-01 a responsabilidade de criar esse arquivo, e isso não
  foi feito.
- **Fix:** Criar `mise.toml` na raiz do repositório com `[tools]\nnode = "20"` (ex.: via
  `mise use node@20`) e confirmar que `mise current node` rodado em `app/` reflete o arquivo do
  projeto, não o global.

### CORR-RACER-002

- **Alvo com problema:** `app/src/assets/typescript.svg`, `app/src/assets/vite.svg`,
  `app/src/assets/hero.png`
- **Sintoma:** Arquivos de exemplo do template `vanilla-ts`, não referenciados em nenhum lugar
  do código, remanescentes apesar do passo de limpeza de boilerplate da RACER-TASK-01 e do
  critério de conclusão "Boilerplate de exemplo do template removido".
- **Fix:** Remover os três arquivos (e a pasta `assets/` se ficar vazia).
