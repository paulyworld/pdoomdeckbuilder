// Enemy data for the prototype
// Simplified version of the existential risk enemies

const EnemyData = {
    // Alignment Failure enemies
    goalMisalignment: {
        id: 'goal_misalignment',
        name: 'Goal Misalignment Entity',
        health: 45,
        category: 'alignment',
        moves: [
            {
                type: 'attack',
                value: 7,
                effect: 'Add a Misinterpreted card to your discard pile'
            },
            {
                type: 'debuff',
                effect: 'randomize_costs',
                value: 1,
                duration: 1
            },
            {
                type: 'attack',
                value: 10
            }
        ]
    },
    
    rewardHacker: {
        id: 'reward_hacker',
        name: 'Reward Hacker',
        health: 60,
        category: 'alignment',
        moves: [
            {
                type: 'attack',
                value: 5,
                effect: 'Increases its damage by 2 each turn if not countered'
            },
            {
                type: 'buff',
                effect: 'immune', // The immune effect
                value: 0,
                duration: 2       // Lasts for 2 turns
            },
            {
                type: 'attack',
                value: 8
            }
        ]
    },
    
    // Misuse enemies
    weaponizedSystem: {
        id: 'weaponized_system',
        name: 'Weaponized System',
        health: 70,
        category: 'misuse',
        moves: [
            {
                type: 'attack',
                value: 15
            },
            {
                type: 'debuff',
                effect: 'defense_down',
                value: 3,
                duration: 2
            },
            {
                type: 'attack',
                value: 8
            }
        ]
    },
    
    // Structural Risk enemies
    racingAiLab: {
        id: 'racing_ai_lab',
        name: 'Racing AI Lab',
        health: 55,
        category: 'structure',
        moves: [
            {
                type: 'attack',
                value: 10,
                effect: 'Gains 2 strength each turn'
            },
            {
                type: 'attack',
                value: 20,
                effect: 'Also deals 10 damage to itself'
            },
            {
                type: 'buff',
                effect: 'strength',
                value: 3,
                duration: -1 // Permanent
            }
        ]
    },
    
    // Autonomous Systems enemies
    selfImprovingSystem: {
        id: 'self_improving_system',
        name: 'Self-Improving System',
        health: 85,
        category: 'autonomous',
        moves: [
            {
                type: 'attack',
                value: 5,
                effect: 'Increases damage by 3 each time this attack is used'
            },
            {
                type: 'debuff',
                effect: 'random',
                value: 1,
                duration: 2
            },
            {
                type: 'buff',
                effect: 'strength',
                value: 4,
                duration: -1 // Permanent
            }
        ]
    },
    
    // Superintelligence enemies
    singletonSystem: {
        id: 'singleton_system',
        name: 'Singleton System',
        health: 120,
        category: 'superintelligence',
        moves: [
            {
                type: 'attack',
                value: 25,
                effect: 'Applies 3 Vulnerable and Weak'
            },
            {
                type: 'buff',
                effect: 'counter',
                value: 2,
                duration: 2
            },
            {
                type: 'attack',
                value: 15
            },
            {
                type: 'buff',
                effect: 'heal',
                value: 12,
                duration: 1
            }
        ]
    }
};

// Enemy encounters by difficulty
const Encounters = {
    normal: [
        [EnemyData.goalMisalignment],
        [EnemyData.rewardHacker]
    ],
    
    elite: [
        [EnemyData.weaponizedSystem],
        [EnemyData.racingAiLab]
    ],
    
    boss: [
        [EnemyData.selfImprovingSystem],
        [EnemyData.singletonSystem]
    ]
};

export { EnemyData, Encounters };
