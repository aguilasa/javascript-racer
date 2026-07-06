import { Scene } from 'phaser';
import { SPRITES } from '../racer/sprites';
import { BACKGROUND } from '../racer/background';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game
        this.load.setPath('assets');

        // Load racer assets
        this.load.image('sprites', 'racer/sprites.png');
        this.load.image('background', 'racer/background.png');
        this.load.audio('racer_music', ['racer/music/racer.mp3', 'racer/music/racer.ogg']);

        // Load template assets
        this.load.image('logo', 'logo.png');
    }

    create ()
    {
        // Register named frames for sprites
        const spritesTexture = this.textures.get('sprites');
        for (const [name, rect] of Object.entries(SPRITES)) {
            if (typeof rect === 'object' && 'x' in rect) {
                // Skip non-rect entries (SCALE, BILLBOARDS, PLANTS, CARS)
                spritesTexture.add(name, 0, rect.x, rect.y, rect.w, rect.h);
            }
        }

        // Register named frames for background
        const backgroundTexture = this.textures.get('background');
        for (const [name, rect] of Object.entries(BACKGROUND)) {
            backgroundTexture.add(name, 0, rect.x, rect.y, rect.w, rect.h);
        }

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
