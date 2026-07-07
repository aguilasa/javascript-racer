import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { RoadRenderer } from '../racer/RoadRenderer';
import { SceneryRenderer } from '../racer/SceneryRenderer';
import { TrafficRenderer } from '../racer/TrafficRenderer';
import { Hud } from '../racer/Hud';
import { COLORS } from '../racer/constants';
import { SPRITES } from '../racer/sprites';
import { BACKGROUND } from '../racer/background';
import { RacerEngine, RenderState } from '../racer/RacerEngine';

export class Game extends Scene
{
    private racerEngine!: RacerEngine;
    private roadRenderer!: RoadRenderer;
    private sceneryRenderer!: SceneryRenderer;
    private trafficRenderer!: TrafficRenderer;
    private hud!: Hud;
    private playerSprite!: Phaser.GameObjects.Image;
    private keys!: { left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key; up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; a: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key; w: Phaser.Input.Keyboard.Key; s: Phaser.Input.Keyboard.Key };
    private skyTileSprite!: Phaser.GameObjects.TileSprite;
    private hillsTileSprite!: Phaser.GameObjects.TileSprite;
    private treesTileSprite!: Phaser.GameObjects.TileSprite;
    private music!: Phaser.Sound.BaseSound;
    private muteText!: Phaser.GameObjects.Text;

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
        this.sceneryRenderer = new SceneryRenderer(this);
        this.trafficRenderer = new TrafficRenderer(this);
        this.hud = new Hud(this);

        // Create player sprite pool (single image reused)
        this.playerSprite = this.add.image(0, 0, 'sprites');
        this.playerSprite.setOrigin(0.5, 1);
        // Participa da ordenação por profundidade unificada com sprites/carros
        // (PHASER-TASK-14) — depth calculado dinamicamente em renderPlayer()
        this.playerSprite.setDepth(0);

