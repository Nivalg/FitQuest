const fs = require('fs');
const { PNG } = require('pngjs');

const inputPath = 'C:\\Users\\rese_\\.gemini\\antigravity\\brain\\076a49fd-eb6e-4525-93c3-876c857cf2f6\\media__1783097281518.png';
const outUpPath = 'public/pushups_up.png';
const outDownPath = 'public/pushups_down.png';

fs.createReadStream(inputPath)
  .pipe(new PNG())
  .on('parsed', function () {
    console.log(`Original dimensions: ${this.width}x${this.height}`);

    const targetWidth = 700;
    const targetHeight = 300;

    const targetShoeX = 120;
    const targetShoeY = 235;

    // Top shoe center: (253.44, 338.41)
    const topShoeX = 253.44;
    const topShoeY = 338.41;

    // Bottom shoe center: (253.87, 613.04)
    const botShoeX = 253.87;
    const botShoeY = 613.04;

    // Function to process a frame
    function processFrame(shoeX, shoeY, yStart, yEnd) {
      const png = new PNG({ width: targetWidth, height: targetHeight });

      // Initialize with solid black
      for (let i = 0; i < png.data.length; i += 4) {
        png.data[i] = 0;     // R
        png.data[i+1] = 0;   // G
        png.data[i+2] = 0;   // B
        png.data[i+3] = 255; // A
      }

      // Map pixels
      for (let srcY = yStart; srcY <= yEnd; srcY++) {
        for (let srcX = 0; srcX < this.width; srcX++) {
          const destX = Math.round(srcX - shoeX + targetShoeX);
          const destY = Math.round(srcY - shoeY + targetShoeY);

          if (destX >= 0 && destX < targetWidth && destY >= 0 && destY < targetHeight) {
            const srcIdx = (this.width * srcY + srcX) << 2;
            const dstIdx = (targetWidth * destY + destX) << 2;

            png.data[dstIdx] = this.data[srcIdx];
            png.data[dstIdx+1] = this.data[srcIdx+1];
            png.data[dstIdx+2] = this.data[srcIdx+2];
            png.data[dstIdx+3] = this.data[srcIdx+3];
          }
        }
      }

      return png;
    }

    // 1. Process top frame (Regular Push-Ups UP)
    // Character Y range in top half was roughly [111, 372]
    const upPng = processFrame.call(this, topShoeX, topShoeY, 0, Math.floor(this.height / 2) - 1);

    // 2. Process bottom frame (Regular Push-Ups DOWN)
    // Character Y range in bottom half was roughly [518, 650]
    const downPng = processFrame.call(this, botShoeX, botShoeY, Math.floor(this.height / 2), this.height - 1);

    // Write pushups_up.png
    upPng.pack().pipe(fs.createWriteStream(outUpPath))
      .on('finish', () => console.log('Saved aligned pushups_up.png'));

    // Write pushups_down.png
    downPng.pack().pipe(fs.createWriteStream(outDownPath))
      .on('finish', () => console.log('Saved aligned pushups_down.png'));

  })
  .on('error', function (err) {
    console.error('Error processing sprite sheet:', err);
  });
