# Upscaling de sprites de Mega Drive — validação e guia prático

> Este documento analisa a resposta de IA colada pelo usuário sobre ferramentas de upscaling de
> sprites, corrige imprecisões, e propõe um workflow adequado especificamente para **sprites de
> jogos de Mega Drive** (pixel art de baixa resolução, paleta indexada de 16 cores, bordas duras,
> sem anti-aliasing).

## TL;DR

A resposta original mistura duas famílias de problemas diferentes:

1. **Upscaling de arte anime/ilustração** (waifu2x, Real-ESRGAN, Real-CUGAN, Anime4K) — feito
   para line-art com anti-aliasing suave.
2. **Upscaling de pixel art retro** (hqx, xBRZ, modelos ESRGAN treinados especificamente em
   sprites) — feito para arte com bordas duras, sem anti-aliasing, paleta limitada.

**Sprites de Mega Drive pertencem à categoria 2, não à 1.** Rodar waifu2x ou Real-ESRGAN
genérico (o que a resposta recomendou como primeiro passo) tende a borrar bordas e "inventar"
anti-aliasing que nunca existiu no sprite original, descaracterizando o estilo de 16-bit. Esse é
o ponto mais importante a corrigir antes de aplicar o workflow sugerido.

---

## 1. O que a resposta acertou

- **Aseprite** e **Pixelorama** — corretos, são os editores padrão da comunidade para
  pós-processamento manual de pixel art. Aseprite é pago (~US$20, licença única), Pixelorama é
  gratuito e open-source (Godot-based).
- **Real-ESRGAN** existe e é amplamente usado (Xintao Wang et al.), mas veja a ressalva na seção 2
  — o modelo genérico é treinado para fotos/anime, não pixel art.
- **Waifu2x** existe e ainda é relevante, mas para o *seu* caso de uso (bordas duras, paleta
  indexada) não é a ferramenta ideal — foi desenhado para suavizar/reduzir ruído em ilustrações
  com anti-aliasing.
- **Stable Diffusion + "Pixel Art XL" LoRA** existe de fato (LoRA de nerijs, disponível no
  Civitai/HuggingFace). Correto como ferramenta de *recriação* estilizada, não de upscaling fiel.
- **PixelLab AI** (pixellab.ai) existe e é bem avaliado — mas é uma ferramenta de **geração** de
  assets pixel art (personagens direcionais, animações, tilesets) com integração via plugin do
  Aseprite, não um upscaler de sprites existentes. Não é a ferramenta certa se você quer preservar
  fielmente o sprite original do Mega Drive.
- **GIMP** — correto como editor genérico de apoio.

## 2. O que estava impreciso ou fora de contexto

### Waifu2x / Real-ESRGAN / Real-CUGAN / Anime4K não são ideais para pixel art de 16-bit

Esses modelos foram treinados em datasets de **ilustração anime com anti-aliasing** (linhas
suavizadas, gradientes). Aplicados a um sprite de Mega Drive (pixels quadrados, sem AA, paleta de
até 16 cores por sprite), o resultado comum é:

- bordas que deveriam ser retas ficam onduladas/borradas;
- surgimento de "ruído"/artefatos de cor nas transições de pixel;
- perda do caráter "quadriculado" que dá identidade ao sprite original.

Isso não invalida completamente essas ferramentas (podem servir como *passo opcional* de
suavização depois de já ter escalado com um algoritmo correto — ver workflow), mas colocá-las como
**primeiro passo**, como a resposta sugeriu, está errado para este caso de uso.

### **Waifu2x-Extension-GUI** ainda existe, mas não é mais a ferramenta mais recomendada

O projeto (`AaronFeng753/Waifu2x-Extension-GUI` no GitHub) existe e funciona, mas a comunidade de
upscaling de pixel art hoje converge para o **chaiNNer** (ver seção 3), que é mais flexível, ativo,
e dá acesso direto ao catálogo de modelos do OpenModelDB — incluindo modelos treinados
especificamente em pixel art, o que o Waifu2x-Extension-GUI não oferece nativamente.

