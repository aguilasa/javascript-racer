import type { Scene } from 'phaser';
import type { SegmentColorSet } from './types';
import { COLORS } from './constants';

export class RoadRenderer {
  private graphics: Phaser.GameObjects.Graphics;

  constructor(private scene: Scene) {
    this.graphics = this.scene.add.graphics();
  }

  clear(): void {
    this.graphics.clear();
  }

  segment(
    width: number,
    lanes: number,
    x1: number, y1: number, w1: number,
    x2: number, y2: number, w2: number,
    fog: number,
    color: SegmentColorSet,
  ): void {
    const r1 = this.rumbleWidth(w1, lanes);
    const r2 = this.rumbleWidth(w2, lanes);
    const l1 = this.laneMarkerWidth(w1, lanes);
    const l2 = this.laneMarkerWidth(w2, lanes);

    // Grass (rectangle covering full width)
    this.graphics.fillStyle(this.colorToNumber(color.grass), 1);
    this.graphics.fillRect(0, y2, width, y1 - y2);

    // Rumble strips (two trapezoids)
    this.polygon([
      { x: x1 - w1 - r1, y: y1 },
      { x: x1 - w1,      y: y1 },
      { x: x2 - w2,      y: y2 },
      { x: x2 - w2 - r2, y: y2 },
    ], this.colorToNumber(color.rumble));

    this.polygon([
      { x: x1 + w1 + r1, y: y1 },
      { x: x1 + w1,      y: y1 },
      { x: x2 + w2,      y: y2 },
      { x: x2 + w2 + r2, y: y2 },
    ], this.colorToNumber(color.rumble));

    // Road surface (trapezoid)
    this.polygon([
      { x: x1 - w1, y: y1 },
      { x: x1 + w1, y: y1 },
      { x: x2 + w2, y: y2 },
      { x: x2 - w2, y: y2 },
    ], this.colorToNumber(color.road));

    // Lane markers
    if (color.lane) {
      const lanew1 = w1 * 2 / lanes;
      const lanew2 = w2 * 2 / lanes;
      let lanex1 = x1 - w1 + lanew1;
      let lanex2 = x2 - w2 + lanew2;
      for (let lane = 1; lane < lanes; lanex1 += lanew1, lanex2 += lanew2, lane++) {
        this.polygon([
          { x: lanex1 - l1 / 2, y: y1 },
          { x: lanex1 + l1 / 2, y: y1 },
          { x: lanex2 + l2 / 2, y: y2 },
          { x: lanex2 - l2 / 2, y: y2 },
        ], this.colorToNumber(color.lane));
      }
    }

    // Fog overlay
    this.fog(0, y2, width, y1 - y2, fog);
  }

  fog(x: number, y: number, width: number, height: number, fogValue: number): void {
    if (fogValue < 1) {
      const fogColor = this.colorToNumber(COLORS.FOG);
      this.graphics.fillStyle(fogColor, 1 - fogValue);
      this.graphics.fillRect(x, y, width, height);
    }
  }

  private polygon(points: { x: number; y: number }[], color: number): void {
    this.graphics.fillStyle(color, 1);
    const vectorPoints = points.map(p => new Phaser.Math.Vector2(p.x, p.y));
    this.graphics.fillPoints(vectorPoints, true);
  }

  private rumbleWidth(projectedRoadWidth: number, lanes: number): number {
    return projectedRoadWidth / Math.max(6, 2 * lanes);
  }

  private laneMarkerWidth(projectedRoadWidth: number, lanes: number): number {
    return projectedRoadWidth / Math.max(32, 8 * lanes);
  }

  private colorToNumber(cssColor: string): number {
    return Phaser.Display.Color.HexStringToColor(cssColor).color;
  }
}
