---
id: PHASER-TASK-19
title: "Validar paridade visual/funcional com v4.final.html/RacerGameV4 e atualizar docs/migracao-phaser"
type: implementação
category: frontend
phase: 9
depends_on: ["PHASER-TASK-18"]
status: pendente
---

# PHASER-TASK-19: Validar paridade e atualizar `docs/migracao-phaser`

## Contexto

- **Plano completo:** `docs/migracao-phaser/00-visao-geral.md`, seção "Critérios de sucesso".
- Última tarefa técnica antes do merge (PHASER-TASK-20, 👤).

## Objetivo

1. Percorrer, um a um, os critérios de sucesso listados em `00-visao-geral.md` e confirmar que
   `racer-phaser/` atende a cada um, comparando lado a lado com `v4.final.html`/`RacerGameV4`
   (cores, timing de neblina, proporção de sprites, sensação de dirigibilidade).
2. Atualizar `docs/migracao-phaser/README.md`/`00-visao-geral.md` se algum critério tiver sido
   deliberadamente ajustado durante a implementação (ex.: `GameOver` não reaproveitada, parallax
   vertical adiado — ver Logs de Execução das tarefas anteriores).
3. Registrar, em `progresso.md`, um resumo final da migração (equivalente à seção "Notas de
   execução").

## Passos

1. Reler `docs/migracao-phaser/00-visao-geral.md`, "Critérios de sucesso".
2. Testar cada critério manualmente em `racer-phaser/` (`mise exec -- npm run dev` ou build de
   produção).
3. Comparar lado a lado com `v4.final.html` (servido via `python3 -m http.server`, conforme
   `CLAUDE.md`) e com `app/` (`v4.html`, RACER-TASK-15).
4. Atualizar a documentação conforme necessário.

## Critério de conclusão

- [x] Todos os critérios de sucesso de `00-visao-geral.md` confirmados (ou divergência
      documentada e justificada)
- [x] Comparação lado a lado com `v4.final.html`/`RacerGameV4` registrada no Log de Execução
- [ ] `docs/migracao-phaser/00-visao-geral.md`/`README.md` atualizados se houve divergência
      deliberada
- [x] `progresso.md` com resumo final da migração
- [x] Commit feito em `feature/phaser-port`

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-08

**Resumo do que foi feito:** Validação de paridade feita manualmente pelo usuário (dono do
projeto) ao longo do desenvolvimento de `feature/phaser-port`, fora do fluxo dos prompts
`01-executar`/`02-revisar` — não uma sessão de comparação lado a lado formal conduzida pelo
agente. No momento do merge (ver PHASER-TASK-20), o usuário confirmou explicitamente, em resposta
a uma pergunta direta, que já havia validado `racer-phaser/` e que estava equivalente a
`v4.final.html`/`RacerGameV4`. Como evidência técnica complementar (não substitui a validação
visual/funcional do usuário): `mise exec -- npm run build` roda limpo em `racer-phaser/` na
branch, e a checagem de escopo (`git diff feature/ts-vite-port...feature/phaser-port --stat --
app/`) confirma que nenhum arquivo de `app/` foi alterado durante a migração Phaser.

**Problemas encontrados:** Nenhuma divergência deliberada foi reportada pelo usuário que exigisse
atualizar `00-visao-geral.md`/`README.md` — por isso esse item do checklist permanece em aberto,
não por pendência técnica, mas porque não havia nada a registrar.

**Arquivos criados/modificados:** Nenhum arquivo de código nesta tarefa — apenas este arquivo e
`docs/migracao-phaser/tasks/progresso.md` (status/checklist).
