/**
 * Image processing and compression script using sharp
 * Resizes and optimizes all heavy menu JPG/PNG images to lightweight WebP files.
 */
import sharp from 'sharp';
import { readdirSync, statSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

const ASSETS_DIR = './src/assets';

// List of all menu assets that we need to convert to WebP
const imagesToOptimize = [
  'Aloo Rock Burger.jpg',
  'Blaze Chicken Burger.jpg',
  'Blaze Veg Burger.jpg',
  'Burger Rox Zinger.jpg',
  'Double Blaze Veg.jpg',
  'Peri Peri Fries.jpg',
  'Salted Fries.jpg',
  'chicken-burger.jpg',
  'egg-burger.jpg',
  'lava-cake.jpg'
];

async function convertToWebP() {
  console.log('🔄 Starting high-quality conversion and compression of menu JPG images to WebP...');
  for (const filename of imagesToOptimize) {
    try {
      const srcPath = join(ASSETS_DIR, filename);
      const outputFilename = filename.replace(/\.(jpg|jpeg)$/i, '.webp');
      const destPath = join(ASSETS_DIR, outputFilename);
      
      const stat = statSync(srcPath);
      const beforeKB = Math.round(stat.size / 1024);
      
      // Resize to max 300px width/height since displayed at max 72px width on menu cards.
      // This reduces sizes by up to 90%+ while keeping them crisp.
      const buffer = await sharp(srcPath)
        .resize({ width: 300, height: 300, fit: 'cover' })
        .webp({ quality: 80 })
        .toBuffer();
        
      writeFileSync(destPath, buffer);
      
      const afterKB = Math.round(buffer.length / 1024);
      console.log(`✅ Compressed: ${filename} (${beforeKB}KB) -> ${outputFilename} (${afterKB}KB)`);
      
      // Delete the original heavy JPG image to free space and prevent bundle bloat
      unlinkSync(srcPath);
      console.log(`🗑️  Deleted original JPG: ${filename}`);
    } catch (err) {
      console.error(`❌ Error converting ${filename}:`, err.message);
    }
  }
  console.log('🎉 Menu image optimization and conversion completed!');
}

convertToWebP();
