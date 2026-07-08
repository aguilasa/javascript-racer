import '../../style.css'
import { RacerGameV1 } from './RacerGameV1'

const canvas = document.getElementById('canvas') as HTMLCanvasElement
if (!canvas) throw new Error('Canvas element not found')

const game = new RacerGameV1()
await game.start(canvas, ['background', 'sprites'])
