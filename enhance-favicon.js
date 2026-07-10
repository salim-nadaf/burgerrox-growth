import sharp from 'sharp';
import { writeFileSync } from 'fs';

const INPUT_IMAGE = 'C:\\Users\\Sumaiya\\.gemini\\antigravity\\scratch\\burgerrox-10977670\\public\\favicon-sm.png';
const OUTPUT_IMAGE = 'C:\\Users\\Sumaiya\\.gemini\\antigravity\\scratch\\burgerrox-10977670\\public\\favicon-sm.png';

async function enhanceFavicon() {
  console.log('Processing and enhancing favicon...');

  try {
    // We will:
    // 1. Remove the solid black background: select pixels that are very close to black (#000000) and make them transparent.
    // 2. We do this by creating a mask where pure black / very dark pixels become fully transparent.
    // 3. Output a high-quality PNG with transparent background.
    // 4. Resize to a standard high-quality favicon size (128x128 or 256x256) to reduce file size (currently it is 874KB which is huge for a favicon!).
    
    const size = 128; // Favicon-standard size (perfect compromise for speed and crispness)
    
    const inputBuffer = await sharp(INPUT_IMAGE)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data, info } = inputBuffer;
    const threshold = 18; // Any pixel where R, G, B are all below 18 will be set to transparent (remove pure black bg)

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // If pixel is black or near-black, make it transparent
      if (r < threshold && g < threshold && b < threshold) {
        data[i + 3] = 0; // alpha = 0 (fully transparent)
      }
    }

    // Write back the processed raw data to PNG format
    const outputBuffer = await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
    .png({ compressionLevel: 9 })
    .toBuffer();

    writeFileSync(OUTPUT_IMAGE, outputBuffer);
    console.log(`Successfully enhanced favicon! File size reduced and background removed.`);
  } catch (err) {
    console.error('Error enhancing favicon:', err);
  }
}

enhanceFavicon();
