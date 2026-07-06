import type { Road } from '../../core/Road';
import type { Segment } from '../../core/types';
import { SPRITES } from '../../core/sprites';
import { randomChoice, increase, percentRemaining, overlap } from '../../core/util';
import { Car } from './Car';

export class TrafficManager {
  cars: Car[] = [];
  private road: Road;
  private totalCars: number;
  private maxSpeed: number;

  constructor(
    road: Road,
    totalCars: number,
    maxSpeed: number,
  ) {
    this.road = road;
    this.totalCars = totalCars;
    this.maxSpeed = maxSpeed;
  }

  resetCars(): void {
    this.cars = [];
    for (let n = 0; n < this.totalCars; n++) {
      const offset = Math.random() * randomChoice([-0.8, 0.8]);
      const z = Math.floor(Math.random() * this.road.segments.length) * this.road.segmentLength;
      const sprite = randomChoice(SPRITES.CARS);
      const speed = this.maxSpeed / 4 + Math.random() * this.maxSpeed / (sprite === SPRITES.SEMI ? 4 : 2);
      const car = new Car(offset, z, sprite, speed);
      const segment = this.road.findSegment(car.z);
      segment.cars.push(car);
      this.cars.push(car);
    }
  }

  updateCars(dt: number, playerSegment: Segment, playerX: number, playerW: number, speed: number, drawDistance: number): void {
    for (let n = 0; n < this.cars.length; n++) {
      const car = this.cars[n]!;
      const oldSegment = this.road.findSegment(car.z);
      car.offset = car.offset + this.updateCarOffset(car, oldSegment, playerSegment, playerX, playerW, speed, drawDistance);
      car.z = increase(car.z, dt * car.speed, this.road.trackLength);
      car.percent = percentRemaining(car.z, this.road.segmentLength);
      const newSegment = this.road.findSegment(car.z);
      if (oldSegment !== newSegment) {
        const index = oldSegment.cars.indexOf(car);
        oldSegment.cars.splice(index, 1);
        newSegment.cars.push(car);
      }
    }
  }

  private updateCarOffset(
    car: Car,
    carSegment: Segment,
    playerSegment: Segment,
    playerX: number,
    playerW: number,
    speed: number,
    drawDistance: number,
  ): number {
    const lookahead = 20;
    const carW = car.sprite.w * SPRITES.SCALE;

    // otimização: não gasta esterço em carros 'fora de vista' do jogador
    if ((carSegment.index - playerSegment.index) > drawDistance) {
      return 0;
    }

    for (let i = 1; i < lookahead; i++) {
      const segment = this.road.segments[(carSegment.index + i) % this.road.segments.length]!;

      if ((segment === playerSegment) && (car.speed > speed) && overlap(playerX, playerW, car.offset, carW, 1.2)) {
        let dir: number;
        if (playerX > 0.5) dir = -1;
        else if (playerX < -0.5) dir = 1;
        else dir = (car.offset > playerX) ? 1 : -1;
        return dir * (1 / i) * (car.speed - speed) / this.maxSpeed;
      }

      for (let j = 0; j < segment.cars.length; j++) {
        const otherCar = segment.cars[j] as Car;
        const otherCarW = otherCar.sprite.w * SPRITES.SCALE;
        if ((car.speed > otherCar.speed) && overlap(car.offset, carW, otherCar.offset, otherCarW, 1.2)) {
          let dir: number;
          if (otherCar.offset > 0.5) dir = -1;
          else if (otherCar.offset < -0.5) dir = 1;
          else dir = (car.offset > otherCar.offset) ? 1 : -1;
          return dir * (1 / i) * (car.speed - otherCar.speed) / this.maxSpeed;
        }
      }
    }

    // sem carros à frente, mas se de alguma forma saiu da pista, esterça de volta
    if (car.offset < -0.9) return 0.1;
    else if (car.offset > 0.9) return -0.1;
    else return 0;
  }

}
