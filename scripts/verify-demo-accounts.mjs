import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
const privateAccounts=JSON.parse(await fs.readFile('.secrets/demo-credentials.json','utf8')).credentials;
const base='http://localhost:3107';
const response=await fetch(base+'/api/demo-accounts');const {data}=await response.json();
if(data.accounts.length!==3)throw Error('Expected one demo per role');
for(const account of data.accounts){
 if(Object.keys(account).sort().join(',')!=='email,role')throw Error('Unexpected public account fields');
 const privateEntry=privateAccounts.find(x=>x.email===account.email);
 const result=await fetch(base+'/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:account.email,password:privateEntry.password})});
 const body=await result.json();if(!result.ok||body.data.user.role!==account.role)throw Error('Demo login failed');
 await fetch(base+'/api/auth/logout',{method:'POST',headers:{'content-type':'application/json',cookie:result.headers.get('set-cookie').split(';')[0]},body:'{}'});
}
const forwarded=await fetch(base+'/api/demo-password',{method:'POST',headers:{'content-type':'application/json','x-forwarded-for':'203.0.113.1'},body:JSON.stringify({email:data.accounts[0].email})});if(forwarded.status!==403)throw Error('Forwarded password access not blocked');
const production=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'3198',APP_MODE:'production',NODE_ENV:'production'},stdio:'ignore'});
try{
 let hidden;
 for(let n=0;n<40;n++){try{hidden=await(await fetch('http://localhost:3198/api/demo-accounts')).json();break;}catch{await new Promise(r=>setTimeout(r,150));}}
 if(hidden?.data?.accounts?.length!==0)throw Error('Demo list exposed in production mode');
 const denied=await fetch('http://localhost:3198/api/demo-password',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:data.accounts[0].email})});if(denied.status!==403)throw Error('Production password access not blocked');
}finally{production.kill('SIGTERM');}
const browser=await chromium.launch();
try{const page=await browser.newPage({viewport:{width:1440,height:1050}});await page.goto(base);await page.getByRole('heading',{name:'Demo accounts'}).waitFor();
 for(const account of data.accounts){await page.locator('[data-demo-email="'+account.email+'"]').click();await page.waitForFunction(()=>document.querySelector('#password').value.length>0);if(await page.locator('#email').inputValue()!==account.email||await page.locator('#password').inputValue()!==privateAccounts.find(x=>x.email===account.email).password)throw Error('Account selector failed');}
 await page.screenshot({path:'docs/evidence/demo-accounts-desktop.png',fullPage:true});await page.setViewportSize({width:360,height:800});await page.screenshot({path:'docs/evidence/demo-accounts-mobile.png',fullPage:true});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile overflow');
}finally{await browser.close();}
const evidence={date:new Date().toISOString(),roles:data.accounts.map(x=>x.role),accountsVerified:privateAccounts.length,realSignIn:'PASS (3 roles)',publicFields:'email and role only',productionListing:'disabled',selector:'PASS',mobileOverflow:false};
await fs.writeFile('docs/evidence/demo-accounts-check.json',JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence));
