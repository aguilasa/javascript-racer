import * as Phaser from 'phaser'
import type { Segment, SpriteRect } from './types'
import { SPRITES, spriteFrameName } from './sprites'
import { Car } from './Car'
import { interpolate } from './util'

interface TrafficItem {
  segment: Segment
  car: Car
  scale: number
  x: number
  y: number
}

// Reproduz a parte de carros de RacerGameV4.renderExtraLayer, usando um pool de
// Phaser.GameObjects.Image — ver docs/migracao-phaser/01-arquitetura-alvo.md,
// "Renderização: Graphics + pool de Image".
export class TrafficRenderer {
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
    const items: TrafficItem[] = []

    for (let n = 1; n < drawDistance; n++) {
      const segment = segments[(baseSegment.index + n) % segments.length]!
      for (const carUnknown of segment.cars) {
        const car = carUnknown as Car
        // Carros são interpolados dentro do segmento pela fração car.percent
        const spriteScale = interpolate(segment.p1.screen.scale, segment.p2.screen.scale, car.percent)
        const spriteX = interpolate(segment.p1.screen.x, segment.p2.screen.x, car.percent) + spriteScale * car.offset * roadWidth * width / 2
        const spriteY = interpolate(segment.p1.screen.y, segment.p2.screen.y, car.percent)
        items.push({ segment, car, scale: spriteScale, x: spriteX, y: spriteY })
      }
    }

    // Algoritmo do pintor: mais distante primeiro
    items.sort((a, b) => b.segment.p1.camera.z - a.segment.p1.camera.z)

    for (const item of items) {
      const clipY = item.segment.clip ?? maxy
      // offsetX é sempre -0.5 para carros (centro horizontal), mas em Phaser isso é
      // coberto por setOrigin(0.5, 1) — parâmetro removido por redundância (CORR-PHASER-018)
      this.drawOne(item.car.sprite, item.scale, item.x, item.y, roadWidth, width, clipY, item.segment.p1.camera.z)
    }
  }

  private drawOne(
    rect: SpriteRect,
    scale: number,
    x: number,
    y: number,
    roadWidth: number,
    width: number,
    clipY: number,
    cameraZ: number,
  ): void {
    const destW = (rect.w * scale * width / 2) * (SPRITES.SCALE * roadWidth)
    const destH = (rect.h * scale * width / 2) * (SPRITES.SCALE * roadWidth)

    // offsetY é sempre -1 para carros (âncora na base)
    const destY = y - destH

    const clipH = Math.max(0, destY + destH - clipY)
    if (clipH >= destH) return // sprite inteiro acima do horizonte — não desenha

    const img = this.next()
    img.setTexture('sprites', spriteFrameName(rect))
    img.setOrigin(0.5, 1)
    img.setPosition(x, y)
    img.setScale(destW / rect.w, destH / rect.h)
    img.setCrop(0, 0, rect.w, rect.h - (rect.h * clipH / destH))
    // Mais distante (cameraZ maior) fica atrás; mesmo range de depth que SceneryRenderer
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
