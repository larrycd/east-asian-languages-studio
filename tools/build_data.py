# East Asian Languages Studio - data build (by Larry Dalton)
# Usage: python3 -I build_data.py <src dir> <dl dir> <work dir> <app data dir>
# Builds compact JSON for Mandarin (CC-CEDICT), Japanese (JMdict) and Korean (Wiktionary + kengdic),
# example sentences (Tatoeba), Simplified/Traditional tables (OpenCC), character readings (Unihan),
# stroke order (Make Me a Hanzi, KanjiVG) and English indexes for drafting.
import sys, os, re, json, collections, glob, unicodedata

SRC, DL, WORK, OUT = sys.argv[1:5]
for d in ('zh', 'ja', 'ko', 'ex', 'strokes', 'misc'): os.makedirs(os.path.join(OUT, d), exist_ok=True)
def dump(rel, obj):
    p = os.path.join(OUT, rel)
    with open(p, 'w', encoding='utf-8') as f: json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))
    print('  %-28s %8.1f kB' % (rel, os.path.getsize(p) / 1024))
def is_han(ch): o = ord(ch); return 0x4E00 <= o <= 0x9FFF or 0x3400 <= o <= 0x4DBF or 0xF900 <= o <= 0xFAFF or 0x20000 <= o <= 0x2FFFF
def tsv(path):
    for l in open(path, encoding='utf-8'):
        if l.startswith('#') or not l.strip(): continue
        yield l.rstrip('\n').split('\t')

# ---------------------------------------------------------------- OpenCC
def opencc(name):
    m = {}
    for k, v in tsv(os.path.join(DL, 'opencc_%s.txt' % name)): m[k] = v.split(' ')[0]
    return m
STc, STp, TSc, TSp = opencc('STCharacters'), opencc('STPhrases'), opencc('TSCharacters'), opencc('TSPhrases')
TW = opencc('TWVariants')
dump('zh/st.json', {'c': {k: v for k, v in STc.items() if k != v}, 'p': STp, 'tw': TW})
dump('zh/ts.json', {'c': {k: v for k, v in TSc.items() if k != v}, 'p': TSp})
def t2s(s): return ''.join(TSc.get(ch, ch) for ch in s)

# ---------------------------------------------------------------- Unihan
uni = collections.defaultdict(dict)
for f in ('Unihan_Readings.txt',):
    for row in tsv(os.path.join(SRC, 'unihan', f)):
        if len(row) < 3: continue
        cp, key, val = row
        if key in ('kMandarin', 'kHangul', 'kJapaneseOn', 'kJapaneseKun', 'kDefinition', 'kKorean'):
            uni[chr(int(cp[2:], 16))][key] = val
for row in tsv(os.path.join(SRC, 'unihan', 'Unihan_IRGSources.txt')):
    if len(row) >= 3 and row[1] == 'kTotalStrokes': uni[chr(int(row[0][2:], 16))]['s'] = row[2].split(' ')[0]

# ---------------------------------------------------------------- Mandarin: CC-CEDICT
TONEV = {'a': 'āáǎàa', 'e': 'ēéěèe', 'i': 'īíǐìi', 'o': 'ōóǒòo', 'u': 'ūúǔùu', 'ü': 'ǖǘǚǜü'}
def mark(syl):
    m = re.match(r'^([a-zA-Zü:]+)([1-5])$', syl)
    if not m: return syl.replace('u:', 'ü')
    s, t = m.group(1).replace('u:', 'ü').replace('v', 'ü'), int(m.group(2))
    low = s.lower()
    if 'a' in low: i = low.index('a')
    elif 'e' in low: i = low.index('e')
    elif 'ou' in low: i = low.index('o')
    else:
        i = max((j for j, c in enumerate(low) if c in 'aeiouü'), default=-1)
        if i < 0: return s
    c = s[i]; base = c.lower(); r = TONEV[base][t - 1]
    if c.isupper(): r = r.upper()
    return s[:i] + r + s[i + 1:]
zh = []; seen = {}
for l in open(os.path.join(SRC, 'cedict_1_0_ts_utf-8_mdbg.txt'), encoding='utf-8'):
    if l.startswith('#'): continue
    m = re.match(r'^(\S+) (\S+) \[([^\]]*)\] /(.*)/\s*$', l)
    if not m: continue
    trad, simp, py, gl = m.groups()
    gl = [g for g in gl.split('/') if g]
    cl = ''
    keep = []
    for g in gl:
        mm = re.match(r'^CL:(.*)$', g)
        if mm: cl = mm.group(1); continue
        keep.append(g)
    if not keep: continue
    key = (simp, py)
    if key in seen and seen[key][0] == trad:
        zh[seen[key][1]][3] += '/' + '/'.join(keep); continue
    seen[key] = (trad, len(zh))
    zh.append([simp, trad, py, '/'.join(keep), 0, cl])
