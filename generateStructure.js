const fs = require('fs');
const path = require('path');

// Project structure as a string (copy-paste the structure here)
const structureText = `ai-risk-deckbuilder/
├── src/
│   ├── assets/
│   │   ├── images/
│   │   │   ├── cards/
│   │   │   ├── ui/
│   │   │   └── characters/
│   │   └── audio/
│   ├── js/
│   │   ├── scenes/
│   │   │   ├── BootScene.js
│   │   │   ├── PreloaderScene.js
│   │   │   ├── MainMenuScene.js
│   │   │   ├── CombatScene.js
│   │   │   └── MapScene.js
│   │   ├── components/
│   │   │   ├── Card.js
│   │   │   ├── Deck.js
│   │   │   ├── Enemy.js
│   │   │   └── Player.js
│   │   ├── config/
│   │   │   ├── CardData.js
│   │   │   └── EnemyData.js
│   │   └── main.js
│   └── index.html
├── webpack.config.js
└── package.json`;

// Function to create directories
function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Function to create files
function createFile(filePath) {
  const dir = path.dirname(filePath);
  createDirectory(dir);
  
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '');
    console.log(`Created file: ${filePath}`);
  }
}

// Function to parse the structure text and create files/directories
function createStructure(structure) {
  const lines = structure.split('\n');
  
  lines.forEach(line => {
    // Skip empty lines
    if (!line.trim()) return;
    
    // Clean up the path from tree symbols
    let cleanPath = line.replace(/├── |└── |│   |    /g, '');
    
    // If it ends with / it's a directory
    if (cleanPath.endsWith('/')) {
      createDirectory(cleanPath);
    } 
    // Otherwise, it's a file if it contains a dot
    else if (cleanPath.includes('.')) {
      createFile(cleanPath);
    }
    // It might be a root directory without the trailing /
    else {
      createDirectory(cleanPath);
    }
  });
  
  console.log("Project structure created successfully!");
}

// Create the structure
createStructure(structureText);