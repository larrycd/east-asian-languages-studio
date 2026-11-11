# Parse JMdict_e into compact entries (by Larry Dalton's East Asian studio build)
import sys, gzip, re, json, xml.etree.ElementTree as ET
src, out = sys.argv[1], sys.argv[2]
raw = gzip.open(src).read().decode('utf-8')
# keep entity names (e.g. &v5k;) as text
raw = re.sub(r'<!DOCTYPE.*?\]>', '', raw, flags=re.S)
raw = re.sub(r'&([\w\-]+);', r'\1', raw)
root = ET.fromstring(raw)
ents = []
for e in root.iter('entry'):
    seq = int(e.findtext('ent_seq'))
    ks = [(k.findtext('keb'), [p.text for p in k.findall('ke_pri')], [i.text for i in k.findall('ke_inf')]) for k in e.findall('k_ele')]
    rs = [(r.findtext('reb'), [p.text for p in r.findall('re_pri')], [x.text for x in r.findall('re_restr')], r.find('re_nokanji') is not None, [i.text for i in r.findall('re_inf')]) for r in e.findall('r_ele')]
    senses = []; lastpos = []
    for s in e.findall('sense'):
        pos = [p.text for p in s.findall('pos')] or lastpos; lastpos = pos
        gl = [g.text for g in s.findall('gloss') if g.text]
        misc = [m.text for m in s.findall('misc')]
        senses.append([pos, gl, misc])
    pri = set(p for k in ks for p in k[1]) | set(p for r in rs for p in r[1])
    score = 0
    for p in pri:
        if p in ('news1', 'ichi1', 'spec1', 'gai1'): score += 30
        elif p in ('news2', 'ichi2', 'spec2', 'gai2'): score += 10
        m = re.match(r'nf(\d+)', p or '')
        if m: score += 50 - int(m.group(1))
    ents.append({'seq': seq, 'k': [k[0] for k in ks if 'sK' not in k[2] and 'iK' not in k[2]] or [k[0] for k in ks], 'r': [r[0] for r in rs if 'sk' not in r[4]], 'rr': {r[0]: r[2] for r in rs if r[2]}, 'nok': [r[0] for r in rs if r[3]], 's': senses, 'p': score})
json.dump(ents, open(out, 'w', encoding='utf-8'), ensure_ascii=False)
print(len(ents), 'entries', sum(1 for x in ents if x['p']), 'with priority')
