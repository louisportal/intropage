#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const INBOX_DIR = path.join(REPO_ROOT, 'assets/Activité/_inbox');
const ORIGINALS_DIR = path.join(REPO_ROOT, 'assets/Activité');
const WEBP_FULL_DIR = path.join(ORIGINALS_DIR, 'webp/full');
const WEBP_THUMB_DIR = path.join(ORIGINALS_DIR, 'webp/thumb');
const BACKUP_DIR = path.join(process.env.HOME, 'Pictures/Louisportal_originals');

const LANGS = ['fr', 'en', 'de', 'it'];
const FR_MONTHS = ['Jan.', 'Fév.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sep.', 'Oct.', 'Nov.', 'Déc.'];

const MAX_BYTES = 500 * 1024;
const FULL_WIDTH = 1600;
const THUMB_WIDTH = 600;

const FILENAME_RE = /^(\d{4})_(.+)\.(jpe?g|png)$/i;
const DRY_RUN = process.argv.includes('--dry-run');
const TITLES_ARG = process.argv.find(a => a.startsWith('--titles='));
const TITLES_FILE = TITLES_ARG ? TITLES_ARG.slice('--titles='.length) : null;

async function main() {
  await fs.mkdir(INBOX_DIR, { recursive: true });
  await fs.mkdir(WEBP_FULL_DIR, { recursive: true });
  await fs.mkdir(WEBP_THUMB_DIR, { recursive: true });
  await fs.mkdir(BACKUP_DIR, { recursive: true });

  const entries = await fs.readdir(INBOX_DIR);
  const valid = [];
  const invalid = [];
  for (const f of entries) {
    if (f.startsWith('.')) continue;
    const m = FILENAME_RE.exec(f);
    if (!m) { invalid.push(f); continue; }
    valid.push({
      file: f,
      yymm: m[1],
      year: '20' + m[1].slice(0, 2),
      month: parseInt(m[1].slice(2), 10),
      slug: m[2],
      ext: m[3].toLowerCase(),
    });
  }

  if (invalid.length) {
    console.warn(`Skipping ${invalid.length} file(s) with unsupported names (need YYMM_description.{jpg,jpeg,png}):`);
    invalid.forEach(f => console.warn(`  - ${f}`));
  }
  if (valid.length === 0) {
    console.log('Nothing to process. Drop YYMM_description.{jpg,jpeg,png} files in:');
    console.log(`  ${INBOX_DIR}`);
    return;
  }

  // Skip duplicates (already in assets/Activité/)
  const existingOriginals = new Set(await fs.readdir(ORIGINALS_DIR).catch(() => []));
  const toProcess = [];
  for (const p of valid) {
    const baseName = `${p.yymm}_${p.slug}`;
    const collisions = ['.jpg', '.jpeg', '.png'].some(ext => existingOriginals.has(baseName + ext));
    if (collisions) {
      console.warn(`Skipping ${p.file}: a file named ${baseName}.* already exists in assets/Activité/`);
      continue;
    }
    toProcess.push(p);
  }
  if (toProcess.length === 0) return;

  console.log(`Found ${toProcess.length} photo(s) to process.`);
  let titles;
  if (TITLES_FILE) {
    console.log(`Loading titles from ${TITLES_FILE}...`);
    const raw = await fs.readFile(TITLES_FILE, 'utf8');
    const obj = JSON.parse(raw);
    titles = toProcess.map(p => {
      const t = obj[p.file] || obj[`${p.yymm}_${p.slug}`];
      if (!t) throw new Error(`No titles provided for ${p.file} in ${TITLES_FILE}`);
      return t;
    });
  } else {
    console.log(`Translating titles via Claude API...`);
    titles = await translateBatch(toProcess.map(p => p.slug));
  }
  toProcess.forEach((p, i) => {
    Object.assign(p, titles[i]);
    console.log(`  ${p.file}`);
    console.log(`    FR: ${p.fr}`);
    console.log(`    EN: ${p.en}`);
    console.log(`    DE: ${p.de}`);
    console.log(`    IT: ${p.it}`);
  });

  if (DRY_RUN) {
    console.log('\n--dry-run: no files written, no HTML modified.');
    return;
  }

  for (const p of toProcess) {
    const baseName = `${p.yymm}_${p.slug}`;
    const inboxPath = path.join(INBOX_DIR, p.file);
    console.log(`\nProcessing ${p.file}...`);

    // Backup original
    await fs.copyFile(inboxPath, path.join(BACKUP_DIR, p.file));

    // Compress original to JPEG under 500KB
    const compressedSize = await compressOriginalToJpeg(inboxPath, path.join(ORIGINALS_DIR, `${baseName}.jpg`));
    console.log(`  compressed: ${(compressedSize / 1024).toFixed(0)} KB`);

    // WebP full
    await sharp(inboxPath)
      .rotate()
      .resize({ width: FULL_WIDTH, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(WEBP_FULL_DIR, `${baseName}.webp`));

    // WebP thumb
    await sharp(inboxPath)
      .rotate()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(path.join(WEBP_THUMB_DIR, `${baseName}.webp`));

    // Remove from inbox
    await fs.unlink(inboxPath);
    console.log(`  webp full + thumb generated, inbox cleared.`);
  }

  for (const lang of LANGS) {
    const htmlPath = path.join(REPO_ROOT, lang, 'elu_2021.html');
    let html = await fs.readFile(htmlPath, 'utf8');
    for (const p of toProcess) {
      html = insertPhotoBlock(html, p, lang);
    }
    await fs.writeFile(htmlPath, html);
    console.log(`Updated ${lang}/elu_2021.html`);
  }

  console.log(`\n✓ Done. ${toProcess.length} photo(s) added.`);
  console.log(`  Originals backed up to: ${BACKUP_DIR}`);
  console.log(`  Review: git status && git diff`);
  console.log(`  Commit: git add -A && git commit -m "Add photos: ${toProcess.map(p => p.yymm + '_' + p.slug).join(', ').slice(0, 70)}"`);
}

async function compressOriginalToJpeg(inputPath, outPath) {
  let q = 85;
  let maxDim = 2400;
  for (let i = 0; i < 12; i++) {
    const out = await sharp(inputPath)
      .rotate()
      .resize({ width: maxDim, height: maxDim, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: q, mozjpeg: true })
      .toBuffer();
    if (out.length <= MAX_BYTES) {
      await fs.writeFile(outPath, out);
      return out.length;
    }
    if (q > 60) q -= 5;
    else if (maxDim > 1400) maxDim -= 200;
    else { await fs.writeFile(outPath, out); return out.length; }
  }
  throw new Error(`Could not get ${path.basename(inputPath)} under ${MAX_BYTES} bytes`);
}

async function translateBatch(slugs) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set. Create a .env file (copy .env.example).');
  }
  const client = new Anthropic();
  const prompt = `For each French photo filename slug below, produce a clean, natural title in 4 languages.

The slug uses underscores where spaces should be. French apostrophes and accents have been stripped from the filename — restore them in the FR title (e.g., "AGM_de_l_UFEZ" → "AGM de l'UFEZ"). Then translate the FR title naturally to EN, DE, IT.

Use curly apostrophes ('), not straight ones. Keep proper nouns and acronyms (ASFE, UFEZ, LFZ, etc.) unchanged.

Return ONLY a JSON array (no markdown fences, no commentary), one object per input, in the same order:
[{"fr": "...", "en": "...", "de": "...", "it": "..."}, ...]

Inputs:
${slugs.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;

  const resp = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });
  const text = resp.content.map(c => c.text || '').join('');
  const m = text.match(/\[[\s\S]*\]/);
  if (!m) throw new Error('No JSON array found in translation response:\n' + text);
  const parsed = JSON.parse(m[0]);
  if (parsed.length !== slugs.length) {
    throw new Error(`Translation count mismatch: expected ${slugs.length}, got ${parsed.length}`);
  }
  return parsed;
}

function insertPhotoBlock(html, p, lang) {
  const yearMarker = `<span>${p.year}</span>`;
  const yearIdx = html.indexOf(yearMarker);

  if (yearIdx === -1) {
    return createNewYearSection(html, p, lang);
  }

  const gridOpenIdx = html.indexOf('<div class="photo-grid">', yearIdx);
  if (gridOpenIdx === -1) return html;
  const gridContentStart = gridOpenIdx + '<div class="photo-grid">'.length;

  const nextYearSection = html.indexOf('<div class="year-section">', gridOpenIdx + 1);
  const scanEnd = nextYearSection === -1 ? html.length : nextYearSection;

  const ITEM_RE = /<div class="photo-grid-item">\s*<img src="\.\.\/assets\/Activité\/webp\/thumb\/(\d{4,6})_[^"]+"[^>]*>\s*<div class="photo-overlay">[\s\S]*?<\/div>\s*<\/div>/g;
  ITEM_RE.lastIndex = gridContentStart;
  const items = [];
  let m;
  while ((m = ITEM_RE.exec(html)) !== null) {
    if (m.index >= scanEnd) break;
    items.push({
      startIdx: m.index,
      endIdx: m.index + m[0].length,
      yymm: parseInt(m[1].slice(0, 4), 10),
    });
  }

  const newYYMM = parseInt(p.yymm, 10);
  const block = renderPhotoGridItem(p, lang);
  const before = items.find(it => it.yymm < newYYMM);

  let insertIdx, content;
  if (before) {
    insertIdx = before.startIdx;
    content = block + '\n                ';
  } else if (items.length > 0) {
    insertIdx = items[items.length - 1].endIdx;
    content = '\n                ' + block;
  } else {
    insertIdx = gridContentStart;
    content = '\n                ' + block;
  }

  return html.slice(0, insertIdx) + content + html.slice(insertIdx);
}

function renderPhotoGridItem(p, lang) {
  const monthLabel = FR_MONTHS[p.month - 1];
  const title = p[lang];
  const alt = altText(p.slug);
  return `<div class="photo-grid-item">
                    <img src="../assets/Activité/webp/thumb/${p.yymm}_${p.slug}.webp" data-full="../assets/Activité/webp/full/${p.yymm}_${p.slug}.webp" alt="${alt}" loading="lazy" class="grid-photo" />
                    <div class="photo-overlay">
                        <span class="photo-date">${monthLabel} ${p.year}</span>
                        <span class="photo-title">${escapeHtml(title)}</span>
                    </div>
                </div>`;
}

function createNewYearSection(html, p, lang) {
  const itemBlock = renderPhotoGridItem(p, lang);
  const newSection = `            <div class="year-section">
                <div class="year-badge year-badge-clickable" onclick="toggleYearPhotos(this)"><span>${p.year}</span><svg class="year-chevron" width="20" height="20" viewBox="0 0 20 20" fill="none"><polyline points="4,7 10,13 16,7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                <div class="year-photos">
                    <div class="photo-grid">
                ${itemBlock}
                    </div>
                </div>
            </div>
