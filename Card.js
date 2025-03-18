export default class Card {
    constructor(scene, x, y, data) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        
        // Store the original card data
        this.cardData = data;
        
        // Card data properties
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.cost = data.cost;
        this.type = data.type;
        this.category = data.category;
        this.effects = data.effects || [];
        
        // Card state
        this.inHand = false;
        this.isHovered = false;
        
        // Create card visual
        this.createCardSprite();
    }
    
    createCardSprite() {
        // Determine card image based on category
        let cardImage = 'card-back';
        switch (this.category) {
            case 'alignment':
                cardImage = 'card-alignment';
                break;
            case 'misuse':
                cardImage = 'card-misuse';
                break;
            case 'structure':
                cardImage = 'card-structure';
                break;
            case 'autonomous':
                cardImage = 'card-autonomous';
                break;
            case 'superintelligence':
                cardImage = 'card-superintelligence';
                break;
            case 'hope':
                cardImage = 'card-hope';
                break;
            default:
                // Use a default if category not recognized
                cardImage = 'card-alignment';
        }
        
        // Create card container
        this.container = this.scene.add.container(this.x, this.y);
        
        // Create card background
        this.sprite = this.scene.add.image(0, 0, cardImage);
        this.container.add(this.sprite);
        
        // Add card name
        this.nameText = this.scene.add.text(0, -100, this.name, {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#000000',
            align: 'center',
            fontStyle: 'bold',
            wordWrap: { width: 150 }
        });
        this.nameText.setOrigin(0.5);
        this.container.add(this.nameText);
        
        // Add card cost
        this.costCircle = this.scene.add.circle(-80, -110, 20, 0x0000aa);
        this.container.add(this.costCircle);
        
        this.costText = this.scene.add.text(-80, -110, this.cost, {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#ffffff'
        });
        this.costText.setOrigin(0.5);
        this.container.add(this.costText);
        
        // Add card description
        this.descriptionText = this.scene.add.text(0, 30, this.description, {
            fontFamily: 'Arial',
            fontSize: 12,
            color: '#000000',
            align: 'center',
            wordWrap: { width: 150 }
        });
        this.descriptionText.setOrigin(0.5);
        this.container.add(this.descriptionText);
        
        // Add interactivity
        this.sprite.setInteractive({ useHandCursor: true });
        
        // Add drag capability
        this.scene.input.setDraggable(this.sprite);
        
        // Add hover effect
        this.sprite.on('pointerover', () => {
            this.onHover();
        });
        
        this.sprite.on('pointerout', () => {
            this.onHoverEnd();
        });
        
        // Add drag events
        this.sprite.on('dragstart', (pointer, dragX, dragY) => {
            this.onDragStart(pointer);
        });
        
        this.sprite.on('drag', (pointer, dragX, dragY) => {
            this.onDrag(pointer, dragX, dragY);
        });
        
        this.sprite.on('dragend', (pointer) => {
            this.onDragEnd(pointer);
        });
        
        // Add click event
        this.sprite.on('pointerdown', (pointer) => {
            this.onClick(pointer);
        });
    }
    
    onHover() {
        if (this.inHand) {
            this.isHovered = true;
            this.container.setScale(1.1);
            this.container.y -= 30;
            
            // Bring to front
            this.scene.children.bringToTop(this.container);
            
            // If the scene has a tooltip manager, show extended card info
            if (this.scene.tooltipManager) {
                const tooltipText = this.getTooltipText();
                this.scene.tooltipManager.show(
                    this.container.x,
                    this.container.y - 180,
                    tooltipText,
                    { width: 250 }
                );
            }
        }
    }
    
    onHoverEnd() {
        if (this.inHand) {
            this.isHovered = false;
            this.container.setScale(1);
            this.container.y += 30;
            
            // Hide tooltip if it exists
            if (this.scene.tooltipManager) {
                this.scene.tooltipManager.hide();
            }
        }
    }
    
    // Helper method to generate tooltip content
    getTooltipText() {
        let text = `${this.name} (${this.cost} Energy)\n\n${this.description}`;
        
        // Add category info
        text += `\n\nCategory: ${this.category.charAt(0).toUpperCase() + this.category.slice(1)}`;
        
        // Add type info
        text += `\nType: ${this.type.charAt(0).toUpperCase() + this.type.slice(1)}`;
        
        return text;
    }

    onDragStart(pointer) {
        if (this.inHand) {
            this.container.setScale(1.1);
            this.scene.children.bringToTop(this.container);
            
            // Remember original rotation so we can restore it
            this.originalAngle = this.container.angle;
            
            // Reset rotation while dragging for better usability
            this.container.setAngle(0);
        }
    }
    
    onDrag(pointer, dragX, dragY) {
        if (this.inHand) {
            // Set the position directly to the pointer position
            // (ignoring any offset)
            this.container.x = pointer.x;
            this.container.y = pointer.y;
        }
    }
    
    onDragEnd(pointer) {
        if (this.inHand) {
            // Reset position if not played
            if (pointer.y < 400) { // Above play area threshold
                // Return to hand position
                this.returnToHand();
            } else {
                // Attempt to play card
                const playResult = this.scene.playCard(this);
                
                if (!playResult) {
                    // Return to hand if play was unsuccessful
                    this.returnToHand();
                }
            }
        }
    }
    
    onClick(pointer) {
        // For non-drag interactions
    }
    
    // Update the returnToHand method in src/js/components/Card.js
    returnToHand() {
        // This will be set by the hand manager
        if (this.handIndex !== undefined && this.scene.cardPositions && this.scene.cardPositions[this.handIndex]) {
            const position = this.scene.cardPositions[this.handIndex];
            this.container.x = position.x;
            this.container.y = position.y;
            this.container.angle = position.angle || this.originalAngle || 0;
            this.container.setScale(0.85); // Use the same scale as in addCardsToHand
        } else {
            // Fallback position if no card positions are defined
            this.container.x = this.x;
            this.container.y = this.y;
            this.container.angle = 0;
            this.container.setScale(0.85);
        }
    }
    
    addToHand(index) {
        this.inHand = true;
        this.handIndex = index;
    }
    
    removeFromHand() {
        this.inHand = false;
        this.handIndex = undefined;
    }
    
    playCard(target) {
        // Execute all card effects
        this.effects.forEach(effect => {
            effect(this.scene, target);
        });
    }
    
    destroy() {
        this.container.destroy();
    }
}