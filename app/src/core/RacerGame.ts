import type { Segment } from './types'
import { BACKGROUND } from './background'
import { KEY } from './constants'
import { AssetLoader } from './AssetLoader'
import { GameLoop } from './GameLoop'
import { InputController } from './InputController'
import { MusicPlayer } from './MusicPlayer'
import { Renderer } from './Renderer'
import { Road } from './Road'
import { StatsPanel } from './StatsPanel'
import { TweakUI } from './TweakUI'
import * as Util from './util'

export interface ResetOptions {
  width?:         number
  height?:        number
  lanes?:         number
  roadWidth?:     number
  cameraHeight?:  number
  drawDistance?:  number
  fogDensity?:    number
  fieldOfView?:   number
  segmentLength?: number
  rumbleLength?:  number
}

export abstract class RacerGame {
  // Configuration & state (mirroring v*.html variables)
  protected fps           = 60
  protected step          = 1 / 60
  protected width         = 1024
  protected height        = 768
  protected roadWidth     = 2000
  protected segmentLength = 200
  protected rumbleLength  = 3
  protected lanes         = 3
  protected fieldOfView   = 100
  protected cameraHeight  = 1000
  protected cameraDepth   = 0        // computed in reset()
  protected drawDistance  = 300
  protected playerX       = 0
  protected playerZ       = 0        // computed in reset()
  protected fogDensity    = 5
  protected position      = 0
  protected speed         = 0
  protected maxSpeed      = 0        // computed in reset()
  protected accel         = 0        // computed in reset()
  protected breaking      = 0        // computed in reset()
  protected decel         = 0        // computed in reset()
  protected offRoadDecel  = 0        // computed in reset()
  protected offRoadLimit  = 0        // computed in reset()
  protected offRoadHardLimit = 2     // v1-v3 use 2, v4 uses 3
  protected resolution    = 1        // computed in reset()

  // Parallax state (v2+)
  protected skyOffset  = 0
  protected hillOffset = 0
  protected treeOffset = 0
  protected skySpeed   = 0.001
  protected hillSpeed  = 0.002
  protected treeSpeed  = 0.003
  protected centrifugal = 0.3

  // Key flags
  protected keyLeft   = false
  protected keyRight  = false
  protected keyFaster = false
  protected keySlower = false

  // Runtime objects (set during start())
  protected road!:       Road
  protected renderer!:   Renderer
  protected background!: HTMLImageElement
  protected sprites!:    HTMLImageElement
  protected stats!:      StatsPanel
  protected tweakUI!:    TweakUI

  // Extension points (Template Method pattern)

  protected buildRoad(): void {
    this.road = new Road(this.segmentLength, this.rumbleLength)
    this.road.addRoad(500, 0, 0, 0, 0)
    this.road.markStartFinish(this.playerZ)
    this.road.finalize()
  }

