# How it works

East Asian Languages Studio is a single web page (`src/app/index.html` + `engine.js`) served on your own computer by a small PowerShell server on port 8770. Nothing is sent over the internet.

## Writing

Text is shaped with HarfBuzz (WebAssembly) using Noto Sans SC, TC, JP or KR, so each language gets its own character forms (the same character can look different in Chinese, Japanese and Korean). Vertical text uses the fonts' vertical forms for punctuation; full-width marks and corner quotes (「」) are used in vertical text.

Reading aids are drawn above each character (or to its right in vertical text):

- **Pinyin** comes from CC-CEDICT: the sentence is split into dictionary words (longest match, with a check that prefers more common splits), and each word's most common reading is used. The tone changes of 一 and 不 are shown, as in learners' materials. **Zhuyin** is converted from pinyin.
- **Furigana** and **romaji** come from kuromoji (a Japanese word splitter with the IPADIC dictionary). Readings are lined up with the kanji in each word (食べ物 → 食[た]べ物[もの]). Romaji is Hepburn with ō and ū, and は/へ/を as particles are written wa/e/o.
- **Korean romanization** follows the Revised Romanization with the main sound changes: linking (한국어 → hangugeo), nasalisation (국물 → gungmul), ㄹ changes (신라 → silla), aspiration and palatalisation (같이 → gachi).

Simplified → Traditional uses the OpenCC tables (phrases first, then characters) and Taiwan forms (為, 裡). Hangul → Hanja uses the Hanja that the dictionaries give for Sino-Korean words.

## Dictionaries and examples

CC-CEDICT, JMdict and Korean Wiktionary (with kengdic for extra words) are converted to compact JSON. A frequency estimate for each word comes from the Tatoeba sentences and, for Japanese, JMdict's priority marks. English indexes are built from the meanings, for searching and for the drafts.

## Translation drafts

The drafts are rule-based. A small parser finds the subject, verb, object, time words and prepositional phrases of the English sentence. Each word is looked up (the most common entry whose meaning matches, with a short list of everyday choices for very common words), then put into each language's grammar: Chinese word order with 在, 了, 会, 不/没, 很 + adjective and measure words; Japanese SOV order with は, を, に/で/へ and polite ます/です forms conjugated from JMdict's verb classes; Korean SOV order with 은/는, 을/를 (chosen by the final consonant), 에/에서 and polite 해요 forms built from Wiktionary's infinitive forms.

They are a starting point, not a fluent translation: idioms, most subordinate clauses and many particle choices are not handled.

The studio does not show a percentage, because it cannot measure whether a draft reads naturally. Each draft is labelled instead: **set phrase** (an everyday expression stored whole), **rough draft** (every English word placed in a sentence pattern the studio knows), **poor** (some English words could not be translated) or **not usable** (a question form or structure the studio does not handle). It also lists the sentence pattern, the English words it could not use, and a human translation from Tatoeba when there is one for the same English.

Measured with `test/drafteval.js` on 600 short Tatoeba sentences per language (compared with all of their human translations):

| | Exact match | Characters shared with the closest human translation (rough drafts) |
|---|---|---|
| Mandarin | 9 of 394 rough drafts (2%) | 55% |
| Japanese | 1 of 264 (under 1%) | 44% |
| Korean | 0 of 230 | 41% |

## Names by sound

English pronunciations (CMU dictionary, or spelling rules for unknown words) are split into syllables and written with each language's usual rules for foreign names: katakana with long marks, Hangul with final consonants, and the Chinese characters used for foreign names. Unstressed vowels follow the spelling (Jennifer → ジェニファー). Places and other well-known names use the dictionary form.
