# Documentação — Javascript Racer

Esta pasta documenta, em português, a teoria e a prática por trás deste projeto: um jogo de
corrida em pseudo-3D estilo Outrun, escrito em HTML5 Canvas + JavaScript puro, por Jake Gordon
([jakesgordon.com](https://jakesgordon.com)).

A documentação foi produzida lendo os artigos originais do autor e cruzando cada explicação com o
código-fonte real presente neste repositório (`v1.straight.html`, `v2.curves.html`,
`v3.hills.html`, `v4.final.html`, `common.js`), para garantir que os trechos mostrados aqui sejam
exatamente os que rodam no projeto.

## Fontes originais

- [Javascript Racer](https://jakesgordon.com/writing/javascript-racer/) — artigo geral/índice
- [v1 — Straight](https://jakesgordon.com/writing/javascript-racer-v1-straight/) — teoria da projeção e estrada reta
- [v2 — Curves](https://jakesgordon.com/writing/javascript-racer-v2-curves/) — curvas
- [v3 — Hills](https://jakesgordon.com/writing/javascript-racer-v3-hills/) — colinas/montanhas
- [v4 — Final](https://jakesgordon.com/writing/javascript-racer-v4-final/) — versão final (tráfego, HUD, sprites)
- [Lou's Pseudo-3D Page](https://www.extentofthejam.com/pseudo/) — a referência histórica/teórica que inspirou a técnica (Pole Position, Out Run)

## Como navegar

1. **[01 — Teoria do Pseudo-3D](01-teoria-pseudo-3d.md)** — a matemática por trás da projeção
   (triângulos semelhantes, sistemas de coordenadas, field of view), incluindo o contexto
   histórico de como jogos de arcade como Pole Position e Out Run faziam isso com hardware
   limitado.
2. **[02 — V1: Estrada Reta](02-v1-estrada-reta.md)** — a primeira versão jogável: câmera,
   segmentos de estrada, projeção, o game loop de passo fixo.
3. **[03 — V2: Curvas](03-v2-curvas.md)** — como uma estrada reta ganha curvas sem nunca calcular
   coordenadas X reais dos segmentos, força centrífuga, parallax scrolling do fundo.
4. **[04 — V3: Colinas](04-v3-colinas.md)** — como o mesmo sistema de projeção, já preparado para
   3D, ganha relevo (subidas e descidas) quase de graça.
5. **[05 — V4: Versão Final](05-v4-final.md)** — carros de tráfego e sua IA simples, sprites de
   cenário, sistema de colisão, HUD, tempos de volta, UI de ajuste fino (tweak UI), música.
6. **[06 — Arquitetura de `common.js`](06-arquitetura-common-js.md)** — o código compartilhado por
   todas as versões: `Dom`, `Util`, `Game`, `Render`, e as constantes (`KEY`, `COLORS`, `SPRITES`,
   `BACKGROUND`).

## Contexto do projeto

Segundo o autor, o projeto nasceu da nostalgia por Out Run: *"I really loved Outrun, the speed,
the hills, the palm trees and the music"*. O objetivo era entender os truques técnicos por trás
desses jogos — curvas, colinas, sprites e a sensação de velocidade — usando apenas Canvas 2D e
JavaScript, sem WebGL e sem motor 3D. O que começou como um projeto de um fim de semana se
transformou em cerca de 5-6 fins de semana de trabalho, resultando nas quatro versões
incrementais documentadas aqui.

O próprio README do repositório é explícito sobre o estilo de código: o autor usa variáveis e
funções globais e embute o JavaScript de cada exemplo diretamente no HTML, propositalmente, para
manter o código simples de acompanhar (princípio KISS). Isto é, o código não pretende demonstrar
boas práticas de arquitetura de software — pretende ensinar a *técnica de renderização*. Vale ter
isso em mente ao ler os capítulos a seguir: a "arquitetura" aqui é deliberadamente rasa.