        // Setup keyboard input (called once, not every frame)
        this.keys = this.input.keyboard!.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            up: Phaser.Input.Keyboard.KeyCodes.UP,
            down: Phaser.Input.Keyboard.KeyCodes.DOWN,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            d: Phaser.Input.Keyboard.KeyCodes.D,
            w: Phaser.Input.Keyboard.KeyCodes.W,
            s: Phaser.Input.Keyboard.KeyCodes.S,
        }) as typeof this.keys;

        // Create parallax background layers (sky, hills, trees)
        // Order: sky (back), hills (middle), trees (front) - same as Renderer.background() calls
        this.skyTileSprite = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'racer_background', 'SKY');
        this.skyTileSprite.setOrigin(0, 0);
        this.skyTileSprite.setDepth(-3);

        this.hillsTileSprite = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'racer_background', 'HILLS');
        this.hillsTileSprite.setOrigin(0, 0);
        this.hillsTileSprite.setDepth(-2);

        this.treesTileSprite = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'racer_background', 'TREES');
        this.treesTileSprite.setOrigin(0, 0);
        this.treesTileSprite.setDepth(-1);

        // Music setup (PHASER-TASK-16)
        this.music = this.sound.add('music', { loop: true, volume: 0.05 });
        const isMuted = localStorage.getItem('muted') === 'true';
        this.music.setMute(isMuted);
        this.music.play();

        // Mute button (text-based, clickable)
        this.muteText = this.add.text(this.scale.width - 80, 10, isMuted ? '🔇' : '🔊', {
            fontSize: '24px',
            color: '#fff',
            backgroundColor: '#000',
            padding: { x: 8, y: 4 }
        });
        this.muteText.setInteractive({ useHandCursor: true });
        this.muteText.on('pointerdown', () => {
            const newMuted = !this.music.mute;
            this.music.setMute(newMuted);
            localStorage.setItem('muted', String(newMuted));
            this.muteText.setText(newMuted ? '🔇' : '🔊');
        });
    }

    update (_time: number, delta: number)
    {
        // Update input flags from keyboard
        this.racerEngine.keyLeft = this.keys.left.isDown || this.keys.a.isDown;
        this.racerEngine.keyRight = this.keys.right.isDown || this.keys.d.isDown;
        this.racerEngine.keyFaster = this.keys.up.isDown || this.keys.w.isDown;
        this.racerEngine.keySlower = this.keys.down.isDown || this.keys.s.isDown;

        // Fixed timestep accumulator (same pattern as GameLoop.start)
        const dt = Math.min(1, delta / 1000);
        this.gdt = this.gdt + dt;
        while (this.gdt > this.step) {
            this.gdt = this.gdt - this.step;
            this.racerEngine.update(this.step);
        }

        const state = this.racerEngine.getRenderState();
        this.renderParallax(state);
        this.renderRoad(state);
        this.renderScenery(state);
        this.renderTraffic(state);
        this.renderPlayer(state);
        this.renderHud(state);
    }


    private renderParallax(state: RenderState): void
    {

        // Update tilePositionX based on parallax offsets
        // Same relationship as Renderer.background() uses for sourceX calculation
        // layer.w is the width of the layer in the texture (1280 for all background layers)
        this.skyTileSprite.tilePositionX = state.skyOffset * BACKGROUND.SKY.w;
        this.hillsTileSprite.tilePositionX = state.hillOffset * BACKGROUND.HILLS.w;
        this.treesTileSprite.tilePositionX = state.treeOffset * BACKGROUND.TREES.w;
    }

    private renderRoad(state: RenderState): void
    {
        const segments = state.segments;
        const baseIndex = state.baseSegment.index;

        this.roadRenderer.clear();

        for (let n = 0; n < state.drawDistance; n++) {
            const segment = segments[(baseIndex + n) % segments.length]!;

            if (segment.clip === undefined) continue; // getRenderState() already culled this segment

            this.roadRenderer.segment(
                state.width, this.racerEngine.lanes,
                segment.p1.screen.x, segment.p1.screen.y, segment.p1.screen.w!,
                segment.p2.screen.x, segment.p2.screen.y, segment.p2.screen.w!,
                segment.fog!, segment.color,
            );
        }
    }

    private renderScenery(state: RenderState): void
    {

        this.sceneryRenderer.clear();
        this.sceneryRenderer.draw(
            state.width,
            state.roadWidth,
            state.baseSegment,
            state.segments,
            state.drawDistance,
            state.maxy,
        );
    }

    private renderTraffic(state: RenderState): void
    {
        this.trafficRenderer.clear();
        this.trafficRenderer.draw(
            state.width,
            state.roadWidth,
            state.baseSegment,
            state.segments,
            state.drawDistance,
            state.maxy,
        );
    }

    private renderPlayer(state: RenderState): void
    {
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

        const spriteRect = (SPRITES as any)[frameName] as { x: number; y: number; w: number; h: number };

        // Set frame and position
        this.playerSprite.setFrame(frameName);
        this.playerSprite.setPosition(state.width / 2, state.screenY + bounce);

        // Scale: same formula as Renderer.sprite() for player
        const scale = (spriteRect.w * state.cameraDepth / state.playerZ * state.width / 2) * (SPRITES.SCALE * roadWidth);
        const destH = (spriteRect.h * state.cameraDepth / state.playerZ * state.width / 2) * (SPRITES.SCALE * roadWidth);
        this.playerSprite.setScale(scale / spriteRect.w, destH / spriteRect.h);

        // Participa da ordenação por profundidade unificada (PHASER-TASK-14)
        // Usa cameraZ do playerSegment — mais distante fica atrás
        this.playerSprite.setDepth(100000 - state.playerSegment.p1.camera.z);
    }

    private renderHud(state: RenderState): void
    {
        this.hud.updateSpeed(state.speed);
        this.hud.updateCurrentLapTime(state.currentLapTime);

        // Check if a lap was just completed
        if (state.lastLapTime !== null) {
            this.hud.onLapComplete(state.lastLapTime);
            // Reset lastLapTime in engine to avoid triggering multiple times
            this.racerEngine.resetLastLapTime();
        }
    }
}
