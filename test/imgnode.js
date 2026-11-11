const fs=require('fs'),path=require('path');
module.exports=async()=>{const EA=await require('./hb.js')();const A=path.join(__dirname,'..','src','app','data','tpl');
for(const k of ['sc','tc','jp','kr'])EA.loadTemplates(k,JSON.parse(fs.readFileSync(path.join(A,k+'.json'))),fs.readFileSync(path.join(A,k+'.bin')));
EA.toID=(m)=>{const d=new Uint8ClampedArray(m.W*m.H*4);for(let i=0;i<m.W*m.H;i++){const v=m.data[i]?20:250;d[i*4]=d[i*4+1]=d[i*4+2]=v;d[i*4+3]=255;}return {width:m.W,height:m.H,data:d};};return EA;};
