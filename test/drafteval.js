// How often do the drafts match a human translation? Short Tatoeba sentences, compared with all their human translations.
require('./load.js')({ex:true}).then(EA=>{
const norm=s=>s.replace(/[\s。．.,，、！!？?「」"']/g,'');
const out={};
for(const l of ['zh','ja','ko']){
 const byEn={};for(const e of EA.data.ex[l]){const k=e[1].toLowerCase().replace(/[^a-z' ]/g,' ').replace(/\s+/g,' ').trim();if(k.split(' ').length<=6)(byEn[k]=byEn[k]||[]).push(e[0]);}
 const keys=Object.keys(byEn).sort().filter((_,i)=>i%7===0).slice(0,600);
 const t={n:0,rating:{},exact:{},sim:{}};
 for(const k of keys){const r=EA.translate(k,l);t.n++;t.rating[r.rating]=(t.rating[r.rating]||0)+1;
  let hs=byEn[k].map(h=>l==='zh'?EA.toSimplified(h):h),best=0,ex=false;const a=norm(r.text);
  for(const h of hs){const b=norm(h);if(a===b)ex=true;const A=[...a],B=[...b];let m=0;const used=new Array(B.length).fill(false);for(const c of A){const i=B.findIndex((x,j)=>!used[j]&&x===c);if(i>=0){used[i]=true;m++;}}best=Math.max(best,2*m/(A.length+B.length||1));}
  t.exact[r.rating]=(t.exact[r.rating]||0)+(ex?1:0);t.sim[r.rating]=(t.sim[r.rating]||0)+best;}
 for(const k in t.sim)t.sim[k]=Math.round(t.sim[k]/t.rating[k]*100)+'%';out[l]=t;}
console.log(JSON.stringify(out,null,1));});
