export default class Enemy {
    constructor(scene, x, y, data) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        
        // Enemy data
        this.id = data.id;
        this.name = data.name;
        this.maxHealth = data.health;
        this.health = data.health;
        this.moves = data.moves || [];
        this.currentMoveIndex = 0;
        this.category = data.category || 'alignment'; // Default category
        
        // Status effects
        this.statusEffects = [];
        this.statusIcons = [];
        
        // Block
        this.block = 0;
        
        // Create enemy visual
        this.createEnemySprite();
    }
    
    createEnemySprite() {
        // Determine enemy image based on category
        let enemyImage = 'enemy-alignment'; // Default fallback
        
        // Create enemy container
        this.container = this.scene.add.container(this.x, this.y);
        
        // Create enemy sprite
        this.sprite = this.scene.add.image(0, 0, enemyImage);
        this.container.add(this.sprite);
        
        // Add name
        this.nameText = this.scene.add.text(0, -120, this.name, {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#ffffff',
            align: 'center',
            fontStyle: 'bold'
        });
        this.nameText.setOrigin(0.5);
        this.container.add(this.nameText);
        
        // Add health display
        this.healthBar = this.scene.add.graphics();
        this.updateHealthBar();
        this.container.add(this.healthBar);
        
        this.healthText = this.scene.add.text(0, -90, `${this.health}/${this.maxHealth}`, {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#ffffff'
        });
        this.healthText.setOrigin(0.5);
        this.container.add(this.healthText);
        
        // Add intent display
        this.intentIcon = this.scene.add.circle(0, -150, 15, 0xff0000);
        this.container.add(this.intentIcon);
        
        this.intentText = this.scene.add.text(0, -150, '?', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#ffffff'
        });
        this.intentText.setOrigin(0.5);
        this.container.add(this.intentText);
        
        // Make enemy clickable
        this.sprite.setInteractive({ useHandCursor: true });
        
        this.sprite.on('pointerover', () => {
            this.onHover();
        });
        
        this.sprite.on('pointerout', () => {
            this.onHoverEnd();
        });
        
        this.sprite.on('pointerdown', () => {
            this.onClick();
        });
        
        // Set initial intent
        this.setNextMove();
    }
    
    updateHealthBar() {
        this.healthBar.clear();
        
        // Background bar
        this.healthBar.fillStyle(0x666666);
        this.healthBar.fillRect(-50, -80, 100, 10);
        
        // Health percentage
        const healthPercent = Math.max(0, this.health / this.maxHealth);
        const barColor = healthPercent > 0.6 ? 0x00ff00 : healthPercent > 0.3 ? 0xffff00 : 0xff0000;
        
        this.healthBar.fillStyle(barColor);
        this.healthBar.fillRect(-50, -80, 100 * healthPercent, 10);
    }
    
    onHover() {
        this.sprite.setTint(0xaaaaaa);
    }
    
    onHoverEnd() {
        this.sprite.clearTint();
    }
    
    onClick() {
        // Notify the scene that this enemy was clicked
        this.scene.onEnemyClicked(this);
    }
    
    takeDamage(amount) {
        // Apply damage modification based on status effects
        let actualDamage = amount;
        
        // Check for vulnerable status (increases damage taken)
        if (this.hasStatusEffect('vulnerable')) {
            console.log(`Enemy is vulnerable, increasing damage from ${amount} to ${amount * 1.5}`);
            actualDamage = Math.floor(amount * 1.5); // 50% more damage when vulnerable
        }
        
        // Apply block if any
        if (this.block > 0) {
            if (this.block >= actualDamage) {
                this.block -= actualDamage;
                console.log(`Block absorbed all damage, remaining block: ${this.block}`);
                actualDamage = 0;
            } else {
                actualDamage -= this.block;
                console.log(`Block reduced damage by ${this.block}, remaining damage: ${actualDamage}`);
                this.block = 0;
            }
            
            // Update block display
            if (this.blockText) {
                if (this.block > 0) {
                    this.blockText.setText(this.block.toString());
                } else {
                    this.blockIcon.setVisible(false);
                    this.blockText.setVisible(false);
                }
            }
        }
        
        // Apply damage to health
        if (actualDamage > 0) {
            this.health = Math.max(0, this.health - actualDamage);
            
            // Update displays
            this.updateHealthBar();
            this.healthText.setText(`${this.health}/${this.maxHealth}`);
            
            // Create damage number effect
            this.showDamageNumber(actualDamage);
        }
        
        // Check if defeated
        if (this.health <= 0) {
            this.onDefeated();
        }
        
        return actualDamage;
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
        
        // Update displays
        this.updateHealthBar();
        this.healthText.setText(`${this.health}/${this.maxHealth}`);
        
        // Show healing number
        const healAmount = this.health - oldHealth;
        if (healAmount > 0) {
            this.showHealNumber(healAmount);
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
    
    onDefeated() {
        // Notify the scene
        this.scene.onEnemyDefeated(this);
        
        // Play defeat animation
        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            y: this.y + 50,
            duration: 500,
            onComplete: () => {
                this.destroy();
            }
        });
    }
    
    setNextMove() {
        if (this.moves.length === 0) return;
        
        // Get the next move
        const move = this.moves[this.currentMoveIndex];
        
        // Update intent display
        switch (move.type) {
            case 'attack':
                this.intentIcon.setFillStyle(0xff0000); // Red for attack
                this.intentText.setText(move.value);
                break;
            case 'defend':
                this.intentIcon.setFillStyle(0x00ff00); // Green for defense
                this.intentText.setText(move.value);
                break;
            case 'buff':
                this.intentIcon.setFillStyle(0x0000ff); // Blue for buff
                this.intentText.setText('BUFF');
                break;
            case 'debuff':
                this.intentIcon.setFillStyle(0xffff00); // Yellow for debuff
                this.intentText.setText('DEBUFF');
                break;
            default:
                this.intentIcon.setFillStyle(0xaaaaaa); // Gray for unknown
                this.intentText.setText('?');
        }
        
        // Make intent icon interactive for tooltip
        this.intentIcon.setInteractive({ useHandCursor: true });
        
        // Clear existing event listeners to prevent duplicates
        this.intentIcon.removeAllListeners('pointerover');
        this.intentIcon.removeAllListeners('pointerout');
        
        // Add tooltip on hover
        this.intentIcon.on('pointerover', () => {
            // Create tooltip directly
            const worldX = this.container.x;
            const worldY = this.container.y - 200;
            
            // Create tooltip container
            this.intentTooltip = this.scene.add.container(worldX, worldY);
            
            // Background
            const tooltipBg = this.scene.add.rectangle(0, 0, 200, 80, 0x000000, 0.8);
            tooltipBg.setStrokeStyle(2, 0xffffff, 0.3);
            this.intentTooltip.add(tooltipBg);
            
            // Text
            let tooltipContent = this.getIntentDescription(move);
            
            const tooltipText = this.scene.add.text(0, 0, tooltipContent, {
                fontFamily: 'Arial',
                fontSize: 14,
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: 180 }
            });
            tooltipText.setOrigin(0.5);
            this.intentTooltip.add(tooltipText);
            
            // Make sure it's on top
            this.scene.children.bringToTop(this.intentTooltip);
        });
        
        // Remove tooltip when not hovering
        this.intentIcon.on('pointerout', () => {
            if (this.intentTooltip) {
                this.intentTooltip.destroy();
                this.intentTooltip = null;
            }
        });
        
        // Increment move index for next turn
        this.currentMoveIndex = (this.currentMoveIndex + 1) % this.moves.length;
    }
    
    // Add helper method to describe intent
    getIntentDescription(move) {
        switch(move.type) {
            case 'attack':
                return `Attack: This enemy intends to deal ${move.value} damage.`;
            case 'defend':
                return `Defend: This enemy intends to gain ${move.value} Block.`;
            case 'buff':
                return `Buff: This enemy will apply a positive effect to itself.\n${move.effect || ''}`;
            case 'debuff':
                return `Debuff: This enemy will apply a negative effect to you.\n${move.effect || ''}`;
            default:
                return "Unknown intention.";
        }
    }
    
    // In Enemy.js, update the takeTurn method:

    takeTurn() {
        if (this.health <= 0 || this.moves.length === 0) return;
        
        console.log(`--- Enemy ${this.name} turn start ---`);
        console.log(`Current status effects:`, this.statusEffects);
        
        // Get the current move
        const moveIndex = (this.currentMoveIndex + this.moves.length - 1) % this.moves.length;
        const move = this.moves[moveIndex];
        
        console.log(`Enemy ${this.name} executing move type: ${move.type}`);
        
        // Check for stun status
        if (this.hasStatusEffect('stun')) {
            console.log('Enemy is stunned and skips turn');
            // Skip turn if stunned
        } else {
            // Execute the move with adjustments for status effects
            switch (move.type) {
                case 'attack':
                    // Calculate modified damage based on status effects
                    let damage = move.value;
                    console.log(`Base damage: ${damage}`);
                    
                    // Check for weak status
                    const hasWeak = this.hasStatusEffect('weak');
                    console.log(`Enemy has weak status: ${hasWeak}`);
                    
                    if (hasWeak) {
                        const originalDamage = damage;
                        damage = Math.floor(damage * 0.75); // 25% reduction from weak
                        console.log(`Reduced damage from ${originalDamage} to ${damage} due to weak`);
                    }
                    
                    // Apply the damage
                    console.log(`Final damage being applied to player: ${damage}`);
                    this.scene.playerTakeDamage(damage);
                    break;
                case 'defend':
                    this.addBlock(move.value);
                    break;
                case 'buff':
                    console.log(`Enemy using buff move: ${move.effect}`);
                    this.applyBuff(move.effect, move.value || 0, move.duration || 1);
                    break;
                case 'debuff':
                    this.scene.applyDebuffToPlayer(move.effect, move.value, move.duration);
                    break;
            }
        }
        
        // Update status effects at end of turn
        this.updateStatusEffects();
        
        // Set next move intent
        this.setNextMove();
    }
 // ADD THIS METHOD to update status effects at end of turn
 updateStatusEffects() {
    console.log("Updating enemy status effects");
    
    for (let i = this.statusEffects.length - 1; i >= 0; i--) {
        const effect = this.statusEffects[i];
        effect.duration--;
        
        console.log(`Status effect ${effect.type} duration reduced to ${effect.duration}`);
        
        if (effect.duration <= 0) {
            // Remove expired effect
            console.log(`Removing expired status effect: ${effect.type}`);
            this.statusEffects.splice(i, 1);
            
            // Remove visual indicator
            const iconIndex = this.statusIcons.findIndex(icon => icon.effect === effect.type);
            if (iconIndex >= 0) {
                const icon = this.statusIcons[iconIndex];
                icon.icon.destroy();
                icon.text.destroy();
                this.statusIcons.splice(iconIndex, 1);
            }
        } else {
            // Update duration text
            const iconIndex = this.statusIcons.findIndex(icon => icon.effect === effect.type);
            if (iconIndex >= 0) {
                this.statusIcons[iconIndex].text.setText(effect.duration.toString());
            }
        }
    }
}   

