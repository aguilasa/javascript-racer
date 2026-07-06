import type { Segment } from './types'
import { Road, ROAD } from './Road'
import * as Util from './util'

export interface RenderState {
  baseSegment: Segment
  playerSegment: Segment
  playerPercent: number
  playerY: number
  cameraY: number
  startPosition: number
  basePercent: number
  maxy: number
  skyOffset: number
  hillOffset: number
  treeOffset: number
  segments: Segment[]
  playerX: number
  speed: number
  maxSpeed: number
  steer: number
  updown: number
  screenY: number
  cameraDepth: number
  playerZ: number
  width: number
  height: number
  resolution: number
  roadWidth: number
  drawDistance: number
}

export class RacerEngine {
  // Configuration & state (mirroring RacerGame)
  private step          = 1 / 60
  width         = 1024
  height        = 768
  roadWidth     = 2000
  segmentLength = 200
  rumbleLength  = 3
  lanes         = 3
  fieldOfView   = 100
  cameraHeight  = 1000
  cameraDepth   = 0        // computed in reset()
  drawDistance  = 300
  playerX       = 0
  playerZ       = 0        // computed in reset()
  fogDensity    = 5
  position      = 0
  speed         = 0
  maxSpeed      = 0        // computed in reset()
  accel         = 0        // computed in reset()
  breaking      = 0        // computed in reset()
  decel         = 0        // computed in reset()
  offRoadDecel  = 0        // computed in reset()
  offRoadLimit  = 0        // computed in reset()
  offRoadHardLimit = 3     // v4 uses 3 (v1-v3 use 2)
  resolution    = 1        // computed in reset()

  // Parallax state (v2+)
  skyOffset  = 0
  hillOffset = 0
  treeOffset = 0
  private skySpeed   = 0.001
  private hillSpeed  = 0.002
  private treeSpeed  = 0.003
  private centrifugal = 0.3

  // Key flags (set from outside)
  keyLeft   = false
  keyRight  = false
  keyFaster = false
  keySlower = false

  // Road instance
  road!: Road

  reset(): void {
    this.cameraDepth  = 1 / Math.tan((this.fieldOfView / 2) * Math.PI / 180)
    this.playerZ      = this.cameraHeight * this.cameraDepth
    this.resolution   = this.height / 480

    this.maxSpeed      = this.segmentLength / this.step
    this.accel         =  this.maxSpeed / 5
    this.breaking      = -this.maxSpeed
    this.decel         = -this.maxSpeed / 5
    this.offRoadDecel  = -this.maxSpeed / 2
    this.offRoadLimit  =  this.maxSpeed / 4

    this.buildRoad()
  }

  private buildRoad(): void {
    this.road = new Road(this.segmentLength, this.rumbleLength)

    this.road.addStraight(ROAD.LENGTH.SHORT)
    this.road.addLowRollingHills()
    this.road.addSCurves()
    this.road.addCurve(ROAD.LENGTH.MEDIUM, ROAD.CURVE.MEDIUM, ROAD.HILL.LOW)
    this.road.addBumps()
    this.road.addLowRollingHills()
    this.road.addCurve(ROAD.LENGTH.LONG * 2, ROAD.CURVE.MEDIUM, ROAD.HILL.MEDIUM)
    this.road.addStraight()
    this.road.addHill(ROAD.LENGTH.MEDIUM, ROAD.HILL.HIGH)
    this.road.addSCurves()
    this.road.addCurve(ROAD.LENGTH.LONG, -ROAD.CURVE.MEDIUM, ROAD.HILL.NONE)
    this.road.addHill(ROAD.LENGTH.LONG, ROAD.HILL.HIGH)
    this.road.addCurve(ROAD.LENGTH.LONG, ROAD.CURVE.MEDIUM, -ROAD.HILL.LOW)
    this.road.addBumps()
    this.road.addHill(ROAD.LENGTH.LONG, -ROAD.HILL.MEDIUM)
    this.road.addStraight()
    this.road.addSCurves()
    this.road.addDownhillToEnd()

    this.road.markStartFinish(this.playerZ)
    this.road.finalize()
  }

