'use strict';

// Exercise the packaged macOS executable itself, not Electron's development binary.
// The panorama is generated during CI, so the downloads repository contains no app source.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const zlib = require('node:zlib');
const { _electron: electron } = require('playwright');

const executablePath = process.env.ACGI_APP_EXECUTABLE;
assert.ok(executablePath && fs.existsSync(executablePath), 'Set ACGI_APP_EXECUTABLE to the packaged app binary');

const work = fs.mkdtempSync(path.join(os.tmpdir(), 'acgi-360-mac-smoke-'));
const panoramaPath = path.join(work, 'CI panorama.png');
const htmlPath = path.join(work, 'CI panorama & view.html');

const crcTable = Array.from({length: 256}, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});

function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const label = Buffer.from(type, 'ascii');
  let crc = 0xffffffff;
  for (const byte of Buffer.concat([label, data])) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([length, label, data, checksum]);
}

function createPanorama(filePath) {
  const width = 512;
  const height = 256;
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // RGB, 8 bits per channel.
  header[9] = 2;
  const pixels = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    const row = y * (1 + width * 3);
    for (let x = 0; x < width; x++) {
      const pixel = row + 1 + x * 3;
      pixels[pixel] = Math.round(x / (width - 1) * 255);
      pixels[pixel + 1] = Math.round(y / (height - 1) * 255);
      pixels[pixel + 2] = x < width / 2 ? 60 : 180;
    }
  }
  fs.writeFileSync(filePath, Buffer.concat([
    Buffer.from('89504e470d0a1a0a', 'hex'),
    pngChunk('IHDR', header),
    pngChunk('IDAT', zlib.deflateSync(pixels)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]));
}

(async () => {
  createPanorama(panoramaPath);
  const app = await electron.launch({executablePath, timeout: 90000});
  try {
    const page = await app.firstWindow();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.locator('#welcome').waitFor({timeout: 30000});
    assert.equal(await page.title(), 'ACGI 360');

    await app.evaluate(({BrowserWindow}, filePath) => {
      BrowserWindow.getAllWindows()[0].webContents.send('command', 'open-path', filePath);
    }, panoramaPath);
    const viewer = page.frameLocator('#frame');
    await viewer.locator('#stage canvas').waitFor({state: 'visible', timeout: 90000});
    assert.equal(await page.locator('#welcome').isVisible(), false);
    assert.equal(await viewer.locator('#err').textContent(), '');

    await page.locator('#text').click();
    assert.equal(await viewer.locator('#brand').isVisible(), false);
    await page.locator('#text').click();
    assert.equal(await viewer.locator('#brand').isVisible(), true);

    await app.evaluate(({dialog}, destination) => {
      dialog.showSaveDialog = async () => ({canceled: false, filePath: destination});
    }, htmlPath);
    await page.locator('#save').click();
    await page.waitForFunction(() => document.getElementById('status').textContent.startsWith('Saved '), null, {timeout: 120000});
    const html = fs.readFileSync(htmlPath, 'utf8');
    assert.match(html, /<title>CI panorama &amp; view<\/title>/);
    assert.match(html, /data:image\/png;base64,/);
    assert.equal((html.match(/class="f"/g) || []).length, 6);
    assert.deepEqual(errors, []);
    console.log('Packaged Mac app opened a panorama, toggled text, and saved standalone HTML with six cube faces.');
  } finally {
    await app.close();
    fs.rmSync(work, {recursive: true, force: true});
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
