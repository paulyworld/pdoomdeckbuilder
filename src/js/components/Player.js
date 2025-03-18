import Deck from './Deck';

export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        
        // Check if this is a test combat
        const isTestMode = scene.isTestMode || false;
        
        // Track which registry keys to use
        this.registryPrefix = isTestMode ? 'test-' : '';
        
        // Get player data from registry with appropriate prefix
        this.health = scene.registry.get(`${this.registryPrefix}player-health`) || 50;
        this.maxHealth = scene.registry.get(`${this.registryPrefix}player-max-health`) || 50;
        this.energy = scene.registry.get(`${this.registryPrefix}player-energy`) || 3;
        this.maxEnergy = scene.registry.get(`${this.registryPrefix}player-max-energy`) || 3;
        
        // Block and status effects
        this.block = 0;
        this.statusEffects = [];
        
        // Create deck
        this.deck = new Deck(scene);
        
        // Create player visual
        this.createPlayerSprite();
    }
    
    createPlayerSprite() {
        // Create player container
        this.container = this.scene.add.container(this.x, this.y);
        
        // Create player sprite
        this.sprite = this.scene.add.image(0, 0, 'player');
        this.container.add(this.sprite);
        
        // Add health display
        this.healthBar = this.scene.add.graphics();
        this.updateHealthBar();
        this.container.add(this.healthBar);
        
        this.healthText = this.scene.add.text(0, -170, `${this.health}/${this.maxHealth}`, {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#ffffff'
        });
        this.healthText.setOrigin(0.5);
        this.container.add(this.healthText);
        
        // Add energy display
        this.energyContainer = this.scene.add.container(60, -90);
        this.container.add(this.energyContainer);
        
        this.energyIcon = this.scene.add.image(0, 0, 'energy-icon');
        this.energyContainer.add(this.energyIcon);
        
        // Move the energy text to the right of the icon instead of on top
        this.energyText = this.scene.add.text(30, 0, `${this.energy}/${this.maxEnergy}`, {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#ffffff'
        });
        this.energyText.setOrigin(0, 0.5); // Align left side of text with position
        this.energyContainer.add(this.energyText);
    }
    
    updateHealthBar() {
        this.healthBar.clear();
        
        // Background bar
        this.healthBar.fillStyle(0x666666);
        this.healthBar.fillRect(-50, -160, 100, 10);
        
        // Health percentage
        const healthPercent = Math.max(0, this.health / this.maxHealth);
        const barColor = healthPercent > 0.6 ? 0x00ff00 : healthPercent > 0.3 ? 0xffff00 : 0xff0000;
        
        this.healthBar.fillStyle(barColor);
        this.healthBar.fillRect(-50, -160, 100 * healthPercent, 10);
        
        // Update existing health text - no need for conditional creation
        if (this.healthText) {
            this.healthText.setText(`${this.health}/${this.maxHealth}`);
        }
    }
    
    takeDamage(amount) {
        // Apply block first
        let remainingDamage = amount;
        
        if (this.block > 0) {
            if (this.block >= remainingDamage) {
                this.block -= remainingDamage;
                remainingDamage = 0;
            } else {
                remainingDamage -= this.block;
                this.block = 0;
            }
            
            // Update block display
            this.updateBlockDisplay();
        }
        
        // If damage remains, reduce health
        if (remainingDamage > 0) {
            this.health = Math.max(0, this.health - remainingDamage);
            
            // Update health display
            this.updateHealthBar();
            this.healthText.setText(`${this.health}/${this.maxHealth}`);
            
            // Show damage number
            this.showDamageNumber(remainingDamage);
            
            // Update registry with the appropriate prefix
            this.scene.registry.set(`${this.registryPrefix}player-health`, this.health);
        }
        
        // Check if defeated
        if (this.health <= 0) {
            this.onDefeated();
        }
        
        return remainingDamage;
    }
    
    showDamageNumber(amount) {
        // Create a damage number that floats up and fades out
        const damageText = this.scene.add.text(this.x, this.y - 20, `-${amount}`, {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ff0000',
            fontStyle: 'bold'
        });
        damageText.setOrigin(0.5);
        
        // Animate the damage number
        this.scene.tweens.add({
            targets: damageText,
            y: this.y - 70,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                damageText.destroy();
            }
        });
    }
    
    heal(amount) {
        const oldHealth = this.health;
        this.health = Math.min(this.maxHealth, this.health + amount);
        
        // Update health display
        this.updateHealthBar();
        this.healthText.setText(`${this.health}/${this.maxHealth}`);
        
        // Show healing number
        const healAmount = this.health - oldHealth;
        if (healAmount > 0) {
            this.showHealNumber(healAmount);
            
            // Update registry with the appropriate prefix
            this.scene.registry.set(`${this.registryPrefix}player-health`, this.health);
        }
        
        return healAmount;
    }
    
    showHealNumber(amount) {
        // Create a heal number that floats up and fades out
        const healText = this.scene.add.text(this.x, this.y - 20, `+${amount}`, {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#00ff00',
            fontStyle: 'bold'
        });
        healText.setOrigin(0.5);
        
        // Animate the heal number
        this.scene.tweens.add({
            targets: healText,
            y: this.y - 70,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                healText.destroy();
            }
        });
    }
    
    addBlock(amount) {
        this.block += amount;
        
        // Show block indicator
        this.updateBlockDisplay();
        
        // Show block number
        this.showBlockNumber(amount);
    }
    
    updateBlockDisplay() {
        if (this.block > 0) {
            if (!this.blockIcon) {
                this.blockIcon = this.scene.add.circle(-60, -90, 15, 0x3498db);
                this.container.add(this.blockIcon);
                
                this.blockText = this.scene.add.text(-60, -90, this.block.toString(), {
                    fontFamily: 'Arial',
                    fontSize: 16,
                    color: '#ffffff'
                });
                this.blockText.setOrigin(0.5);
                this.container.add(this.blockText);
            } else {
                this.blockText.setText(this.block.toString());
                this.blockIcon.setVisible(true);
                this.blockText.setVisible(true);
            }
        } else if (this.blockIcon) {
            this.blockIcon.setVisible(false);
            this.blockText.setVisible(false);
        }
    }
    
    showBlockNumber(amount) {
        // Create a block number that floats up and fades out
        const blockText = this.scene.add.text(this.x, this.y - 20, `+${amount} Block`, {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#3498db',
            fontStyle: 'bold'
        });
        blockText.setOrigin(0.5);
        
        // Animate the block number
        this.scene.tweens.add({
            targets: blockText,
            y: this.y - 70,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                blockText.destroy();
            }
        });
    }
    
    setEnergy(amount) {
        this.energy = amount;
        this.energyText.setText(`${this.energy}/${this.maxEnergy}`);
        
        // Update registry with the appropriate prefix
        this.scene.registry.set(`${this.registryPrefix}player-energy`, this.energy);
    }
    
    useEnergy(amount) {
        if (this.energy >= amount) {
            this.energy -= amount;
            this.energyText.setText(`${this.energy}/${this.maxEnergy}`);
            
            // Update registry with the appropriate prefix
            this.scene.registry.set(`${this.registryPrefix}player-energy`, this.energy);
            return true;
        }
        return false;
    }

    gainMaxHealth(amount) {
        this.maxHealth += amount;
        this.health += amount; // Also increase current health
        
        // Update health display
        this.updateHealthBar();
        this.healthText.setText(`${this.health}/${this.maxHealth}`);
        
        // Update registry with the appropriate prefix
        this.scene.registry.set(`${this.registryPrefix}player-max-health`, this.maxHealth);
        this.scene.registry.set(`${this.registryPrefix}player-health`, this.health);
        
        // Show healing number
        this.showHealNumber(amount);
    }
    
    startTurn() {
        // Clear block from previous turn (unless player has block retention)
        const hasBlockRetention = this.statusEffects.some(effect => effect.type === 'block_retention');
        if (!hasBlockRetention) {
            this.block = 0;
            this.updateBlockDisplay();
        }
        
        // Reset energy
        this.setEnergy(this.maxEnergy);
        
        // Draw cards
        return this.deck.drawCards(5);
    }
    
    endTurn() {
        // Clear block if not persistent
        const hasBlockRetention = this.statusEffects.some(effect => effect.type === 'block_retention');
        if (!hasBlockRetention) {
            this.block = 0;
            this.updateBlockDisplay();
        }
        
        // DO NOT DISCARD HAND - Comment out or remove this line:
        // this.deck.discardHand();
        
        // Just update status effects
        this.updateStatusEffects();
        this.applyEndOfTurnEffects();
    }
    
    // Add this new method for end-of-turn effects
    applyEndOfTurnEffects() {
        // Check for regeneration
        const regenEffect = this.statusEffects.find(effect => effect.type === 'regen');
        if (regenEffect) {
            this.heal(regenEffect.value || 1);
        }
        
        // More end of turn effects can be added here
    }
    

