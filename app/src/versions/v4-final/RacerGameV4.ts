import { RacerGameV3 } from '../v3-hills/RacerGameV3';
import { Road, ROAD } from '../../core/Road';
import { TrafficManager } from './TrafficManager';
import { resetSprites } from './scenery';
import { Hud } from './Hud';
import { SPRITES } from '../../core/sprites';
import type { Segment, SpriteSlot } from '../../core/types';
import type { ResetOptions } from '../../core/RacerGame';
import { Car } from './Car';
import * as Util from '../../core/util';

export class RacerGameV4 extends RacerGameV3 {
  protected trafficManager!: TrafficManager;
  protected hud!: Hud;
  protected currentLapTime = 0;
  protected lastLapTime = 0;
  protected offRoadHardLimit = 3;
  protected startPosition = 0;

  protected onReset(_options: ResetOptions): void {
    if (!this.hud) {
      this.hud = new Hud();
    }
    super.onReset(_options);
  }

  protected buildRoad(): void {
    this.road = new Road(this.segmentLength, this.rumbleLength);
    this.trafficManager = new TrafficManager(this.road, 200, this.maxSpeed);

    this.road.addStraight(ROAD.LENGTH.SHORT);
    this.road.addLowRollingHills();
    this.road.addSCurves();
    this.road.addCurve(ROAD.LENGTH.MEDIUM, ROAD.CURVE.MEDIUM, ROAD.HILL.LOW);
    this.addBumps();
    this.road.addLowRollingHills();
    this.road.addCurve(ROAD.LENGTH.LONG * 2, ROAD.CURVE.MEDIUM, ROAD.HILL.MEDIUM);
    this.road.addStraight();
    this.road.addHill(ROAD.LENGTH.MEDIUM, ROAD.HILL.HIGH);
    this.road.addSCurves();
    this.road.addCurve(ROAD.LENGTH.LONG, -ROAD.CURVE.MEDIUM, ROAD.HILL.NONE);
    this.road.addHill(ROAD.LENGTH.LONG, ROAD.HILL.HIGH);
    this.road.addCurve(ROAD.LENGTH.LONG, ROAD.CURVE.MEDIUM, -ROAD.HILL.LOW);
    this.addBumps();
    this.road.addHill(ROAD.LENGTH.LONG, -ROAD.HILL.MEDIUM);
    this.road.addStraight();
    this.road.addSCurves();
    this.road.addDownhillToEnd();

    resetSprites(this.road);
    this.trafficManager.resetCars();

    this.road.markStartFinish(this.playerZ);
    this.road.finalize();
  }

  private addBumps(): void {
    this.road.addRoad(10, 10, 10, 0, 5);
    this.road.addRoad(10, 10, 10, 0, -2);
    this.road.addRoad(10, 10, 10, 0, -5);
    this.road.addRoad(10, 10, 10, 0, 8);
    this.road.addRoad(10, 10, 10, 0, 5);
    this.road.addRoad(10, 10, 10, 0, -7);
    this.road.addRoad(10, 10, 10, 0, 5);
    this.road.addRoad(10, 10, 10, 0, -2);
  }

  protected updateTraffic(dt: number, playerSegment: Segment): void {
    const playerW = SPRITES.PLAYER_STRAIGHT.w * SPRITES.SCALE;
    this.trafficManager.updateCars(dt, playerSegment, this.playerX, playerW, this.speed, this.drawDistance);
  }

