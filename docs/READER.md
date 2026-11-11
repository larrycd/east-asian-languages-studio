# Reader and test results

## SVG

The studio's SVGs are read exactly from the character outlines and their positions (never from embedded metadata). The reader finds which font drew the text (and so which language), groups characters into lines or vertical columns, and separates the small reading-aid characters from the text.

In a run of 2,000 random Tatoeba sentences (500 each in Simplified Chinese, Traditional Chinese, Japanese and Korean; horizontal and vertical; with and without reading aids), all 2,000 came back exactly (27,322 characters).

Two things an SVG cannot tell: whether text was Simplified or Traditional when every character is the same in both, and which of two marks was meant when the font draws them identically (Korean `.` and `．`); the reader then chooses by language.

## PNG and JPEG

1. The image is turned into an ink map (keeping how much ink each pixel has, for anti-aliased edges). Lines or vertical columns are found; thin bands right next to a line are reading aids and are skipped.
2. Each line is split into characters: ink runs are joined into characters of about one em, choosing the joins whose matches score best, and runs of touching characters are cut at their faintest point.
3. Each character is compared with the font's characters: a quick 8×8 and 16×16 search with the character's size and position, then a closer comparison of the best 14 at 32×32 (48×48 for Hangul). Near ties are settled by how common a character is and, in Chinese and Japanese, by whether it makes a dictionary word with its neighbours.
4. Script rules: katakana look-alikes of kanji (ー/一, ロ/口, カ/力) and へ/ヘ by their neighbours; full-width marks in Chinese and Japanese, ASCII marks in Korean.
5. Images whose shapes do not match well enough, that are mostly ink, or that contain no Chinese, Japanese or Korean characters are refused.

### Unseen test (120 random sentences, seed 20261111, made after the reader was finished)

PNG and JPEG, 0.6× to 2× (24 to 80 pixels per character), four colour styles, about a quarter vertical and a quarter with reading aids. Full output: [`test/results-unseen.txt`](../test/results-unseen.txt).

| Script | Exact lines | Characters right | Misses flagged as uncertain |
|---|---|---|---|
| Mandarin (Simplified) | 29 / 30 | 371 / 372 | 1 / 1 |
| Mandarin (Traditional) | 29 / 30 | 293 / 294 | 1 / 1 |
| Japanese | 27 / 30 | 499 / 502 | 3 / 3 |
| Korean | 21 / 30 | 324 / 333 | 6 / 9 |

Most misses are one character: a Hangul syllable with a similar vowel (를/룰, 뭐/뮈), a rare character with almost the same shape (太/大, 糊/餬) at small sizes, or a missing dakuten (だ/た). Korean is the weakest because many syllables differ by one short stroke.

### Refusal

All 11 images in `test/neg/` were refused. They were also used to set the refusal rule, so this is not an independent test.
