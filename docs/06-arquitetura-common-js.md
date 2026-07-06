# 06 — Arquitetura de `common.js`

> Arquivo: [`common.js`](../common.js) (414 linhas)

Este arquivo é carregado por **todas** as quatro versões (`<script src="common.js">`, sempre logo
após `stats.js` e antes do `<script>` inline específico da versão). Ele concentra tudo que é
genérico o bastante para não precisar ser duplicado: helpers de DOM, matemática, o game loop, as
rotinas de desenho no canvas, e as constantes de jogo (teclas, cores, coordenadas do spritesheet).
Está organizado em cinco blocos, na ordem em que aparecem no arquivo.

## 6.1 `Dom` — auxiliares mínimos de DOM

```javascript
var Dom = {

  get:  function(id)                     { return ((id instanceof HTMLElement) || (id === document)) ? id : document.getElementById(id); },
  set:  function(id, html)               { Dom.get(id).innerHTML = html;                        },
  on:   function(ele, type, fn, capture) { Dom.get(ele).addEventListener(type, fn, capture);    },
  un:   function(ele, type, fn, capture) { Dom.get(ele).removeEventListener(type, fn, capture); },
  show: function(ele, type)              { Dom.get(ele).style.display = (type || 'block');      },
  blur: function(ev)                     { ev.target.blur();                                    },

  addClassName:    function(ele, name)     { Dom.toggleClassName(ele, name, true);  },
  removeClassName: function(ele, name)     { Dom.toggleClassName(ele, name, false); },
  toggleClassName: function(ele, name, on) {
    ele = Dom.get(ele);
    var classes = ele.className.split(' ');
    var n = classes.indexOf(name);
    on = (typeof on == 'undefined') ? (n < 0) : on;
    if (on && (n < 0))
      classes.push(name);
    else if (!on && (n >= 0))
      classes.splice(n, 1);
    ele.className = classes.join(' ');
  },

  storage: window.localStorage || {}

}
```

Ponto de destaque: **`Dom.get` aceita tanto uma string de ID quanto um elemento já resolvido (ou
`document`)** — isso permite que o restante do código chame `Dom.get(ele)` despreocupadamente,
mesmo quando `ele` já é um `HTMLElement`, sem precisar checar o tipo em cada chamador (todos os
outros métodos de `Dom` fazem exatamente isso internamente).

`Dom.storage` é `window.localStorage`, com um objeto vazio `{}` como fallback se `localStorage` não
existir (navegadores muito antigos, ou execução em contexto sem storage) — evita `undefined` sendo
lançado ao tentar ler/gravar preferências. É usado para persistir o tempo de volta mais rápida
(`fast_lap_time`) e o estado de mudo (`muted`) entre sessões, ambos na v4.

`toggleClassName` implementa manualmente o que hoje seria `classList.toggle`/`add`/`remove` —
o código é de uma época em que `classList` não tinha suporte universal em navegadores.

## 6.2 `Util` — matemática e helpers gerais

