---
id: CORR-PHASER-020
title: "Correção: merge da PHASER-TASK-20 trouxe para master commits de ferramenta de upscaling de sprites, sem relação com a migração Phaser"
type: implementação
category: ferramental
status: não_é_discrepância — decisão humana confirmada
depends_on: []
---

# CORR-PHASER-020: merge da PHASER-TASK-20 trouxe para `master` commits fora de escopo

> **Atualização pós-revisão:** o usuário confirmou explicitamente que misturar esse conteúdo no
> mesmo merge foi uma decisão sua, não um efeito colateral não intencional. Classificação revista
> de **Crítica** para **Não é discrepância** (ver tabela de classificação da Etapa 4 do prompt de
> revisão — "diferença intencional", só que confirmada depois do fato em vez de no Log de
> Execução original da PHASER-TASK-20). Mantido em disco como registro histórico da revisão; sem
> ação de código pendente.

## Problema identificado

O merge `--no-ff` de `feature/phaser-port` em `master`, feito pela PHASER-TASK-20 (commit
`1d155b2`), não trouxe só os 39 commits `PHASER-TASK-*`/`CORR-PHASER-*` da migração — trouxe
também 4 commits sem relação nenhuma com o port Phaser, aparentemente commitados diretamente na
branch `feature/phaser-port` fora do fluxo dos prompts de execução (nenhum deles referencia um
`PHASER-TASK-XX`):

```bash
git log --oneline cfb5b0c..1d155b2 | tail -5
```
```
3728efc docs(sprites): add Mega Drive sprite upscaling guide
af20973 chore(resources): add sample sprite sheet and extracted rects for upscaling tests
4f768ae feat(scripts): add sprite upscaling and extraction tooling
70a65bd chore: ignore python venv, model weights, and upscaling scratch output
2ba7fab feat(racer-phaser): implementa PHASER-TASK-18 — Medir e otimizar performance do pool
```

`git show --stat 1d155b2` confirma que o próprio commit de merge inclui, fora de
`racer-phaser/` e `docs/migracao-phaser/`:

```
.gitignore                                     |  11 +
docs/sprites/upscaling-sprites-mega-drive.md   | 226 ++++++++
resources/25458.kra                            | Bin
resources/25458.png                            | Bin
resources/row1_extracted_rect1.png             | Bin
resources/row1_extracted_rect2.png             | Bin
resources/row1_extracted_rect3.png             | Bin
resources/row1_extracted_rect4.png             | Bin
resources/row1_extracted_rect5.png             | Bin
scripts/esrgan_arch.py                         | 121 ++++
scripts/sprite_tools.py                        | 303 ++++++
scripts/upscalers.py                           | 146 ++++
```

Isso é exatamente o tipo de vazamento que a Etapa 3 deste processo de revisão (`git diff
master...feature/phaser-port --stat -- . ':!racer-phaser' ':!docs/migracao-phaser'` deve retornar
vazio) foi desenhada para pegar nas PHASER-TASK-01 a 19 — só que aqui quem introduziu o vazamento
foi a própria PHASER-TASK-20, ao mergear a branch sem essa checagem.

## Causa raiz

O checklist pré-merge da PHASER-TASK-20 (`docs/migracao-phaser/tasks/
20-mergear-branch-phaser-em-master.md`, seção "1) Checklist pré-merge") só verifica
`git diff master...feature/phaser-port --stat -- app/` (deve ser vazio) — não verifica se a
branch, no todo, só contém alterações dentro de `racer-phaser/`/`docs/migracao-phaser/`. Como
alguém commitou ferramental de upscaling de sprites (`scripts/`, `resources/`, `docs/sprites/`,
`.gitignore` raiz) diretamente em `feature/phaser-port` fora do fluxo `PHASER-TASK-XX`, esse
conteúdo passou despercebido pelo checklist e foi mergeado em `master` junto com o port Phaser. O
Log de Execução da PHASER-TASK-20 registra "Problemas encontrados: Nenhum" — sem qualquer menção a
esses 4 commits.

## Correção

### Arquivo/alvo: `docs/migracao-phaser/tasks/20-mergear-branch-phaser-em-master.md`

No passo "1) Checklist pré-merge", trocar (ou complementar) a checagem restrita a `app/` por uma
que cubra todo o diff fora do escopo esperado, nos mesmos moldes da Etapa 3 deste prompt de
revisão:

```bash
git diff master...feature/phaser-port --stat -- . ':!racer-phaser' ':!docs/migracao-phaser'
```

e documentar explicitamente, no Log de Execução, que essa checagem foi rodada e o resultado
obtido — não só a checagem restrita a `app/`.

### Decisão sobre o conteúdo já mergeado em `master`

**Resolvido.** O usuário confirmou diretamente (fora do arquivo da tarefa, nesta conversa de
revisão) que decidiu, ele mesmo, mergear esse conteúdo junto — não é um vazamento acidental.
Conteúdo mantido em `master` como está; nenhum `git revert`/isolamento necessário.

Fica como observação de processo, não como ação obrigatória: o checklist pré-merge de
`20-mergear-branch-phaser-em-master.md` só verifica `git diff ... -- app/`, então não teria pego
esse tipo de mistura de qualquer forma — só serve como nota para quem ler essa tarefa no futuro,
sem exigir edição do arquivo da tarefa.

## Verificação

- [x] Confirmado com o humano responsável (usuário, nesta conversa) que a mistura de commits no
      merge foi decisão intencional dele — não um efeito colateral do processo de merge
- [x] Conteúdo (`scripts/`, `resources/`, `docs/sprites/`, `.gitignore` raiz) mantido em `master`
      como está — nenhuma ação de código necessária
- [ ] *(opcional, não bloqueante)* Log de Execução da PHASER-TASK-20 poderia ganhar uma nota
      retroativa mencionando essa decisão, para quem ler o histórico sem o contexto desta
      conversa

## Log de Execução

**Executado em:** 2026-07-09

**Resumo do que foi feito:** CORR aberta durante a revisão da PHASER-TASK-20 (prompt
`02-revisar.md`) ao notar, via `git log`/`git show --stat` no commit de merge `1d155b2`, que 4
commits sem relação com a migração Phaser (ferramental de upscaling de sprites) entraram em
`master` junto com o port. Classificada inicialmente como Crítica. Ao ser questionado, o usuário
confirmou explicitamente: "O merge da master tá certo, fui eu quem decidi fazer desse jeito" —
reclassificada para Não é discrepância. Nenhuma alteração de código feita; arquivo mantido só
como registro da revisão.

**Problemas encontrados:** Nenhum (após confirmação do usuário).

**Arquivos criados/modificados:** `CORR-PHASER-020.md` (este arquivo, atualizado),
`correcoes-progresso.md`.
