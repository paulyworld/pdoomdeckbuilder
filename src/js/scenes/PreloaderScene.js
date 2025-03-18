import Phaser from 'phaser';

export default class PreloaderScene extends Phaser.Scene {
    constructor() {
        super('PreloaderScene');
    }

    preload() {
        // Create loading bar
        this.createLoadingBar();

        // Load UI assets
        this.load.image('background', 'assets/images/ui/background.png');
        this.load.image('title', 'assets/images/ui/title.png');
        this.load.image('button', 'assets/images/ui/button.png');
        this.load.image('energy-icon', 'assets/images/ui/energy-icon.png');
        this.load.image('health-icon', 'assets/images/ui/health-icon.png');

        // Load card assets (placeholder for now)
        this.load.image('card-back', 'assets/images/cards/card-back.png');
        
        // Placeholder card fronts for different categories
        this.load.image('card-alignment', 'assets/images/cards/card-alignment.png');
        this.load.image('card-misuse', 'assets/images/cards/card-misuse.png');
        this.load.image('card-structure', 'assets/images/cards/card-structure.png');
        this.load.image('card-autonomous', 'assets/images/cards/card-autonomous.png');
        this.load.image('card-superintelligence', 'assets/images/cards/card-superintelligence.png');
        this.load.image('card-hope', 'assets/images/cards/card-hope.png');
        
        // Load enemy assets
        this.load.image('enemy-alignment', 'assets/images/characters/enemy-alignment.png');
        
        // Load player assets
        this.load.image('player', 'assets/images/characters/player.png');
        
        // Load map assets
        this.load.image('map-node', 'assets/images/ui/map-node.png');
        this.load.image('map-node-current', 'assets/images/ui/map-node-current.png');
        this.load.image('map-connection', 'assets/images/ui/map-connection.png');
        
        // Load audio (commented out for prototype)
        // this.load.audio('card-play', 'assets/audio/card-play.mp3');
        // this.load.audio('button-click', 'assets/audio/button-click.mp3');
    }

    create() {
        // Create some placeholder assets if needed (for development)
        this.createPlaceholderAssets();
        
        // Start the main menu scene
        this.scene.start('MainMenuScene');
    }

    createLoadingBar() {
        // Calculate bar position
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add logo
        const logo = this.add.image(width / 2, height / 2 - 100, 'logo');
        logo.setScale(0.5);
        
        // Create progress bar background
        const progressBarBg = this.add.image(width / 2, height / 2 + 50, 'loading-bar-bg');
        const progressBar = this.add.image(width / 2 - progressBarBg.width / 2, height / 2 + 50, 'loading-bar-fill');
        progressBar.setOrigin(0, 0.5);
        
        // Add loading text
        const loadingText = this.add.text(width / 2, height / 2 + 100, 'Loading...', {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#ffffff'
        });
        loadingText.setOrigin(0.5);
        
        // Setup progress bar animation
        this.load.on('progress', (value) => {
            // Update the width of the progress bar
            progressBar.displayWidth = value * progressBarBg.width;
            
            // Update text with percentage
            loadingText.setText(`Loading... ${Math.floor(value * 100)}%`);
        });
    }

    createPlaceholderAssets() {
        this.createBasicPlaceholder('background', 1280, 720, 0x222222, 'BACKGROUND');
        this.createBasicPlaceholder('button', 200, 60, 0x444444, 'BUTTON');
        this.createBasicPlaceholder('health-icon', 40, 40, 0xff0000, 'HP');
        this.createBasicPlaceholder('energy-icon', 40, 40, 0x0000ff, 'EN');
        this.createBasicPlaceholder('map-node', 40, 40, 0x666666, 'NODE');
        this.createBasicPlaceholder('map-node-current', 40, 40, 0xffff00, 'CUR');
        
        // Card placeholders
        this.createCardPlaceholder('card-back', 0x000000, 'CARD BACK');
        this.createCardPlaceholder('card-alignment', 0x3498db, 'ALIGNMENT');
        this.createCardPlaceholder('card-misuse', 0xe74c3c, 'MISUSE');
        this.createCardPlaceholder('card-structure', 0x9b59b6, 'STRUCTURE');
        this.createCardPlaceholder('card-autonomous', 0xf1c40f, 'AUTONOMOUS');
        this.createCardPlaceholder('card-superintelligence', 0x34495e, 'SUPER INT');
        this.createCardPlaceholder('card-hope', 0x2ecc71, 'HOPE');
        
        // Character placeholders
        this.createCharacterPlaceholder('player', 0x00aa00, 'PLAYER');
        this.createCharacterPlaceholder('enemy-alignment', 0xaa0000, 'ENEMY');
    }
    
