import { RacerGameV2 } from '../v2-curves/RacerGameV2'
import { Road, ROAD } from '../../core/Road'
import { BACKGROUND } from '../../core/background'
import type { Segment } from '../../core/types'
import * as Util from '../../core/util'

export class RacerGameV3 extends RacerGameV2 {
  // v3 adds hills (y) to the curved road of v2

  protected buildRoad(): void {
    this.road = new Road(this.segmentLength, this.rumbleLength)

    // Recipe from v3.hills.html resetRoad()
    this.road.addStraight(ROAD.LENGTH.SHORT / 2)
    this.road.addHill(ROAD.LENGTH.SHORT, ROAD.HILL.LOW)
    this.road.addLowRollingHills()
    this.road.addCurve(ROAD.LENGTH.MEDIUM, ROAD.CURVE.MEDIUM, ROAD.HILL.LOW)
    this.road.addLowRollingHills()
    this.road.addCurve(ROAD.LENGTH.LONG, ROAD.CURVE.MEDIUM, ROAD.HILL.MEDIUM)
    this.road.addStraight()
    this.road.addCurve(ROAD.LENGTH.LONG, -ROAD.CURVE.MEDIUM, ROAD.HILL.MEDIUM)
    this.road.addHill(ROAD.LENGTH.LONG, ROAD.HILL.HIGH)
    this.road.addCurve(ROAD.LENGTH.LONG, ROAD.CURVE.MEDIUM, -ROAD.HILL.LOW)
    this.road.addHill(ROAD.LENGTH.LONG, -ROAD.HILL.MEDIUM)
    this.road.addStraight()
    this.road.addDownhillToEnd()

    this.road.markStartFinish(this.playerZ)
    this.road.finalize()
  }

  // updateLateralForces and updateExtras: no changes from v2 — don't override
  // updateParallax: no changes from v2 — vertical parallax is calculated in render()

  protected getCameraY(playerY: number): number {
    // Camera floats at a fixed height above the terrain
    return playerY + this.cameraHeight
  }

  render(): void {
    const baseSegment   = this.road.findSegment(this.position)
    const playerSegment = this.road.findSegment(this.position + this.playerZ)
    const playerPercent = Util.percentRemaining(this.position + this.playerZ, this.segmentLength)
    const playerY       = Util.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent)
    const cameraY       = this.getCameraY(playerY)
    const startPosition = this.position
    const basePercent   = Util.percentRemaining(this.position, this.segmentLength)
    let   maxy          = this.height

    // Curve accumulator (v2+)
    let x  = 0
    let dx = -(baseSegment.curve * basePercent)

    this.renderer.ctx.clearRect(0, 0, this.width, this.height)

    // Vertical parallax offset (v3)
    const skyOffsetY   = this.resolution * this.skySpeed * playerY
    const hillOffsetY  = this.resolution * this.hillSpeed * playerY
    const treeOffsetY  = this.resolution * this.treeSpeed * playerY

    this.renderer.background(this.background, this.width, this.height, BACKGROUND.SKY!, this.skyOffset, skyOffsetY)
    this.renderer.background(this.background, this.width, this.height, BACKGROUND.HILLS!, this.hillOffset, hillOffsetY)
    this.renderer.background(this.background, this.width, this.height, BACKGROUND.TREES!, this.treeOffset, treeOffsetY)

    const segments = this.road.segments

    for (let n = 0; n < this.drawDistance; n++) {
      const segment    = segments[(baseSegment.index + n) % segments.length]!
      segment.looped   = segment.index < baseSegment.index
      segment.fog      = Util.exponentialFog(n / this.drawDistance, this.fogDensity)

      const cameraZ = this.position - (segment.looped ? this.road.trackLength : 0)

      Util.project(segment.p1, (this.playerX * this.roadWidth) - x, cameraY, cameraZ, this.cameraDepth, this.width, this.height, this.roadWidth)
      Util.project(segment.p2, (this.playerX * this.roadWidth) - x - dx, cameraY, cameraZ, this.cameraDepth, this.width, this.height, this.roadWidth)

      x  = x + dx
      dx = dx + segment.curve

      if ((segment.p1.camera.z <= this.cameraDepth) || (segment.p2.screen.y >= segment.p1.screen.y) || (segment.p2.screen.y >= maxy))
        continue

      this.renderer.segment(
        this.width, this.lanes,
        segment.p1.screen.x, segment.p1.screen.y, segment.p1.screen.w,
        segment.p2.screen.x, segment.p2.screen.y, segment.p2.screen.w,
        segment.fog!, segment.color,
      )

      maxy = segment.p2.screen.y
    }

    this.renderExtraLayer(baseSegment, playerSegment, startPosition, this.playerX, this.playerX * this.roadWidth)

    const steer  = this.speed * (this.keyLeft ? -1 : this.keyRight ? 1 : 0)
    const updown = this.getPlayerUpdown(playerSegment)
    const screenY = this.getPlayerScreenY(playerSegment)

    this.renderer.player(
      this.width, this.height, this.resolution, this.roadWidth,
      this.sprites, this.speed / this.maxSpeed,
      this.cameraDepth / this.playerZ,
      this.width / 2, screenY,
      steer, updown,
    )
  }

  protected getPlayerScreenY(playerSegment: Segment): number {
    // Calculate player vertical position from camera height projection
    const playerPercent = Util.percentRemaining(this.position + this.playerZ, this.segmentLength)
    const cameraY = Util.interpolate(playerSegment.p1.camera.y, playerSegment.p2.camera.y, playerPercent)
    return (this.height / 2) - (this.cameraDepth / this.playerZ * cameraY * this.height / 2)
  }

  protected getPlayerUpdown(playerSegment: Segment): number {
    // Difference in height between start and end of player segment
    // Used to choose between normal and uphill sprites
    return playerSegment.p2.world.y - playerSegment.p1.world.y
  }
}
