import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load minimal assets needed for the loading screen
        this.load.image('logo', 'assets/images/ui/logo-placeholder.png');
        this.load.image('loading-bar-bg', 'assets/images/ui/loading-bar-bg.png');
        this.load.image('loading-bar-fill', 'assets/images/ui/loading-bar-fill.png');
    }

    create() {
        // Set up any global game settings
        this.registry.set('player-health', 50);
        this.registry.set('player-max-health', 50);
        this.registry.set('player-energy', 3);
        this.registry.set('player-max-energy', 3);

        // Transition to the Preloader scene
        this.scene.start('PreloaderScene');
    }
}