// Method to add a status effect
addStatusEffect(effect, duration) {
    // Add to status effects array
    this.statusEffects.push({
        type: effect,
        duration: duration
    });
    
    // Create visual indicator
    this.createStatusIcon(effect, duration);
}

// Create visual status icon
createStatusIcon(effect, duration) {
    // Calculate position - left side of player
    const statusX = -60 - (this.statusEffects.length * 25);
    
    // Create icon
    const statusIcon = this.scene.add.circle(statusX, -90, 10, this.getStatusEffectColor(effect));
    this.container.add(statusIcon);
    
    // Add duration text
    const statusText = this.scene.add.text(statusX, -90, duration.toString(), {
        fontFamily: 'Arial',
        fontSize: 12,
        color: '#ffffff'
    });
    statusText.setOrigin(0.5);
    this.container.add(statusText);
    
    // Make interactive for tooltips
    statusIcon.setInteractive({ useHandCursor: true });
    
    // REMOVE ALL OTHER pointerover handlers and just use this ONE:
    statusIcon.on('pointerover', () => {
        // Create tooltip directly instead of using tooltipManager
        // This ensures it appears in the right place
        
        // Create the tooltip container at the WORLD position
        // Convert from local container coordinates to world coordinates
        const worldX = this.container.x + statusX;
        const worldY = this.container.y - 130; // Position above the status icon
        
        // Create a tooltip manually (this avoids position calculation issues)
        this.statusTooltip = this.scene.add.container(worldX, worldY);
        
        // Background
        const tooltipBg = this.scene.add.rectangle(0, 0, 200, 60, 0x000000, 0.8);
        tooltipBg.setStrokeStyle(2, 0xffffff, 0.3);
        this.statusTooltip.add(tooltipBg);
        
        // Text
        const tooltipText = this.scene.add.text(0, 0, this.getStatusEffectDescription(effect), {
            fontFamily: 'Arial',
            fontSize: 14,
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 180 }
        });
        tooltipText.setOrigin(0.5);
        this.statusTooltip.add(tooltipText);
        
        // Make sure it's on top
        this.scene.children.bringToTop(this.statusTooltip);
    });
    
    // Remove tooltip when not hovering
    statusIcon.on('pointerout', () => {
        if (this.statusTooltip) {
            this.statusTooltip.destroy();
            this.statusTooltip = null;
        }
    });
}

