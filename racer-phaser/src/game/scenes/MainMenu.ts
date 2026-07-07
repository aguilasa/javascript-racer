import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    title: GameObjects.Text;
    instructions: GameObjects.Text;
    startPrompt: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor('#87CEEB'); // Sky blue background

        this.title = this.add.text(512, 200, 'JAVASCRIPT RACER', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.instructions = this.add.text(512, 320, 'Use Arrow Keys or WASD to drive\nPress UP/W to accelerate\nPress DOWN/S to brake', {
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        this.startPrompt = this.add.text(512, 450, 'Click or press any key to start', {
            fontFamily: 'Arial', fontSize: 28, color: '#ffff00',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.start('Game');
        });

        this.input.keyboard!.once('keydown', () => {
            this.scene.start('Game');
        });
    }
}
