/* East Asian Languages Studio engine - Mandarin, Japanese and Korean (by Larry Dalton)
   Works in the browser (global EA) and in Node (module.exports). */
(function (root) {
'use strict';
var EA = { version: '1.0.3' };
var D = { zh: null, zhIdx: null, zhChars: null, st: null, ts: null, ja: null, jaIdx: null, jaChars: null, ko: null, koIdx: null, hanja: null, en: {}, cmu: null, ex: {} };
EA.data = D;

/* ================================================================ data */
EA.load = function (name, obj) {
  if (name === 'zh') { var base = D.zh ? D.zh.length : 0; D.zh = (D.zh || []).concat(obj); D.zhIdx = D.zhIdx || {}; obj.forEach(function (e, j) { var i = base + j; (D.zhIdx[e[0]] = D.zhIdx[e[0]] || []).push(i); if (e[1] !== e[0]) (D.zhIdx[e[1]] = D.zhIdx[e[1]] || []).push(i); }); }
  else if (name === 'ja') {
    D.ja = (D.ja || []).concat(obj); D.jaIdx = {};
    D.ja.forEach(function (e, i) { e[0].concat(e[1]).forEach(function (f) { (D.jaIdx[f] = D.jaIdx[f] || []).push(i); }); });
  }
  else if (name === 'ko') { D.ko = obj; D.koIdx = {}; D.koInf = {}; obj.forEach(function (e, i) { (D.koIdx[e[0]] = D.koIdx[e[0]] || []).push(i); if (e[2]) (D.koIdx[e[2]] = D.koIdx[e[2]] || []).push(i); if (e[4] && (e[1] === 'v' || e[1] === 'a') && (!D.koInf[e[4]] || D.ko[D.koInf[e[4]]][5] < e[5])) D.koInf[e[4]] = i; }); }
  else if (name === 'cmu') { D.cmu = {}; obj.split('\n').forEach(function (l) { var p = l.split('\t'); if (p.length === 2) D.cmu[p[0]] = p[1]; }); }
  else if (/^en_/.test(name)) D.en[name.slice(3)] = obj;
  else if (/^ex_/.test(name)) D.ex[name.slice(3)] = obj;
  else D[name] = obj;
  return true;
};
function isHan(ch) { var o = ch.codePointAt(0); return (o >= 0x4E00 && o <= 0x9FFF) || (o >= 0x3400 && o <= 0x4DBF) || (o >= 0xF900 && o <= 0xFAFF) || (o >= 0x20000 && o <= 0x2FFFF) || o === 0x3005; }
function isKana(ch) { var o = ch.charCodeAt(0); return (o >= 0x3040 && o <= 0x30FF) || (o >= 0x31F0 && o <= 0x31FF); }
function isHangul(ch) { var o = ch.charCodeAt(0); return (o >= 0xAC00 && o <= 0xD7A3) || (o >= 0x1100 && o <= 0x11FF) || (o >= 0x3130 && o <= 0x318F); }
EA.isHan = isHan; EA.isKana = isKana; EA.isHangul = isHangul;
/* which language a text is written in: 'ja' (kana), 'ko' (Hangul), 'zh' (Han only) */
EA.detect = function (s) {
  var k = 0, h = 0, c = 0;
  Array.from(s).forEach(function (ch) { if (isKana(ch)) k++; else if (isHangul(ch)) h++; else if (isHan(ch)) c++; });
  return h > k && h >= c * 0.2 ? 'ko' : k ? 'ja' : c ? 'zh' : (h ? 'ko' : 'en');
};

/* ================================================================ Mandarin */
var TONEV = { a: 'āáǎàa', e: 'ēéěèe', i: 'īíǐìi', o: 'ōóǒòo', u: 'ūúǔùu', 'ü': 'ǖǘǚǜü' };
function markSyl(syl) {
  var m = /^([a-zA-Zü:]+?)([1-5])$/.exec(syl); if (!m) return syl.replace(/u:/g, 'ü').replace(/v/g, 'ü');
  var s = m[1].replace(/u:/g, 'ü').replace(/v/g, 'ü'), t = +m[2], low = s.toLowerCase(), i;
  if (low.indexOf('a') >= 0) i = low.indexOf('a'); else if (low.indexOf('e') >= 0) i = low.indexOf('e'); else if (low.indexOf('ou') >= 0) i = low.indexOf('o');
  else { i = -1; for (var j = 0; j < low.length; j++) if ('aeiouü'.indexOf(low[j]) >= 0) i = j; if (i < 0) return s; }
  var c = s[i], r = TONEV[c.toLowerCase()][t - 1]; if (c !== c.toLowerCase()) r = r.toUpperCase();
  return s.slice(0, i) + r + s.slice(i + 1);
}
EA.markPinyin = function (numbered) { return numbered.split(/\s+/).map(markSyl).join(' '); };
EA.markSyllable = markSyl;
var ZY_I = { b: 'ㄅ', p: 'ㄆ', m: 'ㄇ', f: 'ㄈ', d: 'ㄉ', t: 'ㄊ', n: 'ㄋ', l: 'ㄌ', g: 'ㄍ', k: 'ㄎ', h: 'ㄏ', j: 'ㄐ', q: 'ㄑ', x: 'ㄒ', zh: 'ㄓ', ch: 'ㄔ', sh: 'ㄕ', r: 'ㄖ', z: 'ㄗ', c: 'ㄘ', s: 'ㄙ' };
var ZY_F = { a: 'ㄚ', o: 'ㄛ', e: 'ㄜ', 'ê': 'ㄝ', ai: 'ㄞ', ei: 'ㄟ', ao: 'ㄠ', ou: 'ㄡ', an: 'ㄢ', en: 'ㄣ', ang: 'ㄤ', eng: 'ㄥ', ong: 'ㄨㄥ', er: 'ㄦ', i: 'ㄧ', ia: 'ㄧㄚ', ie: 'ㄧㄝ', iao: 'ㄧㄠ', iu: 'ㄧㄡ', ian: 'ㄧㄢ', in: 'ㄧㄣ', iang: 'ㄧㄤ', ing: 'ㄧㄥ', iong: 'ㄩㄥ', u: 'ㄨ', ua: 'ㄨㄚ', uo: 'ㄨㄛ', uai: 'ㄨㄞ', ui: 'ㄨㄟ', uan: 'ㄨㄢ', un: 'ㄨㄣ', uang: 'ㄨㄤ', ueng: 'ㄨㄥ', 'ü': 'ㄩ', 'üe': 'ㄩㄝ', 'üan': 'ㄩㄢ', 'ün': 'ㄩㄣ', ue: 'ㄩㄝ', io: 'ㄧㄛ' };
var ZY_T = ['', 'ˊ', 'ˇ', 'ˋ', '˙'];
function zhuyinSyl(syl) {
  var m = /^([a-zü:]+?)([1-5])?$/i.exec(syl.replace(/u:/g, 'ü').replace(/v/g, 'ü')); if (!m) return syl;
  var s = m[1].toLowerCase(), t = +(m[2] || 5), ini = '', fin = s;
  var r = /^(zh|ch|sh|[bpmfdtnlgkhjqxrzcs])/.exec(s); if (r) { ini = r[1]; fin = s.slice(ini.length); }
  if (/^[jqx]/.test(ini) && /^u/.test(fin)) fin = 'ü' + fin.slice(1);
  if (!ini) { if (/^yu/.test(fin)) fin = 'ü' + fin.slice(2); else if (/^yi/.test(fin)) fin = 'i' + fin.slice(2); else if (/^y/.test(fin)) fin = 'i' + fin.slice(1); else if (/^wu/.test(fin)) fin = 'u' + fin.slice(2); else if (/^w/.test(fin)) fin = 'u' + fin.slice(1); }
  if (fin === 'i' && /^(zh|ch|sh|r|z|c|s)$/.test(ini)) fin = '';
  if (fin === 'ue' && !ini) fin = 'üe';
  var out = (ZY_I[ini] || '') + (fin ? ZY_F[fin] || fin : '');
  return t === 5 ? '˙' + out : out + (ZY_T[t - 1] || '');
}
EA.zhuyin = function (numbered) { return numbered.split(/\s+/).map(zhuyinSyl).join(' '); };
/* Simplified <-> Traditional (OpenCC tables: phrases first, then characters) */
function convert(s, tab) {
  if (!tab) return s; var out = '', i = 0, chars = Array.from(s);
  while (i < chars.length) {
    var done = false;
    for (var L = Math.min(8, chars.length - i); L >= 2; L--) { var w = chars.slice(i, i + L).join(''); if (tab.p[w]) { out += tab.p[w]; i += L; done = true; break; } }
    if (!done) { out += tab.c[chars[i]] || chars[i]; i++; }
  }
  return out;
}
EA.toTraditional = function (s) {
  var t = convert(s, D.st);
  // the Taiwan-style font has 為 and 偽, not 爲 and 僞: use the main form for characters the font lacks
  var tw = D.st && D.st.tw || {};
  t = Array.from(t).map(function (c) { return tw[c] || c; }).join('');
  return t;
};
var GLT = {};
EA.toSimplified = function (s) { return convert(s, D.ts); };
function zhBest(w) { // most likely dictionary entry for a word
  var ids = D.zhIdx && D.zhIdx[w]; if (!ids) return null;
  var best = null; ids.forEach(function (i) { var e = D.zh[i]; if (!best || e[4] > best[4] || (e[4] === best[4] && /^[a-z]/.test(e[2]) && !/^[a-z]/.test(best[2]))) best = e; });
  return best;
}
EA.zhEntry = zhBest;
/* split Chinese text into dictionary words (longest match, then a second pass that prefers more common splits) */
EA.segmentZh = function (s) {
  var chars = Array.from(s), out = [], i = 0;
  while (i < chars.length) {
    var ch = chars[i];
    if (!isHan(ch)) { var j = i; while (j < chars.length && !isHan(chars[j])) j++; out.push({ w: chars.slice(i, j).join(''), han: false }); i = j; continue; }
    var best = 1;
    for (var L = Math.min(8, chars.length - i); L >= 2; L--) { var w = chars.slice(i, i + L).join(''); if (D.zhIdx && D.zhIdx[w]) { best = L; break; } }
    // look ahead: if a shorter first word lets the next word be longer and more common, take it (e.g. 研究生命 -> 研究 生命)
    if (best >= 2 && i + best < chars.length) {
      for (var L2 = best - 1; L2 >= 1; L2--) {
        var a = chars.slice(i, i + L2).join(''), rest = 0;
        for (var M = Math.min(8, chars.length - i - L2); M >= 2; M--) { if (D.zhIdx[chars.slice(i + L2, i + L2 + M).join('')]) { rest = M; break; } }
        var cur = zhBest(chars.slice(i, i + best).join('')), alt = zhBest(a), nxt = rest ? zhBest(chars.slice(i + L2, i + L2 + rest).join('')) : null;
        if (alt && nxt && L2 + rest > best && (alt[4] + nxt[4]) > (cur ? cur[4] : 0) * 3 + 5) { best = L2; break; }
      }
    }
    out.push({ w: chars.slice(i, i + best).join(''), han: true }); i += best;
  }
  return out;
};
/* pinyin for each word: [{w, py (numbered), e (entry)}] */
EA.pinyinWords = function (s) {
  var segs = EA.segmentZh(s);
  segs.forEach(function (sg) {
    if (!sg.han) return;
    var e = zhBest(sg.w);
    if (e) { sg.e = e; sg.py = e[2].toLowerCase().replace(/\s+/g, ' '); }
    else sg.py = Array.from(sg.w).map(function (c) { var x = zhBest(c); return x ? x[2].toLowerCase() : D.zhChars && D.zhChars[c] ? numbered(D.zhChars[c]) : '?'; }).join(' ');
  });
  // tone changes of 一 and 不 that learners' materials show
  segs.forEach(function (sg, k) {
    if (!sg.han) return;
    var syl = sg.py.split(' '), ch = Array.from(sg.w);
    ch.forEach(function (c, j) {
      var next = j + 1 < syl.length ? syl[j + 1] : (segs[k + 1] && segs[k + 1].han && segs[k + 1].py ? segs[k + 1].py.split(' ')[0] : null);
      if (!next) return; var nt = +next.slice(-1);
      if (c === '不' && syl[j] === 'bu4' && nt === 4) syl[j] = 'bu2';
      if (c === '一' && syl[j] === 'yi1' && !/[第十统統唯万萬之]/.test(ch[j - 1] || '') && !(j === ch.length - 1 && ch.length > 1)) syl[j] = nt === 4 || nt === 5 ? 'yi2' : 'yi4';
    });
    sg.py = syl.join(' ');
  });
  return segs;
};
function numbered(marked) { // 'zhōng' -> 'zhong1'
  var t = 5, base = marked.normalize('NFD').replace(/[\u0304\u0301\u030C\u0300]/g, function (m) { t = { '\u0304': 1, '\u0301': 2, '\u030C': 3, '\u0300': 4 }[m]; return ''; }).normalize('NFC');
  return base.replace(/ü/g, 'u:') + t;
}
EA.pinyin = function (s, style) {
  return EA.pinyinWords(s).map(function (sg) { if (!sg.han) return sg.w; return style === 'numbers' ? sg.py.replace(/ /g, '') : style === 'zhuyin' ? EA.zhuyin(sg.py) : EA.markPinyin(sg.py).replace(/ /g, ''); }).join(' ').replace(/\s*，\s*/g, ', ').replace(/\s*。\s*/g, '. ').replace(/\s*！\s*/g, '! ').replace(/\s*？\s*/g, '? ').replace(/\s*、\s*/g, ', ').replace(/\s+([,.!?;:])/g, '$1').trim();
};

/* ================================================================ Japanese */
var TOK = null;
EA.setTokenizer = function (t) { TOK = t; };
function kata2hira(s) { return s.replace(/[\u30A1-\u30F6]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0x60); }); }
function hira2kata(s) { return s.replace(/[\u3041-\u3096]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) + 0x60); }); }
EA.toHiragana = kata2hira; EA.toKatakana = hira2kata;
var ROMA = { 'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o', 'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko', 'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so', 'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to', 'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no', 'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho', 'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo', 'や': 'ya', 'ゆ': 'yu', 'よ': 'yo', 'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro', 'わ': 'wa', 'ゐ': 'i', 'ゑ': 'e', 'を': 'o', 'ん': 'n', 'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go', 'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo', 'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do', 'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo', 'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po', 'ゔ': 'vu', 'ぁ': 'a', 'ぃ': 'i', 'ぅ': 'u', 'ぇ': 'e', 'ぉ': 'o', 'ゎ': 'wa' };
var ROMA2 = { 'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo', 'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho', 'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho', 'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo', 'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo', 'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo', 'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo', 'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo', 'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo', 'ぢゃ': 'ja', 'ぢゅ': 'ju', 'ぢょ': 'jo', 'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo', 'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo', 'しぇ': 'she', 'ちぇ': 'che', 'じぇ': 'je', 'てぃ': 'ti', 'でぃ': 'di', 'とぅ': 'tu', 'どぅ': 'du', 'ふぁ': 'fa', 'ふぃ': 'fi', 'ふぇ': 'fe', 'ふぉ': 'fo', 'うぃ': 'wi', 'うぇ': 'we', 'うぉ': 'wo', 'ゔぁ': 'va', 'ゔぃ': 'vi', 'ゔぇ': 've', 'ゔぉ': 'vo', 'つぁ': 'tsa', 'つぃ': 'tsi', 'つぇ': 'tse', 'つぉ': 'tso', 'いぇ': 'ye', 'くぁ': 'kwa' };
/* kana -> Hepburn romaji (long vowels with macrons) */
EA.romaji = function (kana, particle) {
  var s = kata2hira(kana), out = '', i = 0;
  if (particle && s === 'は') return 'wa'; if (particle && s === 'へ') return 'e'; if (s === 'を') return 'o';
  while (i < s.length) {
    var two = s.substr(i, 2), c = s[i], r;
    if (c === 'っ') { var nx = ROMA2[s.substr(i + 1, 2)] || ROMA[s[i + 1]] || ''; out += nx ? (nx.slice(0, 2) === 'ch' ? 't' : nx[0]) : ''; i++; continue; }
    if (c === 'ー') { var lv = out.slice(-1); out += 'aeiou'.indexOf(lv) >= 0 ? lv : ''; i++; continue; }
    if (ROMA2[two]) { r = ROMA2[two]; i += 2; } else if (ROMA[c]) { r = ROMA[c]; i++; } else { r = c; i++; }
    if (c === 'ん' && /^[aeiouy]/.test(ROMA2[s.substr(i, 2)] || ROMA[s[i]] || '')) r = "n'";
    out += r;
  }
  return out.replace(/ou/g, 'ō').replace(/oo/g, 'ō').replace(/uu/g, 'ū').replace(/^(konnichi|konban)ha$/, '$1wa');
};
/* tokens with readings: [{s: surface, r: reading (hiragana), b: base form, pos, ruby: [[text, ruby|null]...]}] */
EA.tokensJa = function (text) {
  if (!TOK) return Array.from(text).map(function (c) { return { s: c, r: isKana(c) ? kata2hira(c) : '', b: c, pos: '', ruby: [[c, null]] }; });
  return TOK.tokenize(text).map(function (t) {
    var r = t.reading && t.reading !== '*' ? kata2hira(t.reading) : (Array.from(t.surface_form).every(isKana) ? kata2hira(t.surface_form) : '');
    return { s: t.surface_form, r: r, b: t.basic_form && t.basic_form !== '*' ? t.basic_form : t.surface_form, pos: t.pos, pos1: t.pos_detail_1, ctype: t.conjugated_type, cform: t.conjugated_form, ruby: alignRuby(t.surface_form, r) };
  });
};
/* split a word into kanji parts with their readings and kana parts: 食べ物/たべもの -> [食,た][べ][物,もの] */
function alignRuby(surf, read) {
  var ch = Array.from(surf);
  if (!ch.some(isHan) || !read) return [[surf, null]];
  var parts = [], cur = '', curHan = null;
  ch.forEach(function (c) { var h = isHan(c); if (curHan === null || h === curHan) cur += c; else { parts.push([cur, curHan]); cur = c; } curHan = h; });
  parts.push([cur, curHan]);
  var re = '^' + parts.map(function (p) { return p[1] ? '(.+?)' : '(' + kata2hira(p[0]).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')'; }).join('') + '$';
  var m = new RegExp(re).exec(read);
  if (!m) return [[surf, read]];
  return parts.map(function (p, i) { return p[1] ? [p[0], m[i + 1]] : [p[0], null]; });
}
EA.alignRuby = alignRuby;
EA.furigana = function (text) { return EA.tokensJa(text).map(function (t) { return t.ruby.map(function (p) { return p[1] ? p[0] + '[' + p[1] + ']' : p[0]; }).join(''); }).join(''); };
EA.romajiText = function (text) {
  var toks = EA.tokensJa(text), out = [];
  toks.forEach(function (t) {
    if (!t.r) { out.push(t.s); return; }
    var r = EA.romaji(t.r, t.pos === '助詞');
    var attach = (t.pos === '助動詞' && t.s !== 'です' && t.s !== 'だ') || (t.pos === '助詞' && t.pos1 === '接続助詞' && /^(て|で|ば|ちゃ)$/.test(t.s)) || t.pos1 === '接尾' || (t.pos === '動詞' && t.pos1 === '非自立');
    if (attach && out.length) { out[out.length - 1] += r; return; }
    out.push(r);
  });
  return out.join(' ').replace(/\s+([、。！？,.!?])/g, '$1').replace(/。/g, '.').replace(/、/g, ',').replace(/！/g, '!').replace(/？/g, '?').replace(/「|」/g, '"');
};
function jaEntries(w) { var ids = D.jaIdx && D.jaIdx[w]; return ids ? ids.map(function (i) { return D.ja[i]; }).sort(function (a, b) { return (b[4] * 3 + b[7]) - (a[4] * 3 + a[7]); }) : []; }
EA.jaEntries = jaEntries;