  protected updateLateralForces(dt: number, _playerSegment: Segment): void {
    const dx = dt * 2 * (this.speed / this.maxSpeed)
    if (this.keyLeft)
      this.playerX = this.playerX - dx
    else if (this.keyRight)
      this.playerX = this.playerX + dx
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected updateParallax(_dt: number, _playerSegment: Segment, _startPosition: number): void {
    // no-op in v1; overridden in v2+
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected updateExtras(_dt: number): void {
    // no-op until v4; overridden in RacerGameV4
  }

  protected getCameraY(_playerY: number): number {
    return this.cameraHeight
  }

  protected renderExtraLayer(
    _baseSegment: Segment,
    _playerSegment: Segment,
    _startPosition: number,
    _playerX: number,
    _cameraX: number,
    _maxy: number,
  ): void {
    // no-op until v4; overridden in RacerGameV4
  }

  protected getPlayerScreenY(_playerSegment: Segment): number {
    return this.height
  }

  protected getPlayerUpdown(_playerSegment: Segment): number {
    return 0
  }

  protected getBackgroundOffsetY(_playerY: number): number {
    return 0
  }

  // Hook for subclasses to update traffic (v4) before playerX/speed are modified
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected updateTraffic(_dt: number, _playerSegment: Segment): void {
    // no-op by default
  }

  // Core update — final (not overridden)
  update(dt: number): void {
    const startPosition  = this.position
    const playerSegment  = this.road.findSegment(this.position + this.playerZ)

    this.updateTraffic(dt, playerSegment)

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
    this.updateExtras(dt)
  }

  // Core render — final (not overridden)
  render(): void {
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

    this.renderer.ctx.clearRect(0, 0, this.width, this.height)

    this.renderer.background(this.background, this.width, this.height, BACKGROUND.SKY!, this.skyOffset, this.skySpeed * this.getBackgroundOffsetY(playerY))
    this.renderer.background(this.background, this.width, this.height, BACKGROUND.HILLS!, this.hillOffset, this.hillSpeed * this.getBackgroundOffsetY(playerY))
    this.renderer.background(this.background, this.width, this.height, BACKGROUND.TREES!, this.treeOffset, this.treeSpeed * this.getBackgroundOffsetY(playerY))

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

      segment.clip = maxy

      if ((segment.p1.camera.z <= this.cameraDepth) || (segment.p2.screen.y >= segment.p1.screen.y) || (segment.p2.screen.y >= maxy))
        continue

      this.renderer.segment(
        this.width, this.lanes,
        segment.p1.screen.x, segment.p1.screen.y, segment.p1.screen.w,
        segment.p2.screen.x, segment.p2.screen.y, segment.p2.screen.w,
        segment.fog!, segment.color,
      )

      maxy = segment.p1.screen.y
    }

    this.renderExtraLayer(baseSegment, playerSegment, startPosition, this.playerX, this.playerX * this.roadWidth, maxy)

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

  // Reset (configuration + conditional road rebuild)
  reset(options: ResetOptions = {}): void {
    const canvas      = this.renderer.ctx.canvas
    canvas.width      = this.width         = Util.toInt(options.width,         this.width)
    canvas.height     = this.height        = Util.toInt(options.height,        this.height)
    this.lanes        = Util.toInt(options.lanes,        this.lanes)
    this.roadWidth    = Util.toInt(options.roadWidth,    this.roadWidth)
    this.cameraHeight = Util.toInt(options.cameraHeight, this.cameraHeight)
    this.drawDistance = Util.toInt(options.drawDistance, this.drawDistance)
    this.fogDensity   = Util.toInt(options.fogDensity,   this.fogDensity)
    this.fieldOfView  = Util.toInt(options.fieldOfView,  this.fieldOfView)
    this.segmentLength = Util.toInt(options.segmentLength, this.segmentLength)
    this.rumbleLength  = Util.toInt(options.rumbleLength,  this.rumbleLength)

    this.cameraDepth  = 1 / Math.tan((this.fieldOfView / 2) * Math.PI / 180)
    this.playerZ      = this.cameraHeight * this.cameraDepth
    this.resolution   = this.height / 480

    this.maxSpeed      = this.segmentLength / this.step
    this.accel         =  this.maxSpeed / 5
    this.breaking      = -this.maxSpeed
    this.decel         = -this.maxSpeed / 5
    this.offRoadDecel  = -this.maxSpeed / 2
    this.offRoadLimit  =  this.maxSpeed / 4

    this.onReset(options)

    this.tweakUI.refresh({
      lanes:        this.lanes,
      roadWidth:    this.roadWidth,
      cameraHeight: this.cameraHeight,
      drawDistance: this.drawDistance,
      fieldOfView:  this.fieldOfView,
      fogDensity:   this.fogDensity,
    })

    if (!this.road || this.road.segments.length === 0 || options.segmentLength || options.rumbleLength)
      this.buildRoad()
  }

  // Hook for subclasses to react to reset (e.g. update parallax offsets)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onReset(_options: ResetOptions): void {
    // no-op by default
  }

  // Public entry point — loads assets, wires input, starts loop
  async start(canvas: HTMLCanvasElement, assetNames: string[]): Promise<void> {
    const ctx    = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get 2D context')

    this.renderer = new Renderer(ctx)
    this.stats    = new StatsPanel('fps')

    const loader = new AssetLoader()
    const images = await loader.loadImages(assetNames)
    this.background = images[0]!
    this.sprites    = images[1]!

    this.tweakUI = new TweakUI((options) => this.reset(options))
    this.tweakUI.bind()

    new MusicPlayer('music', 'mute')

    this.reset()

    const input = new InputController()
    input.bind([
      { keys: [KEY.LEFT,  KEY.A], mode: 'down', action: () => { this.keyLeft   = true  } },
      { keys: [KEY.RIGHT, KEY.D], mode: 'down', action: () => { this.keyRight  = true  } },
      { keys: [KEY.UP,    KEY.W], mode: 'down', action: () => { this.keyFaster = true  } },
      { keys: [KEY.DOWN,  KEY.S], mode: 'down', action: () => { this.keySlower = true  } },
      { keys: [KEY.LEFT,  KEY.A], mode: 'up',   action: () => { this.keyLeft   = false } },
      { keys: [KEY.RIGHT, KEY.D], mode: 'up',   action: () => { this.keyRight  = false } },
      { keys: [KEY.UP,    KEY.W], mode: 'up',   action: () => { this.keyFaster = false } },
      { keys: [KEY.DOWN,  KEY.S], mode: 'up',   action: () => { this.keySlower = false } },
    ])

    const loop = new GameLoop(
      this.step,
      (dt) => this.update(dt),
      ()   => this.render(),
      ()   => this.stats.update(),
    )
    loop.start()
  }
}
