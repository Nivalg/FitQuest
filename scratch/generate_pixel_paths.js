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

    // Green color matching
    if (g > 120 && r < 120 && b < 120 && a > 0) {
      greenPixels.push({ x, y });
    }
  }
}

// Group contiguous pixels using BFS
const visited = Array.from({ length: height }, () => Array(width).fill(false));
const groups = [];

for (const p of greenPixels) {
  if (visited[p.y][p.x]) continue;

  const group = [];
  const queue = [p];
  visited[p.y][p.x] = true;

  while (queue.length > 0) {
    const curr = queue.shift();
    group.push(curr);

    const neighbors = [
      { x: curr.x + 1, y: curr.y },
      { x: curr.x - 1, y: curr.y },
      { x: curr.x, y: curr.y + 1 },
      { x: curr.x, y: curr.y - 1 }
    ];

    for (const n of neighbors) {
      if (n.x >= 0 && n.x < width && n.y >= 0 && n.y < height) {
        if (!visited[n.y][n.x]) {
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

// Classify each group by its centroid to match muscles
const classifiedPaths = [];

// Helper to generate pixel-perfect SVG path string from a list of pixels
function pixelsToSVGPath(pixels) {
  // Group pixels by row y
  const rows = {};
  for (const p of pixels) {
    if (!rows[p.y]) rows[p.y] = [];
    rows[p.y].push(p.x);
  }

  let pathD = "";
  for (const yStr of Object.keys(rows).sort((a, b) => Number(a) - Number(b))) {
    const y = Number(yStr);
    const xList = rows[y].sort((a, b) => a - b);

    // Find contiguous spans in this row
    let spanStart = xList[0];
    let prevX = xList[0];

    for (let i = 1; i <= xList.length; i++) {
      const x = xList[i];
      if (x === prevX + 1) {
        prevX = x;
      } else {
        // End of span: draw a 1px tall rectangle from spanStart to prevX + 1
        pathD += `M ${spanStart} ${y} H ${prevX + 1} V ${y + 1} H ${spanStart} Z `;
        if (x !== undefined) {
          spanStart = x;
          prevX = x;
        }
      }
    }
  }
  return pathD.trim();
}

groups.forEach((group, index) => {
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
  const centroidX = Math.round(sumX / group.length);
  const centroidY = Math.round(sumY / group.length);

  let muscleName = "unknown";
  let side = ""; // left or right (front/back)

  // Map centroids to muscles (Left figure center = 274, Right figure center = 678)
  if (centroidX < 488) {
    // Front view
    const xDist = centroidX - 274;
    if (centroidY < 155) {
      if (Math.abs(xDist) < 40) {
        // Chest
        muscleName = "chest";
        side = xDist < 0 ? "l" : "r";
      } else {
        // Shoulders
        muscleName = "shoulders";
        side = xDist < 0 ? "l" : "r";
      }
    } else if (centroidY >= 155 && centroidY < 210) {
      if (Math.abs(xDist) < 30) {
        // Core (abs top rows)
        muscleName = "core";
        side = "abs";
      } else {
        // Biceps
        muscleName = "biceps";
        side = xDist < 0 ? "l" : "r";
      }
    } else if (centroidY >= 210 && centroidY < 260) {
      if (Math.abs(xDist) < 30) {
        // Core (abs bottom rows)
        muscleName = "core";
        side = "abs";
      } else {
        // Forearms
        muscleName = "forearms";
        side = xDist < 0 ? "l" : "r";
      }
    } else if (centroidY >= 260 && centroidY < 380) {
      if (Math.abs(xDist) >= 30) {
        // Quads (top/outer leg on the middle to outside range)
        muscleName = "quads";
        side = xDist < 0 ? "l" : "r";
      } else {
        // Inner thighs (front view) -> Grouped with Hamstrings (adductors)
        muscleName = "hamstrings";
        side = xDist < 0 ? "inner-l" : "inner-r";
      }
    } else if (centroidY >= 380) {
      // Calves/shin
      muscleName = "calves";
      side = xDist < 0 ? "l" : "r";
    }
  } else {
    // Back view
    const xDist = centroidX - 678;
    if (centroidY < 115) {
      // Traps
      muscleName = "traps";
      side = xDist < 0 ? "l" : "r";
    } else if (centroidY >= 115 && centroidY < 165) {
      if (Math.abs(xDist) < 50) {
        // Upper Back (shoulder blades)
        muscleName = "back";
        side = xDist < 0 ? "blade-l" : "blade-r";
      } else {
        // Shoulders Back
        muscleName = "shoulders";
        side = xDist < 0 ? "back-l" : "back-r";
      }
    } else if (centroidY >= 165 && centroidY < 235) {
      if (Math.abs(xDist) < 20) {
        // Lower Back or Lats inner
        muscleName = "back";
        side = "lower";
      } else if (Math.abs(xDist) >= 20 && Math.abs(xDist) < 55) {
        // Lats
        muscleName = "back";
        side = xDist < 0 ? "lat-l" : "lat-r";
      } else {
        // Triceps
        muscleName = "triceps";
        side = xDist < 0 ? "l" : "r";
      }
    } else if (centroidY >= 235 && centroidY < 310) {
      if (Math.abs(xDist) < 50) {
        // Glutes
        muscleName = "glutes";
        side = xDist < 0 ? "l" : "r";
      } else {
        // Forearms back
        muscleName = "forearms";
        side = xDist < 0 ? "back-l" : "back-r";
      }
    } else if (centroidY >= 310 && centroidY < 382) {
      if (Math.abs(xDist) < 18) {
        // Adductors back view
        muscleName = "hamstrings";
        side = xDist < 0 ? "adductor-l" : "adductor-r";
      } else {
        // Hamstrings
        muscleName = "hamstrings";
        side = xDist < 0 ? "l" : "r";
      }
    } else if (centroidY >= 382) {
      // Calves back view
      muscleName = "calves";
      side = xDist < 0 ? "back-l" : "back-r";
    }
  }

  const d = pixelsToSVGPath(group);
  classifiedPaths.push({
    muscle: muscleName,
    id: `${muscleName}-${side || index}`,
    d
  });
});

console.log(`Generated ${classifiedPaths.length} classified muscle paths.`);

// Write the output to a file that we can paste directly into React!
const outputCode = `export const pixelMusclePaths = ${JSON.stringify(classifiedPaths, null, 2)};`;
fs.writeFileSync('c:/Users/rese_/OneDrive/Desktop/FitQuest/scratch/pixel_paths.js', outputCode);
console.log('Saved React array to scratch/pixel_paths.js');
