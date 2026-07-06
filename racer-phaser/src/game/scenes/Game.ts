import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { Road, ROAD } from '../racer/Road';
import { RoadRenderer } from '../racer/RoadRenderer';
import { COLORS } from '../racer/constants';
import * as Util from '../racer/util';

// Configuração provisória — mesmos valores padrão de RacerGame (app/src/core/RacerGame.ts).
// Vira campos de RacerEngine na PHASER-TASK-08; aqui só serve para validar a projeção estática.
const WIDTH = 1024;
const HEIGHT = 768;
const ROAD_WIDTH = 2000;
const SEGMENT_LENGTH = 200;
const RUMBLE_LENGTH = 3;
const LANES = 3;
const FIELD_OF_VIEW = 100;
const CAMERA_HEIGHT = 1000;
const DRAW_DISTANCE = 300;
const FOG_DENSITY = 5;

export class Game extends Scene
{
    private road!: Road;
    private roadRenderer!: RoadRenderer;

    private cameraDepth!: number;
    private playerZ!: number;
    private position = 0; // câmera fixa nesta tarefa — sem física de jogador ainda (PHASER-TASK-08/09)
    private playerX = 0;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(Phaser.Display.Color.HexStringToColor(COLORS.SKY).color);

        this.cameraDepth = 1 / Math.tan((FIELD_OF_VIEW / 2) * Math.PI / 180);
        this.playerZ = CAMERA_HEIGHT * this.cameraDepth;

        this.buildRoad();

        this.roadRenderer = new RoadRenderer(this);
    }

    update ()
    {
        this.renderRoad();
    }

    private buildRoad(): void
    {
        this.road = new Road(SEGMENT_LENGTH, RUMBLE_LENGTH);

        this.road.addStraight(ROAD.LENGTH.SHORT);
        this.road.addLowRollingHills();
        this.road.addSCurves();
        this.road.addCurve(ROAD.LENGTH.MEDIUM, ROAD.CURVE.MEDIUM, ROAD.HILL.LOW);
        this.road.addBumps();
        this.road.addLowRollingHills();
        this.road.addCurve(ROAD.LENGTH.LONG * 2, ROAD.CURVE.MEDIUM, ROAD.HILL.MEDIUM);
        this.road.addStraight();
        this.road.addHill(ROAD.LENGTH.MEDIUM, ROAD.HILL.HIGH);
        this.road.addSCurves();
        this.road.addCurve(ROAD.LENGTH.LONG, -ROAD.CURVE.MEDIUM, ROAD.HILL.NONE);
        this.road.addHill(ROAD.LENGTH.LONG, ROAD.HILL.HIGH);
        this.road.addCurve(ROAD.LENGTH.LONG, ROAD.CURVE.MEDIUM, -ROAD.HILL.LOW);
        this.road.addBumps();
        this.road.addHill(ROAD.LENGTH.LONG, -ROAD.HILL.MEDIUM);
        this.road.addStraight();
        this.road.addSCurves();
        this.road.addDownhillToEnd();

        this.road.markStartFinish(this.playerZ);
        this.road.finalize();
    }

    // Reproduz RacerGame.render() (app/src/core/RacerGame.ts), sem as camadas de fundo
    // (PHASER-TASK-10) nem o carro do jogador/sprites/tráfego (fases 3, 5, 6).
    private renderRoad(): void
    {
        const segments = this.road.segments;

        const baseSegment   = this.road.findSegment(this.position);
        const playerSegment = this.road.findSegment(this.position + this.playerZ);
        const playerPercent = Util.percentRemaining(this.position + this.playerZ, SEGMENT_LENGTH);
        const playerY       = Util.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent);
        const cameraY        = playerY + CAMERA_HEIGHT; // câmera relativa ao terreno (v3/v4, ver RacerGameV3.getCameraY)
        const basePercent    = Util.percentRemaining(this.position, SEGMENT_LENGTH);

        let maxy = HEIGHT;
        let x  = 0;
        let dx = -(baseSegment.curve * basePercent);

        this.roadRenderer.clear();

        for (let n = 0; n < DRAW_DISTANCE; n++) {
            const segment = segments[(baseSegment.index + n) % segments.length]!;
            segment.looped = segment.index < baseSegment.index;
            segment.fog    = Util.exponentialFog(n / DRAW_DISTANCE, FOG_DENSITY);

            const cameraZ = this.position - (segment.looped ? this.road.trackLength : 0);

            Util.project(segment.p1, (this.playerX * ROAD_WIDTH) - x,      cameraY, cameraZ, this.cameraDepth, WIDTH, HEIGHT, ROAD_WIDTH);
            Util.project(segment.p2, (this.playerX * ROAD_WIDTH) - x - dx, cameraY, cameraZ, this.cameraDepth, WIDTH, HEIGHT, ROAD_WIDTH);

            x  = x + dx;
            dx = dx + segment.curve;

            if ((segment.p1.camera.z <= this.cameraDepth) || (segment.p2.screen.y >= segment.p1.screen.y) || (segment.p2.screen.y >= maxy))
                continue;

            this.roadRenderer.segment(
                WIDTH, LANES,
                segment.p1.screen.x, segment.p1.screen.y, segment.p1.screen.w,
                segment.p2.screen.x, segment.p2.screen.y, segment.p2.screen.w,
                segment.fog, segment.color,
            );

            segment.clip = maxy;
            maxy = segment.p2.screen.y;
        }
    }
}
