import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { Road, ROAD } from '../racer/Road';
import { RoadRenderer } from '../racer/RoadRenderer';
import { COLORS } from '../racer/constants';
import { SPRITES } from '../racer/sprites';
import * as Util from '../racer/util';
import { RacerEngine } from '../racer/RacerEngine';

export class Game extends Scene
{
    private racerEngine!: RacerEngine;
    private roadRenderer!: RoadRenderer;
    private playerSprite!: Phaser.GameObjects.Image;

    private gdt = 0; // accumulated time for fixed timestep
    private step = 1 / 60; // fixed timestep (60 FPS)

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(Phaser.Display.Color.HexStringToColor(COLORS.SKY).color);

        this.racerEngine = new RacerEngine();
        this.racerEngine.reset();

        this.roadRenderer = new RoadRenderer(this);

        // Create player sprite pool (single image reused)
        this.playerSprite = this.add.image(0, 0, 'sprites');
        this.playerSprite.setOrigin(0.5, 1);
    }

    update (time: number, delta: number)
    {
        // Update input flags from keyboard
        const keys = this.input.keyboard!.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            up: Phaser.Input.Keyboard.KeyCodes.UP,
            down: Phaser.Input.Keyboard.KeyCodes.DOWN,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            d: Phaser.Input.Keyboard.KeyCodes.D,
            w: Phaser.Input.Keyboard.KeyCodes.W,
            s: Phaser.Input.Keyboard.KeyCodes.S,
        });

        this.racerEngine.keyLeft = (keys as any).left.isDown || (keys as any).a.isDown;
        this.racerEngine.keyRight = (keys as any).right.isDown || (keys as any).d.isDown;
        this.racerEngine.keyFaster = (keys as any).up.isDown || (keys as any).w.isDown;
        this.racerEngine.keySlower = (keys as any).down.isDown || (keys as any).s.isDown;

        // Fixed timestep accumulator (same pattern as GameLoop.start)
        const dt = Math.min(1, delta / 1000);
        this.gdt = this.gdt + dt;
        while (this.gdt > this.step) {
            this.gdt = this.gdt - this.step;
            this.racerEngine.update(this.step);
        }

        this.renderRoad();
        this.renderPlayer();
    }


    private renderRoad(): void
    {
        const state = this.racerEngine.getRenderState();
        const segments = state.segments;
        const baseIndex = state.baseSegment.index;

        this.roadRenderer.clear();

        for (let n = 0; n < state.drawDistance; n++) {
            const segment = segments[(baseIndex + n) % segments.length]!;

            if (segment.clip === undefined) continue; // getRenderState() already culled this segment

            this.roadRenderer.segment(
                state.width, this.racerEngine.lanes,
                segment.p1.screen.x, segment.p1.screen.y, segment.p1.screen.w,
                segment.p2.screen.x, segment.p2.screen.y, segment.p2.screen.w,
                segment.fog, segment.color,
            );
        }
    }

    private renderPlayer(): void
    {
        const state = this.racerEngine.getRenderState();
        const speedPercent = state.speed / state.maxSpeed;
        const steer = state.steer;
        const updown = state.updown;
        const resolution = state.resolution;
        const roadWidth = state.roadWidth;

        // Bounce: same formula as Renderer.player()
        const bounce = (1.5 * Math.random() * speedPercent * resolution) * (Math.random() < 0.5 ? -1 : 1);

        // Choose sprite based on steer and updown (same logic as Renderer.player())
        let frameName: string;
        if (steer < 0)
            frameName = (updown > 0) ? 'PLAYER_UPHILL_LEFT' : 'PLAYER_LEFT';
        else if (steer > 0)
            frameName = (updown > 0) ? 'PLAYER_UPHILL_RIGHT' : 'PLAYER_RIGHT';
        else
            frameName = (updown > 0) ? 'PLAYER_UPHILL_STRAIGHT' : 'PLAYER_STRAIGHT';

        const spriteRect = SPRITES[frameName];

        // Set frame and position
        this.playerSprite.setFrame(frameName);
        this.playerSprite.setPosition(state.width / 2, state.screenY + bounce);

        // Scale: same formula as Renderer.sprite() for player
        const scale = (spriteRect.w * state.cameraDepth / state.playerZ * state.width / 2) * (SPRITES.SCALE * roadWidth);
        const destH = (spriteRect.h * state.cameraDepth / state.playerZ * state.width / 2) * (SPRITES.SCALE * roadWidth);
        this.playerSprite.setScale(scale / spriteRect.w, destH / spriteRect.h);
    }
}
