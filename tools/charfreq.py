# East Asian Languages Studio - character frequencies for the image reader's tie-breaking (by Larry Dalton)
# Usage: python3 -I charfreq.py <src dir> <dl dir> <app data dir> <work dir>   -> <work dir>/charfreq.json
import sys, json, collections, os
SRC, DL, DATA, WORK = sys.argv[1:5]
def tsv(p):
    for l in open(p, encoding='utf-8'):
        r = l.rstrip('\n').split('\t')
        if len(r) >= 3: yield r[2]
def opencc(name):
    m = {}
    for l in open(os.path.join(DL, 'opencc_%s.txt' % name), encoding='utf-8'):
        if l.startswith('#') or not l.strip(): continue
        k, v = l.rstrip('\n').split('\t'); m[k] = v.split(' ')[0]
    return m
t2s, s2t = opencc('TSCharacters'), opencc('STCharacters')
F = {k: collections.Counter() for k in ('sc', 'tc', 'jp', 'kr')}
for t in tsv(os.path.join(SRC, 'cmn_sentences.tsv')):
    for c in t: F['sc'][t2s.get(c, c)] += 1; F['tc'][s2t.get(t2s.get(c, c), c)] += 1; F['tc'][c] += 1
for t in tsv(os.path.join(SRC, 'jpn_sentences.tsv')):
    for c in t: F['jp'][c] += 1
for t in tsv(os.path.join(SRC, 'kor_sentences.tsv')):
    for c in t: F['kr'][c] += 1
for e in json.load(open(os.path.join(DATA, 'ko', 'dict.json'), encoding='utf-8')):
    for c in e[0]: F['kr'][c] += 1
for e in sum((json.load(open(os.path.join(DATA, 'zh', 'dict%d.json' % i), encoding='utf-8')) for i in (1, 2)), []):
    for c in e[0]: F['sc'][c] += 1
    for c in e[1]: F['tc'][c] += 1
json.dump({k: dict(v) for k, v in F.items()}, open(os.path.join(WORK, 'charfreq.json'), 'w', encoding='utf-8'), ensure_ascii=False)
print({k: len(v) for k, v in F.items()})
