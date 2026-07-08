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
  rumble:  string
  lane?:  string
}

export interface Segment {
  index:   number
  p1:      SegmentPoint
  p2:      SegmentPoint
  curve:   number
  color:   SegmentColorSet
  sprites: SpriteSlot[]
  cars:    unknown[] // v1-v3: genérico; v4: Car[] (TrafficManager só é usado na v4)
  looped?: boolean
  fog?:    number
  clip?:   number
}
