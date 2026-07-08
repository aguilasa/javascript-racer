# Documentação — Migração para Phaser

Este diretório documenta o **plano de migração** da v4-final do jogo (hoje um port TypeScript
puro, sem framework, em [`app/src/versions/v4-final`](../../app/src/versions/v4-final)) para um
segundo projeto, desta vez usando o framework [Phaser](https://phaser.io) 4 dentro de um scaffold
Vite + TypeScript já clonado em [`racer-phaser/`](../../racer-phaser).

> **Escopo desta entrega:** apenas o plano. Nenhum código de jogo será escrito ainda — a
> implementação será quebrada em tarefas menores a partir deste documento, em conversas futuras.
> `racer-phaser/` hoje contém só o template padrão da Phaser Studio (`phaserjs/template-vite-ts`),
> sem nenhuma lógica do jogo.

## Escopo

Só a **v4-final** — a versão mais completa do jogo (pista com curvas e morros, tráfego com IA de
desvio, cenário, colisão, HUD com tempos de volta, música) — é portada para Phaser. As quatro
versões incrementais (v1→v4) que existem tanto no HTML/JS original quanto no port TypeScript em
[`app/`](../../app) **não** são recriadas aqui; `app/` permanece intocado, como implementação
irmã e referência viva.

## Diretrizes que vieram do pedido original

- Basear a migração na v4-final já portada para TypeScript em `app/` — reaproveitar ao máximo a
  matemática e a lógica que já existem lá (`Road`, `util`, `types`, `Car`, `TrafficManager`,
  `scenery`), não reescrever física ou IA de tráfego do zero.
- Cruzar essa base com a teoria já documentada em [`docs/`](../README.md) (projeção pseudo-3D,
  arquitetura de `common.js`, detalhe linha-a-linha da v4-final) para garantir que a migração
  preserve o comportamento original, não apenas a aparência.
- Migração é sobre **onde cada peça mora e quem a chama** — trocar as partes que hoje são
  equivalentes caseiros de `common.js` (loop de jogo, carregamento de imagens, teclado, áudio,
  desenho em canvas) pelas APIs nativas do Phaser, mantendo a matemática de projeção/pista/tráfego
  como está.

## Como navegar

1. **[00 — Visão Geral](00-visao-geral.md)** — objetivos, não-objetivos, critérios de sucesso.
2. **[01 — Arquitetura Alvo](01-arquitetura-alvo.md)** — o mapa completo de cada arquivo de
   `app/src/core` e `app/src/versions/v4-final` para o que ele vira dentro de `racer-phaser/`, e as
   decisões técnicas centrais (renderização via `Graphics` + pool de `Image`, pipeline de sprites,
   parallax via `TileSprite`).
3. **[02 — Estrutura do Projeto](02-estrutura-projeto.md)** — layout de pastas dentro de
   `racer-phaser/src/`, onde os assets (`images/`, `music/`) são copiados, e como isso se encaixa
   nas cenas já geradas pelo template (`Boot`/`Preloader`/`MainMenu`/`Game`/`GameOver`).
4. **[03 — Fases de Execução](03-fases-execucao.md)** — a quebra em fases/marcos, cada um pequeno
   o bastante para virar uma tarefa isolada depois.
5. **[04 — Riscos e Decisões](04-riscos-decisoes.md)** — pontos que precisam de uma decisão do
   usuário antes ou durante a implementação, e trade-offs já considerados.

## Pré-requisitos de leitura

Antes de implementar, recomenda-se ler:
- [`docs/06-arquitetura-common-js.md`](../06-arquitetura-common-js.md) — o que `Dom`/`Util`/`Game`/
  `Render` fazem hoje, função por função (a base de tudo que está sendo substituído ou preservado).
- [`docs/05-v4-final.md`](../05-v4-final.md) — o comportamento específico da v4 (sprites, tráfego,
  colisão, HUD, traçado do circuito) que a migração precisa preservar.
- [`docs/projeto/01-arquitetura-alvo.md`](../projeto/01-arquitetura-alvo.md) — o mapa equivalente
  da *primeira* migração (JS embutido → TypeScript), útil como base comparativa: aquela migração
  trocou só a linguagem e organização em classes, mantendo o canvas 2D; esta migração troca também
  o motor de renderização/loop/input/áudio pelo Phaser.