/* ================================================================ Korean */
var CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
var JUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
var JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
function decompose(ch) { var o = ch.charCodeAt(0) - 0xAC00; if (o < 0 || o > 11171) return null; return [Math.floor(o / 588), Math.floor((o % 588) / 28), o % 28]; }
function compose(c, v, t) { return String.fromCharCode(0xAC00 + c * 588 + v * 28 + (t || 0)); }
EA.decompose = function (s) { return Array.from(s).map(function (ch) { var d = decompose(ch); return d ? CHO[d[0]] + JUNG[d[1]] + JONG[d[2]] : ch; }).join(''); };
EA.hangulParts = function (ch) { var d = decompose(ch); return d ? [CHO[d[0]], JUNG[d[1]], JONG[d[2]]] : null; };
EA.compose = compose; EA.decomposeSyl = decompose;
var RR_I = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
var RR_V = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
// final consonant as heard: [sound class letter, initial index when it moves to the next syllable]
var FIN = { '': ['', -1], 'ㄱ': ['k', 0], 'ㄲ': ['k', 1], 'ㄳ': ['k', 9], 'ㄴ': ['n', 2], 'ㄵ': ['n', 12], 'ㄶ': ['n', 18], 'ㄷ': ['t', 3], 'ㄹ': ['l', 5], 'ㄺ': ['k', 0], 'ㄻ': ['m', 6], 'ㄼ': ['l', 7], 'ㄽ': ['l', 9], 'ㄾ': ['l', 16], 'ㄿ': ['p', 17], 'ㅀ': ['l', 18], 'ㅁ': ['m', 6], 'ㅂ': ['p', 7], 'ㅄ': ['p', 9], 'ㅅ': ['t', 9], 'ㅆ': ['t', 10], 'ㅇ': ['ng', -1], 'ㅈ': ['t', 12], 'ㅊ': ['t', 14], 'ㅋ': ['k', 15], 'ㅌ': ['t', 16], 'ㅍ': ['p', 17], 'ㅎ': ['t', 18] };
var ASP = { 0: 15, 3: 16, 7: 17, 12: 14 }; // ㄱㄷㅂㅈ + ㅎ -> ㅋㅌㅍㅊ
/* Revised Romanization of Korean, with the usual sound changes (linking, nasalisation, ㄹ changes, aspiration) */
EA.romanizeKo = function (text) {
  return text.split(/(\s+)/).map(function (word) {
    var syl = Array.from(word), d = syl.map(decompose), out = '';
    for (var i = 0; i < syl.length; i++) {
      if (!d[i]) { out += syl[i]; continue; }
      var c = d[i][0], v = d[i][1], t = JONG[d[i][2]], nx = d[i + 1] || null;
      var ini = RR_I[c];
      if (d[i].lnk !== undefined) ini = d[i].lnk;
      out += (i === 0 && c === 5 ? 'r' : ini) + RR_V[v];
      if (!t) continue;
      var f = FIN[t], cls = f[0];
      if (nx) {
        var nc = nx[0];
        if (nc === 11 && nx[1] === 20 && (t === 'ㄷ' || t === 'ㅌ')) { d[i + 1].lnk = t === 'ㄷ' ? 'j' : 'ch'; continue; } // 같이 -> gachi
        if (nc === 11 && f[1] >= 0) { // linking: the final moves to the empty initial (ㅎ disappears)
          var mv = f[1]; if (t === 'ㅎ') { continue; } if (t === 'ㄶ') { out += 'n'; d[i + 1].lnk = ''; continue; } if (t === 'ㅀ') { out += ''; d[i + 1].lnk = 'r'; continue; }
          if (t.length && ['ㄳ', 'ㄵ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅄ'].indexOf(t) >= 0) { out += { 'ㄳ': 'k', 'ㄵ': 'n', 'ㄺ': 'l', 'ㄻ': 'l', 'ㄼ': 'l', 'ㄽ': 'l', 'ㄾ': 'l', 'ㄿ': 'l', 'ㅄ': 'p' }[t]; }
          d[i + 1].lnk = mv === 5 ? 'r' : RR_I[mv]; continue;
        }
        if (nc === 18 && ASP[f[1]] !== undefined) { d[i + 1].lnk = RR_I[ASP[f[1]]]; continue; } // ㄱ+ㅎ -> k
        if (t === 'ㅎ' && ASP[nc] !== undefined) { d[i + 1].lnk = RR_I[ASP[nc]]; continue; } // ㅎ+ㄱ -> k
        if (nc === 2 || nc === 6) { // nasalisation before ㄴ ㅁ
          if (cls === 'k') cls = 'ng'; else if (cls === 't') cls = 'n'; else if (cls === 'p') cls = 'm';
          if (cls === 'l' && nc === 2) d[i + 1].lnk = 'l';
        }
        if (nc === 5) { // ㄹ after a final
          if (cls === 'l' || cls === 'n') { cls = 'l'; d[i + 1].lnk = 'l'; }
          else { d[i + 1].lnk = 'n'; if (cls === 'k') cls = 'ng'; else if (cls === 'p') cls = 'm'; else if (cls === 't') cls = 'n'; }
        }
      }
      out += cls;
    }
    return out;
  }).join('');
};
EA.hanjaToHangul = function (s) { return Array.from(s).map(function (c) { return isHan(c) && D.hanja && D.hanja[c] ? D.hanja[c] : c; }).join(''); };
/* Hangul -> Hanja for Sino-Korean words the dictionary knows (other words are left in Hangul) */
EA.hangulToHanja = function (s) {
  return s.split(/(\s+)/).map(function (w) {
    var core = w.replace(/[^\uAC00-\uD7A3]/g, '');
    for (var L = core.length; L >= 2; L--) {
      var head = core.slice(0, L), ids = D.koIdx && D.koIdx[head], e = ids && ids.map(function (i) { return D.ko[i]; }).filter(function (x) { return x[0] === head && x[2]; }).sort(function (a, b) { return b[5] - a[5]; })[0];
      if (e) return w.replace(head, e[2].replace(/\s/g, ''));
    }
    return w;
  }).join('');
};
function koEntries(w) { var ids = D.koIdx && D.koIdx[w]; return ids ? ids.map(function (i) { return D.ko[i]; }).sort(function (a, b) { return b[5] - a[5]; }) : []; }
EA.koEntries = koEntries;
/* split a Korean word into a dictionary stem and its ending or particle: 학교에서 -> 학교 + 에서 */
var KO_PART = ['에서는', '에게서', '으로는', '에서', '에게', '한테', '으로', '까지', '부터', '처럼', '보다', '하고', '이나', '은', '는', '이', '가', '을', '를', '에', '의', '도', '만', '로', '와', '과', '랑', '요'];
EA.koWord = function (w) {
  var core = w.replace(/[^\uAC00-\uD7A3]/g, '');
  if (koEntries(core).length) return { stem: core, rest: '', e: koEntries(core)[0] };
  for (var i = 0; i < KO_PART.length; i++) { var p = KO_PART[i]; if (core.length > p.length && core.slice(-p.length) === p && koEntries(core.slice(0, -p.length)).length) return { stem: core.slice(0, -p.length), rest: p, e: koEntries(core.slice(0, -p.length))[0] }; }
  // verbs and adjectives: the infinitive (해, 먹어, 봐), with or without the past ㅆ, or stem + 다
  var vend = function (e) { return e[1] === 'v' || e[1] === 'a'; };
  for (var L0 = core.length; L0 >= 1; L0--) {
    var pre = core.slice(0, L0), lst = decompose(pre[L0 - 1]), noPast = lst && JONG[lst[2]] === 'ㅆ' ? pre.slice(0, -1) + compose(lst[0], lst[1], 0) : null;
    var hit = D.koInf && (D.koInf[pre] !== undefined ? pre : noPast && D.koInf[noPast] !== undefined ? noPast : null);
    if (hit) { var ev = D.ko[D.koInf[hit]]; return { stem: ev[0], rest: core.slice(L0), e: ev, past: hit === noPast }; }
    if (/[해했합하]$/.test(pre) && koEntries(pre.slice(0, -1) + '하다').filter(vend).length) return { stem: pre.slice(0, -1) + '하다', rest: core.slice(L0), e: koEntries(pre.slice(0, -1) + '하다').filter(vend)[0], past: /했$/.test(pre) };
  }
  for (var L = core.length; L >= 1; L--) {
    var st = core.slice(0, L), es = koEntries(st + '다').filter(function (e) { return e[1] === 'v' || e[1] === 'a'; });
    if (es.length) return { stem: st + '다', rest: core.slice(L), e: es[0] };
    var last = decompose(core[L - 1]);
    if (last && last[2]) { var bare = core.slice(0, L - 1) + compose(last[0], last[1], 0), es2 = koEntries(bare + '다').filter(function (e) { return e[1] === 'v' || e[1] === 'a'; }); if (es2.length) return { stem: bare + '다', rest: core.slice(L - 1), e: es2[0] }; }
  }
  for (var L2 = core.length - 1; L2 >= 1; L2--) if (koEntries(core.slice(0, L2)).length) return { stem: core.slice(0, L2), rest: core.slice(L2), e: koEntries(core.slice(0, L2))[0] };
  return { stem: core, rest: '', e: null };
};


