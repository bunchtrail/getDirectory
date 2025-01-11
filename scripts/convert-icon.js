const sharp = require('sharp');
const path = require('path');

const svgPath = path.join(__dirname, '..', 'images', 'icon.svg');
const pngPath = path.join(__dirname, '..', 'images', 'icon.png');

sharp(svgPath)
    .resize(128, 128)
    .png()
    .toFile(pngPath)
    .then(() => console.log('Icon converted successfully!'))
    .catch(err => console.error('Error converting icon:', err)); 