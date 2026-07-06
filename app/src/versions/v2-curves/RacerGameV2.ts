import { RacerGameV1 } from '../v1-straight/RacerGameV1'
import { Road, ROAD } from '../../core/Road'
import type { Segment } from '../../core/types'
import * as Util from '../../core/util'

export class RacerGameV2 extends RacerGameV1 {
  // v2 adds curves to the straight road of v1

  protected buildRoad(): void {
    this.road = new Road(this.segmentLength, this.rumbleLength)

    // Recipe from v2.curves.html resetRoad()
    this.road.addStraight(ROAD.LENGTH.SHORT / 4)
    this.road.addSCurves()
    this.road.addStraight(ROAD.LENGTH.LONG)
    this.road.addCurve(ROAD.LENGTH.MEDIUM, ROAD.CURVE.MEDIUM)
    this.road.addCurve(ROAD.LENGTH.LONG, ROAD.CURVE.MEDIUM)
    this.road.addStraight()
    this.road.addSCurves()
    this.road.addCurve(ROAD.LENGTH.LONG, -ROAD.CURVE.MEDIUM)
    this.road.addCurve(ROAD.LENGTH.LONG, ROAD.CURVE.MEDIUM)
    this.road.addStraight()
    this.road.addSCurves()
    this.road.addCurve(ROAD.LENGTH.LONG, -ROAD.CURVE.EASY)

    this.road.markStartFinish(this.playerZ)
    this.road.finalize()
  }

  protected updateLateralForces(dt: number, playerSegment: Segment): void {
    // Call v1 implementation (keyLeft/keyRight handling)
    super.updateLateralForces(dt, playerSegment)

    // Add centrifugal force (v2)
    const speedPercent = this.speed / this.maxSpeed
    const dx = dt * 2 * speedPercent
    this.playerX = this.playerX - (dx * speedPercent * playerSegment.curve * this.centrifugal)
  }

  protected updateParallax(_dt: number, playerSegment: Segment, _startPosition: number): void {
    const speedPercent = this.speed / this.maxSpeed
    this.skyOffset = Util.increase(this.skyOffset, this.skySpeed * playerSegment.curve * speedPercent, 1)
    this.hillOffset = Util.increase(this.hillOffset, this.hillSpeed * playerSegment.curve * speedPercent, 1)
    this.treeOffset = Util.increase(this.treeOffset, this.treeSpeed * playerSegment.curve * speedPercent, 1)
  }
}