print('Mandarin entries', len(zh))
# frequency: forward maximum matching over Tatoeba Mandarin sentences
zwords = collections.defaultdict(list)
for i, e in enumerate(zh): zwords[e[0]].append(i)
maxlen = 8
def segment_zh(s):
    out = []; i = 0
    while i < len(s):
        for L in range(min(maxlen, len(s) - i), 0, -1):
            w = s[i:i + L]
            if w in zwords or L == 1: out.append(w); i += L; break
    return out
zfreq = collections.Counter(); cmn_sent = {}
for row in tsv(os.path.join(SRC, 'cmn_sentences.tsv')):
    if len(row) < 3: continue
    s = t2s(row[2]); cmn_sent[row[0]] = row[2]
    for w in segment_zh(s): zfreq[w] += 1
for i, e in enumerate(zh):
    f = zfreq.get(e[0], 0)
    # prefer the main reading of a word: proper names (capitalised pinyin) and variants get less
    if re.match(r'^[A-Z]', e[2]): f = 0 if any(not re.match(r'^[A-Z]', zh[j][2]) for j in zwords[e[0]]) else f // 4
    if re.match(r'^(variant of|old variant of|surname|see )', e[3]): f = f // 8
    e[4] = f
# give a word's frequency to its most likely reading only
best = {}
for i, e in enumerate(zh):
    b = best.get(e[0])
    if b is None or (e[4], -len(e[3].split('/'))) > (zh[b][4], -len(zh[b][3].split('/'))): best[e[0]] = i
for i, e in enumerate(zh):
    if len(zwords[e[0]]) > 1 and len(e[0]) == 1:
        um = uni.get(e[0], {}).get('kMandarin', '').split(' ')[0]
        if um and mark(e[2].split(' ')[0].lower()) == um: best[e[0]] = i
for i, e in enumerate(zh):
    if best[e[0]] != i: e[4] = e[4] // 3
    elif len(zwords[e[0]]) > 1: e[4] = max(e[4], max(zh[j][4] for j in zwords[e[0]]) + 1)
def dump_parts(prefix, rows, n):  # files under 10 MB each (GitHub web upload)
    k = (len(rows) + n - 1) // n
    for i in range(n): dump('%s%d.json' % (prefix, i + 1), rows[i * k:(i + 1) * k])
dump_parts('zh/dict', zh, 2)
# character readings for words CEDICT does not have
zchar = {}
for ch, d in uni.items():
    if 'kMandarin' in d: zchar[ch] = d['kMandarin'].split(' ')[0]
dump('zh/chars.json', zchar)

# ---------------------------------------------------------------- Japanese: JMdict
J = json.load(open(os.path.join(WORK, 'jmdict.json'), encoding='utf-8'))
ja = []
for e in J:
    gl = []; pos0 = None
    for pos, g, misc in e['s'][:4]:
        if not g: continue
        if pos0 is None: pos0 = pos
        gl.append('; '.join(g[:4]))
    if not gl: continue
    uk = 1 if e['s'] and 'uk' in (e['s'][0][2] or []) else 0
    ja.append([e['k'][:3], e['r'][:3], '/'.join(gl), ' '.join(pos0 or []), e['p'], uk, e['seq']])
# frequency from Tatoeba Japanese sentences (substring counts for common words only)
jfreq = collections.Counter()
jtexts = [row[2] for row in tsv(os.path.join(SRC, 'jpn_sentences.tsv')) if len(row) >= 3]
big = '\n'.join(jtexts)
cand = set()
for e in ja:
    for f in (e[0][:1] if e[0] else e[1][:1]):
        if len(f) >= 2 or (e[0] and len(f) >= 1): cand.add(f)
for t in jtexts:
    for i in range(len(t)):
        for L in range(1, 7):
            w = t[i:i + L]
            if len(w) == L and w in cand: jfreq[w] += 1
for e in ja:
    f = (e[0][:1] or e[1][:1])
    e.append(min(jfreq.get(f[0], 0) if f else 0, 99999))
print('Japanese entries', len(ja))
half = len(ja) // 2
dump_parts('ja/dict', ja, 3)
jchar = {}
for ch, d in uni.items():
    if 'kJapaneseOn' in d or 'kJapaneseKun' in d: jchar[ch] = [d.get('kJapaneseOn', ''), d.get('kJapaneseKun', ''), d.get('kDefinition', '')[:80], d.get('s', '')]
dump('ja/chars.json', jchar)

