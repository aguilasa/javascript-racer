import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',
    // Phaser v4's WebGL FillPath simplifies filled paths by dropping any interior point
    // that lands within `pathDetailThreshold` px (x and y) of the previous kept point —
    // default is 1px. The road is built from hundreds of thin, abutting trapezoids that
    // shrink toward the vanishing point, so near the horizon two corners of the same
    // quad routinely land within 1px of each other; the simplifier then collapses the
    // quad and the road surface silently fails to draw there, leaving the grass drawn
    // underneath it visible ("grass" bleeding into the track near the horizon). Disable
    // the simplification — these are simple 4-point quads, there's nothing to simplify.
    render: {
        pathDetailThreshold: 0,
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        GameOver
    ]
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