  protected updateExtras(dt: number): void {
    const playerSegment = this.road.findSegment(this.position + this.playerZ);
    const playerW = SPRITES.PLAYER_STRAIGHT.w * SPRITES.SCALE;

    if (this.playerX < -1 || this.playerX > 1) {
      for (const sprite of playerSegment.sprites) {
        const spriteW = sprite.source.w * SPRITES.SCALE;
        const spriteOffset = sprite.offset + (spriteW / 2) * (sprite.offset > 0 ? 1 : -1);
        if (Util.overlap(this.playerX, playerW, spriteOffset, spriteW)) {
          this.speed = this.maxSpeed / 5;
          this.position = Util.increase(playerSegment.p1.world.z, -this.playerZ, this.road.trackLength);
          break;
        }
      }
    }

    for (const car of playerSegment.cars) {
      const carObj = car as Car;
      const carW = carObj.sprite.w * SPRITES.SCALE;
      if (this.speed > carObj.speed) {
        if (Util.overlap(this.playerX, playerW, carObj.offset, carW, 0.8)) {
          this.speed = carObj.speed * (carObj.speed / this.speed);
          this.position = Util.increase(carObj.z, -this.playerZ, this.road.trackLength);
          break;
        }
      }
    }

    if (this.position > this.playerZ) {
      if (this.currentLapTime && this.startPosition < this.playerZ) {
        this.lastLapTime = this.currentLapTime;
        this.currentLapTime = 0;
        this.hud.onLapComplete(this.lastLapTime);
      } else {
        this.currentLapTime += dt;
      }
    }

    this.hud.updateSpeed(this.speed);
    this.hud.updateCurrentLapTime(this.currentLapTime);
  }

  protected updateParallax(_dt: number, playerSegment: Segment, startPosition: number): void {
    this.startPosition = startPosition; // captura para uso em updateExtras() no mesmo tick
    const delta = (this.position - startPosition) / this.road.segmentLength;
    this.skyOffset = Util.increase(this.skyOffset, this.skySpeed * playerSegment.curve * delta, 1);
    this.hillOffset = Util.increase(this.hillOffset, this.hillSpeed * playerSegment.curve * delta, 1);
    this.treeOffset = Util.increase(this.treeOffset, this.treeSpeed * playerSegment.curve * delta, 1);
  }

  protected renderExtraLayer(
    baseSegment: Segment,
    _playerSegment: Segment,
    _startPosition: number,
    _playerX: number,
    _cameraX: number,
    maxy: number
  ): void {
    const sprites: Array<{ segment: Segment; sprite: SpriteSlot; scale: number; x: number; y: number }> = [];
    const cars: Array<{ segment: Segment; car: Car; scale: number; x: number; y: number }> = [];

    for (let n = 1; n < this.drawDistance; n++) {
      const segment = this.road.segments[(baseSegment.index + n) % this.road.segments.length]!;

      for (const sprite of segment.sprites) {
        const spriteScale = segment.p1.screen.scale;
        const spriteX = segment.p1.screen.x + spriteScale * sprite.offset * this.roadWidth * this.width / 2;
        const spriteY = segment.p1.screen.y;

        sprites.push({ segment, sprite, scale: spriteScale, x: spriteX, y: spriteY });
      }

      for (const car of segment.cars) {
        const carObj = car as Car;
        const carScale = Util.interpolate(segment.p1.screen.scale, segment.p2.screen.scale, carObj.percent);
        const carX = Util.interpolate(segment.p1.screen.x, segment.p2.screen.x, carObj.percent) + carScale * carObj.offset * this.roadWidth * this.width / 2;
        const carY = Util.interpolate(segment.p1.screen.y, segment.p2.screen.y, carObj.percent);

        cars.push({ segment, car: carObj, scale: carScale, x: carX, y: carY });
      }
    }

    const allObjects = [...sprites, ...cars].sort((a, b) => b.segment.p1.camera.z - a.segment.p1.camera.z);

    for (const obj of allObjects) {
      if ('sprite' in obj) {
        const offsetX = obj.sprite.offset < 0 ? -1 : 0;
        this.renderer.sprite(
          this.width,
          this.height,
          this.resolution,
          this.roadWidth,
          this.sprites,
          obj.sprite.source,
          obj.scale,
          obj.x,
          obj.y,
          offsetX,
          -1,
          obj.segment.clip ?? maxy
        );
      } else {
        this.renderer.sprite(
          this.width,
          this.height,
          this.resolution,
          this.roadWidth,
          this.sprites,
          obj.car.sprite,
          obj.scale,
          obj.x,
          obj.y,
          -0.5,
          -1,
          obj.segment.clip ?? maxy
        );
      }
    }
  }
}