// Get color for status effect
getStatusEffectColor(effect) {
    switch(effect) {
        case 'vulnerable': return 0xff9900;
        case 'weak': return 0x9900ff;
        case 'strength': return 0xff0000;
        case 'dexterity': return 0x00ff00;
        default: return 0x999999;
    }
}

// Get description for status effect
getStatusEffectDescription(effect) {
    switch(effect) {
        case 'vulnerable':
            return "Vulnerable: You take 50% more damage from attacks.";
        case 'weak':
            return "Weak: Your attacks deal 25% less damage.";
        case 'strength':
            return "Strength: Your attacks deal additional damage.";
        case 'dexterity':
            return "Dexterity: You gain additional Block from cards.";
        default:
            return `${effect}: Unknown effect.`;
    }
}
    
    updateStatusEffects() {
        for (let i = this.statusEffects.length - 1; i >= 0; i--) {
            const effect = this.statusEffects[i];
            effect.duration--;
            
            if (effect.duration <= 0) {
                // Remove expired effect
                this.statusEffects.splice(i, 1);
                // Would need to remove visual indicator here too
            }
        }
    }
    
    onDefeated() {
        // Handle player defeat
        this.scene.onPlayerDefeated();
    }
    
    destroy() {
        this.container.destroy();
    }
}
