const fs = require('fs');
const { PNG } = require('pngjs');

const imagePath = 'C:\\Users\\rese_\\.gemini\\antigravity\\brain\\076a49fd-eb6e-4525-93c3-876c857cf2f6\\media__1783097281518.png';

fs.createReadStream(imagePath)
  .pipe(new PNG())
  .on('parsed', function () {
    const halfHeight = Math.floor(this.height / 2);

    // Let's define "white pixel"
    function isWhite(r, g, b, a) {
      return r > 200 && g > 200 && b > 200 && a > 200;
    }

    // Top half: shoe is at the bottom-left of the character
    // Bounding box of character was X: [234, 792], Y: [111, 372]
    // Let's search in X: [230, 300], Y: [300, 380] for the shoe
    let topShoeMinX = this.width, topShoeMaxX = 0, topShoeMinY = halfHeight, topShoeMaxY = 0;
    let topCount = 0;
    let topSumX = 0, topSumY = 0;

    for (let y = 300; y <= 375; y++) {
      for (let x = 230; x <= 300; x++) {
        const idx = (this.width * y + x) << 2;
        if (isWhite(this.data[idx], this.data[idx+1], this.data[idx+2], this.data[idx+3])) {
          if (x < topShoeMinX) topShoeMinX = x;
          if (x > topShoeMaxX) topShoeMaxX = x;
          if (y < topShoeMinY) topShoeMinY = y;
          if (y > topShoeMaxY) topShoeMaxY = y;
          topSumX += x;
          topSumY += y;
          topCount++;
        }
      }
    }

    // Bottom half: shoe is at the bottom-left of the character
    // Bounding box was X: [233, 793], Y: [109, 241] relative to 409, i.e. absolute Y: [518, 650]
    // Let's search in X: [230, 300], Y: [600, 660] for the shoe
    let botShoeMinX = this.width, botShoeMaxX = 0, botShoeMinY = this.height, botShoeMaxY = halfHeight;
    let botCount = 0;
    let botSumX = 0, botSumY = 0;

    for (let y = 600; y <= 655; y++) {
      for (let x = 230; x <= 300; x++) {
        const idx = (this.width * y + x) << 2;
        if (isWhite(this.data[idx], this.data[idx+1], this.data[idx+2], this.data[idx+3])) {
          if (x < botShoeMinX) botShoeMinX = x;
          if (x > botShoeMaxX) botShoeMaxX = x;
          if (y < botShoeMinY) botShoeMinY = y;
          if (y > botShoeMaxY) botShoeMaxY = y;
          botSumX += x;
          botSumY += y;
          botCount++;
        }
      }
    }

    const topAvgX = topCount ? topSumX / topCount : 0;
    const topAvgY = topCount ? topSumY / topCount : 0;

    const botAvgX = botCount ? botSumX / botCount : 0;
    const botAvgY = botCount ? botSumY / botCount : 0;

    console.log('Top half shoe details:');
    console.log(`  Count: ${topCount}`);
    console.log(`  Bounding box: X: [${topShoeMinX}, ${topShoeMaxX}], Y: [${topShoeMinY}, ${topShoeMaxY}]`);
    console.log(`  Average center: (${topAvgX.toFixed(2)}, ${topAvgY.toFixed(2)})`);

    console.log('Bottom half shoe details:');
    console.log(`  Count: ${botCount}`);
    console.log(`  Bounding box: X: [${botShoeMinX}, ${botShoeMaxX}], Y: [${botShoeMinY}, ${botShoeMaxY}]`);
    console.log(`  Average center: (${botAvgX.toFixed(2)}, ${(botAvgY - halfHeight).toFixed(2)}) (relative to half)`);

    console.log('Offsets (Top - Bottom):');
    console.log(`  Delta X: ${(topAvgX - botAvgX).toFixed(2)}`);
    console.log(`  Delta Y: ${(topAvgY - (botAvgY - halfHeight)).toFixed(2)}`);
  })
  .on('error', function (err) {
    console.error('Error reading PNG:', err);
  });
