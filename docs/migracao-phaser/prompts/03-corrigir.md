# Prompt de Correção - javascript-racer (migração Phaser)

Você vai trabalhar no projeto **javascript-racer**, localizado em:

- **Projeto:** `/home/ingmar/WebstormProjects/javascript-racer/`

A documentação de correções está em:

`/home/ingmar/WebstormProjects/javascript-racer/docs/migracao-phaser/tasks/`

O arquivo de progresso das correções está em:

`/home/ingmar/WebstormProjects/javascript-racer/docs/migracao-phaser/tasks/correcoes-progresso.md`

Os detalhes das tarefas de correção estão nos arquivos `CORR-PHASER-*.md` no mesmo diretório.

## Objetivo

Quero que você execute **uma única correção por invocação** deste prompt. Nada mais.

> **EXCLUSÃO OBRIGATÓRIA — uma correção por execução, nunca em paralelo:**
> Cada invocação deste prompt executa exatamente **uma** correção.
> Nunca execute duas correções em paralelo nem em sequência na mesma invocação.
> Após concluir e commitar, **pare imediatamente** — aguarde nova invocação.

1. Leia o arquivo `correcoes-progresso.md`
2. Identifique a **próxima correção não executada** da lista (primeira com checkbox `[ ]`)
3. Respeite a ordem dos IDs (CORR-PHASER-001, CORR-PHASER-002, …) e as dependências declaradas
   em `depends_on`
4. Abra **somente** o arquivo markdown dessa correção (ex.: `CORR-PHASER-001.md`) em
   `docs/migracao-phaser/tasks/`
5. Confirme o problema antes de corrigir (leia o código/arquivo mencionado)
6. Implemente exatamente a correção descrita na seção **Correção** desse único arquivo
7. Ao final, atualize o `correcoes-progresso.md` marcando o checkbox **dessa correção** como
   `[x]`
8. Preencha o **Log de Execução** no arquivo da correção com data, resumo, arquivos modificados
   e problemas encontrados
9. **Pare.** Não leia nem execute a próxima correção pendente.

---

## Regras de seleção

1. Procurar a **primeira correção com checkbox `[ ]`** no `correcoes-progresso.md`
2. Verificar se todas as tarefas em `depends_on` já estão com `[x]`; se não, informar o bloqueio
   e parar
3. Se existir alguma correção marcada textualmente como "em andamento", concluí-la antes de
   começar outra

> **EXCLUSÃO OBRIGATÓRIA 1 — escopo de arquivo:**
> Abra **apenas o arquivo `CORR-PHASER-XXX.md` da correção selecionada**.
> Não abra nem leia outros arquivos `CORR-PHASER-*.md`, mesmo que outras correções apontem para
> o mesmo alvo.
>
> **EXCLUSÃO OBRIGATÓRIA 2 — uma CORR por execução:**
> Após concluir a correção selecionada, **pare imediatamente**.
> Não prossiga para a próxima `[ ]` do checklist.
>
> **EXCLUSÃO OBRIGATÓRIA 3 — sem tasks:**
> Este prompt é exclusivo para correções `CORR-PHASER-XXX`.
> **Nunca** selecione nem execute tarefas `PHASER-TASK-XX` por aqui — elas são gerenciadas
> exclusivamente pelo prompt `prompts/01-executar.md` e rastreadas em `progresso.md`.
>
> **EXCLUSÃO OBRIGATÓRIA 4 — nunca tocar em `app/`:**
> As mesmas exclusões de `prompts/01-executar.md` sobre nunca alterar `app/` valem aqui também —
> nenhuma correção pode tocar nesse diretório.
>
> **EXCLUSÃO OBRIGATÓRIA 5 — respeitar marcação de interação humana:**
> Se a correção (`CORR-PHASER-XXX`) referenciar ou depender de uma tarefa de origem marcada
> `requires_human: true` (PHASER-TASK-20), tratar essa CORR também como dependente de aprovação
> humana antes de executar, mesmo que o `correcoes-progresso.md` não marque isso explicitamente.
> Reportar o bloqueio e seguir para a próxima correção pendente que não dependa disso.
>
> **EXCLUSÃO OBRIGATÓRIA 6 — branch de trabalho:**
> Toda correção relacionada a PHASER-TASK-01 a 19 é commitada em `feature/phaser-port`, nunca
> diretamente em `master`.

---

## Arquitetura do projeto (contexto)

Ver detalhes completos em
`/home/ingmar/WebstormProjects/javascript-racer/docs/migracao-phaser/prompts/01-executar.md`,
seção "Arquitetura do projeto".

### Comandos de validação

```bash
cd racer-phaser
mise exec -- npm run build
mise exec -- npm run dev   # para checagem visual, se a correção for de comportamento de jogo
```

---

## Como executar

### 1) Ler contexto
- Ler `CLAUDE.md` e os documentos do plano relevantes (`docs/migracao-phaser/00`–`04`)
- Ler `correcoes-progresso.md`
- Ler o arquivo da correção (`CORR-PHASER-XXX.md`)
- Confirmar que o problema ainda existe antes de corrigir

### 2) Implementar
- Implementar exatamente o que está descrito na seção **Correção**
- Não alterar escopo nem adicionar funcionalidades extras

### 3) Validar

Antes de marcar como concluída:

- `mise exec -- npm run build` sem erros (correções de código)
- Todos os itens do checklist **Verificação** do arquivo da correção foram atendidos

Se a correção ficar parcialmente pronta:
- Não marcar como concluída
- Atualizar o **Log de Execução** com status parcial e pendências

### 4) Atualizar progresso

Se concluída:
- Trocar `[ ]` por `[x]` no `correcoes-progresso.md` (tabela E checklist)
- Preencher o **Log de Execução** no arquivo da correção

### 5) Commit

```bash
cd /home/ingmar/WebstormProjects/javascript-racer
git add racer-phaser/ docs/migracao-phaser/tasks/correcoes-progresso.md docs/migracao-phaser/tasks/CORR-PHASER-XXX.md
git commit -m "fix(racer-phaser): corrige CORR-PHASER-XXX — <título curto>"
```

- Usar o ID real da correção no lugar de `CORR-PHASER-XXX`
- Nunca usar `git add -A` nem `git add .`
- Confirmar que o commit está na branch `feature/phaser-port`
- Se a correção só alterou o próprio arquivo `CORR-PHASER-XXX.md` (ex.: um ajuste redigido só no
  Log de Execução, sem mudança de código), o commit ainda assim inclui esses arquivos de
  `docs/migracao-phaser/tasks/`

---

## Formato de saída esperado

Ao concluir, informe:

1. Qual correção foi selecionada e por quê
2. Confirmação de que o problema foi verificado antes da correção
3. Resumo do que foi implementado
4. Quais arquivos foram criados ou modificados
5. Resultado das validações
6. Confirmação de que o `correcoes-progresso.md` foi atualizado
7. Bloqueios ou pendências, se houver

---

## Regra final

Não me entregue um plano.
Execute **uma única** correção pendente (a próxima `[ ]` do checklist), atualize o progresso ao
final e **pare**.
Não avance para a seguinte mesmo que seja no mesmo arquivo.
Uma correção por invocação — nunca em paralelo, nunca em sequência na mesma invocação.
