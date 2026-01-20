#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const tag = process.env.CAPTURE_TAG || process.env.E2E_CAPTURE_TAG || 'latest';
const baseDir = path.resolve(__dirname, '..', 'captures', tag);
const outZip = path.resolve(__dirname, '..', 'captures', `${tag}.zip`);

if (!fs.existsSync(baseDir)) {
  console.error(`Capture dir not found: ${baseDir}`);
  process.exit(1);
}

const output = fs.createWriteStream(outZip);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`Wrote ${outZip} (${archive.pointer()} bytes)`);
});
archive.on('warning', (err) => { if (err.code !== 'ENOENT') throw err; });
archive.on('error', (err) => { throw err; });

archive.pipe(output);
archive.directory(baseDir, false);
archive.finalize();

