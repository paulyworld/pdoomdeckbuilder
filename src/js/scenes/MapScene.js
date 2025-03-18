import Phaser from 'phaser';

export default class MapScene extends Phaser.Scene {
    constructor() {
        super('MapScene');
        
        // Map node configuration
        this.nodes = [];
        this.connections = [];
        this.currentNodeIndex = 0;
    }

    create() {
        // Add background
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add background
        this.add.image(width / 2, height / 2, 'background').setScale(1);
        
        // Add title
        const title = this.add.text(width / 2, 50, 'SELECT YOUR PATH', {
            fontFamily: 'Arial',
            fontSize: 36,
            color: '#ffffff',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        
    // Generate and draw the map
    this.generateMap();
    this.drawMap();
    
    // Add player character to the map at the starting node
    this.addPlayerToMap();

    // Add player stats display
    this.createPlayerStats();
    
    // Add back button to main menu
    this.createBackButton();
    
    // Setup scroll controls - allow scrolling up and down the map
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
        // Scroll speed based on mouse wheel
        const scrollSpeed = 0.5;
        this.cameras.main.scrollY += deltaY * scrollSpeed;
        
        // Keep within bounds
        const bounds = this.cameras.main.getBounds();
        if (this.cameras.main.scrollY < bounds.y) {
            this.cameras.main.scrollY = bounds.y;
        } else if (this.cameras.main.scrollY > bounds.y + bounds.height - this.cameras.main.height) {
            this.cameras.main.scrollY = bounds.y + bounds.height - this.cameras.main.height;
        }
    });
    
    // Also add drag to scroll
    this.input.on('pointermove', (pointer) => {
        if (pointer.isDown) {
            this.cameras.main.scrollY -= pointer.velocity.y / 10;
            
            // Keep within bounds
            const bounds = this.cameras.main.getBounds();
            if (this.cameras.main.scrollY < bounds.y) {
                this.cameras.main.scrollY = bounds.y;
            } else if (this.cameras.main.scrollY > bounds.y + bounds.height - this.cameras.main.height) {
                this.cameras.main.scrollY = bounds.y + bounds.height - this.cameras.main.height;
            }
        }
    });
}
    
addPlayerToMap() {
    // Find the current node
    const currentNode = this.nodes[this.currentNodeIndex];
    
    // Create player sprite
    this.playerSprite = this.add.image(currentNode.x, currentNode.y, 'player');
    this.playerSprite.setScale(0.5); // Make it smaller to fit on the node
    
    // Add to map container if you have one
    if (this.mapContainer) {
        this.mapContainer.add(this.playerSprite);
    }
    
    // Bring player sprite to top so it appears above nodes
    this.children.bringToTop(this.playerSprite);
}

