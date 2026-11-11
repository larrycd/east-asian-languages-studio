# East Asian Languages Studio - fonts (by Larry Dalton)
# Usage: python3 -I build_fonts.py <dl dir> <work dir> <app dir>
# Fixes the Noto Sans SC/TC/JP/KR variable fonts at Regular weight and subsets each to the characters the studio uses.
import sys, os, json
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset
DL, WORK, APP = sys.argv[1:4]
sets = json.load(open(os.path.join(WORK, 'charsets.json'), encoding='utf-8'))
common = set(range(0x20, 0x7F)) | set(range(0xA0, 0x250)) | set(range(0x2000, 0x2070)) | set(range(0x3000, 0x3040)) | set(range(0xFF00, 0xFFF0)) | set(range(0x2E80, 0x2FE0))
extra = {'sc': set(range(0x3100, 0x3130)) | set(range(0x31A0, 0x31C0)) | set(range(0x02C7, 0x02DA)), 'tc': set(range(0x3100, 0x3130)) | set(range(0x31A0, 0x31C0)) | set(range(0x02C7, 0x02DA)),
         'jp': set(range(0x02C7, 0x02DA)) | set(range(0x3040, 0x3100)) | set(range(0x31F0, 0x3200)) | set(range(0x4E00, 0x4E00)), 'kr': set(range(0x02C7, 0x02DA)) | set(range(0x1100, 0x1200)) | set(range(0x3130, 0x3190)) | set(range(0xAC00, 0xD7A4))}
for key, fn, out in (('sc', 'NotoSansSC.ttf', 'EASC.ttf'), ('tc', 'NotoSansTC.ttf', 'EATC.ttf'), ('jp', 'NotoSansJP.ttf', 'EAJP.ttf'), ('kr', 'NotoSansKR.ttf', 'EAKR.ttf')):
    f = TTFont(os.path.join(DL, fn))
    f = instancer.instantiateVariableFont(f, {'wght': 400})
    cps = common | extra[key] | set(ord(c) for c in sets[key])
    if key == 'tc': cps |= set(ord(c) for c in sets['sc'])  # Traditional view may still show simplified-only characters
    if key == 'kr': cps |= set(ord(c) for c in sets['sc'] if 0x4E00 <= ord(c) <= 0x9FFF and ord(c) in f.getBestCmap())
    opts = subset.Options(); opts.layout_features = ['*']; opts.name_IDs = ['*']; opts.notdef_outline = True; opts.glyph_names = False; opts.hinting = False
    s = subset.Subsetter(opts); s.populate(unicodes=cps); s.subset(f)
    p = os.path.join(APP, 'fonts', out); f.save(p)
    cm = f.getBestCmap()
    print(out, len(cm), 'characters', round(os.path.getsize(p) / 1048576, 2), 'MB')

# ---------------------------------------------------------------- glyph tables (glyph -> text, advance) for the SVG reader
def wide(t): return bool(t) and ord(t[0]) >= 0x2E80
def table(path):
    t = TTFont(path); order = t.getGlyphOrder(); gid = {g: i for i, g in enumerate(order)}
    txt = {}
    for cp, g in sorted(t.getBestCmap().items()):
        if g not in txt or (0x3000 <= cp and not (0x2E80 <= ord(txt[g]) <= 0x2FDF or 0xF900 <= ord(txt[g]) <= 0xFAFF)): txt.setdefault(g, chr(cp))
    # prefer unified ideographs over compatibility/radical code points that share an outline
    for cp, g in t.getBestCmap().items():
        if 0x4E00 <= cp <= 0x9FFF or 0x3400 <= cp <= 0x4DBF or 0xAC00 <= cp <= 0xD7A3 or 0x3040 <= cp <= 0x30FF: txt[g] = chr(cp)
    fromcmap = set(txt); alt = {}
    if 'GSUB' in t:
        lookups = t['GSUB'].table.LookupList.Lookup
        for _ in range(3):
            for lk in lookups:
                for st in lk.SubTable:
                    if lk.LookupType == 7: st = st.ExtSubTable
                    tp = getattr(st, 'LookupType', lk.LookupType)
                    if tp == 1:
                        for a, b in st.mapping.items():
                            if a in txt and (b not in txt or b not in fromcmap and wide(txt[a]) and not wide(txt[b])):
                                if b in txt and txt[b] != txt[a]: alt[b] = txt[b]
                                txt[b] = txt[a]
                            elif a in txt and b in txt and b not in fromcmap and txt[b] != txt[a] and not wide(txt[a]): alt[b] = txt[a]
                    elif tp == 3:
                        for a, alts in st.alternates.items():
                            for b in alts:
                                if a in txt and (b not in txt or b not in fromcmap and wide(txt[a]) and not wide(txt[b])):
                                    if b in txt and txt[b] != txt[a]: alt[b] = txt[b]
                                    txt[b] = txt[a]
                                elif a in txt and b in txt and b not in fromcmap and txt[b] != txt[a] and not wide(txt[a]): alt[b] = txt[a]
                    elif tp == 4:
                        for first, ligs in st.ligatures.items():
                            for lg in ligs:
                                comps = [first] + list(lg.Component)
                                if all(c in txt for c in comps) and lg.LigGlyph not in txt: txt[lg.LigGlyph] = ''.join(txt[c] for c in comps)
    hm = t['hmtx'].metrics
    return {'upm': t['head'].unitsPerEm, 'asc': t['hhea'].ascent, 'desc': t['hhea'].descent, 'glyphs': {gid[g]: ([s, hm[g][0], alt[g]] if g in alt and len(alt[g]) == 1 else [s, hm[g][0]]) for g, s in txt.items()}}
data = {k: table(os.path.join(APP, 'fonts', fn)) for k, fn in (('sc', 'EASC.ttf'), ('tc', 'EATC.ttf'), ('jp', 'EAJP.ttf'), ('kr', 'EAKR.ttf'))}
with open(os.path.join(APP, 'data', 'glyphs.json'), 'w', encoding='utf-8') as fo: json.dump(data, fo, ensure_ascii=False, separators=(',', ':'))
for k, d in data.items(): print(k, len(d['glyphs']), 'glyphs with text', d['upm'], d['asc'], d['desc'])
print('glyphs.json', round(os.path.getsize(os.path.join(APP, 'data', 'glyphs.json')) / 1048576, 2), 'MB')
