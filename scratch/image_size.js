import fs from 'fs';

function getPNGDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  console.log(`${filePath}: ${width}x${height}`);
}

getPNGDimensions('c:/Users/rese_/OneDrive/Desktop/FitQuest/public/muscle_map.png');
getPNGDimensions('c:/Users/rese_/OneDrive/Desktop/FitQuest/public/muscle_map_yellow.png');
getPNGDimensions('c:/Users/rese_/OneDrive/Desktop/FitQuest/public/muscle_map_red.png');