    generateMap() {
        // Clear existing map
        this.nodes = [];
        this.connections = [];
        
        // Define parameters for the map
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const levels = 12; // Create a longer run for scrolling
        
        // Define nodes per level (starting at the bottom)
        const nodesPerLevel = [1, 2, 3, 3, 3, 3, 2, 2, 3, 2, 2, 1]; // Last level is boss
        
        let nodeIndex = 0;
        
        // Calculate vertical spacing - using the whole height to start
        const levelHeight = 150; // Fixed height between levels
        const totalMapHeight = levelHeight * (levels - 1);
        
        // Start Y position at the bottom of screen
        const startY = height - 100; 
        
        // Generate nodes for each level (starting from the bottom)
        for (let level = 0; level < levels; level++) {
            const levelNodes = [];
            const nodesInThisLevel = nodesPerLevel[level];
            
            for (let i = 0; i < nodesInThisLevel; i++) {
                // Determine node type with controlled distribution
                let type = 'combat';
                
                // Special nodes at fixed positions
                if (level === levels - 1) {
                    // Last level is always boss
                    type = 'boss';
                } else if (level === Math.floor(levels / 2) && i === 0) {
                    // Elite in the middle of the run
                    type = 'elite';
                } else if (level === Math.floor(levels / 3) && i === 0) {
                    // Elite early in the run
                    type = 'elite';
                } else if (level === Math.floor(2 * levels / 3) && i === 0) {
                    // Elite later in the run
                    type = 'elite';
                } else if (level % 3 === 1 && i === nodesInThisLevel - 1) {
                    // Shop every third floor
                    type = 'shop';
                } else if (level % 4 === 2 && i === 0) {
                    // Rest site 
                    type = 'rest'; 
                } else if (Math.random() < 0.3) {
                    // Some random events
                    type = 'event';
                }
                
                // Calculate position - horizontally centered with offsets
                let x;
                if (nodesInThisLevel === 1) {
                    x = width / 2;  // Center single nodes
                } else {
                    // Distribute nodes across central 70% of screen
                    const spaceBetween = (width * 0.7) / (nodesInThisLevel - 1);
                    x = width * 0.15 + (i * spaceBetween);
                }
                
                // Y position based on level (bottom to top)
                // First level at the bottom, subsequent levels moving up
                const y = startY - (level * levelHeight);
                
                // Create node
                this.nodes.push({
                    index: nodeIndex,
                    level,
                    type,
                    x,
                    y,
                    visited: level === 0, // Mark first level as visited
                    available: level === 0 // First level is available
                });
                
                levelNodes.push(nodeIndex);
                nodeIndex++;
            }
            
            // Connect to previous level with controlled paths
            if (level > 0) {
                const prevLevelNodes = [];
                for (let n = 0; n < this.nodes.length; n++) {
                    if (this.nodes[n].level === level - 1) {
                        prevLevelNodes.push(n);
                    }
                }
                
                // Create connections with reasonable path forking
                for (const nodeIdx of levelNodes) {
                    // Set how many connections to make for this node
                    let connectionsToMake;
                    
                    // Boss only connects to nodes directly below it
                    if (level === levels - 1) {
                        connectionsToMake = prevLevelNodes.length; // Connect to all
                    } else {
                        // Regular nodes connect to 1-2 nodes in previous level
                        connectionsToMake = Math.min(2, prevLevelNodes.length);
                        if (connectionsToMake === 0 && prevLevelNodes.length > 0) {
                            connectionsToMake = 1; // Ensure at least one connection
                        }
                    }
                    
                    // Find closest nodes to connect to
                    const currNode = this.nodes[nodeIdx];
                    const sortedPrevNodes = [...prevLevelNodes].sort((a, b) => {
                        const nodeA = this.nodes[a];
                        const nodeB = this.nodes[b];
                        return Math.abs(nodeA.x - currNode.x) - Math.abs(nodeB.x - currNode.x);
                    });
                    
                    // Take the closest ones
                    const nodesToConnect = sortedPrevNodes.slice(0, connectionsToMake);
                    
                    // Create the connections
                    for (const prevNodeIdx of nodesToConnect) {
                        this.connections.push({
                            from: prevNodeIdx,
                            to: nodeIdx
                        });
                    }
                }
                
                // Ensure no dead ends - check all nodes in previous level
                for (const prevNodeIdx of prevLevelNodes) {
                    // Check if this node has any connections going forward
                    const hasForwardConnection = this.connections.some(conn => conn.from === prevNodeIdx);
                    
                    if (!hasForwardConnection) {
                        // Find the closest node in current level to connect to
                        const prevNode = this.nodes[prevNodeIdx];
                        let closestDist = Infinity;
                        let closestNodeIdx = null;
                        
                        for (const currNodeIdx of levelNodes) {
                            const currNode = this.nodes[currNodeIdx];
                            const dist = Math.abs(prevNode.x - currNode.x);
                            
                            if (dist < closestDist) {
                                closestDist = dist;
                                closestNodeIdx = currNodeIdx;
                            }
                        }
                        
                        // Add connection to closest node
                        if (closestNodeIdx !== null) {
                            this.connections.push({
                                from: prevNodeIdx,
                                to: closestNodeIdx
                            });
                        }
                    }
                }
            }
        }
        
        console.log(`Generated map with ${this.nodes.length} nodes and ${this.connections.length} connections`);
        
        // Set up the camera bounds for scrolling
        this.cameras.main.setBounds(0, -totalMapHeight + height, width, totalMapHeight + 200);
        
        // Start camera at the bottom
        this.cameras.main.scrollY = totalMapHeight - height + 100;
    }
    
