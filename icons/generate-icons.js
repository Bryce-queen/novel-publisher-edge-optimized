#!/usr/bin/env node
/**
 * PNG 图标生成脚本
 * 生成 16x16、32x32、48x48、128x128 四个尺寸的深蓝色背景 + 白色书本图案 PNG 图标
 * 使用纯 Node.js 生成，不依赖 canvas 模块
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ICONS_DIR = __dirname;

// PNG 文件结构
function createPNG(width, height, pixels) {
  // PNG 签名
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 6;  // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = createChunk('IHDR', ihdrData);

  // IDAT chunk - raw pixel data with filter bytes
  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    rawData[rowOffset] = 0; // filter: None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const color = pixels[y][x];
      rawData[pixelOffset] = color[0];     // R
      rawData[pixelOffset + 1] = color[1]; // G
      rawData[pixelOffset + 2] = color[2]; // B
      rawData[pixelOffset + 3] = color[3]; // A
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idat = createChunk('IDAT', compressed);

  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// CRC32 计算
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xEDB88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

/**
 * 生成图标像素数据
 * 深蓝色背景 (#0f3460) + 白色书本图案
 */
function generateIconPixels(size) {
  const pixels = [];
  const bgColor = [15, 52, 96, 255];     // #0f3460
  const bookColor = [255, 255, 255, 255]; // white
  const spineColor = [200, 210, 230, 255]; // slightly blue-white for spine
  const pageColor = [240, 245, 255, 255]; // very light blue for pages

  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      // Normalize coordinates to 0-1 range
      const nx = x / size;
      const ny = y / size;

      // Book dimensions (centered)
      const bookLeft = 0.2;
      const bookRight = 0.8;
      const bookTop = 0.15;
      const bookBottom = 0.85;
      const spineX = 0.5;

      // Check if pixel is within book area
      if (nx >= bookLeft && nx <= bookRight && ny >= bookTop && ny <= bookBottom) {
        // Book border
        const borderW = 0.02;
        const isBorder = nx < bookLeft + borderW || nx > bookRight - borderW ||
                         ny < bookTop + borderW || ny > bookBottom - borderW;

        if (isBorder) {
          row.push(bookColor);
        } else {
          // Spine (center line)
          const spineW = 0.015;
          if (Math.abs(nx - spineX) < spineW) {
            row.push(spineColor);
          } else {
            // Pages area - slight gradient
            const distFromSpine = Math.abs(nx - spineX) / 0.3;
            const brightness = 240 + Math.floor(distFromSpine * 10);
            row.push([brightness, brightness + 3, Math.min(255, brightness + 12), 255]);
          }
        }
      } else {
        // Background with slight rounded corner effect
        const cornerRadius = 0.1;
        const dx = Math.max(0, Math.abs(nx - 0.5) - (0.5 - cornerRadius));
        const dy = Math.max(0, Math.abs(ny - 0.5) - (0.5 - cornerRadius));
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > cornerRadius * 0.3 && (nx < 0.05 || nx > 0.95 || ny < 0.05 || ny > 0.95)) {
          // Slightly lighter edge for depth
          row.push([20, 60, 100, 255]);
        } else {
          row.push(bgColor);
        }
      }
    }
    pixels.push(row);
  }

  return pixels;
}

// Generate icons for all sizes
const sizes = [16, 32, 48, 128];

for (const size of sizes) {
  const pixels = generateIconPixels(size);
  const png = createPNG(size, size, pixels);
  const filePath = path.join(ICONS_DIR, `icon${size}.png`);
  fs.writeFileSync(filePath, png);
  console.log(`Generated: ${filePath} (${png.length} bytes)`);
}

console.log('\nAll icons generated successfully!');
