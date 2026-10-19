import fs from 'fs';
import zlib from 'zlib';

function createSolidPng(width, height, r, g, b) {
  // Simple uncompressed or deflate PNG generator using Node zlib
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  function crc32(buf) {
    let c = -1;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (-(c & 1) & 0xedb88320);
      }
    }
    return c ^ -1;
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB color type
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Raw image scanlines
  const rawData = Buffer.alloc(height * (1 + width * 3));
  let pos = 0;
  for (let y = 0; y < height; y++) {
    rawData[pos++] = 0; // filter type 0 (None)
    for (let x = 0; x < width; x++) {
      // Create a nice dark pad border & neon pulse in center
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < width * 0.18) {
        // Cyan center
        rawData[pos++] = 0;
        rawData[pos++] = 240;
        rawData[pos++] = 255;
      } else if (dist < width * 0.35) {
        // Dark ring
        rawData[pos++] = 15;
        rawData[pos++] = 18;
        rawData[pos++] = 24;
      } else if (x < width * 0.08 || x > width * 0.92 || y < height * 0.08 || y > height * 0.92) {
        // Border
        rawData[pos++] = 30;
        rawData[pos++] = 35;
        rawData[pos++] = 45;
      } else {
        // Body
        rawData[pos++] = r;
        rawData[pos++] = g;
        rawData[pos++] = b;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = chunk('IDAT', compressed);
  const ihdrChunk = chunk('IHDR', ihdr);
  const iendChunk = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public');
}

fs.writeFileSync('./public/pwa-192x192.png', createSolidPng(192, 192, 18, 20, 26));
fs.writeFileSync('./public/pwa-512x512.png', createSolidPng(512, 512, 18, 20, 26));
fs.writeFileSync('./public/pwa-maskable-512x512.png', createSolidPng(512, 512, 18, 20, 26));
fs.writeFileSync('./public/apple-touch-icon.png', createSolidPng(180, 180, 18, 20, 26));
console.log('PWA PNG icons generated successfully.');
