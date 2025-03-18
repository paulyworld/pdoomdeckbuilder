import Phaser from 'phaser';

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        // Get the center position
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add background
        this.add.image(width / 2, height / 2, 'background').setScale(1);
        
        // Add title
        const title = this.add.text(width / 2, height / 4, 'AI RISK DECKBUILDER', {
            fontFamily: 'Arial',
            fontSize: 48,
            color: '#ffffff',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        
        // Add subtitle
        const subtitle = this.add.text(width / 2, height / 4 + 60, 'Existential Risk to Consciousness', {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#aaaaaa'
        });
        subtitle.setOrigin(0.5);
        
        // Create start button
        this.createButton(width / 2, height / 2, 'Start Game', () => {
            this.scene.start('MapScene');
        });
        
        // Create prototype combat button (for direct testing)
        this.createButton(width / 2, height / 2 + 80, 'Test Combat', () => {
            this.showEnemySelector(true); // Pass true to indicate test mode
        });
        
        // Create credits button
        this.createButton(width / 2, height / 2 + 160, 'Credits', () => {
            this.showCredits();
        });
        
        // Add version info
        this.add.text(20, height - 40, 'Prototype Version 0.1', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#666666'
        });
    }
    
    createButton(x, y, text, callback) {
        // Create button background
        const button = this.add.image(x, y, 'button').setScale(2);
        
        // Make button interactive
        button.setInteractive({ useHandCursor: true });
        
        // Add text to button
        const buttonText = this.add.text(x, y, text, {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#ffffff'
        });
        buttonText.setOrigin(0.5);
        
        // Add hover effect
        button.on('pointerover', () => {
            button.setTint(0xaaaaaa);
        });
        
        button.on('pointerout', () => {
            button.clearTint();
        });
        
        // Add click callback
        button.on('pointerdown', callback);
        
        return { button, text: buttonText };
    }
    
    showEnemySelector(isTestMode = false) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a semi-transparent background
        const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        
        // Add title
        const title = this.add.text(width / 2, height / 3 - 50, 'SELECT AN ENEMY', {
            fontFamily: 'Arial',
            fontSize: 30,
            color: '#ffffff',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        
        // Import enemy data
        const { EnemyData } = require('../config/EnemyData');
        
        // Create a list of enemy buttons
        const enemies = Object.keys(EnemyData);
        const buttonSpacing = 60;
        const startY = height / 3;
        
        // Track all UI elements to remove later
        const uiElements = [bg, title];
        
        enemies.forEach((enemyKey, index) => {
            const enemy = EnemyData[enemyKey];
            const buttonY = startY + (index * buttonSpacing);
            
            const enemyButton = this.add.text(width / 2, buttonY, enemy.name, {
                fontFamily: 'Arial',
                fontSize: 20,
                color: '#ffffff',
                backgroundColor: '#444444',
                padding: { x: 20, y: 10 }
            });
            enemyButton.setOrigin(0.5);
            enemyButton.setInteractive({ useHandCursor: true });
            
            // Hover effects
            enemyButton.on('pointerover', () => {
                enemyButton.setBackgroundColor('#666666');
            });
            
            enemyButton.on('pointerout', () => {
                enemyButton.setBackgroundColor('#444444');
            });
            
            // Click handler
            enemyButton.on('pointerdown', () => {
                // Start combat with selected enemy
                this.scene.start('CombatScene', { 
                    enemyKey: enemyKey,
                    nodeType: 'test',
                    returnScene: 'MainMenuScene',
                    isTestMode: isTestMode // Pass the flag
                });
                
                // Clean up UI elements
                uiElements.forEach(element => element.destroy());
    });
            
            uiElements.push(enemyButton);
        });
        
        // Add cancel button
        const cancelButton = this.add.text(width / 2, height - 150, 'Cancel', {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#ffffff',
            backgroundColor: '#aa0000',
            padding: { x: 20, y: 10 }
        });
        cancelButton.setOrigin(0.5);
        cancelButton.setInteractive({ useHandCursor: true });
        
        cancelButton.on('pointerover', () => {
            cancelButton.setBackgroundColor('#cc0000');
        });
        
        cancelButton.on('pointerout', () => {
            cancelButton.setBackgroundColor('#aa0000');
        });
        
        cancelButton.on('pointerdown', () => {
            // Clean up UI elements
            uiElements.forEach(element => element.destroy());
        });
        
        uiElements.push(cancelButton);
    }

    showCredits() {
        // Get the center position
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a semi-transparent background
        const creditsBg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        
        // Add credits title
        const creditsTitle = this.add.text(width / 2, 100, 'CREDITS', {
            fontFamily: 'Arial',
            fontSize: 36,
            color: '#ffffff',
            fontStyle: 'bold'
        });
        creditsTitle.setOrigin(0.5);
        
        // Add credits content
        const creditsContent = this.add.text(width / 2, height / 2 - 50, [
            'Game Design & Development',
            '',
            'Inspired by the Taxonomy of AI Threats',
            'from vagabondmage/ai-threats',
            '',
            'A Roguelike Deckbuilder Exploring',
            'Existential Risks from Advanced AI'
        ], {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#ffffff',
            align: 'center'
        });
        creditsContent.setOrigin(0.5);
        
        // Add close button
        const closeButton = this.createButton(width / 2, height - 100, 'Close', () => {
            // Remove all credits elements
            creditsBg.destroy();
            creditsTitle.destroy();
            creditsContent.destroy();
            closeButton.button.destroy();
            closeButton.text.destroy();
        });
    }
}
