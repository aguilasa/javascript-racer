import type { SpriteRect } from '../../core/types';

export class Car {
  offset: number;
  z: number;
  sprite: SpriteRect;
  speed: number;
  percent: number;

  constructor(
    offset: number,
    z: number,
    sprite: SpriteRect,
    speed: number,
    percent = 0,
  ) {
    this.offset = offset;
    this.z = z;
    this.sprite = sprite;
    this.speed = speed;
    this.percent = percent;
  }
}