    createBasicPlaceholder(key, width, height, color, label) {
        if (!this.textures.exists(key)) {
            const rt = this.add.renderTexture(0, 0, width, height);
            rt.fill(color);
            
            // Add label
            const labelText = this.add.text(width/2, height/2, label, {
                fontFamily: 'Arial',
                fontSize: Math.min(width, height) / 4,
                color: '#ffffff',
                fontStyle: 'bold'
            });
            labelText.setOrigin(0.5);
            
            rt.draw(labelText);
            rt.saveTexture(key);
            
            // Clean up
            rt.destroy();
            labelText.destroy();
        }
    }
    
    createCardPlaceholder(key, color, label) {
        if (!this.textures.exists(key)) {
            // Card dimensions
            const width = 200;
            const height = 280;
            
            const rt = this.add.renderTexture(0, 0, width, height);
            
            // Draw card background
            rt.fill(0x000000);
            
            // Draw card inner area with category color
            const graphics = this.make.graphics();
            graphics.fillStyle(color);
            graphics.fillRect(10, 10, width - 20, height - 20);
            rt.draw(graphics, 0, 0);
            
            // Add label
            const labelText = this.add.text(width/2, height/2, label, {
                fontFamily: 'Arial',
                fontSize: 20,
                color: '#ffffff',
                fontStyle: 'bold',
                align: 'center',
                wordWrap: { width: width - 40 }
            });
            labelText.setOrigin(0.5);
            
            // Add cost circle
            graphics.clear();
            graphics.fillStyle(0x0000aa);
            graphics.fillCircle(30, 30, 20);
            rt.draw(graphics, 0, 0);
            
            // Add cost number
            const costText = this.add.text(30, 30, "1", {
                fontFamily: 'Arial',
                fontSize: 18,
                color: '#ffffff',
                fontStyle: 'bold'
            });
            costText.setOrigin(0.5);
            
            // Draw all elements to the texture
            rt.draw(labelText);
            rt.draw(costText);
            
            // Save the texture
            rt.saveTexture(key);
            
            // Clean up
            rt.destroy();
            labelText.destroy();
            costText.destroy();
            graphics.destroy();
        }
    }
    
    createCharacterPlaceholder(key, color, label) {
        if (!this.textures.exists(key)) {
            // Character dimensions
            const width = 200;
            const height = 300;
            
            const rt = this.add.renderTexture(0, 0, width, height);
            
            // Draw character body
            const graphics = this.make.graphics();
            graphics.fillStyle(color);
            graphics.fillRect(50, 100, 100, 200);
            
            // Draw character head
            graphics.fillStyle(color < 0x888888 ? 0xffffff : 0x000000);
            graphics.fillCircle(100, 60, 40);
            
            rt.draw(graphics, 0, 0);
            
            // Add label
            const labelText = this.add.text(width/2, height/2, label, {
                fontFamily: 'Arial',
                fontSize: 24,
                color: '#ffffff',
                fontStyle: 'bold',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            });
            labelText.setOrigin(0.5);
            
            rt.draw(labelText);
            
            // Save the texture
            rt.saveTexture(key);
            
            // Clean up
            rt.destroy();
            labelText.destroy();
            graphics.destroy();
        }
    }

    createCategoryPlaceholders() {
        // Create placeholder card fronts for each category
        const categories = [
            { key: 'card-alignment', color: 0x3498db },
            { key: 'card-misuse', color: 0xe74c3c },
            { key: 'card-structure', color: 0x9b59b6 },
            { key: 'card-autonomous', color: 0xf1c40f },
            { key: 'card-superintelligence', color: 0x34495e },
            { key: 'card-hope', color: 0x2ecc71 }
        ];
        
        categories.forEach(category => {
            if (!this.textures.exists(category.key)) {
                const graphics = this.make.graphics();
                graphics.fillStyle(0x000000);
                graphics.fillRect(0, 0, 200, 280);
                graphics.fillStyle(category.color);
                graphics.fillRect(10, 10, 180, 260);
                graphics.fillStyle(0xffffff);
                graphics.fillRect(20, 20, 160, 40);
                graphics.fillRect(20, 140, 160, 100);
                graphics.generateTexture(category.key, 200, 280);
                graphics.clear();
            }
        });
    }
}
