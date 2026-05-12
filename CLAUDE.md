# louisportal.com

Personal site for Louis Portal, Conseiller des Français de l'Étranger (Swiss-German Switzerland + Liechtenstein). Static HTML, 4 languages (`fr/`, `en/`, `de/`, `it/`), deployed via GitHub Pages.

## Photo automation pipeline

The "Activité" section on `*/elu_2021.html` is fed by a Node script that compresses photos, generates WebP variants, and inserts photo blocks into all 4 language files.

### Workflow when Louis says "process the inbox" (or "process inbox")

1. **List** `assets/Activité/_inbox/` (filenames look like `YYMM_Description_With_Underscores.jpg`).
2. **Propose titles in 4 languages** for each photo in a markdown table (FR / EN / DE / IT). Restore French accents and apostrophes. Keep proper nouns (ASFE, UFEZ, LFZ, AFE…) unchanged. Use curly apostrophes `'`. For "apéro", English is "apéritif" (Louis prefers chic over plain).
3. **Pause and wait for Louis's OK or edits.** Do not proceed without confirmation.
4. **Write** the approved titles to `.titles.json` (gitignored — never commit it) keyed by full filename, then run:
   ```bash
   node scripts/add-photos.mjs --titles=.titles.json
   ```
5. **Show the resulting `git diff`** on `fr/elu_2021.html` (one language is enough to verify position).
6. **Wait for Louis to say "commit & push"** before running any git command. He usually does the commit himself.

### Hard constraints

- **No Anthropic API key on this machine.** Never run the script without `--titles=` — the API path will throw. Always pre-supply titles via `.titles.json`.
- **Filename convention is `YYMM_` (4-digit prefix).** Never `YYMMDD`. The existing YYMMDD entries were cleaned up; do not reintroduce.
- **Supported input formats:** `.jpg`, `.jpeg`, `.png`. HEIC will error — ask Louis to export as JPEG first.
- Originals get backed up to `~/Pictures/Louisportal_originals/` automatically. Compressed JPEGs go to `assets/Activité/`, WebPs to `assets/Activité/webp/{full,thumb}/`.

### Insertion rules (already implemented in the script — don't reimplement)

- New year (e.g. first 2027 photo) → new `<div class="year-section">` block prepended to the timeline.
- Within a year, sorted newest-first by YYMM. Same-month additions append to the bottom of their month group (no day info to do better).
- Date label in `<span class="photo-date">` is the French month abbreviation in all 4 languages (`Avr.`, `Mai`, `Juin`…). The site standardized on French date labels.

## Style and tone

- Louis prefers **terse responses**. No trailing summaries unless something non-obvious happened.
- For exploratory questions, give a recommendation + the main tradeoff in 2-3 sentences. Don't implement until he agrees.
- For UI changes, verify in browser before claiming done.

## Other context

- The campaign site for the 2026 election is a separate repo at `../consulaires2026/` (also part of `Websites/`). It links here via `Mandat en cours`.
- The Activité section uses `toggleYearPhotos` (in `script.js`) to expand/collapse year blocks. Don't touch the badge SVG markup when generating new year-sections — the script reproduces it exactly.
