import type { Road } from './Road';
import { SPRITES } from './sprites';
import { randomChoice, randomInt } from './util';

export function resetSprites(road: Road): void {
  addSprite(road, 20, SPRITES.BILLBOARD07, -1);
  addSprite(road, 40, SPRITES.BILLBOARD06, -1);
  addSprite(road, 60, SPRITES.BILLBOARD08, -1);
  addSprite(road, 80, SPRITES.BILLBOARD09, -1);
  addSprite(road, 100, SPRITES.BILLBOARD01, -1);
  addSprite(road, 120, SPRITES.BILLBOARD02, -1);
  addSprite(road, 140, SPRITES.BILLBOARD03, -1);
  addSprite(road, 160, SPRITES.BILLBOARD04, -1);
  addSprite(road, 180, SPRITES.BILLBOARD05, -1);

  addSprite(road, 240, SPRITES.BILLBOARD07, -1.2);
  addSprite(road, 240, SPRITES.BILLBOARD06, 1.2);
  addSprite(road, road.segments.length - 25, SPRITES.BILLBOARD07, -1.2);
  addSprite(road, road.segments.length - 25, SPRITES.BILLBOARD06, 1.2);

  for (let n = 10; n < 200; n += 4 + Math.floor(n / 100)) {
    addSprite(road, n, SPRITES.PALM_TREE, 0.5 + Math.random() * 0.5);
    addSprite(road, n, SPRITES.PALM_TREE, 1 + Math.random() * 2);
  }

  for (let n = 250; n < 1000; n += 5) {
    addSprite(road, n, SPRITES.COLUMN, 1.1);
    addSprite(road, n + randomInt(0, 5), SPRITES.TREE1, -1 - Math.random() * 2);
    addSprite(road, n + randomInt(0, 5), SPRITES.TREE2, -1 - Math.random() * 2);
  }

  for (let n = 200; n < road.segments.length; n += 3) {
    addSprite(road, n, randomChoice(SPRITES.PLANTS), randomChoice([1, -1]) * (2 + Math.random() * 5));
  }

  for (let n = 1000; n < road.segments.length - 50; n += 100) {
    const side = randomChoice([1, -1]);
    addSprite(road, n + randomInt(0, 50), randomChoice(SPRITES.BILLBOARDS), -side);
    for (let i = 0; i < 20; i++) {
      const sprite = randomChoice(SPRITES.PLANTS);
      const offset = side * (1.5 + Math.random());
      addSprite(road, n + randomInt(0, 50), sprite, offset);
    }
  }
}

function addSprite(road: Road, n: number, sprite: { x: number; y: number; w: number; h: number }, offset: number): void {
  road.segments[n]!.sprites.push({ source: sprite, offset });
}
