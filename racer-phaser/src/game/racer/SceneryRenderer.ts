import * as Phaser from 'phaser'
import type { Segment, SpriteSlot, SpriteRect } from './types'
import { SPRITES, spriteFrameName } from './sprites'

interface SceneryItem {
  segment: Segment
  sprite: SpriteSlot
  scale: number
  x: number
  y: number
}

// Reproduz a segunda passada de renderização de RacerGameV4.renderExtraLayer (sprites de
// cenário) + a matemática de posicionamento/recorte de Renderer.sprite (app/src/core/Renderer.ts),
// usando um pool de Phaser.GameObjects.Image em vez de canvas 2D — ver
// docs/migracao-phaser/01-arquitetura-alvo.md, "Renderização: Graphics + pool de Image".
export class SceneryRenderer {
  private pool: Phaser.GameObjects.Image[] = []
  private used = 0

  constructor(private scene: Phaser.Scene) {}

  clear(): void {
    for (let i = 0; i < this.used; i++) {
      this.pool[i]!.setVisible(false)
    }
    this.used = 0
  }

  draw(
    width: number,
    roadWidth: number,
    baseSegment: Segment,
    segments: Segment[],
    drawDistance: number,
    maxy: number,
  ): void {
    const items: SceneryItem[] = []

    for (let n = 1; n < drawDistance; n++) {
      const segment = segments[(baseSegment.index + n) % segments.length]!
      for (const sprite of segment.sprites) {
        const spriteScale = segment.p1.screen.scale
        const spriteX = segment.p1.screen.x + spriteScale * sprite.offset * roadWidth * width / 2
        const spriteY = segment.p1.screen.y
        items.push({ segment, sprite, scale: spriteScale, x: spriteX, y: spriteY })
      }
    }

    // Algoritmo do pintor: mais distante primeiro (mesma ordenação de RacerGameV4.renderExtraLayer)
    items.sort((a, b) => b.segment.p1.camera.z - a.segment.p1.camera.z)

    for (const item of items) {
      const clipY = item.segment.clip ?? maxy
      const offsetX = item.sprite.offset < 0 ? -1 : 0
      this.drawOne(item.sprite.source, item.scale, item.x, item.y, offsetX, roadWidth, width, clipY, item.segment.p1.camera.z)
    }
  }

  // Reproduz Renderer.sprite() (app/src/core/Renderer.ts): destW/destH a partir da escala de
  // projeção + SPRITES.SCALE, âncora via offsetX/offsetY, e recorte pelo horizonte (clipY).
  private drawOne(
    rect: SpriteRect,
    scale: number,
    x: number,
    y: number,
    offsetX: number,
    roadWidth: number,
    width: number,
    clipY: number,
    cameraZ: number,
  ): void {
    const destW = (rect.w * scale * width / 2) * (SPRITES.SCALE * roadWidth)
    const destH = (rect.h * scale * width / 2) * (SPRITES.SCALE * roadWidth)

    // offsetY é sempre -1 para sprites de cenário (âncora na base, ver RacerGameV4.renderExtraLayer)
    const destY = y - destH

    const clipH = Math.max(0, destY + destH - clipY)
    if (clipH >= destH) return // sprite inteiro acima do horizonte — não desenha

    const img = this.next()
    img.setTexture('sprites', spriteFrameName(rect))
    img.setOrigin(offsetX < 0 ? 1 : 0, 1)
    img.setPosition(x, y)
    img.setScale(destW / rect.w, destH / rect.h)
    img.setCrop(0, 0, rect.w, rect.h - (rect.h * clipH / destH))
    // Mais distante (cameraZ maior) fica atrás; tudo acima da pista (depth 0) e do parallax (depth < 0)
    img.setDepth(100000 - cameraZ)
    img.setVisible(true)
  }

  private next(): Phaser.GameObjects.Image {
    let img = this.pool[this.used]
    if (!img) {
      img = this.scene.add.image(0, 0, 'sprites')
      this.pool.push(img)
    }
    this.used++
    return img
  }
}
