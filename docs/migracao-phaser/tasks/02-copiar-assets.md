---
id: PHASER-TASK-02
title: "Copiar assets (imagens/música) para racer-phaser/public/assets/racer/"
type: infraestrutura
category: ferramental
phase: 0
depends_on: ["PHASER-TASK-01"]
status: pendente
---

# PHASER-TASK-02: Copiar assets para `racer-phaser/public/assets/racer/`

## Contexto

- **Plano completo:** `docs/migracao-phaser/02-estrutura-projeto.md`, seção "Assets"
- Os assets de origem já existem em `app/public/images/{sprites,background}.png` e
  `app/public/music/` (copiados lá durante a migração TypeScript, RACER-TASK-02) — são os mesmos
  PNGs/faixas de música da raiz do repositório, sem nenhuma edição.
- **Não** é necessário rodar `rake resprite` nem tocar em nenhum PNG de origem.

## Objetivo

Copiar `sprites.png`, `background.png` e as faixas de música para dentro de `racer-phaser/`, no
subdiretório `assets/racer/` (junto dos demais assets do template, `bg.png`/`logo.png`, mas
separado para não misturar).

## Passos

### 1) Criar o diretório de destino

```bash
mkdir -p /home/ingmar/WebstormProjects/javascript-racer/racer-phaser/public/assets/racer/music
```

### 2) Copiar os assets

```bash
cd /home/ingmar/WebstormProjects/javascript-racer
cp app/public/images/sprites.png    racer-phaser/public/assets/racer/sprites.png
cp app/public/images/background.png racer-phaser/public/assets/racer/background.png
cp app/public/music/*                racer-phaser/public/assets/racer/music/
```

### 3) Conferir integridade

```bash
diff app/public/images/sprites.png     racer-phaser/public/assets/racer/sprites.png
diff app/public/images/background.png  racer-phaser/public/assets/racer/background.png
diff -rq app/public/music/             racer-phaser/public/assets/racer/music/
```

Todos os `diff` devem retornar vazio (arquivos idênticos, não recomprimidos/reprocessados).

### 4) Commit

```bash
git add racer-phaser/public/assets/racer/
git commit -m "chore(racer-phaser): copia sprites/background/música de app/public"
```

## Critério de conclusão

- [x] `racer-phaser/public/assets/racer/sprites.png` idêntico a `app/public/images/sprites.png`
- [x] `racer-phaser/public/assets/racer/background.png` idêntico a
      `app/public/images/background.png`
- [x] `racer-phaser/public/assets/racer/music/` com os mesmos arquivos de `app/public/music/`
- [x] Nenhum arquivo em `app/` foi alterado (só leitura, para copiar)
- [x] Commit feito em `feature/phaser-port`

## Log de Execução *(preenchido após execução)*

**Executado em:** 2026-07-06

**Resumo do que foi feito:**
- Criou diretório `racer-phaser/public/assets/racer/music/`
- Copiou `sprites.png` de `app/public/images/` para `racer-phaser/public/assets/racer/`
- Copiou `background.png` de `app/public/images/` para `racer-phaser/public/assets/racer/`
- Copiou todas as faixas de música de `app/public/music/` para `racer-phaser/public/assets/racer/music/`
- Verificou integridade via `diff` - todos os arquivos são idênticos aos originais

**Problemas encontrados:**
- Nenhum

**Arquivos criados/modificados:**
- `racer-phaser/public/assets/racer/sprites.png` (copiado)
- `racer-phaser/public/assets/racer/background.png` (copiado)
- `racer-phaser/public/assets/racer/music/racer.mp3` (copiado)
- `racer-phaser/public/assets/racer/music/racer.ogg` (copiado)
