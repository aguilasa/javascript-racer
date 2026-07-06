# 05 — V4: Versão Final (`v4.final.html`)

> Fonte teórica: [v4 — Final](https://jakesgordon.com/writing/javascript-racer-v4-final/)
> Arquivo: [`v4.final.html`](../v4.final.html)

A v4 é a versão "completa" do jogo: herda tudo de v1-v3 (projeção, curvas, colinas) e adiciona os
elementos que fazem parecer um jogo de verdade — carros de tráfego com uma IA simples, sprites de
cenário (árvores, placas, pedras, arbustos), colisão contra ambos, um HUD com velocímetro e tempos
de volta, uma UI de ajuste (tweak UI) mais completa (incluindo número de faixas), e música com
botão de mute.

## 5.1 Sprites: a folha de sprites e suas coordenadas

Todos os elementos visuais fora da pista/carro-do-jogador (árvores, placas, pedras, os próprios
carros de tráfego) vêm de uma única imagem (`images/sprites.png`), com um mapa de coordenadas de
recorte gerado automaticamente (ver `Rakefile`, tarefa `resprite`, que usa a gem Ruby
`sprite_factory` para empacotar `images/sprites/*.png` em uma única folha e gerar
`images/sprites.js`):

```javascript
var SPRITES = {
  PALM_TREE:              { x:    5, y:    5, w:  215, h:  540 },
  BILLBOARD08:            { x:  230, y:    5, w:  385, h:  265 },
  TREE1:                  { x:  625, y:    5, w:  360, h:  360 },
  // ... dezenas de outras entradas (placas, troncos, pedras, arbustos, carros, jogador)
  CAR01:                  { x: 1205, y: 1018, w:   80, h:   56 },
  PLAYER_STRAIGHT:        { x: 1085, y:  480, w:   80, h:   41 },
  // ...
};

SPRITES.SCALE = 0.3 * (1/SPRITES.PLAYER_STRAIGHT.w); // largura de referência = 1/3 da (meia-)roadWidth

SPRITES.BILLBOARDS = [SPRITES.BILLBOARD01, /* ...*/, SPRITES.BILLBOARD09];
SPRITES.PLANTS     = [SPRITES.TREE1, SPRITES.TREE2, SPRITES.DEAD_TREE1, /* ... */];
SPRITES.CARS       = [SPRITES.CAR01, SPRITES.CAR02, SPRITES.CAR03, SPRITES.CAR04, SPRITES.SEMI, SPRITES.TRUCK];
```

`SPRITES.SCALE` é o fator que converte o tamanho em pixels do sprite na folha para uma proporção
comparável ao `roadWidth` — assim, ajustar `roadWidth` na tweak UI redimensiona a pista *e* os
sprites de forma coerente (o carro do jogador é usado como referência: sua largura deve equivaler a
1/3 da meia-largura da pista). Os arrays `SPRITES.BILLBOARDS`, `SPRITES.PLANTS` e `SPRITES.CARS`
são apenas listas de conveniência para sorteio aleatório (`Util.randomChoice`) ao popular a pista.

## 5.2 Sprites de cenário: `resetSprites()`

```javascript
function resetSprites() {
  var n, i;

  addSprite(20,  SPRITES.BILLBOARD07, -1);
  addSprite(40,  SPRITES.BILLBOARD06, -1);
  // ... mais placas fixas próximas ao início

  addSprite(240,                  SPRITES.BILLBOARD07, -1.2);
  addSprite(240,                  SPRITES.BILLBOARD06,  1.2);
  addSprite(segments.length - 25, SPRITES.BILLBOARD07, -1.2);
  addSprite(segments.length - 25, SPRITES.BILLBOARD06,  1.2);

  for(n = 10 ; n < 200 ; n += 4 + Math.floor(n/100)) {
    addSprite(n, SPRITES.PALM_TREE, 0.5 + Math.random()*0.5);
    addSprite(n, SPRITES.PALM_TREE,   1 + Math.random()*2);
  }

  for(n = 250 ; n < 1000 ; n += 5) {
    addSprite(n,     SPRITES.COLUMN, 1.1);
    addSprite(n + Util.randomInt(0,5), SPRITES.TREE1, -1 - (Math.random() * 2));
    addSprite(n + Util.randomInt(0,5), SPRITES.TREE2, -1 - (Math.random() * 2));
  }

  for(n = 200 ; n < segments.length ; n += 3) {
    addSprite(n, Util.randomChoice(SPRITES.PLANTS), Util.randomChoice([1,-1]) * (2 + Math.random() * 5));
  }

  var side, sprite, offset;
  for(n = 1000 ; n < (segments.length-50) ; n += 100) {
    side = Util.randomChoice([1, -1]);
    addSprite(n + Util.randomInt(0, 50), Util.randomChoice(SPRITES.BILLBOARDS), -side);
    for(i = 0 ; i < 20 ; i++) {
      sprite = Util.randomChoice(SPRITES.PLANTS);
      offset = side * (1.5 + Math.random());
      addSprite(n + Util.randomInt(0, 50), sprite, offset);
    }
  }
}
```

`addSprite(n, sprite, offset)` (definida ao lado de `addSegment`) apenas anexa `{ source: sprite,
offset: offset }` ao array `sprites` do segmento de índice `n`. O `offset` é a posição lateral
normalizada (mesma escala `-1..1`+ usada por `playerX`, mas sem limite superior — sprites podem
ficar bem longe da pista, como `-1.2` ou `2 + Math.random()*5`), sendo `-1`/`+1` aproximadamente a
borda da pista e valores maiores/menores posicionando o sprite mais para fora (na grama).

A função mistura três estratégias de povoamento:
- **posições fixas** (as billboards do início, calibradas manualmente);
- **loops determinísticos com incremento variável** (palmeiras a cada `4 + n/100` segmentos — o
  espaçamento aumenta com a distância, um truque para não desperdiçar sprites onde a neblina já
  os esconderia);
- **aleatoriedade controlada** (`Util.randomChoice`/`Util.randomInt`) para variar tipo de planta,
  lado da pista e distância, dando uma aparência orgânica sem exigir dados desenhados à mão para
  cada segmento da pista inteira.

## 5.3 Carros de tráfego: dados e criação

```javascript
var cars      = [];
var totalCars = 200;

function resetCars() {
  cars = [];
  var n, car, segment, offset, z, sprite, speed;
  for (var n = 0 ; n < totalCars ; n++) {
    offset = Math.random() * Util.randomChoice([-0.8, 0.8]);
    z      = Math.floor(Math.random() * segments.length) * segmentLength;
    sprite = Util.randomChoice(SPRITES.CARS);
    speed  = maxSpeed/4 + Math.random() * maxSpeed/(sprite == SPRITES.SEMI ? 4 : 2);
    car = { offset: offset, z: z, sprite: sprite, speed: speed };
    segment = findSegment(car.z);
    segment.cars.push(car);
    cars.push(car);
  }
}
```

Cada carro tem `offset` (posição lateral, sorteada perto de `±0.8`, ou seja, tende a ficar dentro
de uma faixa de rodagem plausível, não no meio da pista nem fora dela), `z` (posição absoluta,
sorteada em qualquer ponto do circuito), `sprite` (sorteado entre `SPRITES.CARS`) e `speed` (uma
velocidade base constante — os carros de tráfego **nunca aceleram nem freiam**, só mantêm uma
velocidade fixa sorteada; caminhões/`SEMI` recebem uma faixa de velocidade mais baixa que carros
comuns).

Note a estrutura de dados **duplicada de propósito**: `cars` (array plano, usado por
`updateCars` para iterar todos os carros do jogo) e `segment.cars` (array por segmento, usado por
`render()` para desenhar só os carros nos segmentos visíveis, e por `updateCarOffset` para checar
colisões apenas contra carros próximos) — um índice espacial simples que evita ter que checar
colisão de um carro contra todos os outros 199.

<p align="center">
<img src="img/indice-duplo-carros.svg" alt="Diagrama mostrando os mesmos objetos de carro referenciados tanto no array plano cars quanto nos buckets segment.cars por segmento" style="max-width:100%;height:auto;">
<br/><em>Figura 16 — cada carro é um único objeto JavaScript referenciado em dois lugares: no array
plano <code>cars</code> (para <code>updateCars</code> iterar todos) e no bucket
<code>segment.cars</code> do segmento onde ele está agora (índice espacial para colisão e
renderização). Mudar de segmento só realoca a referência entre buckets.</em>
</p>

## 5.4 Movimentação e IA simples dos carros: `updateCars`/`updateCarOffset`

```javascript
function updateCars(dt, playerSegment, playerW) {
  var n, car, oldSegment, newSegment;
  for(n = 0 ; n < cars.length ; n++) {
    car         = cars[n];
    oldSegment  = findSegment(car.z);
    car.offset  = car.offset + updateCarOffset(car, oldSegment, playerSegment, playerW);
    car.z       = Util.increase(car.z, dt * car.speed, trackLength);
    car.percent = Util.percentRemaining(car.z, segmentLength); // útil para interpolação na renderização
    newSegment  = findSegment(car.z);
    if (oldSegment != newSegment) {
      index = oldSegment.cars.indexOf(car);
      oldSegment.cars.splice(index, 1);
      newSegment.cars.push(car);
    }
  }
}
```

A cada frame de update, todo carro:
1. avança em Z proporcionalmente à sua própria `speed` (nunca muda — sem aceleração/frenagem);
2. tem seu `offset` lateral ajustado por `updateCarOffset` (o "esterço" da IA, ver abaixo);
3. é **realocado** entre os arrays `cars` de segmento quando cruza de um segmento para outro
   (`splice` do array antigo, `push` no novo) — mantendo o índice espacial (seção 5.3) sempre
   correto.

```javascript
function updateCarOffset(car, carSegment, playerSegment, playerW) {

  var i, j, dir, segment, otherCar, otherCarW, lookahead = 20, carW = car.sprite.w * SPRITES.SCALE;

  // otimização: não gasta esterço em carros 'fora de vista' do jogador
  if ((carSegment.index - playerSegment.index) > drawDistance)
    return 0;

  for(i = 1 ; i < lookahead ; i++) {
    segment = segments[(carSegment.index+i)%segments.length];

    if ((segment === playerSegment) && (car.speed > speed) && (Util.overlap(playerX, playerW, car.offset, carW, 1.2))) {
      if (playerX > 0.5)       dir = -1;
      else if (playerX < -0.5) dir = 1;
      else                      dir = (car.offset > playerX) ? 1 : -1;
      return dir * 1/i * (car.speed-speed)/maxSpeed;
    }

    for(j = 0 ; j < segment.cars.length ; j++) {
      otherCar  = segment.cars[j];
      otherCarW = otherCar.sprite.w * SPRITES.SCALE;
      if ((car.speed > otherCar.speed) && Util.overlap(car.offset, carW, otherCar.offset, otherCarW, 1.2)) {
        if (otherCar.offset > 0.5)       dir = -1;
        else if (otherCar.offset < -0.5) dir = 1;
        else                              dir = (car.offset > otherCar.offset) ? 1 : -1;
        return dir * 1/i * (car.speed-otherCar.speed)/maxSpeed;
      }
    }
  }

  // sem carros à frente, mas se de alguma forma saiu da pista, esterça de volta
  if (car.offset < -0.9)      return 0.1;
  else if (car.offset > 0.9)  return -0.1;
  else                         return 0;
}
```

A "IA" é deliberadamente simples e reativa, sem planejamento nem memória entre frames:

1. **Otimização de distância**: carros em segmentos além de `drawDistance` do jogador nem sequer
   calculam esterço — não importam visualmente, e economiza CPU (o gargalo com 200 carros seria
   real em navegadores mais fracos).
2. **Lookahead fixo de 20 segmentos**: o carro "olha" até 20 segmentos à frente de si (não em
   distância absoluta, em quantidade de segmentos), checando dois tipos de obstáculo:
   - **o próprio jogador**, se o segmento sob análise for exatamente o segmento onde o jogador
     está, o carro é mais rápido que o jogador, e há sobreposição lateral (`Util.overlap`, com uma
     folga de `1.2`× a largura combinada);
   - **outro carro de tráfego** no mesmo segmento sob análise, com a mesma lógica de "sou mais
     rápido e estou prestes a colidir por trás".
3. **Direção do desvio**: se o obstáculo está à direita (`offset > 0.5`), esterça para a esquerda
   (`dir = -1`), e vice-versa; se está relativamente centralizado, esterça para o lado oposto de
   onde o obstáculo está exatamente (comparação direta de `offset`).
4. **Magnitude do desvio**:
   ```
   dir * 1/i * (velocidade_do_carro - velocidade_do_obstáculo) / maxSpeed
   ```
   Quanto **mais perto** o obstáculo (`i` pequeno, poucos segmentos à frente), maior o esterço
   (`1/i` cresce). Quanto **maior a diferença de velocidade** (o carro está se aproximando rápido
   do obstáculo mais lento), maior o esterço. Isso produz um comportamento plausível: desvios
   suaves e antecipados quando o obstáculo está longe/a velocidade parecida, desvios bruscos
   quando a colisão é iminente.
5. Se **nenhum** obstáculo é encontrado em todo o lookahead, mas o próprio carro por acaso está
   fora da pista (`|offset| > 0.9`), ele esterça de volta lentamente para dentro (`±0.1` fixo) — um
   fallback de "autocorreção" para não deixar carros perdidos na grama indefinidamente.

<p align="center">
<img src="img/ia-carros-lookahead-esterco.svg" alt="Diagrama top-down mostrando a janela de lookahead de 20 segmentos, um obstáculo detectado, e o vetor de esterço calculado a partir da distância e diferença de offset lateral" style="max-width:100%;height:auto;">
<br/><em>Figura 17 — a IA olha até 20 segmentos à frente (eixo horizontal = distância `i`, eixo
vertical = offset lateral). Ao detectar um obstáculo mais lento, o esterço aponta para o lado
oposto de onde ele está, com magnitude proporcional a <code>1/i</code> (mais perto = mais brusco) e
à diferença de velocidade.</em>
</p>

## 5.5 `update(dt)` completo: física do jogador + colisão + tempos de volta

```javascript
function update(dt) {

  var n, car, carW, sprite, spriteW;
  var playerSegment = findSegment(position+playerZ);
  var playerW       = SPRITES.PLAYER_STRAIGHT.w * SPRITES.SCALE;
  var speedPercent  = speed/maxSpeed;
  var dx            = dt * 2 * speedPercent;
  var startPosition = position;

  updateCars(dt, playerSegment, playerW);

  position = Util.increase(position, dt * speed, trackLength);

  if (keyLeft)  playerX = playerX - dx;
  else if (keyRight) playerX = playerX + dx;

  playerX = playerX - (dx * speedPercent * playerSegment.curve * centrifugal);

  if (keyFaster)      speed = Util.accelerate(speed, accel, dt);
  else if (keySlower) speed = Util.accelerate(speed, breaking, dt);
  else                speed = Util.accelerate(speed, decel, dt);

  if ((playerX < -1) || (playerX > 1)) {

    if (speed > offRoadLimit)
      speed = Util.accelerate(speed, offRoadDecel, dt);

    for(n = 0 ; n < playerSegment.sprites.length ; n++) {
      sprite  = playerSegment.sprites[n];
      spriteW = sprite.source.w * SPRITES.SCALE;
      if (Util.overlap(playerX, playerW, sprite.offset + spriteW/2 * (sprite.offset > 0 ? 1 : -1), spriteW)) {
        speed = maxSpeed/5;
        position = Util.increase(playerSegment.p1.world.z, -playerZ, trackLength); // para na frente do sprite
        break;
      }
    }
  }

  for(n = 0 ; n < playerSegment.cars.length ; n++) {
    car  = playerSegment.cars[n];
    carW = car.sprite.w * SPRITES.SCALE;
    if (speed > car.speed) {
      if (Util.overlap(playerX, playerW, car.offset, carW, 0.8)) {
        speed    = car.speed * (car.speed/speed);
        position = Util.increase(car.z, -playerZ, trackLength);
        break;
      }
    }
  }

  playerX = Util.limit(playerX, -3, 3);
  speed   = Util.limit(speed, 0, maxSpeed);

  skyOffset  = Util.increase(skyOffset,  skySpeed  * playerSegment.curve * (position-startPosition)/segmentLength, 1);
  hillOffset = Util.increase(hillOffset, hillSpeed * playerSegment.curve * (position-startPosition)/segmentLength, 1);
  treeOffset = Util.increase(treeOffset, treeSpeed * playerSegment.curve * (position-startPosition)/segmentLength, 1);

  if (position > playerZ) {
    if (currentLapTime && (startPosition < playerZ)) {
      lastLapTime    = currentLapTime;
      currentLapTime = 0;
      if (lastLapTime <= Util.toFloat(Dom.storage.fast_lap_time)) {
        Dom.storage.fast_lap_time = lastLapTime;
        updateHud('fast_lap_time', formatTime(lastLapTime));
        Dom.addClassName('fast_lap_time', 'fastest');
        Dom.addClassName('last_lap_time', 'fastest');
      } else {
        Dom.removeClassName('fast_lap_time', 'fastest');
        Dom.removeClassName('last_lap_time', 'fastest');
      }
      updateHud('last_lap_time', formatTime(lastLapTime));
      Dom.show('last_lap_time');
    } else {
      currentLapTime += dt;
    }
  }

  updateHud('speed',            5 * Math.round(speed/500));
  updateHud('current_lap_time', formatTime(currentLapTime));
}
```

O que há de novo em relação à v3:

1. **`updateCars(dt, ...)` é chamado primeiro**, antes de mover o próprio jogador — os carros de
   tráfego se movem de forma independente do jogador.
2. **Colisão contra sprites de cenário** (placas, árvores, pedras): só é checada quando o jogador
   está **fora da pista** (`playerX < -1 || > 1`) — sprites de cenário ficam todos fora da faixa de
   rodagem, então isso evita checar sobreposição desnecessariamente enquanto dirigindo normalmente.
   Ao colidir, a velocidade cai bruscamente para `maxSpeed/5` e a posição é "puxada" de volta para
   o início do segmento atual (`playerSegment.p1.world.z`, ajustado por `-playerZ` porque
   `position` é a posição da câmera, não do carro) — simula parar na frente do obstáculo em vez de
   atravessá-lo.
3. **Colisão contra carros de tráfego**: checada sempre (dentro ou fora da pista), mas só quando o
   jogador está mais rápido que o carro à frente (`speed > car.speed`) — do contrário, o jogador
   nunca alcançaria o carro e não haveria colisão física real. Ao colidir, a velocidade do jogador
   é reduzida para `car.speed * (car.speed/speed)` (uma penalidade proporcional a quão mais rápido
   o jogador estava — quanto maior a diferença, mais brusca a "batida") e a posição volta para logo
   atrás do carro atingido.
4. **`playerX` agora é limitado a `[-3, 3]`** (era `[-2, 2]` nas versões anteriores) — mais margem
   fora da pista, provavelmente para acomodar os sprites de cenário mais distantes adicionados
   nesta versão.
5. **Offsets de parallax agora usam `(position-startPosition)/segmentLength`** em vez de
   `speedPercent` diretamente (v2/v3) — usando a distância *real* percorrida neste frame
   (considerando que colisões podem ter alterado `position` no meio do update), o que é mais
   preciso quando uma colisão acabou de "teletransportar" o jogador de volta.
6. **Cronometragem de volta**: quando `position` cruza `playerZ` (ou seja, a linha de
   partida/chegada), se já havia uma volta em andamento (`currentLapTime` truthy) e o
   `startPosition` deste frame estava antes da linha (`startPosition < playerZ` — confirma que
   realmente *cruzamos* a linha neste frame, não que já estávamos além dela), a volta é fechada:
   `lastLapTime` recebe o tempo, comparado com o recorde salvo em `Dom.storage.fast_lap_time`
   (persistido em `localStorage`, sobrevive a recarregar a página), atualizando classes CSS
   (`fastest`) para destacar visualmente um novo recorde. Caso contrário, o cronômetro da volta
   atual simplesmente incrementa (`currentLapTime += dt`).
7. **Atualização do HUD**: velocidade (arredondada para múltiplos de 5, escalada por `/500`, uma
   calibração puramente visual para exibir "mph" plausíveis) e o tempo da volta atual.

## 5.6 Renderização em duas passadas (segmentos, depois sprites/carros)

`render()` na v4 segue a mesma estrutura de v3 para a pista (primeira passada, da câmera para o
horizonte, desenhando `Render.segment` e calculando `maxy`), mas adiciona uma **segunda passada**,
de trás para frente, para os sprites de cenário e carros:

```javascript
for(n = (drawDistance-1) ; n > 0 ; n--) {
  segment = segments[(baseSegment.index + n) % segments.length];

  for(i = 0 ; i < segment.cars.length ; i++) {
    car         = segment.cars[i];
    sprite      = car.sprite;
    spriteScale = Util.interpolate(segment.p1.screen.scale, segment.p2.screen.scale, car.percent);
    spriteX     = Util.interpolate(segment.p1.screen.x,     segment.p2.screen.x,     car.percent) + (spriteScale * car.offset * roadWidth * width/2);
    spriteY     = Util.interpolate(segment.p1.screen.y,     segment.p2.screen.y,     car.percent);
    Render.sprite(ctx, width, height, resolution, roadWidth, sprites, car.sprite, spriteScale, spriteX, spriteY, -0.5, -1, segment.clip);
  }

  for(i = 0 ; i < segment.sprites.length ; i++) {
    sprite      = segment.sprites[i];
    spriteScale = segment.p1.screen.scale;
    spriteX     = segment.p1.screen.x + (spriteScale * sprite.offset * roadWidth * width/2);
    spriteY     = segment.p1.screen.y;
    Render.sprite(ctx, width, height, resolution, roadWidth, sprites, sprite.source, spriteScale, spriteX, spriteY, (sprite.offset < 0 ? -1 : 0), -1, segment.clip);
  }

  if (segment == playerSegment) {
    Render.player(ctx, width, height, resolution, roadWidth, sprites, speed/maxSpeed,
                  cameraDepth/playerZ, width/2,
                  (height/2) - (cameraDepth/playerZ * Util.interpolate(playerSegment.p1.camera.y, playerSegment.p2.camera.y, playerPercent) * height/2),
                  speed * (keyLeft ? -1 : keyRight ? 1 : 0),
                  playerSegment.p2.world.y - playerSegment.p1.world.y);
  }
}
```

Por quê **duas passadas** (e a segunda em ordem **inversa**, do segmento mais distante ao mais
próximo)?

- A primeira passada (câmera → horizonte) desenha os polígonos da pista e calcula `segment.clip`
  (o valor de `maxy` no momento em que aquele segmento foi desenhado) — a linha do horizonte visível
  para aquele segmento específico, usada para recortar sprites que ultrapassariam um morro à
  frente.
- A segunda passada roda **de trás para frente** (do mais distante para o mais próximo) para
  implementar o **algoritmo do pintor** corretamente para os sprites: sprites em segmentos mais
  distantes precisam ser desenhados **antes** dos mais próximos, para que os próximos os
  sobreponham corretamente (senão uma árvore distante apareceria por cima de uma placa próxima).
- Carros são interpolados dentro do segmento pela fração `car.percent` (calculada em
  `updateCars`), já que um carro raramente está exatamente na borda `p1` ou `p2` do segmento — sua
  escala e posição de tela são uma mistura ponderada entre as duas bordas projetadas.
- Sprites de cenário (fixos, sem `percent`) usam sempre a escala/posição da borda `p1` do
  segmento — suficiente porque não se movem dentro do segmento.
- `Render.sprite` recebe `segment.clip` para recortar a parte do sprite que ultrapassaria o
  horizonte calculado na primeira passada (essencial em terrenos com morros, onde um sprite alto
  atrás de uma subida precisa ser cortado na linha do morro, não desenhado por cima dele).
- O carro do próprio jogador é desenhado **dentro do loop**, no momento exato em que
  `segment == playerSegment` — garantindo que ele seja pintado na ordem correta relativa a
  sprites/carros no mesmo segmento (por exemplo, um carro de tráfego bem próximo ao jogador no
  mesmo segmento).

<p align="center">
<img src="img/render-duas-passadas.svg" alt="Diagrama das duas passadas de render(): a primeira desenha a pista do mais próximo ao mais distante calculando segment.clip; a segunda desenha sprites e carros do mais distante ao mais próximo, usando esse clip" style="max-width:100%;height:auto;">
<br/><em>Figura 18 — a passada 1 (pista) vai do segmento mais próximo ao mais distante e registra
<code>segment.clip</code>; a passada 2 (sprites/carros) percorre os mesmos segmentos em ordem
<strong>inversa</strong> (algoritmo do pintor) e usa esse <code>clip</code> para recortar qualquer
sprite que ultrapasse o horizonte já desenhado.</em>
</p>

## 5.7 HUD (velocímetro e tempos de volta)

```html
<div id="hud">
  <span id="speed"            class="hud"><span id="speed_value" class="value">0</span> mph</span>
  <span id="current_lap_time" class="hud">Time: <span id="current_lap_time_value" class="value">0.0</span></span>
  <span id="last_lap_time"    class="hud">Last Lap: <span id="last_lap_time_value" class="value">0.0</span></span>
  <span id="fast_lap_time"    class="hud">Fastest Lap: <span id="fast_lap_time_value" class="value">0.0</span></span>
</div>
```

```javascript
var hud = {
  speed:            { value: null, dom: Dom.get('speed_value')            },
  current_lap_time: { value: null, dom: Dom.get('current_lap_time_value') },
  last_lap_time:    { value: null, dom: Dom.get('last_lap_time_value')    },
  fast_lap_time:    { value: null, dom: Dom.get('fast_lap_time_value')    }
}

function updateHud(key, value) { // acessar o DOM pode ser lento, então só faz se o valor mudou
  if (hud[key].value !== value) {
    hud[key].value = value;
    Dom.set(hud[key].dom, value);
  }
}

function formatTime(dt) {
  var minutes = Math.floor(dt/60);
  var seconds = Math.floor(dt - (minutes * 60));
  var tenths  = Math.floor(10 * (dt - Math.floor(dt)));
  if (minutes > 0)
    return minutes + "." + (seconds < 10 ? "0" : "") + seconds + "." + tenths;
  else
    return seconds + "." + tenths;
}
```

A otimização de `updateHud` — só tocar o DOM (`innerHTML`) quando o valor realmente mudou — evita
um custo de reflow/repaint desnecessário rodando a 60 quadros por segundo; a maior parte dos frames
o velocímetro exibe exatamente o mesmo número arredondado, então a atualização de DOM é pulada na
maioria dos casos.

`formatTime` formata segundos decimais em `M.SS.T` (minutos, segundos com zero à esquerda, décimo
de segundo) ou apenas `S.T` se menos de um minuto — o suficiente para tempos de volta de um jogo de
arcade, sem exigir uma biblioteca de formatação de datas.

## 5.8 Tweak UI: faixas (`lanes`) e reinicialização condicional da pista

A tweak UI de v4 é a mesma estrutura de v1-v3 (resolução, largura da pista, altura da câmera,
distância de desenho, campo de visão, densidade de neblina — todas manipulando `reset(options)`),
acrescida do controle de **número de faixas** (`lanes`), que afeta apenas a divisão visual da pista
em `Render.segment` (linhas centrais), sem exigir reconstrução da geometria dos segmentos:

```javascript
Dom.on('lanes', 'change', function(ev) { Dom.blur(ev); reset({ lanes: ev.target.options[ev.target.selectedIndex].value }); });
```

## 5.9 Música e mute

```javascript
playMusic: function() {
  var music = Dom.get('music');
  music.loop = true;
  music.volume = 0.05; // shhhh! música meio incômoda!
  music.muted = (Dom.storage.muted === "true");
  music.play();
  Dom.toggleClassName('mute', 'on', music.muted);
  Dom.on('mute', 'click', function() {
    Dom.storage.muted = music.muted = !music.muted;
    Dom.toggleClassName('mute', 'on', music.muted);
  });
}
```

(Esta função vive em `common.js`, dentro do namespace `Game` — ver
[06](06-arquitetura-common-js.md#gameplaymusic) — mas só é efetivamente usada/visível a partir da
v4, já que é chamada ao final de `Game.run`, depois que o `<audio>`/botão de mute existem no HTML.)
O estado de mudo é persistido em `Dom.storage` (`localStorage`), então a preferência do jogador
sobrevive a recarregar a página — o mesmo mecanismo usado para o recorde de volta mais rápida
(`fast_lap_time`).

## 5.10 O traçado do circuito final

`resetRoad()` na v4 é o traçado mais longo e variado entre as quatro versões, combinando retas,
S-curves, morros, ondulações e uma curva longa antes do final, além de chamar `resetSprites()` e
`resetCars()` (ausentes em v1-v3) logo depois de montar a geometria:

```javascript
function resetRoad() {
  segments = [];

  addStraight(ROAD.LENGTH.SHORT);
  addLowRollingHills();
  addSCurves();
  addCurve(ROAD.LENGTH.MEDIUM, ROAD.CURVE.MEDIUM, ROAD.HILL.LOW);
  addBumps();
  addLowRollingHills();
  addCurve(ROAD.LENGTH.LONG*2, ROAD.CURVE.MEDIUM, ROAD.HILL.MEDIUM);
  addStraight();
  addHill(ROAD.LENGTH.MEDIUM, ROAD.HILL.HIGH);
  addSCurves();
  addCurve(ROAD.LENGTH.LONG, -ROAD.CURVE.MEDIUM, ROAD.HILL.NONE);
  addHill(ROAD.LENGTH.LONG, ROAD.HILL.HIGH);
  addCurve(ROAD.LENGTH.LONG, ROAD.CURVE.MEDIUM, -ROAD.HILL.LOW);
  addBumps();
  addHill(ROAD.LENGTH.LONG, -ROAD.HILL.MEDIUM);
  addStraight();
  addSCurves();
  addDownhillToEnd();

  resetSprites();
  resetCars();

  // START/FINISH e trackLength, como nas versões anteriores
}
```

`addBumps()` é uma função nova nesta versão — uma sequência curta e irregular de pequenas subidas e
descidas (sem curva) para simular um trecho de pista esburacada/ondulada de perto:

```javascript
function addBumps() {
  addRoad(10, 10, 10, 0,  5);
  addRoad(10, 10, 10, 0, -2);
  addRoad(10, 10, 10, 0, -5);
  addRoad(10, 10, 10, 0,  8);
  addRoad(10, 10, 10, 0,  5);
  addRoad(10, 10, 10, 0, -7);
  addRoad(10, 10, 10, 0,  5);
  addRoad(10, 10, 10, 0, -2);
}
```

## 5.11 Ideias de expansão listadas pelo próprio autor

O artigo da v4 (e o README do projeto) deixam explícito que esta versão é um ponto de partida, não
um jogo "terminado". Entre as ideias de expansão futura mencionadas pelo autor: efeitos sonoros de
motor, música melhor sincronizada, modo tela cheia, HUD com efeitos (flash na volta mais rápida,
confete, velocímetro colorido), colisão de sprite mais precisa, IA de carros mais inteligente
(com frenagem/aceleração real), um acidente de verdade em colisões de alta velocidade, mais quique
ao sair da pista, tremor de tela em colisões/fora-de-pista, partículas de poeira fora da pista,
câmera mais dinâmica (mais baixa em alta velocidade, sobrevoo em morros), detecção automática de
resolução/distância de desenho, múltiplos estágios/mapas, um mapa da volta com indicador de
posição, bifurcações/junções na pista, ciclo dia/noite, efeitos climáticos, túneis/pontes/nuvens/
paredes/prédios, cenários de cidade/deserto/oceano, carros "adversários" (além do tráfego passivo
atual), e modos de jogo alternativos (volta mais rápida, corrida 1-contra-1, coletar moedas). Nada
disso está implementado neste repositório — são sugestões do autor para quem quiser evoluir o
projeto.

## 5.12 Próximo passo

O capítulo [06 — Arquitetura de `common.js`](06-arquitetura-common-js.md) detalha, função por
função, todo o código compartilhado que sustenta as quatro versões: os namespaces `Dom`, `Util`,
`Game` e `Render`, e as constantes globais (`KEY`, `COLORS`, `BACKGROUND`, `SPRITES`).
