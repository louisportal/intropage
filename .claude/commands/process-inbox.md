---
description: Compress, title and insert new photos from both inboxes (Politique + Inovexus)
---

Run the photo-processing workflow described in `CLAUDE.md` under "Workflow when Louis says 'process photos'":

1. List files in `assets/Activité/_inbox/` (Politique) and `assets/Inovexus photos/_inbox/` (Inovexus).
2. Propose titles in a markdown table: FR / EN / DE for Politique, EN only for Inovexus. Restore French accents/apostrophes, keep proper nouns, use "apéritif" for "apéro" in EN.
3. Wait for Louis's OK or edits.
4. Write titles to `.titles.json` (both targets, keyed by filename), then run `node scripts/add-photos.mjs --titles=.titles.json`.
5. Show the `git diff` for `fr/elu_2021.html` and/or `en/startup.html`.
6. Wait for "commit & push" before any git action.

Do NOT call the Anthropic API path, always supply titles via `--titles=.titles.json`.