    drawMap() {
        // Create a container for all map elements
        this.mapContainer = this.add.container(0, 0);
        
        // Draw connections first (so they appear behind nodes)
        this.connections.forEach(conn => {
            const fromNode = this.nodes[conn.from];
            const toNode = this.nodes[conn.to];
            
            // Draw connection line
            const line = this.add.line(
                0, 0, 
                fromNode.x, fromNode.y, 
                toNode.x, toNode.y, 
                0xaaaaaa
            );
            line.setLineWidth(3);
            line.setOrigin(0, 0);
            
            // Fade out unavailable connections
            if (!toNode.available) {
                line.setAlpha(0.3);
            }
            
            this.mapContainer.add(line);
        });
        
        // Draw nodes
        this.nodeSprites = []; // Store references to node sprites
        
        this.nodes.forEach(node => {
            // Choose node image based on status
            let nodeImage = 'map-node';
            if (node.visited && node.index === this.currentNodeIndex) {
                nodeImage = 'map-node-current';
            }
            
            // Create node sprite
            const nodeSprite = this.add.image(node.x, node.y, nodeImage);
            this.nodeSprites[node.index] = nodeSprite; // Store reference
            
            // Style based on type
            switch(node.type) {
                case 'combat':
                    nodeSprite.setTint(0xdd3333); // Red
                    break;
                case 'elite':
                    nodeSprite.setTint(0xdddd33); // Yellow
                    break;
                case 'boss':
                    nodeSprite.setTint(0xdd33dd); // Purple
                    break;
                case 'shop':
                    nodeSprite.setTint(0x33dddd); // Cyan
                    break;
                case 'rest':
                    nodeSprite.setTint(0x33dd33); // Green
                    break;
                case 'event':
                    nodeSprite.setTint(0x3333dd); // Blue
                    break;
            }
            
            // Fade out unavailable nodes
            if (!node.available) {
                nodeSprite.setAlpha(0.5);
            }
            
            // Add node type label
            const label = this.add.text(node.x, node.y + 20, node.type.toUpperCase(), {
                fontFamily: 'Arial',
                fontSize: 10,
                color: '#ffffff'
            });
            label.setOrigin(0.5);
            
            // Add both to container
            this.mapContainer.add(nodeSprite);
            this.mapContainer.add(label);
            
            // CRITICAL FIX: Make node interactive if available
            const willBeAvailable = this.connections.some(conn => 
                conn.from === this.currentNodeIndex && conn.to === node.index
            );
            
            // Either it's the current node or it will be available next
            if (node.index === this.currentNodeIndex || (willBeAvailable && !node.visited)) {
                console.log(`Making node ${node.index} (${node.type}) interactive`);
                
                // Create a larger invisible button for better clicking
                const hitArea = this.add.circle(node.x, node.y, 30);
                hitArea.setInteractive({ useHandCursor: true });
                
                // For debugging - make hit area visible with low opacity
                if (node.index === this.currentNodeIndex) {
                    // Current node is highlighted differently
                    hitArea.setStrokeStyle(2, 0xffff00, 0.3);
                } else {
                    // Connected nodes that can be traveled to
                    hitArea.setStrokeStyle(2, 0x00ff00, 0.3);
                }
                
                this.mapContainer.add(hitArea);
                
                // Add hover effect
                hitArea.on('pointerover', () => {
                    nodeSprite.setScale(1.2);
                    console.log(`Node hovered: ${node.type} at index ${node.index}`);
                });
                
                hitArea.on('pointerout', () => {
                    nodeSprite.setScale(1.0);
                });
                
                // Add click handler
                hitArea.on('pointerdown', () => {
                    console.log(`Node clicked: ${node.type} at index ${node.index}`);
                    
                    // Only allow selecting connected nodes that aren't the current one
                    if (node.index !== this.currentNodeIndex && willBeAvailable && !node.visited) {
                        this.selectNode(node.index);
                    } else if (node.index === this.currentNodeIndex) {
                        // If clicking current node, show current status
                        this.showMessage(`Current location: ${node.type.toUpperCase()}`);
                    }
                });
            }
        });
    }
    