`;
  const newYearInt = parseInt(p.year, 10);
  const yearMatches = [...html.matchAll(/<div class="year-section">[\s\S]*?<span>(\d{4})<\/span>/g)];
  const beforeMatch = yearMatches.find(ms => parseInt(ms[1], 10) < newYearInt);

  if (beforeMatch) {
    // Find the start of `<div class="year-section">` for this match
    const sectionStart = html.lastIndexOf('<div class="year-section">', beforeMatch.index + 1);
    // The actual section opens with 12-space indent before `<div class="year-section">`
    const lineStart = html.lastIndexOf('\n', sectionStart) + 1;
    return html.slice(0, lineStart) + newSection + html.slice(lineStart);
  }

  // No smaller year — append after the last year-section (oldest)
  if (yearMatches.length > 0) {
    const lastMatch = yearMatches[yearMatches.length - 1];
    // Find the closing of that year-section
    const sectionStart = html.lastIndexOf('<div class="year-section">', lastMatch.index + 1);
    // Closing of a year-section: `\n            </div>\n` at depth 12
    const closeRe = /\n            <\/div>\n/g;
    closeRe.lastIndex = sectionStart;
    const closeMatch = closeRe.exec(html);
    if (closeMatch) {
      const insertAt = closeMatch.index + closeMatch[0].length;
      return html.slice(0, insertAt) + newSection + html.slice(insertAt);
    }
  }

  // No year-sections at all — insert before the closing </div> of #activite
  const activiteIdx = html.indexOf('<div id="activite">');
  if (activiteIdx === -1) return html;
  const closing = html.indexOf('\n        </div>', activiteIdx);
  if (closing === -1) return html;
  return html.slice(0, closing + 1) + newSection + html.slice(closing + 1);
}

function altText(slug) {
  return slug.replace(/_/g, ' ').replace(/[^\w\s]/g, '').trim();
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

main().catch(e => { console.error('\n✗ Error:', e.message); process.exit(1); });
