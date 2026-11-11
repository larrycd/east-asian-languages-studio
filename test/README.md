# Tests

Install the test tools once: `npm install harfbuzzjs@0.4.12 kuromoji@0.1.2 playwright` (and `npx playwright install chromium`).

- `node rt.js`: SVG read-back of sample texts (every language, horizontal and vertical, with reading aids).
- `node corpusrt.js 2000 2027`: SVG read-back of random Tatoeba sentences in every language, layout and reading aid. The README figure (2,000 / 2,000) is this run.
- `node imgtest.js unseen.json`: render sentences in Chromium, export PNG/JPEG at 0.6x to 2x in four styles, and read them back. `unseen.json` (seed 20261111) is the 120-case set reported in the README; it was made after the reader was finished and was not used for tuning. `results-unseen.txt` is its output. `dev.json`, `dev2.json` and `fresh.json` were used while tuning. Make new cases with `node gencases.js 80 1234 > new.json`.
- `node neg.js`: check that the images in `neg/` (Latin text, noise, an icon, hieroglyphs, cuneiform, Hebrew/Greek, pIqaD, Heptapod) are refused.
- The studio's own **Self-test** tab runs the built-in checks in the browser.
- `node drafteval.js`: compares the English → Mandarin/Japanese/Korean drafts with Tatoeba's human translations (600 short sentences per language) and reports exact matches and shared characters.
