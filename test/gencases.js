// node gencases.js N seed > cases.json : random Tatoeba sentences (Mandarin Simplified/Traditional, Japanese, Korean)
const fs=require('fs'),path=require('path');const N=+process.argv[2]||40;let seed=+process.argv[3]||5;const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;};
const EA=require('../src/app/engine.js');EA.load('st',JSON.parse(fs.readFileSync(path.join(__dirname,'../src/app/data/zh/st.json'))));EA.load('ts',JSON.parse(fs.readFileSync(path.join(__dirname,'../src/app/data/zh/ts.json'))));
const ex={};for(const l of ['zh','ja','ko'])ex[l]=JSON.parse(fs.readFileSync(path.join(__dirname,'../src/app/data/ex/'+l+'.json')));
const themes=['paper','ink','slate','night'],scales=[0.6,0.8,1,1.5,2];const out=[];
for(let i=0;i<N;i++){const kind=['zh-Hans','zh-Hant','ja','ko'][i%4];const pool=ex[kind.slice(0,2)];let s=pool[Math.floor(rnd()*pool.length)][0];
 if(kind==='zh-Hans')s=EA.toSimplified(s);if(kind==='zh-Hant')s=EA.toTraditional(EA.toSimplified(s));
 const vert=kind!=='ko'&&rnd()<0.25;const ruby=rnd()<0.25?({'zh-Hans':'pinyin','zh-Hant':'zhuyin',ja:'furigana',ko:'romaja'}[kind]):'none';
 out.push([kind+' #'+i,s,kind,themes[Math.floor(rnd()*4)],scales[Math.floor(rnd()*5)],rnd()<0.5?'png':'jpeg',0.8,vert,ruby]);}
console.log(JSON.stringify(out));