    selectNode(nodeIndex) {
    console.log(`Selecting node ${nodeIndex}`);
    
    // Get the selected node
    const selectedNode = this.nodes[nodeIndex];
    
    // Double-check that the node is available and not visited
    if (!selectedNode.available || selectedNode.visited) {
        console.log(`Node ${nodeIndex} is not available or already visited`);
        return;
    }
    
    // Get the current node for animation
    const currentNode = this.nodes[this.currentNodeIndex];
    
    // Animate player moving to the new node
    this.animatePlayerMovement(currentNode, selectedNode, () => {
        // After animation completes, update the game state
        
        // Update current node
        this.currentNodeIndex = nodeIndex;
        
        // Mark as visited
        selectedNode.visited = true;
        
        // Update available nodes
        this.updateAvailableNodes();
        
        // Handle node based on type
        this.activateNodeEvent(selectedNode);
    });
}
    
    
    updateAvailableNodes() {
        // Reset available status for all nodes
        this.nodes.forEach(node => {
            node.available = false;
        });
        
        // Find nodes connected to the current node
        this.connections.forEach(conn => {
            if (conn.from === this.currentNodeIndex) {
                const connectedNode = this.nodes[conn.to];
                
                // Make connected nodes available if not already visited
                if (!connectedNode.visited) {
                    connectedNode.available = true;
                }
            }
        });
        
        // Redraw the map to reflect changes
        this.drawMap();
    }
    
    createPlayerStats() {
        const health = this.registry.get('player-health');
        const maxHealth = this.registry.get('player-max-health');
        
        // Add health display
        this.add.image(50, 50, 'health-icon').setScale(0.5);
        
        this.add.text(80, 50, `${health}/${maxHealth}`, {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#ffffff'
        }).setOrigin(0, 0.5);
    }
    
    createBackButton() {
        // Add back button
        const backButton = this.add.text(20, 20, '< Back', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#aaaaaa'
        });
        
        backButton.setInteractive({ useHandCursor: true });
        
        backButton.on('pointerover', () => {
            backButton.setColor('#ffffff');
        });
        
        backButton.on('pointerout', () => {
            backButton.setColor('#aaaaaa');
        });
        
        backButton.on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        });
    }
    
    showMessage(message) {
        // Get dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create message box
        const messageBg = this.add.rectangle(width / 2, height / 2, 400, 200, 0x000000, 0.8);
        messageBg.setStrokeStyle(2, 0xffffff);
        
        // Add message text
        const messageText = this.add.text(width / 2, height / 2 - 30, message, {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 380 }
        });
        messageText.setOrigin(0.5);
        
        // Add OK button
        const okButton = this.add.text(width / 2, height / 2 + 50, 'OK', {
            fontFamily: 'Arial',
            fontSize: 18,
            color: '#ffffff',
            backgroundColor: '#444444',
            padding: { x: 20, y: 10 }
        });
        okButton.setOrigin(0.5);
        okButton.setInteractive({ useHandCursor: true });
        
        // Add hover effect
        okButton.on('pointerover', () => {
            okButton.setBackgroundColor('#666666');
        });
        
        okButton.on('pointerout', () => {
            okButton.setBackgroundColor('#444444');
        });
        
        // Add click handler to close message
        okButton.on('pointerdown', () => {
            messageBg.destroy();
            messageText.destroy();
            okButton.destroy();
            
            // Redraw map to update state
            this.scene.restart();
        });
    }
}
