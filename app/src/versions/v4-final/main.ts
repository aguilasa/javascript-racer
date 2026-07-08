import '../../style.css';
import { RacerGameV4 } from './RacerGameV4';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
if (!canvas) throw new Error('Canvas element not found');

const game = new RacerGameV4();
await game.start(canvas, ['background', 'sprites']);