/* ================================================================ English names by sound */
function phonesOf(word) {
  var w = word.toLowerCase().replace(/[^a-z']/g, '');
  if (D.cmu && D.cmu[w]) return { src: 'pronunciation dictionary', ph: spellVowels(w, D.cmu[w].split(' ')) };
  return { src: 'spelling rules', ph: spellPhones(w) };
}
function spellPhones(w) { // rough letter-to-sound rules for words the pronunciation dictionary does not know
  var out = [], i = 0, R = [['tion', ['SH', 'AH0', 'N']], ['ph', ['F']], ['sh', ['SH']], ['ch', ['CH']], ['th', ['TH']], ['ck', ['K']], ['qu', ['K', 'W']], ['ee', ['IY1']], ['oo', ['UW1']], ['ou', ['AW1']], ['ai', ['EY1']], ['ay', ['EY1']], ['ea', ['IY1']], ['oa', ['OW1']], ['a', ['AE1']], ['e', ['EH1']], ['i', ['IH1']], ['o', ['AA1']], ['u', ['AH1']], ['y', ['IY0']], ['b', ['B']], ['c', ['K']], ['d', ['D']], ['f', ['F']], ['g', ['G']], ['h', ['HH']], ['j', ['JH']], ['k', ['K']], ['l', ['L']], ['m', ['M']], ['n', ['N']], ['p', ['P']], ['r', ['R']], ['s', ['S']], ['t', ['T']], ['v', ['V']], ['w', ['W']], ['x', ['K', 'S']], ['z', ['Z']]];
  while (i < w.length) {
    var hit = null; for (var k = 0; k < R.length; k++) if (w.substr(i, R[k][0].length) === R[k][0]) { hit = R[k]; break; }
    if (!hit) { i++; continue; }
    if (hit[0] === 'e' && i === w.length - 1 && out.length) { i++; continue; }
    out = out.concat(hit[1]); i += hit[0].length;
  }
  return out;
}
/* unstressed vowels (schwa) are written as spelled when names are borrowed: Jennifer -> ジェニファー, not ジェナファー */
function spellVowels(w, ph) {
  var groups = w.replace(/^mc/, 'mac').match(/[aeiouy]+/g) || [], vi = ph.map(function (p, i) { return /^[AEIOU]/.test(p) ? i : -1; }).filter(function (i) { return i >= 0; });
  if (/e$/.test(w) && groups.length === vi.length + 1) groups.pop();
  if (groups.length !== vi.length) return ph;
  var M = { a: 'AE', e: 'EH', i: 'IH', o: 'AA', u: 'UH', y: 'IH' };
  return ph.map(function (p, i) {
    var k = vi.indexOf(i); if (k < 0) return p;
    var g = groups[k], b = p.replace(/\d/, ''), st = p.slice(-1);
    if (b === 'EH' && ph[i + 1] === 'R' && /^a/.test(g)) return 'AE' + st; // Larry, Mary, Harry
    if (st === '0' && (b === 'AH' || b === 'IH' || b === 'ER') && g.length === 1 && M[g]) return (b === 'ER' ? 'ER' : g === 'o' ? 'AO' : g === 'a' ? 'AA' : M[g]) + '0';
    if (st !== '0' && b === 'AA' && g === 'o') return 'AO' + st;
    if (st === '0' && b === 'AH' && g.length === 2 && /^(ae|ai|ea|ie)$/.test(g)) return 'EH0';
    return p;
  });
}
function isV(p) { return /^[AEIOU]/.test(p); }
function vbase(p) { return p.replace(/\d/, ''); }
/* phonemes -> syllables {c: onset consonant(s), v: vowel, stress, coda: []} */
function syllables(ph) {
  var out = [], cur = { c: [], v: null, coda: [] };
  for (var i = 0; i < ph.length; i++) {
    var p = ph[i];
    if (isV(p)) {
      if (cur.v) { out.push(cur); cur = { c: [], v: null, coda: [] }; }
      cur.v = vbase(p); cur.st = /1|2/.test(p);
    } else if (!cur.v) cur.c.push(p);
    else {
      // a consonant between vowels starts the next syllable; clusters split before the last consonant
      var j = i; while (j < ph.length && !isV(ph[j])) j++;
      if (j < ph.length) { var run = ph.slice(i, j), keep = run.length > 1 ? run.slice(0, run.length - 1) : []; if (run.length === 2 && /^(S)$/.test(run[0]) && /^(T|P|K)$/.test(run[1])) keep = []; cur.coda = cur.coda.concat(keep); out.push(cur); cur = { c: run.slice(keep.length), v: null, coda: [] }; i = j - 1; }
      else { cur.coda = cur.coda.concat(ph.slice(i)); i = ph.length; }
    }
  }
  if (cur.v || cur.c.length) out.push(cur);
  return out;
}
/* --- Japanese katakana */
var JK = { '': ['ア', 'イ', 'ウ', 'エ', 'オ'], K: ['カ', 'キ', 'ク', 'ケ', 'コ'], G: ['ガ', 'ギ', 'グ', 'ゲ', 'ゴ'], S: ['サ', 'シ', 'ス', 'セ', 'ソ'], Z: ['ザ', 'ジ', 'ズ', 'ゼ', 'ゾ'], T: ['タ', 'ティ', 'トゥ', 'テ', 'ト'], D: ['ダ', 'ディ', 'ドゥ', 'デ', 'ド'], N: ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'], HH: ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'], F: ['ファ', 'フィ', 'フ', 'フェ', 'フォ'], B: ['バ', 'ビ', 'ブ', 'ベ', 'ボ'], P: ['パ', 'ピ', 'プ', 'ペ', 'ポ'], M: ['マ', 'ミ', 'ム', 'メ', 'モ'], Y: ['ヤ', 'イ', 'ユ', 'イェ', 'ヨ'], R: ['ラ', 'リ', 'ル', 'レ', 'ロ'], L: ['ラ', 'リ', 'ル', 'レ', 'ロ'], W: ['ワ', 'ウィ', 'ウ', 'ウェ', 'ウォ'], V: ['バ', 'ビ', 'ブ', 'ベ', 'ボ'], SH: ['シャ', 'シ', 'シュ', 'シェ', 'ショ'], CH: ['チャ', 'チ', 'チュ', 'チェ', 'チョ'], JH: ['ジャ', 'ジ', 'ジュ', 'ジェ', 'ジョ'], ZH: ['ジャ', 'ジ', 'ジュ', 'ジェ', 'ジョ'], TH: ['サ', 'シ', 'ス', 'セ', 'ソ'], DH: ['ザ', 'ジ', 'ズ', 'ゼ', 'ゾ'], NG: ['ンガ', 'ンギ', 'ング', 'ンゲ', 'ンゴ'] };
var JLONE = { K: 'ク', G: 'グ', S: 'ス', Z: 'ズ', T: 'ト', D: 'ド', N: 'ン', HH: 'フ', F: 'フ', B: 'ブ', P: 'プ', M: 'ム', L: 'ル', R: 'ル', SH: 'シュ', CH: 'チ', JH: 'ジ', ZH: 'ジュ', TH: 'ス', DH: 'ズ', V: 'ブ', NG: 'ング', Y: 'イ', W: 'ウ' };
var JV = { AA: [0, ''], AE: [0, ''], AH: [0, ''], AO: [4, ''], AW: [0, 'ウ'], AY: [0, 'イ'], EH: [3, ''], ER: [0, 'ー'], EY: [3, 'イ'], IH: [1, ''], IY: [1, 'ー'], OW: [4, 'ー'], OY: [4, 'イ'], UH: [2, ''], UW: [2, 'ー'] };
EA.katakanaBySound = function (word) {
  var known = nameFromDict('ja', word); if (known) return { text: known, src: 'dictionary' };
  var P = phonesOf(word), sy = syllables(P.ph), out = '';
  sy.forEach(function (s, si) {
    var cs = s.c.slice();
    while (cs.length > 1) out += JLONE[cs.shift()] || '';
    var c = cs[0] || '';
    if (s.v) {
      var v = JV[s.v] || [0, ''], k = (JK[c] || JK[''])[v[0]];
      if (c === 'Y' && s.v === 'EH') k = 'イェ';
      var tail = v[1]; if (s.v === 'IY' && (si < sy.length - 1 || !s.st && word.length > 4)) tail = si === sy.length - 1 ? 'ー' : '';
      if (s.v === 'ER' && s.coda.length && s.coda[0] === 'R') s.coda.shift();
      out += k + tail;
    } else if (c) out += JLONE[c] || '';
    s.coda.forEach(function (cc) { if (cc === 'R') { if (out.slice(-1) !== 'ー') out += 'ー'; } else out += JLONE[cc] || ''; });
  });
  return { text: out.replace(/ーー+/g, 'ー'), src: P.src };
};
/* --- Korean Hangul (loanword spelling rules, simplified) */
var KC = { B: 7, CH: 14, D: 3, DH: 3, F: 17, G: 0, HH: 18, JH: 12, K: 15, L: 5, M: 6, N: 2, P: 17, R: 5, S: 9, SH: 9, T: 16, TH: 9, V: 7, Z: 12, ZH: 12, '': 11, NG: 11 };
var KV = { AA: 0, AE: 1, AH: 4, AO: 8, AW: [0, 'ㅜ'], AY: [0, 'ㅣ'], EH: 5, ER: 4, EY: [5, 'ㅣ'], IH: 20, IY: 20, OW: 8, OY: [8, 'ㅣ'], UH: 13, UW: 13 };
var KY = { 0: 2, 1: 3, 4: 6, 5: 7, 8: 12, 13: 17, 20: 20 }, KW = { 0: 9, 1: 10, 4: 14, 5: 15, 20: 16, 8: 14, 13: 13 }, KSH = { 0: 2, 4: 6, 8: 12, 13: 17, 5: 7, 1: 3, 20: 20 };
var KFIN = { K: 1, P: 17, T: 19, L: 8, M: 16, N: 4, NG: 21 }, KLONE = { B: '브', CH: '치', D: '드', DH: '드', F: '프', G: '그', HH: '흐', JH: '지', K: '크', L: '르', M: '므', N: '느', P: '프', R: '르', S: '스', SH: '시', T: '트', TH: '스', V: '브', Z: '즈', ZH: '지', NG: '', Y: '이', W: '우' };
var KJV = { 'ㅣ': 20, 'ㅜ': 13 };
EA.hangulBySound = function (word) {
  var known = nameFromDict('ko', word); if (known) return { text: known, src: 'dictionary' };
  var P = phonesOf(word), sy = syllables(P.ph), out = '';
  sy.forEach(function (s, si) {
    var cs = s.c.slice();
    while (cs.length > 1) { var x = cs.shift(); if (x === 'S' || x === 'F' || x === 'B' || x === 'G' || x === 'K' || x === 'P' || x === 'D' || x === 'T' || x === 'TH' || x === 'Z') out += KLONE[x]; else if (x === 'L' && out) { var ld = decompose(out.slice(-1)); if (ld && !ld[2]) out = out.slice(0, -1) + compose(ld[0], ld[1], 8); else out += '르'; } }
    var c = cs[0] || '';
    if (!s.v) { if (c) out += KLONE[c] || ''; return; }
    var vv = KV[s.v], v = Array.isArray(vv) ? vv[0] : vv, extra = Array.isArray(vv) ? vv[1] : '';
    if (s.v === 'AH' && s.st) v = 4;
    if ((s.v === 'AH' || s.v === 'EH') && !s.st && s.coda.length === 1 && s.coda[0] === 'L' && si === sy.length - 1) v = 18; // Michael -> 마이클
    var ini = KC[c] !== undefined ? KC[c] : 11;
    if (c === 'Y') { ini = 11; v = KY[v] !== undefined ? KY[v] : v; }
    if (c === 'W') { ini = 11; v = KW[v] !== undefined ? KW[v] : v; }
    if (c === 'SH' || c === 'ZH') v = KSH[v] !== undefined ? KSH[v] : v;
    // L between vowels is doubled (Sally -> 샐리); R between vowels stays single
    if (c === 'L' && si > 0 && sy[si - 1].v && !sy[si - 1].coda.length && out) { var pd = decompose(out.slice(-1)); if (pd && !pd[2]) out = out.slice(0, -1) + compose(pd[0], pd[1], 8); }
    var fin = 0, coda = s.coda.filter(function (x) { return x !== 'R'; }), rest = [];
    if (coda.length) {
      var f0 = coda[0], last = si === sy.length - 1;
      if (f0 === 'L' || f0 === 'M' || f0 === 'N' || f0 === 'NG') { fin = KFIN[f0]; rest = coda.slice(1); }
      else if ((f0 === 'K' || f0 === 'P' || f0 === 'T') && !/^(IY|UW|OW|EY|AY|AW|OY)$/.test(s.v) && coda.length === 1 && !last) { fin = KFIN[f0]; rest = []; }
      else if ((f0 === 'K' || f0 === 'P') && !/^(IY|UW|OW|EY|AY|AW|OY)$/.test(s.v) && coda.length === 1 && last && s.st) { fin = KFIN[f0]; rest = []; }
      else rest = coda;
    }
    if (extra) { out += compose(ini, v, 0) + compose(11, KJV[extra], fin); }
    else out += compose(ini, v, fin);
    rest.forEach(function (x) { out += KLONE[x] || ''; });
  });
  return { text: out, src: P.src };
};
/* --- Mandarin (characters used for foreign names, after the Xinhua tables) */
var ZN = { jian: '简', jie: '杰', qian: '茜', xin: '辛', zhen: '珍', zhan: '詹', jen: '珍', qie: '切', xie: '谢', yan: '燕', lie: '列', mie: '米', nie: '妮', die: '迪', tie: '蒂', pie: '皮', bie: '贝', fen: '芬', ken: '肯', ben: '本', den: '登', ten: '滕', hen: '亨', sen: '森', zen: '曾', a: '阿', ai: '艾', an: '安', ang: '昂', ao: '奥', ba: '巴', bai: '拜', ban: '班', bao: '鲍', bei: '贝', ben: '本', bi: '比', bo: '博', bu: '布', bin: '宾', ka: '卡', kai: '凯', kan: '坎', kang: '康', kao: '考', ke: '克', ken: '肯', ku: '库', kuo: '科', ki: '基', da: '达', dai: '代', dan: '丹', dang: '当', de: '德', deng: '登', di: '迪', du: '杜', dun: '顿', duo: '多', dian: '迪安', e: '埃', en: '恩', er: '尔', fa: '法', fan: '凡', fei: '菲', fen: '芬', fu: '弗', fo: '福', ga: '加', gai: '盖', gan: '甘', ge: '格', gen: '根', gu: '古', guo: '戈', ha: '哈', hai: '海', han: '汉', he: '赫', heng: '亨', hu: '胡', huo: '霍', ji: '吉', jia: '贾', jie: '杰', jin: '金', jun: '琼', ju: '朱', la: '拉', lai: '莱', lan: '兰', lang: '朗', lao: '劳', le: '勒', lei: '雷', li: '里', lian: '连', lin: '林', lu: '卢', lun: '伦', luo: '罗', ma: '马', mai: '迈', man: '曼', mao: '毛', mei: '梅', men: '门', mi: '米', min: '明', mo: '莫', mu: '穆', na: '纳', nai: '奈', nan: '南', nei: '内', ni: '尼', nuo: '诺', nu: '努', pa: '帕', pai: '派', pan: '潘', pei: '佩', pi: '皮', po: '波', pu: '普', qi: '奇', qiao: '乔', sa: '萨', sai: '赛', sang: '桑', sai2: '塞', si: '斯', sen: '森', su: '苏', suo: '索', sha: '沙', shan: '山', shi: '什', shu: '舒', ta: '塔', tai: '泰', tan: '坦', te: '特', ti: '蒂', tu: '图', tuo: '托', wa: '瓦', wai: '怀', wan: '万', wei: '威', wen: '温', wo: '沃', wu: '伍', xi: '西', xia: '夏', xie: '谢', xiu: '休', ya: '亚', ye: '耶', yi: '伊', you: '尤', yu: '尤', za: '扎', ze: '泽', zi: '兹', zhi: '芝', zhu: '朱', zuo: '佐', ruo: '若', ri: '里', ji2: '杰', qiong: '琼', jo: '乔', lo: '洛', ro: '罗', mo2: '莫', yue: '约', yue2: '约', ji3: '基', xi2: '希', you2: '尤', yuan: '源' };
var ZC = { B: 'b', P: 'p', D: 'd', T: 't', G: 'g', K: 'k', F: 'f', V: 'w', M: 'm', N: 'n', L: 'l', R: 'l', HH: 'h', S: 's', Z: 'z', SH: 'x', CH: 'q', JH: 'j', ZH: 'r', TH: 's', DH: 'd', Y: 'y', W: 'w', '': '' };
var ZVOW = { AA: 'a', AE: 'a', AH: 'a', AO: 'o', AW: 'ao', AY: 'ai', EH: 'ai', ER: 'e', EY: 'ei', IH: 'i', IY: 'i', OW: 'o', OY: 'ao', UH: 'u', UW: 'u' };
var ZLONE = { B: '布', P: '普', D: '德', T: '特', G: '格', K: '克', F: '夫', V: '夫', M: '姆', N: '恩', L: '尔', R: '尔', HH: '赫', S: '斯', Z: '兹', SH: '什', CH: '奇', JH: '吉', ZH: '日', TH: '斯', DH: '德', NG: '', Y: '伊', W: '伍' };
function zhSyl(c, v, nasal) {
  var ini = ZC[c] !== undefined ? ZC[c] : '', fin = ZVOW[v] || 'a';
  if (fin === 'o') fin = /^[bpmfw]$/.test(ini) ? 'o' : ini ? 'uo' : 'ao';
  if (fin === 'i' && /^[x]$/.test(ini)) fin = 'i';
  if (fin === 'e' && !ini) fin = 'er';
  if (nasal) fin = fin === 'uo' ? 'un' : fin === 'ai' || fin === 'ei' ? 'en' : fin === 'i' ? 'in' : fin === 'u' ? 'un' : fin === 'ao' ? 'ang' : fin === 'er' ? 'en' : fin + 'n';
  if ((ini === 'd' || ini === 't') && v === 'AH' && nasal) fin = 'un';
  if (fin === 'ai' && /^[jqxy]$/.test(ini)) fin = 'ie';
  if (fin === 'ain') fin = /^[jqxy]$/.test(ini) ? 'ian' : 'en';
  var key = ini + fin;
  if (ZN[key]) return ZN[key];
  var alts = [ini + fin.replace(/n$/, ''), ini + 'e', ini + 'i', ini + 'a', ini + 'u', ini + 'uo'];
  for (var k = 0; k < alts.length; k++) if (ZN[alts[k]]) return ZN[alts[k]];
  if (ZN[ini + fin.replace(/n$/, '')]) return ZN[ini + fin.replace(/n$/, '')] + (nasal ? '' : '');
  return ZN[ini + 'a'] || ZN[fin] || '阿';
}
EA.nameFromDict = nameFromDict;
EA.hanziBySound = function (word) {
  var known = nameFromDict('zh', word); if (known) return { text: known, src: 'dictionary' };
  var P = phonesOf(word), sy = syllables(P.ph), out = '';
  sy.forEach(function (s, si) {
    var cs = s.c.slice(); while (cs.length > 1) out += ZLONE[cs.shift()] || '';
    var c = cs[0] || '';
    if (!s.v) { if (c) out += ZLONE[c] || ''; return; }
    var coda = s.coda.slice(), nasal = false;
    if (coda[0] === 'N' && (coda.length === 1 || si === sy.length - 1)) { nasal = true; coda.shift(); }
    if (s.v === 'ER') { out += zhSyl(c, 'ER', false); if (c) out += '尔'; coda = coda.filter(function (x) { return x !== 'R'; }); }
    else out += zhSyl(c, s.v, nasal);
    coda.forEach(function (x) { if (x === 'R' && si < sy.length - 1) return; out += ZLONE[x] || ''; });
  });
  return { text: out, src: P.src };
};
function nameFromDict(lang, word) { // a name or place with an established spelling in the dictionary
  var idx = D.en[lang]; if (!idx) return null;
  var ids = idx[word.toLowerCase()] || [], best = null, bf = -1, re = new RegExp('(^|[/;] ?)' + word.replace(/[^A-Za-z]/g, '') + '( \\([^)]*\\))?($|[/;,])');
  var personal = (D.en.zh && D.en.zh[word.toLowerCase()] || []).some(function (id) { return new RegExp('(^|/)' + word + ' \\((name|given name|male name|female name|surname)').test(D.zh[id][3]); });
  ids.forEach(function (id) {
    var e = lang === 'zh' ? D.zh[id] : lang === 'ja' ? D.ja[id] : D.ko[id], g = lang === 'ja' ? e[2] : e[3], f = lang === 'zh' ? e[4] : lang === 'ja' ? e[4] * 3 + e[7] : e[5];
    if (!re.test(g) || /biblical|archangel|apostle|patriarch|prophet|saint/i.test(g)) return;
    if (lang !== 'zh' && personal) return; // personal names: written by sound in Japanese and Korean
    if (lang === 'zh' && !/^[A-Z]/.test(e[2])) return;
    if (lang === 'ja' && !(/\bn\b|pn/.test(e[3]) && e[1].some(function (r) { return /^[\u30A0-\u30FF]+$/.test(r); }) || e[0].length)) return;
    if (lang === 'ko' && !/^(name|n)$/.test(e[1])) return;
    var form = lang === 'zh' ? e[0] : lang === 'ja' ? (e[1].filter(function (r) { return /^[\u30A0-\u30FF]+$/.test(r); })[0] || (e[0][0] && Array.from(e[0][0]).length > 1 ? e[0][0] : null)) : e[0];
    if (form && f > bf) { bf = f; best = form; }
  });
  return best;
}
/* whole phrase: words with a dictionary meaning can also be translated, names are written by sound */
EA.bySound = function (text, lang) {
  var words = text.split(/\s+/).filter(Boolean);
  var parts = words.map(function (w) {
    var clean = w.replace(/[^A-Za-z'-]/g, '');
    if (!clean) return { en: w, text: w };
    var r = lang === 'ja' ? EA.katakanaBySound(clean) : lang === 'ko' ? EA.hangulBySound(clean) : EA.hanziBySound(clean);
    return { en: clean, text: r.text, src: r.src };
  });
  var sep = lang === 'ja' ? '・' : lang === 'ko' ? ' ' : '·';
  return { text: parts.map(function (p) { return p.text; }).join(sep), parts: parts };
};

/* ================================================================ English -> drafts */
var IRR = { am: 'be', is: 'be', are: 'be', was: 'be', were: 'be', been: 'be', saw: 'see', seen: 'see', went: 'go', gone: 'go', gave: 'give', given: 'give', made: 'make', came: 'come', ate: 'eat', eaten: 'eat', knew: 'know', known: 'know', spoke: 'speak', said: 'say', heard: 'hear', took: 'take', taken: 'take', built: 'build', wrote: 'write', written: 'write', sent: 'send', brought: 'bring', found: 'find', told: 'tell', kept: 'keep', left: 'leave', led: 'lead', fell: 'fall', rose: 'rise', sat: 'sit', stood: 'stand', men: 'man', women: 'woman', children: 'child', feet: 'foot', teeth: 'tooth', mice: 'mouse', people: 'person', has: 'have', had: 'have', did: 'do', does: 'do', began: 'begin', became: 'become', ran: 'run', drank: 'drink', sang: 'sing', thought: 'think', taught: 'teach', bought: 'buy', sold: 'sell', met: 'meet', slept: 'sleep', swam: 'swim', drove: 'drive', flew: 'fly', got: 'get', read: 'read', understood: 'understand', won: 'win', lost: 'lose', paid: 'pay', felt: 'feel', meant: 'mean', spent: 'spend', woke: 'wake', wore: 'wear', chose: 'choose', forgot: 'forget', broke: 'break', caught: 'catch', fought: 'fight', heard: 'hear', held: 'hold', learnt: 'learn', put: 'put', cut: 'cut', let: 'let', hit: 'hit', set: 'set', better: 'good', best: 'good' };
function lemmas(w) {
  var out = [w]; if (IRR[w]) out.unshift(IRR[w]);
  if (/ies$/.test(w)) out.push(w.slice(0, -3) + 'y'); if (/(s|x|z|ch|sh)es$/.test(w)) out.push(w.slice(0, -2)); if (/[^s]s$/.test(w)) out.push(w.slice(0, -1));
  if (/ied$/.test(w)) out.push(w.slice(0, -3) + 'y');
  if (/ed$/.test(w)) { if (/(.)\1ed$/.test(w)) out.push(w.slice(0, -3)); out.push(w.slice(0, -1)); out.push(w.slice(0, -2)); }
  if (/ing$/.test(w)) { if (/(.)\1ing$/.test(w)) out.push(w.slice(0, -4)); out.push(w.slice(0, -3) + 'e'); out.push(w.slice(0, -3)); }
  if (/er$/.test(w)) out.push(w.slice(0, -2)); if (/est$/.test(w)) out.push(w.slice(0, -3));
  return out;
}
var PRON = { i: '1s', me: '1s', you: '2s', he: '3m', him: '3m', she: '3f', her: '3f', it: '3n', we: '1p', us: '1p', they: '3p', them: '3p' };
var POSS = { my: '1s', your: '2s', his: '3m', her: '3f', its: '3n', our: '1p', their: '3p' };
var DETS = { the: 1, a: 1, an: 1, this: 'this', that: 'that', these: 'this', those: 'that', some: 1 };
var PREPS = { in: 'in', inside: 'in', at: 'at', on: 'on', to: 'to', into: 'to', for: 'for', from: 'from', with: 'with', under: 'under', before: 'before', after: 'after', by: 'by', near: 'near', about: 'about' };
var NUMS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
var TIMEW = { today: 1, tomorrow: 1, yesterday: 1, now: 1, tonight: 1 };
var ADV = { very: 1, really: 1, also: 1, too: 1, often: 1, always: 1, never: 1, sometimes: 1, here: 1, there: 1, well: 1, together: 1, slowly: 1, quickly: 1 };
var AUX = { do: 1, does: 1, did: 1, will: 1, shall: 1, can: 1, could: 1, would: 1, should: 1, must: 1, 'let\'s': 1 };
/* look an English word up in one language's dictionary; pos: 'n' noun, 'v' verb, 'a' adjective */
function lookupEn(lang, word, pos) {
  var idx = D.en[lang]; if (!idx) return null;
  var ls = lemmas(word.toLowerCase()), best = null, bs = -1;
  if (ls.length > 1 && ls[0] === word.toLowerCase()) ls = ls.slice(1).filter(function (l) { return idx[l] || idx['to ' + l]; }).concat([ls[0]]);
  var wl = word.toLowerCase(), cands0 = [wl].concat(ls);
  for (var ci = 0; ci < cands0.length; ci++) {
    var ov = PREF[lang] && (PREF[lang][(pos || '') + ':' + cands0[ci]] || PREF[lang][cands0[ci]]);
    if (ov) { var oe = findEntry(lang, ov, cands0[ci]); if (oe) return { e: oe, key: cands0[ci], lemma: cands0[ci], pref: true }; }
  }
  for (var li = 0; li < ls.length; li++) {
    var keys = pos === 'v' ? ['to ' + ls[li], ls[li]] : pos === 'a' ? [ls[li], 'to be ' + ls[li]] : [ls[li]];
    keys.forEach(function (k, ki) {
      (idx[k] || []).forEach(function (id, rank) {
        var e = lang === 'zh' ? D.zh[id] : lang === 'ja' ? D.ja[id] : D.ko[id]; if (!e) return;
        var g = lang === 'zh' ? e[3] : lang === 'ja' ? e[2] : e[3], p = lang === 'ja' ? e[3] : lang === 'ko' ? e[1] : '';
        var segs = g.replace(/\([^()]*\)/g, '').toLowerCase().split(/[\/;,]/).map(function (x) { return x.trim(); });
        var at = segs.indexOf(k); if (at < 0) at = 9;
        var ok = true, isVerbGloss = segs.indexOf('to ' + ls[li]) >= 0 && segs.indexOf(ls[li]) < 0;
        if (lang === 'ja') ok = pos === 'v' ? /\b(v1|v5|vs|vk|vz)/.test(p) : pos === 'a' ? /adj-(i|na)/.test(p) : pos === 'n' ? /\bn\b|pn/.test(p) && !/^(pref|suf)/.test(p) : true;
        else if (lang === 'ko') ok = pos === 'v' ? e[1] === 'v' : pos === 'a' ? (e[1] === 'a' || e[1] === 'v') : pos === 'n' ? /^(n|pron|num|name)$/.test(e[1]) : true;
        else ok = pos === 'v' ? segs.indexOf('to ' + ls[li]) >= 0 || /^to /.test(g) : pos === 'n' ? !isVerbGloss && !/^(\(literary\)|\(bound form\)|surname|variant|old variant|see )/.test(g) : pos === 'a' ? !/^\(bound form\)/.test(g) : true;
        if (!ok) return;
        var f = lang === 'zh' ? e[4] : lang === 'ja' ? e[4] * 3 + e[7] : e[5] + (e[6] === 'w' ? 40 : 0);
        var sc = (f + 1) * (at === 0 ? 3 : at < 3 ? 1.5 : 0.6) * (ki === 0 ? 1 : 0.8) * (li === 0 ? 1 : 0.9) / (1 + rank * 0.15);
        if (lang === 'zh' && Array.from(e[0]).length > 2) sc *= 0.6;
        if (lang === 'ja' && e[5] && !e[0].length) sc *= 1;
        if (sc > bs) { bs = sc; best = { e: e, key: k, lemma: ls[li] }; }
      });
    });
    if (best) break;
  }
  return best;
}
EA.lookupEnglish = lookupEn;
/* the usual everyday word where the dictionary's most frequent match is a less natural choice */
var PREF = {
  zh: { play: '玩', swim: '游泳', 'v:like': '喜欢', book: '书', japanese: '日语', chinese: '中文', korean: '韩语', english: '英语', rice: '米饭', child: '孩子', give: '给', speak: '说', friend: '朋友', weather: '天气', water: '水', house: '房子', home: '家', father: '爸爸', mother: '妈妈', 'v:study': '学习', 'v:learn': '学', 'v:work': '工作', 'v:read': '看', 'v:write': '写', 'v:see': '看见', 'v:buy': '买', 'v:make': '做', 'v:live': '住', 'v:know': '知道', 'v:sleep': '睡觉', 'v:walk': '走', 'v:run': '跑', 'a:good': '好', 'a:big': '大', 'a:small': '小', 'a:beautiful': '漂亮', 'a:happy': '高兴', 'a:hot': '热', 'a:cold': '冷', 'a:delicious': '好吃', 'a:busy': '忙', 'a:new': '新', 'a:old': '老', today: '今天', time: '时间', name: '名字', station: '车站', toilet: '厕所', bathroom: '厕所', hospital: '医院', restaurant: '餐厅', hotel: '酒店', airport: '机场', money: '钱', phone: '电话', word: '词', 'a:hungry': '饿', 'a:tired': '累', 'a:sick': '病', 'a:expensive': '贵', 'a:cheap': '便宜', city: '城市', country: '国家', car: '车', dog: '狗', cat: '猫', 'n:love': '爱', 'v:love': '爱' },
  ja: { play: '遊ぶ', swim: '泳ぐ', book: '本', japanese: '日本語', chinese: '中国語', korean: '韓国語', english: '英語', rice: 'ご飯', child: '子供', friend: '友達', weather: '天気', house: '家', father: '父', mother: '母', speak: '話す', 'v:study': '勉強', 'v:learn': '習う', 'v:work': '働く', 'v:read': '読む', 'v:write': '書く', 'v:see': '見る', 'v:buy': '買う', 'v:make': '作る', 'v:live': '住む', 'v:know': '知る', 'v:sleep': '寝る', 'v:walk': '歩く', 'v:run': '走る', 'v:eat': '食べる', 'v:drink': '飲む', 'v:go': '行く', 'v:come': '来る', 'v:love': '愛する', 'a:good': 'いい', 'a:big': '大きい', 'a:small': '小さい', 'a:beautiful': '美しい', 'a:happy': '嬉しい', 'a:hot': '暑い', 'a:cold': '寒い', 'a:delicious': '美味しい', 'a:busy': '忙しい', 'a:new': '新しい', 'a:old': '古い', 'a:red': '赤い', car: '車', dog: '犬', cat: '猫', water: '水', time: '時間', name: '名前', station: '駅', toilet: 'トイレ', bathroom: 'トイレ', hospital: '病院', restaurant: 'レストラン', hotel: 'ホテル', airport: '空港', money: 'お金', phone: '電話', 'a:tired': '疲れる', 'a:expensive': '高い', 'a:cheap': '安い', city: '町', country: '国', teacher: '先生', student: '学生' },
  ko: { like: '좋아하다', rice: '밥', father: '아버지', mother: '어머니', play: '놀다', give: '주다', speak: '말하다', friend: '친구', weather: '날씨', teacher: '선생님', water: '물', 'v:eat': '먹다', house: '집', book: '책', swim: '수영하다', japanese: '일본어', chinese: '중국어', korean: '한국어', english: '영어', child: '아이', 'v:study': '공부하다', 'v:learn': '배우다', 'v:work': '일하다', 'v:read': '읽다', 'v:write': '쓰다', 'v:see': '보다', 'v:buy': '사다', 'v:make': '만들다', 'v:live': '살다', 'v:know': '알다', 'v:sleep': '자다', 'v:walk': '걷다', 'v:go': '가다', 'v:come': '오다', 'v:drink': '마시다', 'v:love': '사랑하다', 'n:love': '사랑', 'a:good': '좋다', 'a:big': '크다', 'a:small': '작다', 'a:beautiful': '아름답다', 'a:happy': '행복하다', 'a:hot': '덥다', 'a:cold': '춥다', 'a:delicious': '맛있다', 'a:busy': '바쁘다', 'a:new': '새롭다', 'a:pretty': '예쁘다', car: '차', dog: '개', cat: '고양이', time: '시간', name: '이름', station: '역', toilet: '화장실', bathroom: '화장실', hospital: '병원', restaurant: '식당', hotel: '호텔', airport: '공항', money: '돈', phone: '전화', 'a:hungry': '배고프다', 'a:tired': '피곤하다', 'a:expensive': '비싸다', 'a:cheap': '싸다', school: '학교', student: '학생', city: '도시', country: '나라', people: '사람', person: '사람' }
};
function findEntry(lang, w, en) { // the dictionary entry for a chosen word (a plain entry when the dictionary lacks it)
  var hasEn = function (g) { return !en || new RegExp('\\b' + en + '\\b', 'i').test(g); };
  if (lang === 'zh') return zhBest(w) || [w, w, '', en || '', 0, ''];
  if (lang === 'ja') { var j = jaEntries(w).filter(function (e) { return (e[0].indexOf(w) >= 0 || e[1].indexOf(w) >= 0) && hasEn(e[2]); }); return j[0] || jaEntries(w)[0] || null; }
  var k = koEntries(w).filter(function (e) { return e[0] === w; });
  return k[0] || [w, /다$/.test(w) ? 'v' : 'n', '', en || '', '', 0, 'p'];
}
/* a small English parser: subject, verb, object, predicate, prepositional phrases */
function parseEn(s) {
  var q = /\?\s*$/.test(s), orig = {};
  s.replace(/[A-Za-z']+/g, function (w) { orig[w.toLowerCase()] = w; });
  var low = s.toLowerCase().replace(/n't\b/g, ' not').replace(/'m\b/g, ' am').replace(/'re\b/g, ' are').replace(/'s\b/g, ' is').replace(/'ll\b/g, ' will').replace(/\bcannot\b/g, 'can not');
  var ws = low.replace(/[^a-z' ]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  var P = { q: q, neg: false, tense: 'pres', can: false, want: false, time: [], adv: [], orig: orig };
  var rest = [];
  ws.forEach(function (w, i) {
    if (w === 'not' || w === 'never') { P.neg = true; return; }
    if (w === 'will' || w === 'shall') { P.tense = 'fut'; return; }
    if (w === 'can' || w === 'could') { P.can = true; return; }
    if (/^(do|does|did)$/.test(w) && i + 1 < ws.length && (ws[i + 1] === 'not' || i === 0 || PRON[ws[i + 1]] !== undefined || DETS[ws[i + 1]])) { if (w === 'did') P.tense = 'past'; return; }
    if (TIMEW[w]) { P.time.push(w); if (w === 'yesterday') P.tense = 'past'; if (w === 'tomorrow' && P.tense !== 'past') P.tense = 'fut'; return; }
    if (ADV[w]) { P.adv.push(w); return; }
    rest.push(w);
  });
  if (q && rest.length && lemmas(rest[0])[0] === 'be') { // "Is he a teacher?" -> "he is a teacher"
    var b = rest.shift(); var j = 1; while (j < rest.length && (DETS[rest[j - 1]] || POSS[rest[j - 1]])) j++; rest.splice(j, 0, b);
  }
  // verb: the first word after the subject that is "be" or a known verb
  var vi = -1;
  for (var k = 0; k < rest.length; k++) {
    var w = rest[k];
    if (lemmas(w)[0] === 'be') { vi = k; P.be = true; if (/^(was|were)$/.test(w)) P.tense = 'past'; break; }
    if (k === 0 && PRON[w] !== undefined) continue;
    if (DETS[w] || POSS[w] || NUMS[w] || PREPS[w] || w === 'and') continue;
    if (k > 0 && (DETS[rest[k - 1]] || POSS[rest[k - 1]] || NUMS[rest[k - 1]])) continue;
    if (w === 'want' || w === 'wants' || w === 'wanted') { if (rest[k + 1] === 'to') { P.want = true; if (w === 'wanted') P.tense = 'past'; rest.splice(k, 2); k--; continue; } }
    if (w === 'like' || w === 'likes') { if (rest[k + 1] === 'to') { rest.splice(k + 1, 1); } }
    var v = lookupEn('zh', w, 'v') || lookupEn('ja', w, 'v');
    if (v && (k > 0 || rest.length === 1 || PRON[rest[0]] === undefined)) {
      vi = k; P.verb = lemmas(w).filter(function (l) { return lookupEn('ja', l, 'v') || lookupEn('zh', l, 'v'); })[0] || lemmas(w)[0];
      if (/ed$/.test(w) || (IRR[w] && IRR[w] !== w && !/s$/.test(w) && !/^(read|put|cut|let|hit|set)$/.test(w))) P.tense = P.tense === 'fut' ? 'fut' : 'past';
      break;
    }
  }
  if (vi < 0) { P.subj = np(rest, P); return P; }
  var subjW = rest.slice(0, vi), after = rest.slice(vi + 1), pps = [], core = [];
  for (var i2 = 0; i2 < after.length; i2++) {
    if (PREPS[after[i2]] && !(after[i2] === 'to' && !P.be && /^(give|send|show|tell|say|speak|talk|write)$/.test(P.verb || '') === false && i2 === 0 && /^(go|come|return|walk|run|drive|fly|travel)$/.test(P.verb || '') === false)) {
      var j2 = i2 + 1; while (j2 < after.length && !PREPS[after[j2]]) j2++;
      pps.push({ p: PREPS[after[i2]], np: np(after.slice(i2 + 1, j2), P) }); i2 = j2 - 1; continue;
    }
    if (PREPS[after[i2]]) { var j3 = i2 + 1; while (j3 < after.length && !PREPS[after[j3]]) j3++; pps.push({ p: PREPS[after[i2]], np: np(after.slice(i2 + 1, j3), P) }); i2 = j3 - 1; continue; }
    core.push(after[i2]);
  }
  // indirect object: "gave me bread"
  if (!P.be && core.length > 1 && PRON[core[0]] !== undefined && !DETS[core[1]] !== undefined) { P.ind = np([core[0]], P); core = core.slice(1); }
  P.subj = subjW.length ? np(subjW, P) : null;
  if (P.be) { P.pred = core.length ? predOf(core, P) : null; }
  else P.obj = core.length ? np(core, P) : null;
  P.pps = pps;
  return P;
}
function predOf(ws, P) {
  var w = ws.filter(function (x) { return !DETS[x]; });
  if (w.length === 1 && !DETS[ws[0]] && (lookupEn('ja', w[0], 'a') || lookupEn('ko', w[0], 'a')) && !(lookupEn('ja', w[0], 'n') && /^(a|an|the)$/.test(ws[0]))) return { adj: w[0] };
  return { np: np(ws, P) };
}
function np(ws, P) {
  ws = ws.filter(function (w) { return w !== 'the' && w !== 'a' && w !== 'an'; });
  if (!ws.length) return null;
  var ai = ws.indexOf('and');
  if (ai > 0 && ai < ws.length - 1) return { and: [np(ws.slice(0, ai), P), np(ws.slice(ai + 1), P)].filter(Boolean) };
  var oi = ws.indexOf('of');
  if (oi > 0 && oi < ws.length - 1) { var h = np(ws.slice(0, oi), P), g = np(ws.slice(oi + 1), P); if (h && g) { h.of = g; return h; } }
  if (ws.length === 1 && PRON[ws[0]] !== undefined) return { pron: PRON[ws[0]], en: ws[0] };
  if (ws.length === 1 && (DETS[ws[0]] === 'this' || DETS[ws[0]] === 'that')) return { pron: DETS[ws[0]], en: ws[0] };
  var out = { adjs: [], poss: null, num: null, dem: null };
  for (var i = 0; i < ws.length - 1; i++) {
    if (POSS[ws[i]]) out.poss = POSS[ws[i]];
    else if (NUMS[ws[i]] || /^\d+$/.test(ws[i])) out.num = NUMS[ws[i]] || +ws[i];
    else if (DETS[ws[i]] === 'this' || DETS[ws[i]] === 'that') out.dem = DETS[ws[i]];
    else out.adjs.push(ws[i]);
  }
  out.head = ws[ws.length - 1]; out.en = out.head;
  out.cap = P.orig[out.head] && /^[A-Z]/.test(P.orig[out.head]) && !lookupEn('ja', out.head, 'n') && !lookupEn('zh', out.head, 'n');
  out.plural = lemmas(out.head)[0] !== out.head || /s$/.test(out.head) && !/ss$/.test(out.head);
  return out;
}
EA.parseEnglish = parseEn;

/* --- word choice helpers */
function W(list, text, en, how, gloss, ok) { list.push({ t: text, en: en || '', how: how || '', gloss: gloss || '', ok: ok !== false }); return text; }
function zhWord(e) { return e ? e[0] : null; }
function jaWord(e) { if (!e) return null; return e[5] || !e[0].length ? e[1][0] : e[0][0]; }

/* ---------------- Mandarin draft */
var ZP = { this: '这', that: '那', '1s': '我', '2s': '你', '3m': '他', '3f': '她', '3n': '它', '1p': '我们', '3p': '他们' };
var ZNUM = ['', '一', '两', '三', '四', '五', '六', '七', '八', '九', '十'];
function zhNP(n, out, P) {
  if (!n) return '';
  if (n.and) { return n.and.map(function (x, i) { return (i ? W(out, '和', 'and', 'conjunction') : '') + zhNP(x, out, P); }).join(''); }
  if (n.pron) return W(out, ZP[n.pron], n.en, 'pronoun');
  var s = '';
  if (n.of) s += zhNP(n.of, out, P) + W(out, '的', 'of', 'possessive 的');
  if (n.poss) s += W(out, ZP[n.poss] + '的', Object.keys(POSS).filter(function (k) { return POSS[k] === n.poss; })[0], 'possessive');
  var hd = n.cap ? { e: [EA.hanziBySound(P.orig[n.head] || n.head).text] } : lookupEn('zh', n.head, 'n');
  if (n.dem) s += W(out, n.dem === 'this' ? '这' : '那', n.dem, 'demonstrative');
  if (n.num) { var cl = hd && hd.e[5] ? (hd.e[5].split(',')[0].match(/\|?([^\[|]+)\[/) || [])[1] : null; s += W(out, (ZNUM[n.num] || String(n.num)) + (cl || '个'), String(n.num), 'number + measure word' + (cl ? '' : ' (default 个)')); }
  else if (n.dem) { var cl2 = hd && hd.e[5] ? (hd.e[5].split(',')[0].match(/\|?([^\[|]+)\[/) || [])[1] : '个'; s += W(out, cl2 || '个', '', 'measure word'); }
  n.adjs.forEach(function (a) { var e = lookupEn('zh', a, 'a'); if (e) { var t = e.e[0]; s += W(out, t + (Array.from(t).length > 1 ? '的' : ''), a, 'adjective', e.e[3].split('/')[0]); } else s += W(out, a, a, 'not found', '', false); });
  if (hd) s += W(out, hd.e[0], n.head, n.cap ? 'name, by sound' : 'noun', hd.e[3] ? hd.e[3].split('/')[0] : ''); else s += W(out, n.head, n.head, 'not found', '', false);
  return s;
}
function draftZh(text) {
  var P = parseEn(text), out = [], s = '';
  P.time.forEach(function (t) { s += W(out, { today: '今天', tomorrow: '明天', yesterday: '昨天', now: '现在', tonight: '今晚' }[t], t, 'time word'); });
  if (P.subj) s += zhNP(P.subj, out, P);
  if (P.adv.indexOf('also') >= 0 || P.adv.indexOf('too') >= 0) s += W(out, '也', 'also', 'adverb');
  var place = P.pps ? P.pps.filter(function (p) { return p.p === 'in' || p.p === 'at' || p.p === 'on'; }) : [], other = P.pps ? P.pps.filter(function (p) { return place.indexOf(p) < 0; }) : [];
  if (P.be) {
    var pr = P.pred;
    if (pr && pr.adj) { var a = lookupEn('zh', pr.adj, 'a'); s += P.neg ? W(out, '不', 'not', 'negation') : W(out, '很', 'is', '很 + adjective (Chinese has no "to be" before adjectives)'); s += a ? W(out, a.e[0], pr.adj, 'adjective', a.e[3].split('/')[0]) : W(out, pr.adj, pr.adj, 'not found', '', false); }
    else if (pr && pr.np) { if (P.tense === 'past') s += W(out, '以前', 'was', 'past time'); s += W(out, P.neg ? '不是' : '是', 'is', '是 links two nouns'); s += zhNP(pr.np, out, P); }
    place.forEach(function (p) { s += W(out, '在', p.p, 'preposition 在 (at/in)') + zhNP(p.np, out, P) + (p.p === 'in' ? W(out, '里', '', 'inside') : ''); });
  } else if (P.verb) {
    place.forEach(function (p) { s += W(out, '在', p.p, 'preposition 在 (at/in) before the verb') + zhNP(p.np, out, P); });
    other.filter(function (p) { return p.p === 'with' || p.p === 'from' || p.p === 'for'; }).forEach(function (p) { s += W(out, { with: '和', from: '从', for: '给' }[p.p], p.p, 'preposition before the verb') + zhNP(p.np, out, P) + (p.p === 'with' ? W(out, '一起', 'together', '和 … 一起') : ''); });
    if (P.neg) s += W(out, P.tense === 'past' ? '没' : '不', 'not', P.tense === 'past' ? '没 for past negation' : 'negation');
    if (P.tense === 'fut' && !P.neg) s += W(out, '会', 'will', 'future');
    if (P.can) s += W(out, '能', 'can', 'ability');
    if (P.want) s += W(out, '想', 'want to', 'wish');
    var v = lookupEn('zh', P.verb, 'v');
    var dest = other.filter(function (p) { return p.p === 'to'; })[0];
    if (/^(go|come)$/.test(P.verb) && dest) { s += W(out, P.verb === 'go' ? '去' : '来', P.verb, 'verb (place follows directly)'); s += zhNP(dest.np, out, P); dest = null; }
    else s += v ? W(out, v.e[0], P.verb, 'verb', v.e[3].split('/')[0]) : W(out, P.verb, P.verb, 'not found', '', false);
    if (P.tense === 'past' && !P.neg) s += W(out, '了', '(past)', '了 marks a completed action');
    if (P.ind) s += zhNP(P.ind, out, P);
    if (P.obj) s += zhNP(P.obj, out, P);
    if (dest) s += W(out, '给', 'to', 'to (a person)') + zhNP(dest.np, out, P);
  }
  if (P.q) s += W(out, '吗', '?', 'question particle');
  s += P.q ? '？' : '。';
  if (P.tense === 'past' && !P.neg) s = s.replace(/了(.+?)了/, '$1了');
  return finish(s, out, 'zh');
}

/* ---------------- Japanese draft (polite style) */
var JP = { this: 'これ', that: 'それ', '1s': '私', '2s': 'あなた', '3m': '彼', '3f': '彼女', '3n': 'それ', '1p': '私たち', '3p': '彼ら' };
var JNUM = ['', '一つ', '二つ', '三つ', '四つ', '五つ', '六つ', '七つ', '八つ', '九つ', '十'];
var GODAN_I = { 'う': 'い', 'く': 'き', 'ぐ': 'ぎ', 'す': 'し', 'つ': 'ち', 'ぬ': 'に', 'ぶ': 'び', 'む': 'み', 'る': 'り' };
function jaMasu(e, tense, neg) { // polite verb form from the dictionary form and its JMdict class
  var w = jaWord(e), p = e[3], stem;
  if (/\bvs\b|vs-s|vs-i/.test(p) && !/する$/.test(w)) w = w + 'する';
  if (/する$/.test(w)) stem = w.slice(0, -2) + 'し';
  else if (/\bvk\b/.test(p) || /来る$/.test(w)) stem = w.slice(0, -1).replace(/くる$/, 'き').replace(/来$/, '来');
  else if (/\bv1\b/.test(p)) stem = w.slice(0, -1);
  else { var m = /v5(\w)/.exec(p), last = w.slice(-1); stem = w.slice(0, -1) + (GODAN_I[last] || 'り'); if (m && m[1] === 'r' && /v5r-i/.test(p)) stem = w.slice(0, -1) + 'り'; }
  return stem + (neg ? (tense === 'past' ? 'ませんでした' : 'ません') : tense === 'past' ? 'ました' : 'ます');
}
function jaAdjPred(e, tense, neg) {
  var w = jaWord(e), p = e[3];
  if (/adj-i/.test(p) && /い$/.test(w)) { var st = w === 'いい' || w === '良い' ? (w === 'いい' ? 'よ' : '良') : w.slice(0, -1); return neg ? st + (tense === 'past' ? 'くなかったです' : 'くないです') : tense === 'past' ? st + 'かったです' : w + 'です'; }
  return w + (neg ? (tense === 'past' ? 'ではありませんでした' : 'ではありません') : tense === 'past' ? 'でした' : 'です');
}
function jaNP(n, out, P) {
  if (!n) return '';
  if (n.and) return n.and.map(function (x, i) { return (i ? W(out, 'と', 'and', 'particle と (and)') : '') + jaNP(x, out, P); }).join('');
  if (n.pron) return W(out, JP[n.pron], n.en, 'pronoun');
  var s = '';
  if (n.of) s += jaNP(n.of, out, P) + W(out, 'の', 'of', 'particle の');
  if (n.poss) s += W(out, JP[n.poss] + 'の', Object.keys(POSS).filter(function (k) { return POSS[k] === n.poss; })[0], 'possessive');
  if (n.dem) s += W(out, n.dem === 'this' ? 'この' : 'その', n.dem, 'demonstrative');
  n.adjs.forEach(function (a) { var e = lookupEn('ja', a, 'a'); if (e) s += W(out, jaWord(e.e) + (/adj-na/.test(e.e[3]) && !/adj-i/.test(e.e[3]) ? 'な' : ''), a, 'adjective', e.e[2].split('/')[0]); else s += W(out, a, a, 'not found', '', false); });
  var hd = n.cap ? { e: [[EA.katakanaBySound(P.orig[n.head] || n.head).text], [], '', 'n'] } : lookupEn('ja', n.head, 'n');
  s += hd ? W(out, jaWord(hd.e) || hd.e[0][0], n.head, n.cap ? 'name, by sound' : 'noun', hd.e[2] ? hd.e[2].split('/')[0] : '') : W(out, n.head, n.head, 'not found', '', false);
  if (n.num) s += W(out, JNUM[n.num] || String(n.num), String(n.num), 'number (counted after the noun)');
  return s;
}
function draftJa(text) {
  var P = parseEn(text), out = [], s = '';
  P.time.forEach(function (t) { s += W(out, { today: '今日', tomorrow: '明日', yesterday: '昨日', now: '今', tonight: '今夜' }[t], t, 'time word'); });
  if (P.subj) s += jaNP(P.subj, out, P) + W(out, P.adv.indexOf('also') >= 0 || P.adv.indexOf('too') >= 0 ? 'も' : 'は', '', P.adv.indexOf('also') >= 0 ? 'particle も (also)' : 'topic particle は');
  var pps = P.pps || [];
  if (P.be) {
    pps.forEach(function (p) { s += jaNP(p.np, out, P) + W(out, 'に', p.p, 'particle に (location of being)'); });
    var pr = P.pred;
    if (pr && pr.adj) { var a = lookupEn('ja', pr.adj, 'a'); s += a ? W(out, jaAdjPred(a.e, P.tense, P.neg), pr.adj, 'adjective + です', a.e[2].split('/')[0]) : W(out, pr.adj, pr.adj, 'not found', '', false); }
    else if (pr && pr.np) { s += jaNP(pr.np, out, P); s += W(out, P.neg ? (P.tense === 'past' ? 'ではありませんでした' : 'ではありません') : P.tense === 'past' ? 'でした' : 'です', 'is', 'copula です'); }
    else if (pps.length) s += W(out, P.neg ? 'いません' : P.tense === 'past' ? 'いました' : 'います', 'is', 'いる (to be somewhere)');
  } else if (P.verb) {
    var motion = /^(go|come|return|walk|run|drive|fly|travel)$/.test(P.verb);
    pps.forEach(function (p) {
      var part = { in: motion ? 'に' : 'で', at: 'で', on: 'で', to: motion ? 'へ' : 'に', for: 'のために', from: 'から', with: 'と', under: 'の下で', before: 'の前に', after: 'の後で', by: 'で', near: 'の近くで', about: 'について' }[p.p] || 'で';
      s += jaNP(p.np, out, P) + W(out, part, p.p, 'particle ' + part);
    });
    if (P.ind) s += jaNP(P.ind, out, P) + W(out, 'に', '(to)', 'particle に (recipient)');
    if (P.verb === 'like' || P.verb === 'love' && P.obj && !P.obj.pron) {
      if (P.obj) s += jaNP(P.obj, out, P) + W(out, 'が', '', 'particle が (what is liked)');
      s += W(out, (P.verb === 'love' ? '大好き' : '好き') + (P.neg ? (P.tense === 'past' ? 'ではありませんでした' : 'ではありません') : P.tense === 'past' ? 'でした' : 'です'), P.verb, '好き (liked) + です');
      if (P.q) s += W(out, 'か', '?', 'question particle');
      return finish(s + (P.q ? '？' : '。'), out, 'ja');
    }
    if (P.obj) { var on = P.obj.num; if (on) P.obj.num = null; s += jaNP(P.obj, out, P) + W(out, 'を', '', 'object particle を'); if (on) s += W(out, JNUM[on] || String(on), String(on), 'number after the noun and its particle'); }
    var v = P.verb === 'give' ? { e: findEntry('ja', P.ind && /^1/.test(P.ind.pron || '') ? 'くれる' : 'あげる', 'give') } : lookupEn('ja', P.verb, 'v');
    if (v && v.e) {
      var f = P.want ? jaMasu(v.e, 'pres', false).replace(/ます$/, '') + (P.neg ? 'たくないです' : P.tense === 'past' ? 'たかったです' : 'たいです') : P.can ? jaMasu(v.e, 'pres', false).replace(/ます$/, '') + 'ます' : jaMasu(v.e, P.tense, P.neg);
      if (P.can) f = jaWord(v.e) + 'ことが' + (P.neg ? 'できません' : P.tense === 'past' ? 'できました' : 'できます');
      s += W(out, f, (P.want ? 'want ' : P.can ? 'can ' : '') + P.verb, 'verb, polite ' + (P.neg ? 'negative ' : '') + (P.tense === 'past' ? 'past' : 'present/future') + (P.want ? ' + たい (want to)' : P.can ? ' + ことができる (can)' : ''), v.e[2].split('/')[0]);
    } else s += W(out, P.verb, P.verb, 'not found', '', false);
  }
  if (P.q) s += W(out, 'か', '?', 'question particle');
  s += P.q ? '？' : '。';
  return finish(s, out, 'ja');
}

/* ---------------- Korean draft (polite 해요 style) */
var KP = { this: '이것', that: '그것', '1s': '저', '2s': '당신', '3m': '그', '3f': '그녀', '3n': '그것', '1p': '저희', '3p': '그들' };
var KPOSS = { '1s': '제', '2s': '당신의', '3m': '그의', '3f': '그녀의', '3n': '그것의', '1p': '저희', '3p': '그들의' };
var KNUM = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
function hasBatchim(w) { var d = decompose(w.slice(-1)); return d ? d[2] !== 0 : /[0-9]$/.test(w) ? /[0136789]$/.test(w) : false; }
function koP(w, withB, without) { return hasBatchim(w) ? withB : without; }
function koInf(e) { // infinitive (해, 먹어, 가): from Wiktionary, or by rule
  if (e[4]) return e[4];
  var w = e[0].replace(/다$/, ''); if (/하$/.test(w)) return w.slice(0, -1) + '해';
  var d = decompose(w.slice(-1)); if (!d) return w + '어';
  var bright = d[1] === 0 || d[1] === 8;
  if (d[2]) return w + (bright ? '아' : '어');
  if (d[1] === 0 || d[1] === 4) return w; // 가 -> 가, 서 -> 서
  if (d[1] === 8) return w.slice(0, -1) + compose(d[0], 9, 0); // 보 -> 봐
  if (d[1] === 13) return w.slice(0, -1) + compose(d[0], 14, 0); // 주 -> 줘
  if (d[1] === 20) return w.slice(0, -1) + compose(d[0], 6, 0); // 마시 -> 마셔
  if (d[1] === 18) return w.slice(0, -1) + compose(d[0], 4, 0); // 쓰 -> 써
  return w + '어';
}
function koPast(inf) { var d = decompose(inf.slice(-1)); return inf.slice(0, -1) + compose(d[0], d[1], 20) + '어요'; } // 가 -> 갔어요, 먹어 -> 먹었어요
function koVerb(e, tense, neg) {
  var inf = koInf(e), stem = e[0].replace(/다$/, ''), f;
  if (tense === 'past') f = koPast(inf);
  else if (tense === 'fut') { var d = decompose(stem.slice(-1)); f = (d && !d[2] ? stem.slice(0, -1) + compose(d[0], d[1], 8) : d && d[2] === 8 ? stem : stem + '을') + ' 거예요'; }
  else f = inf + '요';
  return (neg ? '안 ' : '') + f;
}
function koAttr(e) { // adjective before a noun: 큰, 작은, 예쁜, 아름다운, 좋은
  var st = e[0].replace(/다$/, ''), d = decompose(st.slice(-1));
  if (/있$|없$/.test(st)) return st + '는';
  if (!d) return st + '은';
  if (!d[2]) return st.slice(0, -1) + compose(d[0], d[1], 4);
  if (d[2] === 8) return st.slice(0, -1) + compose(d[0], d[1], 4);
  if (d[2] === 17 && e[4] && /워$/.test(e[4])) return st.slice(0, -1) + compose(d[0], d[1], 0) + '운';
  return st + '은';
}
function koNP(n, out, P) {
  if (!n) return '';
  if (n.and) return n.and.map(function (x, i) { var t = koNP(x, out, P); return i < n.and.length - 1 ? t + W(out, koP(t, '과', '와'), 'and', 'particle 와/과 (and)') + ' ' : t; }).join('');
  if (n.pron) return W(out, KP[n.pron], n.en, 'pronoun (polite)');
  var s = '';
  if (n.of) s += koNP(n.of, out, P) + W(out, '의', 'of', 'particle 의') + ' ';
  if (n.poss) s += W(out, KPOSS[n.poss], Object.keys(POSS).filter(function (k) { return POSS[k] === n.poss; })[0], 'possessive') + ' ';
  if (n.dem) s += W(out, n.dem === 'this' ? '이' : '그', n.dem, 'demonstrative') + ' ';
  n.adjs.forEach(function (a) { var e = lookupEn('ko', a, 'a'); if (e) s += W(out, e.e[1] === 'n' ? e.e[0] : koAttr(e.e), a, 'adjective before a noun', e.e[3].split('/')[0]) + ' '; else s += W(out, a, a, 'not found', '', false) + ' '; });
  var hd = n.cap ? { e: [EA.hangulBySound(P.orig[n.head] || n.head).text, 'name', '', ''] } : lookupEn('ko', n.head, 'n');
  s += hd ? W(out, hd.e[0], n.head, n.cap ? 'name, by sound' : 'noun', hd.e[3] ? hd.e[3].split('/')[0] : '') : W(out, n.head, n.head, 'not found', '', false);
  if (n.num) s += ' ' + W(out, (KNUM[n.num] || String(n.num)) + ' 개', String(n.num), 'number + counter (개)');
  return s;
}
function draftKo(text) {
  var P = parseEn(text), out = [], parts = [];
  P.time.forEach(function (t) { parts.push(W(out, { today: '오늘', tomorrow: '내일', yesterday: '어제', now: '지금', tonight: '오늘 밤' }[t], t, 'time word')); });
  if (P.subj) { var sj = koNP(P.subj, out, P), also = P.adv.indexOf('also') >= 0 || P.adv.indexOf('too') >= 0; parts.push(sj + W(out, also ? '도' : koP(sj, '은', '는'), '', also ? 'particle 도 (also)' : 'topic particle 은/는')); }
  var pps = P.pps || [];
  if (P.be) {
    var pr = P.pred;
    pps.forEach(function (p) { var t = koNP(p.np, out, P); parts.push(t + W(out, '에', p.p, 'particle 에 (location)')); });
    if (pr && pr.adj) { var a = lookupEn('ko', pr.adj, 'a'); parts.push(a ? W(out, koVerb(a.e, P.tense, P.neg), pr.adj, 'descriptive verb, polite', a.e[3].split('/')[0]) : W(out, pr.adj, pr.adj, 'not found', '', false)); }
    else if (pr && pr.np) { var t2 = koNP(pr.np, out, P); if (P.neg) parts.push(t2 + W(out, koP(t2, '이', '가'), '', 'particle 이/가') + ' ' + W(out, P.tense === 'past' ? '아니었어요' : '아니에요', 'is not', 'negative copula')); else parts.push(t2 + W(out, P.tense === 'past' ? koP(t2, '이었어요', '였어요') : koP(t2, '이에요', '예요'), 'is', 'copula 이에요/예요')); }
    else if (pps.length) parts.push(W(out, P.neg ? '없어요' : P.tense === 'past' ? '있었어요' : '있어요', 'is', '있다 (to be somewhere)'));
  } else if (P.verb) {
    var motion = /^(go|come|return|walk|run|drive|fly|travel)$/.test(P.verb);
    pps.forEach(function (p) { var t = koNP(p.np, out, P), part = { in: motion ? '에' : '에서', at: '에서', on: '에서', to: '에', for: '을 위해', from: '에서', with: '하고', under: ' 밑에서', before: ' 전에', after: ' 후에', by: '로', near: ' 근처에서', about: '에 대해' }[p.p] || '에서'; if (p.p === 'to' && p.np && p.np.pron) part = '에게'; if (p.p === 'for') part = koP(t, '을', '를') + ' 위해'; if (p.p === 'by') part = koP(t, '으로', '로'); parts.push(t + W(out, part, p.p, 'particle ' + part.trim())); });
    if (P.ind) { var ti = koNP(P.ind, out, P); parts.push(ti + W(out, '에게', '(to)', 'particle 에게 (recipient)')); }
    if (P.obj) { var to = koNP(P.obj, out, P); parts.push(to + W(out, koP(to, '을', '를'), '', 'object particle 을/를')); }
    var v = lookupEn('ko', P.verb, 'v');
    if (v) {
      var f = P.want ? v.e[0].replace(/다$/, '') + (P.tense === 'past' ? '고 싶었어요' : '고 싶어요') : P.can ? v.e[0].replace(/다$/, '') + (function (st) { var d = decompose(st.slice(-1)); return d && d[2] && d[2] !== 8 ? '을' : ''; })(v.e[0].replace(/다$/, '')) : koVerb(v.e, P.tense, P.neg && !P.want);
      if (P.can) { var st2 = v.e[0].replace(/다$/, ''), d2 = decompose(st2.slice(-1)); f = (d2 && !d2[2] ? st2.slice(0, -1) + compose(d2[0], d2[1], 8) : d2 && d2[2] === 8 ? st2 : st2 + '을') + ' 수 ' + (P.neg ? '없어요' : P.tense === 'past' ? '있었어요' : '있어요'); }
      if (P.want && P.neg) f = '안 ' + f;
      parts.push(W(out, f, (P.want ? 'want ' : P.can ? 'can ' : '') + P.verb, 'verb, polite ' + (P.neg ? 'negative ' : '') + ({ past: 'past', fut: 'future', pres: 'present' }[P.tense]) + (P.want ? ' + 고 싶다 (want to)' : P.can ? ' + ㄹ 수 있다 (can)' : ''), v.e[3].split('/')[0]));
    } else parts.push(W(out, P.verb, P.verb, 'not found', '', false));
  }
  var s = parts.join(' ').replace(/\s+/g, ' ').trim() + (P.q ? '?' : '.');
  return finish(s, out, 'ko');
}
function finish(s, out, lang) {
  var words = out.filter(function (o) { return o.en && o.en !== '(past)' && o.en !== '?' && o.en !== '(to)'; }), ok = words.filter(function (o) { return o.ok; }).length, snd = words.filter(function (o) { return /by sound/.test(o.how); }).length;
  var conf = words.length ? Math.round((0.25 + 0.6 * ok / words.length - 0.05 * snd) * 100) / 100 : 0.1;
  return { text: s, words: out, confidence: Math.min(0.9, conf), lang: lang };
}
/* everyday expressions are set phrases, not word-for-word sentences */
var PHRASES = {
  'what is the time': ['现在几点？', '今何時ですか？', '지금 몇 시예요?'], 'what time is it': ['现在几点？', '今何時ですか？', '지금 몇 시예요?'], 'what is the time now': ['现在几点？', '今何時ですか？', '지금 몇 시예요?'],
  'hello': ['你好！', 'こんにちは！', '안녕하세요!'], 'hi': ['你好！', 'こんにちは！', '안녕하세요!'], 'good morning': ['早上好！', 'おはようございます！', '좋은 아침이에요!'], 'good afternoon': ['下午好！', 'こんにちは！', '안녕하세요!'], 'good evening': ['晚上好！', 'こんばんは！', '안녕하세요!'], 'good night': ['晚安！', 'おやすみなさい！', '안녕히 주무세요!'],
  'goodbye': ['再见！', 'さようなら！', '안녕히 가세요!'], 'bye': ['再见！', 'さようなら！', '안녕히 가세요!'], 'see you tomorrow': ['明天见！', 'また明日！', '내일 봐요!'], 'see you later': ['回头见！', 'またね！', '나중에 봐요!'],
  'thank you': ['谢谢！', 'ありがとうございます！', '감사합니다!'], 'thanks': ['谢谢！', 'ありがとう！', '고마워요!'], 'thank you very much': ['非常感谢！', 'どうもありがとうございます！', '정말 감사합니다!'], "you're welcome": ['不客气！', 'どういたしまして！', '천만에요!'], 'you are welcome': ['不客气！', 'どういたしまして！', '천만에요!'],
  'sorry': ['对不起！', 'すみません！', '죄송합니다!'], 'i am sorry': ['对不起！', 'ごめんなさい！', '죄송합니다!'], 'excuse me': ['打扰一下！', 'すみません！', '실례합니다!'], 'please': ['请！', 'お願いします！', '부탁합니다!'],
  'how are you': ['你好吗？', 'お元気ですか？', '잘 지내세요?'], 'i am fine': ['我很好。', '元気です。', '잘 지내요.'], 'i am fine thank you': ['我很好，谢谢。', '元気です、ありがとうございます。', '잘 지내요, 감사합니다.'],
  'what is your name': ['你叫什么名字？', 'お名前は何ですか？', '이름이 뭐예요?'], 'nice to meet you': ['很高兴认识你！', 'はじめまして！', '만나서 반가워요!'],
  'i am hungry': ['我饿了。', 'お腹が空きました。', '배고파요.'], 'i am tired': ['我累了。', '疲れました。', '피곤해요.'], 'i do not understand': ['我不明白。', 'わかりません。', '이해가 안 돼요.'], "i don't understand": ['我不明白。', 'わかりません。', '이해가 안 돼요.'],
  'how much is it': ['多少钱？', 'いくらですか？', '얼마예요?'], 'how much is this': ['这个多少钱？', 'これはいくらですか？', '이거 얼마예요?'], 'yes': ['是。', 'はい。', '네.'], 'no': ['不是。', 'いいえ。', '아니요.'],
  'happy birthday': ['生日快乐！', 'お誕生日おめでとうございます！', '생일 축하해요!'], 'happy new year': ['新年快乐！', '明けましておめでとうございます！', '새해 복 많이 받으세요!'], 'merry christmas': ['圣诞快乐！', 'メリークリスマス！', '메리 크리스마스!'], 'welcome': ['欢迎！', 'ようこそ！', '환영합니다!']
};
var LI = { zh: 0, ja: 1, ko: 2 };
function phrase(x, lang) {
  var key = x.toLowerCase().replace(/[^a-z' ]+/g, ' ').replace(/\s+/g, ' ').trim();
  var p = PHRASES[key];
  if (p) return { text: p[LI[lang]], words: [{ t: p[LI[lang]], en: x.trim(), how: 'set phrase (everyday expression)', gloss: '', ok: true }], confidence: 0.9, lang: lang };
  var m = /^my name is ([a-z' -]+)$/.exec(key);
  if (m) { var nm = EA.bySound(m[1].replace(/\b\w/g, function (c) { return c.toUpperCase(); }), lang).text, t = [ '我叫' + nm + '。', '私の名前は' + nm + 'です。', '제 이름은 ' + nm + koP(nm, '이에요', '예요') + '.' ][LI[lang]];
    return { text: t, words: [{ t: t, en: x.trim(), how: 'set phrase + name by sound', gloss: '', ok: true }], confidence: 0.85, lang: lang }; }
  // "where are you from?"
  m = /^where (is|are|was|were) (.+) from$/.exec(key);
  if (m) {
    var out2 = [], P2 = { orig: {} }, n2 = np(m[2].split(' '), P2); if (!n2) return null;
    var t3;
    if (lang === 'zh') t3 = zhNP(n2, out2, P2) + W(out2, '是哪里人', 'where … from', '是哪里人 (where is … from)') + '？';
    else if (lang === 'ja') t3 = jaNP(n2, out2, P2) + W(out2, 'は', '', 'topic particle は') + W(out2, 'どこの出身', 'where … from', 'どこの出身 (from where)') + W(out2, 'ですか', 'is', 'copula + question particle') + '？';
    else { var c3 = koNP(n2, out2, P2); t3 = c3 + W(out2, koP(c3, '은', '는'), '', 'topic particle 은/는') + ' ' + W(out2, '어디에서 왔어요', 'where … from', '어디에서 왔어요 (where did … come from)') + '?'; }
    return finish(t3, out2, lang);
  }
  // question words: "what / who / where / when / how much is X?"
  m = /^(what|who|where|when|how much) (is|are|was|were) (.+)$/.exec(key);
  if (m) {
    var out = [], P = { orig: {} }; x.replace(/[A-Za-z']+/g, function (w) { P.orig[w.toLowerCase()] = w; });
    var n = np(m[3].split(' '), P); if (!n) return null;
    var Q = { what: ['什么', '何', '뭐'], who: ['谁', '誰', '누구'], where: ['在哪里', 'どこ', '어디'], when: ['什么时候', 'いつ', '언제'], 'how much': ['多少钱', 'いくら', '얼마'] }[m[1]], q = Q[LI[lang]], txt;
    if (lang === 'zh') { var a = zhNP(n, out, P); txt = a + (m[1] === 'where' || m[1] === 'how much' ? W(out, q, m[1], 'question word') : W(out, '是', m[2], '是') + W(out, q, m[1], 'question word')) + '？'; }
    else if (lang === 'ja') { var b = jaNP(n, out, P); txt = b + W(out, 'は', '', 'topic particle は') + W(out, q, m[1], 'question word') + W(out, 'ですか', 'is', 'copula + question particle') + '？'; }
    else { var c = koNP(n, out, P); txt = c + W(out, koP(c, '은', '는'), '', 'topic particle 은/는') + ' ' + W(out, q + (q === '누구' || q === '뭐' || q === '어디' || q === '얼마' ? '예요' : '예요'), m[1], 'question word + 예요') + '?'; }
    return finish(txt, out, lang);
  }
  // "what / where / who do you VERB?"
  m = /^(what|where|who|when) (do|does|did) (.+)$/.exec(key);
  if (m) {
    var P3 = parseEn(m[3] + (m[2] === 'did' ? '' : ''), lang); if (!P3.verb || !P3.subj) return null;
    if (m[2] === 'did') P3.tense = 'past';
    var out3 = [], v3 = lookupEn(lang, P3.verb, 'v'); if (!v3) return null;
    var wh = m[1], t4, TW = { zh: { today: '今天', tomorrow: '明天', yesterday: '昨天', now: '现在', tonight: '今晚' }, ja: { today: '今日', tomorrow: '明日', yesterday: '昨日', now: '今', tonight: '今夜' }, ko: { today: '오늘', tomorrow: '내일', yesterday: '어제', now: '지금', tonight: '오늘 밤' } }[lang];
    var tw = P3.time.map(function (t) { return W(out3, TW[t], t, 'time word'); }).join(lang === 'ko' ? ' ' : '');
    if (lang === 'ja' && P3.verb === 'want' && wh === 'what') return finish(tw + jaNP(P3.subj, out3, P3) + W(out3, 'は', '', 'topic particle は') + W(out3, '何が', 'what', 'question word + particle') + W(out3, '欲しいですか', 'want', '欲しい (wanted) + です + question particle') + '？', out3, lang);
    if (lang === 'zh') {
      var zv = W(out3, v3.e[0], P3.verb, 'verb', v3.e[3].split('/')[0]);
      t4 = tw + zhNP(P3.subj, out3, P3) + (wh === 'where' ? W(out3, '在哪里', 'where', 'question word (place before the verb)') + zv : wh === 'when' ? W(out3, '什么时候', 'when', 'question word (time before the verb)') + zv : zv + W(out3, wh === 'what' ? '什么' : '谁', wh, 'question word (in the object position)')) + (P3.tense === 'past' ? W(out3, '了', '(past)', '了 marks a completed action') : '') + '？';
    } else if (lang === 'ja') {
      var motion = /^(go|come|return|walk|run|travel)$/.test(P3.verb), qj = { what: '何を', who: '誰を', where: motion ? 'どこに' : (P3.verb === 'live' ? 'どこに' : 'どこで'), when: 'いつ' }[wh];
      var vj = P3.verb === 'live' ? (P3.tense === 'past' ? '住んでいましたか' : '住んでいますか') : jaMasu(v3.e, P3.tense, false) + 'か';
      t4 = tw + jaNP(P3.subj, out3, P3) + W(out3, 'は', '', 'topic particle は') + W(out3, qj, wh, 'question word + particle') + W(out3, vj, P3.verb, 'verb, polite question', v3.e[2].split('/')[0]) + '？';
    } else {
      var c4 = koNP(P3.subj, out3, P3), motion2 = /^(go|come|return|walk|run|travel)$/.test(P3.verb), qk = { what: '뭘', who: '누구를', where: motion2 || P3.verb === 'live' ? '어디에' : '어디에서', when: '언제' }[wh];
      t4 = (tw ? tw + ' ' : '') + c4 + W(out3, koP(c4, '은', '는'), '', 'topic particle 은/는') + ' ' + W(out3, qk, wh, 'question word + particle') + ' ' + W(out3, koVerb(v3.e, P3.tense, false).replace(/\.$/, ''), P3.verb, 'verb, polite question', v3.e[3].split('/')[0]) + '?';
    }
    return finish(t4, out3, lang);
  }
  return null;
}
/* how sure the draft is: how much of the English it covered, less for question words or prepositions it could not place */
var QW = { what: 1, where: 1, who: 1, when: 1, why: 1, how: 1, which: 1, whose: 1 };
var GRAMMAR = { the: 1, a: 1, an: 1, do: 1, does: 1, did: 1, is: 1, am: 1, are: 1, was: 1, were: 1, to: 1, will: 1, not: 1, "don't": 1, "doesn't": 1, "didn't": 1 };
function judge(r, src) {
  // No made-up percentage: report what can actually be checked.
  var phr = /set phrase/.test((r.words[0] || {}).how || '');
  var toks = src.toLowerCase().replace(/n't\b/g, ' not').match(/[a-z']+/g) || [], used = {};
  r.words.forEach(function (w) { (w.en || '').toLowerCase().split(/[\s…]+/).forEach(function (t) { if (t && w.ok) used[t] = 1; }); });
  var missing = phr ? [] : toks.filter(function (t) { return !GRAMMAR[t] && !used[t] && !used[lemmas(t)[0]] && !(NUMS[t] && used[String(NUMS[t])]); });
  var notFound = r.words.filter(function (w) { return !w.ok; }).map(function (w) { return w.en; });
  var bySound = r.words.filter(function (w) { return /by sound/.test(w.how); }).map(function (w) { return w.en; });
  var P = parseEn(src), pattern;
  if (phr) pattern = 'set phrase';
  else if (r.words.some(function (w) { return /question word|…/.test(w.how + (w.en || '')); })) pattern = 'question with a question word';
  else if (P.be) pattern = P.pred && P.pred.adj ? '"X is ADJECTIVE"' : P.pred ? '"X is Y"' : '"X is (somewhere)"';
  else if (P.verb) pattern = 'subject + verb' + (P.obj ? ' + object' : '') + (P.pps && P.pps.length ? ' + place/person' : '') + (P.q ? ' (yes/no question)' : '');
  else pattern = 'not recognised';
  var badQ = toks.filter(function (t) { return QW[t] && !r.words.some(function (w) { return (/question word/.test(w.how) || /…/.test(w.en || '')) && (w.en || '').indexOf(t) >= 0; }); });
  var last = toks[toks.length - 1], strand = PREPS[last] && !r.words.some(function (w) { return /…/.test(w.en || ''); });
  var problems = [];
  if (badQ.length && !phr) problems.push('the question form ("' + badQ.join(', ') + '") is not handled');
  if (strand) problems.push('the preposition "' + last + '" at the end could not be placed');
  if (pattern === 'not recognised') problems.push('no verb or "is" was found');
  if (toks.length > 12) problems.push('long sentences are not handled reliably');
  r.checks = { pattern: pattern, missing: missing, notFound: notFound, bySound: bySound, problems: problems };
  r.rating = phr ? 'phrase' : problems.length ? 'unusable' : (missing.length || notFound.length) ? 'rough' : 'draft';
  r.warning = problems.length ? 'Not usable: ' + problems.join('; ') + '.' : '';
  r.confidence = { phrase: 0.9, draft: 0.7, rough: 0.4, unusable: 0.1 }[r.rating]; // kept for older callers; the studio shows r.rating and r.checks
  return r;
}
EA.RATING = { phrase: 'Set phrase: the usual expression, not built word by word', draft: 'Rough draft: every word placed in a known pattern, but not checked for natural wording', rough: 'Poor: some English words could not be translated', unusable: 'Not usable' };
/* human translations from Tatoeba with the same English, when there are any */
EA.humanTranslations = function (src, lang) {
  var key = function (t) { return t.toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim(); }, k = key(src), out = [];
  (D.ex[lang] || []).forEach(function (e) { if (out.length < 3 && key(e[1]) === k) out.push(e); });
  return out;
};
EA.translate = function (text, lang) {
  text = text.trim(); if (!text) return { text: '', words: [], confidence: 0 };
  var sents = text.match(/[^.!?]+[.!?]*/g) || [text], rs = sents.map(function (x) { return judge(phrase(x, lang) || (lang === 'ja' ? draftJa(x) : lang === 'ko' ? draftKo(x) : draftZh(x)), x); });
  return { text: rs.map(function (r) { return r.text; }).join(lang === 'ko' ? ' ' : ''), words: [].concat.apply([], rs.map(function (r) { return r.words; })), confidence: rs.reduce(function (a, r) { return Math.min(a, r.confidence); }, 1), warning: rs.map(function (r) { return r.warning; }).filter(Boolean).join(' '),
    rating: ['unusable', 'rough', 'draft', 'phrase'].filter(function (x) { return rs.some(function (r) { return r.rating === x; }); })[0], checks: rs.map(function (r) { return r.checks; }), lang: lang };
};


/* ================================================================ drawing (HarfBuzz) and reading SVG back */
var HB = null, FONTS = {}, GL = null, PATHS = {}, BBOX = {}, DMAP = null;
var LANGS = { 'zh-Hans': { font: 'sc', hb: 'zh-Hans' }, 'zh-Hant': { font: 'tc', hb: 'zh-Hant' }, ja: { font: 'jp', hb: 'ja' }, ko: { font: 'kr', hb: 'ko' } };
var FONT_LANG = { sc: 'zh-Hans', tc: 'zh-Hant', jp: 'ja', kr: 'ko' };
EA.LANGS = LANGS;
EA.verticalMarks = function (t) { return t.replace(/[.,!?:;]/g, function (c) { return FULL[c] === '。' ? '．' : FULL[c]; }).replace(/\u201C/g, '「').replace(/\u201D/g, '」').replace(/\u2018/g, '『').replace(/\u2019/g, '』'); };
EA.setShaper = function (hb) { HB = hb; };
EA.loadGlyphs = function (g) { GL = g; Object.keys(g).forEach(function (k) { GLT[k] = {}; Object.keys(g[k].glyphs).forEach(function (id) { GLT[k][g[k].glyphs[id][0]] = 1; }); }); return true; };
EA.loadFont = function (key, bytes) {
  var blob = HB.createBlob(bytes), face = HB.createFace(blob, 0), font = HB.createFont(face);
  FONTS[key] = { font: font, face: face, blob: blob }; PATHS[key] = {}; BBOX[key] = {}; DMAP = null; return true;
};
EA.THEMES = {
  paper: { bg: '#fbf7ee', ink: '#1f1a14', ruby: '#8a3b2a' },
  ink: { bg: '#f1e9d6', ink: '#1c1c1c', ruby: '#a12d22' },
  slate: { bg: '#e3e6ea', ink: '#14202e', ruby: '#2f5d8a' },
  night: { bg: '#111722', ink: '#f2ead8', ruby: '#e0a458' }
};
function pathOf(key, g) { var c = PATHS[key]; if (c[g] === undefined) c[g] = FONTS[key].font.glyphToPath(g) || ''; return c[g]; }
function bboxOf(key, g) {
  var c = BBOX[key]; if (c[g] !== undefined) return c[g];
  var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  flatten(pathOf(key, g)).forEach(function (p) { p.forEach(function (q) { if (q[0] < x0) x0 = q[0]; if (q[0] > x1) x1 = q[0]; if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1]; }); });
  return (c[g] = x0 > x1 ? null : [x0, y0, x1, y1]);
}
EA.bboxOf = bboxOf; EA.pathOf = function (k, g) { return pathOf(k, g); };
function shapeText(key, text, lang, vertical) {
  var buf = HB.createBuffer(); buf.addText(text); buf.guessSegmentProperties();
  if (lang) buf.setLanguage(lang);
  buf.setDirection(vertical ? 'ttb' : 'ltr');
  HB.shape(FONTS[key].font, buf, /[\u3000-\u9FFF\uAC00-\uD7A3\uFF00-\uFFEF]/.test(text) ? '-kern,-palt,-vpal' : ''); var o = buf.json(); buf.destroy();
  var cps = Array.from(text), offs = [], k = 0; cps.forEach(function (c) { offs.push(k); k += c.length; });
  o.forEach(function (g) { var i = offs.indexOf(g.cl); g.ci = i < 0 ? 0 : i; g.adv = GL[key].glyphs[g.g] ? GL[key].glyphs[g.g][1] : 1000; });
  return o;
}
EA.shape = shapeText;
/* ruby (reading aids) for each character of a text: [{ text, ruby }] runs */
EA.rubyRuns = function (text, lang, kind) {
  var runs = [];
  if (!kind || kind === 'none') return [{ t: text, r: null }];
  if (lang === 'ja' && kind === 'furigana') { EA.tokensJa(text).forEach(function (t) { t.ruby.forEach(function (p) { runs.push({ t: p[0], r: p[1] }); }); }); return runs; }
  if (lang === 'ja' && kind === 'romaji') { EA.tokensJa(text).forEach(function (t) { runs.push({ t: t.s, r: t.r ? EA.romaji(t.r, t.pos === '助詞') : null }); }); return runs; }
  if (lang === 'ko') { text.split(/(\s+)/).forEach(function (w) { if (!w) return; if (/^\s+$/.test(w)) runs.push({ t: w, r: null }); else runs.push({ t: w, r: kind === 'hangul' ? (Array.from(w).some(isHan) ? EA.hanjaToHangul(w) : null) : EA.romanizeKo(EA.hanjaToHangul(w)).replace(/[.,!?]/g, '') }); }); return runs; }
  // Chinese: one syllable over each character
  var simp = lang === 'zh-Hant' ? EA.toSimplified(text) : text, segs = EA.pinyinWords(simp), pos = 0, chars = Array.from(text);
  segs.forEach(function (sg) {
    var n = Array.from(sg.w).length;
    if (!sg.han) { runs.push({ t: chars.slice(pos, pos + n).join(''), r: null }); pos += n; return; }
    var syl = sg.py.split(' ');
    for (var i = 0; i < n; i++) runs.push({ t: chars[pos + i], r: syl[i] ? (kind === 'zhuyin' ? zhuyinSyl(syl[i]) : markSyl(syl[i])) : null });
    pos += n;
  });
  return runs;
};
/* lay out text in lines (or vertical columns, right to left) with optional ruby */
EA.layout = function (text, opts) {
  opts = opts || {};
  var lang = opts.lang || 'zh-Hans', L = LANGS[lang], key = L.font, upm = GL[key].upm, size = opts.size || 44, s = size / upm, vert = !!opts.vertical;
  var rubyScale = 0.42, rk = opts.ruby && opts.ruby !== 'none', margin = Math.round(size * 0.7);
  var W = opts.width || 900, lineGap = size * (rk ? 1.95 : 1.55);
  var paras = text.replace(/\r/g, '').replace(/[\u200B-\u200D\uFEFF]/g, '');
  if (vert) paras = EA.verticalMarks(paras); // vertical text uses full-width marks and corner quotes
  paras = paras.split('\n');
  var cells = []; // {g, adv, run, ch} per glyph, plus breaks
  paras.forEach(function (para, pi) {
    var runs = EA.rubyRuns(para, lang, opts.ruby);
    runs.forEach(function (run, ri) {
      var gs = shapeText(key, run.t, L.hb, vert);
      gs.forEach(function (g, gi) { cells.push({ g: g, run: ri + ':' + pi, r: run.r, first: gi === 0, t: run.t, space: /^\s+$/.test(Array.from(run.t)[g.ci] || '') }); });
    });
    if (pi < paras.length - 1) cells.push({ br: true });
  });
  var maxLen = vert ? (opts.height || 640) - 2 * margin : W - 2 * margin, lines = [[]], cur = 0;
  cells.forEach(function (c, i) {
    if (c.br) { lines.push([]); cur = 0; return; }
    var adv = (vert ? -c.g.ay : c.g.ax) * s;
    if (cur + adv > maxLen && lines[lines.length - 1].length) {
      // Korean and Latin: break at the last space; CJK: anywhere, but keep closing punctuation on the line
      var line = lines[lines.length - 1], cut = -1;
      if (lang === 'ko') for (var k = line.length - 1; k > 0; k--) if (line[k].space) { cut = k; break; }
      if (cut < 0 && /^[，。、！？：；）」』》〉.,!?]$/.test(Array.from(c.t)[c.g.ci] || '')) cut = line.length - 1;
      var moved = cut > 0 ? line.splice(cut) : [];
      moved = moved.filter(function (m) { return !m.space; });
      lines.push(moved); cur = moved.reduce(function (a, m) { return a + (vert ? -m.g.ay : m.g.ax) * s; }, 0);
    }
    if (c.space && !lines[lines.length - 1].length) return;
    lines[lines.length - 1].push(c); cur += adv;
  });
  var out = [], rubyOut = [], nL = Math.max(1, lines.length);
  var longest = lines.reduce(function (a, ln) { return Math.max(a, ln.reduce(function (b, c) { return b + (vert ? -c.g.ay : c.g.ax) * s; }, 0)); }, 0);
  var H = vert ? Math.round(Math.min(opts.height || 640, longest + 2 * margin + size * 0.2)) : Math.round(margin * 2 + lineGap * nL);
  if (vert) W = Math.round(margin * 2 + lineGap * nL);
  lines.forEach(function (ln, li) {
    var pen = 0, base, colX;
    if (!vert) base = margin + lineGap * li + (rk ? size * 0.62 : 0) + size * 0.88;
    else colX = W - margin - lineGap * li - size / 2 - (rk ? size * 0.6 : 0);
    var runStart = {};
    ln.forEach(function (c) {
      var g = c.g, x, y;
      if (!vert) { x = margin + pen + g.dx * s; y = base - g.dy * s; pen += g.ax * s; }
      else { x = colX - g.adv * s / 2 + g.dx * s; y = margin + pen + size * 0.88 - g.dy * s; pen += -g.ay * s; }
      out.push({ key: key, g: g.g, adv: g.adv, x: x, y: y, s: s, line: li, run: c.run, cx: vert ? colX : x + g.adv * s / 2, cy: vert ? y - size * 0.38 : base - size * 0.38 });
      if (c.r) { (runStart[c.run] = runStart[c.run] || { r: c.r, items: [] }).items.push(out[out.length - 1]); }
    });
    Object.keys(runStart).forEach(function (k) {
      var R = runStart[k], it = R.items, rg = shapeText(key, R.r, L.hb, false), rwu = rg.reduce(function (a, g) { return a + g.ax; }, 0);
      var room = it.length * upm * 0.98, rs = s * Math.max(0.27, Math.min(rubyScale, room / Math.max(1, rwu))), rw = rwu * rs;
      if (!vert) {
        var x0 = it[0].x, x1 = it[it.length - 1].x + it[it.length - 1].adv * s, cx = (x0 + x1) / 2, rx = cx - rw / 2, ry = base - size * 1.1;
        rg.forEach(function (g) { rubyOut.push({ key: key, g: g.g, x: rx + g.dx * rs, y: ry - g.dy * rs, s: rs, ruby: true, line: li }); rx += g.ax * rs; });
      } else {
        // vertical: ruby to the right of the column; Latin letters turned sideways, kana and zhuyin one under another
        if (/^[\u0000-\u024F\s]+$/.test(R.r)) {
          var yA = it[0].y - size * 0.88, yB = it[it.length - 1].y + size * 0.12, ryl = (yA + yB) / 2 - rw / 2, rxl = colX + size * 0.74;
          rg.forEach(function (g) { rubyOut.push({ key: key, g: g.g, x: rxl - g.dy * rs, y: ryl + g.dx * rs, s: rs, ruby: true, rot: true, line: li }); ryl += g.ax * rs; });
          return;
        }
        var rv = shapeText(key, R.r, L.hb, true), rh = rv.reduce(function (a, g) { return a - g.ay; }, 0) * rs, y0 = it[0].y - size * 0.88, y1 = it[it.length - 1].y + size * 0.12, ry2 = (y0 + y1) / 2 - rh / 2, rxv = colX + size * 0.62;
        rv.forEach(function (g) { rubyOut.push({ key: key, g: g.g, x: rxv + g.dx * rs, y: ry2 + size * rubyScale * 0.88 - g.dy * rs, s: rs, ruby: true, line: li }); ry2 += -g.ay * rs; });
      }
    });
  });
  return { glyphs: out.concat(rubyOut), W: W, H: H, size: size, lang: lang, vertical: vert };
};
function f6(n) { return Math.round(n * 1e4) / 1e4; }
EA.render = function (text, opts) {
  opts = opts || {}; var th = EA.THEMES[opts.theme || 'paper'], L = EA.layout(text, opts);
  var main = [], ruby = [];
  L.glyphs.forEach(function (g) { var d = pathOf(g.key, g.g); if (!d) return; (g.ruby ? ruby : main).push('<path d="' + d + '" transform="matrix(' + (g.rot ? '0 ' + f6(g.s) + ' ' + f6(g.s) + ' 0 ' : f6(g.s) + ' 0 0 ' + f6(-g.s) + ' ') + f6(g.x) + ' ' + f6(g.y) + ')"/>'); });
  var meta = '<metadata>' + JSON.stringify({ generator: 'East Asian Languages Studio ' + EA.version, author: 'Larry Dalton', lang: L.lang, note: 'provenance only; the reader uses the character outlines' }).replace(/</g, '&lt;') + '</metadata>';
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + L.W + '" height="' + L.H + '" viewBox="0 0 ' + L.W + ' ' + L.H + '">' + meta + '<rect width="' + L.W + '" height="' + L.H + '" fill="' + th.bg + '"/><g fill="' + th.ink + '">' + main.join('') + '</g>' + (ruby.length ? '<g fill="' + th.ruby + '">' + ruby.join('') + '</g>' : '') + '</svg>';
};
function buildDmap() {
  if (DMAP) return DMAP;
  DMAP = {};
  Object.keys(FONTS).forEach(function (key) {
    Object.keys(GL[key].glyphs).forEach(function (g) {
      var d = pathOf(key, +g); if (!d) return;
      var t = GL[key].glyphs[g][0], al = GL[key].glyphs[g][2];
      (DMAP[d] = DMAP[d] || []).push([key, +g, t]);
      if (al) DMAP[d].push([key, +g, al]); // the same drawing also stands for this mark
    });
  });
  return DMAP;
}
/* Read an SVG made by this studio from the character outlines (the metadata is ignored) */
EA.readSVG = function (svg) {
  svg = svg.replace(/<metadata>[\s\S]*?<\/metadata>/g, '');
  var dm = buildDmap(), re = /<path[^>]*?\sd="([^"]+)"[^>]*?transform="matrix\(([^)]+)\)"/g, m, items = [], unknown = 0, votes = {};
  while ((m = re.exec(svg))) {
    var hits = dm[m[1]], t = m[2].split(/[\s,]+/).map(Number);
    if (!hits) { unknown++; continue; }
    hits.forEach(function (h) { votes[h[0]] = (votes[h[0]] || 0) + 1 / hits.length; });
    items.push({ hits: hits, s: Math.hypot(t[0], t[1]), rot: Math.abs(t[1]) > 1e-9, x: t[4], y: t[5] });
  }
  if (!items.length) return { ok: false, reason: unknown ? 'This SVG uses outlines that are not from this studio\'s fonts.' : 'No characters were found in this SVG.' };
  var ranked = Object.keys(votes).sort(function (a, b) { return votes[b] - votes[a]; }), key = ranked[0], lang = FONT_LANG[key], upm = GL[key].upm;
  // Simplified and Traditional fonts draw many characters identically: then the SVG cannot say which was meant
  var ambiguous = ranked.length > 1 && /^(sc|tc)$/.test(ranked[0]) && /^(sc|tc)$/.test(ranked[1]) && Math.abs(votes[ranked[0]] - votes[ranked[1]]) < 1e-6;
  items.forEach(function (it) {
    var mine = it.hits.filter(function (x) { return x[0] === key; }), h = mine[0] || it.hits[0];
    // one drawing used for two marks (Korean '.' and '．'): Korean takes the ASCII mark, Chinese and Japanese the full-width one
    if (/^(sc|tc)$/.test(key) && /^[!-~]$/.test(h[2] || '')) { var wz = it.hits.filter(function (x) { return /^(sc|tc)$/.test(x[0]) && (x[2] || ' ').charCodeAt(0) >= 0x2E80; })[0]; if (wz) mine = [wz].concat(mine); }
    if (mine.length > 1) { var wideFirst = lang !== 'ko'; mine.sort(function (a, b) { var wa = (a[2] || ' ').charCodeAt(0) >= 0x2E80, wb = (b[2] || ' ').charCodeAt(0) >= 0x2E80; return wa === wb ? 0 : (wa === wideFirst ? -1 : 1); }); h = mine[0]; } it.key = h[0]; it.g = h[1]; it.t = h[2]; it.adv = (GL[it.key].glyphs[it.g] || [0, 1000])[1] * it.s; it.em = it.s * upm; });
  var big = Math.max.apply(null, items.map(function (i) { return i.em; })), mains = items.filter(function (i) { return i.em > big * 0.7; }), rubies = items.filter(function (i) { return i.em <= big * 0.7; });
  var size = big, vert = false;
  // vertical text: characters share an x and step down; horizontal: they share a baseline
  var ys = {}; mains.forEach(function (i) { var k = Math.round(i.y / (size * 0.25)); ys[k] = (ys[k] || 0) + 1; });
  var xs = {}; mains.forEach(function (i) { var k = Math.round((i.x + i.adv / 2) / (size * 0.25)); xs[k] = (xs[k] || 0) + 1; });
  if (mains.length > 2 && Object.keys(xs).length < Object.keys(ys).length * 0.6) vert = true;
  var lines = group(mains, vert, size), rlines = group(rubies, vert, size * 0.42);
  var text = lines.map(function (ln) { return joinLine(ln, vert, size); }).join('\n');
  var ruby = rlines.map(function (ln) { return joinLine(ln, vert, size * 0.42); }).join('\n');
  // ruby attached to the characters under it
  var pairs = [];
  rubies.length && mains.forEach(function (mc) { mc.rb = []; });
  rubies.forEach(function (r) { var best = null, bd = 1e9; mains.forEach(function (mc) { var d = vert ? Math.abs((r.y) - (mc.y - size * 0.4)) + Math.abs(r.x - (mc.x + mc.adv)) * 0.3 : Math.abs((r.x + r.adv / 2) - (mc.x + mc.adv / 2)) + Math.abs(r.y - (mc.y - size)) * 0.3; if (d < bd) { bd = d; best = mc; } }); if (best) best.rb.push(r); });
  return finish2({ ok: true, text: text, ruby: ruby, lang: lang, ambiguous: ambiguous, vertical: vert, how: 'svg', confidence: 1, unknown: unknown });
};
function group(list, vert, size) {
  var lines = [];
  list.slice().sort(function (a, b) { return vert ? (b.x - a.x) || (a.y - b.y) : (a.y - b.y) || (a.x - b.x); }).forEach(function (it) {
    var c = it.rot ? it.x + size * 0.3 : vert ? it.x + it.adv / 2 : it.y, ln = null;
    for (var i = 0; i < lines.length; i++) if (Math.abs(lines[i].c - c) < size * 0.45) { ln = lines[i]; break; }
    if (!ln) { ln = { c: c, items: [] }; lines.push(ln); }
    ln.items.push(it);
  });
  lines.sort(function (a, b) { return vert ? b.c - a.c : a.c - b.c; });
  return lines.map(function (l) { return l.items.sort(function (a, b) { return vert ? a.y - b.y : a.x - b.x; }); });
}
function joinLine(ln, vert, size) {
  var out = '';
  ln.forEach(function (it, i) {
    if (i) { var p = ln[i - 1], gap = it.rot ? it.y - (p.y + p.adv) : vert ? (it.y - size * 0.88) - (p.y + size * 0.12) : it.x - (p.x + p.adv); if (gap > size * 0.18) out += ' '; }
    out += it.t;
  });
  return out;
}
function normPunct(text, lang) { // some punctuation marks share one drawing: Korean uses ASCII marks, Chinese and Japanese full-width ones
  var ch = Array.from(text);
  return ch.map(function (c, i) { if (lang === 'ko') return HALF[c] || c; if (FULL[c] && (isHan(ch[i - 1] || '') || isKana(ch[i - 1] || ''))) return FULL[c]; return c; }).join('');
}
EA.normPunct = normPunct;
function finish2(r) {
  if (!r.ok) return r;
  if (r.lang === 'ko') r.text = r.text.replace(/[，．！？：；]/g, function (c) { return HALF[c]; });

  if (/^zh/.test(r.lang)) r.text = r.text.replace(/\u30FB/g, '\u00B7'); else if (r.lang === 'ja') r.text = r.text.replace(/\u00B7/g, '\u30FB');
  if (r.lang === 'ja') { r.reading = EA.romajiText(r.text); r.furigana = EA.furigana(r.text); }
  else if (r.lang === 'ko') r.reading = EA.romanizeKo(EA.hanjaToHangul(r.text));
  else r.reading = EA.pinyin(r.lang === 'zh-Hant' ? EA.toSimplified(r.text) : r.text);
  return r;
}
EA.finishRead = finish2;
/* outlines -> polygons */
function flatten(d) {
  var polys = [], cur = [], x = 0, y = 0, tok = d.match(/[MLQCZ]|-?\d*\.?\d+(?:e-?\d+)?/gi) || [], i = 0, cmd = '';
  function num() { return parseFloat(tok[i++]); }
  while (i < tok.length) {
    if (/[MLQCZ]/i.test(tok[i])) cmd = tok[i++].toUpperCase();
    if (cmd === 'M') { if (cur.length) polys.push(cur); x = num(); y = num(); cur = [[x, y]]; cmd = 'L'; }
    else if (cmd === 'L') { x = num(); y = num(); cur.push([x, y]); }
    else if (cmd === 'Q') { var qx = num(), qy = num(), ex = num(), ey = num(); for (var k = 1; k <= 6; k++) { var t = k / 6, mt = 1 - t; cur.push([mt * mt * x + 2 * mt * t * qx + t * t * ex, mt * mt * y + 2 * mt * t * qy + t * t * ey]); } x = ex; y = ey; }
    else if (cmd === 'C') { var c1x = num(), c1y = num(), c2x = num(), c2y = num(), ex2 = num(), ey2 = num(); for (var k2 = 1; k2 <= 8; k2++) { var u = k2 / 8, mu = 1 - u; cur.push([mu * mu * mu * x + 3 * mu * mu * u * c1x + 3 * mu * u * u * c2x + u * u * u * ex2, mu * mu * mu * y + 3 * mu * mu * u * c1y + 3 * mu * u * u * c2y + u * u * u * ey2]); } x = ex2; y = ey2; }
    else if (cmd === 'Z') { if (cur.length) polys.push(cur); cur = []; cmd = ''; }
    else i++;
  }
  if (cur.length) polys.push(cur);
  return polys;
}
EA.flatten = flatten;
function rasterInto(img, W, H, polys) {
  var y0 = H, y1 = 0;
  polys.forEach(function (p) { p.forEach(function (q) { if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1]; }); });
  y0 = Math.max(0, Math.floor(y0)); y1 = Math.min(H - 1, Math.ceil(y1));
  for (var yy = y0; yy <= y1; yy++) {
    var sy = yy + 0.5, xs = [];
    polys.forEach(function (p) { for (var k = 0; k < p.length; k++) { var a = p[k], b = p[(k + 1) % p.length]; if ((a[1] <= sy) !== (b[1] <= sy)) xs.push({ x: a[0] + (sy - a[1]) / (b[1] - a[1]) * (b[0] - a[0]), w: b[1] > a[1] ? 1 : -1 }); } });
    xs.sort(function (a, b) { return a.x - b.x; });
    var wind = 0;
    for (var q = 0; q < xs.length - 1; q++) { wind += xs[q].w; if (wind !== 0) { var xa = Math.max(0, Math.ceil(xs[q].x - 0.5)), xb = Math.min(W - 1, Math.floor(xs[q + 1].x - 0.5)); for (var xx = xa; xx <= xb; xx++) img[yy * W + xx] = 1; } }
  }
}
EA.rasterInto = rasterInto;
EA.renderMask = function (text, opts) {
  var L = EA.layout(text, opts), W = L.W, H = L.H, img = new Uint8Array(W * H);
  L.glyphs.forEach(function (g) { var d = pathOf(g.key, g.g); if (!d) return; rasterInto(img, W, H, flatten(d).map(function (p) { return p.map(function (q) { return g.rot ? [g.x + q[1] * g.s, g.y + q[0] * g.s] : [g.x + q[0] * g.s, g.y - q[1] * g.s]; }); })); });
  return { W: W, H: H, data: img };
};


/* ================================================================ reading PNG/JPEG images */
var FG = 16, FR = 32; // feature grid (search) and refine grid
var TDB = {};          // per font: { n, chars[], geo Float32Array(n*4), f Uint8Array(n*256), c Uint8Array(n*64), gid[] }
/* load a template file built by tools/build_templates.js: meta {chars, gids, geo} + binary features */
EA.loadTemplates = function (key, meta, bytes) {
  var n = meta.chars.length, f = new Uint8Array(bytes), c = new Uint8Array(n * 64);
  // characters the reader does not offer: compatibility jamo, small katakana extensions, half-width forms
  var skip = meta.chars.map(function (ch) { var o = ch.codePointAt(0); return (o >= 0x3131 && o <= 0x318E) || (o >= 0x3099 && o <= 0x309C) || o === 0x309B || (o >= 0x31F0 && o <= 0x31FF) || (o >= 0xFF61 && o <= 0xFFDC) || (o >= 0x2E80 && o <= 0x2FDF) || (o >= 0xF900 && o <= 0xFAFF); });
  for (var i = 0; i < n; i++) for (var y = 0; y < 8; y++) for (var x = 0; x < 8; x++) {
    var o = i * 256, a = f[o + (2 * y) * 16 + 2 * x] + f[o + (2 * y) * 16 + 2 * x + 1] + f[o + (2 * y + 1) * 16 + 2 * x] + f[o + (2 * y + 1) * 16 + 2 * x + 1];
    c[i * 64 + y * 8 + x] = a >> 2;
  }
  var hasV = {}; (meta.vert || []).forEach(function (v, i) { if (v) hasV[meta.chars[i]] = 1; });
  TDB[key] = { n: n, chars: meta.chars, gids: meta.gids, vert: meta.vert || [], hasV: hasV, skip: skip, freq: meta.freq || [], geo: new Float32Array(meta.geo), f: f, c: c };
  return n;
};
/* aspect-preserving fit of a set of ink samples into a g x g grid (values 0..255) */
function fitGrid(get, x0, y0, x1, y1, g) {
  var w = x1 - x0, h = y1 - y0, side = Math.max(w, h), ox = x0 - (side - w) / 2, oy = y0 - (side - h) / 2, out = new Uint8Array(g * g), cell = side / g;
  var sub = Math.max(1, Math.min(4, Math.ceil(4 / Math.max(0.25, cell))));
  for (var gy = 0; gy < g; gy++) for (var gx = 0; gx < g; gx++) {
    var acc = 0, n = 0;
    for (var sy = 0; sy < sub; sy++) for (var sx = 0; sx < sub; sx++) {
      var px = ox + (gx + (sx + 0.5) / sub) * cell, py = oy + (gy + (sy + 0.5) / sub) * cell; acc += get(px, py); n++;
    }
    out[gy * g + gx] = Math.round(acc / n * 255);
  }
  return out;
}
/* features of a glyph outline (used to build the templates, and to refine matches at run time) */
var GCACHE = {};
function glyphGrid(key, gid, g) {
  var ck = key + gid + ':' + g; if (GCACHE[ck]) return GCACHE[ck];
  var bb = bboxOf(key, gid); if (!bb) return null;
  var R = 96, side = Math.max(bb[2] - bb[0], bb[3] - bb[1]) || 1, sc = R / side, W = Math.ceil((bb[2] - bb[0]) * sc) + 2, H = Math.ceil((bb[3] - bb[1]) * sc) + 2, img = new Uint8Array(W * H);
  rasterInto(img, W, H, flatten(pathOf(key, gid)).map(function (p) { return p.map(function (q) { return [(q[0] - bb[0]) * sc + 1, (bb[3] - q[1]) * sc + 1]; }); }));
  var out = fitGrid(function (x, y) { var xi = Math.floor(x), yi = Math.floor(y); return xi >= 0 && yi >= 0 && xi < W && yi < H ? img[yi * W + xi] : 0; }, 1, 1, W - 1, H - 1, g);
  return (GCACHE[ck] = out);
}
EA.glyphGrid = glyphGrid;
/* geometry of a glyph in em units: width, height, centre x from pen, centre y from the em-box centre */
function glyphGeo(key, gid) {
  var bb = bboxOf(key, gid), u = GL[key].upm; if (!bb) return null;
  return [(bb[2] - bb[0]) / u, (bb[3] - bb[1]) / u, ((bb[0] + bb[2]) / 2) / u - 0.5, ((bb[1] + bb[3]) / 2) / u - 0.38];
}
EA.glyphGeo = glyphGeo;
function inkMask(id) { // ImageData -> ink mask (background = most common colour)
  var W = id.width, H = id.height, d = id.data, hist = {}, best = 0, bg = 0;
  for (var i = 0; i < W * H; i += 7) { var k = ((d[i * 4] >> 4) << 8) | ((d[i * 4 + 1] >> 4) << 4) | (d[i * 4 + 2] >> 4); hist[k] = (hist[k] || 0) + 1; if (hist[k] > best) { best = hist[k]; bg = k; } }
  var br = ((bg >> 8) << 4) + 8, bgc = (((bg >> 4) & 15) << 4) + 8, bb = ((bg & 15) << 4) + 8, far = 0;
  for (var j = 0; j < W * H; j++) { var dr = d[j * 4] - br, dg = d[j * 4 + 1] - bgc, db = d[j * 4 + 2] - bb, dist = Math.sqrt(dr * dr + dg * dg + db * db); if (dist > far) far = dist; }
  var thr = Math.max(40, far * 0.45), m = new Uint8Array(W * H), v = new Float32Array(W * H), ink = 0;
  for (var q = 0; q < W * H; q++) {
    var er = d[q * 4] - br, eg = d[q * 4 + 1] - bgc, eb = d[q * 4 + 2] - bb, dd = Math.sqrt(er * er + eg * eg + eb * eb);
    v[q] = Math.max(0, Math.min(1, (dd - far * 0.15) / (far * 0.7))); // how much ink, for anti-aliased edges
    if (dd > thr && d[q * 4 + 3] > 64) { m[q] = 1; ink++; }
  }
  return { W: W, H: H, data: m, val: v, ink: ink / (W * H) };
}
function bands(prof, minGap) { // runs of non-zero entries, joined across gaps shorter than minGap
  var out = [], s = -1, last = -1;
  for (var i = 0; i < prof.length; i++) {
    if (prof[i]) { if (s < 0) s = i; else if (i - last - 1 > minGap) { out.push([s, last]); s = i; } last = i; }
  }
  if (s >= 0) out.push([s, last]);
  return out;
}
function median(a) { if (!a.length) return 0; var b = a.slice().sort(function (x, y) { return x - y; }); return b[b.length >> 1]; }
/* nearest templates for one ink box: coarse 8x8 pass, then the full 16x16 grid and the box shape */
function nearest(T, grid, geo, k, horiz) {
  var c8 = new Uint8Array(64);
  for (var y = 0; y < 8; y++) for (var x = 0; x < 8; x++) c8[y * 8 + x] = (grid[(2 * y) * 16 + 2 * x] + grid[(2 * y) * 16 + 2 * x + 1] + grid[(2 * y + 1) * 16 + 2 * x] + grid[(2 * y + 1) * 16 + 2 * x + 1]) >> 2;
  var n = T.n, coarse = new Float32Array(n), i, j;
  var wy = horiz ? 0.5 : 0;
  for (i = 0; i < n; i++) {
    if (T.skip[i] || (T.vert[i] ? horiz : (!horiz && T.hasV[T.chars[i]]))) { coarse[i] = 1e9; continue; }
    var o = i * 64, d = 0; for (j = 0; j < 64; j++) { var e = T.c[o + j] - c8[j]; d += e * e; }
    var gw = T.geo[i * 4] - geo[0], gh = T.geo[i * 4 + 1] - geo[1], gy = T.geo[i * 4 + 3] - geo[3];
    coarse[i] = d / (64 * 65025) + (gw * gw + gh * gh) * 0.6 + gy * gy * wy;
  }
  var idx = []; for (i = 0; i < n; i++) idx.push(i);
  idx.sort(function (a, b) { return coarse[a] - coarse[b]; });
  var cand = idx.slice(0, 160).map(function (i2) {
    var o = i2 * 256, d = 0; for (var q = 0; q < 256; q++) { var e = T.f[o + q] - grid[q]; d += e * e; }
    var gw = T.geo[i2 * 4] - geo[0], gh = T.geo[i2 * 4 + 1] - geo[1], gy = T.geo[i2 * 4 + 3] - geo[3];
    return { i: i2, d: d / (256 * 65025) + (gw * gw + gh * gh) * 0.6 + gy * gy * wy };
  });
  cand.sort(function (a, b) { return a.d - b.d; });
  return cand.slice(0, k);
}
function simGrid(a, b) { // overlap of the two drawings, plus overlap of their solid parts (sharper for small differences)
  var num = 0, den = 0, bi = 0, bu = 0;
  for (var i = 0; i < a.length; i++) { num += Math.min(a[i], b[i]); den += Math.max(a[i], b[i]); var A = a[i] >= 128, B = b[i] >= 128; if (A && B) bi++; if (A || B) bu++; }
  return (den ? num / den : 0) * 0.5 + (bu ? bi / bu : 0) * 0.5;
}
/* recognise one ink box: returns { ch, score, alt } */
function recognise(T, key, M, x0, y0, x1, y1, em, cyRef, horiz) {
  var V = M.val || M.data, get = function (x, y) { var xi = Math.floor(x), yi = Math.floor(y); return xi >= x0 && yi >= y0 && xi <= x1 && yi <= y1 ? V[yi * M.W + xi] : 0; };
  var fr = key === 'kr' ? 48 : FR; // Hangul vowels differ by a short stroke: compare Korean at a finer grid
  var g16 = fitGrid(get, x0, y0, x1 + 1, y1 + 1, FG), g32 = fitGrid(get, x0, y0, x1 + 1, y1 + 1, fr);
  var geo = [(x1 - x0 + 1) / em, (y1 - y0 + 1) / em, 0, horiz ? (cyRef - (y0 + y1 + 1) / 2) / em : 0];
  var near = nearest(T, g16, geo, 14, horiz), dmin = near.length ? near[0].d : 0;
  var scored = near.map(function (c) {
    var tg = glyphGrid(key, T.gids[c.i], fr), s = tg ? simGrid(tg, g32) : 0, gw = T.geo[c.i * 4] - geo[0], gh = T.geo[c.i * 4 + 1] - geo[1], gy = T.geo[c.i * 4 + 3] - geo[3];
    // a small preference for common characters decides near ties (e.g. 는 and 논 at small sizes)
    return { ch: T.chars[c.i], gid: T.gids[c.i], score: s - gw * gw * 2.5 - gh * gh * 6 - (horiz ? gy * gy * 4 : 0) - 2.5 * (c.d - dmin) + (key === 'kr' ? 0.008 : 0.018) * (T.freq[c.i] || 0) - 0.045 };
  }).sort(function (a, b) { return b.score - a.score; });
  return { ch: scored[0].ch, score: scored[0].score, alt: scored.slice(1, 5).map(function (x) { return [x.ch, x.score]; }), gap: scored.length > 1 ? scored[0].score - scored[1].score : 1 };
}
/* split a text line into characters: ink runs along the line are joined into characters of up to about one em,
   choosing the joins whose matches score best */
function readLine(T, key, M, band, horiz, em) {
  var a0 = band[0], a1 = band[1], len = horiz ? M.W : M.H, prof = new Int32Array(len);
  for (var a = a0; a <= a1; a++) for (var b = 0; b < len; b++) { if (horiz ? M.data[a * M.W + b] : M.data[b * M.W + a]) prof[b]++; }
  var runs = bands(prof, 0);
  if (!runs.length) return { text: '', scores: [] };
  // runs wider than a character (touching characters) are cut at the faintest column near each em step
  var split = [];
  runs.forEach(function (r) {
    var s0 = r[0];
    while (r[1] - s0 + 1 > em * 1.08) {
      var lo = Math.round(s0 + em * 0.55), hi = Math.min(r[1] - 2, Math.round(s0 + em * 1.08)), cut = lo, mv = 1e9;
      for (var c = lo; c <= hi; c++) if (prof[c] < mv) { mv = prof[c]; cut = c; }
      split.push([s0, cut]); s0 = cut + 1;
    }
    split.push([s0, r[1]]);
  });
  runs = split;
  var lineC = (a0 + a1) / 2;
  // centre of the em box: the middle of the full-height characters in this line
  var cache = {}, box = function (i, j) {
    var k = i + ':' + j; if (cache[k]) return cache[k];
    var s0 = runs[i][0], s1 = runs[j][1], m0 = 1e9, m1 = -1;
    for (var p = s0; p <= s1; p++) for (var q = a0; q <= a1; q++) { var on = horiz ? M.data[q * M.W + p] : M.data[p * M.W + q]; if (on) { if (q < m0) m0 = q; if (q > m1) m1 = q; } }
    return (cache[k] = { s0: s0, s1: s1, m0: m0, m1: m1 });
  };
  var cyRef = lineC;
  var tall = []; for (var r = 0; r < runs.length; r++) { var bx = box(r, r); if (bx.m1 - bx.m0 > em * 0.7) tall.push((bx.m0 + bx.m1) / 2); }
  if (tall.length) cyRef = median(tall);
  var rec = {}, recOf = function (i, j) {
    var k = i + ':' + j; if (rec[k]) return rec[k];
    var bx = box(i, j);
    var r2 = horiz ? recognise(T, key, M, bx.s0, bx.m0, bx.s1, bx.m1, em, cyRef, true) : recognise(T, key, M, bx.m0, bx.s0, bx.m1, bx.s1, em, cyRef, false);
    return (rec[k] = r2);
  };
  // dynamic programme over runs
  var n = runs.length, best = new Float64Array(n + 1).fill(-1e9), from = new Int32Array(n + 1);
  best[0] = 0;
  for (var e = 1; e <= n; e++) {
    for (var st = e - 1; st >= 0; st--) {
      var w = runs[e - 1][1] - runs[st][0] + 1;
      if (w > em * 1.03 + 2 && st < e - 1) break;
      var rr = recOf(st, e - 1), val = best[st] + rr.score * Math.max(w, em * 0.2) / em - 0.1;
      if (val > best[e]) { best[e] = val; from[e] = st; }
    }
  }
  var segs = [], at = n; while (at > 0) { segs.unshift([from[at], at - 1]); at = from[at]; }
  var text = '', scores = [], prevEnd = null, items = [];
  segs.forEach(function (sg) {
    var r3 = recOf(sg[0], sg[1]), s0 = runs[sg[0]][0];
    if (prevEnd !== null && s0 - prevEnd > em * 0.32 && key === 'kr') { text += ' '; items.push({ ch: ' ', alt: [], score: 1 }); }
    text += r3.ch; scores.push(r3.score); prevEnd = runs[sg[1]][1]; items.push({ ch: r3.ch, alt: r3.alt, score: r3.score });
  });
  return { text: text, scores: scores, n: segs.length, items: items };
}
/* near ties are settled by the dictionary: keep the candidate that makes a known word with its neighbours */
function repair(items, lang) {
  var n = 0, has = function (w) { return lang === 'ko' ? false : /^zh/.test(lang) ? !!(D.zhIdx && D.zhIdx[lang === 'zh-Hant' ? EA.toSimplified(w) : w]) || !!(D.zhIdx && D.zhIdx[w]) : !!(D.jaIdx && D.jaIdx[w]); };
  items.forEach(function (it, i) {
    var cands = [[it.ch, it.score]].concat((it.alt || []).filter(function (a) { return a[1] > it.score - 0.06; }));
    if (cands.length < 2) return;
    var best = it.ch, bs = -1;
    cands.forEach(function (c, ci) {
      var sc = 0;
      if (lang === 'ko') {
        var a = i, b = i; while (a > 0 && items[a - 1].ch !== ' ') a--; while (b < items.length - 1 && items[b + 1].ch !== ' ') b++;
        var tok = items.slice(a, b + 1).map(function (x, k) { return a + k === i ? c[0] : x.ch; }).join('').replace(/[.,!?]/g, ''), kw = EA.koWord(tok);
        sc = kw.e ? Array.from(kw.stem).length * 2 + (!kw.rest || KO_PART.indexOf(kw.rest) >= 0 || /요$|다$|어$|고$|서$/.test(kw.rest) ? 3 : 0) - (kw.stem.length < tok.length && !kw.rest ? 2 : 0) : 0;
        if (ci > 0 && c[1] < it.score - 0.025) sc -= 100; // Korean: only near-exact ties (names such as 톰 are not in the dictionary)
      } else {
        var p1 = items[i - 1] ? items[i - 1].ch : '', p2 = items[i - 2] ? items[i - 2].ch : '', n1 = items[i + 1] ? items[i + 1].ch : '', n2 = items[i + 2] ? items[i + 2].ch : '';
        sc = (has(p1 + c[0]) ? 2 : 0) + (has(c[0] + n1) ? 2 : 0) + (has(p2 + p1 + c[0]) ? 3 : 0) + (has(c[0] + n1 + n2) ? 3 : 0) + (has(p1 + c[0] + n1) ? 3 : 0);
      }
      sc -= ci * 0.5; // the shape match still counts
      if (sc > bs) { bs = sc; best = c[0]; }
    });
    if (best !== it.ch) { it.ch = best; n++; }
  });
  return n;
}
/* script context: katakana look-alikes of kanji, small kana */
var KATA_LIKE = { '一': 'ー', '口': 'ロ', '工': 'エ', '力': 'カ', '二': 'ニ', '八': 'ハ', '夕': 'タ', '卜': 'ト', '才': 'オ', '千': 'チ', '三': 'ミ' };
var HIRA_KATA = { 'へ': 'ヘ', 'べ': 'ベ', 'ぺ': 'ペ' };
var FULL = { ',': '，', '.': '。', '!': '！', '?': '？', ':': '：', ';': '；', '(': '（', ')': '）' }, HALF = { '，': ',', '．': '.', '！': '!', '？': '?', '：': ':', '；': ';', '（': '(', '）': ')' };
var KANJI_LIKE = {}; Object.keys(KATA_LIKE).forEach(function (k) { KANJI_LIKE[KATA_LIKE[k]] = k; });
function contextFix(text, lang) {
  var ch = Array.from(text);
  // punctuation: full-width in Chinese and Japanese, ASCII in Korean
  ch = ch.map(function (c, i) { if (lang === 'ko') return HALF[c] || c; return c; });
  if (lang !== 'ko') ch = ch.map(function (c, i) { return /[º˚゜°]/.test(c) && (isHan(ch[i - 1] || '') || isKana(ch[i - 1] || '')) && (i === ch.length - 1 || /[\s\n]/.test(ch[i + 1])) ? '。' : c; });
  // a long dash between Chinese characters is the character 一 (one)
  if (lang !== 'ko') ch = ch.map(function (c, i) { return /[―—－‐ー]/.test(c) && (isHan(ch[i - 1] || '') || isHan(ch[i + 1] || '')) && !(lang === 'ja' && (/[\u30A0-\u30FF]/.test(ch[i - 1] || ''))) ? '一' : c; });
  if (lang !== 'ja') return ch.join('');
  for (var h = 0; h < ch.length; h++) {
    var hk = HIRA_KATA[ch[h]] || null, kh = null; Object.keys(HIRA_KATA).forEach(function (k) { if (HIRA_KATA[k] === ch[h]) kh = k; });
    var isK = function (c) { return /[\u30A1-\u30FA\u30FC]/.test(c || ''); }, isH = function (c) { return /[\u3041-\u3096]/.test(c || ''); };
    if (hk && (isK(ch[h + 1]) || isK(ch[h - 1]) && !isH(ch[h + 1]) && !isHan(ch[h + 1] || '') && !isH(ch[h - 1]))) ch[h] = hk;
    if (kh && !(isK(ch[h + 1]) || isK(ch[h - 1]) && !isH(ch[h + 1]) && !isHan(ch[h + 1] || ''))) ch[h] = kh;
  }
  for (var i = 0; i < ch.length; i++) {
    var prev = ch[i - 1] || '', next = ch[i + 1] || '', kata = function (c) { return /[ァ-ヺー]/.test(c) && !KANJI_LIKE[c]; }, han = function (c) { return isHan(c) && !KATA_LIKE[c]; };
    if (KATA_LIKE[ch[i]] && (kata(prev) || kata(next)) && !(han(prev) || han(next))) ch[i] = KATA_LIKE[ch[i]];
    else if (KANJI_LIKE[ch[i]] && (han(prev) || han(next)) && !(kata(prev) || kata(next))) ch[i] = KANJI_LIKE[ch[i]];
  }
  return ch.join('');
}
/* read an image of text written in this studio's fonts */
EA.readImage = function (id, lang) {
  var t0 = Date.now(), M = inkMask(id);
  if (M.ink > 0.35) return { ok: false, reason: 'Too much of the image is ink for written text (it looks like a photograph or texture).' };
  if (M.ink < 0.0005) return { ok: false, reason: 'No writing was found in this image.' };
  var rows = new Int32Array(M.H), cols = new Int32Array(M.W);
  for (var y = 0; y < M.H; y++) for (var x = 0; x < M.W; x++) if (M.data[y * M.W + x]) { rows[y]++; cols[x]++; }
  var rb = bands(rows, 2).filter(function (b) { return b[1] - b[0] >= 3; }), cb = bands(cols, 2).filter(function (b) { return b[1] - b[0] >= 3; });
  // horizontal text has few row bands (lines) and many column bands (characters); vertical text the reverse
  var horiz = rb.length < cb.length;
  if (rb.length === cb.length) { var ix0 = cb[0][0], ix1 = cb[cb.length - 1][1], iy0 = rb[0][0], iy1 = rb[rb.length - 1][1]; horiz = (ix1 - ix0) >= (iy1 - iy0); }
  var lines = horiz ? rb : cb.slice().reverse();
  var th = lines.map(function (b) { return b[1] - b[0] + 1; }), big = Math.max.apply(null, th);
  var mainT = median(th.filter(function (t) { return t > big * 0.62; }));
  // a character with a gap down its middle (い, 川, 八) splits its line into two thin bands: join them back
  for (var li = 0; li < lines.length - 1; li++) {
    var A = lines[li], Bn = lines[li + 1], lo = Math.min(A[0], Bn[0]), hi = Math.max(A[1], Bn[1]);
    if (A[1] - A[0] + 1 < mainT * 0.9 && Bn[1] - Bn[0] + 1 < mainT * 0.9 && hi - lo + 1 <= mainT * 1.08) { lines.splice(li, 2, [lo, hi]); li--; }
  }
  // ruby (reading aids) are thin bands right next to a line of text; a short last line is still text
  var isRuby = function (b) { if (b[1] - b[0] + 1 > mainT * 0.64) return false; return lines.some(function (o) { return o !== b && o[1] - o[0] + 1 > mainT * 0.62 && Math.min(Math.abs(o[0] - b[1]), Math.abs(b[0] - o[1])) < mainT * 0.45; }); };
  var main = lines.filter(function (b) { return !isRuby(b); }), rubyLines = lines.length - main.length;
  // a band thicker than one line holds two lines that touch: split it at its thinnest point
  var em = mainT / 0.98;
  var keys = lang && lang !== 'auto' ? [LANGS[lang].font] : Object.keys(TDB);
  keys = keys.filter(function (k) { return TDB[k] && FONTS[k]; });
  if (!keys.length) return { ok: false, reason: 'Character templates are not loaded.' };
  var key = keys[0];
  if (keys.length > 1) { // choose the font from the first line
    var votes = {}, first = main[0];
    keys.forEach(function (k) { var r = readLine(TDB[k], k, M, first, horiz, em); var sc = r.scores.length ? r.scores.reduce(function (a, b) { return a + b; }, 0) / r.scores.length : 0; votes[k] = sc + (k === 'kr' && /[가-힣]/.test(r.text) ? 0.05 : 0) + (k === 'jp' && /[぀-ヿ]/.test(r.text) ? 0.04 : 0); });
    key = Object.keys(votes).sort(function (a, b) { return votes[b] - votes[a]; })[0];
  }
  var T = TDB[key], out = [], all = [];
  var lng0 = FONT_LANG[key], fixed = 0;
  EA._lastItems = [];
  main.forEach(function (b) { var r = readLine(T, key, M, b, horiz, em); EA._lastItems.push(r.items.map(function (it) { return it.ch + '(' + it.score.toFixed(3) + ':' + it.alt.slice(0, 2).map(function (a) { return a[0] + a[1].toFixed(3); }).join(',') + ')'; }).join(' ')); fixed += repair(r.items, lng0); out.push(r.items.map(function (it) { return it.ch; }).join('')); all = all.concat(r.scores); });
  var conf = all.length ? all.reduce(function (a, b) { return a + b; }, 0) / all.length : 0, low = all.filter(function (s) { return s < 0.62; }).length;
  if (conf < 0.6) return { ok: false, reason: 'The shapes do not match the studio\'s Chinese, Japanese or Korean characters closely enough (' + Math.round(conf * 100) + '%).', confidence: conf };
  var lng = FONT_LANG[key], text = contextFix(out.join('\n'), lng);
  if (!horiz && lng !== 'ko') text = text.replace(/[.,!?:;]/g, function (c) { return FULL[c] === '。' ? '。' : FULL[c]; }); // vertical text is set with full-width marks
  var cjk = Array.from(text).filter(function (c) { return isHan(c) || isKana(c) || isHangul(c); }).length, visible = Array.from(text.replace(/\s/g, '')).length;
  if (cjk < visible * 0.5) return { ok: false, reason: 'No Chinese, Japanese or Korean writing was found (the shapes look like ' + (/[A-Za-z\uFF21-\uFF5A]/.test(text) ? 'Latin letters' : 'other symbols') + ').', confidence: conf };
  return finish2({ ok: true, text: text, lang: lng, vertical: !horiz, how: 'image', confidence: Math.round(conf * 100) / 100, uncertain: low, rubyLines: rubyLines, ms: Date.now() - t0 });
};
EA._inkMask = inkMask; EA._TDB = TDB; EA._recognise = recognise; EA._nearest = nearest; EA._readLine = readLine; EA._bands = bands; EA._fitGrid = fitGrid;

if (typeof module !== 'undefined' && module.exports) module.exports = EA; else root.EA = EA;
EA._D = D; EA._internal = { isHan: isHan, decompose: decompose, compose: compose, kata2hira: kata2hira, hira2kata: hira2kata, zhBest: zhBest, koEntries: koEntries, jaEntries: jaEntries };
})(typeof window !== 'undefined' ? window : this);
