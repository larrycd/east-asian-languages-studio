// node gen.js '<json stats>' -> info.html   (East Asian Languages Studio infographic, by Larry Dalton)
const fs=require('fs'),path=require('path');const ST=JSON.parse(process.argv[2]||'{}');
require('../test/hb.js')({ex:true}).then(EA=>{
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const strip=s=>s.replace(/<metadata>[\s\S]*?<\/metadata>/,'');
const R=(t,o)=>strip(EA.render(t,Object.assign({width:700,size:40},o)));
const fmt=n=>n.toLocaleString('en-AU');
const src='We will go to school tomorrow.';const tz=EA.translate(src,'zh'),tj=EA.translate(src,'ja'),tk=EA.translate(src,'ko');
const nz=EA.bySound('Larry Dalton','zh').text,nj=EA.bySound('Larry Dalton','ja').text,nk=EA.bySound('Larry Dalton','ko').text;
const html=`<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:EASC;src:url(../src/app/fonts/EASC.ttf)}@font-face{font-family:EATC;src:url(../src/app/fonts/EATC.ttf)}@font-face{font-family:EAJP;src:url(../src/app/fonts/EAJP.ttf)}@font-face{font-family:EAKR;src:url(../src/app/fonts/EAKR.ttf)}
body{margin:0;overflow:hidden;background:#0f1114;color:#eef0f3;font:20px/1.45 "Segoe UI","DejaVu Sans",sans-serif;width:1600px}.w{padding:52px 60px}
h1{font:700 64px Georgia,"DejaVu Serif",serif;margin:0}.sub{color:#9aa3b0;font-size:24px;margin-top:6px}.by{color:#f08a6c;font-weight:700}
h2{color:#f08a6c;text-transform:uppercase;letter-spacing:3px;font-size:22px;margin:38px 0 16px;border-bottom:2px solid #2f3540;padding-bottom:8px}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px}.g2{display:grid;grid-template-columns:1fr 1fr;gap:18px}.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.card{background:#171a1f;border:1px solid #2f3540;border-radius:14px;padding:18px}.card h3{margin:0 0 6px;font-size:23px}.k{color:#f08a6c;font-size:15px;text-transform:uppercase;letter-spacing:2px}
.card svg{max-width:100%;height:auto;display:block;border-radius:8px;margin-top:8px}.note{color:#9aa3b0;font-size:17px;margin-top:10px}
.mono{font:19px Consolas,"DejaVu Sans Mono",monospace;color:#e8d8bd}.zh{font-family:EASC}.zht{font-family:EATC}.ja{font-family:EAJP}.ko{font-family:EAKR}
.num{font:700 40px Georgia,serif;color:#f08a6c}.stat{text-align:center}.stat div{color:#9aa3b0;font-size:16px}
table{border-collapse:collapse;width:100%;font-size:19px}td{padding:9px 12px;border-bottom:1px solid #2f3540;vertical-align:top}td.n{font-weight:700;color:#fff;white-space:nowrap}
.foot{color:#7d8592;font-size:15px;margin-top:34px;border-top:1px solid #2f3540;padding-top:14px}
.vrow{display:flex;gap:14px;align-items:flex-start}
</style></head><body><div class="w">
<div style="display:flex;justify-content:space-between;align-items:flex-end"><div><h1>East Asian Languages Studio</h1><div class="sub">Mandarin &middot; Japanese &middot; Korean &mdash; write, read and study &middot; <span class="by">by Larry Dalton</span></div></div>
<div style="font-size:46px;color:#f08a6c"><span class="zh">中文</span> <span class="ja">日本語</span> <span class="ko">한국어</span></div></div>
<h2>Write, with reading aids</h2>
<div class="g4">
<div class="card"><div class="k">Mandarin &middot; Simplified + pinyin</div>${R('我们一起去学校吧。',{lang:'zh-Hans',ruby:'pinyin',theme:'paper',size:30,width:420})}</div>
<div class="card"><div class="k">Mandarin &middot; Traditional + zhuyin</div>${R('我們一起去學校吧。',{lang:'zh-Hant',ruby:'zhuyin',theme:'ink',size:30,width:420})}</div>
<div class="card"><div class="k">Japanese + furigana</div>${R('日本語を勉強しています。',{lang:'ja',ruby:'furigana',theme:'paper',size:30,width:420})}</div>
<div class="card"><div class="k">Korean + romanization</div>${R('한국어를 공부해요.',{lang:'ko',ruby:'romaja',theme:'slate',size:30,width:420})}</div>
</div>
<div class="g2" style="margin-top:18px">
<div class="card"><div class="k">Vertical, right to left</div><div class="vrow">${R('春眠不觉晓，处处闻啼鸟。',{lang:'zh-Hans',vertical:true,ruby:'pinyin',theme:'paper',size:28,height:420})}${R('東京へ行きました。',{lang:'ja',vertical:true,ruby:'furigana',theme:'ink',size:30,height:420})}${R('大韓民國 만세',{lang:'ko',vertical:true,ruby:'hangul',theme:'slate',size:30,height:420})}</div>
<div class="note">Simplified &harr; Traditional, hiragana &harr; katakana, Hangul &harr; Hanja. Export SVG, PNG or JPEG.</div></div>
<div class="card"><div class="k">Texts and dictionaries</div>
<div class="g3" style="margin-top:8px"><div class="stat"><span class="num">${fmt(EA.data.zh.length)}</span><div>Mandarin entries (CC-CEDICT)</div></div><div class="stat"><span class="num">${fmt(EA.data.ja.length)}</span><div>Japanese entries (JMdict)</div></div><div class="stat"><span class="num">${fmt(EA.data.ko.length)}</span><div>Korean entries (Wiktionary + kengdic)</div></div></div>
<div class="g3" style="margin-top:14px"><div class="stat"><span class="num">${fmt(EA.data.ex.zh.length+EA.data.ex.ja.length+EA.data.ex.ko.length)}</span><div>example sentences with English (Tatoeba)</div></div><div class="stat"><span class="num">${ST.strokes||'14,256'}</span><div>characters with animated stroke order</div></div><div class="stat"><span class="num">${ST.tpl||'52,559'}</span><div>character shapes the image reader knows</div></div></div>
<div class="note">Click any word for its readings, meanings, measure word or polite verb forms, each character's readings in all three languages, and example sentences.</div></div>
</div>
<h2>Translate and spell names</h2>
<div class="g2">
<div class="card"><div class="k">English &rarr; three drafts</div><h3>"${esc(src)}"</h3>
<table><tr><td class="n">Mandarin</td><td class="zh" style="font-size:28px">${esc(tz.text)}</td><td class="mono">${esc(EA.pinyin(tz.text))}</td></tr>
<tr><td class="n">Japanese</td><td class="ja" style="font-size:28px">${esc(tj.text)}</td><td class="mono">${esc(EA.romajiText(tj.text))}</td></tr>
<tr><td class="n">Korean</td><td class="ko" style="font-size:28px">${esc(tk.text)}</td><td class="mono">${esc(EA.romanizeKo(tk.text))}</td></tr></table>
<div class="note">Word order, particles, measure words and polite verb endings; every word shown with how it was chosen.</div></div>
<div class="card"><div class="k">English names by sound</div><h3>Larry Dalton</h3>
<table><tr><td class="n">Mandarin</td><td class="zh" style="font-size:30px">${esc(nz)}</td><td class="mono">${esc(EA.pinyin(nz))}</td></tr>
<tr><td class="n">Japanese</td><td class="ja" style="font-size:30px">${esc(nj)}</td><td class="mono">${esc(EA.romaji(nj).replace('・',' '))}</td></tr>
<tr><td class="n">Korean</td><td class="ko" style="font-size:30px">${esc(nk)}</td><td class="mono">${esc(EA.romanizeKo(nk))}</td></tr></table>
<div class="note">Places keep their usual names: Australia &rarr; <span class="zh">澳大利亚</span> &middot; <span class="ja">オーストラリア</span> &middot; <span class="ko">호주</span>.</div></div>
</div>
<h2>Reading it back (measured)</h2>
<table>
<tr><td class="n">SVG, exact</td><td>${ST.svg||'?'}</td></tr>
<tr><td class="n">PNG and JPEG</td><td>${ST.img||'?'}</td></tr>
<tr><td class="n">Not Chinese, Japanese or Korean</td><td>${ST.neg||'?'}</td></tr>
</table>
<div class="foot">CC-CEDICT (MDBG), JMdict (EDRDG), Korean Wiktionary via kaikki.org: CC BY-SA 4.0. kengdic: MPL 2.0. Tatoeba: CC BY 2.0 FR. OpenCC: Apache 2.0. Unihan: Unicode License. Make Me a Hanzi: Arphic Public License / LGPL. KanjiVG: CC BY-SA 3.0. kuromoji.js + IPADIC: Apache 2.0. Fonts: Noto Sans SC, TC, JP, KR (OFL). Shaping: HarfBuzz (MIT). Translations are rule-based drafts.</div>
</div></body></html>`;
fs.writeFileSync(process.argv[3]||path.join(__dirname,'info.html'),html);});
