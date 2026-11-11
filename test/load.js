const fs=require('fs'),path=require('path');const EA=require('../src/app/engine.js');const D=path.join(__dirname,'..','src','app','data');
const j=f=>JSON.parse(fs.readFileSync(path.join(D,f),'utf8'));
module.exports=async(opts={})=>{
 EA.load('zh',j('zh/dict1.json'));EA.load('zh',j('zh/dict2.json'));EA.load('st',j('zh/st.json'));EA.load('ts',j('zh/ts.json'));EA.load('zhChars',j('zh/chars.json'));
 EA.load('ja',j('ja/dict1.json'));EA.load('ja',j('ja/dict2.json'));EA.load('ja',j('ja/dict3.json'));EA.load('jaChars',j('ja/chars.json'));
 EA.load('ko',j('ko/dict.json'));EA.load('hanja',j('ko/hanja.json'));
 for(const l of ['zh','ja','ko'])EA.load('en_'+l,j(l+'/en.json'));
 EA.load('cmu',fs.readFileSync(path.join(D,'cmu.tsv'),'utf8'));
 if(opts.ex)for(const l of ['zh','ja','ko'])EA.load('ex_'+l,j('ex/'+l+'.json'));
 const kuromoji=require('kuromoji');
 const tok=await new Promise((res,rej)=>kuromoji.builder({dicPath:path.join(__dirname,'..','src','app','vendor','kuromoji','dict')+'/'}).build((e,t)=>e?rej(e):res(t)));
 EA.setTokenizer(tok);return EA;};
