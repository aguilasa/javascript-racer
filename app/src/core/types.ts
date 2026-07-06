export interface WorldPoint  { x?: number; y: number; z: number }
export interface CameraPoint { x: number;  y: number; z: number }
export interface ScreenPoint { x: number;  y: number; w: number; scale: number }

export interface SegmentPoint {
  world:  WorldPoint
  camera: CameraPoint
  screen: ScreenPoint
}

export interface SpriteRect { x: number; y: number; w: number; h: number }
export interface SpriteSlot  { source: SpriteRect; offset: number }

export interface SegmentColorSet {
  road:   string
  grass:  string
  rumble: string
  lane?:  string
}

export interface Segment {
  index:   number
  p1:      SegmentPoint
  p2:      SegmentPoint
  curve:   number
  color:   SegmentColorSet
  sprites: SpriteSlot[]
  cars:    unknown[] // será restrito a Car[] a partir da RACER-TASK-13 (v4); manter genérico até lá
  looped?: boolean
  fog?:    number
  clip?:   number
}
