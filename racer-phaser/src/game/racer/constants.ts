import type { SegmentColorSet } from './types'

export const KEY = {
  LEFT:  37,
  UP:    38,
  RIGHT: 39,
  DOWN:  40,
  A:     65,
  D:     68,
  S:     83,
  W:     87,
} as const

export const COLORS: {
  SKY:    string
  TREE:   string
  FOG:    string
  LIGHT:  SegmentColorSet
  DARK:   SegmentColorSet
  START:  SegmentColorSet
  FINISH: SegmentColorSet
} = {
  SKY:    '#72D7EE',
  TREE:   '#005108',
  FOG:    '#005108',
  LIGHT:  { road: '#6B6B6B', grass: '#10AA10', rumble: '#555555', lane: '#CCCCCC' },
  DARK:   { road: '#696969', grass: '#009A00', rumble: '#BBBBBB' },
  START:  { road: 'white',   grass: 'white',   rumble: 'white'  },
  FINISH: { road: 'black',   grass: 'black',   rumble: 'black'  },
}
