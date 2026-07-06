# Plano de Execução — Migração para TypeScript + Vite

Este diretório contém o **plano de execução** para migrar as quatro versões do jogo
(`v1.straight.html` → `v4.final.html`, hoje em JavaScript embutido no HTML) para **TypeScript**,
organizadas em classes e módulos compartilhados, dentro de um **novo projeto Vite** criado neste
mesmo repositório.

> **Escopo desta entrega:** apenas o plano. Nenhum código será escrito ainda — a implementação será
> quebrada em tarefas menores a partir deste documento, em conversas futuras.

## Diretrizes que vieram do pedido original

- Converter os quatro HTMLs (v1–v4) para TypeScript.
- Maximizar classes e código compartilhado entre as versões (elas já compartilham ~80% da lógica
  via `common.js` — ver [`docs/06-arquitetura-common-js.md`](../06-arquitetura-common-js.md)).
- **Não remover nenhum arquivo JS existente** — `v1.straight.html` … `v4.final.html`, `common.js`,
  `stats.js` continuam no repositório, intocados, como referência viva e como demo funcional
  independente do novo projeto.
- Criar um **novo projeto Vite** dentro deste repo para gerenciar dependências (TypeScript, dev
  server, build) e implementar tudo dentro dele — não modificar a estrutura estática atual.

## Como navegar

1. **[00 — Visão Geral](00-visao-geral.md)** — objetivos, não-objetivos, e critérios de sucesso.
2. **[01 — Arquitetura Alvo](01-arquitetura-alvo.md)** — como o código compartilhado (`Dom`,
   `Util`, `Game`, `Render`, geometria de pista) vira classes/módulos TS, e como cada versão
   (v1–v4) se conecta a eles.
3. **[02 — Estrutura do Projeto Vite](02-estrutura-vite.md)** — onde o projeto Vite mora no repo,
   layout de pastas, configuração multi-página, e como os assets (`images/`, `music/`) são
   servidos.
4. **[03 — Fases de Execução](03-fases-execucao.md)** — a quebra em fases/marcos, cada um
   pequeno o bastante para virar uma tarefa isolada depois.
5. **[04 — Riscos e Decisões Abertas](04-riscos-decisoes-abertas.md)** — pontos que precisam de
   uma decisão do usuário antes ou durante a implementação.

## Contexto usado para montar este plano

Este plano parte do entendimento já documentado em [`docs/`](../README.md) sobre como o jogo atual
funciona: a teoria de projeção pseudo-3D, e a arquitetura linha a linha de `common.js` e de cada
versão v1–v4. Recomenda-se ler ao menos [`docs/06-arquitetura-common-js.md`](../06-arquitetura-common-js.md)
antes de começar a implementação — é o mapa do que precisa virar TypeScript.
