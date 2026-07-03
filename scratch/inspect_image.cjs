const fs = require('fs');
const { PNG } = require('pngjs');

const imagePath = 'C:\\Users\\rese_\\.gemini\\antigravity\\brain\\076a49fd-eb6e-4525-93c3-876c857cf2f6\\media__1783097281518.png';

fs.createReadStream(imagePath)
  .pipe(new PNG())
  .on('parsed', function () {
    console.log(`Image parsed successfully. Width: ${this.width}, Height: ${this.height}`);
    
    const halfHeight = Math.floor(this.height / 2);
    
    function isForeground(r, g, b, a) {
      return (r > 5 || g > 5 || b > 5) && a > 0;
    }

    // Analyze top half
    let topMinX = this.width, topMaxX = 0, topMinY = halfHeight, topMaxY = 0;
    for (let y = 0; y < halfHeight; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = (this.width * y + x) << 2;
        if (isForeground(this.data[idx], this.data[idx+1], this.data[idx+2], this.data[idx+3])) {
          if (x < topMinX) topMinX = x;
          if (x > topMaxX) topMaxX = x;
          if (y < topMinY) topMinY = y;
          if (y > topMaxY) topMaxY = y;
        }
      }
    }

    // Analyze bottom half
    let botMinX = this.width, botMaxX = 0, botMinY = this.height, botMaxY = halfHeight;
    for (let y = halfHeight; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = (this.width * y + x) << 2;
        if (isForeground(this.data[idx], this.data[idx+1], this.data[idx+2], this.data[idx+3])) {
          if (x < botMinX) botMinX = x;
          if (x > botMaxX) botMaxX = x;
          if (y < botMinY) botMinY = y;
          if (y > botMaxY) botMaxY = y;
        }
      }
    }

    console.log('Top half bounding box:');
    console.log(`  X: [${topMinX}, ${topMaxX}] (width: ${topMaxX - topMinX + 1})`);
    console.log(`  Y: [${topMinY}, ${topMaxY}] (height: ${topMaxY - topMinY + 1})`);
    console.log(`  Distance from bottom of top half: ${halfHeight - 1 - topMaxY}`);

    console.log('Bottom half bounding box:');
    console.log(`  X: [${botMinX}, ${botMaxX}] (width: ${botMaxX - botMinX + 1})`);
    console.log(`  Y: [${botMinY - halfHeight}, ${botMaxY - halfHeight}] (height: ${botMaxY - botMinY + 1})`);
    console.log(`  Distance from bottom of bottom half: ${this.height - 1 - botMaxY}`);
  })
  .on('error', function (err) {
    console.error('Error reading PNG:', err);
  });
