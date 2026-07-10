import sharp from 'sharp';
import { writeFileSync } from 'fs';

const INPUT_IMAGE = './src/assets/br-logo-optimized.webp';
const OUTPUT_IMAGE = './src/assets/br-logo-optimized-transparent.webp';

async function removeCheckerboardBackground() {
  console.log('Processing logo to remove transparent grid checkerboard pattern...');
  try {
    const inputBuffer = await sharp(INPUT_IMAGE)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data, info } = inputBuffer;
    
    // checkerboard grey is #CCCCCC (204) or similar.
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const isWhite = (r > 240 && g > 240 && b > 240);
      const isCheckerboardGrey = (Math.abs(r - 204) < 15 && Math.abs(g - 204) < 15 && Math.abs(b - 204) < 15);
      
      if (isWhite || isCheckerboardGrey) {
        data[i + 3] = 0; // alpha to 0
      }
    }

    const outputBuffer = await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
    .webp({ quality: 85 })
    .toBuffer();

    writeFileSync(OUTPUT_IMAGE, outputBuffer);
    console.log('Successfully created br-logo-optimized-transparent.webp!');
  } catch (err) {
    console.error('Error processing transparent logo:', err);
  }
}

removeCheckerboardBackground();
