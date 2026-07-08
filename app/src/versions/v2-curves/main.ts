import '../../style.css'
import { RacerGameV2 } from './RacerGameV2'

const canvas = document.getElementById('canvas') as HTMLCanvasElement
if (!canvas) throw new Error('Canvas element not found')

const game = new RacerGameV2()
await game.start(canvas, ['background', 'sprites'])
