# 05 — Ideias de Expansão do Jogo

Este documento reúne, em nível de **feature/produto** (sem detalhamento técnico de implementação),
as ideias de expansão para o jogo além da versão final atual (`v4.final.html` / `v4.html`). A
primeira parte detalha cada sugestão já mencionada pelo autor original em
[`docs/05-v4-final.md`, seção 5.11](../05-v4-final.md#511-ideias-de-expansão-listadas-pelo-próprio-autor).
A segunda parte propõe ideias novas, que não constavam na lista original, mas que fazem sentido
para este projeto.

Nenhuma dessas ideias está implementada — este é apenas um levantamento para orientar decisões
futuras sobre prioridade e escopo.

## Como ler este documento

Cada ideia é apresentada com: um nome curto, uma descrição do que ela muda para quem joga, e (se
aplicável) uma nota de contexto. Não há estimativas de esforço, arquitetura ou plano de tarefas —
isso fica para um documento futuro, depois que houver decisão sobre quais ideias priorizar.

## Parte 1 — Ideias do autor original (seção 5.11)

### Áudio e feedback sonoro

1. **Efeitos sonoros de motor** — som de motor que varia com a velocidade/aceleração do carro do
   jogador (e talvez dos carros de tráfego), em vez do silêncio atual fora da música de fundo.
2. **Música melhor sincronizada** — ajustar timing/mixagem da trilha sonora para acompanhar melhor
   o ritmo da corrida (início de volta, retas, etc.), em vez de tocar apenas em loop simples.

### HUD e apresentação

3. **HUD com efeitos visuais** — reações visuais a eventos do jogo: um flash de tela ao bater o
   recorde de volta, confete/celebração ao terminar uma corrida bem, velocímetro que muda de cor
   conforme a faixa de velocidade (ex.: verde → amarelo → vermelho perto do limite).
4. **Modo tela cheia** — permitir que o jogo rode em fullscreen do navegador, melhorando a imersão
   em vez de ficar preso ao tamanho do canvas embutido na página.
5. **Detecção automática de resolução/distância de desenho** — em vez de exigir que o jogador
   ajuste manualmente resolução e "draw distance" na tweak UI, o jogo detecta o tamanho de tela e
   capacidade do dispositivo e escolhe valores razoáveis sozinho.

### Física, colisão e câmera

6. **Colisão de sprite mais precisa** — hoje a colisão usa uma aproximação simples de sobreposição;
   a ideia é refinar a detecção para ficar mais fiel ao formato visual de cada sprite/carro.
7. **IA de carros mais inteligente** — carros de tráfego que freiam e aceleram de forma mais
   realista (reagindo a curvas, a outros carros, ao jogador), em vez do comportamento atual mais
   simples de manter velocidade/faixa.
8. **Acidente "de verdade" em colisões de alta velocidade** — em vez de apenas perder velocidade,
   uma colisão forte poderia gerar uma sequência de acidente mais dramática (o carro sai de
   controle, roda, etc.).
9. **Mais "quique" ao sair da pista** — reforçar o efeito de sacolejo/impacto quando o carro do
   jogador sai da pista para a grama, tornando a penalidade mais perceptível.
10. **Tremor de tela em colisões/fora-de-pista** — um efeito de "screen shake" que reforça o
    impacto visual de bater em algo ou sair da pista.
11. **Partículas de poeira fora da pista** — pequenas partículas de poeira/terra levantadas quando
    o carro roda pela grama, dando mais textura ao ambiente.
12. **Câmera mais dinâmica** — câmera que abaixa em alta velocidade (sensação de mais velocidade) e
    que "sobrevoa" mais em trechos de morro, em vez de manter altura/ângulo fixos o tempo todo.

### Pista, mapas e mundo

13. **Múltiplos estágios/mapas** — mais de um circuito jogável, com traçados e cenários diferentes,
    em vez do único percurso fixo atual.
14. **Mapa da volta com indicador de posição** — um mini-mapa (ou mapa completo) do circuito na
    HUD, mostrando onde o carro do jogador está na pista.
15. **Bifurcações/junções na pista** — trechos onde a pista se divide em caminhos alternativos que
    se reencontram depois, dando variedade de rota.
16. **Ciclo dia/noite** — iluminação/cenário que muda conforme uma passagem simulada de tempo
    (manhã, tarde, noite), afetando o visual do céu e possivelmente a visibilidade.
17. **Efeitos climáticos** — chuva, neblina mais dinâmica, neve, etc., mudando a atmosfera e talvez
    a dificuldade da corrida.
18. **Elementos de cenário estruturais** — túneis, pontes, nuvens, paredes/muros, prédios: mais
    variedade de objetos ao longo da pista além de árvores/placas atuais.
19. **Cenários temáticos alternativos** — variações de ambientação como cidade, deserto ou litoral
    (oceano), reaproveitando a mesma engine de pista com paletas/sprites diferentes.

### Modos de jogo e adversários

20. **Carros "adversários" de verdade** — carros que competem ativamente com o jogador (tentam
    ultrapassar, correm por uma posição), diferente do tráfego atual que é só obstáculo passivo.
21. **Modos de jogo alternativos** — variações de objetivo: contrarrelógio (melhor volta), corrida
    1‑contra‑1 contra um rival específico, ou um modo de coletar moedas/itens pela pista.

## Parte 2 — Novas ideias sugeridas

Ideias adicionais que fazem sentido para o projeto, na mesma linha das sugestões originais do
autor, mas que não estavam na lista da seção 5.11.

1. **Ghost car / replay da melhor volta** — mostrar um carro "fantasma" semi-transparente
   reproduzindo a melhor volta do jogador (ou de um recorde salvo), como referência visual para
   tentar superá-la.
2. **Seleção de veículo** — permitir escolher entre carros diferentes antes da corrida, cada um com
   sprite e atributos levemente distintos (velocidade máxima, aceleração, aderência em curva),
   criando uma decisão de trade-off para o jogador.
3. **Editor de pista simples** — uma tela onde o jogador monta seu próprio circuito escolhendo
   trechos prontos (retas, curvas, morros) e depois pode jogar nele, aproveitando que a pista já é
   representada como uma sequência de segmentos.
4. **Leaderboard local de recordes** — guardar e exibir um histórico dos melhores tempos de volta
   por circuito, sem depender de servidor, reaproveitando o `Dom.storage` já usado para preferências
   de tweak UI.
5. **Suporte a gamepad e controles touch/mobile** — permitir jogar com controle físico (via Gamepad
   API do navegador) e adicionar controles touch (ou por inclinação do dispositivo) para jogar em
   celular/tablet.
6. **Modo espectador / câmera livre** — uma câmera que pode ser destacada do carro do jogador para
   observar a corrida de outros ângulos, útil para gravar clipes ou simplesmente apreciar o cenário.
7. **Estatísticas pós-corrida** — uma tela de resumo ao final da corrida com métricas como
   velocidade média, tempo total fora da pista, número de colisões e comparação com a melhor volta
   anterior.
8. **Danos visuais acumulados no carro** — o sprite do carro do jogador muda sutilmente (arranhões,
   fumaça) conforme acumula colisões, dando feedback visual de longo prazo além do tremor de tela
   pontual já sugerido na Parte 1.
9. **Power-ups/itens na pista (modo arcade opcional)** — itens colecionáveis que dão efeitos
   temporários (turbo, imunidade a colisão, etc.), como um modo de jogo separado do modo "simulação"
   padrão, para não descaracterizar a experiência clássica.
10. **Acessibilidade** — opções como paleta de cores alternativa para daltonismo, textos/HUD com
    tamanho ajustável e opção de reduzir efeitos de tremor de tela (screen shake) para jogadores
    sensíveis a esse tipo de estímulo.
11. **Compartilhamento de recorde/replay** — gerar um link ou imagem (screenshot automático) do
    resultado de uma volta recorde para o jogador compartilhar fora do jogo.
12. **Internacionalização (i18n)** — suporte a múltiplos idiomas na interface e HUD, já que hoje os
    textos estão fixos.

## Próximo passo

Estas ideias ainda não têm priorização nem dono. Um próximo documento (fora do escopo desta
migração para TypeScript) poderia agrupá-las por esforço estimado e valor percebido, para decidir
quais viram tarefas reais (`RACER-TASK-*`) após a conclusão da migração para TypeScript descrita
nos demais documentos desta pasta.