```javascript
var Util = {

  timestamp:        function()                  { return new Date().getTime();                                    },
  toInt:            function(obj, def)          { if (obj !== null) { var x = parseInt(obj, 10); if (!isNaN(x)) return x; } return Util.toInt(def, 0); },
  toFloat:          function(obj, def)          { if (obj !== null) { var x = parseFloat(obj);   if (!isNaN(x)) return x; } return Util.toFloat(def, 0.0); },
  limit:            function(value, min, max)   { return Math.max(min, Math.min(value, max));                     },
  randomInt:        function(min, max)          { return Math.round(Util.interpolate(min, max, Math.random()));   },
  randomChoice:     function(options)           { return options[Util.randomInt(0, options.length-1)];            },
  percentRemaining: function(n, total)          { return (n%total)/total;                                         },
  accelerate:       function(v, accel, dt)      { return v + (accel * dt);                                        },
  interpolate:      function(a,b,percent)       { return a + (b-a)*percent                                        },
  easeIn:           function(a,b,percent)       { return a + (b-a)*Math.pow(percent,2);                           },
  easeOut:          function(a,b,percent)       { return a + (b-a)*(1-Math.pow(1-percent,2));                     },
  easeInOut:        function(a,b,percent)       { return a + (b-a)*((-Math.cos(percent*Math.PI)/2) + 0.5);        },
  exponentialFog:   function(distance, density) { return 1 / (Math.pow(Math.E, (distance * distance * density))); },

  increase:  function(start, increment, max) { // com looping
    var result = start + increment;
    while (result >= max) result -= max;
    while (result < 0)    result += max;
    return result;
  },

  project: function(p, cameraX, cameraY, cameraZ, cameraDepth, width, height, roadWidth) {
    p.camera.x     = (p.world.x || 0) - cameraX;
    p.camera.y     = (p.world.y || 0) - cameraY;
    p.camera.z     = (p.world.z || 0) - cameraZ;
    p.screen.scale = cameraDepth/p.camera.z;
    p.screen.x     = Math.round((width/2)  + (p.screen.scale * p.camera.x  * width/2));
    p.screen.y     = Math.round((height/2) - (p.screen.scale * p.camera.y  * height/2));
    p.screen.w     = Math.round(             (p.screen.scale * roadWidth   * width/2));
  },

  overlap: function(x1, w1, x2, w2, percent) {
    var half = (percent || 1)/2;
    var min1 = x1 - (w1*half);
    var max1 = x1 + (w1*half);
    var min2 = x2 - (w2*half);
    var max2 = x2 + (w2*half);
    return ! ((max1 < min2) || (min1 > max2));
  }

}
```

Cada função, em detalhe:

- **`toInt`/`toFloat`**: conversão segura de strings (vindas de `<input>`/`<select>` da tweak UI)
  para número, com um valor padrão de fallback caso a conversão falhe (`NaN`) — e, curiosamente, o
  próprio `def` também passa pela mesma validação recursivamente (`Util.toInt(def, 0)`), então
  mesmo o valor padrão é "sanitizado" antes de ser retornado.
- **`limit`**: clamping simples (`Math.max(min, Math.min(value, max))`) — usado para `playerX`,
  `speed`, e valores de sliders da tweak UI.
- **`randomInt`/`randomChoice`**: `randomInt` reaproveita `interpolate` para sortear um inteiro
  entre `min` e `max`; `randomChoice` sorteia um elemento de um array chamando `randomInt` com os
  limites de índice do array. Usadas extensivamente na v4 para variar sprites de cenário, posição e
  velocidade dos carros de tráfego.
- **`percentRemaining(n, total)`**: `(n % total) / total` — a fração de progresso de `n` dentro de
  um ciclo de tamanho `total`. É assim que se descobre "que fração do segmento atual já foi
  percorrida" (`basePercent`, `playerPercent`), usado tanto para interpolar altura/curvatura quanto
  para saber a posição relativa de um carro dentro do seu segmento (`car.percent`).
- **`accelerate(v, accel, dt)`**: `v + accel*dt` — uma integração de Euler de primeira ordem para
  velocidade. É a mesma fórmula usada tanto para acelerar quanto para frear/desacelerar/perder
  velocidade fora da pista — só muda o valor (positivo ou negativo) passado como `accel`.
- **`interpolate(a, b, percent)`**: interpolação linear simples entre dois valores. É o bloco
  básico sobre o qual `easeIn`/`easeOut`/`easeInOut` são construídos (todas recebem os mesmos três
  parâmetros `a, b, percent`, mas aplicam uma curva não-linear ao `percent` antes de interpolar).
