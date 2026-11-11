const fs=require('fs'),path=require('path');
module.exports=async(opts)=>{const EA=await require('./load.js')(opts);const hb=await require('harfbuzzjs');EA.setShaper(hb);const A=path.join(__dirname,'..','src','app');
EA.loadGlyphs(JSON.parse(fs.readFileSync(path.join(A,'data/glyphs.json'))));for(const [k,f] of [['sc','EASC.ttf'],['tc','EATC.ttf'],['jp','EAJP.ttf'],['kr','EAKR.ttf']])EA.loadFont(k,new Uint8Array(fs.readFileSync(path.join(A,'fonts',f))));return EA;};
