import { RacerGameV2 } from '../v2-curves/RacerGameV2'
import { Road, ROAD } from '../../core/Road'
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
  // updateParallax: no changes from v2 — vertical parallax via getBackgroundOffsetY

  protected getCameraY(playerY: number): number {
    // Camera floats at a fixed height above the terrain
    return playerY + this.cameraHeight
  }

  protected getBackgroundOffsetY(playerY: number): number {
    // Vertical parallax offset (v3) — background layers slide vertically based on playerY
    return this.resolution * playerY
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
