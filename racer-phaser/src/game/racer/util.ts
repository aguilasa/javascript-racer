import type { SegmentPoint } from './types'

export function timestamp(): number {
  return new Date().getTime()
}

export function toInt(obj: unknown, def?: number): number {
  if (obj !== null && obj !== undefined) {
    const x = parseInt(String(obj), 10)
    if (!isNaN(x)) return x
  }
  return toInt(def, 0)
}

export function toFloat(obj: unknown, def?: number): number {
  if (obj !== null && obj !== undefined) {
    const x = parseFloat(String(obj))
    if (!isNaN(x)) return x
  }
  return toFloat(def, 0.0)
}

export function limit(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max))
}

export function interpolate(a: number, b: number, percent: number): number {
  return a + (b - a) * percent
}

export function randomInt(min: number, max: number): number {
  return Math.round(interpolate(min, max, Math.random()))
}

export function randomChoice<T>(options: T[]): T {
  return options[randomInt(0, options.length - 1)]!
}

export function percentRemaining(n: number, total: number): number {
  return (n % total) / total
}

export function accelerate(v: number, accel: number, dt: number): number {
  return v + (accel * dt)
}

export function easeIn(a: number, b: number, percent: number): number {
  return a + (b - a) * Math.pow(percent, 2)
}

export function easeOut(a: number, b: number, percent: number): number {
  return a + (b - a) * (1 - Math.pow(1 - percent, 2))
}

export function easeInOut(a: number, b: number, percent: number): number {
  return a + (b - a) * ((-Math.cos(percent * Math.PI) / 2) + 0.5)
}

export function exponentialFog(distance: number, density: number): number {
  return 1 / (Math.pow(Math.E, (distance * distance * density)))
}

export function increase(start: number, increment: number, max: number): number {
  let result = start + increment
  while (result >= max) result -= max
  while (result < 0)    result += max
  return result
}

export function project(
  p: SegmentPoint,
  cameraX: number,
  cameraY: number,
  cameraZ: number,
  cameraDepth: number,
  width: number,
  height: number,
  roadWidth: number,
): void {
  p.camera.x     = (p.world.x ?? 0) - cameraX
  p.camera.y     = (p.world.y ?? 0) - cameraY
  p.camera.z     = (p.world.z ?? 0) - cameraZ
  p.screen.scale = cameraDepth / p.camera.z
  p.screen.x     = Math.round((width  / 2) + (p.screen.scale * p.camera.x * width  / 2))
  p.screen.y     = Math.round((height / 2) - (p.screen.scale * p.camera.y * height / 2))
  p.screen.w     = Math.round(               (p.screen.scale * roadWidth  * width  / 2))
}

export function overlap(x1: number, w1: number, x2: number, w2: number, percent?: number): boolean {
  const half = (percent || 1) / 2
  const min1 = x1 - (w1 * half)
  const max1 = x1 + (w1 * half)
  const min2 = x2 - (w2 * half)
  const max2 = x2 + (w2 * half)
  return !((max1 < min2) || (min1 > max2))
}
