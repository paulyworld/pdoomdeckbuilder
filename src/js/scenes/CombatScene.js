import Phaser from 'phaser';
import Player from '../components/Player';
import Enemy from '../components/Enemy';
import Card from '../components/Card';
import { StartingDeck, CardData } from '../config/CardData';
import { Encounters } from '../config/EnemyData';
import TooltipManager from '../components/TooltipManager';

export default class CombatScene extends Phaser.Scene {
    constructor() {
        super('CombatScene');
        
        // Combat state
        this.isPlayerTurn = true;
        this.targetingMode = false;
        this.selectedCard = null;
        this.turnCount = 0;
        
        // Cards
        this.hand = [];
        this.cardPositions = [];
        this.handSize = 0;
    }
    
    init(data) {
        
        // Check if returning from another scene (like combat)
    if (data && data.returning) {
        console.log("Returning to map from another scene");
        // Don't reset the current node index
        } else {
        // Reset for new game
        this.currentNodeIndex = 0;
        }

        // Default to normal combat if not specified
        this.encounterType = data.nodeType || 'combat';
        this.returnScene = data.returnScene || 'MapScene';
        
        // Store specific enemy key if provided
        this.enemyKey = data.enemyKey;
        
        // Determine if this is a test mode or part of the main game
        this.isTestMode = data.isTestMode || false;
        
        // If test mode, ensure we initialize player health differently
        if (this.isTestMode) {
            // For test mode, set health to max without affecting the real game
            this.registry.set('test-player-health', 50);
            this.registry.set('test-player-max-health', 50);
            this.registry.set('test-player-energy', 3);
            this.registry.set('test-player-max-energy', 3);
        }
    }
    
    create() {
        // Add background
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.add.image(width / 2, height / 2, 'background');
        
        // Position player on the left side
        this.player = new Player(this, width * 0.25, height / 2);
        
        // Create enemies based on encounter type - will adjust this in createEnemies()
        this.createEnemies();
        
        // Setup player deck
        this.setupDeck();
        
        // Create UI elements
        this.createUI();
        
        // Start first turn
        this.startPlayerTurn();

        // Initialize tooltip manager
        this.tooltipManager = new TooltipManager(this);
    }
    
    createEnemies() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Import enemy data
        const { EnemyData, Encounters } = require('../config/EnemyData');
        
        let enemyDataList;
        
        // Check if a specific enemy was requested
        if (this.enemyKey && EnemyData[this.enemyKey]) {
            console.log(`Creating specific enemy: ${this.enemyKey}`);
            enemyDataList = [EnemyData[this.enemyKey]];
        } else {
            // Choose enemy set based on encounter type
            let encounterPool;
            switch(this.encounterType) {
                case 'elite':
                    encounterPool = Encounters.elite;
                    break;
                case 'boss':
                    encounterPool = Encounters.boss;
                    break;
                default:
                    encounterPool = Encounters.normal;
            }
            
            // Randomly select an encounter from the pool
            const encounterIndex = Math.floor(Math.random() * encounterPool.length);
            enemyDataList = encounterPool[encounterIndex];
        }
        
        // Create enemies
        this.enemies = [];
        
