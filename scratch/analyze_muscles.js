import fs from 'fs';
import { PNG } from 'pngjs';

const fileData = fs.readFileSync('c:/Users/rese_/OneDrive/Desktop/FitQuest/public/muscle_map.png');
const png = PNG.sync.read(fileData);

const width = png.width;
const height = png.height;

// Find all green pixels
const greenPixels = [];
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (width * y + x) << 2;
    const r = png.data[idx];
    const g = png.data[idx + 1];
    const b = png.data[idx + 2];
    const a = png.data[idx + 3];

    // Green color matching (e.g. green in the sprite is typically #22c55e or pure green)
    // Looking at the target image, it's a solid retro green: R=74, G=177, B=54 or similar
    if (g > 120 && r < 120 && b < 120 && a > 0) {
      greenPixels.push({ x, y });
    }
  }
}

console.log(`Found ${greenPixels.length} green pixels.`);

// Group contiguous pixels using Breadth-First Search (BFS)
const visited = Array.from({ length: height }, () => Array(width).fill(false));
const groups = [];

for (const p of greenPixels) {
  if (visited[p.y][p.x]) continue;

  // Start new group
  const group = [];
  const queue = [p];
  visited[p.y][p.x] = true;

  while (queue.length > 0) {
    const curr = queue.shift();
    group.push(curr);

    // 4-connectivity neighbors
    const neighbors = [
      { x: curr.x + 1, y: curr.y },
      { x: curr.x - 1, y: curr.y },
      { x: curr.x, y: curr.y + 1 },
      { x: curr.x, y: curr.y - 1 }
    ];

    for (const n of neighbors) {
      if (n.x >= 0 && n.x < width && n.y >= 0 && n.y < height) {
        if (!visited[n.y][n.x]) {
          // Check if neighbor is green
          const idx = (width * n.y + n.x) << 2;
          const r = png.data[idx];
          const g = png.data[idx + 1];
          const b = png.data[idx + 2];
          const a = png.data[idx + 3];

          if (g > 120 && r < 120 && b < 120 && a > 0) {
            visited[n.y][n.x] = true;
            queue.push(n);
          }
        }
      }
    }
  }
  groups.push(group);
}

console.log(`Grouped into ${groups.length} connected components.`);

// Sort groups by size descending
groups.sort((a, b) => b.length - a.length);

// Print summary of each group: bounding box and centroid
groups.forEach((group, idx) => {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  let sumX = 0, sumY = 0;
  for (const p of group) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
    sumX += p.x;
    sumY += p.y;
  }
  const avgX = Math.round(sumX / group.length);
  const avgY = Math.round(sumY / group.length);
  console.log(`Group #${idx}: Size=${group.length}, Bounding Box=[${minX}, ${minY}] to [${maxX}, ${maxY}], Centroid=[${avgX}, ${avgY}]`);
});