### "OpenArt Pixel Art Upscaler" — existe, mas é um serviço fechado (cloud, pago/limitado)

Confirmei que existe em openart.ai. Funciona, mas por ser um serviço fechado você não sabe qual
modelo está por trás nem tem controle fino — para um projeto de jogo onde consistência entre
dezenas de sprites importa, uma ferramenta local com modelo conhecido (chaiNNer) dá resultado mais
previsível e repetível.

### "Sprite AI" (sprite-ai.art) — a resposta descreveu errado

O site existe, mas faz o **caminho inverso** do que a resposta descreveu: ele converte uma imagem
comum **em** pixel art (downscale + quantização de paleta para 8×8–128×128), não faz upscaling de
um sprite pixel art já existente. Não é a ferramenta certa para o seu caso.

### Faltou por completo: algoritmos clássicos de scaling de pixel art

Este é o maior buraco na resposta original. Existe uma família de algoritmos criada
especificamente para escalar pixel art preservando bordas duras — usada há décadas em
emuladores (RetroArch, ScummVM, etc.):

| Algoritmo | Ano | Característica |
|---|---|---|
| **Scale2x/Scale3x (EPX/AdvMAME)** | ~2001 | Mais simples, detecção de borda básica |
| **Eagle** | ~1990s | Similar ao Scale2x, usado em emuladores antigos |
| **hqx (hq2x/hq3x/hq4x)** | 2003, Maxim Stepin | Compara cada pixel a 8 vizinhos em espaço YUV, gera bordas suavizadas (o "look" clássico de emulador) |
| **xBR** (Hyllian, 2011) | Interpolação em 2 estágios, lida melhor com curvas/diagonais que hqx |
| **xBRZ** (Zenju, 2012+) | Otimizado para multi-core, 40–60% mais rápido que hqx, suporta canal alfa, escala de 2x a 6x — **geralmente a melhor escolha algorítmica hoje** |

Essas ferramentas **não usam IA** — são determinísticas e não inventam detalhe, só interpolam de
forma inteligente. Para sprites de Mega Drive isso costuma dar resultado mais fiel do que um
modelo de IA genérico.