- **`easeIn`**: `percent²` — começa devagar, acelera. Usado na *entrada* de curvas
  ([03](03-v2-curvas.md#32-curvas-com-entrada-e-saída-suaves-easing)).
- **`easeOut`**: `1-(1-percent)²` — começa rápido, desacelera até o fim. Definida, mas não chamada
  diretamente em nenhuma das quatro versões deste repositório (as curvas usam `easeIn` na entrada e
  `easeInOut` na saída; a altura dos morros usa `easeInOut` do início ao fim) — está disponível
  como parte do conjunto completo de funções de easing, para uso futuro/experimentação.
- **`easeInOut`**: baseada em cosseno, produz uma curva em "S" simétrica (lenta no início e no
  fim, rápida no meio) — usada tanto na saída de curvas quanto em toda a interpolação de altura dos
  morros (v3/v4).
- **`exponentialFog(distance, density)`**: `1 / e^(distance² * density)` — quanto maior a
  `distance` (normalizada `0..1`, fração de `drawDistance`) ou a `density`, mais próximo de `0` o
  resultado (mais neblina, menos visibilidade). O uso de `distance²` (em vez de `distance` linear)
  faz a neblina crescer lentamente no início e agressivamente perto do limite de desenho — evitando
  tanto neblina excessiva perto da câmera quanto um corte abrupto e visível no horizonte.
- **`increase(start, increment, max)`**: soma `increment` a `start`, mas faz *wrap-around*
  (usando `while`, não módulo direto, para lidar corretamente com `increment` negativo também) —
  garante que o resultado sempre fique no intervalo `[0, max)`. É assim que `position` faz a pista
  dar loop ao ultrapassar `trackLength`, e os offsets de parallax (`skyOffset` etc.) ficam sempre
  entre `0` e `1`.
- **`project`** (a função mais importante do arquivo): implementa exatamente as três etapas da
  teoria ([01, seção 1.2](01-teoria-pseudo-3d.md#12-três-etapas-formais-tradução--projeção--escalamento)):
  1. **Tradução**: `p.camera.{x,y,z} = p.world.{x,y,z} - camera{X,Y,Z}` (com `|| 0` para tratar
     coordenadas de mundo não definidas, como `x`/`y` na v1/v2, como zero implícito);
  2. **Projeção**: `p.screen.scale = cameraDepth / p.camera.z` — o fator `d/z` da teoria;
  3. **Escalamento**: `p.screen.x/y` centralizam a projeção normalizada na tela (`width/2`,
     `height/2`) e a multiplicam pela escala e pela metade da dimensão da tela; `p.screen.w`
     calcula a largura em pixels que `roadWidth` (ou a largura de um sprite, quando chamado de
     `Render.sprite`) ocupa na tela àquela distância.
  Note que o eixo Y é invertido (`height/2 - ...`, não `+`) porque coordenadas de mundo crescem
  "para cima" mas coordenadas de tela (canvas) crescem "para baixo".
- **`overlap(x1, w1, x2, w2, percent)`**: teste de sobreposição de dois intervalos 1D centrados em
  `x1`/`x2` com larguras `w1`/`w2`, com um fator de folga opcional `percent` (padrão `1` =
  100% da largura combinada; valores menores, como `0.8`, tornam a colisão "mais generosa",
  exigindo mais sobreposição real antes de contar como colisão — usado nas checagens de colisão
  carro-a-carro e carro-a-sprite da v4, e na IA de desvio dos carros de tráfego).

## 6.3 Polyfill de `requestAnimationFrame`

```javascript
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
                                 window.mozRequestAnimationFrame    ||
                                 window.oRequestAnimationFrame      ||
                                 window.msRequestAnimationFrame     ||
                                 function(callback, element) {
                                   window.setTimeout(callback, 1000 / 60);
                                 }
}
```

Um polyfill padrão da época (baseado no artigo clássico de Paul Irish, citado no próprio
comentário do código) para garantir que o game loop funcione mesmo em navegadores sem suporte
nativo a `requestAnimationFrame`, caindo para `setTimeout` a ~60fps como último recurso.

## 6.4 `Game` — o motor do loop, carregamento de imagens, teclado, stats e música

### `Game.run`

```javascript
run: function(options) {
  Game.loadImages(options.images, function(images) {
    options.ready(images);
    Game.setKeyListener(options.keys);

    var canvas = options.canvas, update = options.update, render = options.render,
        step = options.step, stats = options.stats,
        now = null, last = Util.timestamp(), dt = 0, gdt = 0;

    function frame() {
      now = Util.timestamp();
      dt  = Math.min(1, (now - last) / 1000); // requestAnimationFrame pode "hibernar" em abas em segundo plano
      gdt = gdt + dt;
      while (gdt > step) {
        gdt = gdt - step;
        update(step);
      }
      render();
      stats.update();
      last = now;
      requestAnimationFrame(frame, canvas);
    }
    frame();
    Game.playMusic();
  });
}
```

Este é o coração do fixed time step ([01](01-teoria-pseudo-3d.md), citado também em
[02](02-v1-estrada-reta.md#22-o-game-loop-de-passo-fixo-fixed-time-step)): `dt` é o tempo real
decorrido desde o último frame (em segundos, limitado a no máximo `1` segundo — o comentário
explica que abas em segundo plano podem fazer `requestAnimationFrame` "hibernar" e voltar com um
`dt` enorme, que sem esse limite quebraria a física simulando várias horas de jogo em um frame).
`gdt` (tempo "da dívida" acumulado) recebe esse `dt`, e o `while` interno chama `update(step)`
quantas vezes forem necessárias para "consumir" essa dívida em incrementos fixos — se o navegador
demorou mais que um `step` para chamar o próximo frame, `update` roda 2, 3 ou mais vezes seguidas
antes do próximo `render()`; se rodou mais rápido que 60fps, pode não chamar `update` nenhuma vez
neste frame específico. `render()`, por outro lado, roda sempre exatamente uma vez por frame de
tela — não há necessidade de renderizar múltiplas vezes, só o estado final importa visualmente.

### `Game.loadImages`

```javascript
loadImages: function(names, callback) {
  var result = [];
  var count  = names.length;

  var onload = function() {
    if (--count == 0)
      callback(result);
  };

  for(var n = 0 ; n < names.length ; n++) {
    var name = names[n];
    result[n] = document.createElement('img');
    Dom.on(result[n], 'load', onload);
    result[n].src = "images/" + name + ".png";
  }
}
```

Um contador regressivo simples (`count`) que só chama `callback` quando **todas** as imagens
pedidas (`["background", "sprites"]`, nas quatro versões) terminaram de carregar — um padrão
clássico pré-`Promise.all` para aguardar múltiplos carregamentos assíncronos.

### `Game.setKeyListener`

```javascript
setKeyListener: function(keys) {
  var onkey = function(keyCode, mode) {
    var n, k;
    for(n = 0 ; n < keys.length ; n++) {
      k = keys[n];
      k.mode = k.mode || 'up';
      if ((k.key == keyCode) || (k.keys && (k.keys.indexOf(keyCode) >= 0))) {
        if (k.mode == mode)
          k.action.call();
      }
    }
  };
  Dom.on(document, 'keydown', function(ev) { onkey(ev.keyCode, 'down'); } );
  Dom.on(document, 'keyup',   function(ev) { onkey(ev.keyCode, 'up');   } );
}
```

Traduz a lista declarativa de bindings passada em `options.keys` (ver
[02, seção 2.7](02-v1-estrada-reta.md#27-entrada-de-teclado)) em dois listeners globais de
`keydown`/`keyup`. Cada binding pode reagir a uma única tecla (`key`) ou uma lista de teclas
alternativas (`keys`, usado para aceitar tanto setas quanto WASD para a mesma ação) — e o `mode`
(`'down'` ou `'up'`, padrão `'up'`) decide se a ação dispara ao pressionar ou ao soltar.

### `Game.stats`

```javascript
stats: function(parentId, id) {
  var result = new Stats();
  result.domElement.id = id || 'stats';
  Dom.get(parentId).appendChild(result.domElement);

  var msg = document.createElement('div');
  msg.style.cssText = "border: 2px solid gray; padding: 5px; margin-top: 5px; text-align: left; font-size: 1.15em; text-align: right;";
  msg.innerHTML = "Your canvas performance is ";
  Dom.get(parentId).appendChild(msg);

  var value = document.createElement('span');
  value.innerHTML = "...";
  msg.appendChild(value);

  setInterval(function() {
    var fps   = result.current();
    var ok    = (fps > 50) ? 'good'  : (fps < 30) ? 'bad' : 'ok';
    var color = (fps > 50) ? 'green' : (fps < 30) ? 'red' : 'gray';
    value.innerHTML       = ok;
    value.style.color     = color;
    msg.style.borderColor = color;
  }, 5000);
  return result;
}
```

Constrói o widget de FPS de terceiros (mr.doob's `Stats`, de `stats.js`) e adiciona, ao lado dele,
uma mensagem amigável ("Your canvas performance is good/ok/bad") recalculada a cada 5 segundos —
uma forma simples de traduzir o número técnico de FPS em um veredito legível para o jogador, já
que o README do projeto é explícito sobre performance variar muito entre navegadores/GPUs.

### `Game.playMusic`

```javascript
playMusic: function() {
  var music = Dom.get('music');
  music.loop = true;
  music.volume = 0.05;
  music.muted = (Dom.storage.muted === "true");
  music.play();
  Dom.toggleClassName('mute', 'on', music.muted);
  Dom.on('mute', 'click', function() {
    Dom.storage.muted = music.muted = !music.muted;
    Dom.toggleClassName('mute', 'on', music.muted);
  });
}
```

Chamado ao final de `Game.run`, depois que o loop principal já começou. Configura o elemento
`<audio id="music">` para tocar em loop, baixo volume (`0.05`), respeita a preferência de mudo
salva anteriormente (`Dom.storage.muted`), e liga um botão de alternância que persiste a nova
preferência. Ver mais contexto em [05, seção 5.9](05-v4-final.md#59-música-e-mute).

## 6.5 `Render` — desenho no canvas

### `Render.polygon`

```javascript
polygon: function(ctx, x1, y1, x2, y2, x3, y3, x4, y4, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.lineTo(x4, y4);
  ctx.closePath();
  ctx.fill();
}
```

Um quadrilátero preenchido genérico — o bloco de construção usado por `Render.segment` para
desenhar cada faixa da pista (acostamento esquerdo, acostamento direito, superfície da pista,
faixas de sinalização) como um trapézio simples.

### `Render.segment`

```javascript
segment: function(ctx, width, lanes, x1, y1, w1, x2, y2, w2, fog, color) {

  var r1 = Render.rumbleWidth(w1, lanes), r2 = Render.rumbleWidth(w2, lanes),
      l1 = Render.laneMarkerWidth(w1, lanes), l2 = Render.laneMarkerWidth(w2, lanes),
      lanew1, lanew2, lanex1, lanex2, lane;

  ctx.fillStyle = color.grass;
  ctx.fillRect(0, y2, width, y1 - y2);

  Render.polygon(ctx, x1-w1-r1, y1, x1-w1, y1, x2-w2, y2, x2-w2-r2, y2, color.rumble);
  Render.polygon(ctx, x1+w1+r1, y1, x1+w1, y1, x2+w2, y2, x2+w2+r2, y2, color.rumble);
  Render.polygon(ctx, x1-w1,    y1, x1+w1, y1, x2+w2, y2, x2-w2,    y2, color.road);

  if (color.lane) {
    lanew1 = w1*2/lanes;
    lanew2 = w2*2/lanes;
    lanex1 = x1 - w1 + lanew1;
    lanex2 = x2 - w2 + lanew2;
    for(lane = 1 ; lane < lanes ; lanex1 += lanew1, lanex2 += lanew2, lane++)
      Render.polygon(ctx, lanex1 - l1/2, y1, lanex1 + l1/2, y1, lanex2 + l2/2, y2, lanex2 - l2/2, y2, color.lane);
  }

  Render.fog(ctx, 0, y1, width, y2-y1, fog);
}
```

Desenha um segmento inteiro em quatro camadas, de trás para frente:
1. **Grama**: um retângulo simples cobrindo toda a largura da tela na faixa vertical do segmento
   (`y1` a `y2`) — a grama "por trás" da pista de cada segmento, cor alternando entre
   `COLORS.LIGHT.grass`/`COLORS.DARK.grass` a cada `rumbleLength` segmentos (ver
   [6.6](#66-constantes-de-jogo-key-colors-background-sprites)).
2. **Rumble strips** (acostamentos listrados): dois trapézios, um de cada lado da pista, cuja
   largura é `rumbleWidth(w, lanes) = w / max(6, 2*lanes)` — proporcional à largura projetada da
   pista naquele ponto e inversamente proporcional ao número de faixas (mais faixas, acostamento
   relativamente mais fino).
3. **Superfície da pista**: um único trapézio entre `x-w` e `x+w` em ambas as bordas.
4. **Marcadores de faixa** (linhas centrais entre faixas de rodagem), desenhados só se
   `color.lane` existir (a cor `COLORS.START`/`COLORS.FINISH` não define `lane`, então a linha de
   largada/chegada não recebe marcadores de faixa sobrepostos) — um laço desenha `lanes-1`
   marcadores igualmente espaçados entre as bordas da pista, cada um com largura
   `laneMarkerWidth(w, lanes) = w / max(32, 8*lanes)`.

Por fim, `Render.fog` sobrepõe uma camada semi-transparente na cor de neblina, com opacidade
`1 - fog` (calculado por `Util.exponentialFog`) — mais opaca (mais neblina) para segmentos
distantes.

### `Render.background`

```javascript
background: function(ctx, background, width, height, layer, rotation, offset) {

  rotation = rotation || 0;
  offset   = offset   || 0;

  var imageW = layer.w/2;
  var imageH = layer.h;

  var sourceX = layer.x + Math.floor(layer.w * rotation);
  var sourceY = layer.y
  var sourceW = Math.min(imageW, layer.x+layer.w-sourceX);
  var sourceH = imageH;

  var destX = 0;
  var destY = offset;
  var destW = Math.floor(width * (sourceW/imageW));
  var destH = height;

  ctx.drawImage(background, sourceX, sourceY, sourceW, sourceH, destX, destY, destW, destH);
  if (sourceW < imageW)
    ctx.drawImage(background, layer.x, sourceY, imageW-sourceW, sourceH, destW-1, destY, width-destW, destH);
}
```

Cada camada de fundo (céu/colinas/árvores) é armazenada na imagem de fundo como o **dobro** da
largura da tela (`layer.w`), permitindo tratar a imagem como uma faixa **circular**: `rotation`
(0 a 1, o offset de parallax horizontal calculado em `update()`) escolhe qual fatia de largura
`imageW = layer.w/2` recortar, começando em `layer.x + layer.w*rotation`. Quando esse recorte
ultrapassaria a borda direita da faixa na textura (`sourceW < imageW`), a função desenha em **duas
chamadas de `drawImage`**: a primeira com o que sobrou até a borda da textura, a segunda voltando
ao início da faixa (`layer.x`) para completar o restante — criando um scroll horizontal
perfeitamente contínuo e sem costura, sem precisar desenhar a imagem duas vezes lado a lado no
canvas inteiro. `offset` (usado só a partir da v3) desloca a camada verticalmente, para o efeito de
subida/descida ao longo de morros (ver [04, seção 4.7](04-v3-colinas.md#47-render--o-que-de-fato-muda)).

### `Render.sprite`

```javascript
sprite: function(ctx, width, height, resolution, roadWidth, sprites, sprite, scale, destX, destY, offsetX, offsetY, clipY) {

  var destW  = (sprite.w * scale * width/2) * (SPRITES.SCALE * roadWidth);
  var destH  = (sprite.h * scale * width/2) * (SPRITES.SCALE * roadWidth);

  destX = destX + (destW * (offsetX || 0));
  destY = destY + (destH * (offsetY || 0));

  var clipH = clipY ? Math.max(0, destY+destH-clipY) : 0;
  if (clipH < destH)
    ctx.drawImage(sprites, sprite.x, sprite.y, sprite.w, sprite.h - (sprite.h*clipH/destH), destX, destY, destW, destH - clipH);
}
```

O tamanho final na tela (`destW`/`destH`) combina **duas** escalas: `scale` (o fator de projeção
`d/z` daquele ponto da pista — quanto mais distante, menor) **e** `SPRITES.SCALE * roadWidth`
(o fator que relaciona pixels da folha de sprites com unidades de mundo/`roadWidth`, ver
[05, seção 5.1](05-v4-final.md#51-sprites-a-folha-de-sprites-e-suas-coordenadas)) — assim, um
sprite parece do tamanho certo tanto em relação à distância (perspectiva) quanto em relação à
largura configurada da pista (tweak UI).

`offsetX`/`offsetY` são frações (`-1`, `-0.5`, `0`) que ajustam o ponto de ancoragem do sprite:
por exemplo, `offsetX = -0.5, offsetY = -1` (usado para o carro do jogador e carros de tráfego)
ancora o sprite pelo **centro horizontal, base vertical** — ou seja, `destX`/`destY` recebidos
representam onde o "centro-base" do sprite deve ficar, não seu canto superior esquerdo.

`clipY` implementa o recorte pelo horizonte mencionado em
[05, seção 5.6](05-v4-final.md#56-renderização-em-duas-passadas-segmentos-depois-spritescarros):
se o sprite ultrapassaria a linha `clipY` (calculada na primeira passada de renderização da pista),
`clipH` é a altura em pixels a cortar, e o `drawImage` correspondente recorta tanto a região de
origem (`sprite.h - proporção correspondente`) quanto o destino (`destH - clipH`) — se o corte
consumiria o sprite inteiro (`clipH >= destH`), a chamada de `drawImage` é pulada por completo.

### `Render.player`

```javascript
player: function(ctx, width, height, resolution, roadWidth, sprites, speedPercent, scale, destX, destY, steer, updown) {

  var bounce = (1.5 * Math.random() * speedPercent * resolution) * Util.randomChoice([-1,1]);
  var sprite;
  if (steer < 0)
    sprite = (updown > 0) ? SPRITES.PLAYER_UPHILL_LEFT : SPRITES.PLAYER_LEFT;
  else if (steer > 0)
    sprite = (updown > 0) ? SPRITES.PLAYER_UPHILL_RIGHT : SPRITES.PLAYER_RIGHT;
  else
    sprite = (updown > 0) ? SPRITES.PLAYER_UPHILL_STRAIGHT : SPRITES.PLAYER_STRAIGHT;

  Render.sprite(ctx, width, height, resolution, roadWidth, sprites, sprite, scale, destX, destY + bounce, -0.5, -1);
}
```

Escolhe um dos 6 sprites do carro do jogador combinando duas dimensões: **direção do esterço**
(`steer < 0` esquerda, `> 0` direita, `0` reto — o chamador passa `speed * (keyLeft ? -1 : keyRight
? 1 : 0)`, então isso também é zero quando parado) e **se está subindo ladeira** (`updown > 0` — a
diferença de altura entre as duas bordas do segmento do jogador, só relevante a partir da v3).
`bounce` adiciona um pequeno tremor vertical aleatório, proporcional à velocidade — mais rápido, mais
"trepidação" visual, um detalhe puramente estético que dá sensação de vibração/velocidade ao carro.

### `Render.fog`

```javascript
fog: function(ctx, x, y, width, height, fog) {
  if (fog < 1) {
    ctx.globalAlpha = (1-fog)
    ctx.fillStyle = COLORS.FOG;
    ctx.fillRect(x, y, width, height);
    ctx.globalAlpha = 1;
  }
}
```

Sobrepõe um retângulo semi-transparente na cor `COLORS.FOG` sobre a faixa vertical do segmento,
com opacidade `1 - fog` — só desenha algo se `fog < 1` (evita uma chamada de `fillRect`
desnecessária, com `globalAlpha = 0`, para segmentos totalmente visíveis/próximos).

### `Render.rumbleWidth`/`laneMarkerWidth`

```javascript
rumbleWidth:     function(projectedRoadWidth, lanes) { return projectedRoadWidth/Math.max(6,  2*lanes); },
laneMarkerWidth: function(projectedRoadWidth, lanes) { return projectedRoadWidth/Math.max(32, 8*lanes); }
```

Duas fórmulas simples e puramente estéticas — o `Math.max` garante uma largura mínima razoável de
acostamento/marcador mesmo com poucas faixas (1 ou 2), evitando que fiquem desproporcionalmente
largos.

## 6.6 Constantes de jogo: `KEY`, `COLORS`, `BACKGROUND`, `SPRITES`

```javascript
var KEY = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, A: 65, D: 68, S: 83, W: 87 };

var COLORS = {
  SKY:  '#72D7EE',
  TREE: '#005108',
  FOG:  '#005108',
  LIGHT:  { road: '#6B6B6B', grass: '#10AA10', rumble: '#555555', lane: '#CCCCCC'  },
  DARK:   { road: '#696969', grass: '#009A00', rumble: '#BBBBBB'                   },
  START:  { road: 'white',   grass: 'white',   rumble: 'white'                     },
  FINISH: { road: 'black',   grass: 'black',   rumble: 'black'                     }
};

var BACKGROUND = {
  HILLS: { x:   5, y:   5, w: 1280, h: 480 },
  SKY:   { x:   5, y: 495, w: 1280, h: 480 },
  TREES: { x:   5, y: 985, w: 1280, h: 480 }
};

var SPRITES = { /* ... coordenadas de recorte da folha de sprites, ver 05.1 ... */ };
```

- **`KEY`**: códigos de tecla (`keyCode`) nomeados — usado tanto pelas setas quanto por WASD (ver
  [02, seção 2.7](02-v1-estrada-reta.md#27-entrada-de-teclado)).
- **`COLORS`**: paletas por tipo de segmento — `LIGHT`/`DARK` alternam a cada `rumbleLength`
  segmentos (dando o efeito clássico "listrado" de asfalto), enquanto `START` (branco) e `FINISH`
  (preto) marcam a linha de largada e o padrão quadriculado da chegada. Note que `LIGHT` tem uma
  chave `lane` (cor dos marcadores de faixa) que `DARK`/`START`/`FINISH` não têm — é assim que
  `Render.segment` decide, via `if (color.lane)`, se desenha marcadores de faixa naquele segmento
  específico (só nos segmentos "claros" da alternância).
- **`BACKGROUND`**: coordenadas de recorte das três camadas de parallax dentro de
  `images/background.png` — cada camada ocupa uma faixa de 1280×480px (o dobro da largura da tela
  padrão, pela razão explicada em [`Render.background`](#renderbackground) acima), empilhadas
  verticalmente na textura (colinas, depois céu, depois árvores). Gerado por `rake resprite` a
  partir de `images/background/*.png` — não deve ser editado manualmente.
- **`SPRITES`**: detalhado em [05, seção 5.1](05-v4-final.md#51-sprites-a-folha-de-sprites-e-suas-coordenadas) — também gerado por `rake resprite`.

## 6.7 Visão geral: quem usa o quê

| Namespace/constante | Usado desde | Papel |
|---|---|---|
| `Dom` | v1 | Ler/escrever DOM, `localStorage`, classes CSS |
| `Util` | v1 | Matemática (projeção, easing, clamping, colisão, aleatoriedade) |
| `Game` | v1 | Loop principal, carregamento de imagens, teclado, FPS, música |
| `Render` | v1 | Todo o desenho no `<canvas>` |
| `KEY` | v1 | Códigos de tecla nomeados |
| `COLORS` | v1 | Paleta da pista |
| `BACKGROUND` | v1 | Recortes de parallax |
| `SPRITES` | v4 | Recortes de árvores/placas/carros/jogador (v1-v3 usam apenas o carro do jogador, que já está em `SPRITES.PLAYER_*`, mas não desenham sprites de cenário nem tráfego) |

Este é o fim da documentação de arquitetura. Para a progressão pedagógica completa (teoria → v1 →
v2 → v3 → v4), volte ao [índice](README.md).
