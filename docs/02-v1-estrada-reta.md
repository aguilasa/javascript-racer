# 02 — V1: Estrada Reta (`v1.straight.html`)

> Fonte teórica: [v1 — Straight](https://jakesgordon.com/writing/javascript-racer-v1-straight/)
> Arquivo: [`v1.straight.html`](../v1.straight.html)

Esta é a primeira versão jogável: um carro que acelera/freia e se move lateralmente numa pista
**perfeitamente reta e plana** que se estende ao infinito (na verdade, em looping — 500 segmentos
que se repetem). Não há curvas nem colinas ainda; o objetivo desta versão é estabelecer toda a
infraestrutura (game loop, projeção, geometria de segmentos, renderização, entrada de teclado) que
as versões seguintes apenas *estendem*.

## 2.1 Variáveis de configuração e estado

```javascript
var fps           = 60;                      // quantos frames de 'update' por segundo
var step          = 1/fps;                   // duração de cada frame (em segundos)
var width         = 1024;                    // largura lógica do canvas
var height        = 768;                     // altura lógica do canvas
var segments      = [];                      // array de segmentos da estrada
var roadWidth     = 2000;                    // na verdade, METADE da largura da estrada
var segmentLength = 200;                     // comprimento de cada segmento
var rumbleLength  = 3;                       // nº de segmentos por faixa vermelha/branca (rumble strip)
var trackLength   = null;                    // comprimento total da pista em Z (calculado)
var lanes         = 3;                       // número de faixas
var fieldOfView   = 100;                     // ângulo (graus) do campo de visão
var cameraHeight  = 1000;                    // altura (Z... na verdade Y) da câmera
var cameraDepth   = null;                    // distância da câmera até a tela (calculado)
var drawDistance  = 300;                     // quantos segmentos são desenhados à frente
var playerX       = 0;                       // deslocamento do jogador (-1 a 1), independente de roadWidth
var playerZ       = null;                    // distância Z do jogador relativa à câmera (calculado)
var fogDensity    = 5;                       // densidade exponencial da neblina
var position      = 0;                       // posição Z atual da câmera
var speed         = 0;                       // velocidade atual
var maxSpeed      = segmentLength/step;      // velocidade máxima
var accel         =  maxSpeed/5;             // taxa de aceleração
var breaking      = -maxSpeed;               // taxa de frenagem
var decel         = -maxSpeed/5;             // desaceleração natural (sem acelerar nem frear)
var offRoadDecel  = -maxSpeed/2;             // desaceleração quando fora da pista
var offRoadLimit  =  maxSpeed/4;             // velocidade mínima garantida mesmo fora da pista
```

Alguns pontos que vale destacar (comentários já presentes no próprio código-fonte):

- **`roadWidth` é *metade* da largura da pista.** A pista vai de `-roadWidth` a `+roadWidth`,
  centrada em zero — isso simplifica toda a matemática de projeção mais adiante (não é preciso
  somar/subtrair metade da largura o tempo todo).
- **`maxSpeed = segmentLength/step`.** Isso não é arbitrário: garante que, no pior caso (60
  updates por segundo, na velocidade máxima), o jogador nunca percorre mais que **um segmento
  inteiro por frame de update**. Isso é o que torna a detecção de colisão simples nas versões
  seguintes — o jogador nunca "pula" um segmento inteiro sem ser processado.
- **`playerX` é normalizado entre -1 e 1**, independente de `roadWidth` em unidades de mundo. Isso
  deixa o valor de `roadWidth` livre para ser ajustado pela tweak UI sem quebrar a lógica de
  entrada/colisão, que só lida com a fração `-1..1`.

<p align="center">
<img src="img/dominio-playerx-normalizado.svg" alt="Linha numérica mostrando o domínio de playerX: pista entre -1 e 1, zona de desaceleração fora da pista entre -2 e -1 / 1 e 2, e limite rígido em ±2" style="max-width:100%;height:auto;">
<br/><em>Figura 7 — o domínio de <code>playerX</code> é sempre relativo (-1 a 1 = dentro da pista),
não em unidades de mundo. A zona entre ±1 e ±2 já é "fora da pista" (aciona
<code>offRoadDecel</code>), e <code>Util.limit</code> nunca deixa o valor passar de ±2.</em>
</p>

## 2.2 O game loop de passo fixo (fixed time step)

O laço de jogo em si vive em `common.js` (`Game.run`, ver [06](06-arquitetura-common-js.md)), mas
`v1.straight.html` é quem o configura:

```javascript
Game.run({
  canvas: canvas, render: render, update: update, stats: stats, step: step,
  images: ["background", "sprites"],
  keys: [ /* ... */ ],
  ready: function(images) {
    background = images[0];
    sprites    = images[1];
    reset();
  }
});
```

A ideia de **fixed time step com acumulador** (implementada dentro de `Game.run`) é: não importa a
taxa de quadros real do navegador, a função `update(dt)` é sempre chamada com o mesmo `dt` fixo
(`step = 1/60`), possivelmente **múltiplas vezes** em um único frame de tela, ou **nenhuma vez**,
dependendo de quanto tempo passou desde o frame anterior. Isso torna a física do jogo determinística
e independente da taxa de atualização da tela, evitando que o carro se mova mais rápido em
monitores de 144Hz do que em monitores de 60Hz.

## 2.3 `update(dt)` — a lógica do carro

```javascript
function update(dt) {

  position = Util.increase(position, dt * speed, trackLength);

  var dx = dt * 2 * (speed/maxSpeed); // na velocidade máxima, cruza de -1 a 1 em 1 segundo

  if (keyLeft)
    playerX = playerX - dx;
  else if (keyRight)
    playerX = playerX + dx;

  if (keyFaster)
    speed = Util.accelerate(speed, accel, dt);
  else if (keySlower)
    speed = Util.accelerate(speed, breaking, dt);
  else
    speed = Util.accelerate(speed, decel, dt);

  if (((playerX < -1) || (playerX > 1)) && (speed > offRoadLimit))
    speed = Util.accelerate(speed, offRoadDecel, dt);

  playerX = Util.limit(playerX, -2, 2);     // nunca deixa o jogador sair MUITO da pista
  speed   = Util.limit(speed, 0, maxSpeed); // nem exceder a velocidade máxima
}
```

Passo a passo:

1. **`position`** (a posição Z da câmera/jogador ao longo da pista) avança por `dt * speed`, usando
   `Util.increase`, que faz *wrap-around*: ao ultrapassar `trackLength`, volta para o início — daí
   a pista ser um circuito fechado (loop).
2. **`dx`** é o deslocamento lateral máximo possível neste frame, proporcional à fração de
   velocidade atual (`speed/maxSpeed`). O comentário no código explica a escolha do fator `2`: na
   velocidade máxima, o jogador consegue atravessar de uma ponta a outra da pista (`-1` a `+1`,
   uma distância de `2` unidades normalizadas) em exatamente 1 segundo.
3. **Aceleração/frenagem/desaceleração natural** são todas implementadas com a mesma função
   `Util.accelerate(v, aceleração, dt) = v + aceleração*dt` — uma integração de Euler simples:
   segure ↑ para acelerar, ↓ para frear, e sem nenhuma tecla o carro perde velocidade naturalmente
   (`decel`, negativo).
4. **Penalidade por sair da pista**: se `playerX` está fora do intervalo `[-1, 1]` (ou seja, fora
   da faixa de rodagem) e a velocidade ainda está acima de `offRoadLimit`, aplica-se uma
   desaceleração mais forte (`offRoadDecel`) — mas nunca abaixo de `offRoadLimit`, garantindo que o
   jogador sempre consiga voltar para a pista.
5. **Limites finais**: `playerX` é limitado a `[-2, 2]` (o dobro da pista, para não deixar o
   jogador "sumir" indefinidamente para os lados) e `speed` a `[0, maxSpeed]`.

Note que, nesta versão, não existe nenhuma referência a `curve` nem a `y` de segmento — o carro
sempre está sobre uma pista reta e plana, então a única física necessária é lateral (esquerda/
direita) e longitudinal (acelerar/frear).

## 2.4 Construção da geometria da pista

```javascript
function resetRoad() {
  segments = [];
  for(var n = 0 ; n < 500 ; n++) {
    segments.push({
       index: n,
       p1: { world: { z:  n   *segmentLength }, camera: {}, screen: {} },
       p2: { world: { z: (n+1)*segmentLength }, camera: {}, screen: {} },
       color: Math.floor(n/rumbleLength)%2 ? COLORS.DARK : COLORS.LIGHT
    });
  }

  segments[findSegment(playerZ).index + 2].color = COLORS.START;
  segments[findSegment(playerZ).index + 3].color = COLORS.START;
  for(var n = 0 ; n < rumbleLength ; n++)
    segments[segments.length-1-n].color = COLORS.FINISH;

  trackLength = segments.length * segmentLength;
}
```

Aqui nasce o conceito central explicado na [teoria](01-teoria-pseudo-3d.md#14-segmentos-de-estrada-em-vez-de-um-piso-contínuo):
a pista é **500 segmentos** em sequência, cada um com 200 unidades de comprimento em Z. Cada
segmento guarda:

- **`p1`** — sua borda "de trás" (mais próxima do início da pista / mais próxima da câmera quando
  o segmento está à frente dela)
- **`p2`** — sua borda "da frente" (mais distante)
- **`color`** — alterna entre `COLORS.LIGHT` e `COLORS.DARK` a cada `rumbleLength` (3) segmentos,
  criando o efeito visual clássico de faixas listradas na lateral da pista (rumble strips)

Note que **nesta versão** cada ponto só tem `z` no objeto `world` (nenhum `x` nem `y`) — eles serão
adicionados em v2 (curva → `x`, via deslocamento de câmera) e v3 (colina → `y`).

Duas faixas de segmentos recebem cores especiais: `COLORS.START` (linha de largada/chegada logo à
frente do jogador) e `COLORS.FINISH` (os últimos `rumbleLength` segmentos da pista, em preto e
branco, como uma bandeira quadriculada).

`findSegment(z)` é a função que converte qualquer posição Z absoluta no segmento correspondente,
usando divisão inteira e módulo (para lidar com o loop):

```javascript
function findSegment(z) {
  return segments[Math.floor(z/segmentLength) % segments.length];
}
```

<p align="center">
<img src="img/anel-segmentos-loop.svg" alt="Diagrama em anel dos 500 segmentos da pista, mostrando índice 0, START, FINISH, a posição da câmera e a janela de drawDistance" style="max-width:100%;height:auto;">
<br/><em>Figura 8 — os 500 segmentos formam um circuito fechado: o índice mais alto (FINISH) fica
logo antes do índice 0, e o START fica logo depois — por isso a linha de chegada e a de largada
ficam visualmente adjacentes. <code>findSegment</code> usa módulo para "dar a volta" nesse anel, e
<code>drawDistance</code> define quantos segmentos à frente da câmera são efetivamente
desenhados.</em>
</p>

## 2.5 Renderização da pista

```javascript
function render() {

  var baseSegment = findSegment(position);
  var maxy        = height;

  ctx.clearRect(0, 0, width, height);

  Render.background(ctx, background, width, height, BACKGROUND.SKY);
  Render.background(ctx, background, width, height, BACKGROUND.HILLS);
  Render.background(ctx, background, width, height, BACKGROUND.TREES);

  var n, segment;

  for(n = 0 ; n < drawDistance ; n++) {

    segment        = segments[(baseSegment.index + n) % segments.length];
    segment.looped = segment.index < baseSegment.index;
    segment.fog    = Util.exponentialFog(n/drawDistance, fogDensity);

    Util.project(segment.p1, (playerX * roadWidth), cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);
    Util.project(segment.p2, (playerX * roadWidth), cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);

    if ((segment.p1.camera.z <= cameraDepth) || // atrás de nós
        (segment.p2.screen.y >= maxy))          // clipado por um segmento já desenhado
      continue;

    Render.segment(ctx, width, lanes,
                   segment.p1.screen.x, segment.p1.screen.y, segment.p1.screen.w,
                   segment.p2.screen.x, segment.p2.screen.y, segment.p2.screen.w,
                   segment.fog, segment.color);

    maxy = segment.p2.screen.y;
  }

  Render.player(ctx, width, height, resolution, roadWidth, sprites, speed/maxSpeed,
                cameraDepth/playerZ, width/2, height,
                speed * (keyLeft ? -1 : keyRight ? 1 : 0), 0);
}
```

Ponto a ponto:

1. **`baseSegment = findSegment(position)`** — o segmento onde a câmera está agora. É daqui que
   começamos a desenhar, indo para frente `drawDistance` (300) segmentos.
2. **Fundo em 3 camadas** (`BACKGROUND.SKY`, `HILLS`, `TREES`) é desenhado primeiro, sem
   deslocamento nesta versão (parallax scrolling só entra em v2/v3).
3. **Loop principal**: para cada um dos 300 segmentos à frente:
   - `segment.looped` marca se este segmento, por causa do módulo, está "dando a volta" no array
     (índice menor que o `baseSegment` significa que já passamos do fim do array e voltamos ao
     início) — usado para ajustar sua posição Z absoluta (subtraindo `trackLength`) e evitar que
     ele seja desenhado "atrás" quando na verdade está à frente, do outro lado do loop.
   - `segment.fog` calcula a neblina exponencial baseada em quão longe (`n/drawDistance`) este
     segmento está — mais neblina quanto mais distante, para esconder o "pop-in" de objetos no
     horizonte (ver `Util.exponentialFog` em [06](06-arquitetura-common-js.md)).
   - **`Util.project`** é chamado duas vezes, uma para `p1` e outra para `p2` do segmento —
     transformando suas coordenadas de mundo em coordenadas de tela. Note que `cameraX` é sempre
     `playerX * roadWidth` (a câmera segue o carro lateralmente) e `cameraY` é sempre
     `cameraHeight` fixo (ainda não há colinas).
   - **Descarte de segmentos**: se a borda próxima (`p1`) já está atrás da câmera
     (`camera.z <= cameraDepth`) ou se a borda distante (`p2`) já ficaria coberta por um segmento
     anterior mais alto na tela (`p2.screen.y >= maxy`), pula-se o desenho — uma forma simples do
     **algoritmo do pintor** (desenha-se do mais próximo para o mais distante, e cada novo
     segmento só é visível abaixo do topo do anterior).
   - **`Render.segment`** desenha de fato o trapézio da pista (grama, acostamento/rumble, faixas de
     pista) usando as coordenadas de tela já calculadas.
   - `maxy` é atualizado para a borda superior do segmento recém-desenhado, usado como linha de
     corte para o próximo (mais distante).
4. **O carro do jogador** é desenhado por último, sempre centralizado horizontalmente
   (`width/2`) e na base da tela (`height`), escalado por `cameraDepth/playerZ` — a mesma fórmula
   de escala `d/z` da teoria, aqui aplicada à posição fixa do jogador em vez de a um segmento.
   O parâmetro de "guinada" (`speed * (keyLeft ? -1 : keyRight ? 1 : 0)`) é usado por
   `Render.player` só para decidir qual sprite mostrar (carro virando à esquerda/direita/reto) —
   não afeta a física.

<p align="center">
<img src="img/descarte-segmentos-render.svg" alt="Diagrama mostrando a zona descartada atrás da câmera (z ≤ cameraDepth) e o corte por maxy entre segmentos desenhados" style="max-width:100%;height:auto;">
<br/><em>Figura 9 — as duas condições de descarte do loop de <code>render()</code>: segmentos com
<code>z</code> além do limite atrás da câmera nunca são projetados como visíveis, e cada segmento
subsequente só é desenhado se ainda não estiver coberto pelo <code>maxy</code> do segmento anterior
(mais próximo).</em>
</p>

## 2.6 `reset(options)` e a tweak UI

```javascript
function reset(options) {
  options       = options || {};
  canvas.width  = width  = Util.toInt(options.width,          width);
  canvas.height = height = Util.toInt(options.height,         height);
  lanes                  = Util.toInt(options.lanes,          lanes);
  roadWidth              = Util.toInt(options.roadWidth,      roadWidth);
  cameraHeight           = Util.toInt(options.cameraHeight,   cameraHeight);
  drawDistance           = Util.toInt(options.drawDistance,   drawDistance);
  fogDensity             = Util.toInt(options.fogDensity,     fogDensity);
  fieldOfView            = Util.toInt(options.fieldOfView,    fieldOfView);
  segmentLength          = Util.toInt(options.segmentLength,  segmentLength);
  rumbleLength           = Util.toInt(options.rumbleLength,   rumbleLength);
  cameraDepth            = 1 / Math.tan((fieldOfView/2) * Math.PI/180);
  playerZ                = (cameraHeight * cameraDepth);
  resolution             = height/480;
  refreshTweakUI();

  if ((segments.length==0) || (options.segmentLength) || (options.rumbleLength))
    resetRoad(); // só reconstrói a pista quando necessário
}
```

`reset` é chamado uma vez na inicialização (sem `options`, usando os valores padrão) e sempre que
o jogador mexe em algum controle da tweak UI (resolução, faixas, largura da pista, altura da
câmera, distância de desenho, campo de visão, densidade de neblina). Dois cálculos importantes
acontecem sempre aqui, e não em `update`/`render`, porque só mudam quando a configuração muda:

- **`cameraDepth = 1/tan(fov/2)`** — a fórmula de field-of-view discutida na
  [teoria](01-teoria-pseudo-3d.md#13-campo-de-visão-field-of-view-e-distância-de-projeção-d).
- **`playerZ = cameraHeight * cameraDepth`** — a distância, em Z, entre a câmera e a posição fixa
  onde o carro do jogador é desenhado na tela. É por isso que, em `render()`, o jogo sempre projeta
  o segmento em `position + playerZ` quando precisa saber "em qual segmento da pista o jogador
  realmente está" (usado a partir de v2, quando a curvatura do segmento do jogador afeta a força
  centrífuga).

A pista só é **reconstruída** (`resetRoad()`) quando ainda não existe, ou quando o comprimento do
segmento/rumble muda — mudar resolução, largura da pista, câmera etc. não exige recriar a
geometria, só re-projetá-la com os novos parâmetros no próximo `render()`.

## 2.7 Entrada de teclado

```javascript
keys: [
  { keys: [KEY.LEFT,  KEY.A], mode: 'down', action: function() { keyLeft   = true;  } },
  { keys: [KEY.RIGHT, KEY.D], mode: 'down', action: function() { keyRight  = true;  } },
  { keys: [KEY.UP,    KEY.W], mode: 'down', action: function() { keyFaster = true;  } },
  { keys: [KEY.DOWN,  KEY.S], mode: 'down', action: function() { keySlower = true;  } },
  { keys: [KEY.LEFT,  KEY.A], mode: 'up',   action: function() { keyLeft   = false; } },
  { keys: [KEY.RIGHT, KEY.D], mode: 'up',   action: function() { keyRight  = false; } },
  { keys: [KEY.UP,    KEY.W], mode: 'up',   action: function() { keyFaster = false; } },
  { keys: [KEY.DOWN,  KEY.S], mode: 'up',   action: function() { keySlower = false; } }
]
```

Cada entrada é apenas uma flag booleana (`keyLeft`, `keyRight`, `keyFaster`, `keySlower`) alternada
em `keydown`/`keyup`. O `update()` lê essas flags a cada frame — um padrão simples de "input
polling" em vez de reagir a eventos diretamente na lógica de jogo, o que mantém `update()`
determinístico e fácil de testar mentalmente.

## 2.8 O que muda nas próximas versões

A v1 já contém, em germe, toda a arquitetura das versões seguintes:

- v2 ([03](03-v2-curvas.md)) adiciona `curve` aos segmentos e um segundo acumulador (`x`, `dx`)
  durante a renderização, além de força centrífuga em `update()`.
- v3 ([04](04-v3-colinas.md)) adiciona `y` aos segmentos (mundo) e usa a coordenada `y` já
  suportada por `Util.project` — sem exigir nenhuma mudança em `update()` ou `render()` além de
  interpolar a altura do jogador para desenhar o carro na altura certa.
- v4 ([05](05-v4-final.md)) adiciona tráfego, sprites de cenário, colisão, HUD e a tweak UI
  completa (as versões v1-v3 já têm a tweak UI, mas v4 adiciona também `lanes`, música e mute).
