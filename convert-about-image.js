/**
 * Image processing and compression script using sharp
 * Resizes and optimizes the About section brother-sister duo photo to lightweight WebP format.
 */
import sharp from 'sharp';
import { statSync, writeFileSync, unlinkSync } from 'fs';

const file = 'brother-sister-duo.jpg';
const srcPath = `./src/assets/${file}`;
const destPath = './src/assets/brother-sister-duo.webp';

async function convertAboutImage() {
  console.log('🔄 Converting About page image to WebP...');
  try {
    const stat = statSync(srcPath);
    const beforeKB = Math.round(stat.size / 1024);
    
    const buffer = await sharp(srcPath)
      .resize({ width: 500 }) // Displayed width is small
      .webp({ quality: 80 })
      .toBuffer();
      
    writeFileSync(destPath, buffer);
    const afterKB = Math.round(buffer.length / 1024);
    console.log(`✅ Compressed: ${file} (${beforeKB}KB) -> brother-sister-duo.webp (${afterKB}KB)`);
    
    unlinkSync(srcPath);
    console.log(`🗑️  Deleted original JPG: ${file}`);
  } catch (err) {
    console.error(`❌ Error converting ${file}:`, err.message);
  }
}

convertAboutImage();
