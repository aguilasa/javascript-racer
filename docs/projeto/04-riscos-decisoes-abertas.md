# 04 — Riscos e Decisões Abertas

Pontos que este plano resolveu com uma recomendação padrão, mas que valem confirmação antes ou
durante a implementação — nenhum deles bloqueia o início da Fase 0.

## 1. Nome da pasta do novo projeto

- **Recomendado:** `app/`.
- **Alternativas:** `ts/`, `vite-app/`, `racer-ts/`.
- **Impacto de mudar depois:** baixo — é só o nome de uma pasta, sem referências fora dela.

## 2. Cópia de assets vs. referência direta

- **Recomendado:** copiar `images/` e `music/` para `app/public/` (ver
  [02](02-estrutura-vite.md#assets-images-music)).
- **Alternativa:** configurar `server.fs.allow` no Vite para servir os diretórios originais fora
  de `app/`, evitando duplicação.
- **Trade-off:** a cópia duplica alguns MB de assets estáticos e congelados; a referência direta
  economiza espaço mas acopla a configuração do dev server à localização exata dos arquivos na
  raiz do repo.

## 3. `stats.js` via npm vs. arquivo vendorizado

- **Recomendado:** instalar o pacote `stats.js` via npm.
- **Alternativa:** copiar o arquivo `stats.js` atual para dentro de `app/src/core/`.
- **Trade-off:** o pacote npm pode não ter uma versão idêntica byte-a-byte à vendorizada
  localmente (embora a API pública do mr.doob's Stats seja estável há anos); vendorizar garante
  paridade exata mas foge do espírito "gerenciar dependências via Vite/npm" pedido para o projeto
  novo.

## 4. Testes automatizados

- **Fora do escopo inicial** (ver [00 — Não-objetivos](00-visao-geral.md#não-objetivos-explicitamente-fora-de-escopo)).
- **Candidato natural se decidido incluir:** Vitest (nativo do ecossistema Vite) cobrindo
  `core/util.ts` (funções puras: `interpolate`, `easeIn/Out/InOut`, `project`, `overlap`,
  `exponentialFog`) e a lógica de `TrafficManager.updateCarOffset` (também pura o suficiente para
  testar por entrada/saída).
- **Decisão pendente:** incluir já na Fase 1 (núcleo) ou só cogitar na Fase 6 (polimento).

## 5. Vincular a nova versão a partir do `index.html`/`README.md` da raiz

- O pedido original foi explícito em **não remover nem modificar** os arquivos originais. Um link
  novo apontando para `app/` seria uma adição, não uma remoção, mas ainda assim é uma mudança em
  arquivo hoje "congelado".
- **Recomendado:** deixar para o usuário decidir na Fase 6, depois que a v4 estiver completa e
  comparável — neste ponto natural do plano, e não antes.

## 6. Herança (`RacerGameV1→V2→V3→V4`) vs. composição por flags de recurso

- Detalhado em [01 — Arquitetura Alvo](01-arquitetura-alvo.md#o-motor-compartilhado-uma-cadeia-de-herança-que-espelha-v1v2v3v4).
- **Recomendado:** herança, porque espelha a natureza estritamente aditiva já documentada em
  `docs/02`–`docs/05` (nenhum recurso desaparece nas versões seguintes).
- **Quando revisitar:** se, ao implementar a Fase 3 ou 4, algum ponto de extensão exigir lógica
  condicional complexa dentro de um método sobrescrito (sinal de que "recurso ligado/desligado"
  seria mais simples que "método sobrescrito"), vale reconsiderar pontualmente naquele método —
  não precisa ser tudo-ou-nada.

## 7. Granularidade exata dos métodos protegidos de `RacerGame`

- A lista em [01](01-arquitetura-alvo.md#o-motor-compartilhado-uma-cadeia-de-herança-que-espelha-v1v2v3v4)
  (`buildRoad`, `updateLateralForces`, `updateParallax`, `updateExtras`, `getCameraY`,
  `renderExtraLayer`, `getPlayerScreenY`, `getPlayerUpdown`) é uma previsão razoável, não um
  contrato fechado.
- **Esperado:** ajustar nomes/assinaturas durante a Fase 2 (primeiro port real) e a Fase 3
  (primeira subclasse real) — é o processo natural de descobrir os limites certos de abstração
  com código de verdade na mão, em vez de adivinhar tudo antecipadamente.

## Riscos técnicos (não são decisões, são só pontos de atenção)

- **Paridade de sensação de jogo**: a validação de cada fase é visual/manual (comparar lado a
  lado com a versão original), já que testes automatizados de "sensação de dirigir" não fazem
  sentido para este projeto — vale rodar as duas versões (original e TS) lado a lado no navegador
  ao final de cada fase.
- **`noUncheckedIndexedAccess`**: vai exigir atenção extra em `Road.findSegment` e em qualquer
  acesso a `segments[i]`/`cars[i]`, já que o código original assume (corretamente, por construção)
  que esses índices nunca são inválidos — o TypeScript não sabe disso e vai pedir narrowing
  explícito em alguns pontos. Isso é esperado e não indica um bug real.
