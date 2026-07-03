const fs = require('fs');
const { PNG } = require('pngjs');

const inputPath = 'C:\\Users\\rese_\\.gemini\\antigravity\\brain\\076a49fd-eb6e-4525-93c3-876c857cf2f6\\media__1783097281518.png';
const outUpPath = 'public/pushups_up.png';
const outDownPath = 'public/pushups_down.png';

fs.createReadStream(inputPath)
  .pipe(new PNG())
  .on('parsed', function () {
    console.log(`Original dimensions: ${this.width}x${this.height}`);

    const targetWidth = 561;
    const targetHeight = 262;

    // 1. Create pushups_up.png (top frame)
    // Source bounding box: X [233, 793], Y [111, 372]
    const upPng = new PNG({ width: targetWidth, height: targetHeight });
    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        const srcX = 233 + x;
        const srcY = 111 + y;
        const srcIdx = (this.width * srcY + srcX) << 2;
        const dstIdx = (targetWidth * y + x) << 2;

        upPng.data[dstIdx] = this.data[srcIdx];     // R
        upPng.data[dstIdx+1] = this.data[srcIdx+1]; // G
        upPng.data[dstIdx+2] = this.data[srcIdx+2]; // B
        upPng.data[dstIdx+3] = this.data[srcIdx+3]; // A
      }
    }

    // 2. Create pushups_down.png (bottom frame)
    // Source bounding box: X [233, 793], Y [518, 650] (bottom half)
    // We want to align this to the bottom of the canvas, so it starts at y = 129 (262 - 133)
    const downPng = new PNG({ width: targetWidth, height: targetHeight });
    
    // Initialize downPng with all black (since the source has a black background)
    for (let i = 0; i < downPng.data.length; i += 4) {
      downPng.data[i] = 0;     // R
      downPng.data[i+1] = 0;   // G
      downPng.data[i+2] = 0;   // B
      downPng.data[i+3] = 255; // A (fully opaque black)
    }

    const srcStartOffset = 518; // 409 + 109
    const destStartOffset = 129; // 262 - 133
    const botHeight = 133;

    for (let y = 0; y < botHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        const srcX = 233 + x;
        const srcY = srcStartOffset + y;
        const srcIdx = (this.width * srcY + srcX) << 2;
        const destY = destStartOffset + y;
        const dstIdx = (targetWidth * destY + x) << 2;

        downPng.data[dstIdx] = this.data[srcIdx];     // R
        downPng.data[dstIdx+1] = this.data[srcIdx+1]; // G
        downPng.data[dstIdx+2] = this.data[srcIdx+2]; // B
        downPng.data[dstIdx+3] = this.data[srcIdx+3]; // A
      }
    }

    // Write pushups_up.png
    upPng.pack().pipe(fs.createWriteStream(outUpPath))
      .on('finish', () => console.log('Saved pushups_up.png'));

    // Write pushups_down.png
    downPng.pack().pipe(fs.createWriteStream(outDownPath))
      .on('finish', () => console.log('Saved pushups_down.png'));

  })
  .on('error', function (err) {
    console.error('Error processing sprite sheet:', err);
  });
