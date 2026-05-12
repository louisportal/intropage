---
description: Compress, translate and insert new Activité photos into all 4 language pages
---

Run the photo-processing workflow described in `CLAUDE.md` under "Workflow when Louis says 'process the inbox'":

1. List files in `assets/Activité/_inbox/`.
2. Propose 4-language titles in a markdown table. Restore French accents/apostrophes, keep proper nouns, use "apéritif" for "apéro" in EN.
3. Wait for Louis's OK or edits.
4. Write titles to `.titles.json`, then run `node scripts/add-photos.mjs --titles=.titles.json`.
5. Show the `git diff` for `fr/elu_2021.html`.
6. Wait for "commit & push" before any git action.

Do NOT call the Anthropic API path — always supply titles via `--titles=.titles.json`.