// Update the addStatusEffect method in Enemy.js to check for immunity
addStatusEffect(effect, duration) {
    // Check if enemy is immune to status effects
    if (this.hasStatusEffect('immune') && effect !== 'immune') {
        console.log(`Enemy is immune! Status effect ${effect} was blocked`);
        
        // Show a visual indicator that the effect was blocked
        this.showStatusBlockedEffect();
        return false; // Status was not applied
    }
    
    console.log(`Adding ${effect} to enemy for ${duration} turns`);
    
    // Check if already has this effect
    const existingEffect = this.statusEffects.find(e => e.type === effect);
    
    if (existingEffect) {
        // Extend duration if new duration is longer
        existingEffect.duration = Math.max(existingEffect.duration, duration);
        
        // Update the visual
        const iconIndex = this.statusIcons.findIndex(icon => icon.effect === effect);
        if (iconIndex >= 0) {
            this.statusIcons[iconIndex].text.setText(existingEffect.duration.toString());
        }
        
        console.log(`Extended ${effect} duration to ${existingEffect.duration}`);
    } else {
        // Add new effect
        this.statusEffects.push({
            type: effect,
            duration: duration
        });
        
        // Create visual indicator
        this.showStatusEffect(effect, duration);
        console.log(`Added new ${effect} status to enemy`);
    }
    
    return true; // Status was applied
}

