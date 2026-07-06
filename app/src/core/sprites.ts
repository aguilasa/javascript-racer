import type { SpriteRect } from './types'

const _S: Record<string, SpriteRect> = {
  PALM_TREE:              { x:    5, y:    5, w:  215, h:  540 },
  BILLBOARD08:            { x:  230, y:    5, w:  385, h:  265 },
  TREE1:                  { x:  625, y:    5, w:  360, h:  360 },
  DEAD_TREE1:             { x:    5, y:  555, w:  135, h:  332 },
  BILLBOARD09:            { x:  150, y:  555, w:  328, h:  282 },
  BOULDER3:               { x:  230, y:  280, w:  320, h:  220 },
  COLUMN:                 { x:  995, y:    5, w:  200, h:  315 },
  BILLBOARD01:            { x:  625, y:  375, w:  300, h:  170 },
  BILLBOARD06:            { x:  488, y:  555, w:  298, h:  190 },
  BILLBOARD05:            { x:    5, y:  897, w:  298, h:  190 },
  BILLBOARD07:            { x:  313, y:  897, w:  298, h:  190 },
  BOULDER2:               { x:  621, y:  897, w:  298, h:  140 },
  TREE2:                  { x: 1205, y:    5, w:  282, h:  295 },
  BILLBOARD04:            { x: 1205, y:  310, w:  268, h:  170 },
  DEAD_TREE2:             { x: 1205, y:  490, w:  150, h:  260 },
  BOULDER1:               { x: 1205, y:  760, w:  168, h:  248 },
  BUSH1:                  { x:    5, y: 1097, w:  240, h:  155 },
  CACTUS:                 { x:  929, y:  897, w:  235, h:  118 },
  BUSH2:                  { x:  255, y: 1097, w:  232, h:  152 },
  BILLBOARD03:            { x:    5, y: 1262, w:  230, h:  220 },
  BILLBOARD02:            { x:  245, y: 1262, w:  215, h:  220 },
  STUMP:                  { x:  995, y:  330, w:  195, h:  140 },
  SEMI:                   { x: 1365, y:  490, w:  122, h:  144 },
  TRUCK:                  { x: 1365, y:  644, w:  100, h:   78 },
  CAR03:                  { x: 1383, y:  760, w:   88, h:   55 },
  CAR02:                  { x: 1383, y:  825, w:   80, h:   59 },
  CAR04:                  { x: 1383, y:  894, w:   80, h:   57 },
  CAR01:                  { x: 1205, y: 1018, w:   80, h:   56 },
  PLAYER_UPHILL_LEFT:     { x: 1383, y:  961, w:   80, h:   45 },
  PLAYER_UPHILL_STRAIGHT: { x: 1295, y: 1018, w:   80, h:   45 },
  PLAYER_UPHILL_RIGHT:    { x: 1385, y: 1018, w:   80, h:   45 },
  PLAYER_LEFT:            { x:  995, y:  480, w:   80, h:   41 },
  PLAYER_STRAIGHT:        { x: 1085, y:  480, w:   80, h:   41 },
  PLAYER_RIGHT:           { x:  995, y:  531, w:   80, h:   41 },
}

// SPRITES.SCALE: fator que converte pixels da folha para proporção relativa ao roadWidth
// referência: largura do carro do jogador deve equivaler a 1/3 da meia-largura da pista
const SCALE = 0.3 * (1 / _S['PLAYER_STRAIGHT']!.w)

const BILLBOARDS: SpriteRect[] = [
  _S['BILLBOARD01']!, _S['BILLBOARD02']!, _S['BILLBOARD03']!,
  _S['BILLBOARD04']!, _S['BILLBOARD05']!, _S['BILLBOARD06']!,
  _S['BILLBOARD07']!, _S['BILLBOARD08']!, _S['BILLBOARD09']!,
]

const PLANTS: SpriteRect[] = [
  _S['TREE1']!, _S['TREE2']!,
  _S['DEAD_TREE1']!, _S['DEAD_TREE2']!,
  _S['PALM_TREE']!,
  _S['BUSH1']!, _S['BUSH2']!,
  _S['CACTUS']!,
  _S['STUMP']!,
  _S['BOULDER1']!, _S['BOULDER2']!, _S['BOULDER3']!,
]

const CARS: SpriteRect[] = [
  _S['CAR01']!, _S['CAR02']!, _S['CAR03']!, _S['CAR04']!,
  _S['SEMI']!, _S['TRUCK']!,
]

export const SPRITES = {
  ..._S,
  SCALE,
  BILLBOARDS,
  PLANTS,
  CARS,
}
