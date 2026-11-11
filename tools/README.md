# Build tools

The studio's data files in `src/app/data` are built from the original sources. To rebuild them:

1. Download into `dl/`: `cedict_1_0_ts_utf-8_mdbg.txt.gz` (MDBG), `JMdict_e.gz` (EDRDG), `kengdic.tsv` (github.com/garfieldnate/kengdic), the OpenCC dictionaries `STCharacters`, `STPhrases`, `TSCharacters`, `TSPhrases`, `TWVariants` (saved as `opencc_<name>.txt`), Make Me a Hanzi `graphics.txt` (saved as `mmah_graphics.txt`), and the Noto Sans SC/TC/JP/KR variable fonts from google/fonts.
2. Into `src/`: the unpacked CEDICT text, `Unihan.zip` unpacked into `src/unihan`, the Tatoeba per-language exports (`cmn/jpn/kor/eng_sentences.tsv`, `cmn/jpn/kor-eng_links.tsv`), the Korean Wiktionary entries from kaikki.org reduced to `kaikki-Korean-compact.jsonl` (word, part of speech, forms, glosses), and `cmudict.dict`.
3. KanjiVG SVGs for the kanji you want into `work/kvg/`.

Then:

```
python3 -I parse_jmdict.py dl/JMdict_e.gz work/jmdict.json
python3 -I build_data.py src dl work src/app/data
python3 -I build_fonts.py dl work src/app
python3 -I charfreq.py src dl src/app/data work
node build_templates.js
node gen.js '<stats json>' && node shot.js     # infographic
```
`build_templates.js` needs `harfbuzzjs` (npm). The Japanese word splitter is kuromoji.js 0.1.2 from npm (`build/kuromoji.js` and `dict/`).