        for (let i = 0; i < enemyDataList.length; i++) {
            const enemyData = enemyDataList[i];
            
            // Calculate position based on number of enemies
            const enemyX = width / 2 + (i - (enemyDataList.length - 1) / 2) * 200;
            const enemyY = 200;
            
            const enemy = new Enemy(this, enemyX, enemyY, enemyData);
            this.enemies.push(enemy);
        }
    }
    
    // Update the init method to capture the enemy key:
    init(data) {
        // Default to normal combat if not specified
        this.encounterType = data.nodeType || 'combat';
        this.returnScene = data.returnScene || 'MapScene';
        
        // Store specific enemy key if provided
        this.enemyKey = data.enemyKey;
    }
    
    // Update the init method to capture the enemy key:
    init(data) {
        // Default to normal combat if not specified
        this.encounterType = data.nodeType || 'combat';
        this.returnScene = data.returnScene || 'MapScene';
        
        // Store specific enemy key if provided
        this.enemyKey = data.enemyKey;
    }
    
    setupDeck() {
        // Initialize player's deck with starting cards
        this.player.deck.setupStartingDeck(StartingDeck);
    }
    
    createUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add End Run button in top right corner
        this.endRunButton = this.add.text(width - 20, 20, 'End Run', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#ffffff',
            backgroundColor: '#aa0000',
            padding: { x: 10, y: 5 }
        });
        this.endRunButton.setOrigin(1, 0); // Align to top-right
        this.endRunButton.setInteractive({ useHandCursor: true });
        
        // Add hover effects
        this.endRunButton.on('pointerover', () => {
            this.endRunButton.setBackgroundColor('#cc0000');
        });
        
        this.endRunButton.on('pointerout', () => {
            this.endRunButton.setBackgroundColor('#aa0000');
        });
        
        // Add click handler to show confirmation dialog
        this.endRunButton.on('pointerdown', () => {
            this.showEndRunConfirmation();
        });
        
        // Create end turn button in bottom right corner
        this.endTurnButton = this.add.text(width - 150, height - 150, 'END TURN', {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#ffffff',
            backgroundColor: '#aa0000',
            padding: { x: 10, y: 5 }
        });
        this.endTurnButton.setInteractive({ useHandCursor: true });
        
        this.endTurnButton.on('pointerover', () => {
            this.endTurnButton.setBackgroundColor('#dd0000');
        });
        
        this.endTurnButton.on('pointerout', () => {
            this.endTurnButton.setBackgroundColor('#aa0000');
        });
        
        this.endTurnButton.on('pointerdown', () => {
            this.endPlayerTurn();
        });
        
        // Create draw pile indicator that can be clicked
    this.drawPileIcon = this.add.image(100, height - 50, 'card-back');
    this.drawPileIcon.setScale(0.3); // Make it smaller
    this.drawPileIcon.setInteractive({ useHandCursor: true });
    
        // Draw pile count text
    this.drawPileText = this.add.text(100, height - 20, 'Draw: 0', {
        fontFamily: 'Arial',
        fontSize: 16,
        color: '#ffffff'
    });
    this.drawPileText.setOrigin(0.5);
    
    // Add click handler to show next 3 cards
    this.drawPileIcon.on('pointerdown', () => {
        this.showDrawPilePreview();
    });
    
    
    // Discard pile indicator
    this.discardPileIcon = this.add.image(width - 100, height - 50, 'card-back');
    this.discardPileIcon.setScale(0.3);
    this.discardPileIcon.setTint(0xaaaaaa); // Gray tint to distinguish from draw pile
    
    // Discard pile count text
    this.discardPileText = this.add.text(width - 100, height - 20, 'Discard: 0', {
        fontFamily: 'Arial',
        fontSize: 16,
        color: '#ffffff'
    });
    this.discardPileText.setOrigin(0.5);
    
    // Create turn counter at the top center
    this.turnCounterText = this.add.text(width / 2, 30, 'Turn 1', {
        fontFamily: 'Arial',
        fontSize: 18,
        color: '#ffffff',
        fontStyle: 'bold'
    });
    this.turnCounterText.setOrigin(0.5);
    
    // Create hand area for cards at the bottom
    this.handArea = this.add.rectangle(width / 2, height - 80, width, 160, 0x000000, 0.3);
    
}
    // Add a method to show the draw pile preview
