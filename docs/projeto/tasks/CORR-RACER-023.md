---
id: CORR-RACER-023
title: "Correção: Hud.updateSpeed() usa fórmula diferente da original (normaliza por maxSpeed)"
type: implementação
category: frontend
status: pendente
depends_on: []
---

# CORR-RACER-023: `Hud.updateSpeed()` usa uma fórmula diferente da original — normaliza por `maxSpeed` em vez de dividir por `500`

## Problema identificado

- **Arquivo:** `app/src/versions/v4-final/Hud.ts` (`updateSpeed`)

Original (`v4.final.html` linha 238, dentro de `update(dt)`):

```javascript
updateHud('speed', 5 * Math.round(speed/500));
```

A fórmula original **não depende de `maxSpeed`** — é uma calibração fixa: divide a velocidade
bruta por `500` e arredonda para múltiplos de `5`.

`Hud.ts` portado:

```ts
updateSpeed(speed: number, maxSpeed: number): void {
  const value = Math.round(speed / maxSpeed * 500 / 5) * 5;
  this.setIfChanged('speed', this.speedDom, value);
}
```

Esta fórmula normaliza `speed` por `maxSpeed` antes de escalar por `500` — um cálculo
completamente diferente do original. Com os valores reais deste projeto (`maxSpeed =
segmentLength/step = 200/(1/60) = 12000`, idêntico em `v4.final.html` e em
`app/src/core/RacerGame.ts`), na velocidade máxima:

- **Original:** `5 * Math.round(12000/500) = 5 * 24 = 120`
- **Portado:** `Math.round(12000/12000*500/5) * 5 = Math.round(100) * 5 = 500`

O velocímetro exibiria `500` em vez de `120` na velocidade máxima — uma divergência grosseira e
visível do comportamento original, violando a regra de preservar fórmulas numéricas
byte-a-byte (`docs/projeto/prompts/01-executar.md`, "Como executar" → "Implementar").

## Causa raiz

A assinatura `updateSpeed(speed, maxSpeed)` foi projetada para normalizar a velocidade (um padrão
comum em HUDs de jogos), mas o original não normaliza — usa uma constante de calibração fixa
(`500`) independente de `maxSpeed`. O parâmetro `maxSpeed` não deveria fazer parte da fórmula.

## Correção

### Arquivo/alvo: `app/src/versions/v4-final/Hud.ts`

Trocar a fórmula de `updateSpeed` para a original, removendo a dependência de `maxSpeed`:

```ts
updateSpeed(speed: number): void {
  const value = 5 * Math.round(speed / 500);
  this.setIfChanged('speed', this.speedDom, value);
}
```

(Remover o parâmetro `maxSpeed` da assinatura, já que não é usado pela fórmula original — ou,
se for mantido por consistência de chamada externa, simplesmente ignorá-lo no corpo do método.)

## Verificação

- [x] `updateSpeed` reproduz `5 * Math.round(speed/500)`, sem envolver `maxSpeed` no cálculo
- [x] Valor exibido na velocidade máxima (`speed = maxSpeed = 12000` com os defaults atuais)
      é `120`, não `500`
- [x] `mise exec -- npm run typecheck` sem erros
- [x] Nenhum arquivo fora de `app/` foi alterado

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:** Corrigida a fórmula de `updateSpeed` em `Hud.ts` para usar `5 * Math.round(speed / 500)` (original) em vez de `Math.round(speed / maxSpeed * 500 / 5) * 5` (portado incorretamente). Removido o parâmetro `maxSpeed` da assinatura do método, já que a fórmula original não o usa. Com `maxSpeed = 12000` (valor real do projeto), o velocímetro agora exibe `120` na velocidade máxima (correto) em vez de `500` (incorreto). Typecheck passa.

**Problemas encontrados:** Nenhum. A correção foi direta: trocar a fórmula e remover o parâmetro não utilizado.

**Arquivos criados/modificados:**
- `app/src/versions/v4-final/Hud.ts` (linha 17-19: assinatura e fórmula de `updateSpeed`)
