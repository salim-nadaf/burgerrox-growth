/**
 * Image processing and compression script using sharp
 * Compresses the newly generated gourmet images to replace the local assets
 */
import sharp from 'sharp';
import { writeFileSync } from 'fs';

const SRC_DIR = 'C:\\Users\\Sumaiya\\.gemini\\antigravity\\brain\\1d5c69eb-3e29-45b5-b96e-6761e1f160ec';
const DEST_DIR = 'C:\\Users\\Sumaiya\\.gemini\\antigravity\\scratch\\burgerrox-10977670\\src\\assets';

const configs = [
  { src: 'full_meal_gourmet_1783695108469.png', dest: 'full-meal-sm.webp', width: 600, quality: 72 },
  { src: 'zinger_burger_gourmet_1783695130614.png', dest: 'variety-sm.webp', width: 600, quality: 72 },
  { src: 'veg_crispy_gourmet_1783695151798.png', dest: 'veg-crispy-sm.webp', width: 600, quality: 72 },
  { src: 'lava_cake_gourmet_1783695173619.png', dest: 'lava-cake-sm.webp', width: 600, quality: 72 },
  { src: 'potato_wedges_gourmet_1783695196496.png', dest: 'potato-wedges-sm.webp', width: 600, quality: 72 },
  { src: 'chicken_popcorn_gourmet_1783695217515.png', dest: 'chicken-popcorn-sm.webp', width: 600, quality: 72 }
];

async function processGourmetImages() {
  console.log('Starting compression of brand-new gourmet images...');
  for (const cfg of configs) {
    try {
      const srcPath = `${SRC_DIR}\\${cfg.src}`;
      const destPath = `${DEST_DIR}\\${cfg.dest}`;
      
      const compressed = await sharp(srcPath)
        .resize({ width: cfg.width, withoutEnlargement: true })
        .webp({ quality: cfg.quality })
        .toBuffer();
        
      writeFileSync(destPath, compressed);
      console.log(`Successfully optimized and copied ${cfg.src} -> ${cfg.dest}`);
    } catch (err) {
      console.error(`Error processing ${cfg.src}:`, err.message);
    }
  }
  console.log('All gourmet images successfully compressed and replaced!');
}

processGourmetImages();