showDrawPilePreview() {
    // Get next 3 cards from draw pile
    const topCards = this.player.deck.peekDrawPile(3);
    
    if (topCards.length === 0) {
        // No cards to preview
        this.showMessage("Draw pile is empty");
        return;
    }
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Create a container for the preview
    this.previewContainer = this.add.container(0, 0);
    
    // Semi-transparent background
    const bg = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.7);
    this.previewContainer.add(bg);
    
    // Title
    const title = this.add.text(width/2, height/3 - 50, 'NEXT CARDS TO DRAW', {
        fontFamily: 'Arial',
        fontSize: 24,
        color: '#ffffff',
        fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    this.previewContainer.add(title);
    
    // Display preview cards
    const cardSpacing = 220;
    const startX = width/2 - ((topCards.length - 1) * cardSpacing/2);
    
    topCards.forEach((cardData, index) => {
        const cardX = startX + (index * cardSpacing);
        const cardY = height/2;
        
        // Create a visual representation of the card
        const card = new Card(this, cardX, cardY, cardData);
        this.previewContainer.add(card.container);
    });
    
    
    // Add close button
    const closeButton = this.add.text(width/2, height * 3/4, 'CLOSE', {
        fontFamily: 'Arial',
        fontSize: 20,
        color: '#ffffff',
        backgroundColor: '#444444',
        padding: { x: 20, y: 10 }
    });
    closeButton.setOrigin(0.5);
    closeButton.setInteractive({ useHandCursor: true });
    
    closeButton.on('pointerover', () => {
        closeButton.setBackgroundColor('#666666');
    });
    
    closeButton.on('pointerout', () => {
        closeButton.setBackgroundColor('#444444');
    });
    
    closeButton.on('pointerdown', () => {
        this.previewContainer.destroy();
    });
    
    this.previewContainer.add(closeButton);
    
    // Make background clickable to close
    bg.setInteractive();
    bg.on('pointerdown', () => {
        this.previewContainer.destroy();
    });
    
    // Bring to top
    this.children.bringToTop(this.previewContainer);
}
showMessage(message) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Create message box
    const messageBg = this.add.rectangle(width / 2, height / 2, 400, 100, 0x000000, 0.8);
    messageBg.setStrokeStyle(2, 0xffffff);
    
    // Add message text
    const messageText = this.add.text(width / 2, height / 2, message, {
        fontFamily: 'Arial',
        fontSize: 20,
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: 380 }
    });
    messageText.setOrigin(0.5);
    
    // Create a container for both elements
    const container = this.add.container(0, 0, [messageBg, messageText]);
    
    // Auto-remove after a delay
    this.time.delayedCall(2000, () => {
        container.destroy();
    });
    
    // Bring to top
    this.children.bringToTop(container);
    
    return container;
}

    // Add a new method for the confirmation dialog
    showEndRunConfirmation() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a container for all confirmation elements
        this.confirmContainer = this.add.container(0, 0);
        
        // Semi-transparent background overlay
        const overlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.7);
        this.confirmContainer.add(overlay);
        
        // Confirmation dialog background
        const dialogBg = this.add.rectangle(width/2, height/2, 400, 200, 0x333333, 0.9);
        dialogBg.setStrokeStyle(2, 0xffffff);
        this.confirmContainer.add(dialogBg);
        
        // Confirmation title
        const title = this.add.text(width/2, height/2 - 60, 'END CURRENT RUN?', {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffffff',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        this.confirmContainer.add(title);
        
        // Confirmation message
        const message = this.add.text(width/2, height/2 - 20, 'All progress in this run will be lost.', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#ffffff'
        });
        message.setOrigin(0.5);
        this.confirmContainer.add(message);
        
        // "Yes" button
        const yesButton = this.add.text(width/2 - 80, height/2 + 40, 'YES', {
            fontFamily: 'Arial',
            fontSize: 18,
            color: '#ffffff',
            backgroundColor: '#aa0000',
            padding: { x: 20, y: 10 }
        });
        yesButton.setOrigin(0.5);
        yesButton.setInteractive({ useHandCursor: true });
        
        yesButton.on('pointerover', () => {
            yesButton.setBackgroundColor('#cc0000');
        });
        
        yesButton.on('pointerout', () => {
            yesButton.setBackgroundColor('#aa0000');
        });
        
        // IMPORTANT: Make the Yes button a direct child of the scene, not the container
        // This ensures it remains interactive even with the container
        
        // "No" button
        const noButton = this.add.text(width/2 + 80, height/2 + 40, 'NO', {
            fontFamily: 'Arial',
            fontSize: 18,
            color: '#ffffff',
            backgroundColor: '#444444',
            padding: { x: 20, y: 10 }
        });
        noButton.setOrigin(0.5);
        noButton.setInteractive({ useHandCursor: true });
        
        noButton.on('pointerover', () => {
            noButton.setBackgroundColor('#666666');
        });
        
        noButton.on('pointerout', () => {
            noButton.setBackgroundColor('#444444');
        });
        
        // Add click handlers AFTER adding to the container
        yesButton.on('pointerdown', () => {
            console.log("Yes button clicked!");
            // End the run and return to main menu
            this.scene.start('MainMenuScene');
        });
        
        noButton.on('pointerdown', () => {
            console.log("No button clicked!");
            // Close the confirmation dialog
            this.confirmContainer.destroy();
        });
        
        // Add buttons to container AFTER setting up all event handlers
        this.confirmContainer.add(yesButton);
        this.confirmContainer.add(noButton);
        
        // Ensure the container is on top of everything
        this.children.bringToTop(this.confirmContainer);
        
        // Make the entire container interactive to prevent clicks on elements below
        overlay.setInteractive();
    }

    startPlayerTurn() {
        this.isPlayerTurn = true;
        this.turnCount++;
        this.turnCounterText.setText(`Turn ${this.turnCount}`);
        
        console.log(`=== Starting Player Turn ${this.turnCount} ===`);
        this.player.deck.debugPrintState(); // Add this debug call
        
        // Draw cards (this now adds to the existing hand)
        const drawnCards = this.player.startTurn();
        console.log(`Drew ${drawnCards.length} new cards`);
        
        // Add new cards to the visual hand with animation
        this.addCardsToHand(drawnCards);
        
        // Update pile counts
        this.updatePileCounts();
        
        // Debug after drawing
        this.player.deck.debugPrintState(); // Add this debug call
    }
    
    // Add a new method to add cards to the existing hand
    addCardsToHand(cardDataList) {
        if (cardDataList.length === 0) return;
        
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Calculate new total hand size
        const newHandSize = this.hand.length + cardDataList.length;
        const actualCardsToAdd = Math.min(cardDataList.length, this.player.deck.maxHandSize - this.hand.length);
        
        // Calculate card layout parameters
        const cardScale = 0.85; // Make cards slightly smaller
        
        // Fixed position parameters to ensure visibility
        const cardY = height - 100; // Fixed Y position - bottom of screen + margin
        const arcAngleSpan = Math.PI * 0.25; // Angle span for the fan
        
        // Calculate card positions
        this.cardPositions = [];
        
        if (newHandSize > 0) {
            const angleStep = newHandSize > 1 ? arcAngleSpan / (newHandSize - 1) : 0;
            const startAngle = Math.PI / 2 - arcAngleSpan / 2; // Center the arc
            
            for (let i = 0; i < newHandSize; i++) {
                // X position along screen width
                const percentPosition = newHandSize > 1 ? i / (newHandSize - 1) : 0.5;
                const x = width * 0.2 + (width * 0.6 * percentPosition); // Use middle 60% of screen
                
                // Calculate angle for rotation (based on position)
                const angle = startAngle + (i * angleStep);
                const cardAngle = (angle * 180 / Math.PI) - 90; // Convert to degrees
                
                // Add position to array
                this.cardPositions.push({
                    x: x,
                    y: cardY,
                    angle: cardAngle
                });
            }

            console.log("Calculated Card Positions:", this.cardPositions);

        }
        
        // Create new cards off-screen to the left
        const newCards = [];
        for (let i = 0; i < actualCardsToAdd; i++) {
            const offScreenX = -100; // Start off-screen
            const cardData = cardDataList[i];
            
            // Create card off-screen
            const card = new Card(this, offScreenX, height - 100, cardData);
            card.container.alpha = 0; // Start invisible
            card.container.setScale(cardScale); // Apply the smaller scale
            
            // Store for animation
            newCards.push(card);
        }
        
        // Animate existing cards sliding to new positions
        for (let i = 0; i < this.hand.length; i++) {
            const card = this.hand[i];
            const newPos = this.cardPositions[i + actualCardsToAdd]; // Shift right
            
            // Animate the card moving
            this.tweens.add({
                targets: card.container,
                x: newPos.x,
                y: newPos.y,
                angle: newPos.angle, // Rotate card to match arc
                duration: 300,
                ease: 'Cubic.easeOut'
            });
            
            // Update hand index
            card.handIndex = i + actualCardsToAdd;
        }
        
        // After a short delay, animate new cards entering from left
        this.time.delayedCall(100, () => {
            for (let i = 0; i < newCards.length; i++) {
                const card = newCards[i];
                const targetPos = this.cardPositions[i];
                
                // Add to hand
                card.addToHand(i);
                this.hand.unshift(card); // Add to front of array
                
                // Animate card entry
                this.tweens.add({
                    targets: card.container,
                    x: targetPos.x,
                    y: targetPos.y,
                    angle: targetPos.angle, // Rotate card to match arc
                    alpha: 1,
                    duration: 300,
                    ease: 'Back.easeOut',
                    delay: i * 100 // Stagger the animations
                });
            }
            
            // Update hand size
            this.handSize = this.hand.length;
        });
        
        // Update pile counts
        this.updatePileCounts();
    }

        

    // dealHand(cardDataList) {
    //     // Clear existing hand
    //     this.clearHand();
        
    //     // Calculate card positions
    //     const width = this.cameras.main.width;
    //     const height = this.cameras.main.height;
        
    //     // Make the hand appear at the bottom of the screen, below the player character
    //     const handY = height - 80;
        
    //     // Create visual cards for each card in hand
    //     this.handSize = cardDataList.length;
    //     this.cardPositions = [];
        
    //     const cardSpacing = Math.min(150, (width - 200) / Math.max(1, this.handSize - 1));
    //     const startX = width / 2 - (cardSpacing * (this.handSize - 1)) / 2;
        
    //     for (let i = 0; i < this.handSize; i++) {
    //         const cardX = startX + i * cardSpacing;
    //         this.cardPositions.push({ x: cardX, y: handY });
            
    //         const card = new Card(this, cardX, handY, cardDataList[i]);
    //         card.addToHand(i);
    //         this.hand.push(card);
    //     }
    // }
    
    clearHand() {
        // Destroy all card objects
        this.hand.forEach(card => {
            card.destroy();
        });
        
        this.hand = [];
        this.handSize = 0;
    }
    
    updatePileCounts() {
        const drawCount = this.player.deck.getDrawPileCount();
        const discardCount = this.player.deck.getDiscardPileCount();
        
        console.log(`Updating pile counts - Draw: ${drawCount}, Discard: ${discardCount}`);
        
        this.drawPileText.setText(`Draw: ${drawCount}`);
        this.discardPileText.setText(`Discard: ${discardCount}`);
    }
    
    drawCard(count = 1) {
        // Get card data from deck
        const drawnCardData = this.player.deck.drawCards(count);
        
        if (drawnCardData.length > 0) {
            // Add new cards to hand
            for (const cardData of drawnCardData) {
                const cardX = this.cardPositions[this.handSize].x;
                const cardY = this.cardPositions[this.handSize].y;
                
                const card = new Card(this, cardX, cardY, cardData);
                card.addToHand(this.handSize);
                this.hand.push(card);
                
                this.handSize++;
            }
            
            // Update pile counts
            this.updatePileCounts();
        }
    }
    
    playCard(card) {
        // Check if it's player's turn
        if (!this.isPlayerTurn) return false;
        
        // Check if player has enough energy
        if (!this.player.useEnergy(card.cost)) {
            // Not enough energy
            return false;
        }
        
        // Find card index in hand array
        const handIndex = this.hand.indexOf(card);
        
        // If card needs a target, enter targeting mode
        if (card.type === 'attack' || (card.effects && card.effects.some(e => e.toString().includes('target')))) {
            if (this.enemies.length === 1) {
                // Only one enemy, automatically target it
                this.executeCardEffect(card, this.enemies[0]);
            } else {
                // Multiple enemies, enter targeting mode
                this.targetingMode = true;
                this.selectedCard = card;
                
                // Remove card from hand
                this.removeCardFromHand(card);
                
                // Visual cue that targeting is active
                this.enemies.forEach(enemy => {
                    enemy.sprite.setTint(0x00ff00);
                });
                
                return true;
            }
        } else {
            // No target needed
            this.executeCardEffect(card, null);
        }
        
        // Create a copy of the card data to add to discard pile
        const cardDataForDiscard = {
            id: card.id,
            name: card.name,
            description: card.description,
            cost: card.cost,
            type: card.type,
            category: card.category,
            effects: card.effects
        };
        
        console.log(`Playing card: ${card.name}, adding to discard pile`);
        
        // CRUCIAL FIX: Remove the card from the player's hand array at the correct index
        if (handIndex !== -1 && card.handIndex !== undefined) {
            console.log(`Removing card from player's deck hand at index ${card.handIndex}`);
            this.player.deck.hand.splice(card.handIndex, 1);
        } else {
            console.log("Warning: Couldn't find card index in player's deck hand");
        }
        
        // Add to discard pile
        this.player.deck.addCardToDiscardPile(cardDataForDiscard);
        
        // Remove card from visual hand
        this.removeCardFromHand(card);
        
        // Update pile counts
        this.updatePileCounts();
        
        // Log current state
        console.log(`After playing card - Hand: ${this.player.deck.hand.length}, Draw: ${this.player.deck.drawPile.length}, Discard: ${this.player.deck.discardPile.length}`);
        
        return true;
    }
    

    addCardToDiscardPile(cardData) {
        this.discardPile.push(cardData);
    }

    removeCardFromHand(card) {
        // Find index of card
        const index = this.hand.indexOf(card);
        
        if (index !== -1) {
            // Remove from hand array
            this.hand.splice(index, 1);
            
            // Remove visual card
            card.destroy();
            
            // Update hand positions
            this.repositionHand();
            
            // Update hand size
            this.handSize = this.hand.length;
            
            // IMPORTANT: Do NOT discard the card here - it should be done separately
            // in playCard before this method is called
        }
    }
    
    repositionHand() {
        if (this.hand.length === 0) return;
        
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Fixed position parameters
        const cardY = height - 100; // Fixed Y position
        const arcAngleSpan = Math.PI * 0.25; // Angle span for the fan
        
        // Calculate card positions
        this.cardPositions = [];
        
        const angleStep = this.hand.length > 1 ? arcAngleSpan / (this.hand.length - 1) : 0;
        const startAngle = Math.PI / 2 - arcAngleSpan / 2;
        
        for (let i = 0; i < this.hand.length; i++) {
            // X position along screen width
            const percentPosition = this.hand.length > 1 ? i / (this.hand.length - 1) : 0.5;
            const x = width * 0.2 + (width * 0.6 * percentPosition); // Use middle 60% of screen
            
            // Calculate angle for rotation
            const angle = startAngle + (i * angleStep);
            const cardAngle = (angle * 180 / Math.PI) - 90; // Convert to degrees
            
            // Add position to array
            this.cardPositions.push({
                x: x,
                y: cardY,
                angle: cardAngle
            });
        }
        
        // Update card positions - THIS IS THE FIX
        for (let i = 0; i < this.hand.length; i++) {
            const cardObject = this.hand[i]; // Access the card by index
            const pos = this.cardPositions[i];
            
            // Animate to new position
            this.tweens.add({
                targets: cardObject.container,
                x: pos.x,
                y: pos.y,
                angle: pos.angle,
                duration: 200,
                ease: 'Cubic.easeOut'
            });
            
            cardObject.handIndex = i;
        }
    }
    
    executeCardEffect(card, target) {
        // Execute all card effects
        card.playCard(target);
        
        // Check if combat is over
        this.checkCombatEnd();
    }
    
    onEnemyClicked(enemy) {
        // If in targeting mode, apply effect to the clicked enemy
        if (this.targetingMode && this.selectedCard) {
            this.targetingMode = false;
            
            // Reset targeting visuals
            this.enemies.forEach(e => {
                e.sprite.clearTint();
            });
            
            // Execute card effect on target
            this.executeCardEffect(this.selectedCard, enemy);
            this.selectedCard = null;
        }
    }
    
    applyStatusEffect(target, effectType, duration) {
        console.log(`Attempting to apply ${effectType} to target for ${duration} turns`);
        
        if (!target) {
            console.log('No target provided for status effect');
            return false;
        }
        
        // For enemies
        if (target.addStatusEffect) {
            console.log(`Target has addStatusEffect method, applying ${effectType}`);
            const applied = target.addStatusEffect(effectType, duration);
            
            // If the effect was blocked, we might want to handle that in the card effects
            return applied;
        } else {
            console.log('Target does not have addStatusEffect method');
            return false;
        }
    }
    
    // Apply status effect specifically to player
    applyStatusEffectToPlayer(effectType, duration) {
        this.applyStatusEffect(this.player, effectType, duration);
    }
    
    // For backward compatibility
    applyDebuffToPlayer(effect, value, duration) {
        this.applyStatusEffectToPlayer(effect, duration);
    }
    
    applyStatusEffectToPlayer(effect, duration, value = 0) {
        // Check if player already has this effect
        const existingEffect = this.player.statusEffects.find(e => e.type === effect);
        
        if (existingEffect) {
            // Either add to duration or replace with longer duration
            if (duration > existingEffect.duration) {
                existingEffect.duration = duration;
                
                // Update the visual
                const statusIcon = this.player.statusIcons.find(icon => icon.effect === effect);
                if (statusIcon) {
                    statusIcon.text.setText(duration.toString());
                }
            }
        } else {
            // Add new effect
            this.player.addStatusEffect(effect, duration, value);
        }
    }

    playerTakeDamage(amount) {
        return this.player.takeDamage(amount);
    }
    
    applyDebuffToPlayer(effect, value, duration) {
        this.applyStatusEffect(this.player, effect, duration);
    }
    
    endPlayerTurn() {
        if (!this.isPlayerTurn) return;
        
        this.isPlayerTurn = false;
        
        // DO NOT CLEAR THE HAND - comment out or remove:
        // this.clearHand();
        
        // End player turn
        this.player.endTurn();
        
        // Update pile counts
        this.updatePileCounts();
        
        // Start enemy turns with a short delay
        this.time.delayedCall(500, () => {
            this.startEnemyTurns();
        });
    }
    
    startEnemyTurns() {
        // Execute each enemy turn one after another
        this.processEnemyTurns(0);
    }
    
    processEnemyTurns(index) {
        // If no more enemies, end enemy turn
        if (index >= this.enemies.length) {
            this.endEnemyTurns();
            return;
        }
        
        const enemy = this.enemies[index];
        
        // Skip defeated enemies
        if (enemy.health <= 0) {
            this.processEnemyTurns(index + 1);
            return;
        }
        
        // Execute turn
        enemy.takeTurn();
        
        // Wait a moment, then process next enemy
        this.time.delayedCall(800, () => {
            this.processEnemyTurns(index + 1);
        });
    }
    
    endEnemyTurns() {
        // Check if combat is over
        if (this.checkCombatEnd()) {
            return;
        }
        
        // Start player's turn
        this.startPlayerTurn();
    }
    
    onEnemyDefeated(enemy) {
        // Check if all enemies are defeated
        if (this.enemies.every(e => e.health <= 0)) {
            this.victory();
        }
    }
    
    onPlayerDefeated() {
        this.defeat();
    }
    
    checkCombatEnd() {
        // Check if player is defeated
        if (this.player.health <= 0) {
            this.defeat();
            return true;
        }
        
        // Check if all enemies are defeated
        if (this.enemies.every(e => e.health <= 0)) {
            this.victory();
            return true;
        }
        
        return false;
    }
    
    victory() {
        // Show victory screen
        this.showCombatResult('VICTORY!', 'green', () => {
            // Return to map with returning flag set
            this.scene.start(this.returnScene, { returning: true });
        });
    }
    
    defeat() {
        // Show defeat screen
        this.showCombatResult('DEFEAT', 'red', () => {
            // Return to main menu
            this.scene.start('MainMenuScene');
        });
    }
    
    showCombatResult(message, color, callback) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        
        // Add result text
        const resultText = this.add.text(width / 2, height / 2 - 50, message, {
            fontFamily: 'Arial',
            fontSize: 48,
            color: color,
            fontStyle: 'bold'
        });
        resultText.setOrigin(0.5);
        
        // Add continue button
        const continueButton = this.add.text(width / 2, height / 2 + 50, 'Continue', {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        });
        continueButton.setOrigin(0.5);
        continueButton.setInteractive({ useHandCursor: true });
        
        continueButton.on('pointerover', () => {
            continueButton.setBackgroundColor('#555555');
        });
        
        continueButton.on('pointerout', () => {
            continueButton.setBackgroundColor('#333333');
        });
        
        continueButton.on('pointerdown', callback);
    }
}
