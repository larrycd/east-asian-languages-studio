const {chromium}=require('playwright');const {spawn}=require('child_process');const path=require('path');
(async()=>{const srv=spawn('python3',['-m','http.server','8864'],{cwd:path.join(__dirname,'..'),stdio:'ignore'});await new Promise(r=>setTimeout(r,800));
 const b=await chromium.launch();const p=await b.newPage();await p.goto('http://localhost:8864/test/img.html');await p.evaluate(()=>init());
 const c=JSON.parse(process.argv[2]);const r=await p.evaluate(c=>run(...c).then(r=>({r,items:EA._lastItems})),c);console.log(JSON.stringify(r,null,1));await b.close();srv.kill();})();
