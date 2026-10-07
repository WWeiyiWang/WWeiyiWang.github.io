import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

// This is a static HTML generator, not Vite/React. All routes use base '/'.
execFileSync(process.execPath, ['build.mjs'], {stdio:'inherit'});
const output=path.resolve('.pages-dist');
if(path.dirname(output)!==process.cwd())throw new Error('Output must be inside the project');
fs.rmSync(output,{recursive:true,force:true});
fs.mkdirSync(output);
const excluded=new Set(['client','server','.openai']);
for(const entry of fs.readdirSync('dist')){
  if(excluded.has(entry))continue;
  fs.cpSync(path.join('dist',entry),path.join(output,entry),{recursive:true});
}
fs.writeFileSync(path.join(output,'.nojekyll'),'');
console.log('GitHub user-site build ready in .pages-dist; base path: /');
