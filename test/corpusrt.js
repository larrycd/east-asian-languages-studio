// node corpusrt.js N seed : SVG round trip of random example sentences in every language, layout and reading aid
require('./hb.js')({ex:true}).then(EA=>{let seed=+process.argv[3]||7;const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;};const N=+process.argv[2]||200;
const tot={};const t0=Date.now();
for(let i=0;i<N;i++){const lang=['zh-Hans','zh-Hant','ja','ko'][i%4];const pool=EA.data.ex[lang.slice(0,2)];let s=pool[Math.floor(rnd()*pool.length)][0].replace(/[\u200B-\u200D\uFEFF]/g,'');
 if(lang==='zh-Hans')s=EA.toSimplified(s);if(lang==='zh-Hant')s=EA.toTraditional(EA.toSimplified(s));
 const vert=rnd()<0.3,ruby=rnd()<0.5?({'zh-Hans':'pinyin','zh-Hant':'zhuyin',ja:rnd()<0.5?'furigana':'romaji',ko:'romaja'}[lang]):'none';
 const r=EA.readSVG(EA.render(s,{lang,vertical:vert,ruby,size:40,width:900,height:700}));const norm=x=>x.replace(/\s+/g,lang==='ko'?' ':'').trim();
 const exp=vert?EA.verticalMarks(s).replace(/[，．！？：；]/g,c=>lang==='ko'?({'，':',','．':'.','！':'!','？':'?','：':':','；':';'})[c]:c):s;const ok=r.ok&&norm(r.text)===norm(exp)&&(r.lang===lang||(/^zh/.test(lang)&&/^zh/.test(r.lang)&&EA.toSimplified(s)===EA.toTraditional(s)&&false)||(/^zh/.test(lang)&&/^zh/.test(r.lang)&&r.ambiguous));const k=lang;tot[k]=tot[k]||[0,0,0,0];tot[k][0]++;if(ok)tot[k][1]++;tot[k][2]+=[...s].length;if(ok)tot[k][3]+=[...s].length;
 if(!ok)console.log('FAIL',lang,vert,ruby,JSON.stringify(s),'->',JSON.stringify(r.text||r.reason));}
console.log(JSON.stringify(tot),(Date.now()-t0)+'ms');});
