# Credits and licences

East Asian Languages Studio software (engine, studio, server, installer, build tools, infographic) © 2026 Larry Dalton.

It includes third-party material, each under its own licence. Licence texts and change notes are in `src/app/licenses/`.

| Component | Where | Licence |
|---|---|---|
| **CC-CEDICT** (MDBG) Chinese-English dictionary | `src/app/data/zh/dict1.json`, `dict2.json`, `zh/en.json` | CC BY-SA 4.0 |
| **JMdict** (Electronic Dictionary Research and Development Group, edrdg.org) | `src/app/data/ja/dict1.json` to `dict3.json`, `ja/en.json` | CC BY-SA 4.0 |
| **English Wiktionary** Korean entries, via Wiktextract / kaikki.org | `src/app/data/ko/dict.json` (rows marked `w`), `ko/en.json` | CC BY-SA 4.0 |
| **kengdic** Korean-English dictionary (Joe Speigle and contributors) | `src/app/data/ko/dict.json` (rows marked `k`) | MPL 2.0 (or LGPL 2.0+) |
| **Tatoeba** example sentences | `src/app/data/ex/*.json` | CC BY 2.0 FR |
| **OpenCC** conversion tables | `src/app/data/zh/st.json`, `ts.json` | Apache 2.0 |
| **Unihan** database (Unicode, Inc.) | `src/app/data/zh/chars.json`, `ja/chars.json`, `ko/hanja.json` | Unicode License v3 |
| **Make Me a Hanzi** stroke data (from Arphic fonts) | `src/app/data/strokes/zh_*.json` | Arphic Public License |
| **KanjiVG** (Ulrich Apel) | `src/app/data/strokes/ja_*.json` | CC BY-SA 3.0 |
| **kuromoji.js** with **mecab-ipadic** | `src/app/vendor/kuromoji/` | Apache 2.0; IPADIC licence (see NOTICE.md there) |
| **Noto Sans SC, TC, JP, KR**, © The Noto Project Authors | `src/app/fonts/EA*.ttf`; outlines also used in `data/glyphs.json` and `data/tpl/` | SIL Open Font License 1.1 |
| **HarfBuzz** (harfbuzzjs 0.4.12) | `src/app/vendor/` | MIT (Old MIT for HarfBuzz) |
| **CMU Pronouncing Dictionary** | `src/app/data/cmu.tsv` | BSD (2-clause style) |

Notes

- Files derived from CC BY-SA material (the three dictionaries, their English indexes, and the KanjiVG stroke files under CC BY-SA 3.0) are shared under the same licence. The changes made are listed in each licence file.
- The JMdict files are used in accordance with the licence provisions of the Electronic Dictionaries Research Group (http://www.edrdg.org/).
- Each Tatoeba sentence keeps its number and links back to tatoeba.org.
- The fonts are subset and renamed; they are not modified otherwise.