Sources: [Pixel-art scaling algorithms — Wikipedia](https://en.wikipedia.org/wiki/Pixel-art_scaling_algorithms), [libxbr-standalone](https://github.com/Treeki/libxbr-standalone), [Pixel Art Scaler (Lospec)](https://lospec.com/pixel-art-scaler/)

## 3. Ferramentas recomendadas (atualizadas, com nível de confiança)

### Camada 1 — algorítmico puro (sem IA), primeira escolha para MD

- **xBRZ** — melhor escolha geral para preservar a estética pixelada com bordas suavizadas de
  forma consistente. Disponível como filtro standalone, em RetroArch (shaders), e em várias GUIs
  (ex.: [Lospec Pixel Art Scaler](https://lospec.com/pixel-art-scaler/), online e gratuito).
- **hqx** — alternativa mais antiga, resultado mais "arredondado". Boa opção se xBRZ ficar
  artificial demais para um sprite específico.
- **Nearest-neighbor puro** — não subestime: se o objetivo é só aumentar a resolução de tela
  mantendo o visual 100% pixelado (sem suavizar nada), um scale inteiro (2x/3x/4x) sem filtro
  nenhum é o mais fiel ao original e o mais rápido.

### Camada 2 — IA especializada em pixel art (não a IA genérica de anime)

- **chaiNNer** (`chaiNNer-org/chaiNNer`, GitHub, gratuito, open-source) — GUI de nós para rodar
  modelos de super-resolução localmente (Windows/Mac/Linux). É o sucessor espiritual do
  Waifu2x-Extension-GUI para quem trabalha com pixel art hoje.
- **OpenModelDB** (openmodeldb.info) — catálogo comunitário de modelos ESRGAN/SPAN/etc., com
  categoria dedicada **"Pixel Art"**. Modelo concreto recomendado: **4x_PixelPerfectV4** (ESRGAN,
  por Mutin Choler), treinado especificamente para upscaling de pixel art/sprites — ao contrário
  do Real-ESRGAN genérico, este não vai suavizar bordas indevidamente.
- Baixe o modelo `.pth` do OpenModelDB e carregue no chaiNNer como um nó de upscaling.

Sources: [chaiNNer (GitHub)](https://github.com/chaiNNer-org/chaiNNer), [OpenModelDB — categoria ESRGAN](https://openmodeldb.info/?t=arch%3Aesrgan), [4x PixelPerfectV4](https://openmodeldb.info/models/4x-PixelPerfectV4)

### Camada 3 — vetorização (para sprites de personagem limpos)

- **Depixelizing Pixel Art** (Kopf & Lischinski, pesquisa acadêmica com implementações abertas) —
  reconstrói o sprite como formas vetoriais e re-rasteriza em qualquer resolução com bordas
  perfeitamente lisas onde deveriam ser curvas, e retas onde deveriam ser retas. Ótimo para sprites
  de personagem/carro bem definidos (poucos elementos, silhueta clara) — menos indicado para
  texturas orgânicas (árvores, terrenos) ricas em ruído de pixel intencional.

### Camada 4 — geração/recriação estilizada (não é upscaling fiel)

- **PixelLab AI**, **Stable Diffusion + Pixel Art XL LoRA** — use apenas se o objetivo for
  *reimaginar* o sprite num estilo maior, aceitando que o resultado não será pixel-a-pixel fiel ao
  original de 16-bit. Para preservar a identidade visual do jogo original de Mega Drive, evite
  esta camada como caminho principal.

### Edição/finalização manual

- **Aseprite** (pago) ou **Pixelorama** (gratuito) — indispensável independente do método de
  upscaling escolhido.

## 4. Workflow recomendado para sprites de Mega Drive

```
1. Obter o sprite na melhor fonte possível
   → The Spriters Resource (spriters-resource.com) tem rips já limpos de praticamente
     todo jogo de Mega Drive relevante — prefira isso a print de tela ou dump de VRAM manual.
   ↓
2. Decidir o objetivo visual:

   (a) Quer manter o visual "pixelado" clássico, só maior?
       → xBRZ (ou hqx) em escala inteira (2x/3x/4x). Pronto, sem IA nenhuma.

   (b) Quer um resultado mais "HD" com bordas suavizadas mas fiel às formas originais?
       → chaiNNer + modelo pixel-art do OpenModelDB (ex: 4x_PixelPerfectV4)
   ↓
3. (Opcional, com cautela) Uma passada leve de Real-ESRGAN/waifu2x em força BAIXA
   só para suavizar serrilhado residual — teste sempre lado a lado com o original,
   é fácil isso destruir o estilo.
   ↓
4. Limpeza manual no Aseprite/Pixelorama:
   - remover halos/fringing na borda de transparência (crítico — ver seção 5)
   - normalizar a paleta se for combinar sprites de fontes/jogos diferentes
   - redesenhar pixel a pixel qualquer detalhe que o upscaler comeu (olhos, texto de HUD, etc.)
```

## 5. Notas específicas para integração neste projeto

Verifiquei a estrutura atual do repositório para embasar isto:

- Os sprites ficam soltos em [images/sprites/](../../images/sprites/) como PNGs indexados de 4
  bits (paleta), em resoluções variadas já ampliadas em relação a um tile nativo de Mega Drive
  (ex.: `player_straight.png` é 80×41, `car01.png` é 80×56, `billboard01.png` é 300×170) — ou seja,
  a arte original de Jake Gordon já não é pixel art "crua" de 8-bit, é ilustração vetorial
  rasterizada em alta resolução.
- **Importante**: se você inserir sprites de Mega Drive upscalados ao lado dos sprites atuais, a
  engine de projeção (`Util.project` / `Render.sprite` em [common.js](../../common.js)) escala
  tudo proporcionalmente pela distância (Z) usando a resolução da imagem-fonte como base. Isso
  significa que **todos os sprites precisam manter uma relação de escala consistente entre si**
  (a mesma relação "pixels da imagem por unidade de largura da pista"), ou os objetos de Mega
  Drive vão parecer maiores/menores que os demais na mesma distância. Ao decidir o fator de
  upscale (2x, 3x, 4x...), calibre pelo tamanho em pixels dos sprites existentes de referência
  (o carro do jogador, por exemplo), não por um valor fixo.
- O pipeline de build de sprites é `rake resprite` (ver [Rakefile](../../Rakefile)), que lê todos
  os PNGs de `images/sprites/` (layout `packed`) e `images/background/` (layout `vertical`) e
  **regenera automaticamente** `images/sprites.js` (`SPRITES`) / `images/background.js`
  (`BACKGROUND`) com as coordenadas de recorte. Ou seja: o workflow prático é
  1. gerar/upscalar o PNG do sprite de Mega Drive já com fundo transparente,
  2. salvar com o nome desejado em `images/sprites/` (ou `images/background/` para camadas de
     paralaxe),
  3. rodar `rake resprite` — as coordenadas em `SPRITES.NOME_EM_MAIUSCULO` são geradas
     automaticamente, sem editar `sprites.js` manualmente.
- Como `Render.sprite`/`Render.player` desenham a imagem via canvas com blending de alpha simples
  (sem antialiasing pós-processado pela engine), qualquer **halo de cor residual** na borda de
  transparência de um sprite upscalado (comum em saídas de IA e mesmo em xBRZ com canal alfa mal
  tratado) aparece nitidamente contra o asfalto/grama ao fundo. Vale sempre conferir a borda em
  zoom depois do upscaling e antes de rodar `rake resprite`.
- Este repositório **não** deve virar arquitetura modular por causa disso — ver diretriz do
  `CLAUDE.md`: as mudanças de sprite são só substituição/adição de assets em `images/sprites/` +
  `rake resprite`, sem tocar em `common.js`/`v4.final.html` a não ser que o comportamento de
  desenho precise mudar.

## 6. Onde conseguir os sprites originais de Mega Drive

- **The Spriters Resource** (spriters-resource.com) — maior acervo comunitário de rips de sprites
  organizados por jogo/console, geralmente já com fundo transparente e sem compressão de emulador.
  Primeira parada recomendada.
- Dump direto de VRAM via emulador (ex.: BizHawk, Gens/GS) só se o jogo não estiver no Spriters
  Resource — dá mais trabalho de limpeza (remoção de paleta de fundo, recorte manual).

## Resumo executivo

| Cenário | Ferramenta recomendada |
|---|---|
| Upscale rápido, mantendo 100% o look pixelado | xBRZ (2x–4x) |
| Upscale "HD" preservando fidelidade de forma | chaiNNer + modelo pixel-art (OpenModelDB, ex. 4x_PixelPerfectV4) |
| Sprite de personagem/veículo limpo, quer vetorizar | Depixelizing Pixel Art |
| Suavização final leve (com cautela) | Real-ESRGAN/waifu2x em força baixa, só como pós-processo |
| Limpeza manual obrigatória em todos os casos | Aseprite ou Pixelorama |
| Fonte dos sprites originais | The Spriters Resource |

Evite como caminho principal: waifu2x/Real-ESRGAN/Real-CUGAN/Anime4K genéricos como *primeiro*
passo, e ferramentas de geração (PixelLab, SD+LoRA) quando o objetivo é fidelidade ao sprite
original do Mega Drive.
