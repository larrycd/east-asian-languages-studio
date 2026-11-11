// East Asian Languages Studio - character templates for the image reader (by Larry Dalton)
// Usage: node build_templates.js   (run from the build folder; writes app/data/tpl/<font>.json and .bin)
const fs=require('fs'),path=require('path');
(async()=>{
 const EA=require('../app/engine.js');const hb=await require(process.env.HBJS||'harfbuzzjs');EA.setShaper(hb);
 const A=path.join(__dirname,'..','src','app');const GL=JSON.parse(fs.readFileSync(path.join(A,'data/glyphs.json')));EA.loadGlyphs(GL);
 const F={sc:['EASC.ttf','zh-Hans'],tc:['EATC.ttf','zh-Hant'],jp:['EAJP.ttf','ja'],kr:['EAKR.ttf','ko']};
 for(const k in F)EA.loadFont(k,new Uint8Array(fs.readFileSync(path.join(A,'fonts',F[k][0]))));
 const FREQ=JSON.parse(fs.readFileSync(path.join(__dirname,'..','work','charfreq.json')));const PUNCT=/[、。，．：；！？「」『』（）《》〈〉【】〔〕ー～…‥・“”‘’—–]/;
 for(const k in F){
  const t0=Date.now(),chars=[],gids=[],geo=[],vert=[],feats=[];const seen=new Set();
  const texts=[...new Set(Object.values(GL[k].glyphs).map(g=>g[0]).filter(t=>t&&[...t].length===1&&!/\s/.test(t)&&t.codePointAt(0)>=0x21))];
  for(const ch of texts){
   for(const v of [false,true]){
    if(v&&!PUNCT.test(ch))continue;
    const gs=EA.shape(k,ch,F[k][1],v);if(gs.length!==1)continue;const g=gs[0].g;
    if(v&&seen.has(g))continue;if(seen.has(g)&&!v)continue;seen.add(g);
    const ge=EA.glyphGeo(k,g);if(!ge)continue;const gr=EA.glyphGrid(k,g,16);
    chars.push(ch);gids.push(g);geo.push(...ge.map(x=>Math.round(x*1000)/1000));vert.push(v?1:0);feats.push(gr);
   }
  }
  const bin=Buffer.alloc(feats.length*256);feats.forEach((f,i)=>bin.set(f,i*256));
  fs.writeFileSync(path.join(A,'data/tpl',k+'.bin'),bin);
  const freq=chars.map(c=>Math.round(Math.log10(1+(FREQ[k][c]||0))*10)/10);fs.writeFileSync(path.join(A,'data/tpl',k+'.json'),JSON.stringify({chars,gids,geo,vert,freq}));
  console.log(k,chars.length,'templates',vert.filter(Boolean).length,'vertical forms',(Date.now()-t0)+'ms',(bin.length/1048576).toFixed(1)+'MB');
 }
})();
