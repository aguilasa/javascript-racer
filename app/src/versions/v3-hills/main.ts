import '../../style.css'
import { RacerGameV3 } from './RacerGameV3'

const canvas = document.getElementById('canvas') as HTMLCanvasElement
if (!canvas) throw new Error('Canvas element not found')

const game = new RacerGameV3()
await game.start(canvas, ['background', 'sprites'])
