# louisportal.com

Personal site for Louis Portal, Conseiller des Français de l'Étranger (Swiss-German Switzerland + Liechtenstein). Static HTML, 3 languages (`fr/`, `en/`, `de/`; Italian was removed in Oct 2026), deployed via GitHub Pages.

## Photo automation pipeline

`scripts/add-photos.mjs` compresses photos, generates WebP variants, and inserts photo blocks into the "Activité" sections. It processes **two inboxes** in one run:

| Target | Inbox | Pages updated | Title languages |
|---|---|---|---|
| Politique | `assets/Activité/_inbox/` | `fr/`, `en/`, `de/` `elu_2021.html` | FR / EN / DE |
| Inovexus | `assets/Inovexus photos/_inbox/` | `en/startup.html` only (FR/DE startup pages are "under construction" stubs) | EN |

### Workflow when Louis says "process photos" / "process the inbox" (or similar)

1. **List both inboxes** (filenames look like `YYMM_Description_With_Underscores.jpg`).
2. **Propose titles** in a markdown table per target: FR / EN / DE for Politique, EN for Inovexus. Restore French accents and apostrophes. Keep proper nouns (ASFE, UFEZ, LFZ, AFE, Inovexus…) unchanged. Use curly apostrophes `'`. For "apéro", English is "apéritif" (Louis prefers chic over plain).
3. **Pause and wait for Louis's OK or edits.** Do not proceed without confirmation.
4. **Write** the approved titles to `.titles.json` (gitignored, never commit it) keyed by full filename (both targets in the same file), then run:
   ```bash
   node scripts/add-photos.mjs --titles=.titles.json
   ```
   (`--target=politique` or `--target=inovexus` limits to one inbox; `--dry-run` previews.)
5. **Show the resulting `git diff`** on `fr/elu_2021.html` and/or `en/startup.html`.
6. **Wait for Louis to say "commit & push"** before running any git command. He usually does the commit himself.

### Hard constraints

- **No Anthropic API key on this machine.** Never run the script without `--titles=`, the API path will throw. Always pre-supply titles via `.titles.json`.
- **Filename convention is `YYMM_` (4-digit prefix).** A `YYMMDD_` inbox file is accepted and truncated to `YYMM_` on output. Never write YYMMDD names to `assets/`.
- **Supported input formats:** `.jpg`, `.jpeg`, `.png`. HEIC will error, ask Louis to export as JPEG first.
- Originals are backed up to `~/Pictures/Louisportal_originals/` (Inovexus ones in its `Inovexus/` subfolder). Compressed JPEGs go to the target's asset folder, WebPs to `webp/{full,thumb}/` inside it.

### Insertion rules (already implemented in the script, don't reimplement)

- New year (e.g. first 2027 photo) → new `<div class="year-section">` block in the right chronological position.
- Within a year, sorted newest-first by YYMM. Same-month additions append to the bottom of their month group (no day info to do better).
- Date label in `<span class="photo-date">` is the French month abbreviation in all languages (`Avr.`, `Mai`, `Juin`…). The site standardized on French date labels.

## Style and tone

- Louis prefers **terse responses**. No trailing summaries unless something non-obvious happened.
- For exploratory questions, give a recommendation + the main tradeoff in 2-3 sentences. Don't implement until he agrees.
- For UI changes, verify in browser before claiming done.

## Other context

- The homepage (`index.html`) has two cards only: Consulaire (→ `{lang}/elu.html`) and Startup/invest (→ `{lang}/startup.html`).
- The campaign site for the 2026 election is a separate repo at `../consulaires2026/` (also part of `Websites/`). It links here via `Mandat en cours`.
- The Activité section uses `toggleYearPhotos` (in `script.js`) to expand/collapse year blocks. Don't touch the badge SVG markup when generating new year-sections, the script reproduces it exactly.