# ---------------------------------------------------------------- Korean: Wiktionary (kaikki) + kengdic
POSK = {'noun': 'n', 'verb': 'v', 'adj': 'a', 'adv': 'adv', 'name': 'name', 'pron': 'pron', 'num': 'num', 'det': 'det', 'particle': 'prt', 'intj': 'intj', 'suffix': 'suf', 'phrase': 'phr', 'counter': 'ctr', 'prefix': 'pre', 'root': 'root'}
ko = []; kseen = {}
for l in open(os.path.join(SRC, 'kaikki-Korean-compact.jsonl'), encoding='utf-8'):
    d = json.loads(l)
    w, pos = d['w'], d['p']
    if pos in ('character', 'syllable', 'romanization', 'symbol') or not w: continue
    if not re.search('[가-힣]', w): continue
    hanja = ''; inf = ''
    for f, tags in d['f']:
        if 'hanja' in tags and not hanja and all(is_han(c) or c in ' ·' for c in f): hanja = f
        if 'infinitive' in tags and not inf: inf = f
    gl = []
    for g, tags in d['s']:
        if any(t in tags for t in ('obsolete', 'archaic', 'historical', 'dialectal', 'North-Korea')) and gl: continue
        g = re.sub(r'\s+', ' ', g).strip()
        if g and g not in gl: gl.append(g)
    if not gl: continue
    key = (w, POSK.get(pos, pos))
    if key in kseen:
        e = ko[kseen[key]]
        if not e[2] and hanja: e[2] = hanja
        e[3] = e[3] + '/' + '/'.join(gl[:3]); continue
    kseen[key] = len(ko)
    ko.append([w, POSK.get(pos, pos), hanja, '/'.join(gl[:4]), inf, 0, 'w'])
nw = len(ko)
kwords = set(e[0] for e in ko)
for row in tsv(os.path.join(DL, 'kengdic.tsv')):
    if len(row) < 5 or row[0] == 'id': continue
    w, hanja, gl, lvl = row[1].strip(), row[2].strip(), row[3].strip(), row[4].strip()
    if not w or not gl or w in kwords or ' ' in w or len(w) > 8: continue
    if not re.fullmatch('[가-힣]+', w): continue
    kwords.add(w)
    ko.append([w, 'v' if w.endswith('다') and re.match(r'^to ', gl) else 'n', hanja if all(is_han(c) for c in hanja) else '', gl[:200], '', {'A': 3, 'B': 2, 'C': 1}.get(lvl, 0), 'k'])
print('Korean entries', nw, 'from Wiktionary +', len(ko) - nw, 'from kengdic')
ktexts = [row[2] for row in tsv(os.path.join(SRC, 'kor_sentences.tsv')) if len(row) >= 3]
kbig = '\n'.join(ktexts)
kc = collections.Counter(); kst = set()
for e in ko: kst.add(e[0][:-1] if e[1] in ('v', 'a') and e[0].endswith('다') else e[0])
for t in ktexts:
    for i in range(len(t)):
        for L in range(1, 7):
            w = t[i:i + L]
            if len(w) == L and w in kst: kc[w] += 1
for e in ko:
    stem = e[0][:-1] if e[1] in ('v', 'a') and e[0].endswith('다') else e[0]
    e[5] = e[5] * 5 + min(kc.get(stem, 0), 99999)
dump('ko/dict.json', ko)
kchar = {}
for ch, d in uni.items():
    if 'kHangul' in d: kchar[ch] = d['kHangul'].split(' ')[0].split(':')[0]
dump('ko/hanja.json', kchar)

# ---------------------------------------------------------------- English indexes (English word or phrase -> entries)
STOP = set('a an the of to in on at for with by from as or and be is are was one sb sth something someone oneself etc'.split())
def keys_of(gloss):
    out = []
    for g in re.split(r'[/;,]', re.sub(r'\([^()]*\)', '', re.sub(r'\([^()]*\)', '', gloss))):
        g = re.sub(r'\([^)]*\)|\[[^\]]*\]|\{[^}]*\}|[()]', '', g).strip().lower()
        g = re.sub(r'\s+', ' ', g)
        if not g or len(g) > 40: continue
        out.append(g)
        if g.startswith('to '): out.append(g[3:])
        if g.startswith('to be '): out.append(g[6:])
    return out
def index(entries, gfun, ffun, posfun=None):
    idx = collections.defaultdict(list)
    for i, e in enumerate(entries):
        for rank, k in enumerate(keys_of(gfun(e))[:8]):
            idx[k].append((-(ffun(e)) * (1.0 if rank < 2 else 0.6 if rank < 4 else 0.3) * (posfun(e) if posfun else 1), i))
    out = {}
    for k, v in idx.items():
        if len(k.split()) > 4: continue
        r = []; seen = set()
        for _, i in sorted(v):
            kk = entries[i][0] if isinstance(entries[i][0], str) else tuple(entries[i][0] or entries[i][1])
            if kk in seen: continue
            seen.add(kk); r.append(i)
            if len(r) >= 6: break
        out[k] = r
    return out
