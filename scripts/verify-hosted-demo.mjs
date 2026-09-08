import {spawn} from 'node:child_process';
import {once} from 'node:events';
import fs from 'node:fs/promises';
const fixture=JSON.parse(await fs.readFile('.secrets/demo-credentials.json','utf8')).credentials.find(x=>x.role==='FOCAL_PERSON');
for(const [mode,enabled,expected] of [['evaluation','true',200],['evaluation','false',403],['production','true',403]]){
 const child=spawn(process.execPath,['src/server.mjs'],{env:{...process.env,APP_MODE:mode,ALLOW_PUBLIC_DEMO_LOGIN:enabled,PORT:'3197',NODE_ENV:'production'},stdio:'ignore'});
 const exited=once(child,'exit');
 try{
  for(let i=0;i<50;i++){try{await fetch('http://localhost:3197/api/demo-accounts');break;}catch{await new Promise(r=>setTimeout(r,100));}}
  const headers={'content-type':'application/json','x-forwarded-for':'203.0.113.1'};
  const result=await fetch('http://localhost:3197/api/demo-password',{method:'POST',headers,body:JSON.stringify({email:fixture.email})});
  if(result.status!==expected)throw Error('Unexpected hosted-demo gate');
  if(expected===200){const body=await result.json();if(body.data.password!==fixture.password)throw Error('Demo credential mismatch');
   const bad=await fetch('http://localhost:3197/api/demo-password',{method:'POST',headers,body:JSON.stringify({email:'not-a-demo@example.invalid'})});if(bad.status!==404)throw Error('Unlisted user accepted');
   const cross=await fetch('http://localhost:3197/api/demo-password',{method:'POST',headers:{...headers,origin:'https://unrelated.invalid'},body:JSON.stringify({email:fixture.email})});if(cross.status!==403)throw Error('Cross-origin request accepted');
  }
 }finally{child.kill('SIGTERM');await exited;}
}
console.log('PASS: hosted evaluation opt-in, default remote denial, production denial even with opt-in, unlisted-account denial and cross-origin denial.');
