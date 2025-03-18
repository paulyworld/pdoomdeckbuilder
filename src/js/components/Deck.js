import Card from './Card';

export default class Deck {
    constructor(scene) {
        this.scene = scene;
        this.drawPile = [];
        this.hand = [];
        this.discardPile = [];
        this.exhaustPile = [];
        
        this.maxHandSize = 10; // Increased to 10 as requested
        this.printDeckState = () => {
            console.log("=== DECK STATE ===");
            console.log("Draw pile:", this.drawPile.length, "cards");
            console.log("Hand:", this.hand.length, "cards");
            console.log("Discard pile:", this.discardPile.length, "cards");
            console.log("=================");
        };
    }
    
    // In Deck.js, add a debug method:
    debugPrintState() {
        console.log("==== DECK STATE DEBUG ====");
        console.log(`Draw pile (${this.drawPile.length}):`, this.drawPile.map(card => card.name));
        console.log(`Hand (${this.hand.length}):`, this.hand.map(card => card.name));
        console.log(`Discard pile (${this.discardPile.length}):`, this.discardPile.map(card => card.name));
        console.log("=========================");
}

    setupStartingDeck(cardDataList) {
        // Clear all piles
        this.drawPile = [];
        this.hand = [];
        this.discardPile = [];
        this.exhaustPile = [];
        
        console.log(`SETUP: Starting with ${cardDataList.length} cards`);
        
        // Add cards to draw pile (make deep copies to avoid reference issues)
        cardDataList.forEach(cardData => {
            // Create a new object to avoid reference issues
            const cardCopy = {...cardData};
            this.drawPile.push(cardCopy);
        });
        
        console.log(`SETUP: Draw pile has ${this.drawPile.length} cards`);
        
        // Shuffle draw pile
        this.shuffleDrawPile();
    }
    
    shuffleDrawPile() {
        console.log("Shuffling draw pile...");
        
        // Make sure we have a draw pile to shuffle
        if (!this.drawPile || this.drawPile.length === 0) {
            console.log("Nothing to shuffle - draw pile is empty");
            return;
        }
        
        // Fisher-Yates shuffle algorithm
        for (let i = this.drawPile.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.drawPile[i], this.drawPile[j]] = [this.drawPile[j], this.drawPile[i]];
        }
        
        console.log(`Shuffle complete. Draw pile now has ${this.drawPile.length} cards`);
    }
    
    drawCards(count = 1) {
        console.log(`DRAW ATTEMPT: Trying to draw ${count} cards`);
        console.log(`CURRENT STATE: Draw pile: ${this.drawPile.length}, Hand: ${this.hand.length}, Discard: ${this.discardPile.length}`);
        
        let cardsDrawn = [];
        
        for (let i = 0; i < count; i++) {
            // Check if hand is full
            if (this.hand.length >= this.maxHandSize) {
                console.log("FULL HAND: Can't draw more cards");
                break;
            }
            
            // Check if draw pile is empty
            if (this.drawPile.length === 0) {
                console.log("EMPTY DRAW PILE: Need to reshuffle discard");
                
                // Check if discard pile has cards
                if (this.discardPile.length === 0) {
                    console.log("EMPTY DISCARD PILE: No cards to draw");
                    break;
                }
                
                // Log discard pile contents
                console.log("DISCARD PILE CONTENTS:", this.discardPile);
                
                // EXPLICITLY CREATE A NEW ARRAY to avoid reference issues
                console.log(`RESHUFFLING: Moving ${this.discardPile.length} cards from discard to draw`);
                this.drawPile = [];
                
                // Copy each card individually
                for (let j = 0; j < this.discardPile.length; j++) {
                    this.drawPile.push(this.discardPile[j]);
                }
                
                // Clear discard pile AFTER copying
                this.discardPile = [];
                
                // Shuffle draw pile
                this.shuffleDrawPile();
                
                console.log(`AFTER RESHUFFLE: Draw pile: ${this.drawPile.length}, Discard: ${this.discardPile.length}`);
            }
            
            // Now draw a card if possible
            if (this.drawPile.length > 0) {
                const card = this.drawPile.shift();
                this.hand.push(card);
                cardsDrawn.push(card);
                console.log(`DREW CARD: ${card.name || 'Unknown Card'}`);
            } else {
                console.log("ERROR: Draw pile is still empty after reshuffle attempt!");
            }
        }
        
        console.log(`DRAW COMPLETE: Drew ${cardsDrawn.length} cards. Hand now has ${this.hand.length} cards`);
        return cardsDrawn;
    }
    
    //removed discard hand method as it was not needed in the current context
    // The discardHand method was commented out as it was not needed in the current context.
    //discardHand() {
        // Move all cards from hand to discard
        //while (this.hand.length > 0) {
          //  this.discardPile.push(this.hand.pop());
      //  }
    //}
    
    
    discardCard(cardIndex) {
        if (cardIndex >= 0 && cardIndex < this.hand.length) {
            const card = this.hand.splice(cardIndex, 1)[0];
            console.log(`Discarding card: ${card.name}`);
            this.discardPile.push(card);
            return card;
        }
        return null;
    }
    
    exhaustCard(cardIndex) {
        if (cardIndex >= 0 && cardIndex < this.hand.length) {
            const card = this.hand.splice(cardIndex, 1)[0];
            this.exhaustPile.push(card);
            return card;
        }
        return null;
    }
    
    addCardToDrawPile(cardData) {
        this.drawPile.push(cardData);
    }
    
    addCardToDiscardPile(cardData) {
        if (!cardData) {
            console.error("ERROR: Attempted to add undefined card to discard pile");
            return;
        }
        
        console.log(`ADDING TO DISCARD: ${cardData.name || 'Unknown Card'}`);
        this.discardPile.push(cardData);
        console.log(`DISCARD PILE SIZE: Now ${this.discardPile.length} cards`);
    }

    getDrawPileCount() {
        return this.drawPile.length;
    }
    
    getDiscardPileCount() {
        return this.discardPile.length;
    }
    
    getExhaustPileCount() {
        return this.exhaustPile.length;
    }

    peekDrawPile(count = 3) {
        // Return up to 'count' cards from the top of the draw pile without removing them
        return this.drawPile.slice(0, count);
    }
}