  update(dt: number): void {
    const startPosition  = this.position
    const playerSegment  = this.road.findSegment(this.position + this.playerZ)

    // Traffic update will be added in PHASER-TASK-13
    // this.updateTraffic(dt, playerSegment)

    this.position        = Util.increase(this.position, dt * this.speed, this.road.trackLength)

    this.updateLateralForces(dt, playerSegment)
    this.updateParallax(dt, playerSegment, startPosition)

    if (this.keyFaster)
      this.speed = Util.accelerate(this.speed, this.accel, dt)
    else if (this.keySlower)
      this.speed = Util.accelerate(this.speed, this.breaking, dt)
    else
      this.speed = Util.accelerate(this.speed, this.decel, dt)

    if (((this.playerX < -1) || (this.playerX > 1)) && (this.speed > this.offRoadLimit))
      this.speed = Util.accelerate(this.speed, this.offRoadDecel, dt)

    this.playerX = Util.limit(this.playerX, -this.offRoadHardLimit, this.offRoadHardLimit)
    this.speed   = Util.limit(this.speed,   0,  this.maxSpeed)

    // Extras (collision, HUD timing) will be added in PHASER-TASK-11/15
    // this.updateExtras(dt)
  }

  private updateLateralForces(dt: number, playerSegment: Segment): void {
    const dx = dt * 2 * (this.speed / this.maxSpeed)
    const speedPercent = this.speed / this.maxSpeed
    
    if (this.keyLeft)
      this.playerX = this.playerX - dx
    else if (this.keyRight)
      this.playerX = this.playerX + dx

    // Centrifugal force in curves (v2+)
    this.playerX -= dx * speedPercent * playerSegment.curve * this.centrifugal
  }

  private updateParallax(_dt: number, playerSegment: Segment, startPosition: number): void {
    const delta = (this.position - startPosition) / this.road.segmentLength
    this.skyOffset = Util.increase(this.skyOffset, this.skySpeed * playerSegment.curve * delta, 1)
    this.hillOffset = Util.increase(this.hillOffset, this.hillSpeed * playerSegment.curve * delta, 1)
    this.treeOffset = Util.increase(this.treeOffset, this.treeSpeed * playerSegment.curve * delta, 1)
  }

  private getCameraY(playerY: number): number {
    return playerY + this.cameraHeight
  }

  private getPlayerScreenY(playerSegment: Segment): number {
    const playerPercent = Util.percentRemaining(this.position + this.playerZ, this.segmentLength)
    const cameraY = Util.interpolate(playerSegment.p1.camera.y, playerSegment.p2.camera.y, playerPercent)
    return (this.height / 2) - (this.cameraDepth / this.playerZ * cameraY * this.height / 2)
  }

  private getPlayerUpdown(playerSegment: Segment): number {
    return playerSegment.p2.world.y - playerSegment.p1.world.y
  }

  getRenderState(): RenderState {
    const baseSegment   = this.road.findSegment(this.position)
    const playerSegment = this.road.findSegment(this.position + this.playerZ)
    const playerPercent = Util.percentRemaining(this.position + this.playerZ, this.segmentLength)
    const playerY       = Util.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent)
    const cameraY       = this.getCameraY(playerY)
    const startPosition = this.position
    const basePercent   = Util.percentRemaining(this.position, this.segmentLength)
    let   maxy          = this.height

    // Curve accumulator (v2+): safe for v1 as curve is always 0
    let x  = 0
    let dx = -(baseSegment.curve * basePercent)

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

      segment.clip = maxy
      maxy = segment.p2.screen.y
    }

    const steer  = this.speed * (this.keyLeft ? -1 : this.keyRight ? 1 : 0)
    const updown = this.getPlayerUpdown(playerSegment)
    const screenY = this.getPlayerScreenY(playerSegment)

    return {
      baseSegment,
      playerSegment,
      playerPercent,
      playerY,
      cameraY,
      startPosition,
      basePercent,
      maxy,
      skyOffset: this.skyOffset,
      hillOffset: this.hillOffset,
      treeOffset: this.treeOffset,
      segments,
      playerX: this.playerX,
      speed: this.speed,
      maxSpeed: this.maxSpeed,
      steer,
      updown,
      screenY,
      cameraDepth: this.cameraDepth,
      playerZ: this.playerZ,
      width: this.width,
      height: this.height,
      resolution: this.resolution,
      roadWidth: this.roadWidth,
      drawDistance: this.drawDistance,
    }
  }
}
