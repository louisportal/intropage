#!/usr/bin/env node
// One-shot: generate WebP full + thumb variants for every photo in
// assets/Inovexus photos/. Idempotent — skips files that already have WebPs.
// Run: node scripts/build-inovexus-webp.mjs

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(REPO_ROOT, 'assets/Inovexus photos');
const FULL_DIR = path.join(SRC_DIR, 'webp/full');
const THUMB_DIR = path.join(SRC_DIR, 'webp/thumb');

const FULL_WIDTH = 1600;
const THUMB_WIDTH = 600;
const EXT_RE = /\.(jpe?g|png)$/i;

await fs.mkdir(FULL_DIR, { recursive: true });
await fs.mkdir(THUMB_DIR, { recursive: true });

const entries = (await fs.readdir(SRC_DIR)).filter(f => !f.startsWith('.') && EXT_RE.test(f));
if (entries.length === 0) {
  console.log('No photos found in', SRC_DIR);
  process.exit(0);
}

let made = 0, skipped = 0;
for (const file of entries) {
  const base = file.replace(EXT_RE, '');
  const srcPath = path.join(SRC_DIR, file);
  const fullPath = path.join(FULL_DIR, `${base}.webp`);
  const thumbPath = path.join(THUMB_DIR, `${base}.webp`);

  const fullExists = await fs.access(fullPath).then(() => true, () => false);
  const thumbExists = await fs.access(thumbPath).then(() => true, () => false);
  if (fullExists && thumbExists) { skipped++; continue; }

  console.log(`Processing ${file}...`);
  if (!fullExists) {
    await sharp(srcPath)
      .rotate()
      .resize({ width: FULL_WIDTH, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(fullPath);
  }
  if (!thumbExists) {
    await sharp(srcPath)
      .rotate()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(thumbPath);
  }
  made++;
}

console.log(`\nDone. Generated WebPs for ${made} photo(s), skipped ${skipped} already done.`);