// Add a method to show a visual indicator when status is blocked
showStatusBlockedEffect() {
    // Create a "BLOCKED" text that floats up and fades out
    const blockedText = this.scene.add.text(this.x, this.y - 50, 'IMMUNE!', {
        fontFamily: 'Arial',
        fontSize: 24,
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
    });
    blockedText.setOrigin(0.5);
    
    // Animate the text
    this.scene.tweens.add({
        targets: blockedText,
        y: this.y - 100,
        alpha: 0,
        duration: 1000,
        onComplete: () => {
            blockedText.destroy();
        }
    });
}

// Add a helper method to check for status effects
hasStatusEffect(effectType) {
    return this.statusEffects && this.statusEffects.some(effect => effect.type === effectType);
}
    
    addBlock(amount) {
        this.block = (this.block || 0) + amount;
        
        // Show block indicator
        if (!this.blockIcon) {
            this.blockIcon = this.scene.add.circle(40, -90, 15, 0x3498db);
            this.container.add(this.blockIcon);
            
            this.blockText = this.scene.add.text(40, -90, this.block.toString(), {
                fontFamily: 'Arial',
                fontSize: 16,
                color: '#ffffff'
            });
            this.blockText.setOrigin(0.5);
            this.container.add(this.blockText);
        } else {
            this.blockText.setText(this.block.toString());
        }
    }
    
    // Update the applyBuff method in Enemy.js
