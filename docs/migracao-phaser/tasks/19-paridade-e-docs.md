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

- [ ] Todos os critérios de sucesso de `00-visao-geral.md` confirmados (ou divergência
      documentada e justificada)
- [ ] Comparação lado a lado com `v4.final.html`/`RacerGameV4` registrada no Log de Execução
- [ ] `docs/migracao-phaser/00-visao-geral.md`/`README.md` atualizados se houve divergência
      deliberada
- [ ] `progresso.md` com resumo final da migração
- [ ] Commit feito em `feature/phaser-port`

## Log de Execução *(preenchido após execução)*

**Executado em:**

**Resumo do que foi feito:**

**Problemas encontrados:**

**Arquivos criados/modificados:**