dump('zh/en.json', index(zh, lambda e: e[3], lambda e: e[4] + 1))
dump('ja/en.json', index(ja, lambda e: e[2], lambda e: e[4] * 3 + e[7] + 1, lambda e: 0.2 if re.search(r'\b(pref|suf|ctr|n-suf)\b', e[3]) and not re.search(r'\b(n|adj-i|v1|v5\w*)\b', e[3].replace('n-suf', '')) else 1))
dump('ko/en.json', index(ko, lambda e: e[3], lambda e: e[5] + (40 if e[6] == 'w' else 0) + 1))

# ---------------------------------------------------------------- Tatoeba example sentences
eng = {}
need = set()
links = {}
for lang in ('cmn', 'jpn', 'kor'):
    L = collections.defaultdict(list)
    for row in tsv(os.path.join(SRC, '%s-eng_links.tsv' % lang)):
        if len(row) >= 2: L[row[0]].append(row[1]); need.add(row[1])
    links[lang] = L
for row in tsv(os.path.join(SRC, 'eng_sentences.tsv')):
    if len(row) >= 3 and row[0] in need: eng[row[0]] = row[2]
for lang, out, cap in (('cmn', 'ex/zh.json', 60000), ('jpn', 'ex/ja.json', 60000), ('kor', 'ex/ko.json', 20000)):
    rows = []
    for row in tsv(os.path.join(SRC, '%s_sentences.tsv' % lang)):
        if len(row) < 3 or row[0] not in links[lang]: continue
        en = [eng[x] for x in links[lang][row[0]] if x in eng]
        if not en or len(row[2]) > 60: continue
        rows.append([row[2], min(en, key=len), int(row[0])])
    rows.sort(key=lambda r: (len(r[0]) > 30, r[2]))
    dump(out, rows[:cap])

# ---------------------------------------------------------------- stroke order
# Mandarin and hanja: Make Me a Hanzi (outlines + medians, 1024 box, y up from 900)
CH = 48
def bucket(ch): return ord(ch) % CH
zs = [dict() for _ in range(CH)]
for l in open(os.path.join(DL, 'mmah_graphics.txt'), encoding='utf-8'):
    d = json.loads(l)
    zs[bucket(d['character'])][d['character']] = [d['strokes'], [[[round(x), round(y)] for x, y in m] for m in d['medians']]]
for i in range(CH): dump('strokes/zh_%02d.json' % i, zs[i])
# Japanese: KanjiVG stroke centre lines (109 box)
js = [dict() for _ in range(CH)]
nk = 0
for p in sorted(glob.glob(os.path.join(WORK, 'kvg', '*.svg'))):
    s = open(p, encoding='utf-8').read()
    ch = chr(int(os.path.basename(p)[:-4], 16))
    ds = re.findall(r'<path id="kvg:[0-9a-f]+-s\d+"[^>]*\sd="([^"]+)"', s)
    if ds: js[bucket(ch)][ch] = ds; nk += 1
for i in range(CH): dump('strokes/ja_%02d.json' % i, js[i])
print('stroke data: Make Me a Hanzi', sum(len(x) for x in zs), 'KanjiVG', nk)

# ---------------------------------------------------------------- character sets for the fonts
sets = {'sc': set(), 'tc': set(), 'jp': set(), 'kr': set()}
for e in zh:
    sets['sc'].update(e[0]); sets['tc'].update(e[1])
for t in cmn_sent.values(): sets['sc'].update(t2s(t)); sets['tc'].update(t)
for k, v in STc.items(): sets['sc'].update(k); sets['tc'].update(TW.get(v, v))
for k, v in TSc.items(): sets['tc'].update(k); sets['sc'].update(v)
for ch in (l[14:15] for l in open(os.path.join(DL, 'mmah_graphics.txt'), encoding='utf-8')): sets['sc'].add(ch); sets['tc'].add(ch)
for e in ja:
    for f in e[0] + e[1]: sets['jp'].update(f)
for t in jtexts: sets['jp'].update(t)
for e in ko: sets['kr'].update(e[0]); sets['kr'].update(e[2])
for t in ktexts: sets['kr'].update(t)
sets['kr'].update(chr(c) for c in range(0xAC00, 0xD7A4))
for k in sets: sets[k] = ''.join(sorted(c for c in sets[k] if ord(c) > 0x2000))
json.dump(sets, open(os.path.join(WORK, 'charsets.json'), 'w', encoding='utf-8'), ensure_ascii=False)
print('charsets', {k: len(v) for k, v in sets.items()})
