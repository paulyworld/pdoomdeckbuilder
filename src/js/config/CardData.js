// Card data for the prototype
// Simplified version of the existential risk categories

const CardData = {
    // Basic cards
    strike: {
        id: 'strike',
        name: 'Strike',
        description: 'Deal 6 damage.',
        cost: 1,
        type: 'attack',
        category: 'basic',
        effects: [
            (scene, target) => {
                if (target) {
                    target.takeDamage(6);
                }
            }
        ]
    },
    
    defend: {
        id: 'defend',
        name: 'Defend',
        description: 'Gain 5 Block.',
        cost: 1,
        type: 'skill',
        category: 'basic',
        effects: [
            (scene) => {
                scene.player.addBlock(5);
            }
        ]
    },
    
    // Alignment Failure cards
    // Example of how to update a card that applies status effects
    valueSpecification: {
        id: 'value_specification',
        name: 'Value Specification',
        description: 'Apply 2 Vulnerable.',
        cost: 1,
        type: 'skill',
        category: 'alignment',
        effects: [
            (scene, target) => {
                if (target) {
                    const applied = scene.applyStatusEffect(target, 'vulnerable', 2);
                    
                    // Optionally, you could add special handling if the effect was blocked
                    if (!applied) {
                        console.log('Effect was blocked by immunity');
                        // Maybe play a sound or show a message
                    }
                }
            }
        ]
    },
    
    rewardHackingDefense: {
        id: 'reward_hacking_defense',
        name: 'Reward Hacking Defense',
        description: 'Gain 8 Block. Block does not expire this turn.',
        cost: 2,
        type: 'skill',
        category: 'alignment',
        effects: [
            (scene) => {
                scene.player.addBlock(8);
                // Set block to be persistent (simplified)
                scene.player.blockPersistent = true;
            }
        ]
    },
    
    // Misuse cards
    ethicalBoundary: {
        id: 'ethical_boundary',
        name: 'Ethical Boundary',
        description: 'Apply 2 Weak.',
        cost: 1,
        type: 'skill',
        category: 'misuse',
        effects: [
            (scene, target) => {
                if (target) {
                    // Apply weak status effect to the enemy
                    scene.applyStatusEffect(target, 'weak', 2);
                }
            }
        ]
    },
    
    regulatoryFramework: {
        id: 'regulatory_framework',
        name: 'Regulatory Framework',
        description: 'Deal 10 damage. If the enemy has Constrained, deal 5 more damage.',
        cost: 2,
        type: 'attack',
        category: 'misuse',
        effects: [
            (scene, target) => {
                if (target) {
                    let damage = 10;
                    
                    // Check for constrained status
                    if (target.hasStatusEffect && target.hasStatusEffect('constrained')) {
                        damage += 5;
                    }
                    
                    target.takeDamage(damage);
                }
            }
        ]
    },
    
    // Structural Risk cards
    developmentOversight: {
        id: 'development_oversight',
        name: 'Development Oversight',
        description: 'Deal 7 damage and draw a card.',
        cost: 1,
        type: 'attack',
        category: 'structure',
        effects: [
            (scene, target) => {
                if (target) {
                    target.takeDamage(7);
                }
                
                // Draw a card (would need hand manager)
                scene.drawCard(1);
            }
        ]
    },
    
    cooperativeFramework: {
        id: 'cooperative_framework',
        name: 'Cooperative Framework',
        description: 'All cards cost 1 less this turn. Draw 2 cards.',
        cost: 2,
        type: 'power',
        category: 'structure',
        effects: [
            (scene) => {
                // Reduce all card costs (simplified)
                scene.applyStatusEffect(scene.player, 'energy_reduction', 1);
                
                // Draw cards
                scene.drawCard(2);
            }
        ]
    },
    
    // Autonomous Systems cards
    shutdownProtocol: {
        id: 'shutdown_protocol',
        name: 'Shutdown Protocol',
        description: 'Deal 9 damage. Apply 1 Stun.',
        cost: 2,
        type: 'attack',
        category: 'autonomous',
        effects: [
            (scene, target) => {
                if (target) {
                    target.takeDamage(9);
                    // Apply stun (would need to be implemented)
                    scene.applyStatusEffect(target, 'stun', 1);
                }
            }
        ]
    },
    
    recursiveOversight: {
        id: 'recursive_oversight',
        name: 'Recursive Oversight',
        description: 'Gain 12 Block. Apply 2 Contained.',
        cost: 3,
        type: 'skill',
        category: 'autonomous',
        effects: [
            (scene, target) => {
                scene.player.addBlock(12);
                
                if (target) {
                    // Apply contained status (simplified)
                    scene.applyStatusEffect(target, 'contained', 2);
                }
            }
        ]
    },
    
    // Superintelligence cards
    capabilityControl: {
        id: 'capability_control',
        name: 'Capability Control',
        description: 'Enemy loses all Strength and buffs.',
        cost: 1,
        type: 'skill',
        category: 'superintelligence',
        effects: [
            (scene, target) => {
                if (target) {
                    // Clear enemy buffs (simplified)
                    if (target.clearBuffs) {
                        target.clearBuffs();
                    }
                    
                    // Reset strength
                    if (target.strength !== undefined) {
                        target.strength = 0;
                    }
                }
            }
        ]
    },
    
    strategicAdvantage: {
        id: 'strategic_advantage',
        name: 'Strategic Advantage',
        description: 'Deal 5 damage. Double your Block.',
        cost: 2,
        type: 'attack',
        category: 'superintelligence',
        effects: [
            (scene, target) => {
                if (target) {
                    target.takeDamage(5);
                }
                
                // Double block
                scene.player.addBlock(scene.player.block);
            }
        ]
    },
    
    // Existential Hope cards
    beneficialGuidance: {
        id: 'beneficial_guidance',
        name: 'Beneficial Guidance',
        description: 'Heal 5 HP and draw 2 cards.',
        cost: 1,
        type: 'skill',
        category: 'hope',
        effects: [
            (scene) => {
                scene.player.heal(5);
                scene.drawCard(2);
            }
        ]
    },
    
    
    alignedPartnership: {
        id: 'aligned_partnership',
        name: 'Aligned Partnership',
        description: 'Gain 2 Strength and 8 Block.',
        cost: 2,
        type: 'skill',
        category: 'hope',
        effects: [
            (scene) => {
                scene.player.addBlock(8);
                scene.applyStatusEffectToPlayer('strength', 2);
            }
        ]
    }
};

// Default starting deck
const StartingDeck = [
    CardData.strike, 
    CardData.strike, 
    CardData.strike, 
    CardData.strike, 
    CardData.defend, 
    CardData.defend, 
    CardData.defend, 
    CardData.defend,
    CardData.valueSpecification,
    CardData.ethicalBoundary
];

export { CardData, StartingDeck };
