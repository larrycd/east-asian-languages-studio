const {chromium}=require('playwright');const {spawn}=require('child_process');const path=require('path');const cases=JSON.parse(require('fs').readFileSync(process.argv[2],'utf8'));
(async()=>{const srv=spawn('python3',['-m','http.server','8862'],{cwd:path.join(__dirname,'..'),stdio:'ignore'});await new Promise(r=>setTimeout(r,800));
 const b=await chromium.launch();const p=await b.newPage();await p.goto('http://localhost:8862/test/img.html');console.log('init ms',await p.evaluate(()=>init()));
 const tot={};for(const c of cases){const r=await p.evaluate(c=>run(...c.slice(1)),c);const k=c[2];tot[k]=tot[k]||[0,0,0,0,0];tot[k][0]++;if(r.exact)tot[k][1]++;tot[k][2]+=r.chars;tot[k][3]+=r.total;if(!r.exact&&(!r.got||r.unc>0))tot[k][4]++;
  console.log((r.exact?'OK  ':'FAIL'),c[0],c[3],c[4],c[5],c[7]?'vert':'horiz',c[8],r.w+'x'+r.h,'conf',r.conf,'unc',r.unc,r.ms+'ms');if(!r.exact)console.log('   want',r.want,'\n   got ',r.got||r.reason,r.lang);}
 for(const k in tot)console.log('TOTAL',k,'cases',tot[k][0],'exact',tot[k][1],'chars',tot[k][2]+'/'+tot[k][3],'misses-flagged',tot[k][4]+'/'+(tot[k][0]-tot[k][1]));await b.close();srv.kill();})();
