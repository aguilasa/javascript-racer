import type { Segment } from './types'
import { COLORS } from './constants'
import { easeIn, easeInOut, toInt } from './util'

export const ROAD = {
  LENGTH: { NONE: 0, SHORT:  25, MEDIUM:  50, LONG:  100 },
  HILL:   { NONE: 0, LOW:    20, MEDIUM:  40, HIGH:   60 },
  CURVE:  { NONE: 0, EASY:    2, MEDIUM:   4, HARD:    6 },
} as const

export class Road {
  segments: Segment[] = []
  trackLength = 0

  private segmentLength: number
  private rumbleLength: number

  constructor(segmentLength: number, rumbleLength: number) {
    this.segmentLength = segmentLength
    this.rumbleLength  = rumbleLength
  }

  addSegment(curve = 0, y = 0): void {
    const n = this.segments.length
    this.segments.push({
      index:  n,
      p1: { world: { y: this.lastY(), z:  n      * this.segmentLength }, camera: { x: 0, y: 0, z: 0 }, screen: { x: 0, y: 0, w: 0, scale: 0 } },
      p2: { world: { y,              z: (n + 1) * this.segmentLength }, camera: { x: 0, y: 0, z: 0 }, screen: { x: 0, y: 0, w: 0, scale: 0 } },
      curve,
      color: Math.floor(n / this.rumbleLength) % 2 ? COLORS.DARK : COLORS.LIGHT,
      sprites: [],
      cars:    [],
    })
  }

  addRoad(enter: number, hold: number, leave: number, curve = 0, y = 0): void {
    const startY = this.lastY()
    const endY   = startY + (toInt(y, 0) * this.segmentLength)
    const total  = enter + hold + leave
    for (let n = 0; n < enter; n++)
      this.addSegment(easeIn(0, curve, n / enter),          easeInOut(startY, endY, n / total))
    for (let n = 0; n < hold; n++)
      this.addSegment(curve,                                easeInOut(startY, endY, (enter + n) / total))
    for (let n = 0; n < leave; n++)
      this.addSegment(easeInOut(curve, 0, n / leave),       easeInOut(startY, endY, (enter + hold + n) / total))
  }

  addStraight(num?: number): void {
    const n = num || ROAD.LENGTH.MEDIUM
    this.addRoad(n, n, n, 0, 0)
  }

  addHill(num?: number, height?: number): void {
    const n = num    || ROAD.LENGTH.MEDIUM
    const h = height || ROAD.HILL.MEDIUM
    this.addRoad(n, n, n, 0, h)
  }

  addCurve(num?: number, curve?: number, height?: number): void {
    const n = num    || ROAD.LENGTH.MEDIUM
    const c = curve  || ROAD.CURVE.MEDIUM
    const h = height || ROAD.HILL.NONE
    this.addRoad(n, n, n, c, h)
  }

  addLowRollingHills(num?: number, height?: number, curve: number = ROAD.CURVE.EASY): void {
    const n = num    || ROAD.LENGTH.SHORT
    const h = height || ROAD.HILL.LOW
    this.addRoad(n, n, n,  0,       h / 2)
    this.addRoad(n, n, n,  0,      -h)
    this.addRoad(n, n, n,  curve,   h)
    this.addRoad(n, n, n,  0,       0)
    this.addRoad(n, n, n, -curve,   h / 2)
    this.addRoad(n, n, n,  0,       0)
  }

  addSCurves(): void {
    this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY,    ROAD.HILL.NONE)
    this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.MEDIUM,  ROAD.HILL.MEDIUM)
    this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.EASY,   -ROAD.HILL.LOW)
    this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY,    ROAD.HILL.MEDIUM)
    this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.MEDIUM, -ROAD.HILL.MEDIUM)
  }

  addBumps(): void {
    this.addRoad(10, 10, 10, 0,  5)
    this.addRoad(10, 10, 10, 0, -2)
    this.addRoad(10, 10, 10, 0, -5)
    this.addRoad(10, 10, 10, 0,  8)
    this.addRoad(10, 10, 10, 0,  5)
    this.addRoad(10, 10, 10, 0, -7)
    this.addRoad(10, 10, 10, 0,  5)
    this.addRoad(10, 10, 10, 0, -2)
  }

  addDownhillToEnd(num?: number): void {
    const n = num || 200
    this.addRoad(n, n, n, -ROAD.CURVE.EASY, -this.lastY() / this.segmentLength)
  }

  findSegment(z: number): Segment {
    return this.segments[Math.floor(z / this.segmentLength) % this.segments.length]!
  }

  markStartFinish(playerZ: number): void {
    const startIdx = this.findSegment(playerZ).index
    this.segments[startIdx + 2]!.color = COLORS.START
    this.segments[startIdx + 3]!.color = COLORS.START
    for (let n = 0; n < this.rumbleLength; n++)
      this.segments[this.segments.length - 1 - n]!.color = COLORS.FINISH
  }

  finalize(): void {
    this.trackLength = this.segments.length * this.segmentLength
  }

  private lastY(): number {
    return this.segments.length === 0 ? 0 : this.segments[this.segments.length - 1]!.p2.world.y
  }
}
