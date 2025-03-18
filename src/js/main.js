import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import PreloaderScene from './scenes/PreloaderScene';
import MainMenuScene from './scenes/MainMenuScene';
import CombatScene from './scenes/CombatScene';
import MapScene from './scenes/MapScene';

// Game configuration
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#000',
    scene: [
        BootScene,
        PreloaderScene,
        MainMenuScene,
        CombatScene,
        MapScene
    ],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Create the game instance
const game = new Phaser.Game(config);

// Add the game to window for debugging
window.game = game;
