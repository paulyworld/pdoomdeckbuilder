const fs = require('fs');
const path = require('path');

const outputFilePath = 'directory_backup.txt'; // Output file name
const targetDirectory = './ai-risk-deckbuilder'; // Change this to your project directory

function generateTree(dirPath, prefix = '') {
    let result = '';
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    items.forEach((item, index) => {
        const isLast = index === items.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        const newPrefix = prefix + (isLast ? '    ' : '│   ');

        if (item.isDirectory()) {
            result += `${prefix}${connector}${item.name}/\n`;
            result += generateTree(path.join(dirPath, item.name), newPrefix);
        } else {
            result += `${prefix}${connector}${item.name}\n`;
        }
    });

    return result;
}

function createDirectoryTreeFile() {
    if (!fs.existsSync(targetDirectory)) {
        console.error('Error: Target directory does not exist.');
        return;
    }

    const tree = `${path.basename(targetDirectory)}/\n` + generateTree(targetDirectory);
    fs.writeFileSync(outputFilePath, tree, 'utf8');
    console.log(`Directory structure saved to ${outputFilePath}`);
}

createDirectoryTreeFile();