applyBuff(effect, value, duration) {
    console.log(`Enemy applying buff: ${effect} with duration ${duration}`);
    
    // Add the status effect directly
    this.addStatusEffect(effect, duration);
    
    // Additional effect-specific logic if needed
    if (effect === 'strength') {
        // Handle strength buff
        this.strength = (this.strength || 0) + value;
        console.log(`Enemy gained ${value} strength, now has ${this.strength}`);
    }
}
    
    // This might be called showStatusEffect or applyStatusEffect
// In Enemy.js, in the showStatusEffect (or equivalent) method:

showStatusEffect(effect, duration) {
    // Add a status effect icon
    const statusX = -40 + (this.statusEffects.length * 25);
    
    const statusIcon = this.scene.add.circle(statusX, -150, 10, this.getStatusEffectColor(effect));
    this.container.add(statusIcon);
    
    const statusText = this.scene.add.text(statusX, -150, duration.toString(), {
        fontFamily: 'Arial',
        fontSize: 12,
        color: '#ffffff'
    });
    statusText.setOrigin(0.5);
    this.container.add(statusText);
    
    if (effect === 'immune') {
        // Make immune status larger and more noticeable
        statusIcon.setRadius(15); // Larger circle
        statusIcon.setStrokeStyle(2, 0xffffff); // Add white border
        
        // Add a subtle pulsing animation
        this.scene.tweens.add({
            targets: statusIcon,
            scaleX: 1.2,
            scaleY: 1.2,
            yoyo: true,
            repeat: -1,
            duration: 1000
        });
        
        console.log('Applied immunity visual effect');
    }

    // Make status icon interactive
    statusIcon.setInteractive({ useHandCursor: true });
    
    // Add tooltip on hover
    statusIcon.on('pointerover', () => {
        // Create tooltip directly at world position
        const worldX = this.container.x + statusX;
        const worldY = this.container.y - 190; // Position above the status icon
        
        // Create tooltip container
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
    
    // Store references to status icons for later management
    if (!this.statusIcons) this.statusIcons = [];
    this.statusIcons.push({
        icon: statusIcon,
        text: statusText,
        effect: effect
    });
}

// Add methods to support status effect coloring and descriptions
getStatusEffectColor(effect) {
    switch(effect) {
        case 'vulnerable': return 0xff9900; // Orange
        case 'weak': return 0x9900ff; // Purple
        case 'strength': return 0xff0000; // Red
        case 'constrained': return 0x0099ff; // Light blue
        case 'stun': return 0xffff00; // Yellow
        case 'contained': return 0x00ffff; // Cyan
        case 'immune': return 0xffffff; // White
        default: return 0x999999; // Gray
    }
}

getStatusEffectDescription(effect) {
    switch(effect) {
        case 'vulnerable':
            return "Vulnerable: Takes 50% more damage from attacks for the duration.";
        case 'weak':
            return "Weak: Deals 25% less damage with attacks for the duration.";
        case 'strength':
            return "Strength: Deals additional damage with each attack.";
        case 'constrained':
            return "Constrained: Deals 50% less damage for the duration.";
        case 'stun':
            return "Stunned: Cannot act on its next turn.";
        case 'contained':
            return "Contained: Cannot use special abilities for the duration.";
        case 'immune':
            return "Immune: Cannot take damage for the duration.";
        default:
            return `${effect}: Unknown effect.`;
    }
}

// Add these helper methods if they don't exist
getStatusEffectColor(effect) {
    switch(effect) {
        case 'vulnerable': return 0xff9900;
        case 'weak': return 0x9900ff;
        case 'strength': return 0xff0000;
        case 'constrained': return 0x0099ff;
        case 'stun': return 0xffff00;
        case 'contained': return 0x00ffff;
        default: return 0x999999;
    }
}

getStatusEffectDescription(effect) {
    switch(effect) {
        case 'vulnerable':
            return "Vulnerable: Takes 50% more damage from attacks.";
        case 'weak':
            return "Weak: Deals 25% less damage with attacks.";
        case 'strength':
            return "Strength: Deals additional damage with each attack.";
        case 'constrained':
            return "Constrained: Deals 50% less damage.";
        case 'stun':
            return "Stunned: Cannot act on its next turn.";
        case 'contained':
            return "Contained: Cannot use special abilities.";
        default:
            return `${effect}: Unknown effect.`;
    }
}
    
    destroy() {
        this.container.destroy();
    }
}
